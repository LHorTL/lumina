import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Empty.css";
import * as React from "react";

export interface EmptyProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "children"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  /** `subtle` drops the recessed icon well — good for inline / embedded use. */
  variant?: "default" | "subtle";
  className?: string;
}

/** `Empty` — empty state placeholder. */
export const Empty = React.forwardRef<HTMLDivElement, EmptyProps>(({
  title = "暂无内容",
  description,
  icon,
  action,
  size = "md",
  variant = "default",
  className = "",
  ...rest
}, ref) => (
  <div ref={ref} className={`empty ${size} ${variant} ${className}`} {...rest}>
    {icon && <div className="empty-ico">{icon}</div>}
    <div className="empty-title">{title}</div>
    {description && <div className="empty-desc">{description}</div>}
    {action && <div className="empty-action">{action}</div>}
  </div>
));
Empty.displayName = "Empty";
