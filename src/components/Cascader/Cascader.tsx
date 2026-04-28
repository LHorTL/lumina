import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Cascader.css";
import * as React from "react";
import { createPortal } from "react-dom";
import { Icon, renderIconSlot, type IconSlot } from "../Icon";
import { Input } from "../Input";
import { useFloating } from "../../utils/useFloating";

export interface CascaderOption {
  value: string;
  label: React.ReactNode;
  /** Leading icon. Accepts a built-in icon name or custom React node. */
  icon?: IconSlot;
  children?: CascaderOption[];
  disabled?: boolean;
}

export interface CascaderShowSearchConfig {
  filter?: (inputValue: string, path: CascaderOption[]) => boolean;
  render?: (inputValue: string, path: CascaderOption[]) => React.ReactNode;
  limit?: number | false;
}

export interface CascaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  options: CascaderOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (path: string[], selectedOptions?: CascaderOption[]) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Show a clear button. */
  allowClear?: boolean;
  onClear?: () => void;
  /** Select intermediate nodes instead of only leaf nodes. */
  changeOnSelect?: boolean;
  /** Search mode. */
  showSearch?: boolean | CascaderShowSearchConfig;
  /** Class for the popped-out panel. */
  popupClassName?: string;
  /** Additional alias for `popupClassName`. */
  dropdownClassName?: string;
  className?: string;
}

const collectPaths = (
  options: CascaderOption[],
  prefix: CascaderOption[] = []
): CascaderOption[][] =>
  options.flatMap((option) => {
    const next = [...prefix, option];
    if (option.children?.length) return collectPaths(option.children, next);
    return [next];
  });

const defaultSearchFilter = (inputValue: string, path: CascaderOption[]) => {
  const q = inputValue.trim().toLowerCase();
  if (!q) return true;
  return path
    .map((option) => String(option.label ?? option.value))
    .join(" / ")
    .toLowerCase()
    .includes(q);
};

/** `Cascader` — multi-column hierarchical selector. */
export const Cascader = React.forwardRef<HTMLDivElement, CascaderProps>(({
  options,
  value,
  defaultValue = [],
  onChange,
  placeholder = "请选择",
  disabled,
  allowClear,
  onClear,
  changeOnSelect,
  showSearch,
  popupClassName = "",
  dropdownClassName = "",
  className = "",
  ...rest
}, ref) => {
  const [inner, setInner] = React.useState<string[]>(defaultValue);
  const isControlled = value !== undefined;
  const cur = isControlled ? value! : inner;
  const [open, setOpen] = React.useState(false);
  const [path, setPath] = React.useState<string[]>(cur);
  const [query, setQuery] = React.useState("");
  const panelRef = React.useRef<HTMLDivElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const searchConfig = typeof showSearch === "object" ? showSearch : {};
  const searchable = !!showSearch;

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
    if (!open) setQuery("");
  }, [open, cur]);

  React.useEffect(() => {
    if (!open || !searchable) return;
    requestAnimationFrame(() => searchRef.current?.focus());
  }, [open, searchable]);

  const columns: CascaderOption[][] = [options];
  let cursor: CascaderOption[] = options;
  for (const v of path) {
    const match: CascaderOption | undefined = cursor.find((o) => o.value === v);
    if (match && match.children) {
      cursor = match.children;
      columns.push(cursor);
    } else break;
  }

  const selectedOptionsForPath = (nextPath: string[]) => {
    const selected: CascaderOption[] = [];
    let list = options;
    for (const item of nextPath) {
      const match = list.find((option) => option.value === item);
      if (!match) break;
      selected.push(match);
      list = match.children ?? [];
    }
    return selected;
  };

  const commit = (nextPath: string[], closeAfterSelect: boolean) => {
    if (!isControlled) setInner(nextPath);
    onChange?.(nextPath, selectedOptionsForPath(nextPath));
    if (closeAfterSelect) setOpen(false);
  };

  const pick = (depth: number, val: string, hasChildren: boolean) => {
    const np = [...path.slice(0, depth), val];
    setPath(np);
    if (!hasChildren || changeOnSelect) commit(np, !hasChildren);
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    setPath([]);
    if (!isControlled) setInner([]);
    onChange?.([], []);
    onClear?.();
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

  const allPaths = React.useMemo(() => collectPaths(options), [options]);
  const matchedPaths = React.useMemo(() => {
    if (!query.trim()) return [];
    const filter = searchConfig.filter ?? defaultSearchFilter;
    const result = allPaths.filter((itemPath) => filter(query, itemPath));
    const limit = searchConfig.limit === false ? result.length : searchConfig.limit ?? 50;
    return result.slice(0, limit);
  }, [allPaths, query, searchConfig.filter, searchConfig.limit]);

  const panelClassName = [
    "cascader-panel",
    searchable && "with-search",
    popupClassName,
    dropdownClassName,
  ]
    .filter(Boolean)
    .join(" ");

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
        {!!allowClear && labels.length > 0 && !disabled && (
          <span
            className="cascader-clear"
            role="button"
            aria-label="Clear"
            onClick={clear}
          >
            <Icon name="x" size={12} />
          </span>
        )}
        <span style={{ position: "absolute", right: 12, color: "var(--fg-subtle)" }}>
          <Icon name="chevDown" size={14} />
        </span>
      </button>
      {open && typeof document !== "undefined" &&
        createPortal(
          <div ref={panelRef} className={panelClassName} style={floatingStyle}>
            {searchable && (
              <div className="cascader-search">
                <Input
                  ref={searchRef}
                  size="sm"
                  leadingIcon="search"
                  value={query}
                  onValueChange={setQuery}
                  placeholder="搜索..."
                />
              </div>
            )}
            {searchable && query.trim() ? (
              <div className="cascader-search-list">
                {matchedPaths.length === 0 ? (
                  <div className="cascader-empty">暂无匹配项</div>
                ) : (
                  matchedPaths.map((itemPath) => (
                    <button
                      key={itemPath.map((item) => item.value).join("__")}
                      type="button"
                      className="cascader-search-item"
                      onClick={() => commit(itemPath.map((item) => item.value), true)}
                    >
                      {searchConfig.render
                        ? searchConfig.render(query, itemPath)
                        : itemPath.map((item) => item.label).map((label, index) => (
                            <React.Fragment key={index}>
                              {index > 0 && <span className="cascader-path-sep">/</span>}
                              <span>{label}</span>
                            </React.Fragment>
                          ))}
                    </button>
                  ))
                )}
              </div>
            ) : (
              <div className="cascader-columns">
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
                          {renderIconSlot(o.icon, { size: 13, className: "cascader-icon" })}
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
          </div>,
          document.body
        )}
    </div>
  );
});
Cascader.displayName = "Cascader";
