import * as React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useFloating } from "../src/utils/useFloating";

/** 暴露 useFloating 计算结果的最小测试组件。 */
const FloatingProbe: React.FC = () => {
  const { triggerRef, floatingRef, floatingStyle } = useFloating<HTMLButtonElement, HTMLDivElement>({
    open: true,
    placement: "right",
    panelWidth: 500,
    panelHeight: 500,
  });
  return (
    <>
      <button ref={triggerRef} className="floating-trigger">trigger</button>
      <div ref={floatingRef} data-testid="floating-panel" style={floatingStyle} />
    </>
  );
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("useFloating", () => {
  it("首选侧与翻转侧都放不下时同时钳位主轴和交叉轴", async () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 320 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 240 });
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function () {
      if (this.classList.contains("floating-trigger")) {
        return {
          x: 280,
          y: 200,
          top: 200,
          right: 300,
          bottom: 220,
          left: 280,
          width: 20,
          height: 20,
          toJSON: () => ({}),
        };
      }
      return {
        x: 0,
        y: 0,
        top: 0,
        right: 500,
        bottom: 500,
        left: 0,
        width: 500,
        height: 500,
        toJSON: () => ({}),
      };
    });

    render(<FloatingProbe />);
    await waitFor(() => {
      const panel = screen.getByTestId("floating-panel");
      expect(panel.style.left).toBe("8px");
      expect(panel.style.top).toBe("8px");
    });
  });
});
