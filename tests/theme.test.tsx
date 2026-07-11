import * as React from "react";
import { createPortal } from "react-dom";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { applyTheme, ThemeProvider, useTheme } from "../src/components/Theme";
import { Select } from "../src/components/Select";
import { usePortalContainer } from "../src/utils/portal";

/** 在当前主题的 Portal 容器中渲染测试节点。 */
const PortalProbe: React.FC = () => {
  const container = usePortalContainer();
  return container ? createPortal(<div data-testid="portal-probe" />, container) : null;
};

/** 显示当前主题模式，便于验证旧持久化数据迁移。 */
const ThemeValueProbe: React.FC = () => {
  const theme = useTheme();
  return <span data-testid="theme-mode" data-accent={theme.accent}>{theme.mode}</span>;
};

beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: () => ({
      matches: false,
      media: "(prefers-color-scheme: dark)",
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("ThemeProvider", () => {
  it("为 scope 模式的浮层创建并应用同主题容器", async () => {
    render(
      <ThemeProvider target="scope" mode="dark" accent="rose">
        <PortalProbe />
      </ThemeProvider>
    );

    const probe = await screen.findByTestId("portal-probe");
    const container = probe.parentElement;
    expect(container?.dataset.luminaPortalScope).toBe("");
    expect(container?.dataset.theme).toBe("dark");
    expect(container?.dataset.accent).toBe("rose");
    expect(container?.style.getPropertyValue("--accent")).not.toBe("");
  });

  it("真实浮层组件使用 scope 主题容器", async () => {
    render(
      <ThemeProvider target="scope" mode="dark" accent="rose">
        <Select defaultOpen options={[{ value: "a", label: "Alpha" }]} />
      </ThemeProvider>
    );

    const listbox = await screen.findByRole("listbox");
    const container = listbox.closest<HTMLElement>("[data-lumina-portal-scope]");
    expect(container).not.toBeNull();
    expect(container?.dataset.theme).toBe("dark");
    expect(container?.dataset.accent).toBe("rose");
  });

  it("切换字体配置时清除旧的 display 与 mono 覆写", () => {
    const target = document.createElement("div");
    applyTheme(target, {
      font: { sans: "Custom Sans", display: "Custom Display", mono: "Custom Mono" },
    });
    expect(target.style.getPropertyValue("--font-display")).toBe("Custom Display");
    expect(target.style.getPropertyValue("--font-mono")).toBe("Custom Mono");

    applyTheme(target, { font: "sf" });
    expect(target.style.getPropertyValue("--font-display")).toBe("");
    expect(target.style.getPropertyValue("--font-mono")).toBe("");
  });

  it("用版本化结构保存主题并兼容旧格式", async () => {
    localStorage.setItem("theme:legacy", JSON.stringify({ mode: "dark" }));
    render(
      <ThemeProvider storageKey="theme:legacy">
        <ThemeValueProbe />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme-mode").textContent).toBe("dark");
    await waitFor(() => {
      const persisted = JSON.parse(localStorage.getItem("theme:legacy") ?? "null") as {
        version?: number;
        config?: { mode?: string };
      };
      expect(persisted.version).toBe(1);
      expect(persisted.config?.mode).toBe("dark");
    });
  });

  it("同步其他窗口写入的主题配置", async () => {
    render(
      <ThemeProvider storageKey="theme:shared">
        <ThemeValueProbe />
      </ThemeProvider>
    );

    const nextValue = JSON.stringify({ version: 1, config: { mode: "dark" } });
    localStorage.setItem("theme:shared", nextValue);
    act(() => {
      window.dispatchEvent(new StorageEvent("storage", {
        key: "theme:shared",
        newValue: nextValue,
        storageArea: localStorage,
      }));
    });

    await waitFor(() => {
      expect(screen.getByTestId("theme-mode").textContent).toBe("dark");
    });
  });

  it("跨窗口同步不会覆盖显式受控字段", async () => {
    render(
      <ThemeProvider mode="light" storageKey="theme:controlled">
        <ThemeValueProbe />
      </ThemeProvider>
    );

    const nextValue = JSON.stringify({ version: 1, config: { mode: "dark" } });
    localStorage.setItem("theme:controlled", nextValue);
    act(() => {
      window.dispatchEvent(new StorageEvent("storage", {
        key: "theme:controlled",
        newValue: nextValue,
        storageArea: localStorage,
      }));
    });

    await waitFor(() => {
      expect(screen.getByTestId("theme-mode").textContent).toBe("light");
    });
  });

  it("其他窗口清除存储时回退默认值并保留当前受控字段", async () => {
    localStorage.setItem("theme:clear", JSON.stringify({ mode: "dark" }));
    const { rerender } = render(
      <ThemeProvider accent="rose" storageKey="theme:clear">
        <ThemeValueProbe />
      </ThemeProvider>
    );
    expect(screen.getByTestId("theme-mode").textContent).toBe("dark");

    rerender(
      <ThemeProvider accent="violet" storageKey="theme:clear">
        <ThemeValueProbe />
      </ThemeProvider>
    );
    localStorage.removeItem("theme:clear");
    act(() => {
      window.dispatchEvent(new StorageEvent("storage", {
        key: "theme:clear",
        newValue: null,
        storageArea: localStorage,
      }));
    });

    await waitFor(() => {
      const probe = screen.getByTestId("theme-mode");
      expect(probe.textContent).toBe("light");
      expect(probe.dataset.accent).toBe("violet");
    });
  });
});
