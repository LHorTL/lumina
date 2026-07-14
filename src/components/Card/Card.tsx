import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Card.css";
import * as React from "react";
import {
  InternalComponentThemePart,
  withComponentTheme,
  type ComponentThemeProps,
} from "../Theme/ComponentTheme";
import { Button } from "../Button";
import { Spin } from "../Spin";

/** 卡片正文允许透传的 data-* 属性。 */
type DataAttributes = {
  [K in `data-${string}`]?: string | number | boolean | undefined;
};
/** 卡片正文包装节点可接收的原生属性。 */
type CardBodyProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "className" | "style"
> &
  DataAttributes;

const CARD_INTERACTIVE_SELECTOR = [
  "a[href]",
  "button",
  "input",
  "select",
  "textarea",
  "[role='button']",
  "[role='link']",
  "[contenteditable='true']",
].join(",");

/** 判断事件是否来自卡片内部应独立响应的交互控件。 */
function isNestedCardControl(
  target: EventTarget | null,
  currentTarget: HTMLElement
): boolean {
  if (!(target instanceof Element)) return false;
  const control = target.closest(CARD_INTERACTIVE_SELECTOR);
  return !!control &&
    !control.classList.contains("card-interactive-control") &&
    control !== currentTarget &&
    currentTarget.contains(control);
}

/** 从常见 React 文本节点中提取可操作卡片的可访问名称。 */
function getCardText(node: React.ReactNode): string {
  return React.Children.toArray(node)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") return String(child);
      if (React.isValidElement<{ children?: React.ReactNode }>(child)) {
        return getCardText(child.props.children);
      }
      return "";
    })
    .filter(Boolean)
    .join(" ")
    .trim();
}

/** 判断 React 节点树中是否显式包含需要独立操作的控件。 */
function hasCardControlNode(node: React.ReactNode): boolean {
  return React.Children.toArray(node).some((child) => {
    if (!React.isValidElement<{ children?: React.ReactNode; role?: string }>(child)) return false;
    const type = child.type;
    const displayName = typeof type !== "string" && type != null
      ? (type as { displayName?: string }).displayName
      : undefined;
    const interactiveType =
      typeof type === "string" && ["a", "button", "input", "select", "textarea"].includes(type);
    if (interactiveType || displayName === "Button" || displayName === "IconButton") return true;
    if (child.props.role === "button" || child.props.role === "link") return true;
    return hasCardControlNode(child.props.children);
  });
}

/** 让视觉隐藏的整卡焦点按钮稳定响应 Enter 与 Space。 */
function handleCardControlKeyDown(event: React.KeyboardEvent<HTMLButtonElement>): void {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  event.currentTarget.click();
}

export interface CardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    ComponentThemeProps {
  /** Visual variant. `raised` protrudes; `sunken` recesses; `flat` is subtle. */
  variant?: "raised" | "sunken" | "flat";
  /** Custom card background. Accepts CSS colors, theme tokens, color-mix and gradients. */
  background?: React.CSSProperties["background"];
  /** Inner padding. */
  padding?: "none" | "sm" | "md" | "lg";
  /** When true, the card raises and lifts on hover. */
  hoverable?: boolean;
  /** 赋予卡片按钮式键盘语义；默认在提供 onClick 时自动开启。 */
  interactive?: boolean;
  /** 禁用交互式卡片。 */
  disabled?: boolean;
  /** Optional card heading. */
  title?: React.ReactNode;
  /** Secondary text shown under `title`. */
  description?: React.ReactNode;
  /** Action slot aligned to the card heading. */
  actions?: React.ReactNode;
  /** Make the card and its body fill the available height. */
  fill?: boolean;
  /** Body layout strategy. */
  bodyLayout?: "block" | "stack" | "fill" | "center";
  /** Class name forwarded to the card body wrapper. */
  bodyClassName?: string;
  /** Inline style forwarded to the card body wrapper. */
  bodyStyle?: React.CSSProperties;
  /** Extra DOM props forwarded to the card body wrapper. */
  bodyProps?: CardBodyProps;
  /** Show a built-in loading overlay above the body content. */
  loading?: boolean;
  /** Custom overlay content shown while `loading` is true. */
  loadingOverlay?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * `Card` — neumorphic surface container. Use to group related content.
 */
const CardBase = React.forwardRef<HTMLDivElement, CardProps>(
  ({
    variant = "raised",
    padding = "md",
    hoverable,
    interactive,
    disabled = false,
    title,
    description,
    actions,
    background,
    fill = false,
    bodyLayout,
    bodyClassName = "",
    bodyStyle,
    bodyProps,
    loading = false,
    loadingOverlay,
    className = "",
    style,
    children,
    onClick,
    onKeyDown,
    onClickCapture,
    onKeyDownCapture,
    role,
    tabIndex,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    ...rest
  }, ref) => {
    const contentRef = React.useRef<HTMLDivElement>(null);
    const headRef = React.useRef<HTMLDivElement>(null);
    const actionsRef = React.useRef<HTMLDivElement>(null);
    const isInteractive = interactive ?? !!onClick;
    React.useEffect(() => {
      const isolated = disabled || loading;
      if (contentRef.current) contentRef.current.inert = isolated;
      if (headRef.current) headRef.current.inert = isolated;
      if (actionsRef.current) actionsRef.current.inert = isolated;
    }, [disabled, loading]);
    const resolvedBodyLayout = bodyLayout ?? (fill ? "fill" : "block");
    const cls = [
      "card",
      variant,
      padding !== "md" && `pad-${padding}`,
      fill && "fill",
      hoverable && !disabled && !loading && "hoverable",
      isInteractive && "interactive",
      disabled && "disabled",
      loading && "loading",
      className,
    ]
      .filter(Boolean)
      .join(" ");
    const bodyCls = [
      "card-body",
      resolvedBodyLayout !== "block" && `body-${resolvedBodyLayout}`,
      loading && "loading",
      bodyClassName,
    ]
      .filter(Boolean)
      .join(" ");
    const cardStyle = background
      ? ({
          "--card-bg": background,
          ...style,
        } as React.CSSProperties)
      : style;
    const bodyLabel = hasCardControlNode(children) ? "" : getCardText(children);
    const interactiveLabel = ariaLabel ?? (getCardText(title ?? description) || bodyLabel || "可操作卡片");
    return (
      <div
        ref={(node) => {
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        className={cls}
        style={cardStyle}
        role={role}
        tabIndex={isInteractive ? undefined : tabIndex}
        aria-label={role ? ariaLabel : undefined}
        aria-labelledby={role ? ariaLabelledBy : undefined}
        aria-disabled={isInteractive && (disabled || loading) ? true : undefined}
        aria-busy={loading || undefined}
        onClickCapture={(event) => {
          if (disabled || loading) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }
          onClickCapture?.(event);
        }}
        onKeyDownCapture={(event) => {
          if (disabled || loading) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }
          onKeyDownCapture?.(event);
        }}
        onClick={(event) => {
          if (disabled || loading) {
            event.preventDefault();
            return;
          }
          if (isNestedCardControl(event.target, event.currentTarget)) return;
          onClick?.(event);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (
            isInteractive &&
            !disabled &&
            !loading &&
            !event.defaultPrevented &&
            event.target === event.currentTarget &&
            (event.key === "Enter" || event.key === " ")
          ) {
            event.preventDefault();
            event.currentTarget.click();
          }
        }}
        {...rest}
      >
        {isInteractive && (
          <InternalComponentThemePart components="Button">
            <Button
              type="button"
              variant="ghost"
              className="card-interactive-control"
              aria-label={interactiveLabel}
              aria-labelledby={ariaLabelledBy}
              tabIndex={disabled || loading ? -1 : tabIndex ?? 0}
              disabled={disabled || loading}
              onKeyDown={handleCardControlKeyDown}
            />
          </InternalComponentThemePart>
        )}
        {(title || description || actions) && (
          <div ref={headRef} className="card-head">
            <div className="card-titles">
              {title && <div className="card-title">{title}</div>}
              {description && <div className="card-desc">{description}</div>}
            </div>
            {actions && <div ref={actionsRef} className="card-actions">{actions}</div>}
          </div>
        )}
        <div {...bodyProps} className={bodyCls} style={bodyStyle}>
          <div
            ref={contentRef}
            className="card-body-content"
            aria-hidden={loading || undefined}
          >
            {children}
          </div>
          {loading && (
            <div className="card-loading-overlay" aria-live="polite">
              {loadingOverlay ?? (
                <InternalComponentThemePart components="Spin">
                  <Spin tip="加载中..." />
                </InternalComponentThemePart>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);
CardBase.displayName = "Card";

export const Card = withComponentTheme(
  CardBase,
  "Card",
  ["card", "button", "spin"]
);
