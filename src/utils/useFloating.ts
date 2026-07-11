import * as React from "react";
import { useOverlayZIndex } from "./overlayStack";

/** 浏览器使用布局副作用，服务端渲染时回退普通副作用。 */
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export type Placement = "top" | "bottom" | "left" | "right";

export interface UseFloatingOptions {
  /** Whether the floating element is currently visible. */
  open: boolean;
  /** Preferred placement relative to the trigger. Default `"bottom"`. */
  placement?: Placement;
  /** Distance between trigger and panel in px. Default 8. */
  gap?: number;
  /** Estimated panel width, used for flip / shift math. Ignored when `matchTriggerWidth`. */
  panelWidth?: number;
  /** Estimated panel height, used for flip / shift math. */
  panelHeight?: number;
  /** Keep the panel inside the viewport horizontally / vertically. Default true. */
  shift?: boolean;
  /** Flip to the opposite side if the preferred side would overflow. Default true. */
  flip?: boolean;
  /** Make the panel width track the trigger width (used by Select / Cascader). */
  matchTriggerWidth?: boolean;
  /**
   * Cross-axis alignment of the panel relative to the trigger.
   * - `"start"`  (default) — panel's leading edge lines up with trigger's leading edge.
   * - `"center"` — panel is centered on the trigger.
   * - `"end"`    — panel's trailing edge lines up with trigger's trailing edge.
   *
   * 所有对齐方式都会继续参与 `shift` 计算，避免靠近视口边缘时溢出。
   */
  alignCross?: "start" | "center" | "end";
}

export interface UseFloatingResult<
  T extends HTMLElement,
  F extends HTMLElement
> {
  /** Attach this to the trigger element. */
  triggerRef: React.RefObject<T>;
  /** Attach this to the floating element so placement can use its real size. */
  floatingRef: React.RefObject<F>;
  /** Spread this onto the panel element. Already contains `position: fixed` + coords. */
  floatingStyle: React.CSSProperties;
  /** Resolved placement after flip logic — useful for arrow direction. */
  placement: Placement;
  /** 当前浮层在全局浮层栈中的视觉层级。 */
  zIndex: number;
}

/**
 * Minimal floating-element positioning hook used by Tooltip / Popover / Select /
 * Cascader / ColorPicker。配合主题感知的 Portal 容器使用，避免祖先 overflow 裁剪。
 *
 * Not a general-purpose `@floating-ui` replacement — it only covers flip + shift
 * relative to the viewport, which is what Lumina's overlays need.
 */
export function useFloating<
  T extends HTMLElement = HTMLElement,
  F extends HTMLElement = HTMLElement
>(
  opts: UseFloatingOptions
): UseFloatingResult<T, F> {
  const triggerRef = React.useRef<T>(null);
  const floatingRef = React.useRef<F>(null);
  const preferred = opts.placement ?? "bottom";
  const gap = opts.gap ?? 8;
  const panelW = opts.panelWidth ?? 240;
  const panelH = opts.panelHeight ?? 300;
  const doShift = opts.shift !== false;
  const doFlip = opts.flip !== false;
  const matchW = !!opts.matchTriggerWidth;
  const align = opts.alignCross ?? "start";
  const open = opts.open;
  const zIndex = useOverlayZIndex(open);

  const [state, setState] = React.useState<{
    top: number;
    left: number;
    width?: number;
    placement: Placement;
  }>({ top: 0, left: 0, placement: preferred });

  useIsomorphicLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const el = triggerRef.current;
      if (!el) return;

      const floatingRect = floatingRef.current?.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      const measuredW = floatingRect?.width && floatingRect.width > 0 ? floatingRect.width : undefined;
      const measuredH = floatingRect?.height && floatingRect.height > 0 ? floatingRect.height : undefined;
      const w = matchW ? rect.width : (measuredW ?? panelW);
      const h = measuredH ?? panelH;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const MARGIN = 8;

      const place = (p: Placement) => {
        switch (p) {
          case "top":
            return { top: rect.top - gap - h, left: rect.left };
          case "right":
            return { top: rect.top, left: rect.right + gap };
          case "left":
            return { top: rect.top, left: rect.left - gap - w };
          case "bottom":
          default:
            return { top: rect.bottom + gap, left: rect.left };
        }
      };

      const fits = (p: Placement, c: { top: number; left: number }) => {
        if (p === "bottom") return c.top + h <= vh - MARGIN;
        if (p === "top") return c.top >= MARGIN;
        if (p === "right") return c.left + w <= vw - MARGIN;
        if (p === "left") return c.left >= MARGIN;
        return true;
      };

      let resolved: Placement = preferred;
      let coords = place(resolved);

      if (doFlip && !fits(resolved, coords)) {
        const opp: Record<Placement, Placement> = {
          top: "bottom",
          bottom: "top",
          left: "right",
          right: "left",
        };
        const alt = opp[resolved];
        const altCoords = place(alt);
        if (fits(alt, altCoords)) {
          resolved = alt;
          coords = altCoords;
        }
      }

      // 先用浮层真实尺寸完成交叉轴对齐，再统一执行视口钳位。
      // 这样 center / end 不需要 CSS transform，也不会在窗口边缘溢出。
      if (resolved === "top" || resolved === "bottom") {
        if (align === "center") coords.left = rect.left + (rect.width - w) / 2;
        if (align === "end") coords.left = rect.right - w;
      } else {
        if (align === "center") coords.top = rect.top + (rect.height - h) / 2;
        if (align === "end") coords.top = rect.bottom - h;
      }
      if (doShift) {
        // 首选侧与翻转侧都放不下时，主轴也必须钳位；超大面板至少贴住视口起始边距。
        coords.left = Math.max(MARGIN, Math.min(coords.left, Math.max(MARGIN, vw - w - MARGIN)));
        coords.top = Math.max(MARGIN, Math.min(coords.top, Math.max(MARGIN, vh - h - MARGIN)));
      }

      setState({
        top: coords.top,
        left: coords.left,
        width: matchW ? rect.width : undefined,
        placement: resolved,
      });
    };

    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    if (ro) {
      if (triggerRef.current) ro.observe(triggerRef.current);
      if (floatingRef.current) ro.observe(floatingRef.current);
    }
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
      ro?.disconnect();
    };
  }, [open, preferred, gap, panelW, panelH, doShift, doFlip, matchW, align]);

  const floatingStyle: React.CSSProperties = {
    position: "fixed",
    top: state.top,
    left: state.left,
    zIndex,
    ...(state.width != null ? { width: state.width } : {}),
  };

  return {
    triggerRef,
    floatingRef,
    floatingStyle,
    placement: state.placement,
    zIndex,
  };
}
