import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Drawer.css";
import * as React from "react";
import ReactDOM from "react-dom";
import { Icon } from "../Icon";
import { OverlayZIndexProvider, useOverlayLayer, useOverlayZIndex } from "../../utils/overlayStack";
import { usePortalContainer } from "../../utils/portal";

/** 抽屉正文允许透传的 data-* 属性。 */
type DataAttributes = {
  [K in `data-${string}`]?: string | number | boolean | undefined;
};

/** 抽屉正文包装节点可接收的原生属性。 */
type DrawerBodyProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "className" | "style"
> &
  DataAttributes;

/** 抽屉正文的边缘留白策略。 */
export type DrawerBodyInset = "safe" | "none";

export interface DrawerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "children" | "onClose"> {
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
  /** 正文容器的附加类名。 */
  bodyClassName?: string;
  /** 正文容器的内联样式。 */
  bodyStyle?: React.CSSProperties;
  /** 透传给正文容器的原生属性。 */
  bodyProps?: DrawerBodyProps;
  /** 正文容器的 overflow 快捷控制。 */
  bodyOverflow?: React.CSSProperties["overflow"];
  /**
   * 正文边缘留白策略。`safe` 会根据拟态阴影强度自动预留空间，
   * `none` 适合图片、表格等需要贴边展示的内容。
   */
  bodyInset?: DrawerBodyInset;
  /** Render the mask overlay. Default true. Set `false` for a non-blocking drawer. */
  mask?: boolean;
  /** Close when clicking the mask. Default true. Ignored when `mask` is false. */
  maskClosable?: boolean;
  /** Class name forwarded to the mask overlay. */
  maskClassName?: string;
  /** Inline style forwarded to the mask overlay. */
  maskStyle?: React.CSSProperties;
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
  /** 抽屉面板的附加类名；遮罩层请使用 `maskClassName`。 */
  className?: string;
}

const ANIM_MS = 280;

/** `Drawer` — slide-in panel from an edge. */
export const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(({
  open,
  onClose,
  placement = "right",
  size = 380,
  title,
  extra,
  footer,
  children,
  bodyClassName = "",
  bodyStyle,
  bodyProps,
  bodyOverflow,
  bodyInset = "safe",
  mask = true,
  maskClosable = true,
  maskClassName = "",
  maskStyle,
  keyboard = true,
  closable = true,
  closeIcon,
  destroyOnClose = false,
  afterOpenChange,
  zIndex,
  className = "",
  style,
  onClick,
  ...rest
}, ref) => {
  const portalContainer = usePortalContainer();
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const titleId = React.useId();
  const panelZIndex = useOverlayZIndex(open, zIndex);
  const [hasOpenedOnce, setHasOpenedOnce] = React.useState(open);
  React.useEffect(() => {
    if (open) setHasOpenedOnce(true);
  }, [open]);

  useOverlayLayer({
    open: open && portalContainer != null,
    containerRef: panelRef,
    zIndex: panelZIndex,
    onEscape: onClose,
    escapeEnabled: keyboard,
    trapFocus: mask,
    autoFocus: mask,
    restoreFocus: true,
    lockScroll: mask,
  });

  /** 同时维护内部面板引用和对外 ref。 */
  const setPanelRef = React.useCallback((node: HTMLDivElement | null) => {
    panelRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  }, [ref]);

  const prevOpen = React.useRef(open);
  const afterOpenChangeRef = React.useRef(afterOpenChange);
  afterOpenChangeRef.current = afterOpenChange;
  React.useEffect(() => {
    if (prevOpen.current !== open) {
      prevOpen.current = open;
      const id = window.setTimeout(() => afterOpenChangeRef.current?.(open), ANIM_MS);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  if (!portalContainer) return null;
  if (!hasOpenedOnce) return null;
  if (!open && destroyOnClose) return null;

  const isV = placement === "left" || placement === "right";
  const panelStyle: React.CSSProperties = isV
    ? { width: size, maxWidth: "92vw" }
    : { height: size, maxHeight: "80vh" };
  Object.assign(panelStyle, style);
  panelStyle.zIndex = panelZIndex;
  const overlayStyle: React.CSSProperties = { ...maskStyle, zIndex: panelZIndex - 1 };
  const drawerBodyStyle: React.CSSProperties | undefined =
    bodyOverflow == null ? bodyStyle : { overflow: bodyOverflow, ...bodyStyle };

  return ReactDOM.createPortal(
    <OverlayZIndexProvider zIndex={panelZIndex}>
      <>
        {mask && (
          <div
            className={["drawer-overlay", open ? "" : "hidden", maskClassName]
              .filter(Boolean)
              .join(" ")}
            style={overlayStyle}
            onClick={() => maskClosable && onClose?.()}
          />
        )}
        <div
          ref={setPanelRef}
          className={`drawer ${placement} ${open ? "" : "hidden"} ${className}`}
          style={panelStyle}
          onClick={(e) => {
            onClick?.(e);
            e.stopPropagation();
          }}
          role="dialog"
          aria-hidden={!open}
          aria-modal={mask || undefined}
          aria-labelledby={title ? titleId : undefined}
          tabIndex={-1}
          {...rest}
        >
          {(title || extra || closable) && (
            <div className="drawer-head">
              <div id={title ? titleId : undefined} className="drawer-title">{title}</div>
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
          <div
            {...bodyProps}
            className={["drawer-body", `inset-${bodyInset}`, bodyClassName]
              .filter(Boolean)
              .join(" ")}
            style={drawerBodyStyle}
          >
            {children}
          </div>
          {footer && <div className="drawer-foot">{footer}</div>}
        </div>
      </>
    </OverlayZIndexProvider>,
    portalContainer
  );
});
Drawer.displayName = "Drawer";
