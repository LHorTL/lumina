import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Typography.css";
import * as React from "react";
import { createPortal } from "react-dom";
import { Icon, type IconName } from "../Icon";
import { useFloating } from "../../utils/useFloating";
import { usePortalContainer } from "../../utils/portal";
import { useOverlayLayer } from "../../utils/overlayStack";

/* ============================================================================
 * Shared types
 * ========================================================================== */

export type TypographyType = "secondary" | "success" | "warning" | "danger";

export interface CopyableConfig {
  /** Text to copy. Defaults to the rendered children string. */
  text?: string;
  /** Fired after a successful copy. */
  onCopy?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** 复制失败时触发，接收浏览器抛出的错误。 */
  onCopyError?: (error: unknown) => void;
  /** Custom icons `[default, copied]`. */
  icon?: [React.ReactNode, React.ReactNode];
  /** Custom tooltip text `[default, copied]`. Pass `false` to disable. */
  tooltips?: [React.ReactNode, React.ReactNode] | false;
  /** 写入剪贴板时使用的文本格式。 */
  format?: "text/plain" | "text/html";
}

export interface EditableConfig {
  /** Controlled editing flag. Omit for uncontrolled (click icon to start). */
  editing?: boolean;
  /** Text shown in the editor; falls back to `children` string. */
  text?: string;
  /** Fired with the new value when the user confirms. */
  onChange?: (value: string) => void;
  /** Fired when the user cancels (Escape or blur without confirm). */
  onCancel?: () => void;
  /** Fired when editing starts. */
  onStart?: () => void;
  /** Fired when editing ends (regardless of save/cancel). */
  onEnd?: () => void;
  /** Maximum input length. */
  maxLength?: number;
  /** Auto resize textarea. `true` = autosize; or pass row bounds. */
  autoSize?: boolean | { minRows?: number; maxRows?: number };
  /** What triggers entering edit mode. Defaults to `["icon"]`. */
  triggerType?: Array<"icon" | "text">;
  /** Override the edit icon. */
  icon?: React.ReactNode;
  /** Tooltip text on the trigger icon. Pass `false` to disable. */
  tooltip?: React.ReactNode | false;
  /** 单行编辑器的确认按钮内容；默认使用勾选图标，传入 `null` 可隐藏。 */
  enterIcon?: React.ReactNode;
}

export interface EllipsisConfig {
  /** Number of rows to clamp at. Defaults to 1. */
  rows?: number;
  /** Show an "Expand" affordance after clamping. */
  expandable?: boolean;
  /** Custom expand-button label. */
  symbol?: React.ReactNode;
  /** Fired on expand. */
  onExpand?: (event: React.MouseEvent<HTMLElement>) => void;
  /** Show full text in a tooltip when truncated. */
  tooltip?: boolean | React.ReactNode;
  /** Optional suffix that should always remain visible (e.g. an em-dash author). */
  suffix?: string;
}

export interface BaseTypographyProps {
  /** Semantic color. */
  type?: TypographyType;
  /** Render disabled (muted + not selectable). */
  disabled?: boolean;
  /** Highlight with mark background. */
  mark?: boolean;
  /** Render as inline `<code>`. */
  code?: boolean;
  /** Render as keyboard key `<kbd>`. */
  keyboard?: boolean;
  /** Underline. */
  underline?: boolean;
  /** Strikethrough. */
  delete?: boolean;
  /** Bold. */
  strong?: boolean;
  /** Italic. */
  italic?: boolean;
  /** Add a copy button. Pass an object to customize. */
  copyable?: boolean | CopyableConfig;
  /** Add an edit button. Pass an object to customize. */
  editable?: boolean | EditableConfig;
  /** Truncate to N rows with optional expand affordance. */
  ellipsis?: boolean | EllipsisConfig;
  /** Extra class names. */
  className?: string;
  /** Inline style. */
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/* ============================================================================
 * Internals
 * ========================================================================== */

function toText(node: React.ReactNode): string {
  if (node == null || node === false) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(toText).join("");
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode };
    return toText(props.children);
  }
  return "";
}

function buildClass(props: BaseTypographyProps, base: string, extra?: string) {
  return [
    base,
    props.type,
    props.disabled && "disabled",
    props.mark && "mark",
    props.code && "code",
    props.keyboard && "kbd",
    props.underline && "underline",
    props.delete && "del",
    props.strong && "strong",
    props.italic && "italic",
    extra,
    props.className,
  ]
    .filter(Boolean)
    .join(" ");
}

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(value);
    return;
  }
  (ref as React.MutableRefObject<T | null>).current = value;
}

/** 从排版组件属性中剥离视觉/行为属性，保留原生 DOM 属性。 */
function getNativeTypographyProps(
  props: BaseTypographyProps & React.HTMLAttributes<HTMLElement>
): React.HTMLAttributes<HTMLElement> {
  const {
    type: _type,
    disabled: _disabled,
    mark: _mark,
    code: _code,
    keyboard: _keyboard,
    underline: _underline,
    delete: _delete,
    strong: _strong,
    italic: _italic,
    copyable: _copyable,
    editable: _editable,
    ellipsis: _ellipsis,
    className: _className,
    style: _style,
    children: _children,
    ...nativeProps
  } = props;
  return nativeProps;
}

/** 合并内部测量 ref 与消费者 ref。 */
function composeTypographyRef<T extends HTMLElement>(
  internalRef: React.MutableRefObject<HTMLElement | null>,
  forwardedRef: React.ForwardedRef<T>
): React.RefCallback<T> {
  return (node) => {
    internalRef.current = node;
    assignRef(forwardedRef, node);
  };
}

const EllipsisTooltip = React.forwardRef<
  HTMLElement,
  { content: React.ReactNode; children: React.ReactElement }
>(({ content, children }, forwardedRef) => {
  const [open, setOpen] = React.useState(false);
  const tooltipId = React.useId();
  const portalContainer = usePortalContainer();
  const openTimerRef = React.useRef<number | undefined>();
  const closeTimerRef = React.useRef<number | undefined>();
  const childRef = (children as React.ReactElement & { ref?: React.Ref<HTMLElement> }).ref;
  const {
    triggerRef,
    floatingRef,
    floatingStyle,
    placement,
    zIndex: tooltipZIndex,
  } = useFloating<HTMLElement, HTMLDivElement>({
    open,
    placement: "top",
    panelWidth: 360,
    panelHeight: 96,
    alignCross: "center",
  });
  useOverlayLayer({
    open: open && portalContainer != null,
    containerRef: floatingRef,
    ownerRef: triggerRef,
    zIndex: tooltipZIndex,
    onEscape: () => setOpen(false),
  });

  React.useEffect(() => {
    return () => {
      window.clearTimeout(openTimerRef.current);
      window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  const show = React.useCallback(() => {
    window.clearTimeout(closeTimerRef.current);
    if (open || openTimerRef.current != null) return;
    openTimerRef.current = window.setTimeout(() => {
      openTimerRef.current = undefined;
      setOpen(true);
    }, 250);
  }, [open]);

  const hide = React.useCallback(() => {
    window.clearTimeout(openTimerRef.current);
    openTimerRef.current = undefined;
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => setOpen(false), 300);
  }, []);

  const setTriggerRef = React.useCallback(
    (node: HTMLElement | null) => {
      (triggerRef as React.MutableRefObject<HTMLElement | null>).current = node;
      assignRef(forwardedRef, node);
      assignRef(childRef, node);
    },
    [childRef, forwardedRef, triggerRef]
  );

  const childProps = children.props as {
    onMouseEnter?: React.MouseEventHandler<HTMLElement>;
    onMouseOver?: React.MouseEventHandler<HTMLElement>;
    onMouseMove?: React.MouseEventHandler<HTMLElement>;
    onMouseLeave?: React.MouseEventHandler<HTMLElement>;
    onPointerEnter?: React.PointerEventHandler<HTMLElement>;
    onPointerMove?: React.PointerEventHandler<HTMLElement>;
    onPointerLeave?: React.PointerEventHandler<HTMLElement>;
    onFocus?: React.FocusEventHandler<HTMLElement>;
    onBlur?: React.FocusEventHandler<HTMLElement>;
    "aria-describedby"?: string;
  };

  return (
    <>
      {React.cloneElement(children, {
        ref: setTriggerRef,
        "aria-describedby": open
          ? [childProps["aria-describedby"], tooltipId].filter(Boolean).join(" ")
          : childProps["aria-describedby"],
        onMouseEnter: (event: React.MouseEvent<HTMLElement>) => {
          childProps.onMouseEnter?.(event);
          show();
        },
        onMouseOver: (event: React.MouseEvent<HTMLElement>) => {
          childProps.onMouseOver?.(event);
          show();
        },
        onMouseMove: (event: React.MouseEvent<HTMLElement>) => {
          childProps.onMouseMove?.(event);
          show();
        },
        onMouseLeave: (event: React.MouseEvent<HTMLElement>) => {
          childProps.onMouseLeave?.(event);
          hide();
        },
        onPointerEnter: (event: React.PointerEvent<HTMLElement>) => {
          childProps.onPointerEnter?.(event);
          show();
        },
        onPointerMove: (event: React.PointerEvent<HTMLElement>) => {
          childProps.onPointerMove?.(event);
          show();
        },
        onPointerLeave: (event: React.PointerEvent<HTMLElement>) => {
          childProps.onPointerLeave?.(event);
          hide();
        },
        onFocus: (event: React.FocusEvent<HTMLElement>) => {
          childProps.onFocus?.(event);
          show();
        },
        onBlur: (event: React.FocusEvent<HTMLElement>) => {
          childProps.onBlur?.(event);
          hide();
        },
      })}
      {open && portalContainer &&
        createPortal(
          <div
            id={tooltipId}
            ref={floatingRef}
            className={`typo-ellipsis-tooltip ${placement}`}
            style={floatingStyle}
            role="tooltip"
            onMouseEnter={show}
            onMouseMove={show}
            onMouseLeave={hide}
            onPointerEnter={show}
            onPointerMove={show}
            onPointerLeave={hide}
          >
            {content}
          </div>,
          portalContainer
        )}
    </>
  );
});
EllipsisTooltip.displayName = "Typography.EllipsisTooltip";

/* ---------- Copy button ---------- */

/** 使用现代 Clipboard API 写入文本，并在不可用时回退到选区复制。 */
async function writeTypographyClipboard(
  text: string,
  format: NonNullable<CopyableConfig["format"]>
): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    if (
      format === "text/html" &&
      navigator.clipboard.write &&
      typeof ClipboardItem !== "undefined"
    ) {
      await navigator.clipboard.write([
        new ClipboardItem({ "text/html": new Blob([text], { type: "text/html" }) }),
      ]);
      return;
    }
    if (navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
  }
  if (typeof document === "undefined") throw new Error("Clipboard is unavailable");
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.inset = "-9999px auto auto -9999px";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand?.("copy") ?? false;
  textarea.remove();
  if (!copied) throw new Error("Clipboard write failed");
}

const CopyAction: React.FC<{
  config: CopyableConfig;
  fallbackText: string;
}> = ({ config, fallbackText }) => {
  const [status, setStatus] = React.useState<"idle" | "copied" | "error">("idle");
  const timerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
    };
  }, []);

  /** 执行复制，并仅在浏览器确认成功后触发成功回调。 */
  const handleCopy = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const text = config.text ?? fallbackText;
    try {
      await writeTypographyClipboard(text, config.format ?? "text/plain");
      config.onCopy?.(event);
      setStatus("copied");
    } catch (error) {
      config.onCopyError?.(error);
      setStatus("error");
    }
    if (timerRef.current != null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setStatus("idle"), 2400);
  };

  const [defIcon, doneIcon] = config.icon ?? [
    <Icon key="def" name="copy" size={12} />,
    <Icon key="done" name="check" size={12} />,
  ];
  const tipText =
    config.tooltips === false
      ? undefined
      : status === "error"
      ? "复制失败"
      : Array.isArray(config.tooltips)
      ? status === "copied"
        ? config.tooltips[1]
        : config.tooltips[0]
      : status === "copied"
        ? "已复制"
        : "复制";

  return (
    <button
      type="button"
      aria-label={typeof tipText === "string" ? tipText : "复制"}
      title={typeof tipText === "string" ? tipText : undefined}
      onClick={(event) => void handleCopy(event)}
      className={`typo-action typo-copy ${status}`}
    >
      {status === "copied" ? doneIcon : defIcon}
    </button>
  );
};

/* ---------- Edit affordance + inline editor ---------- */

const EditableEditor: React.FC<{
  initial: string;
  multiline: boolean;
  maxLength?: number;
  autoSize?: EditableConfig["autoSize"];
  /** 单行编辑器的确认按钮内容。 */
  enterIcon?: React.ReactNode;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}> = ({ initial, multiline, maxLength, autoSize, enterIcon, onConfirm, onCancel }) => {
  const [value, setValue] = React.useState(initial);
  const ref = React.useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);
  const groupRef = React.useRef<HTMLSpanElement>(null);
  const finishedRef = React.useRef(false);

  React.useEffect(() => {
    const el = ref.current;
    if (el) {
      el.focus();
      const len = el.value.length;
      el.setSelectionRange(len, len);
    }
  }, []);

  React.useEffect(() => {
    setValue(initial);
    finishedRef.current = false;
  }, [initial]);

  const resize = React.useCallback(() => {
    const el = ref.current as HTMLTextAreaElement | null;
    if (!el || !multiline || !autoSize) return;
    el.style.height = "auto";
    const computed = window.getComputedStyle(el);
    const lineHeight = parseFloat(computed.lineHeight) || 20;
    const padding =
      parseFloat(computed.paddingTop) + parseFloat(computed.paddingBottom);
    const bounds = typeof autoSize === "object" ? autoSize : {};
    const min = (bounds.minRows ?? 1) * lineHeight + padding;
    const max = bounds.maxRows ? bounds.maxRows * lineHeight + padding : Infinity;
    const next = Math.min(Math.max(el.scrollHeight, min), max);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
  }, [autoSize, multiline]);

  React.useEffect(() => {
    resize();
  }, [value, resize]);

  /** 确认当前编辑值，并阻止随后 blur 重复触发取消。 */
  const confirm = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    try {
      onConfirm(value);
    } finally {
      finishedRef.current = false;
    }
  };

  /** 取消当前编辑，并阻止随后 blur 重复触发。 */
  const cancel = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    try {
      onCancel();
    } finally {
      finishedRef.current = false;
    }
  };

  /** 仅在焦点真正离开编辑器组合时取消编辑。 */
  const handleGroupBlur = (event: React.FocusEvent<HTMLSpanElement>) => {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && groupRef.current?.contains(nextTarget)) return;
    cancel();
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    if (e.key === "Escape") {
      e.preventDefault();
      cancel();
      return;
    }
    if (e.key === "Enter" && (!multiline || (e.metaKey || e.ctrlKey))) {
      e.preventDefault();
      confirm();
    }
  };

  const common = {
    ref: ref as never,
    value,
    maxLength,
    className: "typo-editor",
    onChange: (
      e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ) => setValue(e.target.value),
    onKeyDown: handleKeyDown,
  } as const;

  const editor = multiline ? (
    <textarea rows={1} {...common} />
  ) : (
    <input type="text" {...common} />
  );
  const resolvedEnterIcon = enterIcon === undefined
    ? <Icon name="check" size={12} />
    : enterIcon;
  const showEnterAction =
    !multiline && resolvedEnterIcon !== null && resolvedEnterIcon !== false;

  return (
    <span ref={groupRef} className="typo-editor-wrap" onBlur={handleGroupBlur}>
      {editor}
      {showEnterAction && (
        <button
          type="button"
          className="typo-action typo-enter"
          aria-label="确认编辑"
          title="确认编辑"
          onMouseDown={(event) => event.preventDefault()}
          onClick={confirm}
        >
          {resolvedEnterIcon}
        </button>
      )}
    </span>
  );
};

/* ============================================================================
 * Hook: shared rendering body
 * ========================================================================== */

interface RenderableProps extends BaseTypographyProps {
  ellipsisRows?: number;
  multilineEdit?: boolean;
  /** 是否在正文内部渲染文本编辑触发器；Link 会自行复用锚点。 */
  renderTextTrigger?: boolean;
}

function useTypographyBody(props: RenderableProps) {
  const fallbackText = React.useMemo(
    () => toText(props.children),
    [props.children]
  );

  /* ---- editable state ---- */
  const editable = props.editable;
  const editConf: EditableConfig =
    editable && typeof editable === "object" ? editable : {};
  const triggers = editConf.triggerType ?? ["icon"];
  const isControlledEdit = editConf.editing != null;
  const [editingState, setEditingState] = React.useState(false);
  const editing = isControlledEdit ? editConf.editing! : editingState;

  /** 进入编辑态，并遵循受控/非受控模式。 */
  const startEdit = () => {
    editConf.onStart?.();
    if (!isControlledEdit) setEditingState(true);
  };
  /** 结束编辑态，并遵循受控/非受控模式。 */
  const endEdit = () => {
    editConf.onEnd?.();
    if (!isControlledEdit) setEditingState(false);
  };
  const handleConfirm = (value: string) => {
    if (value !== (editConf.text ?? fallbackText)) editConf.onChange?.(value);
    endEdit();
  };
  const handleCancel = () => {
    editConf.onCancel?.();
    endEdit();
  };

  /* ---- ellipsis state ---- */
  const ellipsis = props.ellipsis;
  const ellConf: EllipsisConfig =
    ellipsis && typeof ellipsis === "object" ? ellipsis : {};
  const rows = Math.max(1, Math.floor(ellConf.rows ?? props.ellipsisRows ?? 1));
  const wantClamp = !!ellipsis;
  const [expanded, setExpanded] = React.useState(false);
  const [truncated, setTruncated] = React.useState(false);
  const elementRef = React.useRef<HTMLElement | null>(null);
  const ellipsisContentRef = React.useRef<HTMLSpanElement | null>(null);

  React.useEffect(() => setExpanded(false), [fallbackText, rows, wantClamp]);

  React.useLayoutEffect(() => {
    const element = ellConf.suffix ? ellipsisContentRef.current : elementRef.current;
    if (!element || !wantClamp || expanded) {
      setTruncated(false);
      return;
    }
    /** 根据真实滚动尺寸判断文本是否被截断。 */
    const measure = () => {
      const next = rows > 1
        ? element.scrollHeight > element.clientHeight + 1
        : element.scrollWidth > element.clientWidth + 1;
      setTruncated(next);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ellConf.suffix, expanded, fallbackText, rows, wantClamp]);

  /* ---- content ---- */
  let inner: React.ReactNode = props.children;

  if (props.code) inner = <code>{inner}</code>;
  if (props.keyboard) inner = <kbd>{inner}</kbd>;
  if (props.mark) inner = <mark>{inner}</mark>;
  if (props.delete) inner = <del>{inner}</del>;
  if (props.underline) inner = <u>{inner}</u>;
  if (props.strong) inner = <strong>{inner}</strong>;
  if (props.italic) inner = <i>{inner}</i>;

  /* ---- copy node ---- */
  let copyNode: React.ReactNode = null;
  if (props.copyable && !props.disabled) {
    const conf =
      typeof props.copyable === "object" ? props.copyable : ({} as CopyableConfig);
    copyNode = <CopyAction config={conf} fallbackText={fallbackText} />;
  }

  /* ---- edit node ---- */
  let editIconNode: React.ReactNode = null;
  if (editable && !props.disabled && triggers.includes("icon")) {
    const tip = editConf.tooltip ?? "编辑";
    editIconNode = (
      <button
        type="button"
        aria-label={typeof tip === "string" ? tip : "编辑"}
        title={typeof tip === "string" && tip !== "" ? tip : undefined}
        onClick={(e) => {
          e.stopPropagation();
          startEdit();
        }}
        className="typo-action typo-edit"
      >
        {editConf.icon ?? <Icon name="edit" size={12} />}
      </button>
    );
  }

  /* ---- text-trigger edit ---- */
  const textEditTrigger =
    !!editable && !props.disabled && triggers.includes("text") && !editing;
  if (textEditTrigger && props.renderTextTrigger !== false) {
    inner = (
      <span
        className="typo-edit-text-trigger"
        role="button"
        tabIndex={0}
        onClick={() => startEdit()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            startEdit();
          }
        }}
      >
        {inner}
      </span>
    );
  }

  /* ---- clamp / expand ---- */
  let style: React.CSSProperties | undefined = props.style;
  let extraCls: string | undefined;
  if (wantClamp && !expanded) {
    const clampClassName = rows > 1 ? "ellipsis-multi" : "ellipsis";
    if (ellConf.suffix) {
      extraCls = "ellipsis-with-suffix";
      inner = (
        <>
          <span
            ref={ellipsisContentRef}
            className={`typo-ellipsis-content ${clampClassName}`}
            style={rows > 1 ? { WebkitLineClamp: rows } : undefined}
          >
            {inner}
          </span>
          <span className="typo-suffix">{ellConf.suffix}</span>
        </>
      );
    } else {
      extraCls = clampClassName;
      if (rows > 1) {
        style = {
          ...style,
          WebkitLineClamp: rows,
        } as React.CSSProperties;
      }
    }
  } else if (ellConf.suffix) {
    inner = <>{inner}<span className="typo-suffix">{ellConf.suffix}</span></>;
  }

  let expandNode: React.ReactNode = null;
  if (wantClamp && truncated && ellConf.expandable && !expanded) {
    expandNode = (
      <button
        type="button"
        className="typo-expand"
        onClick={(e) => {
          ellConf.onExpand?.(e);
          setExpanded(true);
        }}
      >
        {ellConf.symbol ?? "展开"}
      </button>
    );
  }

  const tooltipContent =
    wantClamp && truncated && !expanded && ellConf.tooltip
      ? ellConf.tooltip === true
        ? fallbackText
        : ellConf.tooltip
      : undefined;

  return {
    editing,
    editConf,
    fallbackText,
    handleConfirm,
    handleCancel,
    startEdit,
    textEditTrigger,
    inner,
    copyNode,
    editIconNode,
    expandNode,
    style,
    extraCls,
    tooltipContent,
    elementRef,
  };
}

/* ============================================================================
 * Title (h1–h5)
 * ========================================================================== */

export type TitleLevel = 1 | 2 | 3 | 4 | 5;

export interface TitleProps
  extends BaseTypographyProps,
    Omit<React.HTMLAttributes<HTMLHeadingElement>, keyof BaseTypographyProps> {
  /** Heading level — 1..5. Defaults to 1. */
  level?: TitleLevel;
}

/**
 * `Typography.Title` — semantic heading.
 *
 * @example
 * <Title level={2} copyable>章节标题</Title>
 */
export const Title = React.forwardRef<HTMLElement, TitleProps>((props, ref) => {
  const { level = 1, ...rest } = props;
  const body = useTypographyBody({ ...rest, multilineEdit: false });
  const Tag = (`h${level}`) as "h1" | "h2" | "h3" | "h4" | "h5";
  const nativeProps = getNativeTypographyProps(rest as TitleProps & React.HTMLAttributes<HTMLElement>);
  const composedRef = composeTypographyRef(body.elementRef, ref);

  if (body.editing) {
    return (
      <Tag
        {...(nativeProps as React.HTMLAttributes<HTMLHeadingElement>)}
        ref={composedRef as React.Ref<HTMLHeadingElement>}
        className={buildClass(rest, `typo typo-title h${level}`, "editing")}
        style={rest.style}
        aria-disabled={rest.disabled || undefined}
      >
        <EditableEditor
          initial={body.editConf.text ?? body.fallbackText}
          multiline={false}
          maxLength={body.editConf.maxLength}
          autoSize={body.editConf.autoSize}
          enterIcon={body.editConf.enterIcon}
          onConfirm={body.handleConfirm}
          onCancel={body.handleCancel}
        />
      </Tag>
    );
  }

  const element = (
    <Tag
      {...(nativeProps as React.HTMLAttributes<HTMLHeadingElement>)}
      ref={composedRef as React.Ref<HTMLHeadingElement>}
      className={buildClass(rest, `typo typo-title h${level}`, body.extraCls)}
      style={body.style}
      aria-disabled={rest.disabled || undefined}
    >
      {body.inner}
      {body.expandNode}
      {body.copyNode}
      {body.editIconNode}
    </Tag>
  );

  return body.tooltipContent ? (
    <EllipsisTooltip content={body.tooltipContent}>
      {element}
    </EllipsisTooltip>
  ) : element;
});
Title.displayName = "Typography.Title";

/* ============================================================================
 * Text — inline span
 * ========================================================================== */

export interface TextProps
  extends BaseTypographyProps,
    Omit<React.HTMLAttributes<HTMLElement>, keyof BaseTypographyProps> {
  /** Force the rendered tag (default `<span>`). */
  as?: keyof JSX.IntrinsicElements;
}

/**
 * `Typography.Text` — inline text with semantic / decorative variants.
 *
 * @example
 * <Text type="success" strong>成功</Text>
 * <Text code>npm install</Text>
 * <Text copyable>可复制内容</Text>
 */
export const Text = React.forwardRef<HTMLElement, TextProps>((props, ref) => {
  const { as = "span", ...rest } = props;
  const body = useTypographyBody({ ...rest, multilineEdit: false });
  const Tag = as as "span";
  const nativeProps = getNativeTypographyProps(rest as TextProps & React.HTMLAttributes<HTMLElement>);
  const composedRef = composeTypographyRef(body.elementRef, ref);

  if (body.editing) {
    return (
      <Tag
        {...nativeProps}
        ref={composedRef as React.Ref<HTMLSpanElement>}
        className={buildClass(rest, "typo typo-text", "editing")}
        style={rest.style}
        aria-disabled={rest.disabled || undefined}
      >
        <EditableEditor
          initial={body.editConf.text ?? body.fallbackText}
          multiline={false}
          maxLength={body.editConf.maxLength}
          autoSize={body.editConf.autoSize}
          enterIcon={body.editConf.enterIcon}
          onConfirm={body.handleConfirm}
          onCancel={body.handleCancel}
        />
      </Tag>
    );
  }

  const element = (
    <Tag
      {...nativeProps}
      ref={composedRef as React.Ref<HTMLSpanElement>}
      className={buildClass(rest, "typo typo-text", body.extraCls)}
      style={body.style}
      aria-disabled={rest.disabled || undefined}
    >
      {body.inner}
      {body.expandNode}
      {body.copyNode}
      {body.editIconNode}
    </Tag>
  );

  return body.tooltipContent ? (
    <EllipsisTooltip content={body.tooltipContent}>
      {element}
    </EllipsisTooltip>
  ) : element;
});
Text.displayName = "Typography.Text";

/* ============================================================================
 * Paragraph — block <p>
 * ========================================================================== */

export interface ParagraphProps
  extends BaseTypographyProps,
    Omit<React.HTMLAttributes<HTMLParagraphElement>, keyof BaseTypographyProps> {}

/**
 * `Typography.Paragraph` — block paragraph with the same decorations as `Text`.
 *
 * @example
 * <Paragraph ellipsis={{ rows: 3, expandable: true }}>{long}</Paragraph>
 */
export const Paragraph = React.forwardRef<HTMLParagraphElement, ParagraphProps>(
  (props, ref) => {
    const body = useTypographyBody({ ...props, multilineEdit: true });
    const nativeProps = getNativeTypographyProps(props as ParagraphProps & React.HTMLAttributes<HTMLElement>);
    const composedRef = composeTypographyRef(body.elementRef, ref);

    if (body.editing) {
      return (
        <p
          {...(nativeProps as React.HTMLAttributes<HTMLParagraphElement>)}
          ref={composedRef as React.Ref<HTMLParagraphElement>}
          className={buildClass(props, "typo typo-paragraph", "editing")}
          style={props.style}
          aria-disabled={props.disabled || undefined}
        >
          <EditableEditor
            initial={body.editConf.text ?? body.fallbackText}
            multiline
            maxLength={body.editConf.maxLength}
            autoSize={body.editConf.autoSize ?? true}
            onConfirm={body.handleConfirm}
            onCancel={body.handleCancel}
          />
        </p>
      );
    }

    const element = (
      <p
        {...(nativeProps as React.HTMLAttributes<HTMLParagraphElement>)}
        ref={composedRef as React.Ref<HTMLParagraphElement>}
        className={buildClass(props, "typo typo-paragraph", body.extraCls)}
        style={body.style}
        aria-disabled={props.disabled || undefined}
      >
        {body.inner}
        {body.expandNode}
        {body.copyNode}
        {body.editIconNode}
      </p>
    );

    return body.tooltipContent ? (
      <EllipsisTooltip content={body.tooltipContent}>
        {element}
      </EllipsisTooltip>
    ) : element;
  }
);
Paragraph.displayName = "Typography.Paragraph";

/* ============================================================================
 * Link — anchor
 * ========================================================================== */

export interface LinkProps
  extends BaseTypographyProps,
    Omit<
      React.AnchorHTMLAttributes<HTMLAnchorElement>,
      keyof BaseTypographyProps | "type"
    > {
  href?: string;
  /** Add the leading external icon. */
  external?: boolean;
  /** Override the external icon. */
  externalIcon?: IconName;
}

/**
 * `Typography.Link` — styled `<a>` that participates in the same decoration
 * system as `Text`. Adds a small `arrow` for `external` links.
 *
 * @example
 * <Link href="https://example.com" external>外部链接</Link>
 */
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (props, ref) => {
    const {
      type,
      disabled,
      mark,
      code,
      keyboard,
      underline,
      delete: del,
      strong,
      italic,
      copyable,
      editable,
      ellipsis,
      className,
      style,
      children,
      external,
      externalIcon = "arrowRight",
      target,
      rel,
      href,
      tabIndex,
      onClick: anchorOnClick,
      onKeyDown: anchorOnKeyDown,
      ...anchorRest
    } = props;
    const body = useTypographyBody({
      type,
      disabled,
      mark,
      code,
      keyboard,
      underline,
      delete: del,
      strong,
      italic,
      copyable,
      editable,
      ellipsis,
      className,
      style,
      children,
      renderTextTrigger: false,
    });

    const safeRel =
      target === "_blank" ? rel ?? "noopener noreferrer" : rel;
    const composedRef = composeTypographyRef(body.elementRef, ref);

    if (body.editing) {
      return (
        <span className="typo-link-group typo-link-editing-group">
          <a
            {...anchorRest}
            ref={composedRef as React.Ref<HTMLAnchorElement>}
            className={[className, "typo-link-editing-anchor"].filter(Boolean).join(" ")}
            style={style}
            tabIndex={-1}
            aria-hidden="true"
            aria-disabled={disabled || undefined}
            onClick={(event) => event.preventDefault()}
          />
          <span
            className={buildClass(
              { ...props, className: "" },
              "typo typo-link",
              "editing typo-link-editor-shell"
            )}
            style={style}
          >
            <EditableEditor
              initial={body.editConf.text ?? body.fallbackText}
              multiline={false}
              maxLength={body.editConf.maxLength}
              autoSize={body.editConf.autoSize}
              enterIcon={body.editConf.enterIcon}
              onConfirm={body.handleConfirm}
              onCancel={body.handleCancel}
            />
          </span>
        </span>
      );
    }

    const linkExtraClass = [
      body.extraCls,
      body.textEditTrigger && "typo-edit-text-trigger",
    ].filter(Boolean).join(" ");
    const element = (
      <a
        {...anchorRest}
        ref={composedRef as React.Ref<HTMLAnchorElement>}
        className={buildClass(props, "typo typo-link", linkExtraClass)}
        style={body.style}
        href={disabled ? undefined : href}
        target={disabled ? undefined : target}
        rel={safeRel}
        tabIndex={disabled ? -1 : tabIndex}
        aria-disabled={disabled || undefined}
        onClick={(e) => {
          if (disabled) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          if (body.textEditTrigger) {
            e.preventDefault();
            e.stopPropagation();
            body.startEdit();
            return;
          }
          anchorOnClick?.(e);
        }}
        onKeyDown={(event) => {
          if (disabled) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }
          anchorOnKeyDown?.(event);
          if (
            !event.defaultPrevented &&
            body.textEditTrigger &&
            (event.key === "Enter" || event.key === " ")
          ) {
            event.preventDefault();
            event.stopPropagation();
            body.startEdit();
          }
        }}
      >
        {body.inner}
        {external && (
          <span className="typo-link-ext" aria-hidden>
            <Icon name={externalIcon} size={12} />
          </span>
        )}
      </a>
    );

    const linkedElement = body.tooltipContent ? (
      <EllipsisTooltip content={body.tooltipContent}>
        {element}
      </EllipsisTooltip>
    ) : element;

    if (!body.expandNode && !body.copyNode && !body.editIconNode) {
      return linkedElement;
    }
    return (
      <span className="typo-link-group">
        {linkedElement}
        {body.expandNode}
        {body.copyNode}
        {body.editIconNode}
      </span>
    );
  }
);
Link.displayName = "Typography.Link";

/* ============================================================================
 * Typography wrapper (article-style block)
 * ========================================================================== */

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

interface TypographyComponent
  extends React.ForwardRefExoticComponent<
    TypographyProps & React.RefAttributes<HTMLElement>
  > {
  Title: typeof Title;
  Text: typeof Text;
  Paragraph: typeof Paragraph;
  Link: typeof Link;
}

/**
 * `Typography` — optional article-style wrapper that applies consistent
 * vertical rhythm to its `Title` / `Paragraph` / `Text` / `Link` children.
 *
 * @example
 * <Typography>
 *   <Typography.Title level={2}>标题</Typography.Title>
 *   <Typography.Paragraph>段落…</Typography.Paragraph>
 * </Typography>
 */
const TypographyBase = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className = "", children, ...rest }, ref) => (
    <article
      ref={ref}
      className={`typo-root ${className}`}
      {...(rest as React.HTMLAttributes<HTMLElement>)}
    >
      {children}
    </article>
  )
) as unknown as TypographyComponent;

TypographyBase.Title = Title;
TypographyBase.Text = Text;
TypographyBase.Paragraph = Paragraph;
TypographyBase.Link = Link;
(TypographyBase as React.ForwardRefExoticComponent<unknown>).displayName =
  "Typography";

export const Typography = TypographyBase;
