import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Select.css";
import * as React from "react";
import { createPortal } from "react-dom";
import { Icon, renderIconSlot, type IconSlot } from "../Icon";
import { Input } from "../Input";
import { Tag } from "../Tag";
import { useFloating } from "../../utils/useFloating";
import { usePortalContainer } from "../../utils/portal";
import { useOverlayLayer } from "../../utils/overlayStack";

export interface SelectOption<T extends string | number = string> {
  value: T;
  label: React.ReactNode;
  /** Searchable text — used by default filter when `label` isn't a string. */
  text?: string;
  /** Secondary line shown beneath the label. */
  description?: React.ReactNode;
  /** Leading icon. Accepts a built-in icon name or custom React node. */
  icon?: IconSlot;
  disabled?: boolean;
}

export interface SelectOptionGroup<T extends string | number = string> {
  /** Group heading. */
  label: React.ReactNode;
  options: SelectOption<T>[];
}

export type SelectItem<T extends string | number = string> =
  | SelectOption<T>
  | SelectOptionGroup<T>;

export type SelectFilterOption<T extends string | number = string> =
  | boolean
  | ((input: string, option: SelectOption<T>) => boolean);

/** 自定义选项内容渲染时可用的状态。 */
export interface SelectOptionRenderInfo {
  index: number;
  selected: boolean;
  active: boolean;
}

/** 自定义已选内容渲染时可用的状态。 */
export interface SelectSelectedRenderInfo<T extends string | number = string> {
  value: T;
  multiple: boolean;
}

export type SelectSingleChangeHandler<T extends string | number = string> = {
  bivarianceHack(value: any): void;
}["bivarianceHack"];

export type SelectMultiChangeHandler<T extends string | number = string> = {
  bivarianceHack(value: T[]): void;
}["bivarianceHack"];

const isGroup = <T extends string | number>(
  it: SelectItem<T>
): it is SelectOptionGroup<T> => Array.isArray((it as SelectOptionGroup<T>).options);

interface BaseSelectProps<T extends string | number = string>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** Flat or mixed (groups + options) item list. */
  options: SelectItem<T>[];
  placeholder?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  /** Show invalid (red) ring. */
  invalid?: boolean;
  /** Show a small × to clear the selection (single mode) or all selections (multi). */
  clearable?: boolean;
  /** Alias for `clearable`. */
  allowClear?: boolean | { clearIcon?: React.ReactNode };
  /** Add a search input at the top of the menu. */
  searchable?: boolean;
  /** Alias for `searchable`. */
  showSearch?: boolean;
  /** Custom filter — defaults to label/text/value substring match. */
  filterOption?: SelectFilterOption<T>;
  /** Field used by the default filter. */
  optionFilterProp?: "label" | "value" | "text" | string;
  /** Show spinner instead of options. */
  loading?: boolean;
  /** Custom empty content when no options match. */
  emptyContent?: React.ReactNode;
  /** 自定义菜单内的完整选项内容；选择标记仍由 Select 负责。 */
  optionRender?: (option: SelectOption<T>, info: SelectOptionRenderInfo) => React.ReactNode;
  /** 自定义触发器中的紧凑已选内容，避免复用复杂的 option 内容。 */
  selectedRender?: (option: SelectOption<T>, info: SelectSelectedRenderInfo<T>) => React.ReactNode;
  /** 菜单选项滚动区域的最大高度。 */
  listHeight?: number;
  /** Portal 菜单的额外内联样式，可覆盖宽度或高度。 */
  popupStyle?: React.CSSProperties;
  /** Controlled open state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  /** Class for the popped-out menu. */
  menuClassName?: string;
  /** Alias for `menuClassName`. */
  popupClassName?: string;
  /** Additional alias for `menuClassName`. */
  dropdownClassName?: string;
}

export interface SingleSelectProps<T extends string | number = string> extends BaseSelectProps<T> {
  multiple?: false;
  value?: T;
  defaultValue?: T;
  onChange?: SelectSingleChangeHandler<T>;
  /** Fired when user clears the selection via the × button. */
  onClear?: () => void;
}

export interface MultiSelectProps<T extends string | number = string> extends BaseSelectProps<T> {
  multiple: true;
  value?: T[];
  defaultValue?: T[];
  onChange?: SelectMultiChangeHandler<T>;
  /** Fired when user clears all selections via the × button. */
  onClear?: () => void;
  /** Max selected items shown as tags before collapsing to "+N". */
  maxTagCount?: number;
}

export type SelectProps<T extends string | number = string> =
  | SingleSelectProps<T>
  | MultiSelectProps<T>;

const flatten = <T extends string | number>(items: SelectItem<T>[]): SelectOption<T>[] =>
  items.flatMap((it) => (isGroup(it) ? it.options : [it]));

const defaultFilter = <T extends string | number>(
  input: string,
  opt: SelectOption<T>,
  optionFilterProp?: string
): boolean => {
  const q = input.toLowerCase();
  const propValue = optionFilterProp
    ? (opt as unknown as Record<string, unknown>)[optionFilterProp]
    : undefined;
  const txt =
    propValue != null
      ? String(propValue)
      : opt.text ?? (typeof opt.label === "string" ? opt.label : String(opt.value));
  return txt.toLowerCase().includes(q);
};

type SelectComponent = {
  <T extends string | number = string>(props: SingleSelectProps<T> & React.RefAttributes<HTMLDivElement>): React.ReactElement;
  <T extends string | number = string>(props: MultiSelectProps<T> & React.RefAttributes<HTMLDivElement>): React.ReactElement;
};

const SelectInner = <T extends string | number = string>(
  props: SelectProps<T>,
  forwardedRef: React.ForwardedRef<HTMLDivElement>
): React.ReactElement => {
  const {
    options,
    placeholder = "请选择…",
    disabled,
    size = "md",
    invalid,
    clearable,
    allowClear,
    searchable,
    showSearch,
    filterOption,
    optionFilterProp,
    loading,
    emptyContent,
    optionRender,
    selectedRender,
    listHeight = 260,
    popupStyle,
    open: openProp,
    defaultOpen,
    onOpenChange,
    className = "",
    menuClassName = "",
    popupClassName = "",
    dropdownClassName = "",
    onKeyDown: onRootKeyDown,
    onBlur: onRootBlur,
    tabIndex: triggerTabIndex,
    id: fieldId,
    "aria-invalid": ariaInvalid,
    "aria-describedby": ariaDescribedBy,
    "aria-labelledby": ariaLabelledBy,
    "aria-label": ariaLabel,
    "aria-required": ariaRequired,
    multiple,
    value: _value,
    defaultValue: _defaultValue,
    onChange: _selectionChange,
    onClear: _onClear,
    maxTagCount: _maxTagCount,
    ...rest
  } = props as SelectProps<T> & {
    onClear?: () => void;
    maxTagCount?: number;
  };
  const isMulti = multiple === true;
  const mergedClearable = clearable ?? !!allowClear;
  const mergedClearIcon = typeof allowClear === "object" ? allowClear.clearIcon : undefined;
  const mergedSearchable = searchable ?? !!showSearch;
  const mergedListHeight = Number.isFinite(listHeight) && listHeight > 0 ? listHeight : 260;
  const hasCustomPopupWidth = popupStyle?.width != null || popupStyle?.minWidth != null || popupStyle?.maxWidth != null;
  const mergedMenuClassName = [menuClassName, popupClassName, dropdownClassName]
    .filter(Boolean)
    .join(" ");

  const [innerSingle, setInnerSingle] = React.useState<T | undefined>(
    !isMulti ? (props as SingleSelectProps<T>).defaultValue : undefined
  );
  const [innerMulti, setInnerMulti] = React.useState<T[]>(
    isMulti && Array.isArray((props as MultiSelectProps<T>).defaultValue)
      ? (props as MultiSelectProps<T>).defaultValue!
      : []
  );
  const [innerOpen, setInnerOpen] = React.useState(defaultOpen ?? false);
  const [query, setQuery] = React.useState("");
  const [activeIdx, setActiveIdx] = React.useState(-1);

  const searchRef = React.useRef<HTMLInputElement>(null);
  const portalContainer = usePortalContainer();
  const listboxId = React.useId();

  const openControlled = openProp !== undefined;
  const requestedOpen = openControlled ? openProp! : innerOpen;
  const open = !disabled && requestedOpen;
  const setOpen = (v: boolean) => {
    if (disabled && v) return;
    if (!openControlled) setInnerOpen(v);
    onOpenChange?.(v);
    if (!v) setQuery("");
  };

  React.useEffect(() => {
    if (!disabled || openControlled || !innerOpen) return;
    setInnerOpen(false);
    onOpenChange?.(false);
  }, [disabled, innerOpen, onOpenChange, openControlled]);

  const { triggerRef, floatingRef: menuRef, floatingStyle, zIndex: menuZIndex } = useFloating<HTMLDivElement, HTMLDivElement>({
    open,
    placement: "bottom",
    matchTriggerWidth: !hasCustomPopupWidth,
    panelWidth: typeof popupStyle?.width === "number" ? popupStyle.width : 360,
    panelHeight: mergedListHeight + (mergedSearchable ? 58 : 12),
  });

  useOverlayLayer({
    open: open && portalContainer != null,
    containerRef: menuRef,
    ownerRef: triggerRef,
    zIndex: menuZIndex,
    onEscape: () => setOpen(false),
    restoreFocus: true,
  });

  const setTriggerRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      (triggerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef, triggerRef]
  );

  const singleControlled = !isMulti && (props as SingleSelectProps<T>).value !== undefined;
  const multiControlled = isMulti && (props as MultiSelectProps<T>).value !== undefined;

  const singleValue = singleControlled ? (props as SingleSelectProps<T>).value : innerSingle;
  const controlledMultiValue = (props as MultiSelectProps<T>).value;
  const multiValue = multiControlled
    ? (Array.isArray(controlledMultiValue) ? controlledMultiValue : [])
    : innerMulti;

  React.useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Auto-focus search input when opened
  React.useEffect(() => {
    if (open && mergedSearchable) {
      requestAnimationFrame(() => searchRef.current?.focus());
    }
    if (!open) setActiveIdx(-1);
  }, [open, mergedSearchable]);

  // Filter options
  const allFlat = React.useMemo(() => flatten(options), [options]);
  const filteredFlat = React.useMemo(() => {
    if (!query.trim()) return allFlat;
    if (filterOption === false) return allFlat;
    const f =
      typeof filterOption === "function"
        ? filterOption
        : (input: string, option: SelectOption<T>) =>
            defaultFilter(input, option, optionFilterProp);
    return allFlat.filter((o) => f(query, o));
  }, [allFlat, query, filterOption, optionFilterProp]);

  // Re-bucket into groups respecting filter (for menu rendering)
  const filteredItems = React.useMemo<SelectItem<T>[]>(() => {
    if (!query.trim()) return options;
    return options
      .map((it) => {
        if (!isGroup(it)) {
          return filteredFlat.includes(it) ? it : null;
        }
        const kept = it.options.filter((o) => filteredFlat.includes(o));
        return kept.length ? { label: it.label, options: kept } : null;
      })
      .filter((x): x is SelectItem<T> => x !== null);
  }, [options, filteredFlat, query]);

  React.useEffect(() => {
    setActiveIdx((current) => {
      if (current >= 0 && current < filteredFlat.length && !filteredFlat[current].disabled) {
        return current;
      }
      return filteredFlat.findIndex((option) => !option.disabled);
    });
  }, [filteredFlat]);

  const pickSingle = (opt: SelectOption<T>) => {
    if (disabled || opt.disabled) return;
    if (!singleControlled) setInnerSingle(opt.value);
    (props as SingleSelectProps<T>).onChange?.(opt.value);
    setOpen(false);
  };

  const toggleMulti = (opt: SelectOption<T>) => {
    if (disabled || opt.disabled) return;
    const cur = multiValue ?? [];
    const next = cur.includes(opt.value) ? cur.filter((v) => v !== opt.value) : [...cur, opt.value];
    if (!multiControlled) setInnerMulti(next);
    (props as MultiSelectProps<T>).onChange?.(next);
  };

  /** 清空当前选择，并保持浮层开关状态不变。 */
  const clearAll = () => {
    if (disabled) return;
    if (isMulti) {
      if (!multiControlled) setInnerMulti([]);
      (props as MultiSelectProps<T>).onChange?.([]);
      (props as MultiSelectProps<T>).onClear?.();
    } else {
      if (!singleControlled) setInnerSingle(undefined);
      (props as SingleSelectProps<T>).onChange?.(undefined);
      (props as SingleSelectProps<T>).onClear?.();
    }
  };

  const isSelected = (val: T) =>
    isMulti ? (multiValue ?? []).includes(val) : singleValue === val;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Backspace" || e.key === "Delete") && showClear) {
      e.preventDefault();
      clearAll();
      return;
    }
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => {
        for (let step = 1; step <= filteredFlat.length; step++) {
          const next = (Math.max(i, -1) + step) % filteredFlat.length;
          if (!filteredFlat[next]?.disabled) return next;
        }
        return i;
      });
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => {
        for (let step = 1; step <= filteredFlat.length; step++) {
          const next = (i - step + filteredFlat.length) % filteredFlat.length;
          if (!filteredFlat[next]?.disabled) return next;
        }
        return i;
      });
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const opt = filteredFlat[activeIdx];
      if (opt && !opt.disabled) {
        if (isMulti) toggleMulti(opt);
        else pickSingle(opt);
      }
      return;
    }
  };

  const renderTrigger = () => {
    if (isMulti) {
      const selected = (multiValue ?? [])
        .map((v) => allFlat.find((o) => o.value === v))
        .filter((o): o is SelectOption<T> => !!o);
      const max = (props as MultiSelectProps<T>).maxTagCount;
      const shown = max != null ? selected.slice(0, max) : selected;
      const overflow = selected.length - shown.length;
      if (selected.length === 0) {
        return <span className="placeholder">{placeholder}</span>;
      }
      return (
        <span className="select-tags">
          {shown.map((o) => (
            <Tag
              key={String(o.value)}
              tone="accent"
              removable={!disabled}
              onRemove={() => {
                const cur = multiValue ?? [];
                const next = cur.filter((v) => v !== o.value);
                if (!multiControlled) setInnerMulti(next);
                (props as MultiSelectProps<T>).onChange?.(next);
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {selectedRender?.(o, { value: o.value, multiple: true }) ?? o.label}
            </Tag>
          ))}
          {overflow > 0 && <Tag tone="neutral">+{overflow}</Tag>}
        </span>
      );
    }
    const current = allFlat.find((o) => o.value === singleValue);
    if (!current) return <span className="placeholder">{placeholder}</span>;
    if (selectedRender) {
      return (
        <span className="select-value select-value-custom">
          {selectedRender(current, { value: current.value, multiple: false })}
        </span>
      );
    }
    return (
      <span className="select-value">
        {renderIconSlot(current.icon, { size: 14, className: "select-icon" })}
        <span className="select-value-label">{current.label}</span>
      </span>
    );
  };

  const hasSelection = isMulti ? multiValue.length > 0 : singleValue != null;
  const showClear = mergedClearable && hasSelection && !disabled;

  // Render an option button
  let renderIdx = -1;
  const renderOption = (o: SelectOption<T>) => {
    renderIdx += 1;
    const idx = renderIdx;
    const sel = isSelected(o.value);
    const active = idx === activeIdx;
    return (
      <button
        key={String(o.value)}
        id={`${listboxId}-option-${idx}`}
        type="button"
        role="option"
        aria-selected={sel}
        disabled={o.disabled}
        className={`menu-item ${sel ? "active" : ""} ${active ? "highlight" : ""}`}
        onMouseEnter={() => setActiveIdx(idx)}
        onClick={() => (isMulti ? toggleMulti(o) : pickSingle(o))}
      >
        {isMulti && (
          <span className={`menu-check ${sel ? "on" : ""}`} aria-hidden>
            {sel && <Icon name="check" size={11} stroke={3} />}
          </span>
        )}
        {optionRender ? (
          <span className="menu-item-custom">
            {optionRender(o, { index: idx, selected: sel, active })}
          </span>
        ) : (
          <>
            {renderIconSlot(o.icon, { size: 14, className: "menu-item-icon" })}
            <span className="menu-item-body">
              <span className="menu-item-label">{o.label}</span>
              {o.description && <span className="menu-item-desc">{o.description}</span>}
            </span>
          </>
        )}
        {!isMulti && (
          <span className="tick">
            <Icon name="check" size={12} stroke={3} />
          </span>
        )}
      </button>
    );
  };

  return (
    <div
      ref={setTriggerRef}
      {...rest}
      className={`select ${size} ${isMulti ? "multi" : ""} ${open ? "open" : ""} ${disabled ? "disabled" : ""} ${invalid ? "invalid" : ""} ${className}`}
      onKeyDown={(e) => {
        onRootKeyDown?.(e);
        if (!e.defaultPrevented && (e.target as HTMLElement).classList.contains("select-trigger")) onKeyDown(e);
      }}
      onBlur={(event) => {
        onRootBlur?.(event);
        if (!open) return;
        const nextTarget = event.relatedTarget as Node | null;
        if (nextTarget) {
          if (!triggerRef.current?.contains(nextTarget) && !menuRef.current?.contains(nextTarget)) {
            setOpen(false);
          }
          return;
        }
        const ownerDocument = event.currentTarget.ownerDocument;
        window.requestAnimationFrame(() => {
          const activeElement = ownerDocument.activeElement;
          if (!triggerRef.current?.contains(activeElement) && !menuRef.current?.contains(activeElement)) {
            setOpen(false);
          }
        });
      }}
    >
      <div
        className="select-trigger"
        onClick={() => !disabled && setOpen(!open)}
        tabIndex={disabled ? -1 : triggerTabIndex ?? 0}
        id={fieldId}
        role="combobox"
        aria-disabled={disabled || undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-invalid={ariaInvalid}
        aria-required={ariaRequired}
        aria-describedby={ariaDescribedBy}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={open && activeIdx >= 0 ? `${listboxId}-option-${activeIdx}` : undefined}
      >
        {renderTrigger()}
        <Icon name="chevDown" size={14} className="select-caret" />
      </div>
      {showClear && (
        <button
          type="button"
          className="select-clear"
          aria-label="Clear"
          onPointerDown={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            clearAll();
          }}
        >
          {mergedClearIcon ?? <Icon name="x" size={12} />}
        </button>
      )}
      {open && portalContainer &&
        createPortal(
          <div
            ref={menuRef}
            id={listboxId}
            className={`menu ${mergedMenuClassName}`}
            role="listbox"
            aria-multiselectable={isMulti || undefined}
            style={{ ...floatingStyle, ...popupStyle }}
          >
            {mergedSearchable && (
            <div className="menu-search">
              <Input
                ref={searchRef}
                size="sm"
                leadingIcon="search"
                value={query}
                placeholder="搜索..."
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={open}
                aria-controls={listboxId}
                aria-activedescendant={activeIdx >= 0 ? `${listboxId}-option-${activeIdx}` : undefined}
                onValueChange={setQuery}
                onKeyDown={(e) => {
                  if (e.key === "Escape" || e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter") {
                    e.preventDefault();
                    onKeyDown(e);
                  }
                }}
              />
            </div>
          )}
          <div
            className="menu-options"
            style={{ maxHeight: mergedListHeight }}
          >
            {loading ? (
              <div className="menu-state">
                <span className="menu-state-ico">
                  <span className="spinner" />
                </span>
                <span>加载中...</span>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="menu-state">
                <span className="menu-state-ico">
                  <Icon name="search" size={16} />
                </span>
                <span>{emptyContent ?? "暂无匹配项"}</span>
              </div>
            ) : (
              filteredItems.map((it, gi) =>
                isGroup(it) ? (
                  <React.Fragment key={`g-${gi}`}>
                    <div className="menu-group-label">{it.label}</div>
                    {it.options.map(renderOption)}
                  </React.Fragment>
                ) : (
                  renderOption(it)
                )
              )
            )}
          </div>
          </div>,
          portalContainer
        )}
    </div>
  );
};

/** `Select` — neumorphic dropdown. Set `multiple` for tag-style multi-select. */
export const Select = React.forwardRef(SelectInner) as SelectComponent;
(Select as any).displayName = "Select";
