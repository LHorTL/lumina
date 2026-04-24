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
  tone?: TagTone;
  children?: React.ReactNode;
}

/** `Badge` — notification dot / count. Wrap around another element. */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(({
  count,
  max = 99,
  dot,
  tone = "danger",
  children,
  className = "",
  ...rest
}, ref) => {
  const show = dot || (typeof count === "number" && count > 0);
  return (
    <span ref={ref} className={`badge-wrap ${className}`} {...rest}>
      {children}
      {show && (
        <span className={`badge ${tone} ${dot ? "dot" : ""}`}>
          {!dot && (count! > max ? `${max}+` : count)}
        </span>
      )}
    </span>
  );
});
Badge.displayName = "Badge";
