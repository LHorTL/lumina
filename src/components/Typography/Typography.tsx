import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Typography.css";
import * as React from "react";
import { createPortal } from "react-dom";
import { Icon, type IconName } from "../Icon";
import { useFloating } from "../../utils/useFloating";

/* ============================================================================
 * Shared types
 * ========================================================================== */

export type TypographyType = "secondary" | "success" | "warning" | "danger";

export interface CopyableConfig {
  /** Text to copy. Defaults to the rendered children string. */
  text?: string;
  /** Fired after a successful copy. */
  onCopy?: (event: React.MouseEvent<HTMLSpanElement>) => void;
  /** Custom icons `[default, copied]`. */
  icon?: [React.ReactNode, React.ReactNode];
  /** Custom tooltip text `[default, copied]`. Pass `false` to disable. */
  tooltips?: [React.ReactNode, React.ReactNode] | false;
  /** Format/MIME hint when calling `navigator.clipboard.write` is not used. */
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
  /** Use a single-line input instead of textarea. */
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

const EllipsisTooltip = React.forwardRef<
  HTMLElement,
  { content: React.ReactNode; children: React.ReactElement }
>(({ content, children }, forwardedRef) => {
  const [open, setOpen] = React.useState(false);
  const openTimerRef = React.useRef<number | undefined>();
  const closeTimerRef = React.useRef<number | undefined>();
  const childRef = (children as React.ReactElement & { ref?: React.Ref<HTMLElement> }).ref;
  const {
    triggerRef,
    floatingRef,
    floatingStyle,
    placement,
  } = useFloating<HTMLElement, HTMLDivElement>({
    open,
    placement: "top",
    panelWidth: 360,
    panelHeight: 96,
    alignCross: "center",
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
  };

  return (
    <>
      {React.cloneElement(children, {
        ref: setTriggerRef,
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
      {open && typeof document !== "undefined" &&
        createPortal(
          <div
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
          document.body
        )}
    </>
  );
});
EllipsisTooltip.displayName = "Typography.EllipsisTooltip";

/* ---------- Copy button ---------- */

const CopyAction: React.FC<{
  config: CopyableConfig;
  fallbackText: string;
}> = ({ config, fallbackText }) => {
  const [copied, setCopied] = React.useState(false);
  const timerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    const text = config.text ?? fallbackText;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {
        /* swallow — user-visible feedback is already minimal */
      });
    }
    config.onCopy?.(event);
    setCopied(true);
    if (timerRef.current != null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopied(false), 2400);
  };

  const [defIcon, doneIcon] = config.icon ?? [
    <Icon key="def" name="copy" size={12} />,
    <Icon key="done" name="check" size={12} />,
  ];
  const tipText =
    config.tooltips === false
      ? undefined
      : Array.isArray(config.tooltips)
      ? copied
        ? config.tooltips[1]
        : config.tooltips[0]
      : copied
      ? "已复制"
      : "复制";

  return (
    <span
      role="button"
      aria-label={typeof tipText === "string" ? tipText : "Copy"}
      tabIndex={0}
      title={typeof tipText === "string" ? tipText : undefined}
      onClick={handleCopy}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCopy(e as unknown as React.MouseEvent<HTMLSpanElement>);
        }
      }}
      className={`typo-action typo-copy ${copied ? "copied" : ""}`}
    >
      {copied ? doneIcon : defIcon}
    </span>
  );
};

/* ---------- Edit affordance + inline editor ---------- */

const EditableEditor: React.FC<{
  initial: string;
  multiline: boolean;
  maxLength?: number;
  autoSize?: EditableConfig["autoSize"];
  onConfirm: (value: string) => void;
  onCancel: () => void;
}> = ({ initial, multiline, maxLength, autoSize, onConfirm, onCancel }) => {
  const [value, setValue] = React.useState(initial);
  const ref = React.useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (el) {
      el.focus();
      const len = el.value.length;
      el.setSelectionRange(len, len);
    }
  }, []);

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

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
      return;
    }
    if (e.key === "Enter" && (!multiline || (e.metaKey || e.ctrlKey))) {
      e.preventDefault();
      onConfirm(value);
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
    onBlur: () => onConfirm(value),
    onKeyDown: handleKeyDown,
  } as const;

  return multiline ? (
    <textarea rows={1} {...common} />
  ) : (
    <input type="text" {...common} />
  );
};

/* ============================================================================
 * Hook: shared rendering body
 * ========================================================================== */

interface RenderableProps extends BaseTypographyProps {
  ellipsisRows?: number;
  multilineEdit?: boolean;
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

  const startEdit = () => {
    editConf.onStart?.();
    if (!isControlledEdit) setEditingState(true);
  };
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
  const rows = ellConf.rows ?? props.ellipsisRows ?? 1;
  const wantClamp = !!ellipsis;
  const [expanded, setExpanded] = React.useState(false);

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
  if (props.copyable) {
    const conf =
      typeof props.copyable === "object" ? props.copyable : ({} as CopyableConfig);
    copyNode = <CopyAction config={conf} fallbackText={fallbackText} />;
  }

  /* ---- edit node ---- */
  let editIconNode: React.ReactNode = null;
  if (editable) {
    const tip = editConf.tooltip ?? "编辑";
    editIconNode = (
      <span
        role="button"
        aria-label={typeof tip === "string" ? tip : "Edit"}
        tabIndex={0}
        title={typeof tip === "string" && tip !== "" ? tip : undefined}
        onClick={(e) => {
          e.stopPropagation();
          startEdit();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            startEdit();
          }
        }}
        className="typo-action typo-edit"
      >
        {editConf.icon ?? <Icon name="edit" size={12} />}
      </span>
    );
  }

  /* ---- text-trigger edit ---- */
  if (editable && triggers.includes("text") && !editing) {
    inner = (
      <span
        className="typo-edit-text-trigger"
        onClick={() => startEdit()}
      >
        {inner}
      </span>
    );
  }

  /* ---- clamp / expand ---- */
  let style: React.CSSProperties | undefined = props.style;
  let extraCls: string | undefined;
  if (wantClamp && !expanded) {
    extraCls = rows > 1 ? "ellipsis-multi" : "ellipsis";
    if (rows > 1) {
      style = {
        ...style,
        WebkitLineClamp: rows,
      } as React.CSSProperties;
    }
  }

  let expandNode: React.ReactNode = null;
  if (wantClamp && ellConf.expandable && !expanded) {
    expandNode = (
      <a
        className="typo-expand"
        onClick={(e) => {
          ellConf.onExpand?.(e);
          setExpanded(true);
        }}
      >
        {ellConf.symbol ?? "展开"}
      </a>
    );
  }

  const tooltipContent =
    wantClamp && !expanded && ellConf.tooltip
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
    inner,
    copyNode,
    editIconNode,
    expandNode,
    style,
    extraCls,
    tooltipContent,
  };
}

/* ============================================================================
 * Title (h1–h5)
 * ========================================================================== */

export type TitleLevel = 1 | 2 | 3 | 4 | 5;

export interface TitleProps extends BaseTypographyProps {
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

  if (body.editing) {
    return (
      <Tag
        ref={ref as React.Ref<HTMLHeadingElement>}
        className={buildClass(rest, `typo typo-title h${level}`, "editing")}
        style={rest.style}
      >
        <EditableEditor
          initial={body.editConf.text ?? body.fallbackText}
          multiline={false}
          maxLength={body.editConf.maxLength}
          autoSize={body.editConf.autoSize}
          onConfirm={body.handleConfirm}
          onCancel={body.handleCancel}
        />
      </Tag>
    );
  }

  const element = (
    <Tag
      ref={ref as React.Ref<HTMLHeadingElement>}
      className={buildClass(rest, `typo typo-title h${level}`, body.extraCls)}
      style={body.style}
    >
      {body.inner}
      {body.expandNode}
      {body.copyNode}
      {body.editIconNode}
    </Tag>
  );

  return body.tooltipContent ? (
    <EllipsisTooltip ref={ref as React.Ref<HTMLElement>} content={body.tooltipContent}>
      {element}
    </EllipsisTooltip>
  ) : element;
});
Title.displayName = "Typography.Title";

/* ============================================================================
 * Text — inline span
 * ========================================================================== */

export interface TextProps extends BaseTypographyProps {
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

  if (body.editing) {
    return (
      <Tag
        ref={ref as React.Ref<HTMLSpanElement>}
        className={buildClass(rest, "typo typo-text", "editing")}
        style={rest.style}
      >
        <EditableEditor
          initial={body.editConf.text ?? body.fallbackText}
          multiline={false}
          maxLength={body.editConf.maxLength}
          autoSize={body.editConf.autoSize}
          onConfirm={body.handleConfirm}
          onCancel={body.handleCancel}
        />
      </Tag>
    );
  }

  const element = (
    <Tag
      ref={ref as React.Ref<HTMLSpanElement>}
      className={buildClass(rest, "typo typo-text", body.extraCls)}
      style={body.style}
    >
      {body.inner}
      {body.expandNode}
      {body.copyNode}
      {body.editIconNode}
    </Tag>
  );

  return body.tooltipContent ? (
    <EllipsisTooltip ref={ref as React.Ref<HTMLElement>} content={body.tooltipContent}>
      {element}
    </EllipsisTooltip>
  ) : element;
});
Text.displayName = "Typography.Text";

/* ============================================================================
 * Paragraph — block <p>
 * ========================================================================== */

export interface ParagraphProps extends BaseTypographyProps {}

/**
 * `Typography.Paragraph` — block paragraph with the same decorations as `Text`.
 *
 * @example
 * <Paragraph ellipsis={{ rows: 3, expandable: true }}>{long}</Paragraph>
 */
export const Paragraph = React.forwardRef<HTMLParagraphElement, ParagraphProps>(
  (props, ref) => {
    const body = useTypographyBody({ ...props, multilineEdit: true });

    if (body.editing) {
      return (
        <div
          ref={ref as unknown as React.Ref<HTMLDivElement>}
          className={buildClass(props, "typo typo-paragraph", "editing")}
          style={props.style}
        >
          <EditableEditor
            initial={body.editConf.text ?? body.fallbackText}
            multiline
            maxLength={body.editConf.maxLength}
            autoSize={body.editConf.autoSize ?? true}
            onConfirm={body.handleConfirm}
            onCancel={body.handleCancel}
          />
        </div>
      );
    }

    const element = (
      <p
        ref={ref}
        className={buildClass(props, "typo typo-paragraph", body.extraCls)}
        style={body.style}
      >
        {body.inner}
        {body.expandNode}
        {body.copyNode}
        {body.editIconNode}
      </p>
    );

    return body.tooltipContent ? (
      <EllipsisTooltip ref={ref as React.Ref<HTMLElement>} content={body.tooltipContent}>
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
    });

    const safeRel =
      target === "_blank" ? rel ?? "noopener noreferrer" : rel;

    if (body.editing) {
      return (
        <span
          className={buildClass(props, "typo typo-link", "editing")}
          style={style}
        >
          <EditableEditor
            initial={body.editConf.text ?? body.fallbackText}
            multiline={false}
            maxLength={body.editConf.maxLength}
            autoSize={body.editConf.autoSize}
            onConfirm={body.handleConfirm}
            onCancel={body.handleCancel}
          />
        </span>
      );
    }

    const element = (
      <a
        ref={ref}
        className={buildClass(props, "typo typo-link", body.extraCls)}
        style={body.style}
        target={target}
        rel={safeRel}
        aria-disabled={disabled || undefined}
        onClick={(e) => {
          if (disabled) {
            e.preventDefault();
            return;
          }
          anchorRest.onClick?.(e);
        }}
        {...anchorRest}
      >
        {body.inner}
        {external && (
          <span className="typo-link-ext" aria-hidden>
            <Icon name={externalIcon} size={12} />
          </span>
        )}
        {body.expandNode}
        {body.copyNode}
        {body.editIconNode}
      </a>
    );

    return body.tooltipContent ? (
      <EllipsisTooltip ref={ref as React.Ref<HTMLElement>} content={body.tooltipContent}>
        {element}
      </EllipsisTooltip>
    ) : element;
  }
);
Link.displayName = "Typography.Link";

/* ============================================================================
 * Typography wrapper (article-style block)
 * ========================================================================== */

export interface TypographyProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

interface TypographyComponent
  extends React.ForwardRefExoticComponent<
    TypographyProps & React.RefAttributes<HTMLDivElement>
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
const TypographyBase = React.forwardRef<HTMLDivElement, TypographyProps>(
  ({ className = "", children, ...rest }, ref) => (
    <article
      ref={ref as unknown as React.Ref<HTMLElement>}
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
