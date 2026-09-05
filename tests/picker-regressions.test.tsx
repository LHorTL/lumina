import * as React from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DatePicker } from "../src/components/DatePicker";
import { DateTimePicker } from "../src/components/DateTimePicker";
import { ColorPicker } from "../src/components/ColorPicker";
import { Select } from "../src/components/Select";
import { TimePicker } from "../src/components/TimePicker";

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  }),
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("picker regressions", () => {
  it("keeps controlled DatePicker draft while typing", async () => {
    const Harness = () => {
      const [value, setValue] = React.useState<Date | null>(new Date(2026, 4, 25));
      return <DatePicker value={value} onChange={setValue} data-testid="date-picker" />;
    };

    const { container } = render(<Harness />);
    const input = container.querySelector<HTMLInputElement>("input");
    expect(input?.value).toBe("2026-05-25");

    fireEvent.change(input!, { target: { value: "2026-05-2" } });
    await tick();

    expect(input?.value).toBe("2026-05-2");
  });

  it("keeps an hour selectable when min only restricts part of that hour", () => {
    const onChange = vi.fn();
    render(
      <TimePicker
        defaultOpen
        defaultValue="09:00"
        min="08:30"
        max="20:00"
        onChange={onChange}
      />
    );

    const hourList = screen.getAllByRole("listbox", { name: "时" })[0];
    const hourOption = within(hourList).getByRole("option", { name: "08" });

    expect((hourOption as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(hourOption);

    expect(onChange).toHaveBeenLastCalledWith("08:30", {
      hour: 8,
      minute: 30,
      second: 0,
    });
  });

  it("keeps a DateTimePicker hour selectable when min only restricts part of that hour", () => {
    const onChange = vi.fn();
    render(
      <DateTimePicker
        defaultOpen
        defaultValue={new Date(2026, 4, 25, 9)}
        min={new Date(2026, 4, 25, 8, 30)}
        max={new Date(2026, 4, 25, 20)}
        onChange={onChange}
      />
    );

    const hourList = screen.getAllByRole("listbox", { name: "时" })[0];
    const hourOption = within(hourList).getByRole("option", { name: "08" });

    expect((hourOption as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(hourOption);

    expect(onChange.mock.calls.at(-1)?.[1]).toBe("2026-05-25 08:30");
    expect(onChange.mock.calls.at(-1)?.[0]).toEqual(new Date(2026, 4, 25, 8, 30));
  });

  it("does not scan every second of the visible month when seconds are enabled", () => {
    const disabledTime = vi.fn(() => true);
    render(
      <DateTimePicker
        defaultOpen
        defaultValue={new Date(2026, 4, 25, 9, 30, 15)}
        showSecond
        disabledTime={disabledTime}
      />
    );
    expect(disabledTime.mock.calls.length).toBeGreaterThan(0);
    expect(disabledTime.mock.calls.length).toBeLessThan(5_000);
  });

  it("closes a DateTimePicker panel when clicking the open trigger again", () => {
    const { container } = render(<DateTimePicker />);
    const input = container.querySelector<HTMLInputElement>("input");

    fireEvent.click(input!);
    expect(screen.queryByRole("dialog")).not.toBeNull();

    fireEvent.click(input!);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("keeps sibling picker triggers toggleable after the panel opens", () => {
    const pickerCases = [
      { element: <DatePicker />, placeholder: "请选择日期" },
      { element: <TimePicker />, placeholder: "请选择时间" },
    ];

    for (const pickerCase of pickerCases) {
      const { unmount } = render(pickerCase.element);
      const input = screen.getByPlaceholderText(pickerCase.placeholder);

      fireEvent.click(input);
      expect(screen.queryByRole("dialog")).not.toBeNull();

      fireEvent.click(input);
      expect(screen.queryByRole("dialog")).toBeNull();
      unmount();
    }
  });

  it("keeps Select clear pointer events from reaching the trigger", () => {
    const onChange = vi.fn();
    const onPointerDown = vi.fn();
    const onMouseDown = vi.fn();

    render(
      <Select
        allowClear
        defaultValue="a"
        onChange={onChange}
        onPointerDown={onPointerDown}
        onMouseDown={onMouseDown}
        options={[
          { value: "a", label: "Alpha" },
          { value: "b", label: "Beta" },
        ]}
      />
    );

    const clear = screen.getByLabelText("Clear");
    fireEvent.pointerDown(clear);
    fireEvent.mouseDown(clear);
    fireEvent.click(clear);

    expect(onPointerDown).not.toHaveBeenCalled();
    expect(onMouseDown).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith(undefined);
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("keeps removable multi-select tags out of native button markup", () => {
    const { container } = render(
      <Select
        multiple
        defaultValue={["a"]}
        options={[{ value: "a", label: "Alpha" }]}
      />
    );
    expect(container.querySelector("button [role='button']")).toBeNull();
    expect(screen.getByRole("combobox")).not.toBeNull();
    expect(screen.getByRole("button", { name: "移除" })).not.toBeNull();
  });

  it("closes Select on Tab and does not reopen uncontrolled pickers after disabled toggles", () => {
    const selectOpenChange = vi.fn();
    const colorOpenChange = vi.fn();
    const { rerender } = render(
      <>
        <Select
          defaultOpen
          searchable
          onOpenChange={selectOpenChange}
          options={[{ value: "a", label: "Alpha" }]}
        />
        <ColorPicker defaultOpen onOpenChange={colorOpenChange} />
        <button type="button">外部焦点</button>
      </>
    );
    const search = screen.getByRole("combobox");
    fireEvent.keyDown(search, { key: "Tab" });
    fireEvent.blur(search, { relatedTarget: screen.getByRole("button", { name: "外部焦点" }) });
    expect(screen.queryByRole("listbox")).toBeNull();

    rerender(
      <>
        <Select
          defaultOpen
          disabled
          onOpenChange={selectOpenChange}
          options={[{ value: "a", label: "Alpha" }]}
        />
        <ColorPicker defaultOpen disabled onOpenChange={colorOpenChange} />
        <button type="button">外部焦点</button>
      </>
    );
    expect(screen.queryByRole("dialog", { name: "选择颜色" })).toBeNull();
    rerender(
      <>
        <Select
          defaultOpen
          onOpenChange={selectOpenChange}
          options={[{ value: "a", label: "Alpha" }]}
        />
        <ColorPicker defaultOpen onOpenChange={colorOpenChange} />
        <button type="button">外部焦点</button>
      </>
    );
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(screen.queryByRole("dialog", { name: "选择颜色" })).toBeNull();
    expect(colorOpenChange).toHaveBeenCalledWith(false);
  });

  it("disables TimePicker now action when the current time is outside constraints", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 25, 22, 15, 0));
    const onChange = vi.fn();

    render(
      <TimePicker
        defaultOpen
        min="08:00"
        max="20:00"
        onChange={onChange}
      />
    );

    const nowButton = screen.getByRole("button", { name: "现在" });

    expect((nowButton as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(nowButton);
    expect(onChange).not.toHaveBeenCalled();
  });
});
