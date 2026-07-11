import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./TimePicker.css";
import * as React from "react";
import { createPortal } from "react-dom";
import { Button } from "../Button";
import { Input } from "../Input";
import { useFloating } from "../../utils/useFloating";
import { useInputTriggerToggle } from "../../utils/useInputTriggerToggle";
import { usePortalContainer } from "../../utils/portal";
import { useOverlayLayer } from "../../utils/overlayStack";

export type TimePickerFormat = "HH:mm" | "HH:mm:ss";
export type TimePickerSize = "sm" | "md" | "lg";

export interface TimePickerValue {
  hour: number;
  minute: number;
  second: number;
}

export interface TimePickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  /** Controlled time string. Use `null` for an empty picker. */
  value?: string | null;
  /** Initial time string when uncontrolled. */
  defaultValue?: string | null;
  /** Fires when the time changes or is cleared. */
  onChange?: (value: string | null, time: TimePickerValue | null) => void;
  /** Display and output format. */
  format?: TimePickerFormat;
  /** Show the seconds column. Overrides `format` display if true. */
  showSecond?: boolean;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  size?: TimePickerSize;
  /** Show a clear button when a value is selected. */
  allowClear?: boolean;
  /** Selectable hour increment. Default 1. */
  hourStep?: number;
  /** Selectable minute increment. Default 1. */
  minuteStep?: number;
  /** Selectable second increment. Default 1. */
  secondStep?: number;
  /** Min selectable time, e.g. `"09:00"` or `"09:00:30"`. */
  min?: string;
  /** Max selectable time, e.g. `"18:30"` or `"18:30:00"`. */
  max?: string;
  /** Predicate that disables individual time values. */
  disabledTime?: (time: TimePickerValue) => boolean;
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

const clampStep = (value: number | undefined): number => {
  if (!Number.isFinite(value) || !value || value < 1) return 1;
  return Math.floor(value);
};

const pad = (value: number): string => String(value).padStart(2, "0");

const parseTime = (value: string | null | undefined): TimePickerValue | null => {
  if (!value) return null;
  const match = value.trim().match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const second = match[3] == null ? 0 : Number(match[3]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) {
    return null;
  }
  return { hour, minute, second };
};

const formatTime = (time: TimePickerValue, includeSecond: boolean): string => {
  const base = `${pad(time.hour)}:${pad(time.minute)}`;
  return includeSecond ? `${base}:${pad(time.second)}` : base;
};

const normalizeTime = (value: string | null | undefined, includeSecond: boolean): string | null => {
  const parsed = parseTime(value);
  return parsed ? formatTime(parsed, includeSecond) : null;
};

const toSeconds = (time: TimePickerValue): number =>
  time.hour * 3600 + time.minute * 60 + time.second;

const getNow = (): TimePickerValue => {
  const now = new Date();
  return {
    hour: now.getHours(),
    minute: now.getMinutes(),
    second: now.getSeconds(),
  };
};

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

const compose = (
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

/**
 * `TimePicker` — time-of-day picker with hour / minute / optional second
 * columns, string values, min/max constraints, and custom disabled times.
 *
 * @example
 * <TimePicker value={time} onChange={setTime} minuteStep={15} />
 */
export const TimePicker = React.forwardRef<HTMLDivElement, TimePickerProps>(
  (
    {
      value,
      defaultValue = null,
      onChange,
      format = "HH:mm",
      showSecond,
      placeholder = "请选择时间",
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
    const includeSecond = showSecond ?? format === "HH:mm:ss";
    const controlled = value !== undefined;
    const initial = normalizeTime(defaultValue, includeSecond);
    const [inner, setInner] = React.useState<string | null>(initial);
    const current = controlled ? normalizeTime(value, includeSecond) : inner;
    const scrollSignature = current ?? "";
    const currentParts = parseTime(current);
    const [draft, setDraft] = React.useState(current ?? "");

    React.useEffect(() => {
      setDraft(current ?? "");
    }, [current]);

    const openControlled = openProp !== undefined;
    const [innerOpen, setInnerOpen] = React.useState(defaultOpen);
    const open = openControlled ? !!openProp : innerOpen;
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
      panelWidth: includeSecond ? 312 : 236,
      panelHeight: 330,
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

    const minParts = React.useMemo(() => parseTime(min), [min]);
    const maxParts = React.useMemo(() => parseTime(max), [max]);
    const minSeconds = minParts ? toSeconds(minParts) : null;
    const maxSeconds = maxParts ? toSeconds(maxParts) : null;

    const isDisabledTime = React.useCallback(
      (time: TimePickerValue) => {
        const seconds = toSeconds(time);
        if (minSeconds != null && seconds < minSeconds) return true;
        if (maxSeconds != null && seconds > maxSeconds) return true;
        return disabledTime?.(time) ?? false;
      },
      [disabledTime, maxSeconds, minSeconds]
    );

    const commit = React.useCallback(
      (next: TimePickerValue | null) => {
        if (!next) {
          if (!controlled) setInner(null);
          setDraft("");
          onChange?.(null, null);
          return;
        }
        if (isDisabledTime(next)) return;
        const nextValue = formatTime(next, includeSecond);
        if (!controlled) setInner(nextValue);
        setDraft(nextValue);
        onChange?.(nextValue, next);
      },
      [controlled, includeSecond, isDisabledTime, onChange]
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
          ?.querySelectorAll<HTMLElement>(".time-picker-list")
          .forEach((list) => {
            const selected = list.querySelector<HTMLElement>(".time-picker-option.selected");
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
    }, [open]);

    React.useEffect(
      () => () => {
        scrollFramesRef.current.forEach((frame) => cancelAnimationFrame(frame));
        scrollFramesRef.current.clear();
      },
      []
    );

    const panelBase = currentParts ?? getNow();
    const hourOptions = buildOptions(23, hourStep, currentParts?.hour);
    const minuteOptions = buildOptions(59, minuteStep, currentParts?.minute);
    const secondOptions = buildOptions(59, secondStep, currentParts?.second);

    const findAvailableTime = (
      key: "hour" | "minute" | "second",
      value: number
    ): TimePickerValue | null => {
      const preferred = compose(panelBase, key, value);
      if (!isDisabledTime(preferred)) return preferred;

      const hours =
        key === "hour" ? [value] : [...hourOptions].sort(byDistanceFrom(panelBase.hour));
      const minutes =
        key === "minute" ? [value] : [...minuteOptions].sort(byDistanceFrom(panelBase.minute));
      const seconds =
        key === "second"
          ? [value]
          : includeSecond
            ? [...secondOptions].sort(byDistanceFrom(panelBase.second))
            : [0];

      for (const hour of hours) {
        for (const minute of minutes) {
          for (const second of seconds) {
            const candidate = { hour, minute, second };
            if (!isDisabledTime(candidate)) return candidate;
          }
        }
      }
      return null;
    };

    const pick = (key: "hour" | "minute" | "second", nextValue: number) => {
      const next = findAvailableTime(key, nextValue);
      if (next) commit(next);
    };

    const handleInputChange = (next: string) => {
      setDraft(next);
      if (next.trim() === "") commit(null);
    };

    const handleInputBlur = () => {
      if (!draft.trim()) {
        setDraft(current ?? "");
        return;
      }
      const parsed = parseTime(draft);
      const normalized = parsed
        ? { ...parsed, second: includeSecond ? parsed.second : 0 }
        : null;
      if (!normalized || isDisabledTime(normalized)) {
        setDraft(current ?? "");
        return;
      }
      commit(normalized);
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

    /** 在时分秒列表中用方向键、Home 与 End 移动焦点。 */
    const handleOptionKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (event) => {
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

    const renderColumn = (
      label: string,
      key: "hour" | "minute" | "second",
      options: number[]
    ) => (
      <div className="time-picker-column">
        <div className="time-picker-column-label">{label}</div>
        <div className="time-picker-list" role="listbox" aria-label={label}>
          {options.map((option) => {
            const selected = currentParts?.[key] === option;
            const optionDisabled = findAvailableTime(key, option) == null;
            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={selected}
                disabled={optionDisabled}
                className={`time-picker-option ${selected ? "selected" : ""}`}
                onClick={() => pick(key, option)}
                onKeyDown={handleOptionKeyDown}
              >
                {pad(option)}
              </button>
            );
          })}
        </div>
      </div>
    );

    const mergedPanelClassName = [popupClassName, dropdownClassName].filter(Boolean).join(" ");
    const now = getNow();
    const nowDisabled = isDisabledTime(now);
    const rootClassName = [
      "time-picker",
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
          leadingIcon="clock"
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
              className={`time-picker-panel ${includeSecond ? "with-second" : "without-second"} ${mergedPanelClassName}`}
              role="dialog"
              aria-label="选择时间"
              style={floatingStyle}
            >
              <div className="time-picker-columns">
                {renderColumn("时", "hour", hourOptions)}
                {renderColumn("分", "minute", minuteOptions)}
                {includeSecond && renderColumn("秒", "second", secondOptions)}
              </div>
              <div className="time-picker-footer">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={nowDisabled}
                  onClick={() => commit(now)}
                >
                  现在
                </Button>
                <span className="time-picker-footer-spacer" />
                {allowClear && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      commit(null);
                      setOpen(false);
                    }}
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
TimePicker.displayName = "TimePicker";
