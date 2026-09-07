import * as React from "react";

/** 服务端跳过布局读取，浏览器在绘制前完成首次折叠。 */
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

/** 标签区测量结果；只控制展示数量和搜索框宽度，不修改选值。 */
interface ResponsiveTagLayout {
  count: number;
  inputWidth: number;
}

/** 根据标签、各个 +N 和搜索文本的实际宽度，求出可容纳的最长前缀。 */
export function measureResponsiveTags(container: HTMLElement): ResponsiveTagLayout | undefined {
  const availableWidth = container.getBoundingClientRect().width;
  // display:none 时保留上一次结果，重新显示由 ResizeObserver 触发测量。
  if (availableWidth <= 0) return undefined;

  const tags = Array.from(container.querySelectorAll<HTMLElement>("[data-select-tag]"));
  const overflows = Array.from(container.querySelectorAll<HTMLElement>("[data-select-overflow]"));
  const search = container.querySelector<HTMLElement>(".select-search-measure");
  const gap = parseFloat(getComputedStyle(container).columnGap) || 0;
  const tagWidths = tags.map((tag) => tag.getBoundingClientRect().width);
  const overflowWidths = [0, ...overflows.map((tag) => tag.getBoundingClientRect().width)];
  // 长搜索词最多占满 +N 以外的空间，原生 input 负责水平滚动和光标编辑。
  const inputWidth = search
    ? Math.min(search.getBoundingClientRect().width, Math.max(0,
        availableWidth - (overflowWidths[tags.length] ?? 0) - (tags.length > 0 ? gap : 0)))
    : 0;

  let count = 0;
  let prefixWidth = 0;
  for (let index = 0; index <= tags.length; index += 1) {
    const remaining = tags.length - index;
    const itemCount = index + (remaining > 0 ? 1 : 0) + (search ? 1 : 0);
    const width = prefixWidth + (overflowWidths[remaining] ?? 0) + inputWidth
      + Math.max(0, itemCount - 1) * gap;
    // 不能在首次不满足时中断：显示全部时 +N 消失，可能反而放得下。
    if (width <= availableWidth) count = index;
    prefixWidth += tagWidths[index] ?? 0;
  }
  return { count, inputWidth };
}

/** 观察稳定的标签原始尺寸和可用区域，合并同帧通知以避免观察器循环。 */
export function useResponsiveTags(enabled: boolean, items: readonly unknown[], searchable: boolean) {
  const tagsRef = React.useRef<HTMLSpanElement>(null);
  const [layout, setLayout] = React.useState<ResponsiveTagLayout>({ count: 0, inputWidth: 0 });

  /** 只提交真正变化的测量结果，防止布局相同时重复渲染。 */
  const measure = React.useCallback(() => {
    if (!tagsRef.current) return;
    const next = measureResponsiveTags(tagsRef.current);
    if (next) setLayout((previous) =>
      previous.count === next.count && previous.inputWidth === next.inputWidth ? previous : next);
  }, []);

  // 每次提交后测量，涵盖选值、selectedRender、搜索词和主题属性更新。
  useIsomorphicLayoutEffect(() => {
    if (enabled) measure();
  });

  useIsomorphicLayoutEffect(() => {
    const container = tagsRef.current;
    if (!enabled || !container) return;
    let frame = 0;
    /** 将尺寸通知合并到下一帧，不在 ResizeObserver 回调内修改布局。 */
    const scheduleMeasure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(scheduleMeasure) : undefined;
    observer?.observe(container);
    container.querySelectorAll<HTMLElement>("[data-select-tag], [data-select-overflow], .select-search-measure")
      .forEach((element) => observer?.observe(element));
    window.addEventListener("resize", scheduleMeasure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
      cancelAnimationFrame(frame);
    };
  }, [enabled, items, searchable, measure]);

  return { tagsRef, count: Math.min(layout.count, items.length), inputWidth: layout.inputWidth };
}
