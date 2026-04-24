import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Collapse.css";
import * as React from "react";
import { Icon } from "../Icon";

export interface CollapseItem {
  key: string;
  label: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
}

export interface CollapseProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  items: CollapseItem[];
  /** If true, at most one item can be open at a time. */
  accordion?: boolean;
  /** If false, at most one section can be open. Kept for explicit Lumina layouts. */
  multiple?: boolean;
  /**
   * What triggers expansion.
   * - `"header"` (default): clicking anywhere on the header toggles.
   * - `"icon"`: only the chevron icon is clickable.
   * - `"disabled"`: the panel cannot be toggled.
   */
  collapsible?: "header" | "icon" | "disabled";
  activeKey?: string | string[];
  defaultActiveKey?: string | string[];
  onChange?: (keys: string[]) => void;
  ghost?: boolean;
  size?: "small" | "middle" | "large";
  className?: string;
}

const CollapsePanel: React.FC<{ open: boolean; children: React.ReactNode }> = ({ open, children }) => {
  const innerRef = React.useRef<HTMLDivElement>(null);
  const [h, setH] = React.useState(0);
  const [animated, setAnimated] = React.useState(false);

  React.useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    setH(el.scrollHeight);
    const ro = new ResizeObserver(() => setH(el.scrollHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  React.useEffect(() => {
    const id = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className="collapse-body"
      style={{ maxHeight: open ? h : 0, transition: animated ? undefined : "none" }}
      aria-hidden={!open}
    >
      <div ref={innerRef} className="collapse-body-inner">{children}</div>
    </div>
  );
};

const normalizeKeys = (value: string | string[] | undefined): string[] =>
  value == null ? [] : Array.isArray(value) ? value : [value];

/** `Collapse` — collapsible sections. */
export const Collapse = React.forwardRef<HTMLDivElement, CollapseProps>(({
  items,
  accordion = false,
  multiple = true,
  collapsible = "header",
  activeKey,
  defaultActiveKey,
  onChange,
  ghost = false,
  size = "middle",
  className = "",
  ...rest
}, ref) => {
  const [inner, setInner] = React.useState<string[]>(() => normalizeKeys(defaultActiveKey));
  const isControlled = activeKey !== undefined;
  const keys = isControlled ? normalizeKeys(activeKey) : inner;

  const singleOpen = accordion || !multiple;

  const toggle = (k: string, itemDisabled?: boolean) => {
    if (collapsible === "disabled" || itemDisabled) return;
    const next = keys.includes(k)
      ? keys.filter((x) => x !== k)
      : singleOpen
      ? [k]
      : [...keys, k];
    if (!isControlled) setInner(next);
    onChange?.(next);
  };

  return (
    <div
      ref={ref}
      className={`collapse ${ghost ? "ghost" : ""} ${size} ${className}`}
      {...rest}
    >
      {items.map((it) => {
        const open = keys.includes(it.key);
        const isDisabled = it.disabled || collapsible === "disabled";
        const headerClickable = collapsible === "header" && !isDisabled;
        return (
          <div
            key={it.key}
            className={`collapse-item ${open ? "open" : ""} ${isDisabled ? "disabled" : ""} ${collapsible === "icon" ? "icon-only" : ""}`}
          >
            <button
              type="button"
              className="collapse-head"
              disabled={isDisabled}
              onClick={() => headerClickable && toggle(it.key, it.disabled)}
              aria-expanded={open}
            >
              <span>{it.label}</span>
              <span
                className={`collapse-chev${collapsible === "icon" ? " clickable" : ""}`}
                onClick={(e) => {
                  if (collapsible === "icon" && !isDisabled) {
                    e.stopPropagation();
                    toggle(it.key, it.disabled);
                  }
                }}
              >
                <Icon name="chevDown" size={16} />
              </span>
            </button>
            <CollapsePanel open={open}>{it.children}</CollapsePanel>
          </div>
        );
      })}
    </div>
  );
});
Collapse.displayName = "Collapse";
