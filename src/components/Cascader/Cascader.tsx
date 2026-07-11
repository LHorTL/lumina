import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Cascader.css";
import * as React from "react";
import { createPortal } from "react-dom";
import { Icon, renderIconSlot, type IconSlot } from "../Icon";
import { Input } from "../Input";
import { useFloating } from "../../utils/useFloating";
import { usePortalContainer } from "../../utils/portal";
import { useOverlayLayer } from "../../utils/overlayStack";

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

/** 自定义级联节点内容渲染时可用的状态。 */
export interface CascaderOptionRenderInfo {
  depth: number;
  selected: boolean;
  hasChildren: boolean;
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
  /** 自定义每一级菜单中的节点内容。 */
  optionRender?: (option: CascaderOption, info: CascaderOptionRenderInfo) => React.ReactNode;
  /** 自定义触发器中的紧凑已选内容。 */
  selectedRender?: (selectedOptions: CascaderOption[], values: string[]) => React.ReactNode;
  /** 每列及搜索结果滚动区域的最大高度。 */
  listHeight?: number;
  /** Portal 浮层的额外内联样式，可覆盖宽度或高度。 */
  popupStyle?: React.CSSProperties;
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
  optionRender,
  selectedRender,
  listHeight = 280,
  popupStyle,
  popupClassName = "",
  dropdownClassName = "",
  className = "",
  id: fieldId,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  "aria-labelledby": ariaLabelledBy,
  "aria-required": ariaRequired,
  "aria-label": ariaLabel,
  ...rest
}, ref) => {
  const [inner, setInner] = React.useState<string[]>(() => Array.isArray(defaultValue) ? defaultValue : []);
  const isControlled = value !== undefined;
  const cur = isControlled ? (Array.isArray(value) ? value : []) : inner;
  const [innerOpen, setInnerOpen] = React.useState(false);
  const open = innerOpen && !disabled;
  const [path, setPath] = React.useState<string[]>(cur);
  const [query, setQuery] = React.useState("");
  const searchRef = React.useRef<HTMLInputElement>(null);
  const portalContainer = usePortalContainer();
  const panelId = React.useId();
  const searchConfig = typeof showSearch === "object" ? showSearch : {};
  const searchable = !!showSearch;
  const mergedListHeight = Number.isFinite(listHeight) && listHeight > 0 ? listHeight : 280;

  const { triggerRef, floatingRef: panelRef, floatingStyle, zIndex: panelZIndex } = useFloating<HTMLDivElement, HTMLDivElement>({
    open,
    placement: "bottom",
    panelWidth: 520,
    panelHeight: mergedListHeight + (searchable ? 58 : 12),
  });

  useOverlayLayer({
    open: open && portalContainer != null,
    containerRef: panelRef,
    ownerRef: triggerRef,
    zIndex: panelZIndex,
    onEscape: () => setInnerOpen(false),
    restoreFocus: true,
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
    if (disabled) setInnerOpen(false);
  }, [disabled]);

  React.useEffect(() => {
      const h = (e: MouseEvent) => {
        const t = e.target as Node;
        if (triggerRef.current?.contains(t)) return;
        if (panelRef.current?.contains(t)) return;
        setInnerOpen(false);
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
    if (disabled) return;
    const selectedOptions = selectedOptionsForPath(nextPath);
    if (
      nextPath.length > 0 &&
      (selectedOptions.length !== nextPath.length || selectedOptions.some((option) => option.disabled))
    ) {
      return;
    }
    if (!isControlled) setInner(nextPath);
    onChange?.(nextPath, selectedOptions);
    if (closeAfterSelect) setInnerOpen(false);
  };

  const pick = (depth: number, val: string, hasChildren: boolean) => {
    if (disabled) return;
    const np = [...path.slice(0, depth), val];
    setPath(np);
    if (!hasChildren || changeOnSelect) commit(np, !hasChildren);
  };

  const clear = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    if (disabled) return;
    setPath([]);
    if (!isControlled) setInner([]);
    onChange?.([], []);
    onClear?.();
  };

  const selectedOptions = selectedOptionsForPath(cur);
  const labels = selectedOptions.map((option) => option.label);

  const allPaths = React.useMemo(() => collectPaths(options), [options]);
  const matchedPaths = React.useMemo(() => {
    if (!query.trim()) return [];
    const filter = searchConfig.filter ?? defaultSearchFilter;
    const result = allPaths.filter(
      (itemPath) => itemPath.every((option) => !option.disabled) && filter(query, itemPath)
    );
    const limit = searchConfig.limit === false ? result.length : searchConfig.limit ?? 50;
    return result.slice(0, limit);
  }, [allPaths, query, searchConfig.filter, searchConfig.limit]);

  const panelClassName = [
    "cascader-panel",
    searchable && "with-search",
    optionRender && "custom-options",
    popupClassName,
    dropdownClassName,
  ]
    .filter(Boolean)
    .join(" ");
  const panelStyle = {
    ...floatingStyle,
    ["--cascader-list-height" as string]: `${mergedListHeight}px`,
    ...popupStyle,
  } as React.CSSProperties;

  return (
    <div ref={setTriggerRef} className={`cascader ${open ? "open" : ""} ${className}`} {...rest}>
      <button
        type="button"
        className={`cascader-trigger ${labels.length === 0 ? "placeholder" : ""}`}
        disabled={disabled}
        onClick={() => !disabled && setInnerOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "Escape" && open) {
            event.preventDefault();
            setInnerOpen(false);
          } else if (event.key === "ArrowDown" && !open) {
            event.preventDefault();
            setInnerOpen(true);
          } else if ((event.key === "Delete" || event.key === "Backspace") && allowClear && labels.length) {
            event.preventDefault();
            clear(event);
          }
        }}
        aria-haspopup="dialog"
        id={fieldId}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-invalid={ariaInvalid}
        aria-required={ariaRequired}
        aria-describedby={ariaDescribedBy}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
      >
        <span className="cascader-value">
          {labels.length
            ? selectedRender?.(selectedOptions, cur) ?? labels.map((label, index) => (
                <span key={index}>{index > 0 && " / "}{label}</span>
              ))
            : placeholder}
        </span>
        {!!allowClear && labels.length > 0 && !disabled && (
          <span
            className="cascader-clear"
            aria-label="Clear"
            aria-hidden="true"
            onClick={clear}
          >
            <Icon name="x" size={12} />
          </span>
        )}
        <span style={{ position: "absolute", right: 12, color: "var(--fg-subtle)" }}>
          <Icon name="chevDown" size={14} />
        </span>
      </button>
      {open && portalContainer &&
        createPortal(
          <div ref={panelRef} id={panelId} role="dialog" aria-label="级联选择" className={panelClassName} style={panelStyle}>
            {searchable && (
              <div className="cascader-search">
                <Input
                  ref={searchRef}
                  size="sm"
                  leadingIcon="search"
                  value={query}
                  onValueChange={setQuery}
                  placeholder="搜索..."
                  aria-label="搜索级联选项"
                />
              </div>
            )}
            {searchable && query.trim() ? (
              <div className="cascader-search-list" role="listbox">
                {matchedPaths.length === 0 ? (
                  <div className="cascader-empty">暂无匹配项</div>
                ) : (
                  matchedPaths.map((itemPath) => (
                    <button
                      key={itemPath.map((item) => item.value).join("__")}
                      type="button"
                      role="option"
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
                  <div key={depth} className="cascader-col" role="listbox" aria-label={`第 ${depth + 1} 级`}>
                    {col.map((o) => {
                      const isActive = path[depth] === o.value;
                      const hasChildren = !!(o.children && o.children.length);
                      return (
                        <button
                          key={o.value}
                          type="button"
                          role="option"
                          aria-selected={isActive}
                          className={`cascader-item ${isActive ? "active" : ""}`}
                          disabled={o.disabled}
                          onClick={() => pick(depth, o.value, hasChildren)}
                        >
                          {optionRender ? (
                            <span className="cascader-item-custom">
                              {optionRender(o, { depth, selected: isActive, hasChildren })}
                            </span>
                          ) : (
                            <>
                              {renderIconSlot(o.icon, { size: 13, className: "cascader-icon" })}
                              <span className="cascader-item-label">{o.label}</span>
                            </>
                          )}
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
          portalContainer
        )}
    </div>
  );
});
Cascader.displayName = "Cascader";
