import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Calendar.css";
import * as React from "react";
import { Icon } from "../Icon";

export interface CalendarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  value?: Date;
  defaultValue?: Date;
  onChange?: (date: Date) => void;
  /** Sync the visible month to this date when it changes. */
  viewDate?: Date;
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

const isValidDate = (date: Date | undefined): date is Date =>
  date instanceof Date && !Number.isNaN(date.getTime());

/** `Calendar` — month-view date picker. */
export const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(({
  value,
  defaultValue,
  onChange,
  viewDate,
  min,
  max,
  disabledDate,
  className = "",
  ...rest
}, ref) => {
  const [inner, setInner] = React.useState(defaultValue ?? new Date());
  const isControlled = value !== undefined;
  const sel = isControlled ? value! : inner;
  const [view, setView] = React.useState(new Date(sel.getFullYear(), sel.getMonth(), 1));
  const [mode, setMode] = React.useState<CalendarMode>("date");
  const viewDateTime = isValidDate(viewDate) ? viewDate.getTime() : null;
  const viewDateYear = isValidDate(viewDate) ? viewDate.getFullYear() : null;
  const viewDateMonth = isValidDate(viewDate) ? viewDate.getMonth() : null;

  React.useEffect(() => {
    if (viewDateTime == null || viewDateYear == null || viewDateMonth == null) return;
    setView(new Date(viewDateYear, viewDateMonth, 1));
    setMode("date");
  }, [viewDateMonth, viewDateTime, viewDateYear]);

  const first = new Date(view.getFullYear(), view.getMonth(), 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isDisabledDay = React.useCallback(
    (date: Date) =>
      (min && date < min) ||
      (max && date > max) ||
      (disabledDate?.(date) ?? false),
    [disabledDate, max, min]
  );

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

  const pick = (d: number) => {
    const next = new Date(view.getFullYear(), view.getMonth(), d);
    if (isDisabledDay(next)) return;
    if (!isControlled) setInner(next);
    onChange?.(next);
  };

  const shiftView = (step: -1 | 1) => {
    if (mode === "year") {
      setView(new Date(view.getFullYear() + step * YEARS_PER_PAGE, view.getMonth(), 1));
      return;
    }
    if (mode === "month") {
      setView(new Date(view.getFullYear() + step, view.getMonth(), 1));
      return;
    }
    setView(new Date(view.getFullYear(), view.getMonth() + step, 1));
  };

  const pickMonth = (month: number) => {
    if (isMonthDisabled(view.getFullYear(), month)) return;
    setView(new Date(view.getFullYear(), month, 1));
    setMode("date");
  };

  const pickYear = (year: number) => {
    if (isYearDisabled(year)) return;
    setView(new Date(year, view.getMonth(), 1));
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
    <div ref={ref} className={`calendar ${className}`} {...rest}>
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
        <div className="calendar-grid">
          {WEEKDAYS.map((w) => (
            <div key={w} className="calendar-dow">{w}</div>
          ))}
          {cells.map((d, i) => {
            if (d === null) return <div key={i} className="calendar-cell out" />;
            const date = new Date(view.getFullYear(), view.getMonth(), d);
            const disabled = isDisabledDay(date);
            return (
              <button
                key={i}
                type="button"
                disabled={!!disabled}
                className={`calendar-cell ${isSameDay(date, sel) ? "selected" : ""} ${isSameDay(date, new Date()) ? "today" : ""} ${disabled ? "disabled" : ""}`}
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
