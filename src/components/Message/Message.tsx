import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Message.css";
import * as React from "react";
import { createPortal } from "react-dom";
import { createRoot } from "react-dom/client";
import { Icon } from "../Icon";
import { usePortalContainer } from "../../utils/portal";
import { useOverlayZIndex } from "../../utils/overlayStack";

export type MessageType = "info" | "success" | "warning" | "error";

export interface MessageConfig {
  /** Message body. */
  content?: React.ReactNode;
  /** Alias for callers that pass `{ message }` instead of `{ content }`. */
  message?: React.ReactNode;
  /** Optional title shown above the body. */
  title?: React.ReactNode;
  type?: MessageType;
  /** Auto-dismiss delay in ms. `0` keeps it until manually closed. */
  duration?: number;
  /** Stable key; opening another message with the same key updates it. */
  key?: React.Key;
  onClose?: () => void;
}

export interface MessageItem {
  id: number;
  key?: React.Key;
  type: MessageType;
  title?: React.ReactNode;
  content?: React.ReactNode;
  duration?: number;
  onClose?: () => void;
}

/**
 * 语义消息方法：支持配置对象，也支持“内容 + 时长/标题 + 关闭回调”调用方式。
 * 第二个参数为数字时表示毫秒时长，否则作为标题渲染。
 */
export type MessageMethod = (
  configOrContent: MessageConfig | React.ReactNode,
  durationOrTitle?: number | React.ReactNode,
  onClose?: () => void
) => number;

export interface MessageApi {
  /** 通过完整配置创建或按 key 更新消息。 */
  open(config: MessageConfig): number;
  /** `open` 的等价别名。 */
  show(config: MessageConfig): number;
  info: MessageMethod;
  success: MessageMethod;
  warning: MessageMethod;
  warn: MessageMethod;
  error: MessageMethod;
  /** 按消息内部 id 精确关闭，避免与数字 key 混淆。 */
  dismissById(id: number): void;
  /** 按调用方提供的 key 精确关闭。 */
  dismissByKey(key: React.Key): void;
  /**
   * 兼容关闭方法：优先把参数识别为现有 key；没有同值 key 时，数字参数才按内部 id 处理。
   * 新代码建议使用 `dismissById` 或 `dismissByKey` 明确语义。
   */
  dismiss(idOrKey: number | React.Key): void;
  /** `dismiss` 的兼容别名；不传参数时清空全部消息。 */
  destroy(idOrKey?: number | React.Key): void;
  /** 清空全部消息，并为每条消息执行一次 `onClose`。 */
  clear(): void;
}

type ListenerState = MessageItem[];
const listeners = new Set<(s: ListenerState) => void>();
let items: ListenerState = [];
let uid = 0;
let autoMounted = false;
const timers = new Map<number, number>();

/** 清理指定消息的自动关闭计时器。 */
function clearMessageTimer(id: number): void {
  const timer = timers.get(id);
  if (timer != null && typeof window !== "undefined") window.clearTimeout(timer);
  timers.delete(id);
}

/** 按消息当前 duration 重新建立自动关闭计时器。 */
function scheduleMessageTimer(item: MessageItem): void {
  clearMessageTimer(item.id);
  if (!item.duration || item.duration <= 0 || typeof window === "undefined") return;
  const timer = window.setTimeout(() => message.dismissById(item.id), item.duration);
  timers.set(item.id, timer);
}

/** 把最新消息列表通知给所有容器，必要时自动挂载默认容器。 */
function emit() {
  if (listeners.size === 0 && !autoMounted && typeof document !== "undefined") {
    autoMounted = true;
    const div = document.createElement("div");
    document.body.appendChild(div);
    createRoot(div).render(React.createElement(MessageContainer));
  }
  listeners.forEach((l) => l(items));
}

/** 判断一个普通对象是否应按 MessageConfig 而不是 ReactNode 处理。 */
const isMessageConfig = (value: unknown): value is MessageConfig => {
  if (value == null || typeof value !== "object" || Array.isArray(value) || React.isValidElement(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

/** 统一配置对象、时长重载和标题重载为 MessageConfig。 */
const normalizeConfig = (
  type: MessageType,
  content: MessageConfig | React.ReactNode,
  durationOrTitle?: number | React.ReactNode,
  onClose?: () => void
): MessageConfig => {
  if (isMessageConfig(content)) return { type, ...content };

  const node = content as React.ReactNode;
  if (typeof durationOrTitle === "number") {
    return { type, content: node, duration: durationOrTitle, onClose };
  }

  return { type, content: node, title: durationOrTitle, onClose };
};

/** 删除满足条件的消息，并确保计时器与 onClose 只执行一次。 */
function removeMessages(predicate: (item: MessageItem) => boolean): void {
  const removed = items.filter(predicate);
  if (removed.length === 0) return;
  const removedIds = new Set(removed.map((item) => item.id));
  items = items.filter((item) => !removedIds.has(item.id));
  removed.forEach((item) => {
    clearMessageTimer(item.id);
    item.onClose?.();
  });
  emit();
}

export const message: MessageApi = {
  open(config) {
    const generatedId = ++uid;
    const existing = config.key == null
      ? -1
      : items.findIndex((item) => item.key === config.key);
    const id = existing >= 0 ? items[existing].id : generatedId;
    const next: MessageItem = {
      id,
      key: config.key,
      type: config.type ?? "info",
      title: config.title,
      content: config.content ?? config.message,
      duration: config.duration ?? 3200,
      onClose: config.onClose,
    };

    if (existing >= 0) {
      items = items.map((item, index) => (index === existing ? next : item));
      emit();
      scheduleMessageTimer(next);
      return id;
    }

    items = [...items, next];
    emit();
    scheduleMessageTimer(next);
    return id;
  },
  show(config) {
    return message.open(config);
  },
  info: (content, durationOrTitle, onClose) =>
    message.open(normalizeConfig("info", content, durationOrTitle, onClose)),
  success: (content, durationOrTitle, onClose) =>
    message.open(normalizeConfig("success", content, durationOrTitle, onClose)),
  warning: (content, durationOrTitle, onClose) =>
    message.open(normalizeConfig("warning", content, durationOrTitle, onClose)),
  warn: (content, durationOrTitle, onClose) =>
    message.open(normalizeConfig("warning", content, durationOrTitle, onClose)),
  error: (content, durationOrTitle, onClose) =>
    message.open(normalizeConfig("error", content, durationOrTitle, onClose)),
  dismissById(id) {
    removeMessages((item) => item.id === id);
  },
  dismissByKey(key) {
    removeMessages((item) => item.key === key);
  },
  dismiss(idOrKey) {
    if (items.some((item) => item.key === idOrKey)) message.dismissByKey(idOrKey);
    else if (typeof idOrKey === "number") message.dismissById(idOrKey);
  },
  destroy(idOrKey) {
    if (idOrKey == null) message.clear();
    else message.dismiss(idOrKey);
  },
  clear() {
    const removed = items;
    items = [];
    removed.forEach((item) => {
      clearMessageTimer(item.id);
      item.onClose?.();
    });
    emit();
  },
};

export interface MessageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  placement?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center";
}

/** `MessageContainer` — optional app-root mount point for `message.*` calls. */
export const MessageContainer = React.forwardRef<HTMLDivElement, MessageContainerProps>(({ placement = "top-right", className = "", style, ...rest }, ref) => {
  const portalContainer = usePortalContainer();
  const [list, setList] = React.useState<ListenerState>(items);
  const explicitZIndex = typeof style?.zIndex === "number" ? style.zIndex : undefined;
  const overlayZIndex = useOverlayZIndex(list.length > 0, explicitZIndex);
  React.useEffect(() => {
    listeners.add(setList);
    return () => {
      listeners.delete(setList);
    };
  }, []);
  if (!portalContainer) return null;
  return createPortal(
    <div
      ref={ref}
      className={`message-container ${placement} ${className}`}
      style={{ ...style, zIndex: style?.zIndex ?? overlayZIndex }}
      {...rest}
    >
      {list.map((t) => {
        const iconName =
          t.type === "success" ? "check2" : t.type === "warning" || t.type === "error" ? "alert" : "info";
        return (
          <div
            key={t.id}
            className={`message ${t.type}`}
            role={t.type === "error" || t.type === "warning" ? "alert" : "status"}
          >
            <Icon name={iconName} size={18} className="message-icon" />
            <div className="message-body">
              {t.title != null && <div className="message-title">{t.title}</div>}
              {t.content != null && <div className="message-content">{t.content}</div>}
            </div>
            <button type="button" className="message-close" onClick={() => message.dismissById(t.id)} aria-label="Dismiss">
              <Icon name="x" size={14} />
            </button>
          </div>
        );
      })}
    </div>,
    portalContainer
  );
});
MessageContainer.displayName = "MessageContainer";

export type ToastType = MessageType;
export type ToastItem = MessageItem;
export type ToastContainerProps = MessageContainerProps;

/** @deprecated Use `message` instead. */
export const toast = message;
/** @deprecated Use `MessageContainer` instead. */
export const ToastContainer = MessageContainer;
