import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Cascader.css";
import * as React from "react";
import { Icon, type IconName } from "../Icon";

export interface CascaderOption {
  value: string;
  label: React.ReactNode;
  icon?: IconName;
  children?: CascaderOption[];
  disabled?: boolean;
}

export interface CascaderProps {
  options: CascaderOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (path: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/** `Cascader` — multi-column hierarchical selector. */
export const Cascader: React.FC<CascaderProps> = ({
  options,
  value,
  defaultValue = [],
  onChange,
  placeholder = "请选择",
  disabled,
  className = "",
}) => {
  const [inner, setInner] = React.useState<string[]>(defaultValue);
  const isControlled = value !== undefined;
  const cur = isControlled ? value! : inner;
  const [open, setOpen] = React.useState(false);
  const [path, setPath] = React.useState<string[]>(cur);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
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
    <div ref={ref} className={`cascader ${open ? "open" : ""} ${className}`}>
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
      {open && (
        <div className="cascader-panel">
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
        </div>
      )}
    </div>
  );
};
