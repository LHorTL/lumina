import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Modal.css";
import * as React from "react";
import ReactDOM from "react-dom";
import { Icon } from "../Icon";
import { Button, type ButtonProps } from "../Button";

export interface ModalProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "children" | "onClose"> {
  /** Whether the modal is visible. */
  open: boolean;
  /** Fired by mask click / close button / Esc. Also the fallback for cancel. */
  onClose?: () => void;
  /** Dedicated Cancel callback. Falls back to `onClose` when omitted. */
  onCancel?: () => void;
  /** Fired when the default OK button is clicked. */
  onOk?: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /**
   * Footer content. Pass `null` to hide the footer, or a custom node to
   * replace the default OK / Cancel buttons.
   */
  footer?: React.ReactNode;
  children?: React.ReactNode;
  width?: number | string;
  /** Show the close (×) button. Default true. */
  closable?: boolean;
  /** Override the close icon node. */
  closeIcon?: React.ReactNode;
  /** Close when clicking the mask. Default true. */
  maskClosable?: boolean;
  /** Close on Escape key. Default true. */
  escClosable?: boolean;
  /** Label for the default OK button. */
  okText?: React.ReactNode;
  /** Label for the default Cancel button. */
  cancelText?: React.ReactNode;
  /** Extra props forwarded to the default OK button. */
  okButtonProps?: Partial<ButtonProps>;
  /** Extra props forwarded to the default Cancel button. */
  cancelButtonProps?: Partial<ButtonProps>;
  /** Show a spinner on the OK button (e.g. while an async submit is running). */
  confirmLoading?: boolean;
  /**
   * When true the modal's children are unmounted every time it closes.
   * Default `false` — children stay mounted so internal state survives
   * reopens, matching antd's default.
   */
  destroyOnClose?: boolean;
  /** Fires after the open/close animation finishes. */
  afterOpenChange?: (open: boolean) => void;
  /** Override the z-index of the overlay. */
  zIndex?: number;
  className?: string;
}

const ANIM_MS = 280;

/** `Modal` — centered dialog with mask. Renders into `document.body`. */
export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(({
  open,
  onClose,
  onCancel,
  onOk,
  title,
  description,
  footer,
  children,
  width = 440,
  closable = true,
  closeIcon,
  maskClosable = true,
  escClosable = true,
  okText = "确定",
  cancelText = "取消",
  okButtonProps,
  cancelButtonProps,
  confirmLoading,
  destroyOnClose = false,
  afterOpenChange,
  zIndex,
  className = "",
  style,
  onClick,
  ...rest
}, ref) => {
  const [hasOpenedOnce, setHasOpenedOnce] = React.useState(open);
  React.useEffect(() => {
    if (open) setHasOpenedOnce(true);
  }, [open]);

  const handleCancel = React.useCallback(() => {
    if (onCancel) onCancel();
    else onClose?.();
  }, [onCancel, onClose]);

  React.useEffect(() => {
    if (!open || !escClosable) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCancel();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, escClosable, handleCancel]);

  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current !== open) {
      prevOpen.current = open;
      if (afterOpenChange) {
        const id = window.setTimeout(() => afterOpenChange(open), ANIM_MS);
        return () => window.clearTimeout(id);
      }
    }
  }, [open, afterOpenChange]);

  if (typeof document === "undefined") return null;
  if (!hasOpenedOnce) return null;
  if (!open && destroyOnClose) return null;

  const overlayStyle: React.CSSProperties | undefined =
    zIndex != null ? { zIndex } : undefined;

  const defaultFooter = (
    <>
      <Button variant="ghost" onClick={handleCancel} {...cancelButtonProps}>
        {cancelText}
      </Button>
      <Button
        variant="primary"
        loading={confirmLoading}
        onClick={() => onOk?.()}
        {...okButtonProps}
      >
        {okText}
      </Button>
    </>
  );

  return ReactDOM.createPortal(
    <div
      className={`modal-overlay ${open ? "" : "hidden"} ${className}`}
      style={overlayStyle}
      onClick={() => maskClosable && handleCancel()}
      role="presentation"
    >
      <div
        ref={ref}
        className="modal"
        style={{ width, ...style }}
        onClick={(e) => {
          onClick?.(e);
          e.stopPropagation();
        }}
        role="dialog"
        aria-modal
        aria-hidden={!open}
        {...rest}
      >
        {(title || description || closable) && (
          <div className="modal-head">
            <div className="modal-titles">
              {title && <div className="modal-title">{title}</div>}
              {description && <div className="modal-desc">{description}</div>}
            </div>
            {closable && (
              <button
                type="button"
                className="modal-close"
                onClick={handleCancel}
                aria-label="Close"
              >
                {closeIcon ?? <Icon name="x" size={16} />}
              </button>
            )}
          </div>
        )}
        <div className="modal-body">{children}</div>
        {footer === null ? null : (
          <div className="modal-foot">{footer ?? defaultFooter}</div>
        )}
      </div>
    </div>,
    document.body
  );
});
Modal.displayName = "Modal";
