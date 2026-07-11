import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Badge.css";
import * as React from "react";
import type { TagTone } from "../Tag";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Numeric count — renders as "max+" if greater than `max`. */
  count?: number;
  /** Maximum number to display before adding "+". */
  max?: number;
  /** Show a tiny dot instead of a number. */
  dot?: boolean;
  /** count 为 0 时仍显示数字徽标。 */
  showZero?: boolean;
  /** 覆盖徽标的可访问文本。 */
  statusLabel?: string;
  tone?: TagTone;
  children?: React.ReactNode;
}

/** `Badge` — notification dot / count. Wrap around another element. */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(({
  count,
  max = 99,
  dot,
  showZero = false,
  statusLabel,
  tone = "danger",
  children,
  className = "",
  ...rest
}, ref) => {
  const safeMax = Number.isFinite(max) && max >= 0 ? max : 99;
  const show = dot || (typeof count === "number" && (count > 0 || (showZero && count === 0)));
  const displayCount = typeof count === "number" ? (count > safeMax ? `${safeMax}+` : count) : undefined;
  return (
    <span ref={ref} className={`badge-wrap ${className}`} {...rest}>
      {children}
      {show && (
        <span
          className={`badge ${tone} ${dot ? "dot" : ""}`}
          role="status"
          aria-live="polite"
          aria-label={statusLabel ?? (dot ? "有新通知" : String(displayCount))}
        >
          {!dot && displayCount}
        </span>
      )}
    </span>
  );
});
Badge.displayName = "Badge";
