import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Modal.css";
import * as React from "react";
import ReactDOM from "react-dom";
import { Icon } from "../Icon";
import { Button } from "../Button";

export interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  width?: number | string;
  /** Close when clicking the mask. Default true. */
  maskClosable?: boolean;
  /** Close on Escape key. Default true. */
  escClosable?: boolean;
  className?: string;
}

/** `Modal` — centered dialog with mask. Renders into `document.body`. */
export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  description,
  footer,
  children,
  width = 440,
  maskClosable = true,
  escClosable = true,
  className = "",
}) => {
  React.useEffect(() => {
    if (!open || !escClosable) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, escClosable, onClose]);

  if (!open || typeof document === "undefined") return null;
  return ReactDOM.createPortal(
    <div className={`modal-overlay ${className}`} onClick={() => maskClosable && onClose?.()}>
      <div className="modal" style={{ width }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-titles">
            {title && <div className="modal-title">{title}</div>}
            {description && <div className="modal-desc">{description}</div>}
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <Icon name="x" size={16} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer !== undefined ? (
          <div className="modal-foot">{footer}</div>
        ) : (
          <div className="modal-foot">
            <Button variant="ghost" onClick={onClose}>取消</Button>
            <Button variant="primary" onClick={onClose}>确定</Button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export interface DrawerProps extends Omit<ModalProps, "width"> {
  /** Edge the drawer slides from. */
  placement?: "left" | "right" | "top" | "bottom";
  size?: number | string;
}

/** `Drawer` — slide-in panel from an edge. */
export const Drawer: React.FC<DrawerProps> = ({
  open,
  onClose,
  placement = "right",
  size = 380,
  title,
  footer,
  children,
  maskClosable = true,
  className = "",
}) => {
  if (!open || typeof document === "undefined") return null;
  const isV = placement === "left" || placement === "right";
  const style: React.CSSProperties = isV ? { width: size } : { height: size };
  return ReactDOM.createPortal(
    <>
      <div className="drawer-overlay" onClick={() => maskClosable && onClose?.()} />
      <div className={`drawer ${placement} ${className}`} style={style} onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className="drawer-head">
            <div className="drawer-title">{title}</div>
            <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
              <Icon name="x" size={16} />
            </button>
          </div>
        )}
        <div className="drawer-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </>,
    document.body
  );
};
