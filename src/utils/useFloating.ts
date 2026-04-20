import * as React from "react";

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
   * - `"center"` — panel is centered on the trigger (uses a CSS transform).
   * - `"end"`    — panel's trailing edge lines up with trigger's trailing edge.
   *
   * `shift` is ignored for non-`"start"` alignments to avoid tugging against the
   * caller's translate.
   */
  alignCross?: "start" | "center" | "end";
}

export interface UseFloatingResult<T extends HTMLElement> {
  /** Attach this to the trigger element. */
  triggerRef: React.RefObject<T>;
  /** Spread this onto the panel element. Already contains `position: fixed` + coords. */
  floatingStyle: React.CSSProperties;
  /** Resolved placement after flip logic — useful for arrow direction. */
  placement: Placement;
}

/**
 * Minimal floating-element positioning hook used by Tooltip / Popover / Select /
 * Cascader / ColorPicker. Designed to be paired with `createPortal(document.body)`
 * so overflow clipping from ancestors becomes a non-issue.
 *
 * Not a general-purpose `@floating-ui` replacement — it only covers flip + shift
 * relative to the viewport, which is what Lumina's overlays need.
 */
export function useFloating<T extends HTMLElement = HTMLElement>(
  opts: UseFloatingOptions
): UseFloatingResult<T> {
  const triggerRef = React.useRef<T>(null);
  const preferred = opts.placement ?? "bottom";
  const gap = opts.gap ?? 8;
  const panelW = opts.panelWidth ?? 240;
  const panelH = opts.panelHeight ?? 300;
  const doShift = opts.shift !== false;
  const doFlip = opts.flip !== false;
  const matchW = !!opts.matchTriggerWidth;
  const align = opts.alignCross ?? "start";
  const open = opts.open;

  const [state, setState] = React.useState<{
    top: number;
    left: number;
    width?: number;
    placement: Placement;
  }>({ top: 0, left: 0, placement: preferred });

  React.useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const el = triggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const w = matchW ? rect.width : panelW;
      const h = panelH;
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

      // Cross-axis alignment replaces the cross coordinate with the trigger
      // midpoint / far edge; the paired CSS transform then visually aligns.
      if (align !== "start") {
        if (resolved === "top" || resolved === "bottom") {
          coords.left =
            align === "center" ? rect.left + rect.width / 2 : rect.right;
        } else {
          coords.top =
            align === "center" ? rect.top + rect.height / 2 : rect.bottom;
        }
      } else if (doShift) {
        if (resolved === "bottom" || resolved === "top") {
          coords.left = Math.max(MARGIN, Math.min(coords.left, vw - w - MARGIN));
        } else {
          coords.top = Math.max(MARGIN, Math.min(coords.top, vh - h - MARGIN));
        }
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
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, preferred, gap, panelW, panelH, doShift, doFlip, matchW]);

  let transform: string | undefined;
  if (align !== "start") {
    const cross = state.placement === "top" || state.placement === "bottom" ? "X" : "Y";
    const percent = align === "center" ? "-50%" : "-100%";
    transform = `translate${cross}(${percent})`;
  }

  const floatingStyle: React.CSSProperties = {
    position: "fixed",
    top: state.top,
    left: state.left,
    ...(state.width != null ? { width: state.width } : {}),
    ...(transform ? { transform } : {}),
  };

  return { triggerRef, floatingStyle, placement: state.placement };
}
