import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Splitter.css";
import * as React from "react";
import { withComponentTheme, type ComponentThemeProps } from "../Theme/ComponentTheme";

export type SplitterDirection = "horizontal" | "vertical";

export interface SplitterProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onResize">,
    ComponentThemeProps {
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
  /** 原生属性透传到拖拽手柄，可用于设置 aria-label。 */
  handleProps?: Omit<React.HTMLAttributes<HTMLDivElement>, "onPointerDown">;
  /** 第一个面板的附加类名。 */
  firstPaneClassName?: string;
  /** 第一个面板的内联样式，优先级高于内部分栏尺寸样式。 */
  firstPaneStyle?: React.CSSProperties;
  /** 第二个面板的附加类名。 */
  secondPaneClassName?: string;
  /** 第二个面板的内联样式。 */
  secondPaneStyle?: React.CSSProperties;
  /** 自定义分隔手柄内容；传入 null 可隐藏默认握柄。 */
  handle?: React.ReactNode;
  /** 第二个面板保留的最小尺寸。默认 24px。 */
  secondMin?: number;
  /** 可选持久化键；仅保存一个数值尺寸。 */
  storageKey?: string;
}

/** 将尺寸限制在有效的数值区间。 */
function clampSplitterSize(value: number, minimum: number, maximum: number): number {
  const normalized = Number.isFinite(value) ? value : minimum;
  return Math.max(minimum, Math.min(maximum, normalized));
}

/** 从本地存储读取分栏尺寸。 */
function readStoredSplitterSize(storageKey: string | undefined): number | undefined {
  if (!storageKey || typeof window === "undefined") return undefined;
  try {
    const storedValue = window.localStorage.getItem(`lumina:splitter:v1:${storageKey}`);
    if (storedValue == null) return undefined;
    const value = Number(storedValue);
    return Number.isFinite(value) ? value : undefined;
  } catch {
    return undefined;
  }
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
const SplitterBase = React.forwardRef<HTMLDivElement, SplitterProps>(({
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
  handleProps,
  firstPaneClassName = "",
  firstPaneStyle,
  secondPaneClassName = "",
  secondPaneStyle,
  handle,
  secondMin = 24,
  storageKey,
  ...rest
}, ref) => {
  const isControlled = size !== undefined;
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const cleanupDragRef = React.useRef<(() => void) | null>(null);
  const [inner, setInner] = React.useState(() =>
    clampSplitterSize(readStoredSplitterSize(storageKey) ?? defaultSize, min, max)
  );
  const [containerSize, setContainerSize] = React.useState<number>(Infinity);
  const [dragging, setDragging] = React.useState(false);

  const clamp = React.useCallback(
    (value: number) => {
      const availableMaximum = Number.isFinite(containerSize) && containerSize > 0
        ? Math.max(0, containerSize - Math.max(0, secondMin) - 6)
        : Infinity;
      const effectiveMaximum = Math.max(min, Math.min(max, availableMaximum));
      return clampSplitterSize(value, min, effectiveMaximum);
    },
    [containerSize, max, min, secondMin]
  );
  const rawCurrent = isControlled ? (size as number) : inner;
  const current = clamp(rawCurrent);

  /** 将最新尺寸写入可选本地持久化键。 */
  const persistSize = React.useCallback((value: number) => {
    if (!storageKey || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(`lumina:splitter:v1:${storageKey}`, String(value));
    } catch {
      // 浏览器禁用存储或配额不足时保持组件可用。
    }
  }, [storageKey]);

  const commit = React.useCallback(
    (value: number) => {
      const clamped = clamp(value);
      if (!isControlled) setInner(clamped);
      onResize?.(clamped);
      return clamped;
    },
    [clamp, isControlled, onResize]
  );

  React.useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    /** 读取当前分栏容器的主轴尺寸。 */
    const updateContainerSize = () => {
      setContainerSize(direction === "horizontal" ? element.clientWidth : element.clientHeight);
    };
    updateContainerSize();
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(updateContainerSize);
      observer.observe(element);
      return () => observer.disconnect();
    }
    window.addEventListener("resize", updateContainerSize);
    return () => window.removeEventListener("resize", updateContainerSize);
  }, [direction]);

  React.useEffect(() => () => cleanupDragRef.current?.(), []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);

    let latest = current;
    const move = (ev: PointerEvent) => {
      const next =
        direction === "horizontal" ? ev.clientX - rect.left : ev.clientY - rect.top;
      latest = commit(next);
    };
    /** 结束当前拖拽并清理全局监听。 */
    const finish = () => {
      setDragging(false);
      onResizeEnd?.(latest);
      persistSize(latest);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
      window.removeEventListener("blur", finish);
      cleanupDragRef.current = null;
    };
    cleanupDragRef.current?.();
    cleanupDragRef.current = finish;
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
    window.addEventListener("blur", finish);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    /** 提交一次键盘尺寸调整，并同步结束事件与持久化。 */
    const increment = (delta: number) => {
      const next = commit(current + delta);
      onResizeEnd?.(next);
      persistSize(next);
    };
    if (direction === "horizontal") {
      if (e.key === "ArrowLeft")  { e.preventDefault(); increment(-step); }
      if (e.key === "ArrowRight") { e.preventDefault(); increment(step); }
    } else {
      if (e.key === "ArrowUp")    { e.preventDefault(); increment(-step); }
      if (e.key === "ArrowDown")  { e.preventDefault(); increment(step); }
    }
    if (e.key === "Home") {
      e.preventDefault();
      const next = commit(min);
      onResizeEnd?.(next);
      persistSize(next);
    }
    if (e.key === "End") {
      e.preventDefault();
      const next = commit(Number.MAX_SAFE_INTEGER);
      onResizeEnd?.(next);
      persistSize(next);
    }
  };

  const firstStyle: React.CSSProperties =
    direction === "horizontal" ? { width: current } : { height: current };
  const {
    className: nativeHandleClassName = "",
    style: nativeHandleStyle,
    children: nativeHandleChildren,
    ...nativeHandleProps
  } = handleProps ?? {};
  const handleContent =
    handle !== undefined
      ? handle
      : nativeHandleChildren !== undefined
        ? nativeHandleChildren
        : <span className="splitter-handle-grip" aria-hidden />;

  return (
    <div
      ref={(node) => {
        containerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      className={`splitter ${direction} ${dragging ? "dragging" : ""} ${className}`}
      {...rest}
    >
      <div
        className={["splitter-panel", "first", firstPaneClassName].filter(Boolean).join(" ")}
        style={{ ...firstStyle, ...firstPaneStyle }}
      >
        {children[0]}
      </div>
      <div
        {...nativeHandleProps}
        role="separator"
        tabIndex={0}
        aria-label={handleProps?.["aria-label"] ?? "调整分栏尺寸"}
        aria-orientation={direction === "horizontal" ? "vertical" : "horizontal"}
        aria-valuenow={current}
        aria-valuemin={min}
        aria-valuemax={Number.isFinite(max) ? clamp(max) : undefined}
        className={["splitter-handle", handleClassName, nativeHandleClassName]
          .filter(Boolean)
          .join(" ")}
        style={nativeHandleStyle}
        onPointerDown={onPointerDown}
        onKeyDown={(event) => {
          handleProps?.onKeyDown?.(event);
          if (!event.defaultPrevented) onKeyDown(event);
        }}
      >
        {handleContent}
      </div>
      <div
        className={["splitter-panel", "second", secondPaneClassName].filter(Boolean).join(" ")}
        style={secondPaneStyle}
      >
        {children[1]}
      </div>
    </div>
  );
});
SplitterBase.displayName = "Splitter";

export const Splitter = withComponentTheme(SplitterBase, "Splitter", "splitter");
