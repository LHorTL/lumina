import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./ContextMenu.css";
import * as React from "react";
import ReactDOM from "react-dom";
import { useOverlayLayer, useOverlayZIndex } from "../../utils/overlayStack";
import { usePortalContainer } from "../../utils/portal";

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
/** 触发区域中原本就能通过键盘聚焦的元素。 */
const KEYBOARD_TRIGGER_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
  "[contenteditable='true']",
].join(",");

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
  onKeyDown,
  tabIndex,
  ...rest
}, ref) => {
  const portalContainer = usePortalContainer();
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [active, setActive] = React.useState(-1);
  const [useWrapperKeyboardFallback, setUseWrapperKeyboardFallback] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLSpanElement | null>(null);
  const returnFocusRef = React.useRef<HTMLElement | null>(null);
  const overlayZIndex = useOverlayZIndex(open);

  const isSelectable = React.useCallback(
    (i: ContextMenuItem) => i.type !== "divider" && !i.disabled,
    []
  );

  const close = React.useCallback(() => setOpen(false), []);

  /** 关闭菜单并把键盘焦点归还给打开前的控件。 */
  const closeAndRestoreFocus = React.useCallback(() => {
    close();
    window.requestAnimationFrame(() => {
      if (returnFocusRef.current?.isConnected) returnFocusRef.current.focus();
    });
  }, [close]);

  React.useEffect(() => {
    if (disabled && open) closeAndRestoreFocus();
  }, [closeAndRestoreFocus, disabled, open]);

  useOverlayLayer({
    open: open && portalContainer != null,
    containerRef: menuRef,
    ownerRef: triggerRef,
    zIndex: overlayZIndex,
    onEscape: closeAndRestoreFocus,
  });

  React.useLayoutEffect(() => {
    const wrapper = triggerRef.current;
    if (!wrapper || disabled) {
      setUseWrapperKeyboardFallback(false);
      return;
    }
    if (wrapper.querySelector<HTMLElement>(KEYBOARD_TRIGGER_SELECTOR)) {
      setUseWrapperKeyboardFallback(false);
      return;
    }

    const HTMLElementConstructor = wrapper.ownerDocument.defaultView?.HTMLElement;
    const candidate = Array.from(wrapper.children).find(
      (child): child is HTMLElement =>
        !!HTMLElementConstructor &&
        child instanceof HTMLElementConstructor &&
        !child.hasAttribute("tabindex") &&
        !child.matches("button:disabled,input:disabled,select:disabled,textarea:disabled")
    );
    if (!candidate) {
      setUseWrapperKeyboardFallback(true);
      return;
    }

    setUseWrapperKeyboardFallback(false);
    candidate.setAttribute("tabindex", "0");
    return () => {
      if (candidate.getAttribute("tabindex") === "0") candidate.removeAttribute("tabindex");
    };
  }, [children, disabled]);

  const openAt = (clientX: number, clientY: number) => {
    returnFocusRef.current = document.activeElement as HTMLElement | null;
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

  // Close on outside click / scroll / window blur. Escape 由全局浮层栈处理。
  React.useEffect(() => {
    if (!open) return;
    const onOutside = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) close();
    };
    const onBlur = () => close();
    window.addEventListener("mousedown", onOutside);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("mousedown", onOutside);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      window.removeEventListener("blur", onBlur);
    };
  }, [open, close]);

  React.useEffect(() => {
    if (!open || active < 0) return;
    const frame = window.requestAnimationFrame(() => {
      menuRef.current
        ?.querySelector<HTMLButtonElement>(`[data-context-index="${active}"]`)
        ?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open, active]);

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

  /** 处理菜单内的方向键、首尾键和确认键。 */
  const handleMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Tab") {
      close();
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setActive((current) => {
        const direction = e.key === "ArrowDown" ? 1 : -1;
        let index = current;
        for (let count = 0; count < items.length; count += 1) {
          index = (index + direction + items.length) % items.length;
          if (isSelectable(items[index])) return index;
        }
        return current;
      });
      return;
    }
    if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      const indexes = items
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => isSelectable(item));
      const target = e.key === "Home" ? indexes[0] : indexes[indexes.length - 1];
      if (target) setActive(target.index);
      return;
    }
    if (e.key === "Enter") {
      const item = items[active];
      if (!disabled && item && isSelectable(item)) {
        e.preventDefault();
        item.onSelect?.();
        closeAndRestoreFocus();
      }
    }
  };

  // Wrap in a `display: contents` span so the handler lives on a DOM node we
  // fully control — React.cloneElement would fail to reach the DOM when
  // `children` is a React component that doesn't forward `onContextMenu`.
  const trigger = (
    <span
      ref={(node) => {
        triggerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      className={className}
      tabIndex={tabIndex ?? (useWrapperKeyboardFallback && !disabled ? 0 : undefined)}
      style={{ display: useWrapperKeyboardFallback || tabIndex != null ? "inline-block" : "contents", ...style }}
      onContextMenu={(e) => {
        onContextMenu?.(e);
        handleTriggerContextMenu(e);
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.defaultPrevented) return;
        if (e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) {
          e.preventDefault();
          const target = e.target as HTMLElement;
          const rect = target.getBoundingClientRect();
          openAt(rect.left + Math.min(12, rect.width / 2), rect.bottom);
        }
      }}
      {...rest}
    >
      {children}
    </span>
  );

  const panel =
    open && portalContainer
      ? ReactDOM.createPortal(
          <div
            ref={menuRef}
            className="context-menu"
             role="menu"
             aria-label="上下文菜单"
             tabIndex={-1}
             onKeyDown={handleMenuKeyDown}
             style={{
               position: "fixed",
               top: pos.top,
               left: pos.left,
               minWidth,
               zIndex: overlayZIndex,
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
                   data-context-index={i}
                   tabIndex={active === i ? 0 : -1}
                  disabled={it.disabled}
                  className={`context-menu-item ${active === i ? "active" : ""} ${it.danger ? "danger" : ""}`}
                  onMouseEnter={() => isSelectable(it) && setActive(i)}
                  onClick={() => {
                    if (disabled || !isSelectable(it)) return;
                    it.onSelect?.();
                    closeAndRestoreFocus();
                  }}
                >
                  <span className="context-menu-icon">{it.icon}</span>
                  <span className="context-menu-label">{it.label}</span>
                  {it.shortcut && <span className="context-menu-shortcut">{it.shortcut}</span>}
                </button>
              )
            )}
          </div>,
          portalContainer
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
