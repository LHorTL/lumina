import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Tabs.css";
import * as React from "react";

export interface TabItem {
  key: string;
  label: React.ReactNode;
  disabled?: boolean;
  content?: React.ReactNode;
}

export interface TabsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  items: TabItem[];
  activeKey?: string;
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
  variant?: "line" | "pill" | "segmented";
  /** Center-align the tab bar horizontally. */
  centered?: boolean;
  className?: string;
}

/** `Tabs` — switchable sections. */
export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(({
  items,
  activeKey,
  defaultActiveKey,
  onChange,
  variant = "line",
  centered,
  className = "",
  ...rest
}, ref) => {
  const [inner, setInner] = React.useState(defaultActiveKey ?? items[0]?.key);
  const isControlled = activeKey !== undefined;
  const current = isControlled ? activeKey! : inner;

  const select = (k: string) => {
    if (!isControlled) setInner(k);
    onChange?.(k);
  };

  const active = items.find((i) => i.key === current);

  return (
    <div ref={ref} className={`tabs ${variant} ${centered ? "centered" : ""} ${className}`} {...rest}>
      <div className="tabs-nav" role="tablist">
        {items.map((it) => (
          <button
            key={it.key}
            type="button"
            role="tab"
            aria-selected={current === it.key}
            disabled={it.disabled}
            className={`tab ${current === it.key ? "active" : ""}`}
            onClick={() => select(it.key)}
          >
            {it.label}
          </button>
        ))}
      </div>
      {active?.content !== undefined && <div className="tabs-content">{active.content}</div>}
    </div>
  );
});
Tabs.displayName = "Tabs";
