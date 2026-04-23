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

export interface SegmentedProps<T extends string = string>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  options: { value: T; label: React.ReactNode; disabled?: boolean }[];
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  size?: "sm" | "md";
  className?: string;
}

type SegmentedComponent = <T extends string = string>(
  props: SegmentedProps<T> & React.RefAttributes<HTMLDivElement>
) => React.ReactElement | null;

const SegmentedInner = <T extends string = string>({
  options,
  value,
  defaultValue,
  onChange,
  size = "md",
  className = "",
  ...rest
}: SegmentedProps<T>, ref: React.ForwardedRef<HTMLDivElement>) => {
  const [inner, setInner] = React.useState<T | undefined>(defaultValue ?? options[0]?.value);
  const isControlled = value !== undefined;
  const v = isControlled ? value : inner;
  const pick = (next: T) => {
    if (!isControlled) setInner(next);
    onChange?.(next);
  };
  return (
    <div ref={ref} className={`segmented ${size} ${className}`} {...rest}>
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
};

/** `Segmented` — exclusive choice chip row. */
export const Segmented = React.forwardRef(SegmentedInner) as SegmentedComponent;
(Segmented as any).displayName = "Segmented";
