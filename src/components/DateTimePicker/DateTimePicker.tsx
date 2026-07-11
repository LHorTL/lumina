import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./DateTimePicker.css";
import * as React from "react";
import { createPortal } from "react-dom";
import { Button } from "../Button";
import { Calendar } from "../Calendar";
import { Input } from "../Input";
import type { TimePickerValue } from "../TimePicker";
import { useFloating } from "../../utils/useFloating";
import { useInputTriggerToggle } from "../../utils/useInputTriggerToggle";
import { usePortalContainer } from "../../utils/portal";
import { useOverlayLayer } from "../../utils/overlayStack";

export type DateTimePickerFormat = "YYYY-MM-DD HH:mm" | "YYYY-MM-DD HH:mm:ss";
export type DateTimePickerSize = "sm" | "md" | "lg";

/** 日期时间选择器中的时间字段。 */
type DateTimePart = "hour" | "minute" | "second";

/** 单个日期的可用时间摘要，供日期与时间列共享。 */
interface DayAvailability {
  closestDateTime: Date | null;
  byPart: Record<DateTimePart, Map<number, TimePickerValue>>;
  /** 是否已经检查完当天的全部候选时间。 */
  complete: boolean;
}

export interface DateTimePickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  /** Controlled selected date and time. Use `null` for an empty picker. */
  value?: Date | null;
  /** Initial selected date and time when uncontrolled. */
  defaultValue?: Date | null;
  /** Fires when the date-time changes or is cleared. */
  onChange?: (date: Date | null, dateString: string) => void;
  /** Display and input format. */
  format?: DateTimePickerFormat | ((date: Date) => string);
  /** 自定义格式化函数对应的输入解析器；返回 null 表示输入无效。 */
  parse?: (input: string) => Date | null;
  /** Show the seconds column. Overrides `format` display if true. */
  showSecond?: boolean;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  size?: DateTimePickerSize;
  /** Show a clear button when a value is selected. */
  allowClear?: boolean;
  /** Selectable hour increment. Default 1. */
  hourStep?: number;
  /** Selectable minute increment. Default 1. */
  minuteStep?: number;
  /** Selectable second increment. Default 1. */
  secondStep?: number;
  /** Min selectable date-time. */
  min?: Date;
  /** Max selectable date-time. */
  max?: Date;
  /** Predicate that disables individual days in the calendar. */
  disabledDate?: (date: Date) => boolean;
  /** Predicate that disables individual times for the active date. */
  disabledTime?: (time: TimePickerValue, date: Date) => boolean;
  /** Where the panel appears relative to the trigger. */
  placement?: "top" | "bottom" | "left" | "right";
  /** Controlled panel open state. */
  open?: boolean;
  /** Initial panel open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when panel open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Class for the popped-out panel. */
  popupClassName?: string;
  /** Alias for `popupClassName`. */
  dropdownClassName?: string;
  className?: string;
}

const pad = (value: number): string => String(value).padStart(2, "0");

/** 单次渲染为当前日期同步探测的最大候选数，避免秒级组合阻塞主线程。 */
const MAX_DAY_AVAILABILITY_PROBES = 4096;

/** 日历网格仅在候选空间很小时才同步判断整日不可用。 */
const MAX_EAGER_CALENDAR_CANDIDATES = 256;

const clampStep = (value: number | undefined): number => {
  if (!Number.isFinite(value) || !value || value < 1) return 1;
  return Math.floor(value);
};

const isValidDate = (date: Date | null | undefined): date is Date =>
  date instanceof Date && !Number.isNaN(date.getTime());

const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const normalizeDateTime = (date: Date, includeSecond: boolean): Date => {
  const normalized = new Date(date);
  if (!includeSecond) normalized.setSeconds(0);
  normalized.setMilliseconds(0);
  return normalized;
};

const getTimeParts = (date: Date): TimePickerValue => ({
  hour: date.getHours(),
  minute: date.getMinutes(),
  second: date.getSeconds(),
});

const composeDateTime = (date: Date, time: TimePickerValue, includeSecond: boolean): Date => {
  const next = new Date(date);
  next.setHours(time.hour, time.minute, includeSecond ? time.second : 0, 0);
  return next;
};

const byDistanceFrom = (preferred: number) => (a: number, b: number): number =>
  Math.abs(a - preferred) - Math.abs(b - preferred) || a - b;

const buildOptions = (max: number, step: number, selected: number | undefined): number[] => {
  const safeStep = clampStep(step);
  const values: number[] = [];
  for (let value = 0; value <= max; value += safeStep) {
    values.push(value);
  }
  if (selected != null && !values.includes(selected)) {
    values.push(selected);
    values.sort((a, b) => a - b);
  }
  return values;
};

const formatDateTime = (
  date: Date | null | undefined,
  format: DateTimePickerProps["format"],
  includeSecond: boolean
): string => {
  if (!isValidDate(date)) return "";
  if (typeof format === "function") return format(date);
  const year = String(date.getFullYear());
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const base = `${year}-${month}-${day} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  return includeSecond ? `${base}:${pad(date.getSeconds())}` : base;
};

const parseDateTimeInput = (input: string, includeSecond: boolean): Date | null => {
  const text = input.trim();
  if (!text) return null;
  const match = text.match(
    /^(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})日?(?:\s+|T)(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/
  );
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = match[6] == null || !includeSecond ? 0 : Number(match[6]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) {
    return null;
  }

  const date = new Date(year, month - 1, day, hour, minute, second, 0);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
};

const getNow = (includeSecond: boolean): Date => normalizeDateTime(new Date(), includeSecond);

/**
 * `DateTimePicker` — input-triggered date and time picker built from
 * `Calendar` plus compact hour / minute / optional second columns.
 *
 * @example
 * <DateTimePicker value={startAt} onChange={setStartAt} minuteStep={15} />
 */
export const DateTimePicker = React.forwardRef<HTMLDivElement, DateTimePickerProps>(
  (
    {
      value,
      defaultValue = null,
      onChange,
      format = "YYYY-MM-DD HH:mm",
      parse,
      showSecond,
      placeholder = "请选择日期时间",
      disabled,
      readOnly,
      invalid,
      size = "md",
      allowClear,
      hourStep = 1,
      minuteStep = 1,
      secondStep = 1,
      min,
      max,
      disabledDate,
      disabledTime,
      placement = "bottom",
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      popupClassName = "",
      dropdownClassName = "",
      className = "",
      onKeyDown,
      id: fieldId,
      "aria-invalid": ariaInvalid,
      "aria-describedby": ariaDescribedBy,
      "aria-labelledby": ariaLabelledBy,
      "aria-required": ariaRequired,
      "aria-label": ariaLabel,
      ...rest
    },
    ref
  ) => {
    const includeSecond = showSecond ?? format === "YYYY-MM-DD HH:mm:ss";
    const controlled = value !== undefined;
    const initial = isValidDate(defaultValue)
      ? normalizeDateTime(defaultValue, includeSecond)
      : null;
    const [inner, setInner] = React.useState<Date | null>(initial);
    const current = controlled
      ? isValidDate(value)
        ? normalizeDateTime(value, includeSecond)
        : null
      : inner;
    const currentTime = current?.getTime() ?? null;
    const formattedCurrent = React.useMemo(
      () =>
        currentTime == null
          ? ""
          : formatDateTime(new Date(currentTime), format, includeSecond),
      [currentTime, format, includeSecond]
    );
    const scrollSignature = currentTime == null ? "" : String(currentTime);
    const [draft, setDraft] = React.useState(formattedCurrent);

    React.useEffect(() => {
      setDraft(formattedCurrent);
    }, [formattedCurrent]);

    const openControlled = openProp !== undefined;
    const [innerOpen, setInnerOpen] = React.useState(defaultOpen);
    const open = openControlled ? !!openProp : innerOpen;
    const [compactPanel, setCompactPanel] = React.useState(false);
    const [calendarViewDate, setCalendarViewDate] = React.useState<Date | null>(null);
    const [calendarVisibleDate, setCalendarVisibleDate] = React.useState<Date | null>(null);
    const wasOpenRef = React.useRef(false);
    const scrollSignatureRef = React.useRef<string | null>(null);
    const scrollFramesRef = React.useRef(new Map<HTMLElement, number>());
    const setOpen = React.useCallback(
      (next: boolean) => {
        if (disabled || readOnly) return;
        if (!openControlled) setInnerOpen(next);
        onOpenChange?.(next);
      },
      [disabled, onOpenChange, openControlled, readOnly]
    );
    const inputTriggerHandlers = useInputTriggerToggle({
      open,
      disabled,
      readOnly,
      setOpen,
    });

    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const panelId = React.useId();
    const portalContainer = usePortalContainer();
    const { triggerRef, floatingRef: panelRef, floatingStyle, zIndex: panelZIndex } = useFloating<HTMLDivElement, HTMLDivElement>({
      open,
      placement,
      panelWidth: compactPanel ? 332 : 476,
      panelHeight: compactPanel ? (includeSecond ? 492 : 468) : 328,
    });

    useOverlayLayer({
      open: open && !disabled && !readOnly && portalContainer != null,
      containerRef: panelRef,
      ownerRef: triggerRef,
      zIndex: panelZIndex,
      onEscape: () => setOpen(false),
      restoreFocus: true,
    });

    const setRootRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node;
        (triggerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref, triggerRef]
    );

    React.useEffect(() => {
      if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
      const media = window.matchMedia("(max-width: 640px)");
      const update = () => setCompactPanel(media.matches);
      update();
      media.addEventListener?.("change", update);
      return () => media.removeEventListener?.("change", update);
    }, []);

    const normalizedMin = React.useMemo(
      () => (isValidDate(min) ? normalizeDateTime(min, includeSecond) : undefined),
      [includeSecond, min]
    );
    const normalizedMax = React.useMemo(
      () => (isValidDate(max) ? normalizeDateTime(max, includeSecond) : undefined),
      [includeSecond, max]
    );

    const isDisabledDay = React.useCallback(
      (date: Date) => {
        const day = startOfDay(date);
        if (normalizedMin && day < startOfDay(normalizedMin)) return true;
        if (normalizedMax && day > startOfDay(normalizedMax)) return true;
        return disabledDate?.(day) ?? false;
      },
      [disabledDate, normalizedMax, normalizedMin]
    );

    /** 在日期本身可用时，判断具体时间是否越界或被业务规则禁用。 */
    const isDisabledTimeOnEnabledDay = React.useCallback(
      (date: Date) => {
        const normalized = normalizeDateTime(date, includeSecond);
        if (normalizedMin && normalized < normalizedMin) return true;
        if (normalizedMax && normalized > normalizedMax) return true;
        return disabledTime?.(getTimeParts(normalized), startOfDay(normalized)) ?? false;
      },
      [disabledTime, includeSecond, normalizedMax, normalizedMin]
    );

    const isDisabledDateTime = React.useCallback(
      (date: Date) => isDisabledDay(date) || isDisabledTimeOnEnabledDay(date),
      [isDisabledDay, isDisabledTimeOnEnabledDay]
    );

    const commit = React.useCallback(
      (next: Date | null, close = false) => {
        if (!next) {
          if (!controlled) setInner(null);
          setDraft("");
          onChange?.(null, "");
          if (close) setOpen(false);
          return;
        }

        const normalized = normalizeDateTime(next, includeSecond);
        if (isDisabledDateTime(normalized)) return;
        if (!controlled) setInner(normalized);
        const nextString = formatDateTime(normalized, format, includeSecond);
        setDraft(nextString);
        onChange?.(normalized, nextString);
        if (close) setOpen(false);
      },
      [controlled, format, includeSecond, isDisabledDateTime, onChange, setOpen]
    );

    React.useEffect(() => {
      if (!open) return;
      const onDown = (event: MouseEvent) => {
        const target = event.target as Node;
        if (rootRef.current?.contains(target)) return;
        if (panelRef.current?.contains(target)) return;
        setOpen(false);
      };
      document.addEventListener("mousedown", onDown);
      return () => {
        document.removeEventListener("mousedown", onDown);
      };
    }, [open, setOpen]);

    const scrollListTo = React.useCallback(
      (list: HTMLElement, top: number, animate: boolean) => {
        const frame = scrollFramesRef.current.get(list);
        if (frame != null) cancelAnimationFrame(frame);
        scrollFramesRef.current.delete(list);

        if (!animate) {
          list.scrollTop = top;
          return;
        }

        const start = list.scrollTop;
        const distance = top - start;
        if (Math.abs(distance) < 1) {
          list.scrollTop = top;
          return;
        }

        const startedAt = performance.now();
        const duration = 180;
        const tick = (now: number) => {
          const progress = Math.min((now - startedAt) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          list.scrollTop = start + distance * eased;

          if (progress < 1) {
            scrollFramesRef.current.set(list, requestAnimationFrame(tick));
            return;
          }

          scrollFramesRef.current.delete(list);
          list.scrollTop = top;
        };

        scrollFramesRef.current.set(list, requestAnimationFrame(tick));
      },
      []
    );

    React.useEffect(() => {
      if (!open) return;
      const prefersReducedMotion =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const shouldAnimate =
        !prefersReducedMotion &&
        wasOpenRef.current &&
        scrollSignatureRef.current != null &&
        scrollSignatureRef.current !== scrollSignature;

      requestAnimationFrame(() => {
        panelRef.current
          ?.querySelectorAll<HTMLElement>(".date-time-picker-time-list")
          .forEach((list) => {
            const selected = list.querySelector<HTMLElement>(".date-time-picker-time-option.selected");
            if (!selected) return;
            const top =
              selected.offsetTop -
              list.offsetTop -
              list.clientHeight / 2 +
              selected.offsetHeight / 2;
            scrollListTo(list, top, shouldAnimate);
          });
      });
      wasOpenRef.current = open;
      scrollSignatureRef.current = scrollSignature;
    }, [open, scrollListTo, scrollSignature]);

    React.useEffect(() => {
      if (open) return;
      wasOpenRef.current = false;
      scrollSignatureRef.current = null;
      setCalendarViewDate(null);
      setCalendarVisibleDate(null);
    }, [open]);

    React.useEffect(
      () => () => {
        scrollFramesRef.current.forEach((frame) => cancelAnimationFrame(frame));
        scrollFramesRef.current.clear();
      },
      []
    );

    const panelBase = current ?? getNow(includeSecond);
    const selectedDay = startOfDay(panelBase);
    const timeParts = getTimeParts(panelBase);
    const hourOptions = buildOptions(23, hourStep, timeParts.hour);
    const minuteOptions = buildOptions(59, minuteStep, timeParts.minute);
    const secondOptions = buildOptions(59, secondStep, timeParts.second);
    const sortedHourOptions = [...hourOptions].sort(byDistanceFrom(timeParts.hour));
    const sortedMinuteOptions = [...minuteOptions].sort(byDistanceFrom(timeParts.minute));
    const sortedSecondOptions = includeSecond
      ? [...secondOptions].sort(byDistanceFrom(timeParts.second))
      : [0];
    const dayCandidateCount =
      sortedHourOptions.length * sortedMinuteOptions.length * sortedSecondOptions.length;
    const availabilityCache = React.useMemo(
      () => new Map<number, DayAvailability>(),
      [
        disabledDate,
        disabledTime,
        hourStep,
        includeSecond,
        minuteStep,
        normalizedMax?.getTime(),
        normalizedMin?.getTime(),
        secondStep,
        timeParts.hour,
        timeParts.minute,
        timeParts.second,
      ]
    );

    /** 有界扫描并缓存单日可用时间，同时优先覆盖各列靠近当前值的组合。 */
    const getDayAvailability = (date: Date): DayAvailability => {
      const dayKey = startOfDay(date).getTime();
      const cached = availabilityCache.get(dayKey);
      if (cached) return cached;
      const availability: DayAvailability = {
        closestDateTime: null,
        byPart: {
          hour: new Map<number, TimePickerValue>(),
          minute: new Map<number, TimePickerValue>(),
          second: new Map<number, TimePickerValue>(),
        },
        complete: false,
      };
      availabilityCache.set(dayKey, availability);
      const day = startOfDay(date);
      if (isDisabledDay(day)) {
        availability.complete = true;
        return availability;
      }

      const visited = new Set<string>();
      /** 检查单个候选并把可用组合登记到对应的时、分、秒列。 */
      const inspectCandidate = (time: TimePickerValue): void => {
        const key = `${time.hour}:${time.minute}:${time.second}`;
        if (visited.has(key) || visited.size >= MAX_DAY_AVAILABILITY_PROBES) return;
        visited.add(key);
        const candidate = composeDateTime(day, time, includeSecond);
        if (isDisabledTimeOnEnabledDay(candidate)) return;
        availability.closestDateTime ??= candidate;
        availability.byPart.hour.set(time.hour, availability.byPart.hour.get(time.hour) ?? time);
        availability.byPart.minute.set(time.minute, availability.byPart.minute.get(time.minute) ?? time);
        availability.byPart.second.set(time.second, availability.byPart.second.get(time.second) ?? time);
      };
      /** 所有列值都已有可用组合时，无需继续扩大搜索范围。 */
      const allPartsCovered = (): boolean =>
        availability.byPart.hour.size === hourOptions.length &&
        availability.byPart.minute.size === minuteOptions.length &&
        availability.byPart.second.size === sortedSecondOptions.length;

      // 先检查只改变一个字段的候选，常见限制可在百余次调用内完成。
      inspectCandidate(timeParts);
      sortedHourOptions.forEach((hour) => inspectCandidate({ ...timeParts, hour }));
      sortedMinuteOptions.forEach((minute) => inspectCandidate({ ...timeParts, minute }));
      sortedSecondOptions.forEach((second) => inspectCandidate({ ...timeParts, second }));

      // 再按距离扩展组合；分钟和秒优先，避免先耗尽某一个小时的全部 3600 个组合。
      scanCandidates:
      for (const minute of sortedMinuteOptions) {
        for (const second of sortedSecondOptions) {
          for (const hour of sortedHourOptions) {
            if (visited.size >= MAX_DAY_AVAILABILITY_PROBES || allPartsCovered()) {
              break scanCandidates;
            }
            inspectCandidate({ hour, minute, second });
          }
        }
      }
      availability.complete = visited.size >= dayCandidateCount;
      return availability;
    };

    /** 返回时间列选项对应的最近可用组合。 */
    const findAvailableTime = (key: DateTimePart, value: number): TimePickerValue | null => {
      return getDayAvailability(selectedDay).byPart[key].get(value) ?? null;
    };

    /** 为新选择的日期寻找最接近当前时间的可用日期时间。 */
    const findAvailableDateTimeOnDay = (date: Date): Date | null => {
      return getDayAvailability(date).closestDateTime;
    };

    /** 当前可视月份内，整日没有任何可选时间时禁用对应日期。 */
    const isCalendarDayDisabled = (date: Date): boolean => {
      if (isDisabledDay(date)) return true;
      const visible = calendarVisibleDate ?? calendarViewDate ?? selectedDay;
      if (date.getFullYear() !== visible.getFullYear() || date.getMonth() !== visible.getMonth()) {
        return false;
      }
      if (dayCandidateCount > MAX_EAGER_CALENDAR_CANDIDATES) return false;
      const availability = getDayAvailability(date);
      return availability.complete && availability.closestDateTime == null;
    };

    const handleDatePick = (date: Date) => {
      const available = findAvailableDateTimeOnDay(date);
      if (available) commit(available);
    };

    const pickTime = (key: DateTimePart, nextValue: number) => {
      const nextTime = findAvailableTime(key, nextValue);
      if (nextTime) commit(composeDateTime(selectedDay, nextTime, includeSecond));
    };

    const handleInputChange = (next: string) => {
      setDraft(next);
      if (next.trim() === "") commit(null);
    };

    const handleInputBlur = () => {
      if (!draft.trim()) {
        setDraft(formatDateTime(current, format, includeSecond));
        return;
      }
      const parsed = parse
        ? parse(draft)
        : typeof format === "function"
          ? null
          : parseDateTimeInput(draft, includeSecond);
      if (!isValidDate(parsed) || isDisabledDateTime(parsed)) {
        setDraft(formatDateTime(current, format, includeSecond));
        return;
      }
      commit(parsed);
    };

    const handleRootKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if ((event.key === "ArrowDown" || event.key === "Enter") && !open) {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape" && open) {
        event.preventDefault();
        setOpen(false);
      }
    };

    /** 在时间列中用方向键、Home 与 End 移动焦点。 */
    const handleTimeOptionKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (event) => {
      const list = event.currentTarget.parentElement;
      if (!list) return;
      const options = Array.from(list.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"));
      const index = options.indexOf(event.currentTarget);
      let nextIndex = index;
      if (event.key === "ArrowDown" || event.key === "ArrowRight") nextIndex = index + 1;
      else if (event.key === "ArrowUp" || event.key === "ArrowLeft") nextIndex = index - 1;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = options.length - 1;
      else return;
      event.preventDefault();
      options[Math.max(0, Math.min(options.length - 1, nextIndex))]?.focus();
    };

    const renderTimeColumn = (
      label: string,
      key: DateTimePart,
      options: number[]
    ) => (
      <div className="date-time-picker-time-column">
        <div className="date-time-picker-time-label">{label}</div>
        <div className="date-time-picker-time-list" role="listbox" aria-label={label}>
          {options.map((option) => {
            const selected = timeParts[key] === option;
            const optionDisabled = findAvailableTime(key, option) == null;
            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={selected}
                disabled={optionDisabled}
                className={`date-time-picker-time-option ${selected ? "selected" : ""}`}
                onClick={() => pickTime(key, option)}
                onKeyDown={handleTimeOptionKeyDown}
              >
                {pad(option)}
              </button>
            );
          })}
        </div>
      </div>
    );

    const today = getNow(includeSecond);
    const mergedPanelClassName = [popupClassName, dropdownClassName].filter(Boolean).join(" ");
    const rootClassName = [
      "date-time-picker",
      size,
      open && "open",
      disabled && "disabled",
      readOnly && "readonly",
      invalid && "invalid",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div ref={setRootRef} className={rootClassName} onKeyDown={handleRootKeyDown} {...rest}>
        <Input
          id={fieldId}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-invalid={ariaInvalid}
          aria-required={ariaRequired}
          aria-describedby={ariaDescribedBy}
          value={draft}
          size={size}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          invalid={invalid}
          allowClear={allowClear}
          leadingIcon="calendar"
          {...inputTriggerHandlers}
          onValueChange={handleInputChange}
          onBlur={handleInputBlur}
          inputMode="numeric"
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-controls={open ? panelId : undefined}
        />
        {open &&
          !disabled &&
          !readOnly &&
          portalContainer &&
          createPortal(
            <div
              ref={panelRef}
              id={panelId}
              className={`date-time-picker-panel ${includeSecond ? "with-second" : "without-second"} ${mergedPanelClassName}`}
              role="dialog"
              aria-label="选择日期和时间"
              style={floatingStyle}
            >
              <div className="date-time-picker-body">
                <Calendar
                  value={selectedDay}
                  viewDate={calendarViewDate ?? undefined}
                  min={normalizedMin ? startOfDay(normalizedMin) : undefined}
                  max={normalizedMax ? startOfDay(normalizedMax) : undefined}
                  disabledDate={isCalendarDayDisabled}
                  onViewChange={setCalendarVisibleDate}
                  onChange={handleDatePick}
                />
                <div className="date-time-picker-time">
                  <div className="date-time-picker-time-columns">
                    {renderTimeColumn("时", "hour", hourOptions)}
                    {renderTimeColumn("分", "minute", minuteOptions)}
                    {includeSecond && renderTimeColumn("秒", "second", secondOptions)}
                  </div>
                </div>
              </div>
              <div className="date-time-picker-footer">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isDisabledDateTime(today)}
                  onClick={() => {
                    setCalendarViewDate(today);
                    setCalendarVisibleDate(today);
                    commit(today);
                  }}
                >
                  现在
                </Button>
                <span className="date-time-picker-footer-spacer" />
                {allowClear && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => commit(null, true)}
                  >
                    清空
                  </Button>
                )}
                <Button size="sm" variant="primary" onClick={() => setOpen(false)}>
                  确定
                </Button>
              </div>
            </div>,
            portalContainer
          )}
      </div>
    );
  }
);
DateTimePicker.displayName = "DateTimePicker";
