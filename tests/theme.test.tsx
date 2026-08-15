import * as React from "react";
import { createPortal } from "react-dom";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { applyTheme, ThemeProvider, useTheme } from "../src/components/Theme";
import { Button } from "../src/components/Button";
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
  return (
    <span
      data-testid="theme-mode"
      data-accent={theme.accent}
      data-base-color={theme.baseColor}
      data-components={Object.keys(theme.components).sort().join(",")}
    >
      {theme.mode}
    </span>
  );
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

  it("scope 主题层关闭后保留 DOM 并清理本层主题属性", () => {
    const { rerender } = render(
      <ThemeProvider enabled target="scope" mode="dark" baseColor="#223344">
        <div data-testid="stable-scope-child" />
      </ThemeProvider>
    );
    const child = screen.getByTestId("stable-scope-child");
    const scope = child.parentElement as HTMLElement;
    expect(scope.dataset.theme).toBe("dark");
    expect(scope.style.getPropertyValue("--bg")).toBe("#223344");

    rerender(
      <ThemeProvider enabled={false} target="scope" mode="dark" baseColor="#223344">
        <div data-testid="stable-scope-child" />
      </ThemeProvider>
    );
    expect(screen.getByTestId("stable-scope-child")).toBe(child);
    expect(child.parentElement).toBe(scope);
    expect(scope.dataset.theme).toBeUndefined();
    expect(scope.style.getPropertyValue("--bg")).toBe("");
  });

  it("root 主题层关闭后恢复接管前的 document 主题", () => {
    const root = document.documentElement;
    applyTheme(root, {
      mode: "dark",
      accent: "amber",
      baseColor: "#101820",
      tokens: { "host-token": "host-value" },
    });

    const { rerender } = render(
      <ThemeProvider enabled target="root" mode="light" baseColor="#f5dfd4">
        <div data-testid="root-theme-child" />
      </ThemeProvider>
    );
    const child = screen.getByTestId("root-theme-child");
    expect(root.dataset.theme).toBe("light");
    expect(root.style.getPropertyValue("--bg")).toBe("#f5dfd4");
    expect(root.style.getPropertyValue("--host-token")).toBe("");

    rerender(
      <ThemeProvider enabled={false} target="root" mode="light" baseColor="#f5dfd4">
        <div data-testid="root-theme-child" />
      </ThemeProvider>
    );
    expect(screen.getByTestId("root-theme-child")).toBe(child);
    expect(root.dataset.theme).toBe("dark");
    expect(root.dataset.accent).toBe("amber");
    expect(root.style.getPropertyValue("--bg")).toBe("#101820");
    expect(root.style.getPropertyValue("--host-token")).toBe("host-value");

    applyTheme(root, {});
    root.removeAttribute("style");
    root.removeAttribute("data-theme");
    root.removeAttribute("data-theme-mode");
    root.removeAttribute("data-density");
    root.removeAttribute("data-accent");
  });

  it("asChild 合并作用域属性时保留子元素 ref 与实例样式优先级", () => {
    const childRef = React.createRef<HTMLElement>();
    render(
      <ThemeProvider
        target="scope"
        asChild
        baseColor="#223344"
        className="provider-class"
        style={{ color: "blue" }}
      >
        <section
          ref={childRef}
          data-testid="as-child-scope"
          className="child-class"
          style={{ color: "red" }}
        />
      </ThemeProvider>
    );

    const scope = screen.getByTestId("as-child-scope");
    expect(childRef.current).toBe(scope);
    expect(scope.className).toBe("provider-class child-class");
    expect(scope.style.color).toBe("red");
    expect(scope.style.getPropertyValue("--bg")).toBe("#223344");
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

  it("重复命令式应用主题时清除已移除的自定义 token", () => {
    const target = document.createElement("div");
    applyTheme(target, { tokens: { "custom-slot": "#123456" } });
    expect(target.style.getPropertyValue("--custom-slot")).toBe("#123456");

    applyTheme(target, { tokens: {} });
    expect(target.style.getPropertyValue("--custom-slot")).toBe("");
  });

  it("ThemeProvider 派生的浅色与深色主题使用收紧后的拟态阴影尺寸", () => {
    const target = document.createElement("div");

    applyTheme(target, { mode: "light" });
    expect(target.style.getPropertyValue("--shadow-offset")).toBe(
      "calc(5px * var(--d) * var(--shadow-scale))"
    );
    expect(target.style.getPropertyValue("--shadow-blur")).toBe(
      "calc(12px * var(--d) * var(--shadow-scale))"
    );
    expect(target.style.getPropertyValue("--shadow-inset-offset")).toBe(
      "calc(3px * var(--d) * var(--shadow-scale))"
    );
    expect(target.style.getPropertyValue("--shadow-inset-blur")).toBe(
      "calc(8px * var(--d) * var(--shadow-scale))"
    );
    expect(target.style.getPropertyValue("--neu-shadow-subtle")).toContain(
      ".75px .75px 1.5px"
    );

    applyTheme(target, { mode: "dark" });
    expect(target.style.getPropertyValue("--shadow-offset")).toBe(
      "calc(3px * var(--d) * var(--shadow-scale))"
    );
    expect(target.style.getPropertyValue("--shadow-blur")).toBe(
      "calc(8px * var(--d) * var(--shadow-scale))"
    );
    expect(target.style.getPropertyValue("--shadow-inset-offset")).toBe(
      "calc(2px * var(--d) * var(--shadow-scale))"
    );
    expect(target.style.getPropertyValue("--shadow-inset-blur")).toBe(
      "calc(5px * var(--d) * var(--shadow-scale))"
    );
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

  it("跨窗口同步始终使用调用方受控的命名主题注册表", async () => {
    render(
      <ThemeProvider
        target="scope"
        mode="workspace"
        storageKey="theme:controlled-registry"
        themes={{
          workspace: {
            base: "dark",
            baseColor: "#29223f",
            components: { Button: { colors: { bg: "#445566" } } },
          },
        }}
      >
        <ThemeValueProbe />
        <Button data-testid="controlled-registry-button">按钮</Button>
      </ThemeProvider>
    );

    const nextValue = JSON.stringify({
      version: 1,
      config: {
        mode: "workspace",
        themes: {
          workspace: {
            base: "light",
            baseColor: "#f5dfd4",
            components: { Tag: { colors: { bg: "#fedcba" } } },
          },
        },
      },
    });
    localStorage.setItem("theme:controlled-registry", nextValue);
    act(() => {
      window.dispatchEvent(new StorageEvent("storage", {
        key: "theme:controlled-registry",
        newValue: nextValue,
        storageArea: localStorage,
      }));
    });

    await waitFor(() => {
      const probe = screen.getByTestId("theme-mode");
      expect(probe.dataset.baseColor).toBe("#29223f");
      expect(probe.dataset.components).toBe("Button");
      expect(
        screen
          .getByTestId("controlled-registry-button")
          .style.getPropertyValue("--lmn-button-bg")
      ).toBe("#445566");
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
