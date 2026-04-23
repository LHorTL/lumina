import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./StatusBar.css";
import * as React from "react";

export interface StatusBarItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Optional leading node (usually an `<Icon />`). */
  icon?: React.ReactNode;
  /** Visual tone — shifts color only. */
  tone?: "default" | "muted" | "accent" | "success" | "warning" | "danger";
  /** Makes the item clickable (also renders as `<button>` when `onClick` is set). */
  onClick?: (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => void;
  children?: React.ReactNode;
}

/** `StatusBar.Item` — one inline slot. Put icon + text inside. */
export const StatusBarItem = React.forwardRef<HTMLElement, StatusBarItemProps>(({
  icon,
  tone = "default",
  onClick,
  className = "",
  children,
  ...rest
}, ref) => {
  const content = (
    <>
      {icon && <span className="statusbar-item-icon">{icon}</span>}
      {children != null && <span className="statusbar-item-label">{children}</span>}
    </>
  );
  const cls = `statusbar-item tone-${tone} ${onClick ? "clickable" : ""} ${className}`;
  if (onClick) {
    return (
      <button
        ref={ref as React.ForwardedRef<HTMLButtonElement>}
        type="button"
        className={cls}
        onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
      >
        {content}
      </button>
    );
  }
  return (
    <div ref={ref as React.ForwardedRef<HTMLDivElement>} className={cls} {...rest}>
      {content}
    </div>
  );
});
StatusBarItem.displayName = "StatusBarItem";

export interface StatusBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Left-aligned slot. */
  left?: React.ReactNode;
  /** Center slot — absolutely positioned, stays centered regardless of side widths. */
  center?: React.ReactNode;
  /** Right-aligned slot. */
  right?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * `StatusBar` — thin bottom bar for app state (branch, line/col, sync, etc.).
 * Pair with `TitleBar` to bracket the window chrome.
 *
 * @example
 * ```tsx
 * <StatusBar
 *   left={<StatusBar.Item icon={<Icon name="check" size={12} />} tone="success">Ready</StatusBar.Item>}
 *   right={<StatusBar.Item tone="muted">UTF-8</StatusBar.Item>}
 * />
 * ```
 */
const StatusBarBase = React.forwardRef<HTMLDivElement, StatusBarProps>(({
  left,
  center,
  right,
  className = "",
  children,
  ...rest
}, ref) => (
  <div ref={ref} className={`statusbar ${className}`} role="status" {...rest}>
    {left != null && <div className="statusbar-section left">{left}</div>}
    {center != null && <div className="statusbar-section center">{center}</div>}
    {children}
    {right != null && <div className="statusbar-section right">{right}</div>}
  </div>
));
StatusBarBase.displayName = "StatusBar";

export const StatusBar = StatusBarBase as typeof StatusBarBase & { Item: typeof StatusBarItem };

StatusBar.Item = StatusBarItem;
