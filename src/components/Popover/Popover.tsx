import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Popover.css";
import * as React from "react";
import { createPortal } from "react-dom";
import { useFloating, type Placement } from "../../utils/useFloating";

export type PopoverPlacement =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "topLeft"
  | "topRight"
  | "bottomLeft"
  | "bottomRight"
  | "leftTop"
  | "leftBottom"
  | "rightTop"
  | "rightBottom";

export interface PopoverProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "title" | "children" | "content"> {
  /** Popover body content. */
  content?: React.ReactNode;
  /** Optional title rendered above content. */
  title?: React.ReactNode;
  /** Preferred placement relative to the trigger. */
  placement?: PopoverPlacement;
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
  /** Controlled visibility alias. */
  visible?: boolean;
  /** Callback when visibility changes. */
  onOpenChange?: (open: boolean) => void;
  onVisibleChange?: (visible: boolean) => void;
  /** Trigger element. */
  children: React.ReactElement;
  className?: string;
  /** Class for the popped-out panel. */
  overlayClassName?: string;
  /** Alias used by some popup APIs. */
  popupClassName?: string;
}

const normalizePlacement = (
  placement: PopoverPlacement
): { placement: Placement; alignCross: "start" | "center" | "end" } => {
  const base = placement.startsWith("top")
    ? "top"
    : placement.startsWith("bottom")
      ? "bottom"
      : placement.startsWith("left")
        ? "left"
        : placement.startsWith("right")
          ? "right"
          : placement;
  const alignCross =
    placement.endsWith("Left") || placement.endsWith("Top")
      ? "start"
      : placement.endsWith("Right") || placement.endsWith("Bottom")
        ? "end"
        : "center";
  return { placement: base as Placement, alignCross };
};

/**
 * `Popover` — rich content bubble with optional title, arrow, and close button.
 *
 * @example
 * <Popover title="Confirm" content={<p>Are you sure?</p>} arrow>
 *   <Button>Delete</Button>
 * </Popover>
 */
export const Popover = React.forwardRef<HTMLSpanElement, PopoverProps>(({
  content,
  title,
  placement = "bottom",
  trigger = "click",
  arrow = false,
  closable = false,
  width,
  defaultOpen = false,
  open,
  visible,
  onOpenChange,
  onVisibleChange,
  children,
  className = "",
  overlayClassName = "",
  popupClassName = "",
  onClick,
  onMouseEnter,
  onMouseLeave,
  ...rest
}, ref) => {
  const [inner, setInner] = React.useState(defaultOpen);
  const controlledOpen = open ?? visible;
  const isControlled = controlledOpen !== undefined;
  const show = isControlled ? controlledOpen! : inner;

  const panelWidth = width === "auto" ? 160 : (width ?? 240);
  const normalized = normalizePlacement(placement);

  const {
    triggerRef,
    floatingRef,
    floatingStyle,
    placement: resolved,
  } = useFloating<HTMLSpanElement, HTMLDivElement>({
    open: show,
    placement: normalized.placement,
    panelWidth,
    panelHeight: 160,
    alignCross: normalized.alignCross,
  });

  const set = React.useCallback((v: boolean) => {
    if (!isControlled) setInner(v);
    onOpenChange?.(v);
    onVisibleChange?.(v);
  }, [isControlled, onOpenChange, onVisibleChange]);

  const setTriggerRef = React.useCallback(
    (node: HTMLSpanElement | null) => {
      (triggerRef as React.MutableRefObject<HTMLSpanElement | null>).current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref, triggerRef]
  );

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
        ref={setTriggerRef}
        className={`popover-anchor ${className}`}
        style={{ display: "inline-flex", alignSelf: "flex-start" }}
        onClick={(e) => {
          onClick?.(e);
          if ("onClick" in interact) interact.onClick?.();
        }}
        onMouseEnter={(e) => {
          onMouseEnter?.(e);
          if ("onMouseEnter" in interact) interact.onMouseEnter?.();
        }}
        onMouseLeave={(e) => {
          onMouseLeave?.(e);
          if ("onMouseLeave" in interact) interact.onMouseLeave?.();
        }}
        {...rest}
      >
        {children}
      </span>
      {show && typeof document !== "undefined" &&
        createPortal(
          <div
            ref={floatingRef}
            className={`popover popover-${resolved} ${overlayClassName} ${popupClassName}`}
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
});
Popover.displayName = "Popover";
