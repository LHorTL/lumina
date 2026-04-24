import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Tooltip.css";
import * as React from "react";
import { createPortal } from "react-dom";
import { useFloating, type Placement } from "../../utils/useFloating";

export type TooltipPlacement =
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

export interface TooltipProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children" | "content" | "title"> {
  content?: React.ReactNode;
  /** Alias for `content`. */
  title?: React.ReactNode;
  placement?: TooltipPlacement;
  children: React.ReactElement;
  delay?: number;
  disabled?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Controlled visibility alias. */
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  /** Class for the popped-out bubble. */
  overlayClassName?: string;
  /** Alias used by some popup APIs. */
  popupClassName?: string;
}

const normalizePlacement = (
  placement: TooltipPlacement
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

/** `Tooltip` — hover/focus text bubble. */
export const Tooltip = React.forwardRef<HTMLSpanElement, TooltipProps>(({
  content,
  title,
  placement = "top",
  children,
  delay = 250,
  disabled,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  visible,
  onVisibleChange,
  overlayClassName = "",
  popupClassName = "",
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  ...rest
}, ref) => {
  const [innerShow, setInnerShow] = React.useState(defaultOpen);
  const t = React.useRef<number | undefined>();
  const controlledShow = openProp ?? visible;
  const show = controlledShow ?? innerShow;
  const resolvedContent = content ?? title;
  const disabledTooltip = disabled || resolvedContent == null || resolvedContent === "";

  const setShow = React.useCallback((next: boolean) => {
    if (controlledShow === undefined) setInnerShow(next);
    onOpenChange?.(next);
    onVisibleChange?.(next);
  }, [controlledShow, onOpenChange, onVisibleChange]);

  const open = () => {
    if (disabledTooltip) return;
    window.clearTimeout(t.current);
    t.current = window.setTimeout(() => setShow(true), delay);
  };
  const close = () => {
    window.clearTimeout(t.current);
    setShow(false);
  };

  const normalized = normalizePlacement(placement);
  const { triggerRef, floatingStyle, placement: resolved } = useFloating<HTMLSpanElement>({
    open: show,
    placement: normalized.placement,
    panelWidth: 160,
    panelHeight: 32,
    alignCross: normalized.alignCross,
  });

  const setTriggerRef = React.useCallback(
    (node: HTMLSpanElement | null) => {
      (triggerRef as React.MutableRefObject<HTMLSpanElement | null>).current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref, triggerRef]
  );

  return (
    <>
      <span
        ref={setTriggerRef}
        className="tip-anchor"
        onMouseEnter={(e) => {
          onMouseEnter?.(e);
          open();
        }}
        onMouseLeave={(e) => {
          onMouseLeave?.(e);
          close();
        }}
        onFocus={(e) => {
          onFocus?.(e);
          open();
        }}
        onBlur={(e) => {
          onBlur?.(e);
          close();
        }}
        {...rest}
      >
        {children}
      </span>
      {show && typeof document !== "undefined" &&
        createPortal(
          <span className={`tip ${resolved} ${overlayClassName} ${popupClassName}`} style={floatingStyle}>
            {resolvedContent}
          </span>,
          document.body
        )}
    </>
  );
});
Tooltip.displayName = "Tooltip";
