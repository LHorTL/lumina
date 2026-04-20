import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./CommandPalette.css";
import * as React from "react";
import ReactDOM from "react-dom";
import { Input } from "../Input";

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

export interface CommandPaletteProps {
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
export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onOpenChange,
  items,
  placeholder = "搜索命令…",
  filter = DEFAULT_FILTER,
  emptyText = "暂无匹配结果",
  resetOnOpen = true,
  footer,
  className = "",
}) => {
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const filtered = React.useMemo(() => items.filter((it) => filter(it, query)), [items, query, filter]);

  // Group items preserving the original order of first occurrence.
  const grouped = React.useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, CommandItem[]>();
    for (const it of filtered) {
      const g = it.group ?? "";
      if (!map.has(g)) { map.set(g, []); order.push(g); }
      map.get(g)!.push(it);
    }
    return order.map((g) => ({ group: g, items: map.get(g)! }));
  }, [filtered]);

  const close = React.useCallback(() => onOpenChange?.(false), [onOpenChange]);

  // Reset & focus on open.
  React.useEffect(() => {
    if (!open) return;
    if (resetOnOpen) setQuery("");
    setActive(0);
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open, resetOnOpen]);

  // Clamp active when the filtered list shrinks.
  React.useEffect(() => {
    setActive((a) => (filtered.length === 0 ? 0 : Math.min(a, filtered.length - 1)));
  }, [filtered.length]);

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

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { e.preventDefault(); close(); return; }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => {
        if (filtered.length === 0) return 0;
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
        if (filtered.length === 0) return 0;
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
  };

  if (typeof document === "undefined" || !open) return null;

  // Build a flat index map so rendered list items know their position in `filtered`.
  let flatIdx = -1;

  return ReactDOM.createPortal(
    <div className={`cmdp-overlay ${className}`} onMouseDown={close} role="presentation">
      <div
        className="cmdp-panel"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal
        aria-label="命令面板"
      >
        <div className="cmdp-search">
          <Input
            ref={inputRef}
            size="lg"
            leadingIcon="search"
            placeholder={placeholder}
            value={query}
            onChange={(v) => setQuery(v)}
            onKeyDown={onKey}
            suffix={<span className="cmdp-kbd">esc</span>}
          />
        </div>

        <div ref={listRef} className="cmdp-list" role="listbox">
          {grouped.length === 0 ? (
            <div className="cmdp-empty">{emptyText}</div>
          ) : (
            grouped.map(({ group, items: gItems }) => (
              <div key={group || "_"} className="cmdp-group">
                {group && <div className="cmdp-group-head">{group}</div>}
                {gItems.map((it) => {
                  flatIdx += 1;
                  const i = flatIdx;
                  const isActive = i === active;
                  return (
                    <button
                      key={it.key}
                      type="button"
                      role="option"
                      aria-selected={isActive}
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
    </div>,
    document.body
  );
};
