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

export interface TabsProps {
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
export const Tabs: React.FC<TabsProps> = ({
  items,
  activeKey,
  defaultActiveKey,
  onChange,
  variant = "line",
  centered,
  className = "",
}) => {
  const [inner, setInner] = React.useState(defaultActiveKey ?? items[0]?.key);
  const isControlled = activeKey !== undefined;
  const current = isControlled ? activeKey! : inner;

  const select = (k: string) => {
    if (!isControlled) setInner(k);
    onChange?.(k);
  };

  const active = items.find((i) => i.key === current);

  return (
    <div className={`tabs ${variant} ${centered ? "centered" : ""} ${className}`}>
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
};

export interface SegmentedProps<T extends string = string> {
  options: { value: T; label: React.ReactNode; disabled?: boolean }[];
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  size?: "sm" | "md";
  className?: string;
}

/** `Segmented` — exclusive choice chip row. */
export function Segmented<T extends string = string>({
  options,
  value,
  defaultValue,
  onChange,
  size = "md",
  className = "",
}: SegmentedProps<T>) {
  const [inner, setInner] = React.useState<T | undefined>(defaultValue ?? options[0]?.value);
  const isControlled = value !== undefined;
  const v = isControlled ? value : inner;
  const pick = (next: T) => {
    if (!isControlled) setInner(next);
    onChange?.(next);
  };
  return (
    <div className={`segmented ${size} ${className}`}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          disabled={o.disabled}
          className={`seg ${v === o.value ? "active" : ""}`}
          onClick={() => pick(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
