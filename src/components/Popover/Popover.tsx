import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Popover.css";
import * as React from "react";
import { createPortal } from "react-dom";
import { useFloating, type Placement } from "../../utils/useFloating";
import { useOverlayLayer } from "../../utils/overlayStack";
import { usePortalContainer } from "../../utils/portal";
import {
  useComponentPortalTheme,
  withComponentTheme,
  type ComponentThemeProps,
} from "../Theme/ComponentTheme";

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
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "title" | "children" | "content">,
    ComponentThemeProps {
  /** Popover body content. */
  content?: React.ReactNode;
  /** Optional title rendered above content. */
  title?: React.ReactNode;
  /** Preferred placement relative to the trigger. */
  placement?: PopoverPlacement;
  /** How the popover is triggered. */
  trigger?: "click" | "hover" | "focus";
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
const PopoverBase = React.forwardRef<HTMLSpanElement, PopoverProps>(({
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
  onFocus,
  onBlur,
  "aria-label": ariaLabel,
  style,
  ...rest
}, ref) => {
  const portalContainer = usePortalContainer();
  const portalTheme = useComponentPortalTheme("Popover");
  const [inner, setInner] = React.useState(defaultOpen);
  const hoverTimeout = React.useRef<number | undefined>();
  const nestedPointerEvents = React.useRef(new WeakSet<Event>());
  const popoverId = React.useId();
  const titleId = React.useId();
  const controlledOpen = open ?? visible;
  const isControlled = controlledOpen !== undefined;
  const show = isControlled ? controlledOpen! : inner;

  const themedPopupStyle = portalTheme.styles.popup;
  const themedPanelWidth = themedPopupStyle?.width ?? themedPopupStyle?.minWidth;
  const panelWidth =
    width === "auto"
      ? 160
      : width ?? (typeof themedPanelWidth === "number" ? themedPanelWidth : 240);
  const normalized = normalizePlacement(placement);

  const {
    triggerRef,
    floatingRef,
    floatingStyle,
    placement: resolved,
    zIndex: panelZIndex,
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

  /** 关闭浮层并把键盘焦点送回实际触发控件。 */
  const closeFromEscape = React.useCallback(() => {
    set(false);
    window.requestAnimationFrame(() => {
      const focusTarget = triggerRef.current?.querySelector<HTMLElement>(
        "button, a[href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
      );
      (focusTarget ?? triggerRef.current)?.focus();
    });
  }, [set, triggerRef]);

  useOverlayLayer({
    open: show && portalContainer != null,
    containerRef: floatingRef,
    ownerRef: triggerRef,
    zIndex: panelZIndex,
    onEscape: closeFromEscape,
  });

  const setTriggerRef = React.useCallback(
    (node: HTMLSpanElement | null) => {
      (triggerRef as React.MutableRefObject<HTMLSpanElement | null>).current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref, triggerRef]
  );

  React.useEffect(() => {
    if (trigger !== "click" || !show || !portalContainer) return;
    const h = (e: MouseEvent) => {
      if (nestedPointerEvents.current.has(e)) return;
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (floatingRef.current?.contains(t)) return;
      set(false);
    };
    const doc = portalContainer.ownerDocument;
    doc.addEventListener("mousedown", h);
    return () => doc.removeEventListener("mousedown", h);
  }, [show, trigger, set, triggerRef, floatingRef, portalContainer]);

  React.useEffect(() => () => window.clearTimeout(hoverTimeout.current), []);

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
      : trigger === "click"
        ? { onClick: () => set(!show) }
        : {};

  const panelHover =
    trigger === "hover"
      ? {
          onMouseEnter: () => window.clearTimeout(hoverTimeout.current),
          onMouseLeave: () => {
            hoverTimeout.current = window.setTimeout(() => set(false), 100);
          },
        }
      : {};

  /** 判断焦点是否仍位于触发器或浮层内部。 */
  const focusRemainsInside = (next: EventTarget | null): boolean => {
    const node = next as Node | null;
    return !!node && (!!triggerRef.current?.contains(node) || !!floatingRef.current?.contains(node));
  };

  const triggerChild = React.cloneElement(children, {
    "aria-haspopup": children.props["aria-haspopup"] ?? "dialog",
    "aria-expanded": show,
    "aria-controls": show ? popoverId : undefined,
  } as React.HTMLAttributes<HTMLElement>);

  const hasThemedPopupWidth =
    themedPopupStyle?.width != null ||
    themedPopupStyle?.minWidth != null ||
    themedPopupStyle?.maxWidth != null;
  const widthStyle: React.CSSProperties =
    width === "auto"
      ? {}
      : width !== undefined
        ? { width }
        : hasThemedPopupWidth
          ? {}
          : { minWidth: 220 };

  return (
    <>
      <span
        ref={setTriggerRef}
        className={`popover-anchor ${className}`}
        style={{ display: "inline-flex", alignSelf: "flex-start", ...style }}
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
        onFocus={(e) => {
          onFocus?.(e);
          if (trigger === "hover" || trigger === "focus") {
            window.clearTimeout(hoverTimeout.current);
            set(true);
          }
        }}
        onBlur={(e) => {
          onBlur?.(e);
          if ((trigger === "hover" || trigger === "focus") && !focusRemainsInside(e.relatedTarget)) {
            hoverTimeout.current = window.setTimeout(() => set(false), 100);
          }
        }}
        aria-label={ariaLabel}
        {...rest}
      >
        {triggerChild}
      </span>
      {show && portalContainer &&
        createPortal(
          <div
            ref={floatingRef}
            id={popoverId}
            className={`popover popover-${resolved} ${overlayClassName} ${popupClassName}`}
            {...portalTheme.dataAttributes}
            style={{
              ...floatingStyle,
              ...portalTheme.style,
              ...portalTheme.styles.popup,
              ...widthStyle,
            }}
            role="dialog"
            aria-labelledby={title ? titleId : undefined}
            aria-label={!title ? ariaLabel : undefined}
            tabIndex={-1}
            onMouseDownCapture={(e) => nestedPointerEvents.current.add(e.nativeEvent)}
            onFocusCapture={() => window.clearTimeout(hoverTimeout.current)}
            onBlurCapture={(e) => {
              if ((trigger === "hover" || trigger === "focus") && !focusRemainsInside(e.relatedTarget)) {
                hoverTimeout.current = window.setTimeout(() => set(false), 100);
              }
            }}
            {...panelHover}
          >
            {(title || closable) && (
              <div className="popover-header">
                {title && <div id={titleId} className="popover-title">{title}</div>}
                {closable && (
                  <button
                    type="button"
                    className="popover-close"
                    onClick={() => set(false)}
                    aria-label="Close"
                  >
                    ×
                  </button>
                )}
              </div>
            )}
            <div className="popover-body" style={portalTheme.styles.body}>{content}</div>
            {arrow && <span className={`popover-arrow popover-arrow-${resolved}`} />}
          </div>,
          portalContainer
        )}
    </>
  );
});
PopoverBase.displayName = "Popover";

export const Popover = withComponentTheme(PopoverBase, "Popover", "popover");
