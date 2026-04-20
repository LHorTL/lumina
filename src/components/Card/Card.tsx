import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Card.css";
import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual variant. `raised` protrudes; `sunken` recesses; `flat` is subtle. */
  variant?: "raised" | "sunken" | "flat";
  /** Inner padding. */
  padding?: "none" | "sm" | "md" | "lg";
  /** When true, the card raises and lifts on hover. */
  hoverable?: boolean;
  children?: React.ReactNode;
}

/**
 * `Card` — neumorphic surface container. Use to group related content.
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "raised", padding = "md", hoverable, className = "", children, ...rest }, ref) => {
    const cls = [
      "card",
      variant,
      padding !== "md" && `pad-${padding}`,
      hoverable && "hoverable",
      className,
    ]
      .filter(Boolean)
      .join(" ");
    return (
      <div ref={ref} className={cls} {...rest}>
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export interface PanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * `Panel` — a titled `Card` with optional actions row.
 */
export const Panel: React.FC<PanelProps> = ({
  title,
  description,
  actions,
  children,
  className = "",
  ...rest
}) => (
  <div className={`panel ${className}`} {...rest}>
    {(title || actions) && (
      <div className="panel-head">
        <div className="panel-titles">
          {title && <div className="panel-title">{title}</div>}
          {description && <div className="panel-desc">{description}</div>}
        </div>
        {actions && <div className="panel-actions">{actions}</div>}
      </div>
    )}
    <div className="panel-body">{children}</div>
  </div>
);
