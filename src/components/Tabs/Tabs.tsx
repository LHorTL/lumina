import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Tabs.css";
import * as React from "react";
import { withComponentTheme, type ComponentThemeProps } from "../Theme/ComponentTheme";

export interface TabItem {
  key: string;
  label: React.ReactNode;
  disabled?: boolean;
  content?: React.ReactNode;
}

export interface TabsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange">,
    ComponentThemeProps {
  items: TabItem[];
  activeKey?: string;
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
  variant?: "line" | "pill" | "segmented";
  /** Center-align the tab bar horizontally. */
  centered?: boolean;
  /** 标签条容器的附加类名。 */
  tabBarClassName?: string;
  /** 正文容器的附加类名。 */
  contentClassName?: string;
  /** 占满父容器，并让正文区域独立滚动。 */
  fill?: boolean;
  className?: string;
}

/** 返回第一项未禁用标签的 key。 */
const getFirstEnabledKey = (items: TabItem[]): string | undefined =>
  items.find((item) => !item.disabled)?.key;

/** `Tabs` — switchable sections. */
const TabsBase = React.forwardRef<HTMLDivElement, TabsProps>(({
  items,
  activeKey,
  defaultActiveKey,
  onChange,
  variant = "line",
  centered,
  tabBarClassName = "",
  contentClassName = "",
  fill = false,
  className = "",
  ...rest
}, ref) => {
  const baseId = React.useId();
  const tabRefs = React.useRef(new Map<string, HTMLButtonElement>());
  const [inner, setInner] = React.useState(defaultActiveKey ?? getFirstEnabledKey(items));
  const isControlled = activeKey !== undefined;
  const requested = isControlled ? activeKey! : inner;
  const current = items.some((item) => item.key === requested && !item.disabled)
    ? requested
    : getFirstEnabledKey(items);

  const select = (k: string) => {
    if (items.find((item) => item.key === k)?.disabled) return;
    if (!isControlled) setInner(k);
    onChange?.(k);
  };

  /** 按 WAI-ARIA Tabs 规则移动焦点并自动激活目标标签。 */
  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const enabled = items.filter((item) => !item.disabled);
    const index = enabled.findIndex((item) => item.key === current);
    let target: TabItem | undefined;
    if (event.key === "ArrowRight") target = enabled[(index + 1) % enabled.length];
    if (event.key === "ArrowLeft") target = enabled[(index - 1 + enabled.length) % enabled.length];
    if (event.key === "Home") target = enabled[0];
    if (event.key === "End") target = enabled[enabled.length - 1];
    if (!target) return;
    event.preventDefault();
    tabRefs.current.get(target.key)?.focus();
    select(target.key);
  };

  const active = items.find((i) => i.key === current);
  const activeIndex = items.findIndex((item) => item.key === current);

  return (
    <div
      ref={ref}
      className={[
        "tabs",
        variant,
        centered ? "centered" : "",
        fill ? "fill" : "",
        className,
      ].filter(Boolean).join(" ")}
      {...rest}
    >
      <div className={["tabs-nav", tabBarClassName].filter(Boolean).join(" ")} role="tablist">
        {items.map((it, index) => (
          <button
            ref={(node) => {
              if (node) tabRefs.current.set(it.key, node);
              else tabRefs.current.delete(it.key);
            }}
            key={it.key}
            type="button"
            role="tab"
            id={`${baseId}-tab-${index}`}
            aria-selected={current === it.key}
            aria-controls={it.content !== undefined ? `${baseId}-panel-${index}` : undefined}
            tabIndex={current === it.key ? 0 : -1}
            disabled={it.disabled}
            className={`tab ${current === it.key ? "active" : ""}`}
            onClick={() => select(it.key)}
            onKeyDown={handleTabKeyDown}
          >
            {it.label}
          </button>
        ))}
      </div>
      {active?.content !== undefined && (
        <div
          id={`${baseId}-panel-${activeIndex}`}
          className={["tabs-content", contentClassName].filter(Boolean).join(" ")}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${activeIndex}`}
          tabIndex={0}
        >
          {active.content}
        </div>
      )}
    </div>
  );
});
TabsBase.displayName = "Tabs";

export const Tabs = withComponentTheme(TabsBase, "Tabs", "tabs");
