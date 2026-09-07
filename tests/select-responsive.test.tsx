import * as React from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Select, type SelectOption } from "../src/components/Select";

/** 用可控尺寸模拟浏览器布局，交互仍通过真实 Select DOM 执行。 */
const dimensions = { available: 140, widths: [80, 63, 90], search: 16, gap: 4 };
const observers = new Set<TestResizeObserver>();
const frames = new Map<number, FrameRequestCallback>();
let frameId = 0;

/** 记录观察节点并允许测试模拟容器或标签的尺寸通知。 */
class TestResizeObserver {
  elements = new Set<Element>();
  /** 注册本次组件挂载创建的观察器。 */
  constructor(readonly callback: ResizeObserverCallback) { observers.add(this); }
  /** 记录需要观察的标签或容器。 */
  observe(element: Element) { this.elements.add(element); }
  /** 取消指定节点的观察。 */
  unobserve(element: Element) { this.elements.delete(element); }
  /** 模拟卸载时释放观察器。 */
  disconnect() { this.elements.clear(); observers.delete(this); }
}

/** 返回只供本组测试使用的矩形。 */
const rectangle = (width: number): DOMRect => ({
  width, height: 24, top: 0, bottom: 24, left: 0, right: width, x: 0, y: 0,
  toJSON: () => ({}),
});

/** 发出尺寸通知并执行下一帧，验证测量不会在观察器回调内同步修改 DOM。 */
const resize = () => act(() => {
  observers.forEach((observer) => observer.callback([], observer as unknown as ResizeObserver));
  const pending = Array.from(frames.values());
  frames.clear();
  pending.forEach((callback) => callback(0));
});

/** 返回当前真正展示的标签，不把用于测量的隐藏项算入。 */
const visibleTags = () => Array.from(document.querySelectorAll("[data-select-tag]:not([data-collapsed])"));

const OPTIONS: SelectOption[] = [
  { value: "gift", label: "外观礼盒" },
  { value: "hair", label: "发型" },
  { value: "cape", label: "披风" },
];

/** 为每例安装独立的布局、动画帧和尺寸观察器替身。 */
beforeEach(() => {
  Object.assign(dimensions, { available: 140, widths: [80, 63, 90], search: 16, gap: 4 });
  vi.stubGlobal("ResizeObserver", TestResizeObserver);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frames.set(++frameId, callback);
    return frameId;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  const originalStyle = window.getComputedStyle;
  vi.spyOn(window, "getComputedStyle").mockImplementation((element) => {
    const style = originalStyle(element);
    if (element.classList.contains("select-tags")) {
      Object.defineProperty(style, "columnGap", { value: `${dimensions.gap}px` });
    }
    return style;
  });
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function () {
    if (this.classList.contains("select-tags")) return rectangle(dimensions.available);
    if (this.classList.contains("select-search-measure")) return rectangle(dimensions.search);
    if (this.hasAttribute("data-select-overflow")) return rectangle(20 + this.textContent!.length * 7);
    if (this.hasAttribute("data-select-tag")) {
      const index = Array.from(this.parentElement!.querySelectorAll("[data-select-tag]")).indexOf(this);
      return rectangle(dimensions.widths[index] ?? 50);
    }
    return rectangle(0);
  });
});

/** 清理观察器、帧和全局替身，防止影响其他 Select 回归。 */
afterEach(() => {
  cleanup();
  frames.clear();
  observers.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Select 自适应单行标签", () => {
  it("随宽度恢复两个、折叠到一个或只显示 +N，且不改变选值和选中标记", () => {
    const onChange = vi.fn();
    render(<Select multiple searchable allowClear defaultOpen maxTagCount="responsive"
      defaultValue={["gift", "hair"]} options={OPTIONS} onChange={onChange} />);
    expect(visibleTags()).toHaveLength(1);
    expect(document.querySelector(".select-tag-overflow")?.textContent).toBe("+1");

    dimensions.available = 230;
    resize();
    expect(visibleTags()).toHaveLength(2);
    expect(document.querySelector(".select-tag-overflow")).toBeNull();

    dimensions.available = 80;
    resize();
    expect(visibleTags()).toHaveLength(0);
    expect(document.querySelector(".select-tag-overflow")?.textContent).toBe("+2");
    expect(screen.getAllByRole("option").map((option) => option.getAttribute("aria-selected")))
      .toEqual(["true", "true", "false"]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("完整标签恰好放得下时移除 +N，不因较早前缀不满足而提前终止", () => {
    dimensions.widths = [40, 10];
    dimensions.available = 74;
    render(<Select multiple searchable maxTagCount="responsive" defaultValue={["gift", "hair"]} options={OPTIONS} />);
    expect(visibleTags()).toHaveLength(2);
    expect(document.querySelector(".select-tag-overflow")).toBeNull();
  });

  it("按 +9 和 +10 的实际宽度计算折叠数量，并在清空后释放所有标签", () => {
    const options = Array.from({ length: 11 }, (_, index) => ({ value: String(index), label: `标签 ${index}` }));
    dimensions.widths = Array(11).fill(10);
    dimensions.available = 94;
    const { rerender } = render(<Select multiple searchable maxTagCount="responsive" value={options.map((o) => o.value)} options={options} />);
    expect(visibleTags()).toHaveLength(2);
    expect(document.querySelector(".select-tag-overflow")?.textContent).toBe("+9");
    dimensions.available = 69;
    resize();
    expect(visibleTags()).toHaveLength(0);
    expect(document.querySelector(".select-tag-overflow")?.textContent).toBe("+11");
    rerender(<Select multiple searchable maxTagCount="responsive" value={[]} options={options} />);
    expect(document.querySelectorAll("[data-select-tag]")).toHaveLength(0);
    expect(document.querySelector(".select-tag-overflow")).toBeNull();
  });

  it("搜索词占满可用空间时保留 +N，输入、组合输入和退格删除仍可用", () => {
    const onChange = vi.fn();
    const onSearch = vi.fn();
    render(<Select multiple searchable maxTagCount="responsive" defaultValue={["gift", "hair"]}
      options={OPTIONS} onChange={onChange} onSearch={onSearch} />);
    const input = screen.getByRole("combobox") as HTMLInputElement;
    dimensions.search = 500;
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: "很长的中文搜索词" } });
    expect(visibleTags()).toHaveLength(0);
    expect(input.style.width).toBe("102px");
    expect(input.value).toBe("很长的中文搜索词");
    fireEvent.keyDown(input, { key: "Enter", isComposing: true, keyCode: 229 });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.compositionEnd(input);
    dimensions.search = 16;
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.keyDown(input, { key: "Backspace", isComposing: true, keyCode: 229 });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(onChange).toHaveBeenLastCalledWith(["gift"]);
    expect(visibleTags()).toHaveLength(1);
    expect(onSearch).toHaveBeenLastCalledWith("");
  });

  it("受控选值通过移除、清空和键盘选择只报告变化，等待外部 prop 更新", () => {
    const onChange = vi.fn();
    const onClear = vi.fn();
    const { rerender } = render(<Select multiple searchable allowClear defaultOpen maxTagCount="responsive"
      value={["gift", "hair"]} options={OPTIONS} onChange={onChange} onClear={onClear} />);
    fireEvent.click(visibleTags()[0].querySelector("[role=button]")!);
    expect(onChange).toHaveBeenLastCalledWith(["hair"]);
    expect(document.querySelectorAll("[data-select-tag]")).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(document.querySelectorAll("[data-select-tag]")).toHaveLength(2);
    rerender(<Select multiple searchable allowClear defaultOpen maxTagCount="responsive"
      value={[]} options={OPTIONS} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Enter" });
    expect(onChange).toHaveBeenLastCalledWith(["gift"]);
    expect(document.querySelectorAll("[data-select-tag]")).toHaveLength(0);
  });

  it("隐藏标签只有一份内容，且设置 inert 和 aria-hidden 隔离可聚焦后代", () => {
    const selectedRender = vi.fn((option: SelectOption) => <span>{option.label}</span>);
    render(<Select multiple searchable maxTagCount="responsive" defaultValue={["gift", "hair"]}
      options={OPTIONS} selectedRender={selectedRender} />);
    expect(document.querySelectorAll("input")).toHaveLength(1);
    expect(document.querySelectorAll(".select-tag-label")).toHaveLength(2);
    const hidden = document.querySelector("[data-collapsed=true]")!;
    expect(hidden.hasAttribute("inert")).toBe(true);
    expect(hidden.getAttribute("aria-hidden")).toBe("true");
    expect(document.querySelector(".select-tag-measurements")?.hasAttribute("inert")).toBe(true);
  });

  it("标签原地改变尺寸和组件重新显示后重新测量，合并通知并清理观察器", () => {
    const { unmount } = render(<Select multiple searchable maxTagCount="responsive"
      defaultValue={["gift", "hair"]} options={OPTIONS} />);
    expect(visibleTags()).toHaveLength(1);
    dimensions.widths = [25, 25];
    resize();
    expect(visibleTags()).toHaveLength(2);
    dimensions.available = 0;
    resize();
    expect(visibleTags()).toHaveLength(2);
    dimensions.available = 60;
    resize();
    expect(visibleTags()).toHaveLength(0);
    observers.forEach((observer) => {
      observer.callback([], observer as unknown as ResizeObserver);
      observer.callback([], observer as unknown as ResizeObserver);
    });
    expect(frames.size).toBe(1);
    unmount();
    expect(frames.size).toBe(0);
    expect(observers.size).toBe(0);
  });

  it("标签内容更新和 searchable 切换及时刷新布局，计数稳定后不重复渲染", () => {
    const selectedRender = vi.fn((option: SelectOption) => option.label);
    const { rerender } = render(<Select multiple maxTagCount="responsive"
      value={["gift", "hair"]} options={OPTIONS} selectedRender={selectedRender} />);
    dimensions.widths = [45, 60];
    rerender(<Select multiple searchable maxTagCount="responsive" value={["gift", "hair"]}
      options={[{ value: "gift", label: "新标签" }, OPTIONS[1]]} selectedRender={selectedRender} />);
    expect(visibleTags()).toHaveLength(2);
    expect(visibleTags()[0].textContent).toContain("新标签");
    selectedRender.mockClear();
    resize();
    resize();
    expect(selectedRender).not.toHaveBeenCalled();
  });

  it("等长选值替换后观察新标签，后续异步内容尺寸变化仍能触发折叠", () => {
    const { rerender } = render(<Select multiple searchable maxTagCount="responsive"
      value={["gift"]} options={OPTIONS} />);
    rerender(<Select multiple searchable maxTagCount="responsive" value={["cape"]} options={OPTIONS} />);
    const tag = document.querySelector("[data-select-tag]")!;
    expect(Array.from(observers).some((observer) => observer.elements.has(tag))).toBe(true);
    dimensions.widths = [200];
    resize();
    expect(visibleTags()).toHaveLength(0);
    expect(document.querySelector(".select-tag-overflow")?.textContent).toBe("+1");
  });

  it.each([undefined, 0, 1, 2])("数字或未设置 maxTagCount=%s 继续沿用原来的标签数量，不启用测量", (maxTagCount) => {
    render(<Select multiple searchable defaultValue={["gift", "hair", "cape"]}
      maxTagCount={maxTagCount} options={OPTIONS} />);
    expect(document.querySelectorAll(".select-tag-label")).toHaveLength(maxTagCount ?? 3);
    expect(document.querySelector(".select-tag-measurements")).toBeNull();
    expect(observers.size).toBe(0);
  });
});
