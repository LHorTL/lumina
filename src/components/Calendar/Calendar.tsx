import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Calendar.css";
import * as React from "react";
import { Icon } from "../Icon";

export interface CalendarProps {
  value?: Date;
  defaultValue?: Date;
  onChange?: (date: Date) => void;
  /** Min selectable date. */
  min?: Date;
  /** Max selectable date. */
  max?: Date;
  className?: string;
}

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

/** `Calendar` — month-view date picker. */
export const Calendar: React.FC<CalendarProps> = ({
  value,
  defaultValue,
  onChange,
  min,
  max,
  className = "",
}) => {
  const [inner, setInner] = React.useState(defaultValue ?? new Date());
  const isControlled = value !== undefined;
  const sel = isControlled ? value! : inner;
  const [view, setView] = React.useState(new Date(sel.getFullYear(), sel.getMonth(), 1));

  const first = new Date(view.getFullYear(), view.getMonth(), 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isSame = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const pick = (d: number) => {
    const next = new Date(view.getFullYear(), view.getMonth(), d);
    if (min && next < min) return;
    if (max && next > max) return;
    if (!isControlled) setInner(next);
    onChange?.(next);
  };

  return (
    <div className={`calendar ${className}`}>
      <div className="calendar-head">
        <button
          type="button"
          className="btn icon sm ghost"
          onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
          aria-label="Previous month"
        >
          <Icon name="chevLeft" size={14} />
        </button>
        <button type="button" className="calendar-title">
          {view.getFullYear()} 年 {view.getMonth() + 1} 月
        </button>
        <button
          type="button"
          className="btn icon sm ghost"
          onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
          aria-label="Next month"
        >
          <Icon name="chevRight" size={14} />
        </button>
      </div>
      <div className="calendar-grid">
        {WEEKDAYS.map((w) => (
          <div key={w} className="calendar-dow">{w}</div>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <div key={i} className="calendar-cell out" />;
          const date = new Date(view.getFullYear(), view.getMonth(), d);
          const disabled = (min && date < min) || (max && date > max);
          return (
            <button
              key={i}
              type="button"
              disabled={!!disabled}
              className={`calendar-cell ${isSame(date, sel) ? "selected" : ""} ${isSame(date, new Date()) ? "today" : ""} ${disabled ? "disabled" : ""}`}
              onClick={() => pick(d)}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
};
