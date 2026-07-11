import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./CommandPalette.css";
import * as React from "react";
import ReactDOM from "react-dom";
import { Input } from "../Input";
import { OverlayZIndexProvider, useOverlayLayer, useOverlayZIndex } from "../../utils/overlayStack";
import { usePortalContainer } from "../../utils/portal";

export interface CommandItem {
  key: string;
  /** Displayed label; also matched against the search query by default. */
  label: string;
  /** Optional secondary line — e.g. "Open recent". */
  description?: React.ReactNode;
  /** Leading icon. */
  icon?: React.ReactNode;
  /** Right-aligned shortcut hint, e.g. `"⌘P"`. */
  shortcut?: React.ReactNode;
  /** Extra search terms beyond `label`. */
  keywords?: string[];
  /** Group heading. Items sharing a `group` appear under one heading. */
  group?: string;
  /** Ignored by default filter — still shown. */
  disabled?: boolean;
  onSelect?: () => void;
}

export interface CommandPaletteProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  items: CommandItem[];
  placeholder?: string;
  /** Custom matcher. Return true to keep the item. */
  filter?: (item: CommandItem, query: string) => boolean;
  /** Shown when no item matches the query. */
  emptyText?: React.ReactNode;
  /** Reset the query to empty whenever the palette opens. Default true. */
  resetOnOpen?: boolean;
  /** Footer node. Pass `null` to hide. */
  footer?: React.ReactNode;
  /** 遮罩层的附加类名；`className` 会落到 ref 对应的面板节点。 */
  overlayClassName?: string;
  /** 命令面板节点的附加类名；不会污染全屏遮罩层。 */
  className?: string;
}

const DEFAULT_FILTER = (item: CommandItem, q: string) => {
  if (!q) return true;
  const hay = [item.label, ...(item.keywords ?? [])].join(" ").toLowerCase();
  const needle = q.toLowerCase();
  // Simple subsequence match — each char of needle appears in order in haystack.
  let i = 0;
  for (const ch of hay) {
    if (ch === needle[i]) i++;
    if (i === needle.length) return true;
  }
  return i === needle.length;
};

/** 返回首个可执行命令的索引；没有可执行项时返回 -1。 */
const findFirstEnabledIndex = (items: CommandItem[]): number =>
  items.findIndex((item) => !item.disabled);

/**
 * `CommandPalette` — ⌘K-style action launcher. Search + grouped items +
 * keyboard nav. Rendered into `document.body`.
 *
 * The parent controls `open` via state — wire `Cmd/Ctrl+K` to toggle.
 *
 * @example
 * ```tsx
 * const [open, setOpen] = React.useState(false);
 * React.useEffect(() => {
 *   const h = (e: KeyboardEvent) => {
 *     if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen(o => !o); }
 *   };
 *   window.addEventListener("keydown", h);
 *   return () => window.removeEventListener("keydown", h);
 * }, []);
 *
 * <CommandPalette
 *   open={open}
 *   onOpenChange={setOpen}
 *   items={[
 *     { key: "new", label: "新建文件", icon: <Icon name="plus" size={14} />, group: "文件", shortcut: "⌘N", onSelect: () => {} },
 *     ...
 *   ]}
 * />
 * ```
 */
export const CommandPalette = React.forwardRef<HTMLDivElement, CommandPaletteProps>(({
  open,
  onOpenChange,
  items,
  placeholder = "搜索命令…",
  filter = DEFAULT_FILTER,
  emptyText = "暂无匹配结果",
  resetOnOpen = true,
  footer,
  overlayClassName = "",
  className = "",
  onMouseDown,
  onKeyDown,
  ...rest
}, ref) => {
  const portalContainer = usePortalContainer();
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const wasOpenRef = React.useRef(false);
  const listId = React.useId();
  const overlayZIndex = useOverlayZIndex(open);

  const filtered = React.useMemo(() => items.filter((it) => filter(it, query)), [items, query, filter]);

  // 分组时保留每个命令在 filtered 中的原始索引，避免视觉重排后执行错项。
  const grouped = React.useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, Array<{ item: CommandItem; filteredIndex: number }>>();
    filtered.forEach((it, filteredIndex) => {
      const g = it.group ?? "";
      if (!map.has(g)) { map.set(g, []); order.push(g); }
      map.get(g)!.push({ item: it, filteredIndex });
    });
    return order.map((g) => ({ group: g, items: map.get(g)! }));
  }, [filtered]);

  const close = React.useCallback(() => onOpenChange?.(false), [onOpenChange]);

  useOverlayLayer({
    open: open && portalContainer != null,
    containerRef: panelRef,
    zIndex: overlayZIndex,
    onEscape: close,
    trapFocus: true,
    autoFocus: true,
    restoreFocus: true,
    lockScroll: true,
    initialFocusRef: inputRef,
  });

  /** 同时维护命令面板内部引用和对外 ref。 */
  const setPanelRef = React.useCallback((node: HTMLDivElement | null) => {
    panelRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  }, [ref]);

  // 仅在关闭到打开的边沿重置查询与活动项，避免列表更新时覆盖用户输入。
  React.useEffect(() => {
    if (!open) {
      wasOpenRef.current = false;
      return;
    }
    if (wasOpenRef.current) return;
    wasOpenRef.current = true;
    if (resetOnOpen) setQuery("");
    setActive(findFirstEnabledIndex(resetOnOpen ? items : filtered));
  }, [filtered, items, open, resetOnOpen]);

  // Clamp active when the filtered list shrinks.
  React.useEffect(() => {
    setActive((current) => {
      if (filtered.length === 0) return -1;
      if (current >= 0 && current < filtered.length && !filtered[current].disabled) return current;
      return findFirstEnabledIndex(filtered);
    });
  }, [filtered]);

  // Scroll active item into view.
  React.useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-cmd-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active, filtered]);

  const pick = (it: CommandItem) => {
    if (it.disabled) return;
    it.onSelect?.();
    close();
  };

  const handlePanelKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => {
        if (filtered.length === 0) return -1;
        for (let n = 1; n <= filtered.length; n++) {
          const i = (a + n) % filtered.length;
          if (!filtered[i].disabled) return i;
        }
        return a;
      });
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => {
        if (filtered.length === 0) return -1;
        for (let n = 1; n <= filtered.length; n++) {
          const i = (a - n + filtered.length) % filtered.length;
          if (!filtered[i].disabled) return i;
        }
        return a;
      });
    }
    if (e.key === "Enter") {
      const it = filtered[active];
      if (it) { e.preventDefault(); pick(it); }
    }
    if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      const candidates = filtered
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => !item.disabled);
      const next = e.key === "Home" ? candidates[0] : candidates[candidates.length - 1];
      if (next) setActive(next.index);
    }
  };

  if (!portalContainer || !open) return null;

  return ReactDOM.createPortal(
    <OverlayZIndexProvider zIndex={overlayZIndex}>
      <div
        className={["cmdp-overlay", overlayClassName].filter(Boolean).join(" ")}
        style={{ zIndex: overlayZIndex }}
        onMouseDown={close}
        role="presentation"
      >
        <div
          ref={setPanelRef}
          className={["cmdp-panel", className].filter(Boolean).join(" ")}
          onMouseDown={(e) => {
            onMouseDown?.(e);
            e.stopPropagation();
          }}
          role="dialog"
          aria-modal
          aria-label="命令面板"
          tabIndex={-1}
          onKeyDown={handlePanelKeyDown}
          {...rest}
        >
          <div className="cmdp-search">
            <Input
              ref={inputRef}
              size="lg"
              leadingIcon="search"
              placeholder={placeholder}
              value={query}
              onValueChange={(v) => setQuery(v)}
              role="combobox"
              aria-autocomplete="list"
              aria-haspopup="listbox"
              aria-expanded={open}
              aria-controls={listId}
              aria-activedescendant={active >= 0 ? `${listId}-option-${active}` : undefined}
              suffix={<span className="cmdp-kbd">esc</span>}
            />
          </div>

          <div ref={listRef} id={listId} className="cmdp-list" role="listbox" aria-label="命令">
          {grouped.length === 0 ? (
            <div className="cmdp-empty">{emptyText}</div>
          ) : (
            grouped.map(({ group, items: gItems }, groupIndex) => (
              <div
                key={group || "_"}
                className="cmdp-group"
                role="group"
                aria-labelledby={group ? `${listId}-group-${groupIndex}` : undefined}
              >
                {group && <div id={`${listId}-group-${groupIndex}`} className="cmdp-group-head">{group}</div>}
                {gItems.map(({ item: it, filteredIndex: i }) => {
                  const isActive = i === active;
                  return (
                    <button
                      key={it.key}
                       type="button"
                       role="option"
                       id={`${listId}-option-${i}`}
                       aria-selected={isActive}
                       tabIndex={-1}
                      data-cmd-idx={i}
                      disabled={it.disabled}
                      className={`cmdp-item ${isActive ? "active" : ""}`}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => pick(it)}
                    >
                      <span className="cmdp-icon">{it.icon}</span>
                      <span className="cmdp-labels">
                        <span className="cmdp-label">{it.label}</span>
                        {it.description && <span className="cmdp-desc">{it.description}</span>}
                      </span>
                      {it.shortcut && <span className="cmdp-shortcut">{it.shortcut}</span>}
                    </button>
                  );
                })}
              </div>
            ))
          )}
          </div>

          {footer === null ? null : (
            <div className="cmdp-footer">
              {footer ?? (
                <>
                  <span><span className="cmdp-kbd">↑</span><span className="cmdp-kbd">↓</span> 切换</span>
                  <span><span className="cmdp-kbd">⏎</span> 执行</span>
                  <span><span className="cmdp-kbd">esc</span> 关闭</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </OverlayZIndexProvider>,
    portalContainer
  );
});
CommandPalette.displayName = "CommandPalette";
