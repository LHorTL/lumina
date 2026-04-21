import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Popover.css";
import * as React from "react";
import { createPortal } from "react-dom";
import { useFloating } from "../../utils/useFloating";

export interface PopoverProps {
  /** Popover body content. */
  content: React.ReactNode;
  /** Optional title rendered above content. */
  title?: React.ReactNode;
  /** Preferred placement relative to the trigger. */
  placement?: "top" | "bottom" | "left" | "right";
  /** How the popover is triggered. */
  trigger?: "click" | "hover";
  /** Show a small arrow pointing at the trigger. */
  arrow?: boolean;
  /** Show a close button in the header (click trigger only). */
  closable?: boolean;
  /** Panel width in px, or `"auto"` to fit content. */
  width?: number | "auto";
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean;
  /** Controlled open state. */
  open?: boolean;
  /** Callback when visibility changes. */
  onOpenChange?: (open: boolean) => void;
  /** Trigger element. */
  children: React.ReactElement;
  className?: string;
}

/**
 * `Popover` — rich content bubble with optional title, arrow, and close button.
 *
 * @example
 * <Popover title="Confirm" content={<p>Are you sure?</p>} arrow>
 *   <Button>Delete</Button>
 * </Popover>
 */
export const Popover: React.FC<PopoverProps> = ({
  content,
  title,
  placement = "bottom",
  trigger = "click",
  arrow = false,
  closable = false,
  width,
  defaultOpen = false,
  open,
  onOpenChange,
  children,
  className = "",
}) => {
  const [inner, setInner] = React.useState(defaultOpen);
  const isControlled = open !== undefined;
  const show = isControlled ? open! : inner;

  const panelWidth = width === "auto" ? 160 : (width ?? 240);

  const {
    triggerRef,
    floatingRef,
    floatingStyle,
    placement: resolved,
  } = useFloating<HTMLSpanElement, HTMLDivElement>({
    open: show,
    placement,
    panelWidth,
    panelHeight: 160,
    alignCross: "center",
  });

  const set = React.useCallback((v: boolean) => {
    if (!isControlled) setInner(v);
    onOpenChange?.(v);
  }, [isControlled, onOpenChange]);

  React.useEffect(() => {
    if (trigger !== "click" || !show) return;
    const h = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (floatingRef.current?.contains(t)) return;
      set(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [show, trigger, set, triggerRef, floatingRef]);

  const hoverTimeout = React.useRef<number | undefined>();

  const interact =
    trigger === "hover"
      ? {
          onMouseEnter: () => {
            window.clearTimeout(hoverTimeout.current);
            set(true);
          },
          onMouseLeave: () => {
            hoverTimeout.current = window.setTimeout(() => set(false), 100);
          },
        }
      : { onClick: () => set(!show) };

  const panelHover =
    trigger === "hover"
      ? {
          onMouseEnter: () => window.clearTimeout(hoverTimeout.current),
          onMouseLeave: () => {
            hoverTimeout.current = window.setTimeout(() => set(false), 100);
          },
        }
      : {};

  const widthStyle = width === "auto" ? {} : { width: width ?? undefined, minWidth: width ? undefined : 220 };

  return (
    <>
      <span
        ref={triggerRef}
        className={`popover-anchor ${className}`}
        style={{ display: "inline-flex", alignSelf: "flex-start" }}
        {...interact}
      >
        {children}
      </span>
      {show && typeof document !== "undefined" &&
        createPortal(
          <div
            ref={floatingRef}
            className={`popover popover-${resolved}`}
            style={{ ...floatingStyle, ...widthStyle }}
            {...panelHover}
          >
            {(title || closable) && (
              <div className="popover-header">
                {title && <div className="popover-title">{title}</div>}
                {closable && (
                  <button
                    className="popover-close"
                    onClick={() => set(false)}
                    aria-label="Close"
                  >
                    ×
                  </button>
                )}
              </div>
            )}
            <div className="popover-body">{content}</div>
            {arrow && <span className={`popover-arrow popover-arrow-${resolved}`} />}
          </div>,
          document.body
        )}
    </>
  );
};
