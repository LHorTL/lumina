import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Card.css";
import * as React from "react";
import { Spin } from "../Spin";

type DataAttributes = {
  [K in `data-${string}`]?: string | number | boolean | undefined;
};
type CardBodyProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "className" | "style"
> &
  DataAttributes;

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
  /** Make the card and its body fill the available height. */
  fill?: boolean;
  /** Body layout strategy. */
  bodyLayout?: "block" | "stack" | "fill" | "center";
  /** Class name forwarded to the card body wrapper. */
  bodyClassName?: string;
  /** Inline style forwarded to the card body wrapper. */
  bodyStyle?: React.CSSProperties;
  /** Extra DOM props forwarded to the card body wrapper. */
  bodyProps?: CardBodyProps;
  /** Show a built-in loading overlay above the body content. */
  loading?: boolean;
  /** Custom overlay content shown while `loading` is true. */
  loadingOverlay?: React.ReactNode;
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
    fill = false,
    bodyLayout,
    bodyClassName = "",
    bodyStyle,
    bodyProps,
    loading = false,
    loadingOverlay,
    className = "",
    children,
    ...rest
  }, ref) => {
    const resolvedBodyLayout = bodyLayout ?? (fill ? "fill" : "block");
    const cls = [
      "card",
      variant,
      padding !== "md" && `pad-${padding}`,
      fill && "fill",
      hoverable && "hoverable",
      loading && "loading",
      className,
    ]
      .filter(Boolean)
      .join(" ");
    const bodyCls = [
      "card-body",
      resolvedBodyLayout !== "block" && `body-${resolvedBodyLayout}`,
      loading && "loading",
      bodyClassName,
    ]
      .filter(Boolean)
      .join(" ");
    return (
      <div ref={ref} className={cls} aria-busy={loading || undefined} {...rest}>
        {(title || description || actions) && (
          <div className="card-head">
            <div className="card-titles">
              {title && <div className="card-title">{title}</div>}
              {description && <div className="card-desc">{description}</div>}
            </div>
            {actions && <div className="card-actions">{actions}</div>}
          </div>
        )}
        <div {...bodyProps} className={bodyCls} style={bodyStyle}>
          {children}
          {loading && (
            <div className="card-loading-overlay" aria-live="polite">
              {loadingOverlay ?? <Spin tip="加载中..." />}
            </div>
          )}
        </div>
      </div>
    );
  }
);
Card.displayName = "Card";
