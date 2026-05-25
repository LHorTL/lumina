import * as React from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DatePicker } from "../src/components/DatePicker";
import { DateTimePicker } from "../src/components/DateTimePicker";
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
