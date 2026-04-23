import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./ContextMenu.css";
import * as React from "react";
import ReactDOM from "react-dom";

export interface ContextMenuItem {
  key: string;
  /** Omit for `type: "divider"`. */
  label?: React.ReactNode;
  icon?: React.ReactNode;
  /** Right-aligned shortcut hint, e.g. `"⌘C"`. */
  shortcut?: React.ReactNode;
  disabled?: boolean;
  /** Style the item as destructive (red). */
  danger?: boolean;
  /** Render a horizontal separator; other fields are ignored. */
  type?: "divider";
  onSelect?: () => void;
}

export interface ContextMenuProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  items: ContextMenuItem[];
  /**
   * Any content — right-click anywhere inside the trigger area opens the menu.
   * Internally wrapped in a `display: contents` span so layout is unaffected
   * regardless of whether `children` is a DOM element or a React component.
   */
  children: React.ReactNode;
  /** Skip the menu entirely — browser default context menu will be used instead. */
  disabled?: boolean;
  /** Minimum panel width in px. Default 180. */
  minWidth?: number;
}

const ESTIMATED_ITEM_H = 32;
const MARGIN = 8;

/**
 * `ContextMenu` — right-click menu. Wraps one child element; suppresses the
 * browser's native menu and opens a neumorphic replacement at the cursor.
 *
 * @example
 * ```tsx
 * <ContextMenu
 *   items={[
 *     { key: "copy", label: "复制", shortcut: "⌘C", onSelect: copy },
 *     { key: "cut",  label: "剪切", shortcut: "⌘X", onSelect: cut  },
 *     { key: "d1",   type: "divider" },
 *     { key: "del",  label: "删除", danger: true, onSelect: del },
 *   ]}
 * >
 *   <div>右键点击我</div>
 * </ContextMenu>
 * ```
 */
export const ContextMenu = React.forwardRef<HTMLSpanElement, ContextMenuProps>(({
  items,
  children,
  disabled,
  minWidth = 180,
  className = "",
  style,
  onContextMenu,
  ...rest
}, ref) => {
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [active, setActive] = React.useState(-1);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const isSelectable = React.useCallback(
    (i: ContextMenuItem) => i.type !== "divider" && !i.disabled,
    []
  );

  const close = React.useCallback(() => setOpen(false), []);

  const openAt = (clientX: number, clientY: number) => {
    // Estimate panel size for clamping; refined on next paint via measured rect.
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const estH = Math.min(items.length * ESTIMATED_ITEM_H + 16, vh - MARGIN * 2);
    const estW = minWidth;
    const left = Math.min(clientX, vw - estW - MARGIN);
    const top = Math.min(clientY, vh - estH - MARGIN);
    setPos({ top: Math.max(MARGIN, top), left: Math.max(MARGIN, left) });
    const firstIdx = items.findIndex(isSelectable);
    setActive(firstIdx);
    setOpen(true);
  };

  // Close on Esc / outside click / scroll / window blur.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.stopPropagation(); close(); return; }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setActive((curr) => {
          const dir = e.key === "ArrowDown" ? 1 : -1;
          let i = curr;
          for (let n = 0; n < items.length; n++) {
            i = (i + dir + items.length) % items.length;
            if (isSelectable(items[i])) return i;
          }
          return curr;
        });
      }
      if (e.key === "Enter") {
        const it = items[active];
        if (it && isSelectable(it)) {
          e.preventDefault();
          it.onSelect?.();
          close();
        }
      }
    };
    const onOutside = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) close();
    };
    const onBlur = () => close();
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onOutside);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onOutside);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      window.removeEventListener("blur", onBlur);
    };
  }, [open, items, active, close, isSelectable]);

  // Clamp again after mount using the real measured size.
  React.useLayoutEffect(() => {
    if (!open || !menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    setPos((p) => ({
      top: Math.min(p.top, Math.max(MARGIN, vh - rect.height - MARGIN)),
      left: Math.min(p.left, Math.max(MARGIN, vw - rect.width - MARGIN)),
    }));
  }, [open]);

  const handleTriggerContextMenu = (e: React.MouseEvent) => {
    if (disabled || e.defaultPrevented) return;
    e.preventDefault();
    openAt(e.clientX, e.clientY);
  };

  // Wrap in a `display: contents` span so the handler lives on a DOM node we
  // fully control — React.cloneElement would fail to reach the DOM when
  // `children` is a React component that doesn't forward `onContextMenu`.
  const trigger = (
    <span
      ref={ref}
      className={className}
      style={{ display: "contents", ...style }}
      onContextMenu={(e) => {
        onContextMenu?.(e);
        handleTriggerContextMenu(e);
      }}
      {...rest}
    >
      {children}
    </span>
  );

  const panel =
    open && typeof document !== "undefined"
      ? ReactDOM.createPortal(
          <div
            ref={menuRef}
            className="context-menu"
            role="menu"
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              minWidth,
            }}
            onContextMenu={(e) => e.preventDefault()}
          >
            {items.map((it, i) =>
              it.type === "divider" ? (
                <div key={it.key} className="context-menu-divider" role="separator" />
              ) : (
                <button
                  key={it.key}
                  type="button"
                  role="menuitem"
                  disabled={it.disabled}
                  className={`context-menu-item ${active === i ? "active" : ""} ${it.danger ? "danger" : ""}`}
                  onMouseEnter={() => isSelectable(it) && setActive(i)}
                  onClick={() => {
                    if (!isSelectable(it)) return;
                    it.onSelect?.();
                    close();
                  }}
                >
                  <span className="context-menu-icon">{it.icon}</span>
                  <span className="context-menu-label">{it.label}</span>
                  {it.shortcut && <span className="context-menu-shortcut">{it.shortcut}</span>}
                </button>
              )
            )}
          </div>,
          document.body
        )
      : null;

  return (
    <>
      {trigger}
      {panel}
    </>
  );
});
ContextMenu.displayName = "ContextMenu";
