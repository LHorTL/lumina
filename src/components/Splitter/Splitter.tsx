import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Splitter.css";
import * as React from "react";

export type SplitterDirection = "horizontal" | "vertical";

export interface SplitterProps {
  /**
   * Layout direction.
   * - `"horizontal"` (default) — children placed left/right, handle is a vertical bar.
   * - `"vertical"` — children placed top/bottom, handle is a horizontal bar.
   */
  direction?: SplitterDirection;
  /** Uncontrolled initial size (px) of the first panel. */
  defaultSize?: number;
  /** Controlled size (px) of the first panel. */
  size?: number;
  /** Fires while the user drags. */
  onResize?: (size: number) => void;
  /** Fires once when the drag ends. */
  onResizeEnd?: (size: number) => void;
  /** Minimum size (px) of the first panel. Default 80. */
  min?: number;
  /** Maximum size (px) of the first panel. Default Infinity. */
  max?: number;
  /** Keyboard step in px. Default 16. */
  step?: number;
  /** Exactly two children: the two panels. */
  children: [React.ReactNode, React.ReactNode];
  className?: string;
  /** Extra className on the drag handle. */
  handleClassName?: string;
}

/**
 * `Splitter` — draggable split between two panels. Keyboard-accessible.
 *
 * @example
 * ```tsx
 * <Splitter defaultSize={240} min={160} max={400}>
 *   <Sidebar ... />
 *   <main>...</main>
 * </Splitter>
 * ```
 */
export const Splitter: React.FC<SplitterProps> = ({
  direction = "horizontal",
  defaultSize = 240,
  size,
  onResize,
  onResizeEnd,
  min = 80,
  max = Infinity,
  step = 16,
  children,
  className = "",
  handleClassName = "",
}) => {
  const isControlled = size !== undefined;
  const [inner, setInner] = React.useState(defaultSize);
  const current = isControlled ? (size as number) : inner;

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = React.useState(false);

  const clamp = React.useCallback(
    (n: number) => {
      const el = containerRef.current;
      const bound = el
        ? direction === "horizontal"
          ? el.clientWidth
          : el.clientHeight
        : Infinity;
      return Math.max(min, Math.min(Math.min(max, Math.max(0, bound - 24)), n));
    },
    [direction, min, max]
  );

  const commit = React.useCallback(
    (n: number) => {
      const clamped = clamp(n);
      if (!isControlled) setInner(clamped);
      onResize?.(clamped);
      return clamped;
    },
    [clamp, isControlled, onResize]
  );

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setDragging(true);
    (e.target as Element).setPointerCapture?.(e.pointerId);

    let latest = current;
    const move = (ev: PointerEvent) => {
      const next =
        direction === "horizontal" ? ev.clientX - rect.left : ev.clientY - rect.top;
      latest = commit(next);
    };
    const up = () => {
      setDragging(false);
      onResizeEnd?.(latest);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const inc = (n: number) => commit(current + n);
    if (direction === "horizontal") {
      if (e.key === "ArrowLeft")  { e.preventDefault(); inc(-step); }
      if (e.key === "ArrowRight") { e.preventDefault(); inc(step); }
    } else {
      if (e.key === "ArrowUp")    { e.preventDefault(); inc(-step); }
      if (e.key === "ArrowDown")  { e.preventDefault(); inc(step); }
    }
  };

  const firstStyle: React.CSSProperties =
    direction === "horizontal" ? { width: current } : { height: current };

  return (
    <div
      ref={containerRef}
      className={`splitter ${direction} ${dragging ? "dragging" : ""} ${className}`}
    >
      <div className="splitter-panel first" style={firstStyle}>
        {children[0]}
      </div>
      <div
        role="separator"
        tabIndex={0}
        aria-orientation={direction === "horizontal" ? "vertical" : "horizontal"}
        aria-valuenow={current}
        aria-valuemin={min}
        aria-valuemax={Number.isFinite(max) ? max : undefined}
        className={`splitter-handle ${handleClassName}`}
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
      >
        <span className="splitter-handle-grip" aria-hidden />
      </div>
      <div className="splitter-panel second">{children[1]}</div>
    </div>
  );
};
