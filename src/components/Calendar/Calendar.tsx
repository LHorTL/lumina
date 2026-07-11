import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Calendar.css";
import * as React from "react";
import { Icon } from "../Icon";

export interface CalendarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  /** 受控日期；传 null 表示当前没有选中日期。 */
  value?: Date | null;
  /** 非受控初始日期；传 null 时仍以今天作为初始可视月份。 */
  defaultValue?: Date | null;
  onChange?: (date: Date) => void;
  /** Sync the visible month to this date when it changes. */
  viewDate?: Date;
  /** 可视月份变化时触发，返回该月第一天。 */
  onViewChange?: (date: Date) => void;
  /** Min selectable date. */
  min?: Date;
  /** Max selectable date. */
  max?: Date;
  /**
   * Predicate that marks an individual cell as disabled. Disabled cells are
   * greyed out, not clickable, and do not fire `onChange`.
   * @example
   * // disable weekends
   * disabledDate={(d) => d.getDay() === 0 || d.getDay() === 6}
   */
  disabledDate?: (date: Date) => boolean;
  className?: string;
}

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
const MONTHS = Array.from({ length: 12 }, (_, index) => `${index + 1} 月`);
const YEARS_PER_PAGE = 12;

type CalendarMode = "date" | "month" | "year";

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const isValidDate = (date: Date | null | undefined): date is Date =>
  date instanceof Date && !Number.isNaN(date.getTime());

/** 将日期归一化到本地日历日的起点，避免时分秒影响日期边界。 */
const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** `Calendar` — month-view date picker. */
export const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(({
  value,
  defaultValue,
  onChange,
  viewDate,
  onViewChange,
  min,
  max,
  disabledDate,
  className = "",
  ...rest
}, ref) => {
  const [inner, setInner] = React.useState(() =>
    isValidDate(defaultValue) ? startOfDay(defaultValue) : startOfDay(new Date())
  );
  const isControlled = value !== undefined;
  const sel = isControlled
    ? isValidDate(value)
      ? startOfDay(value)
      : null
    : inner;
  const initialView = sel ?? startOfDay(new Date());
  const [view, setView] = React.useState(new Date(initialView.getFullYear(), initialView.getMonth(), 1));
  const [mode, setMode] = React.useState<CalendarMode>("date");
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const viewDateTime = isValidDate(viewDate) ? viewDate.getTime() : null;
  const viewDateYear = isValidDate(viewDate) ? viewDate.getFullYear() : null;
  const viewDateMonth = isValidDate(viewDate) ? viewDate.getMonth() : null;

  React.useEffect(() => {
    if (viewDateTime == null || viewDateYear == null || viewDateMonth == null) return;
    setView(new Date(viewDateYear, viewDateMonth, 1));
    setMode("date");
  }, [viewDateMonth, viewDateTime, viewDateYear]);

  const selectedTime = sel?.getTime() ?? null;
  React.useEffect(() => {
    if (viewDateTime != null || selectedTime == null) return;
    const selected = new Date(selectedTime);
    setView(new Date(selected.getFullYear(), selected.getMonth(), 1));
  }, [selectedTime, viewDateTime]);

  const first = new Date(view.getFullYear(), view.getMonth(), 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const normalizedMin = React.useMemo(() => (isValidDate(min) ? startOfDay(min) : undefined), [min]);
  const normalizedMax = React.useMemo(() => (isValidDate(max) ? startOfDay(max) : undefined), [max]);
  const isDisabledDay = React.useCallback(
    (date: Date) =>
      (normalizedMin && startOfDay(date) < normalizedMin) ||
      (normalizedMax && startOfDay(date) > normalizedMax) ||
      (disabledDate?.(startOfDay(date)) ?? false),
    [disabledDate, normalizedMax, normalizedMin]
  );

  /** 合并内部节点引用与对外 ref。 */
  const setRootRef = React.useCallback((node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  }, [ref]);

  /** 在日期网格内提供方向键、Home 与 End 导航。 */
  const handleGridKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    const buttons = Array.from(
      rootRef.current?.querySelectorAll<HTMLButtonElement>(".calendar-grid button.calendar-cell") ?? []
    );
    const index = buttons.indexOf(event.target as HTMLButtonElement);
    if (index < 0) return;
    let step = 0;
    let nextIndex = index;
    if (event.key === "ArrowRight") step = 1;
    else if (event.key === "ArrowLeft") step = -1;
    else if (event.key === "ArrowDown") step = 7;
    else if (event.key === "ArrowUp") step = -7;
    else if (event.key === "Home") nextIndex = buttons.findIndex((button) => !button.disabled);
    else if (event.key === "End") {
      nextIndex = buttons.length - 1;
      while (nextIndex >= 0 && buttons[nextIndex].disabled) nextIndex -= 1;
    }
    else return;
    event.preventDefault();
    if (step !== 0) {
      nextIndex += step;
      while (nextIndex >= 0 && nextIndex < buttons.length && buttons[nextIndex].disabled) {
        nextIndex += step;
      }
    }
    if (nextIndex >= 0 && nextIndex < buttons.length) buttons[nextIndex].focus();
  };

  const isMonthDisabled = React.useCallback(
    (year: number, month: number) => {
      const count = new Date(year, month + 1, 0).getDate();
      for (let day = 1; day <= count; day++) {
        if (!isDisabledDay(new Date(year, month, day))) return false;
      }
      return true;
    },
    [isDisabledDay]
  );

  const isYearDisabled = React.useCallback(
    (year: number) =>
      Array.from({ length: 12 }, (_, month) => month).every((month) =>
        isMonthDisabled(year, month)
      ),
    [isMonthDisabled]
  );
  const selectedInView = !!sel && sel.getFullYear() === view.getFullYear() && sel.getMonth() === view.getMonth();
  const focusableSelectionInView = selectedInView && !!sel && !isDisabledDay(sel);
  const firstFocusableDay = cells.find((day) =>
    day != null && !isDisabledDay(new Date(view.getFullYear(), view.getMonth(), day))
  );

  const pick = (d: number) => {
    const next = new Date(view.getFullYear(), view.getMonth(), d);
    if (isDisabledDay(next)) return;
    if (!isControlled) setInner(next);
    onChange?.(next);
  };

  const shiftView = (step: -1 | 1) => {
    let next: Date;
    if (mode === "year") {
      next = new Date(view.getFullYear() + step * YEARS_PER_PAGE, view.getMonth(), 1);
    } else if (mode === "month") {
      next = new Date(view.getFullYear() + step, view.getMonth(), 1);
    } else {
      next = new Date(view.getFullYear(), view.getMonth() + step, 1);
    }
    setView(next);
    onViewChange?.(next);
  };

  const pickMonth = (month: number) => {
    if (isMonthDisabled(view.getFullYear(), month)) return;
    const next = new Date(view.getFullYear(), month, 1);
    setView(next);
    onViewChange?.(next);
    setMode("date");
  };

  const pickYear = (year: number) => {
    if (isYearDisabled(year)) return;
    const next = new Date(year, view.getMonth(), 1);
    setView(next);
    onViewChange?.(next);
    setMode("month");
  };

  const yearPageStart = Math.floor(view.getFullYear() / YEARS_PER_PAGE) * YEARS_PER_PAGE;
  const years = Array.from({ length: YEARS_PER_PAGE }, (_, index) => yearPageStart + index);

  const renderTitle = () => {
    if (mode === "year") {
      return (
        <span className="calendar-title static">
          {yearPageStart} - {yearPageStart + YEARS_PER_PAGE - 1}
        </span>
      );
    }
    if (mode === "month") {
      return (
        <button
          type="button"
          className="calendar-title"
          onClick={() => setMode("year")}
          aria-label="选择年份"
        >
          {view.getFullYear()} 年
        </button>
      );
    }
    return (
      <div className="calendar-title-group">
        <button
          type="button"
          className="calendar-title-part"
          onClick={() => setMode("year")}
          aria-label="选择年份"
        >
          {view.getFullYear()} 年
        </button>
        <button
          type="button"
          className="calendar-title-part"
          onClick={() => setMode("month")}
          aria-label="选择月份"
        >
          {view.getMonth() + 1} 月
        </button>
      </div>
    );
  };

  return (
    <div ref={setRootRef} className={`calendar ${className}`} {...rest}>
      <div className="calendar-head">
        <button
          type="button"
          className="btn icon sm ghost"
          onClick={() => shiftView(-1)}
          aria-label={mode === "year" ? "Previous years" : mode === "month" ? "Previous year" : "Previous month"}
        >
          <Icon name="chevLeft" size={14} />
        </button>
        {renderTitle()}
        <button
          type="button"
          className="btn icon sm ghost"
          onClick={() => shiftView(1)}
          aria-label={mode === "year" ? "Next years" : mode === "month" ? "Next year" : "Next month"}
        >
          <Icon name="chevRight" size={14} />
        </button>
      </div>
      {mode === "date" && (
        <div className="calendar-grid" role="grid" aria-label={`${view.getFullYear()} 年 ${view.getMonth() + 1} 月`} onKeyDown={handleGridKeyDown}>
          {WEEKDAYS.map((w) => (
            <div key={w} className="calendar-dow" role="columnheader">{w}</div>
          ))}
          {cells.map((d, i) => {
            if (d === null) return <div key={i} className="calendar-cell out" />;
            const date = new Date(view.getFullYear(), view.getMonth(), d);
            const disabled = isDisabledDay(date);
            return (
              <button
                key={i}
                type="button"
                role="gridcell"
                aria-label={`${view.getFullYear()}-${String(view.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`}
                aria-selected={!!sel && isSameDay(date, sel)}
                disabled={!!disabled}
                tabIndex={(focusableSelectionInView && !!sel && isSameDay(date, sel)) || (!focusableSelectionInView && d === firstFocusableDay) ? 0 : -1}
                className={`calendar-cell ${sel && isSameDay(date, sel) ? "selected" : ""} ${isSameDay(date, new Date()) ? "today" : ""} ${disabled ? "disabled" : ""}`}
                onClick={() => pick(d)}
              >
                {d}
              </button>
            );
          })}
        </div>
      )}
      {mode === "month" && (
        <div className="calendar-select-grid month">
          {MONTHS.map((month, index) => {
            const disabled = isMonthDisabled(view.getFullYear(), index);
            return (
              <button
                key={month}
                type="button"
                disabled={disabled}
                className={`calendar-select-option ${index === view.getMonth() ? "selected" : ""} ${disabled ? "disabled" : ""}`}
                onClick={() => pickMonth(index)}
              >
                {month}
              </button>
            );
          })}
        </div>
      )}
      {mode === "year" && (
        <div className="calendar-select-grid year">
          {years.map((year) => {
            const disabled = isYearDisabled(year);
            return (
              <button
                key={year}
                type="button"
                disabled={disabled}
                className={`calendar-select-option ${year === view.getFullYear() ? "selected" : ""} ${disabled ? "disabled" : ""}`}
                onClick={() => pickYear(year)}
              >
                {year}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});
Calendar.displayName = "Calendar";
