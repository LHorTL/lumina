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

/** 折叠内容区域的内部属性。 */
interface CollapsePanelProps {
  open: boolean;
  id: string;
  labelledBy: string;
  children: React.ReactNode;
}

/** 负责高度动画并在关闭时阻止内部控件获得焦点。 */
const CollapsePanel: React.FC<CollapsePanelProps> = ({ open, id, labelledBy, children }) => {
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
      id={id}
      className="collapse-body"
      style={{ maxHeight: open ? h : 0, transition: animated ? undefined : "none" }}
      aria-hidden={!open}
      aria-labelledby={labelledBy}
      role="region"
      {...(!open
        ? ({ inert: "" } as unknown as React.HTMLAttributes<HTMLDivElement>)
        : {})}
    >
      <div ref={innerRef} className="collapse-body-inner">{children}</div>
    </div>
  );
};

/** 把外部键值归一为数组，并在单开模式中只保留首项。 */
const normalizeKeys = (value: string | string[] | undefined, singleOpen = false): string[] => {
  const keys = value == null ? [] : Array.isArray(value) ? value : [value];
  return singleOpen ? keys.slice(0, 1) : keys;
};

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
  const baseId = React.useId();
  const singleOpen = accordion || !multiple;
  const [inner, setInner] = React.useState<string[]>(() => normalizeKeys(defaultActiveKey, singleOpen));
  const isControlled = activeKey !== undefined;
  const keys = normalizeKeys(isControlled ? activeKey : inner, singleOpen);

  React.useEffect(() => {
    if (!isControlled && singleOpen && inner.length > 1) setInner(inner.slice(0, 1));
  }, [inner, isControlled, singleOpen]);

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
      {items.map((it, index) => {
        const open = keys.includes(it.key);
        const isDisabled = it.disabled || collapsible === "disabled";
        const headerClickable = collapsible === "header" && !isDisabled;
        const headerId = `${baseId}-header-${index}`;
        const panelId = `${baseId}-panel-${index}`;
        return (
          <div
            key={it.key}
            className={`collapse-item ${open ? "open" : ""} ${isDisabled ? "disabled" : ""} ${collapsible === "icon" ? "icon-only" : ""}`}
          >
            {collapsible === "icon" ? (
              <div id={headerId} className="collapse-head">
                <span>{it.label}</span>
                <button
                  type="button"
                  className="collapse-chev clickable"
                  disabled={isDisabled}
                  onClick={() => toggle(it.key, it.disabled)}
                  aria-expanded={open}
                  aria-controls={panelId}
                  aria-label={open ? "收起面板" : "展开面板"}
                >
                  <Icon name="chevDown" size={16} aria-hidden />
                </button>
              </div>
            ) : (
              <button
                id={headerId}
                type="button"
                className="collapse-head"
                disabled={isDisabled}
                onClick={() => headerClickable && toggle(it.key, it.disabled)}
                aria-expanded={open}
                aria-controls={panelId}
              >
                <span>{it.label}</span>
                <span className="collapse-chev" aria-hidden>
                  <Icon name="chevDown" size={16} />
                </span>
              </button>
            )}
            <CollapsePanel open={open} id={panelId} labelledBy={headerId}>
              {it.children}
            </CollapsePanel>
          </div>
        );
      })}
    </div>
  );
});
Collapse.displayName = "Collapse";
