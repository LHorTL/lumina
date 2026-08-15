import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Modal.css";
import * as React from "react";
import ReactDOM from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { Icon } from "../Icon";
import { Button, type ButtonProps } from "../Button";
import { OverlayZIndexProvider, useOverlayLayer, useOverlayZIndex } from "../../utils/overlayStack";
import { usePortalContainer } from "../../utils/portal";
import {
  InternalComponentThemePart,
  useComponentPortalTheme,
  withComponentTheme,
  type ComponentThemeProps,
} from "../Theme/ComponentTheme";

/** 弹窗正文允许透传的 data-* 属性。 */
type DataAttributes = {
  [K in `data-${string}`]?: string | number | boolean | undefined;
};
/** 弹窗正文包装节点可接收的原生属性。 */
type ModalBodyProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "className" | "style"
> &
  DataAttributes;

/** 弹窗正文的边缘留白策略。 */
export type ModalBodyInset = "safe" | "none";

export interface ModalProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "children" | "onClose">,
    ComponentThemeProps {
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
  /** Class name forwarded to the mask overlay. */
  maskClassName?: string;
  /** Inline style forwarded to the mask overlay. */
  maskStyle?: React.CSSProperties;
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
  /** Class name forwarded to the modal body wrapper. */
  bodyClassName?: string;
  /** Inline style forwarded to the modal body wrapper. */
  bodyStyle?: React.CSSProperties;
  /** Extra DOM props forwarded to the modal body wrapper. */
  bodyProps?: ModalBodyProps;
  /** Convenience overflow control for the body wrapper. */
  bodyOverflow?: React.CSSProperties["overflow"];
  /**
   * 正文边缘留白策略。`safe` 会根据拟态阴影强度自动预留空间，
   * `none` 适合图片、表格等需要贴边展示的内容。
   */
  bodyInset?: ModalBodyInset;
  /**
   * When true the modal's children are unmounted every time it closes.
   * Default `false` — children stay mounted so internal state survives
   * reopens.
   */
  destroyOnClose?: boolean;
  /** Fires after the open/close animation finishes. */
  afterOpenChange?: (open: boolean) => void;
  /** Override the z-index of the overlay. */
  zIndex?: number;
  /** 对话框面板的附加类名；遮罩层请使用 `maskClassName`。 */
  className?: string;
}

export type ModalStaticKind = "confirm" | "info" | "success" | "warning" | "error";

export interface ModalStaticConfig
  extends Omit<
    ModalProps,
    "open" | "onClose" | "onOk" | "onCancel" | "children" | "afterOpenChange" | "content"
  > {
  content?: React.ReactNode;
  children?: React.ReactNode;
  /** Override the semantic icon. Pass `false` to hide it. */
  icon?: React.ReactNode | false;
  /** Whether to show Cancel + OK. Defaults to true for confirm, false for the other static methods. */
  okCancel?: boolean;
  onOk?: () => void | boolean | Promise<void | boolean>;
  onCancel?: () => void;
}

export interface ModalStaticHandle {
  destroy: () => void;
  update: (
    config:
      | Partial<ModalStaticConfig>
      | ((prev: ModalStaticConfig) => Partial<ModalStaticConfig>)
  ) => void;
}

export interface ModalStaticFunctions {
  confirm: (config: ModalStaticConfig) => ModalStaticHandle;
  info: (config: ModalStaticConfig) => ModalStaticHandle;
  success: (config: ModalStaticConfig) => ModalStaticHandle;
  warning: (config: ModalStaticConfig) => ModalStaticHandle;
  warn: (config: ModalStaticConfig) => ModalStaticHandle;
  error: (config: ModalStaticConfig) => ModalStaticHandle;
  destroyAll: () => void;
}

export type ModalComponent =
  React.ForwardRefExoticComponent<ModalProps & React.RefAttributes<HTMLDivElement>> &
    ModalStaticFunctions;

const ANIM_MS = 280;

/** `Modal` — centered dialog with mask. Renders into `document.body`. */
const ModalBase = React.forwardRef<HTMLDivElement, ModalProps>((props, ref) => {
  const hasExplicitWidth = props.width !== undefined;
  const {
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
    maskClassName = "",
    maskStyle,
    escClosable = true,
    okText = "确定",
    cancelText = "取消",
    okButtonProps,
    cancelButtonProps,
    confirmLoading,
    bodyClassName = "",
    bodyStyle,
    bodyProps,
    bodyOverflow,
    bodyInset = "safe",
    destroyOnClose = false,
    afterOpenChange,
    zIndex,
    className = "",
    style,
    onClick,
    ...rest
  } = props;
  const portalContainer = usePortalContainer();
  const portalTheme = useComponentPortalTheme("Modal");
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const titleId = React.useId();
  const descriptionId = React.useId();
  const overlayZIndex = useOverlayZIndex(open, zIndex);
  const [hasOpenedOnce, setHasOpenedOnce] = React.useState(open);
  React.useEffect(() => {
    if (open) setHasOpenedOnce(true);
  }, [open]);

  const handleCancel = React.useCallback(() => {
    if (onCancel) onCancel();
    else onClose?.();
  }, [onCancel, onClose]);

  useOverlayLayer({
    open: open && portalContainer != null,
    containerRef: panelRef,
    zIndex: overlayZIndex,
    onEscape: handleCancel,
    escapeEnabled: escClosable,
    trapFocus: true,
    autoFocus: true,
    restoreFocus: true,
    lockScroll: true,
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

  const overlayStyle: React.CSSProperties = {
    ...portalTheme.styles.overlay,
    ...maskStyle,
    zIndex: overlayZIndex,
  };
  const panelStyle: React.CSSProperties = {
    ...portalTheme.style,
    width,
    maxWidth: "92vw",
    ...portalTheme.styles.popup,
    ...(hasExplicitWidth ? { width } : null),
    ...style,
  };

  const defaultFooter = (
    <InternalComponentThemePart components="Button">
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
    </InternalComponentThemePart>
  );
  const modalBodyStyle: React.CSSProperties | undefined =
    bodyOverflow == null
      ? { ...portalTheme.styles.body, ...bodyStyle }
      : { ...portalTheme.styles.body, overflow: bodyOverflow, ...bodyStyle };
  const usesDefaultBodyOverflow =
    bodyOverflow == null &&
    bodyStyle?.overflow == null &&
    portalTheme.styles.body?.overflow == null;

  return ReactDOM.createPortal(
    <OverlayZIndexProvider zIndex={overlayZIndex}>
      <div
        className={["modal-overlay", open ? "" : "hidden", maskClassName]
          .filter(Boolean)
          .join(" ")}
        style={overlayStyle}
        onClick={() => maskClosable && handleCancel()}
        role="presentation"
      >
        <div
          ref={setPanelRef}
          className={["modal", className].filter(Boolean).join(" ")}
          style={panelStyle}
          onClick={(e) => {
            onClick?.(e);
            e.stopPropagation();
          }}
          role="dialog"
          aria-modal
          aria-hidden={!open}
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={description ? descriptionId : undefined}
          tabIndex={-1}
          {...portalTheme.dataAttributes}
          {...rest}
        >
          {(title || description || closable) && (
            <div className="modal-head" style={portalTheme.styles.header}>
              <div className="modal-titles">
                {title && <div id={titleId} className="modal-title">{title}</div>}
                {description && <div id={descriptionId} className="modal-desc">{description}</div>}
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
          <div
            {...bodyProps}
            className={[
              "modal-body",
              `inset-${bodyInset}`,
              usesDefaultBodyOverflow ? "default-overflow" : "",
              bodyClassName,
            ]
              .filter(Boolean)
              .join(" ")}
            style={modalBodyStyle}
          >
            {children}
          </div>
          {footer === null ? null : (
            <div className="modal-foot" style={portalTheme.styles.footer}>
              {footer ?? defaultFooter}
            </div>
          )}
        </div>
      </div>
    </OverlayZIndexProvider>,
    portalContainer
  );
});
ModalBase.displayName = "Modal";

const ThemedModalBase = withComponentTheme(
  ModalBase,
  "Modal",
  ["modal", "button"],
  { portalOnly: true }
);

const staticHandles = new Set<ModalStaticHandle>();

const staticIconName: Record<ModalStaticKind, "info" | "check2" | "alert"> = {
  confirm: "info",
  info: "info",
  success: "check2",
  warning: "alert",
  error: "alert",
};

const isThenable = (value: unknown): value is Promise<unknown> =>
  !!value && typeof (value as { then?: unknown }).then === "function";

interface StaticModalHostProps {
  kind: ModalStaticKind;
  config: ModalStaticConfig;
  open: boolean;
  destroy: () => void;
}

const StaticModalHost: React.FC<StaticModalHostProps> = ({
  kind,
  config,
  open,
  destroy,
}) => {
  const [loading, setLoading] = React.useState(false);
  const {
    content,
    children,
    icon,
    okCancel = kind === "confirm",
    onOk,
    onCancel,
    okText = "确定",
    cancelText = "取消",
    okButtonProps,
    cancelButtonProps,
    confirmLoading,
    footer,
    maskClosable,
    escClosable,
    className = "",
    ...modalProps
  } = config;

  const close = React.useCallback(() => {
    onCancel?.();
    destroy();
  }, [destroy, onCancel]);

  const handleOk = React.useCallback(() => {
    const result = onOk?.();
    if (result === false) return;
    if (isThenable(result)) {
      setLoading(true);
      result
        .then((next) => {
          if (next !== false) destroy();
        }, () => undefined)
        .finally(() => setLoading(false));
      return;
    }
    destroy();
  }, [destroy, onOk]);

  const okVariant = kind === "error" ? "danger" : "primary";
  const mergedFooter =
    footer !== undefined ? (
      footer
    ) : okCancel ? (
      <InternalComponentThemePart components="Button">
        <Button variant="ghost" onClick={close} {...cancelButtonProps}>
          {cancelText}
        </Button>
        <Button
          variant={okVariant}
          loading={loading || confirmLoading}
          onClick={handleOk}
          {...okButtonProps}
        >
          {okText}
        </Button>
      </InternalComponentThemePart>
    ) : (
      <InternalComponentThemePart components="Button">
        <Button
          variant={okVariant}
          loading={loading || confirmLoading}
          onClick={handleOk}
          {...okButtonProps}
        >
          {okText}
        </Button>
      </InternalComponentThemePart>
    );

  return (
    <ThemedModalBase
      {...modalProps}
      open={open}
      onClose={close}
      onCancel={close}
      footer={mergedFooter}
      maskClosable={maskClosable ?? false}
      escClosable={escClosable ?? true}
      className={className}
      maskClassName={["modal-static-overlay", config.maskClassName].filter(Boolean).join(" ")}
    >
      <div className="modal-static-body">
        {icon !== false && (
          <span className={`modal-static-icon ${kind}`}>
            {icon ?? <Icon name={staticIconName[kind]} size={20} />}
          </span>
        )}
        <div className="modal-static-content">{content ?? children}</div>
      </div>
    </ThemedModalBase>
  );
};

const createStaticModal = (
  kind: ModalStaticKind,
  config: ModalStaticConfig
): ModalStaticHandle => {
  if (typeof document === "undefined") {
    return { destroy: () => {}, update: () => {} };
  }

  const div = document.createElement("div");
  document.body.appendChild(div);
  let root: Root | null = createRoot(div);
  let current: ModalStaticConfig = { ...config };
  let open = true;

  const render = () => {
    root?.render(
      <StaticModalHost
        kind={kind}
        config={current}
        open={open}
        destroy={handle.destroy}
      />
    );
  };

  const handle: ModalStaticHandle = {
    destroy: () => {
      if (!root) return;
      open = false;
      render();
      staticHandles.delete(handle);
      window.setTimeout(() => {
        root?.unmount();
        root = null;
        div.remove();
      }, ANIM_MS);
    },
    update: (next) => {
      if (!root) return;
      current = {
        ...current,
        ...(typeof next === "function" ? next(current) : next),
      };
      render();
    },
  };

  staticHandles.add(handle);
  render();
  return handle;
};

export const Modal = ThemedModalBase as ModalComponent;
Modal.confirm = (config) => createStaticModal("confirm", config);
Modal.info = (config) => createStaticModal("info", config);
Modal.success = (config) => createStaticModal("success", config);
Modal.warning = (config) => createStaticModal("warning", config);
Modal.warn = Modal.warning;
Modal.error = (config) => createStaticModal("error", config);
Modal.destroyAll = () => {
  Array.from(staticHandles).forEach((handle) => handle.destroy());
};
