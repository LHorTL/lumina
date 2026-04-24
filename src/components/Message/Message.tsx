import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Message.css";
import * as React from "react";
import { createPortal } from "react-dom";
import { createRoot } from "react-dom/client";
import { Icon } from "../Icon";

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

export type MessageMethod = (
  configOrContent: MessageConfig | React.ReactNode,
  durationOrTitle?: number | React.ReactNode,
  onClose?: () => void
) => number;

export interface MessageApi {
  open(config: MessageConfig): number;
  show(config: MessageConfig): number;
  info: MessageMethod;
  success: MessageMethod;
  warning: MessageMethod;
  warn: MessageMethod;
  error: MessageMethod;
  dismiss(idOrKey: number | React.Key): void;
  destroy(idOrKey?: number | React.Key): void;
  clear(): void;
}

type ListenerState = MessageItem[];
const listeners = new Set<(s: ListenerState) => void>();
let items: ListenerState = [];
let uid = 0;
let autoMounted = false;

function emit() {
  if (listeners.size === 0 && !autoMounted && typeof document !== "undefined") {
    autoMounted = true;
    const div = document.createElement("div");
    document.body.appendChild(div);
    createRoot(div).render(React.createElement(MessageContainer));
  }
  listeners.forEach((l) => l(items));
}

const normalizeConfig = (
  type: MessageType,
  content: MessageConfig | React.ReactNode,
  durationOrTitle?: number | React.ReactNode,
  onClose?: () => void
): MessageConfig => {
  if (
    content &&
    typeof content === "object" &&
    !React.isValidElement(content) &&
    ("content" in (content as MessageConfig) ||
      "message" in (content as MessageConfig) ||
      "type" in (content as MessageConfig))
  ) {
    return { type, ...(content as MessageConfig) };
  }

  const node = content as React.ReactNode;
  if (typeof durationOrTitle === "number") {
    return { type, content: node, duration: durationOrTitle, onClose };
  }

  return { type, content: node, title: durationOrTitle };
};

export const message: MessageApi = {
  open(config) {
    const id = ++uid;
    const next: MessageItem = {
      id,
      key: config.key,
      type: config.type ?? "info",
      title: config.title,
      content: config.content ?? config.message,
      duration: config.duration ?? 3200,
      onClose: config.onClose,
    };

    if (config.key != null) {
      const existing = items.findIndex((item) => item.key === config.key);
      if (existing >= 0) {
        items = items.map((item, idx) => (idx === existing ? { ...next, id: item.id } : item));
        emit();
        return items[existing]?.id ?? id;
      }
    }

    items = [...items, next];
    emit();
    if (next.duration! > 0 && typeof window !== "undefined") {
      window.setTimeout(() => message.dismiss(config.key ?? id), next.duration);
    }
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
  dismiss(idOrKey) {
    const removed = items.filter((i) => i.id === idOrKey || i.key === idOrKey);
    items = items.filter((i) => i.id !== idOrKey && i.key !== idOrKey);
    removed.forEach((item) => item.onClose?.());
    emit();
  },
  destroy(idOrKey) {
    if (idOrKey == null) message.clear();
    else message.dismiss(idOrKey);
  },
  clear() {
    const removed = items;
    items = [];
    removed.forEach((item) => item.onClose?.());
    emit();
  },
};

export interface MessageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  placement?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center";
}

/** `MessageContainer` — optional app-root mount point for `message.*` calls. */
export const MessageContainer = React.forwardRef<HTMLDivElement, MessageContainerProps>(({ placement = "top-right", className = "", ...rest }, ref) => {
  const [list, setList] = React.useState<ListenerState>(items);
  React.useEffect(() => {
    listeners.add(setList);
    return () => {
      listeners.delete(setList);
    };
  }, []);
  if (typeof document === "undefined") return null;
  return createPortal(
    <div ref={ref} className={`message-container ${placement} ${className}`} {...rest}>
      {list.map((t) => {
        const iconName =
          t.type === "success" ? "check2" : t.type === "warning" || t.type === "error" ? "alert" : "info";
        return (
          <div key={t.id} className={`message ${t.type}`} role="status">
            <Icon name={iconName} size={18} className="message-icon" />
            <div className="message-body">
              {t.title && <div className="message-title">{t.title}</div>}
              {t.content && <div className="message-content">{t.content}</div>}
            </div>
            <button type="button" className="message-close" onClick={() => message.dismiss(t.key ?? t.id)} aria-label="Dismiss">
              <Icon name="x" size={14} />
            </button>
          </div>
        );
      })}
    </div>,
    document.body
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
