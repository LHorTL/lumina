import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Drawer.css";
import * as React from "react";
import ReactDOM from "react-dom";
import { Icon } from "../Icon";

export interface DrawerProps {
  /** Whether the drawer is visible. */
  open: boolean;
  /** Close callback (triggered by mask click / close button / Esc). */
  onClose?: () => void;
  /** Which edge the drawer slides from. */
  placement?: "left" | "right" | "top" | "bottom";
  /** Width (for left/right) or height (for top/bottom). Number → px. */
  size?: number | string;
  /** Header title. */
  title?: React.ReactNode;
  /** Extra content rendered to the right of the title (e.g. action buttons). */
  extra?: React.ReactNode;
  /** Footer content. */
  footer?: React.ReactNode;
  /** Drawer body. */
  children?: React.ReactNode;
  /** Render the mask overlay. Default true. Set `false` for a non-blocking drawer. */
  mask?: boolean;
  /** Close when clicking the mask. Default true. Ignored when `mask` is false. */
  maskClosable?: boolean;
  /** Close on Escape key. Default true. */
  keyboard?: boolean;
  /** Show the close (×) button in the header. Default true. */
  closable?: boolean;
  /** Override the close icon node. */
  closeIcon?: React.ReactNode;
  /**
   * When true the drawer's children are unmounted every time it closes.
   * Default `false` — children stay mounted across open/close cycles so
   * internal state (form fields, scroll position) is preserved.
   */
  destroyOnClose?: boolean;
  /** Fires after the open/close animation finishes. */
  afterOpenChange?: (open: boolean) => void;
  /** Stack index for nested drawers. */
  zIndex?: number;
  className?: string;
}

const ANIM_MS = 280;

/** `Drawer` — slide-in panel from an edge. */
export const Drawer: React.FC<DrawerProps> = ({
  open,
  onClose,
  placement = "right",
  size = 380,
  title,
  extra,
  footer,
  children,
  mask = true,
  maskClosable = true,
  keyboard = true,
  closable = true,
  closeIcon,
  destroyOnClose = false,
  afterOpenChange,
  zIndex,
  className = "",
}) => {
  const [hasOpenedOnce, setHasOpenedOnce] = React.useState(open);
  React.useEffect(() => {
    if (open) setHasOpenedOnce(true);
  }, [open]);

  React.useEffect(() => {
    if (!open || !keyboard) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, keyboard, onClose]);

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

  const isV = placement === "left" || placement === "right";
  const style: React.CSSProperties = isV ? { width: size } : { height: size };
  if (zIndex != null) style.zIndex = zIndex;

  return ReactDOM.createPortal(
    <>
      {mask && (
        <div
          className={`drawer-overlay ${open ? "" : "hidden"}`}
          style={zIndex != null ? { zIndex: zIndex - 1 } : undefined}
          onClick={() => maskClosable && onClose?.()}
        />
      )}
      <div
        className={`drawer ${placement} ${open ? "" : "hidden"} ${className}`}
        style={style}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-hidden={!open}
      >
        {(title || extra || closable) && (
          <div className="drawer-head">
            <div className="drawer-title">{title}</div>
            <div className="drawer-head-right">
              {extra}
              {closable && (
                <button
                  type="button"
                  className="drawer-close"
                  onClick={onClose}
                  aria-label="Close"
                >
                  {closeIcon ?? <Icon name="x" size={16} />}
                </button>
              )}
            </div>
          </div>
        )}
        <div className="drawer-body">{children}</div>
        {footer && <div className="drawer-foot">{footer}</div>}
      </div>
    </>,
    document.body
  );
};
