import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Card.css";
import * as React from "react";

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Visual variant. `raised` protrudes; `sunken` recesses; `flat` is subtle. */
  variant?: "raised" | "sunken" | "flat";
  /** Inner padding. */
  padding?: "none" | "sm" | "md" | "lg";
  /** When true, the card raises and lifts on hover. */
  hoverable?: boolean;
  /** Optional card heading. */
  title?: React.ReactNode;
  /** Secondary text shown under `title`. */
  description?: React.ReactNode;
  /** Action slot aligned to the card heading. */
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * `Card` — neumorphic surface container. Use to group related content.
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({
    variant = "raised",
    padding = "md",
    hoverable,
    title,
    description,
    actions,
    className = "",
    children,
    ...rest
  }, ref) => {
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
        {(title || description || actions) && (
          <div className="card-head">
            <div className="card-titles">
              {title && <div className="card-title">{title}</div>}
              {description && <div className="card-desc">{description}</div>}
            </div>
            {actions && <div className="card-actions">{actions}</div>}
          </div>
        )}
        <div className="card-body">{children}</div>
      </div>
    );
  }
);
Card.displayName = "Card";
