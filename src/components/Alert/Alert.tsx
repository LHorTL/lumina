import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Alert.css";
import * as React from "react";
import { Icon, type IconName } from "../Icon";

export type AlertTone = "info" | "success" | "warning" | "danger";

export interface AlertProps {
  tone?: AlertTone;
  title?: React.ReactNode;
  children?: React.ReactNode;
  icon?: IconName;
  closable?: boolean;
  onClose?: () => void;
  className?: string;
}

/** `Alert` — inline contextual message. */
export const Alert: React.FC<AlertProps> = ({
  tone = "info",
  title,
  children,
  icon,
  closable,
  onClose,
  className = "",
}) => {
  const iconName: IconName =
    icon ?? (tone === "success" ? "check2" : tone === "warning" || tone === "danger" ? "alert" : "info");
  return (
    <div className={`alert ${tone} ${title ? "" : "no-title"} ${className}`} role="alert">
      <span className="alert-ico">
        <Icon name={iconName} size={14} />
      </span>
      <div className="alert-body">
        {title && <div className="alert-title">{title}</div>}
        {children && <div className="alert-desc">{children}</div>}
      </div>
      {closable && (
        <button type="button" className="alert-close" onClick={onClose} aria-label="Dismiss">
          <Icon name="x" size={12} />
        </button>
      )}
    </div>
  );
};
