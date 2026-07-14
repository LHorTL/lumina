import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Alert.css";
import * as React from "react";
import { Icon, renderIconSlot, type IconSlot } from "../Icon";
import { withComponentTheme, type ComponentThemeProps } from "../Theme/ComponentTheme";

export type AlertTone = "info" | "success" | "warning" | "danger";

export interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "children">,
    ComponentThemeProps {
  tone?: AlertTone;
  title?: React.ReactNode;
  children?: React.ReactNode;
  icon?: IconSlot;
  /** Controls the leading semantic icon. Defaults to `true`. */
  showIcon?: boolean;
  closable?: boolean;
  onClose?: () => void;
  /** Right-side action area, rendered after the content and before the close button. */
  action?: React.ReactNode;
  className?: string;
}

/** `Alert` — inline contextual message. */
const AlertBase = React.forwardRef<HTMLDivElement, AlertProps>(({
  tone = "info",
  title,
  children,
  icon,
  showIcon = true,
  closable,
  onClose,
  action,
  className = "",
  ...rest
}, ref) => {
  const [closed, setClosed] = React.useState(false);
  const iconNode: IconSlot =
    icon ?? (tone === "success" ? "check2" : tone === "warning" || tone === "danger" ? "alert" : "info");

  /** 关闭提示并通知外部监听者。 */
  const handleClose = () => {
    setClosed(true);
    onClose?.();
  };

  if (closed) return null;

  return (
    <div
      ref={ref}
      className={`alert ${tone} ${title ? "" : "no-title"} ${showIcon ? "" : "no-icon"} ${className}`}
      role="alert"
      {...rest}
    >
      {showIcon && (
        <span className="alert-ico">
          {renderIconSlot(iconNode, { size: 14 })}
        </span>
      )}
      <div className="alert-body">
        {title && <div className="alert-title">{title}</div>}
        {children && <div className="alert-desc">{children}</div>}
      </div>
      {action && <div className="alert-action">{action}</div>}
      {closable && (
        <button type="button" className="alert-close" onClick={handleClose} aria-label="关闭提示">
          <Icon name="x" size={12} />
        </button>
      )}
    </div>
  );
});
AlertBase.displayName = "Alert";

export const Alert = withComponentTheme(AlertBase, "Alert", "alert");
