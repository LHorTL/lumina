import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./DatePicker.css";
import * as React from "react";
import { createPortal } from "react-dom";
import { Button } from "../Button";
import { Calendar } from "../Calendar";
import { Input } from "../Input";
import { useFloating } from "../../utils/useFloating";
import { useInputTriggerToggle } from "../../utils/useInputTriggerToggle";

export type DatePickerFormat = "YYYY-MM-DD" | "YYYY/MM/DD" | "YYYY年MM月DD日";
export type DatePickerSize = "sm" | "md" | "lg";

export interface DatePickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  /** Controlled selected date. Use `null` for an empty picker. */
  value?: Date | null;
  /** Initial selected date when uncontrolled. */
  defaultValue?: Date | null;
  /** Fires when the date changes or is cleared. */
  onChange?: (date: Date | null, dateString: string) => void;
  /** Display and input format. */
  format?: DatePickerFormat | ((date: Date) => string);
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  size?: DatePickerSize;
  /** Show a clear button when a date is selected. */
  allowClear?: boolean;
  /** Min selectable date. */
  min?: Date;
  /** Max selectable date. */
  max?: Date;
  /** Predicate that disables individual dates. */
  disabledDate?: (date: Date) => boolean;
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

const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isValidDate = (date: Date | null | undefined): date is Date =>
  date instanceof Date && !Number.isNaN(date.getTime());

const formatDate = (
  date: Date | null | undefined,
  format: DatePickerProps["format"]
): string => {
  if (!isValidDate(date)) return "";
  if (typeof format === "function") return format(date);
  const year = String(date.getFullYear());
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  if (format === "YYYY/MM/DD") return `${year}/${month}/${day}`;
  if (format === "YYYY年MM月DD日") return `${year}年${month}月${day}日`;
  return `${year}-${month}-${day}`;
};

const parseDateInput = (input: string): Date | null => {
  const text = input.trim();
  if (!text) return null;
  const match = text.match(/^(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})日?$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
};

/**
 * `DatePicker` — input-triggered date picker built on top of `Calendar`.
 *
 * @example
 * <DatePicker value={date} onChange={setDate} allowClear />
 */
export const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  (
    {
      value,
      defaultValue = null,
      onChange,
      format = "YYYY-MM-DD",
      placeholder = "请选择日期",
      disabled,
      readOnly,
      invalid,
      size = "md",
      allowClear,
      min,
      max,
      disabledDate,
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
    const controlled = value !== undefined;
    const [inner, setInner] = React.useState<Date | null>(
      isValidDate(defaultValue) ? startOfDay(defaultValue) : null
    );
    const current = controlled ? (isValidDate(value) ? startOfDay(value) : null) : inner;
    const currentTime = current?.getTime() ?? null;
    const formattedCurrent = React.useMemo(
      () => (currentTime == null ? "" : formatDate(new Date(currentTime), format)),
      [currentTime, format]
    );
    const [draft, setDraft] = React.useState(formattedCurrent);

    React.useEffect(() => {
      setDraft(formattedCurrent);
    }, [formattedCurrent]);

    const openControlled = openProp !== undefined;
    const [innerOpen, setInnerOpen] = React.useState(defaultOpen);
    const open = openControlled ? !!openProp : innerOpen;
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
    const panelRef = React.useRef<HTMLDivElement | null>(null);
    const { triggerRef, floatingStyle } = useFloating<HTMLDivElement>({
      open,
      placement,
      panelWidth: 344,
      panelHeight: 404,
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

    const normalizedMin = React.useMemo(() => (isValidDate(min) ? startOfDay(min) : undefined), [min]);
    const normalizedMax = React.useMemo(() => (isValidDate(max) ? startOfDay(max) : undefined), [max]);

    const isDisabledDate = React.useCallback(
      (date: Date) => {
        const day = startOfDay(date);
        if (normalizedMin && day < normalizedMin) return true;
        if (normalizedMax && day > normalizedMax) return true;
        return disabledDate?.(day) ?? false;
      },
      [disabledDate, normalizedMax, normalizedMin]
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
        const normalized = startOfDay(next);
        if (isDisabledDate(normalized)) return;
        if (!controlled) setInner(normalized);
        const nextString = formatDate(normalized, format);
        setDraft(nextString);
        onChange?.(normalized, nextString);
        if (close) setOpen(false);
      },
      [controlled, format, isDisabledDate, onChange, setOpen]
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

    const handleInputChange = (next: string) => {
      setDraft(next);
      if (next.trim() === "") commit(null);
    };

    const handleInputBlur = () => {
      if (!draft.trim()) {
        setDraft(formattedCurrent);
        return;
      }
      if (typeof format === "function") {
        setDraft(formattedCurrent);
        return;
      }
      const parsed = parseDateInput(draft);
      if (!parsed || isDisabledDate(parsed)) {
        setDraft(formattedCurrent);
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

    const today = startOfDay(new Date());
    const calendarValue = current ?? today;
    const mergedPanelClassName = [popupClassName, dropdownClassName].filter(Boolean).join(" ");
    const rootClassName = [
      "date-picker",
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
          {...inputTriggerHandlers}
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
              className={`date-picker-panel ${mergedPanelClassName}`}
              role="dialog"
              style={floatingStyle}
            >
              <Calendar
                value={calendarValue}
                min={normalizedMin}
                max={normalizedMax}
                disabledDate={isDisabledDate}
                onChange={(next) => commit(next, true)}
              />
              <div className="date-picker-footer">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isDisabledDate(today)}
                  onClick={() => commit(today, true)}
                >
                  今天
                </Button>
                <span className="date-picker-footer-spacer" />
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
DatePicker.displayName = "DatePicker";
