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

export type DateTimePickerFormat = "YYYY-MM-DD HH:mm" | "YYYY-MM-DD HH:mm:ss";
export type DateTimePickerSize = "sm" | "md" | "lg";

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

const clampStep = (value: number | undefined): number => {
  if (!Number.isFinite(value) || !value || value < 1) return 1;
  return Math.floor(value);
};

const isValidDate = (date: Date | null | undefined): date is Date =>
  date instanceof Date && !Number.isNaN(date.getTime());

const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

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

const composeTime = (
  base: TimePickerValue,
  key: "hour" | "minute" | "second",
  value: number
): TimePickerValue => ({
  hour: key === "hour" ? value : base.hour,
  minute: key === "minute" ? value : base.minute,
  second: key === "second" ? value : base.second,
});

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

    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const panelRef = React.useRef<HTMLDivElement | null>(null);
    const { triggerRef, floatingStyle } = useFloating<HTMLDivElement>({
      open,
      placement,
      panelWidth: compactPanel ? 332 : 476,
      panelHeight: compactPanel ? (includeSecond ? 492 : 468) : 328,
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
      if (typeof window === "undefined") return;
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

    const isDisabledDateTime = React.useCallback(
      (date: Date) => {
        const normalized = normalizeDateTime(date, includeSecond);
        if (isDisabledDay(normalized)) return true;
        if (normalizedMin && normalized < normalizedMin) return true;
        if (normalizedMax && normalized > normalizedMax) return true;
        return disabledTime?.(getTimeParts(normalized), startOfDay(normalized)) ?? false;
      },
      [disabledTime, includeSecond, isDisabledDay, normalizedMax, normalizedMin]
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
      const onDocKey = (event: KeyboardEvent) => {
        if (event.key === "Escape") setOpen(false);
      };
      document.addEventListener("mousedown", onDown);
      document.addEventListener("keydown", onDocKey);
      return () => {
        document.removeEventListener("mousedown", onDown);
        document.removeEventListener("keydown", onDocKey);
      };
    }, [open, setOpen]);

    const scrollListTo = React.useCallback(
      (list: HTMLElement, top: number, animate: boolean) => {
        const frame = scrollFramesRef.current.get(list);
        if (frame != null) cancelAnimationFrame(frame);

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
      const shouldAnimate =
        wasOpenRef.current && scrollSignatureRef.current != null && scrollSignatureRef.current !== scrollSignature;

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

    const findAvailableTime = (
      key: "hour" | "minute" | "second",
      value: number
    ): TimePickerValue | null => {
      const preferred = composeTime(timeParts, key, value);
      if (!isDisabledDateTime(composeDateTime(selectedDay, preferred, includeSecond))) {
        return preferred;
      }

      const hours =
        key === "hour" ? [value] : [...hourOptions].sort(byDistanceFrom(timeParts.hour));
      const minutes =
        key === "minute" ? [value] : [...minuteOptions].sort(byDistanceFrom(timeParts.minute));
      const seconds =
        key === "second"
          ? [value]
          : includeSecond
            ? [...secondOptions].sort(byDistanceFrom(timeParts.second))
            : [0];

      for (const hour of hours) {
        for (const minute of minutes) {
          for (const second of seconds) {
            const candidate = { hour, minute, second };
            if (!isDisabledDateTime(composeDateTime(selectedDay, candidate, includeSecond))) {
              return candidate;
            }
          }
        }
      }
      return null;
    };

    const handleDatePick = (date: Date) => {
      const next = composeDateTime(date, timeParts, includeSecond);
      if (normalizedMin && isSameDay(next, normalizedMin) && next < normalizedMin) {
        commit(normalizedMin);
        return;
      }
      if (normalizedMax && isSameDay(next, normalizedMax) && next > normalizedMax) {
        commit(normalizedMax);
        return;
      }
      commit(next);
    };

    const pickTime = (key: "hour" | "minute" | "second", nextValue: number) => {
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
      if (typeof format === "function") {
        setDraft(formatDateTime(current, format, includeSecond));
        return;
      }
      const parsed = parseDateTimeInput(draft, includeSecond);
      if (!parsed || isDisabledDateTime(parsed)) {
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

    const renderTimeColumn = (
      label: string,
      key: "hour" | "minute" | "second",
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
          value={draft}
          size={size}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          invalid={invalid}
          allowClear={allowClear}
          leadingIcon="calendar"
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onValueChange={handleInputChange}
          onBlur={handleInputBlur}
          inputMode="numeric"
          aria-expanded={open}
          aria-haspopup="dialog"
        />
        {open &&
          !disabled &&
          !readOnly &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              ref={panelRef}
              className={`date-time-picker-panel ${includeSecond ? "with-second" : "without-second"} ${mergedPanelClassName}`}
              role="dialog"
              style={floatingStyle}
            >
              <div className="date-time-picker-body">
                <Calendar
                  value={selectedDay}
                  viewDate={calendarViewDate ?? undefined}
                  min={normalizedMin ? startOfDay(normalizedMin) : undefined}
                  max={normalizedMax ? startOfDay(normalizedMax) : undefined}
                  disabledDate={isDisabledDay}
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
            document.body
          )}
      </div>
    );
  }
);
DateTimePicker.displayName = "DateTimePicker";
