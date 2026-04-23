import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Cascader.css";
import * as React from "react";
import { createPortal } from "react-dom";
import { Icon, type IconName } from "../Icon";
import { useFloating } from "../../utils/useFloating";

export interface CascaderOption {
  value: string;
  label: React.ReactNode;
  icon?: IconName;
  children?: CascaderOption[];
  disabled?: boolean;
}

export interface CascaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  options: CascaderOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (path: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/** `Cascader` — multi-column hierarchical selector. */
export const Cascader = React.forwardRef<HTMLDivElement, CascaderProps>(({
  options,
  value,
  defaultValue = [],
  onChange,
  placeholder = "请选择",
  disabled,
  className = "",
  ...rest
}, ref) => {
  const [inner, setInner] = React.useState<string[]>(defaultValue);
  const isControlled = value !== undefined;
  const cur = isControlled ? value! : inner;
  const [open, setOpen] = React.useState(false);
  const [path, setPath] = React.useState<string[]>(cur);
  const panelRef = React.useRef<HTMLDivElement>(null);

  const { triggerRef, floatingStyle } = useFloating<HTMLDivElement>({
    open,
    placement: "bottom",
    panelWidth: 520,
    panelHeight: 260,
  });

  const setTriggerRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      (triggerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref, triggerRef]
  );

  React.useEffect(() => {
      const h = (e: MouseEvent) => {
        const t = e.target as Node;
        if (triggerRef.current?.contains(t)) return;
        if (panelRef.current?.contains(t)) return;
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (open) setPath(cur);
  }, [open, cur]);

  const columns: CascaderOption[][] = [options];
  let cursor: CascaderOption[] = options;
  for (const v of path) {
    const match: CascaderOption | undefined = cursor.find((o) => o.value === v);
    if (match && match.children) {
      cursor = match.children;
      columns.push(cursor);
    } else break;
  }

  const pick = (depth: number, val: string, hasChildren: boolean) => {
    const np = [...path.slice(0, depth), val];
    setPath(np);
    if (!hasChildren) {
      if (!isControlled) setInner(np);
      onChange?.(np);
      setOpen(false);
    }
  };

  const labels: React.ReactNode[] = [];
  let list: CascaderOption[] = options;
  for (const v of cur) {
    const m: CascaderOption | undefined = list.find((o) => o.value === v);
    if (!m) break;
    labels.push(m.label);
    if (!m.children) break;
    list = m.children;
  }

  return (
    <div ref={setTriggerRef} className={`cascader ${open ? "open" : ""} ${className}`} {...rest}>
      <button
        type="button"
        className={`cascader-trigger ${labels.length === 0 ? "placeholder" : ""}`}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
      >
        <span style={{ flex: 1 }}>
          {labels.length ? labels.map((l, i) => <span key={i}>{i > 0 && " / "}{l}</span>) : placeholder}
        </span>
        <span style={{ position: "absolute", right: 12, color: "var(--fg-subtle)" }}>
          <Icon name="chevDown" size={14} />
        </span>
      </button>
      {open && typeof document !== "undefined" &&
        createPortal(
          <div ref={panelRef} className="cascader-panel" style={floatingStyle}>
            {columns.map((col, depth) => (
              <div key={depth} className="cascader-col">
                {col.map((o) => {
                  const isActive = path[depth] === o.value;
                  const hasChildren = !!(o.children && o.children.length);
                  return (
                    <button
                      key={o.value}
                      type="button"
                      className={`cascader-item ${isActive ? "active" : ""}`}
                      disabled={o.disabled}
                      onClick={() => pick(depth, o.value, hasChildren)}
                    >
                      {o.icon && <Icon name={o.icon} size={13} />}
                      <span>{o.label}</span>
                      {hasChildren && (
                        <span className="chev">
                          <Icon name="chevRight" size={12} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
});
Cascader.displayName = "Cascader";
