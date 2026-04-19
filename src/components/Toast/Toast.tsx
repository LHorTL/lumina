import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Toast.css";
import * as React from "react";
import ReactDOM from "react-dom";
import { Icon } from "../Icon";

export type ToastType = "info" | "success" | "warning" | "danger";

export interface ToastItem {
  id: number;
  type: ToastType;
  title?: React.ReactNode;
  message?: React.ReactNode;
  duration?: number;
}

type ListenerState = ToastItem[];
const listeners = new Set<(s: ListenerState) => void>();
let items: ListenerState = [];
let uid = 0;

function emit() {
  listeners.forEach((l) => l(items));
}

export const toast = {
  show(t: Omit<ToastItem, "id">) {
    const id = ++uid;
    items = [...items, { ...t, id, duration: t.duration ?? 3200 }];
    emit();
    if (items[items.length - 1].duration! > 0) {
      setTimeout(() => toast.dismiss(id), items[items.length - 1].duration);
    }
    return id;
  },
  info: (message: React.ReactNode, title?: React.ReactNode) => toast.show({ type: "info", message, title }),
  success: (message: React.ReactNode, title?: React.ReactNode) => toast.show({ type: "success", message, title }),
  warn: (message: React.ReactNode, title?: React.ReactNode) => toast.show({ type: "warning", message, title }),
  error: (message: React.ReactNode, title?: React.ReactNode) => toast.show({ type: "danger", message, title }),
  dismiss(id: number) {
    items = items.filter((i) => i.id !== id);
    emit();
  },
  clear() {
    items = [];
    emit();
  },
};

export interface ToastContainerProps {
  placement?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center";
}

/** `ToastContainer` — mount once at your app root; subscribes to `toast.*` calls. */
export const ToastContainer: React.FC<ToastContainerProps> = ({ placement = "top-right" }) => {
  const [list, setList] = React.useState<ListenerState>(items);
  React.useEffect(() => {
    listeners.add(setList);
    return () => {
      listeners.delete(setList);
    };
  }, []);
  if (typeof document === "undefined") return null;
  return ReactDOM.createPortal(
    <div className={`toast-container ${placement}`}>
      {list.map((t) => {
        const iconName =
          t.type === "success" ? "check2" : t.type === "warning" ? "alert" : t.type === "danger" ? "alert" : "info";
        return (
          <div key={t.id} className={`toast ${t.type}`} role="status">
            <Icon name={iconName} size={18} className="toast-icon" />
            <div className="toast-body">
              {t.title && <div className="toast-title">{t.title}</div>}
              {t.message && <div className="toast-msg">{t.message}</div>}
            </div>
            <button type="button" className="toast-close" onClick={() => toast.dismiss(t.id)} aria-label="Dismiss">
              <Icon name="x" size={14} />
            </button>
          </div>
        );
      })}
    </div>,
    document.body
  );
};
