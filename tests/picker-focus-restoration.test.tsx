import * as React from "react";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DatePicker } from "../src/components/DatePicker";
import { DateTimePicker } from "../src/components/DateTimePicker";
import { TimePicker } from "../src/components/TimePicker";
import { Modal } from "../src/components/Modal";
import { Select } from "../src/components/Select";

/** 按浏览器顺序触发鼠标事件，确保关闭前焦点确实进入浮层。 */
function clickWithFocus(target: HTMLElement): void {
  fireEvent.pointerDown(target);
  fireEvent.mouseDown(target);
  act(() => target.focus());
  fireEvent.mouseUp(target);
  fireEvent.click(target);
}

/** 推进关闭后的动画帧，让异步焦点归还和可能的重新打开完整执行。 */
function flushFocusRestoration(): void {
  act(() => vi.advanceTimersByTime(100));
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
});

/** 日期值、显隐状态及父弹窗的组合，覆盖各自独立的受控契约。 */
const datePickerCases = [false, true].flatMap((controlledValue) =>
  [false, true].flatMap((controlledOpen) =>
    [false, true].map((inModal) => ({ controlledValue, controlledOpen, inModal }))
  )
);

describe("选择器关闭后的焦点归还", () => {
  it.each(datePickerCases)("DatePicker 关闭后保持关闭：%j", ({ controlledValue, controlledOpen, inModal }) => {
    const onOpenChange = vi.fn();
    const onChange = vi.fn();
    const onModalClose = vi.fn();
    /** 模拟独立或弹窗内的受控与非受控表单。 */
    function Harness(): React.ReactElement {
      const [date, setDate] = React.useState<Date | null>(new Date(2027, 6, 7));
      const [open, setOpen] = React.useState(false);
      const picker = <DatePicker
        aria-label="计划日期"
        {...(controlledValue ? { value: date } : { defaultValue: new Date(2027, 6, 7) })}
        {...(controlledOpen ? { open } : {})}
        onChange={(next, text) => { onChange(next, text); setDate(next); }}
        onOpenChange={(next) => { onOpenChange(next); setOpen(next); }}
        allowClear
      />;
      return inModal ? <Modal open title="日期表单" onCancel={onModalClose}>{picker}</Modal> : picker;
    }
    render(<Harness />);
    flushFocusRestoration();
    const input = screen.getByRole("textbox", { name: "计划日期" });

    for (const action of ["确定", "确定", "确定", "日期", "今天", "清空", "Escape"]) {
      onOpenChange.mockClear();
      clickWithFocus(input);
      const panel = screen.getByRole("dialog", { name: "选择日期" });
      if (action === "Escape") {
        act(() => within(panel).getByRole("button", { name: "确定" }).focus());
        fireEvent.keyDown(document.activeElement!, { key: "Escape" });
      } else if (action === "日期") {
        clickWithFocus(within(panel).getByRole("gridcell", { name: "2027-07-08" }));
        expect(onChange).toHaveBeenLastCalledWith(new Date(2027, 6, 8), "2027-07-08");
      } else {
        clickWithFocus(within(panel).getByRole("button", { name: action }));
      }
      flushFocusRestoration();
      expect(screen.queryByRole("dialog", { name: "选择日期" })).toBeNull();
      expect(input.getAttribute("aria-expanded")).toBe("false");
      expect(document.activeElement).toBe(input);
      expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
      if (action === "清空") {
        expect(onChange).toHaveBeenLastCalledWith(null, "");
        expect((input as HTMLInputElement).value).toBe("");
      }
    }
    expect(onModalClose).not.toHaveBeenCalled();
  });

  it("归还焦点后仍可点击、Enter、方向键和重新聚焦打开", () => {
    render(<><button>上一个字段</button><DatePicker aria-label="日期" /><button>下一个字段</button></>);
    const input = screen.getByRole("textbox", { name: "日期" });
    act(() => input.focus());
    clickWithFocus(screen.getByRole("button", { name: "确定" }));
    flushFocusRestoration();
    for (const key of ["Enter", "ArrowDown"]) {
      fireEvent.keyDown(input, { key });
      expect(screen.getByRole("dialog", { name: "选择日期" })).not.toBeNull();
      fireEvent.keyDown(input, { key: "Escape" });
      flushFocusRestoration();
      expect(screen.queryByRole("dialog", { name: "选择日期" })).toBeNull();
    }
    // jsdom 不执行 Tab 默认导航；真实 Tab 顺序另由内置浏览器验证。
    act(() => screen.getByRole("button", { name: "下一个字段" }).focus());
    act(() => input.focus());
    expect(screen.getByRole("dialog", { name: "选择日期" })).not.toBeNull();
    clickWithFocus(input);
    flushFocusRestoration();
    expect(screen.queryByRole("dialog", { name: "选择日期" })).toBeNull();
    clickWithFocus(input);
    expect(screen.getByRole("dialog", { name: "选择日期" })).not.toBeNull();
  });

  it("外部点击和关闭后切换字段不抢回焦点", () => {
    render(<><DatePicker aria-label="日期" /><button>外部操作</button></>);
    const input = screen.getByRole("textbox", { name: "日期" });
    const outside = screen.getByRole("button", { name: "外部操作" });
    clickWithFocus(input);
    act(() => screen.getByRole("button", { name: "确定" }).focus());
    clickWithFocus(outside);
    flushFocusRestoration();
    expect(document.activeElement).toBe(outside);
    expect(screen.queryByRole("dialog")).toBeNull();
    clickWithFocus(input);
    clickWithFocus(screen.getByRole("button", { name: "确定" }));
    act(() => outside.focus());
    flushFocusRestoration();
    expect(document.activeElement).toBe(outside);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("受控显隐只报告关闭，外部更新后归还焦点而不重新请求打开", () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(<DatePicker open value={new Date(2027, 6, 7)} onOpenChange={onOpenChange} />);
    const input = screen.getByRole("textbox");
    clickWithFocus(screen.getByRole("button", { name: "确定" }));
    flushFocusRestoration();
    expect(screen.getByRole("dialog", { name: "选择日期" })).not.toBeNull();
    expect(onOpenChange.mock.calls).toEqual([[false]]);
    rerender(<DatePicker open={false} value={new Date(2027, 6, 9)} onOpenChange={onOpenChange} />);
    flushFocusRestoration();
    expect(document.activeElement).toBe(input);
    expect((input as HTMLInputElement).value).toBe("2027-07-09");
    expect(onOpenChange.mock.calls).toEqual([[false]]);
    rerender(<DatePicker open value={null} onOpenChange={onOpenChange} />);
    expect(screen.getByRole("dialog", { name: "选择日期" })).not.toBeNull();
    expect((input as HTMLInputElement).value).toBe("");
  });

  it("defaultOpen 关闭后仍发出原生焦点回调，但不发出重新打开请求", () => {
    const onOpenChange = vi.fn();
    const onFocus = vi.fn();
    render(<DatePicker defaultOpen onOpenChange={onOpenChange} onFocus={onFocus} />);
    const input = screen.getByRole("textbox");
    clickWithFocus(screen.getByRole("button", { name: "确定" }));
    flushFocusRestoration();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(input);
    expect(onFocus.mock.calls.at(-1)?.[0].target).toBe(input);
    expect(onOpenChange.mock.calls).toEqual([[false]]);
  });

  it.each(["TimePicker", "DateTimePicker"])("%s 复用触发器后确认、清空和 Esc 不重开", (picker) => {
    const onOpenChange = vi.fn();
    render(picker === "TimePicker"
      ? <TimePicker defaultValue="09:30" allowClear onOpenChange={onOpenChange} />
      : <DateTimePicker defaultValue={new Date(2027, 6, 7, 9, 30)} allowClear onOpenChange={onOpenChange} />);
    const input = screen.getByRole("textbox");
    for (const action of ["确定", "确定", "清空", "Escape"]) {
      onOpenChange.mockClear();
      clickWithFocus(input);
      if (action === "Escape") {
        act(() => screen.getByRole("button", { name: "确定" }).focus());
        fireEvent.keyDown(document.activeElement!, { key: "Escape" });
      } else {
        clickWithFocus(screen.getByRole("button", { name: action }));
      }
      flushFocusRestoration();
      expect(screen.queryByRole("dialog")).toBeNull();
      expect(document.activeElement).toBe(input);
      expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
    }
  });

  it("Select 继续在选择后归还触发器焦点", () => {
    render(<Select options={[{ value: "a", label: "选项 A" }]} />);
    const trigger = screen.getByRole("combobox");
    clickWithFocus(trigger);
    clickWithFocus(screen.getByRole("option", { name: "选项 A" }));
    flushFocusRestoration();
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
