import * as React from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyTheme,
  deriveThemeColors,
  DEFAULT_THEME_COLORS,
  ThemeProvider,
  useTheme,
  type ComponentThemeProps,
  type ThemeValue,
} from "../src/components/Theme";
import { withComponentTheme } from "../src/components/Theme/ComponentTheme";
import { Button } from "../src/components/Button";
import { AutoComplete } from "../src/components/AutoComplete";
import { Card } from "../src/components/Card";
import { Input } from "../src/components/Input";
import { AimOutlined } from "../src/components/Icon";
import { ImageGrid } from "../src/components/Image";
import { Select } from "../src/components/Select";
import { Surface } from "../src/components/Surface";
import { CommandPalette } from "../src/components/CommandPalette";
import { ContextMenu } from "../src/components/ContextMenu";
import { Drawer } from "../src/components/Drawer";
import { Modal } from "../src/components/Modal";
import { Popover } from "../src/components/Popover";
import { RadioGroup } from "../src/components/Radio";
import { Tag } from "../src/components/Tag";
import { Textarea } from "../src/components/Textarea";
import { ThemePanel } from "../src/components/ThemePanel";
import { Link, Title } from "../src/components/Typography";
import { TitleBar } from "../src/components/AppShell";

/** 测试组件保留原生属性、style 与真实 DOM ref。 */
interface ThemeProbeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    ComponentThemeProps {}

const ThemeProbeBase = React.forwardRef<HTMLDivElement, ThemeProbeProps>(
  ({ children, ...rest }, ref) => (
    <div ref={ref} {...rest}>
      {children}
    </div>
  )
);
ThemeProbeBase.displayName = "ThemeProbeBase";

const ThemeProbe = withComponentTheme(ThemeProbeBase, "Card", "card");

/** 触发主题状态更新并把当前模式暴露给断言。 */
interface ThemeActionProbeProps {
  testId: string;
  action: (theme: ThemeValue) => void;
}

/** 测试 ThemeValue 命令式更新的最小交互节点。 */
const ThemeActionProbe: React.FC<ThemeActionProbeProps> = ({ testId, action }) => {
  const theme = useTheme();
  return (
    <button type="button" data-testid={testId} data-mode={theme.mode} onClick={() => action(theme)}>
      {theme.mode}
    </button>
  );
};

/** 把 ThemePanel 切换后的关键主题字段暴露给回归断言。 */
const ThemeStateProbe: React.FC = () => {
  const theme = useTheme();
  return (
    <output
      data-testid="theme-state"
      data-base-color={theme.baseColor}
      data-color-scheme={theme.colorScheme}
      data-density={theme.density}
      data-intensity={theme.intensity}
      data-component-names={Object.keys(theme.components).sort().join(",")}
    />
  );
};

beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: () => ({
      matches: false,
      media: "(prefers-color-scheme: dark)",
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }),
  });
});

afterEach(() => {
  cleanup();
  delete document.documentElement.dataset.theme;
  delete document.documentElement.dataset.accent;
  delete document.documentElement.dataset.density;
  document.documentElement.removeAttribute("style");
});

describe("多色组件主题", () => {
  it("按固定公式生成浅色与深色拟态色板", () => {
    const light = deriveThemeColors("#ffe8df", { colorScheme: "light" });
    const dark = deriveThemeColors("#29223f", { colorScheme: "dark" });

    expect(light.bg).toBe("#ffe8df");
    expect(light.bgRaised).toBe("color-mix(in srgb, #ffe8df 82%, white)");
    expect(light.bgSunken).toBe("color-mix(in srgb, #ffe8df 86%, black)");
    expect(light.accent).toBe("color-mix(in srgb, #ffe8df 62%, black)");
    expect(dark.bgRaised).toBe("color-mix(in srgb, #29223f 86%, white)");
    expect(dark.fg).toBe("color-mix(in srgb, #29223f 18%, white)");
    expect(dark.accent).toBe("color-mix(in srgb, #29223f 68%, white)");
  });

  it("self 只写组件前缀变量并且不会把 theme 透传到 DOM", () => {
    render(
      <ThemeProbe
        data-testid="probe"
        theme={{ baseColor: "#ffe8df", colorScheme: "light" }}
      />
    );

    const probe = screen.getByTestId("probe");
    expect(probe.getAttribute("theme")).toBeNull();
    expect(probe.dataset.luminaColorScheme).toBe("light");
    expect(probe.dataset.theme).toBeUndefined();
    expect(probe.style.getPropertyValue("--lmn-card-bg")).toBe("#ffe8df");
    expect(probe.style.getPropertyValue("--bg")).toBe("");
  });

  it("subtree 写入公共变量并向普通 DOM 后代传递", () => {
    render(
      <ThemeProbe
        data-testid="probe"
        theme={{ baseColor: "#29223f", colorScheme: "dark", scope: "subtree" }}
      >
        <span data-testid="child">child</span>
      </ThemeProbe>
    );

    const probe = screen.getByTestId("probe");
    expect(probe.dataset.theme).toBe("dark");
    expect(probe.style.getPropertyValue("--bg")).toBe("#29223f");
    expect(screen.getByTestId("child")).toBeTruthy();
  });

  it("ThemeProvider.components 定向覆盖匹配组件", () => {
    render(
      <ThemeProvider
        components={{
          Card: {
            baseColor: "#dff7e9",
            colors: { fg: "#174b32" },
            tokens: { hoverBackground: "#bcebd0" },
          },
        }}
      >
        <ThemeProbe data-testid="probe" />
      </ThemeProvider>
    );

    const probe = screen.getByTestId("probe");
    expect(probe.style.getPropertyValue("--lmn-card-bg")).toBe("#dff7e9");
    expect(probe.style.getPropertyValue("--lmn-card-fg")).toBe("#174b32");
    expect(probe.style.getPropertyValue("--lmn-card-hover-background")).toBe("#bcebd0");
  });

  it("嵌套 ThemeProvider 只配置 components 时继承外层完整色板", () => {
    render(
      <ThemeProvider target="scope" mode="dark" baseColor="#29223f">
        <ThemeProvider
          target="scope"
          components={{ Button: { colors: { fg: "#abcdef" } } }}
        >
          <Button data-testid="nested-button">按钮</Button>
        </ThemeProvider>
      </ThemeProvider>
    );

    const button = screen.getByTestId("nested-button");
    expect(button.dataset.luminaColorScheme).toBe("dark");
    expect(button.style.getPropertyValue("--lmn-button-bg")).toBe("#29223f");
    expect(button.style.getPropertyValue("--lmn-button-fg")).toBe("#abcdef");
  });

  it("嵌套 baseColor 会覆盖外层旧式颜色 token", () => {
    render(
      <ThemeProvider
        target="scope"
        tokens={{ bg: "#111111", fg: "#222222", accent: "#333333" }}
      >
        <ThemeProvider
          target="scope"
          baseColor="#f5dfd4"
          components={{ Button: {} }}
        >
          <Button data-testid="nested-base-button">按钮</Button>
        </ThemeProvider>
      </ThemeProvider>
    );

    const button = screen.getByTestId("nested-base-button");
    expect(button.style.getPropertyValue("--lmn-button-bg")).toBe("#f5dfd4");
    expect(button.style.getPropertyValue("--lmn-button-fg")).toBe(
      "color-mix(in srgb, #f5dfd4 18%, black)"
    );
    expect(button.style.getPropertyValue("--lmn-button-accent")).toBe(
      "color-mix(in srgb, #f5dfd4 62%, black)"
    );
  });

  it("嵌套 ThemeProvider 的自定义预设覆盖父级已解析字段", () => {
    render(
      <ThemeProvider target="scope" baseColor="#e7f0fa">
        <ThemeProvider
          target="scope"
          mode="graphite"
          themes={{
            graphite: { base: "dark", baseColor: "#29223f" },
          }}
          components={{ Button: {} }}
        >
          <Button data-testid="preset-button">按钮</Button>
        </ThemeProvider>
      </ThemeProvider>
    );

    const button = screen.getByTestId("preset-button");
    expect(button.dataset.luminaColorScheme).toBe("dark");
    expect(button.style.getPropertyValue("--lmn-button-bg")).toBe("#29223f");
  });

  it("子级切换深色时按深色公式重新派生父级隐式强调色", () => {
    render(
      <ThemeProvider target="scope" baseColor="#e7f0fa">
        <ThemeProvider
          target="scope"
          mode="dark"
          components={{ Button: {} }}
        >
          <Button data-testid="derived-accent-button">按钮</Button>
        </ThemeProvider>
      </ThemeProvider>
    );

    const button = screen.getByTestId("derived-accent-button");
    expect(button.style.getPropertyValue("--lmn-button-accent")).toBe(
      "color-mix(in srgb, #e7f0fa 68%, white)"
    );
    expect(button.style.getPropertyValue("--lmn-button-accent-soft")).toBe(
      "color-mix(in srgb, color-mix(in srgb, #e7f0fa 68%, white) 30%, black)"
    );
  });

  it("组件显式 style 保持最高优先级且 ref 仍指向真实根节点", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <ThemeProbe
        ref={ref}
        data-testid="probe"
        theme={{ colors: { fg: "#123456" } }}
        style={{ color: "rgb(1, 2, 3)" }}
      />
    );

    expect(ref.current).toBe(screen.getByTestId("probe"));
    expect(ref.current?.style.color).toBe("rgb(1, 2, 3)");
  });

  it("普通无主题组件挂载时不因根节点 ref 额外渲染", () => {
    let renderCount = 0;
    const RenderCountBase = React.forwardRef<HTMLDivElement, ThemeProbeProps>(
      (props, ref) => {
        renderCount += 1;
        return <div ref={ref} {...props} />;
      }
    );
    RenderCountBase.displayName = "RenderCountBase";
    const RenderCountProbe = withComponentTheme(RenderCountBase, "Card", "card");

    render(<RenderCountProbe data-testid="render-count-probe" />);

    expect(screen.getByTestId("render-count-probe")).toBeTruthy();
    expect(renderCount).toBe(1);
  });

  it("动态启用和移除组件主题时保留真实根节点", () => {
    const { rerender } = render(
      <ThemeProbe data-testid="stable-theme-probe" />
    );
    const initialRoot = screen.getByTestId("stable-theme-probe");

    rerender(
      <ThemeProbe
        data-testid="stable-theme-probe"
        theme={{ baseColor: "#f5dfd4" }}
      />
    );
    expect(screen.getByTestId("stable-theme-probe")).toBe(initialRoot);

    rerender(<ThemeProbe data-testid="stable-theme-probe" />);
    expect(screen.getByTestId("stable-theme-probe")).toBe(initialRoot);
  });

  it("静态暗色页面中的组件 theme 继承暗色，未主题化 AutoComplete Portal 不写浅色变量", () => {
    document.documentElement.dataset.theme = "dark";
    render(
      <>
        <Button data-testid="dark-button" theme="rose">
          按钮
        </Button>
        <AutoComplete
          options={[{ value: "dark", label: "Dark" }]}
          placeholder="选择主题"
        />
      </>
    );

    const button = screen.getByTestId("dark-button");
    expect(button.dataset.luminaColorScheme).toBe("dark");
    expect(button.style.getPropertyValue("--lmn-button-bg")).toBe(
      DEFAULT_THEME_COLORS.dark.bg
    );

    fireEvent.focus(screen.getByRole("combobox"));
    const listbox = screen.getByRole("listbox");
    expect(listbox.dataset.theme).toBeUndefined();
    expect(listbox.style.getPropertyValue("--bg")).toBe("");
    expect(listbox.style.getPropertyValue("--lmn-auto-complete-bg")).toBe("");
  });

  it("AutoComplete 使用公开的 popup 样式插槽", () => {
    render(
      <ThemeProvider
        target="scope"
        components={{
          AutoComplete: { styles: { popup: { padding: 17 } } },
        }}
      >
        <AutoComplete
          options={[{ value: "sky", label: "Sky" }]}
          placeholder="选择主题"
        />
      </ThemeProvider>
    );

    fireEvent.focus(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox").style.padding).toBe("17px");
  });

  it("未单独配置主题的 AutoComplete Portal 复制完整颜色模式属性", () => {
    render(
      <ThemeProvider target="scope" mode="dark">
        <AutoComplete
          options={[{ value: "dark", label: "Dark" }]}
          placeholder="选择暗色主题"
        />
      </ThemeProvider>
    );

    fireEvent.focus(screen.getByPlaceholderText("选择暗色主题"));
    const listbox = screen.getByRole("listbox");
    expect(listbox.dataset.theme).toBe("dark");
    expect(listbox.dataset.luminaColorScheme).toBe("dark");
  });

  it("具名图标支持组件 theme、真实根 ref 和原生属性", () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(
      <AimOutlined
        ref={ref}
        data-testid="named-icon"
        theme={{ colors: { fg: "#7357c8" } }}
      />
    );

    const icon = screen.getByTestId("named-icon");
    expect(ref.current).toBe(icon);
    expect(icon.getAttribute("theme")).toBeNull();
    expect(icon.dataset.luminaIconColor).toBe("");
    expect(icon.style.getPropertyValue("--lmn-icon-fg")).toBe("#7357c8");
  });

  it("具名图标只在真实 span 根节点应用一次组件主题", () => {
    render(
      <ThemeProvider
        target="scope"
        components={{ Icon: { styles: { root: { opacity: 0.5 } } } }}
      >
        <AimOutlined data-testid="named-icon-once" />
      </ThemeProvider>
    );

    const icon = screen.getByTestId("named-icon-once");
    const svg = icon.querySelector("svg");
    expect(icon.style.opacity).toBe("0.5");
    expect(icon.dataset.luminaIconColor).toBeUndefined();
    expect(svg?.style.opacity).toBe("");
    expect(svg?.style.getPropertyValue("--lmn-icon-bg")).toBe("");
  });

  it("真实组件默认不增加主题属性，定向覆盖也不会影响相邻类型", () => {
    render(
      <ThemeProvider
        target="scope"
        components={{
          Button: {
            baseColor: "#dceaf8",
            styles: { root: { borderRadius: 999 } },
          },
        }}
      >
        <Button data-testid="button">按钮</Button>
        <Card data-testid="card">卡片</Card>
      </ThemeProvider>
    );

    const button = screen.getByTestId("button");
    const card = screen.getByTestId("card");
    expect(button.style.getPropertyValue("--lmn-button-bg")).toBe("#dceaf8");
    expect(button.style.borderRadius).toBe("999px");
    expect(card.style.getPropertyValue("--lmn-card-bg")).toBe("");
    expect(card.dataset.luminaColorScheme).toBeUndefined();
  });

  it("组件 theme.components 可以继续定向覆盖内部组件", () => {
    render(
      <Card
        data-testid="card"
        theme={{
          baseColor: "#f5dfd4",
          components: { Button: { colors: { fg: "#234567" } } },
        }}
      >
        <Button data-testid="inner-button">内部按钮</Button>
      </Card>
    );

    expect(screen.getByTestId("card").style.getPropertyValue("--lmn-card-bg")).toBe("#f5dfd4");
    expect(screen.getByTestId("inner-button").style.getPropertyValue("--lmn-button-fg")).toBe("#234567");
  });

  it("self 主题不会泄漏给嵌套的同类型业务组件", () => {
    render(
      <ThemeProvider target="scope" baseColor="#dceaf8">
        <Card
          data-testid="outer-card"
          theme={{
            baseColor: "#f5dfd4",
            tokens: { hoverBackground: "#fedcba" },
          }}
        >
          <Card data-testid="inner-card">内部卡片</Card>
        </Card>
      </ThemeProvider>
    );

    expect(screen.getByTestId("outer-card").style.getPropertyValue("--lmn-card-bg")).toBe("#f5dfd4");
    expect(screen.getByTestId("inner-card").style.getPropertyValue("--lmn-card-bg")).toBe("#dceaf8");
    expect(screen.getByTestId("inner-card").style.getPropertyValue("--lmn-card-hover-background")).toBe("initial");
  });

  it("self 主题不会泄漏给共用主 CSS 前缀的其他组件", () => {
    render(
      <ThemeProvider target="scope" colors={{ fg: "#abcdef" }}>
        <Title theme={{ colors: { fg: "#123456" } }}>
          标题中的 <Link data-testid="nested-link" href="#target">链接</Link>
        </Title>
      </ThemeProvider>
    );

    expect(screen.getByTestId("nested-link").style.getPropertyValue("--lmn-typography-fg"))
      .toBe("#abcdef");
  });

  it("复合组件的 self 主题只覆盖内部控件，不泄漏给业务 Button", () => {
    render(
      <ThemeProvider target="scope" baseColor="#dceaf8">
        <Card
          data-testid="composite-card"
          interactive
          theme={{ baseColor: "#f5dfd4" }}
        >
          <Button data-testid="business-button">业务按钮</Button>
        </Card>
      </ThemeProvider>
    );

    const card = screen.getByTestId("composite-card");
    const internalButton = card.querySelector<HTMLElement>(".card-interactive-control");
    const businessButton = screen.getByTestId("business-button");
    expect(card.style.getPropertyValue("--lmn-button-bg")).toBe("#f5dfd4");
    expect(internalButton?.style.getPropertyValue("--lmn-button-bg")).toBe("");
    expect(businessButton.style.getPropertyValue("--lmn-button-bg")).toBe("#dceaf8");
  });

  it("ImageGrid 的 self 主题由内部 Image 继承且不触发业务后代重置", () => {
    render(
      <ImageGrid
        data-testid="themed-image-grid"
        theme={{ baseColor: "#f5dfd4" }}
        images={[{ src: "grid-image.png", alt: "网格图片", preview: false }]}
      />
    );

    const grid = screen.getByTestId("themed-image-grid");
    const image = screen.getByRole("img", { name: "网格图片" }).closest<HTMLElement>(".n-image");
    expect(grid.style.getPropertyValue("--lmn-image-bg")).toBe("#f5dfd4");
    expect(image?.style.getPropertyValue("--lmn-image-bg")).toBe("");
  });

  it("未使用 ThemeProvider 时从根节点真实 CSS 变量继承静态主题", () => {
    document.documentElement.style.setProperty("--bg", "#ddeeff");
    document.documentElement.style.setProperty("--accent", "#7357c8");

    render(
      <Button data-testid="static-theme-button" theme={{ colors: { fg: "#123456" } }}>
        按钮
      </Button>
    );

    const button = screen.getByTestId("static-theme-button");
    expect(button.style.getPropertyValue("--lmn-button-bg")).toBe("#ddeeff");
    expect(button.style.getPropertyValue("--lmn-button-accent")).toBe("#7357c8");
    expect(button.style.getPropertyValue("--lmn-button-fg")).toBe("#123456");
  });

  it("组件 theme 继承最近的命令式局部主题作用域", () => {
    const scope = document.createElement("section");
    document.body.appendChild(scope);
    applyTheme(scope, { mode: "dark", baseColor: "#223344" });

    render(
      <Button data-testid="imperative-scope-button" theme={{ colors: { fg: "#abcdef" } }}>
        局部按钮
      </Button>,
      { container: scope }
    );

    const button = screen.getByTestId("imperative-scope-button");
    expect(button.style.getPropertyValue("--lmn-button-bg")).toBe("#223344");
    expect(button.style.getPropertyValue("--lmn-button-fg")).toBe("#abcdef");
    expect(button.dataset.luminaColorScheme).toBe("dark");
    scope.remove();
  });

  it("命令式局部主题会传递给未单独配置主题的 Select Portal", () => {
    const scope = document.createElement("section");
    document.body.appendChild(scope);
    applyTheme(scope, { mode: "dark", baseColor: "#223344" });

    render(
      <Select
        defaultOpen
        options={[{ value: "local", label: "Local" }]}
      />,
      { container: scope }
    );

    const listbox = screen.getByRole("listbox");
    expect(listbox.dataset.theme).toBe("dark");
    expect(listbox.dataset.luminaColorScheme).toBe("dark");
    expect(listbox.style.getPropertyValue("--bg")).toBe("#223344");
    scope.remove();
  });

  it("组件挂载后更新命令式局部主题会同步刷新 Select Portal", () => {
    const scope = document.createElement("section");
    document.body.appendChild(scope);

    render(
      <Select
        defaultOpen
        options={[{ value: "runtime", label: "Runtime" }]}
      />,
      { container: scope }
    );

    const listbox = screen.getByRole("listbox");
    expect(listbox.style.getPropertyValue("--bg")).toBe("");

    act(() => {
      applyTheme(scope, { mode: "dark", baseColor: "#223344" });
    });
    expect(listbox.dataset.theme).toBe("dark");
    expect(listbox.dataset.luminaColorScheme).toBe("dark");
    expect(listbox.style.getPropertyValue("--bg")).toBe("#223344");

    act(() => {
      applyTheme(scope, { mode: "light", baseColor: "#f5dfd4" });
    });
    expect(listbox.dataset.theme).toBe("light");
    expect(listbox.dataset.luminaColorScheme).toBe("light");
    expect(listbox.style.getPropertyValue("--bg")).toBe("#f5dfd4");
    scope.remove();
  });

  it("纯 Portal 组件继承命令式局部主题作用域", () => {
    const scope = document.createElement("section");
    document.body.appendChild(scope);
    applyTheme(scope, { mode: "dark", baseColor: "#223344" });

    render(
      <Modal open data-testid="imperative-scope-modal" footer={null}>
        局部弹窗
      </Modal>,
      { container: scope }
    );

    const modal = screen.getByTestId("imperative-scope-modal");
    expect(modal.dataset.theme).toBe("dark");
    expect(modal.dataset.luminaColorScheme).toBe("dark");
    expect(modal.style.getPropertyValue("--bg")).toBe("#223344");
    expect(scope.querySelector('[data-lumina-theme-anchor="Modal"]')?.tagName).toBe("TEMPLATE");
    scope.remove();
  });

  it("纯 Portal 组件的主题锚点可安全放入受限表格结构", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    try {
      const { container } = render(
        <table>
          <tbody>
            <Modal open data-testid="table-modal" footer={null}>
              表格弹窗
            </Modal>
          </tbody>
        </table>
      );

      const anchor = container.querySelector("tbody > template[data-lumina-theme-anchor='Modal']");
      expect(anchor).not.toBeNull();
      expect(errorSpy.mock.calls.flat().join(" ")).not.toContain("validateDOMNesting");
    } finally {
      errorSpy.mockRestore();
    }
  });

  it("RadioGroup 内部生成的 Radio 不重置分组自身主题", () => {
    render(
      <RadioGroup
        theme={{ colors: { fg: "#234567" } }}
        options={[{ value: "first", label: "第一项" }]}
      />
    );

    const group = screen.getByRole("radiogroup");
    const radioRoot = screen.getByRole("radio").closest<HTMLElement>(".radio");
    expect(group.style.getPropertyValue("--lmn-radio-fg")).toBe("#234567");
    expect(radioRoot?.style.getPropertyValue("--lmn-radio-fg")).toBe("");
  });

  it("TitleBar 内部窗口控制按钮不重置标题栏自身主题", () => {
    render(
      <TitleBar
        data-testid="themed-titlebar"
        platform="windows"
        title="窗口"
        theme={{ colors: { fgMuted: "#345678" } }}
      />
    );

    const titleBar = screen.getByTestId("themed-titlebar");
    const controls = titleBar.querySelector<HTMLElement>(".win-controls");
    expect(titleBar.style.getPropertyValue("--lmn-app-shell-fg-muted")).toBe("#345678");
    expect(controls?.style.getPropertyValue("--lmn-app-shell-fg-muted")).toBe("");
  });

  it("Surface 只配置组件覆盖时保留外层色板且不创建新的视觉主题层", () => {
    render(
      <ThemeProvider target="scope" as="section" baseColor="#dceaf8">
        <Surface
          data-testid="surface"
          components={{ Button: { colors: { fg: "#234567" } } }}
        >
          <Button data-testid="surface-button">按钮</Button>
        </Surface>
      </ThemeProvider>
    );

    const surface = screen.getByTestId("surface");
    const outerScope = surface.parentElement;
    expect(outerScope?.tagName).toBe("SECTION");
    expect(outerScope?.style.getPropertyValue("--bg")).toBe("#dceaf8");
    expect(screen.getByTestId("surface-button").style.getPropertyValue("--lmn-button-fg")).toBe("#234567");
  });

  it("Surface 只传 baseColor 时使用该基色派生默认强调色", () => {
    render(
      <Surface baseColor="#f0ece6" components={{ Button: {} }}>
        <Button data-testid="derived-surface-button">按钮</Button>
      </Surface>
    );

    expect(
      screen.getByTestId("derived-surface-button").style.getPropertyValue("--lmn-button-accent")
    ).toBe("color-mix(in srgb, #f0ece6 62%, black)");
  });

  it("Surface 开关局部主题时保留子树 DOM 与非受控状态", () => {
    const { rerender } = render(
      <Surface data-testid="stable-surface">
        <input data-testid="stable-input" defaultValue="initial" />
      </Surface>
    );
    const input = screen.getByTestId("stable-input") as HTMLInputElement;
    input.value = "changed";

    rerender(
      <Surface data-testid="stable-surface" baseColor="#f5dfd4">
        <input data-testid="stable-input" defaultValue="initial" />
      </Surface>
    );
    expect(screen.getByTestId("stable-input")).toBe(input);
    expect(input.value).toBe("changed");
    expect(screen.getByTestId("stable-surface").style.getPropertyValue("--bg")).toBe("#f5dfd4");

    rerender(
      <Surface data-testid="stable-surface">
        <input data-testid="stable-input" defaultValue="initial" />
      </Surface>
    );
    expect(screen.getByTestId("stable-input")).toBe(input);
    expect(input.value).toBe("changed");
  });

  it("Surface 的 theme.colorScheme 同时作用于表面根节点和后代 Provider", () => {
    render(
      <ThemeProvider target="scope" mode="light">
        <Surface
          data-testid="dark-theme-surface"
          theme={{ baseColor: "#29223f", colorScheme: "dark" }}
        >
          <ThemeStateProbe />
        </Surface>
      </ThemeProvider>
    );

    const surface = screen.getByTestId("dark-theme-surface");
    expect(surface.dataset.luminaColorScheme).toBe("dark");
    expect(screen.getByTestId("theme-state").dataset.colorScheme).toBe("dark");
  });

  it("Surface 显式基础 mode 覆盖预设的明暗模式并保持根节点与后代一致", () => {
    render(
      <Surface data-testid="light-mode-surface" preset="graphite" mode="light">
        <ThemeStateProbe />
      </Surface>
    );

    expect(screen.getByTestId("light-mode-surface").dataset.luminaColorScheme).toBe("light");
    expect(screen.getByTestId("theme-state").dataset.colorScheme).toBe("light");
  });

  it("Surface 的 system 模式切换后仍保持根节点与后代色制一致", () => {
    let dark = false;
    const listeners = new Set<(event: MediaQueryListEvent) => void>();
    const media = {
      get matches() {
        return dark;
      },
      media: "(prefers-color-scheme: dark)",
      addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => listeners.add(listener),
      removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener),
    };
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: () => media,
    });

    render(
      <Surface
        data-testid="system-mode-surface"
        mode="system"
        theme={{ baseColor: "#dceaf8" }}
      >
        <ThemeStateProbe />
      </Surface>
    );

    expect(screen.getByTestId("system-mode-surface").dataset.luminaColorScheme).toBe("light");
    act(() => {
      dark = true;
      listeners.forEach((listener) => listener({ matches: true } as MediaQueryListEvent));
    });
    expect(screen.getByTestId("system-mode-surface").dataset.luminaColorScheme).toBe("dark");
    expect(screen.getByTestId("theme-state").dataset.colorScheme).toBe("dark");
  });

  it("Surface 实例局部色板覆盖外层 components.Surface 类型配置", () => {
    render(
      <ThemeProvider
        target="scope"
        components={{ Surface: { baseColor: "#dceaf8" } }}
      >
        <Surface data-testid="local-surface" baseColor="#f5dfd4">
          内容
        </Surface>
      </ThemeProvider>
    );

    const surface = screen.getByTestId("local-surface");
    expect(surface.style.getPropertyValue("--lmn-surface-bg")).toBe("#f5dfd4");
    expect(surface.style.getPropertyValue("--bg")).toBe("#f5dfd4");
  });

  it("Surface 的命名模式把预设色制和布局字段传给局部 Provider", () => {
    render(
      <ThemeProvider target="scope" mode="light" density="compact">
        <Surface
          mode="night-workspace"
          themes={{
            "night-workspace": {
              base: "dark",
              baseColor: "#29223f",
              density: "spacious",
              intensity: 9,
            },
          }}
        >
          <ThemeStateProbe />
        </Surface>
      </ThemeProvider>
    );

    const state = screen.getByTestId("theme-state");
    expect(state.dataset.colorScheme).toBe("dark");
    expect(state.dataset.baseColor).toBe("#29223f");
    expect(state.dataset.density).toBe("spacious");
    expect(state.dataset.intensity).toBe("9");
  });

  it("Surface 只覆盖当前命名模式注册表时同步更新自身与后代色板", () => {
    render(
      <ThemeProvider
        target="scope"
        mode="workspace"
        themes={{ workspace: { base: "light", baseColor: "#dceaf8" } }}
      >
        <Surface
          data-testid="registry-surface"
          themes={{ workspace: { base: "dark", baseColor: "#29223f" } }}
        >
          <ThemeStateProbe />
        </Surface>
      </ThemeProvider>
    );

    const surface = screen.getByTestId("registry-surface");
    const state = screen.getByTestId("theme-state");
    expect(surface.style.getPropertyValue("--lmn-surface-bg")).toBe("#29223f");
    expect(state.dataset.colorScheme).toBe("dark");
    expect(state.dataset.baseColor).toBe("#29223f");
  });

  it("切换命名主题时替换上一预设的 colors 与 components", () => {
    render(
      <ThemeProvider
        target="scope"
        mode="theme-a"
        themes={{
          "theme-a": {
            colors: { fg: "#111111" },
            components: { Button: { colors: { bg: "#aaaaaa" } } },
          },
          "theme-b": {
            colors: { fg: "#222222" },
            components: { Button: { colors: { bg: "#bbbbbb" } } },
          },
        }}
      >
        <Button data-testid="preset-button">按钮</Button>
        <ThemeActionProbe testId="switch-preset" action={(theme) => theme.setMode("theme-b")} />
      </ThemeProvider>
    );

    const button = screen.getByTestId("preset-button");
    expect(button.style.getPropertyValue("--lmn-button-fg")).toBe("#111111");
    expect(button.style.getPropertyValue("--lmn-button-bg")).toBe("#aaaaaa");

    fireEvent.click(screen.getByTestId("switch-preset"));

    expect(button.style.getPropertyValue("--lmn-button-fg")).toBe("#222222");
    expect(button.style.getPropertyValue("--lmn-button-bg")).toBe("#bbbbbb");
  });

  it("切回内置模式时清理上一命名预设的色板与组件覆盖", () => {
    render(
      <ThemeProvider
        target="scope"
        mode="workspace"
        themes={{
          workspace: {
            base: "dark",
            baseColor: "#29223f",
            colors: { fg: "#f4efff" },
            tokens: { divider: "#554466" },
            components: { Button: { colors: { bg: "#443355" } } },
          },
        }}
      >
        <Button data-testid="built-in-mode-button">按钮</Button>
        <ThemeStateProbe />
        <ThemeActionProbe testId="switch-to-light" action={(theme) => theme.setMode("light")} />
      </ThemeProvider>
    );

    const button = screen.getByTestId("built-in-mode-button");
    expect(button.style.getPropertyValue("--lmn-button-bg")).toBe("#443355");

    fireEvent.click(screen.getByTestId("switch-to-light"));

    const state = screen.getByTestId("theme-state");
    expect(state.dataset.colorScheme).toBe("light");
    expect(state.dataset.baseColor).toBeUndefined();
    expect(state.dataset.componentNames).toBe("");
    const lightButton = screen.getByTestId("built-in-mode-button");
    expect(lightButton.style.getPropertyValue("--lmn-button-bg")).not.toBe("#443355");
    expect(lightButton.closest<HTMLElement>("[data-theme]")?.style.getPropertyValue("--bg")).toBe(
      DEFAULT_THEME_COLORS.light.bg
    );
  });

  it("更新当前命名主题注册表时立即替换旧预设字段", () => {
    render(
      <ThemeProvider
        target="scope"
        mode="workspace"
        themes={{
          workspace: {
            baseColor: "#29223f",
            components: { Button: { colors: { bg: "#443355" } } },
          },
        }}
      >
        <Button data-testid="updated-preset-button">按钮</Button>
        <ThemeStateProbe />
        <ThemeActionProbe
          testId="update-preset-registry"
          action={(theme) => theme.setThemes({
            workspace: {
              baseColor: "#dceaf8",
              components: { Tag: { colors: { bg: "#ddeeff" } } },
            },
          })}
        />
      </ThemeProvider>
    );

    expect(screen.getByTestId("updated-preset-button").style.getPropertyValue("--lmn-button-bg")).toBe(
      "#443355"
    );
    fireEvent.click(screen.getByTestId("update-preset-registry"));

    expect(screen.getByTestId("theme-state").dataset.baseColor).toBe("#dceaf8");
    expect(screen.getByTestId("theme-state").dataset.componentNames).toBe("Tag");
    expect(screen.getByTestId("updated-preset-button").style.getPropertyValue("--lmn-button-bg")).not.toBe(
      "#443355"
    );
  });

  it("同一批处理中连续调用两次 toggleMode 会回到原模式", () => {
    render(
      <ThemeProvider target="scope" mode="light">
        <ThemeActionProbe
          testId="toggle-twice"
          action={(theme) => {
            theme.toggleMode();
            theme.toggleMode();
          }}
        />
      </ThemeProvider>
    );

    const trigger = screen.getByTestId("toggle-twice");
    fireEvent.click(trigger);
    expect(trigger.dataset.mode).toBe("light");
  });

  it("Popover 在 HOC 传入空 style 时仍保留默认触发器布局", () => {
    render(
      <Popover content="内容">
        <button type="button">打开</button>
      </Popover>
    );

    const anchor = screen.getByRole("button", { name: "打开" }).parentElement;
    expect(anchor?.style.display).toBe("inline-flex");
    expect(anchor?.style.alignSelf).toBe("flex-start");
  });

  it("Select 的实例主题会直接复制到 Portal 菜单且 popupStyle 仍优先", () => {
    render(
      <Select
        defaultOpen
        theme={{ baseColor: "#eee3f8", accent: "violet" }}
        popupStyle={{ width: 333 }}
        options={[{ value: "violet", label: "Violet" }]}
      />
    );

    const listbox = screen.getByRole("listbox");
    expect(listbox.style.getPropertyValue("--lmn-select-bg")).toBe("#eee3f8");
    expect(listbox.dataset.luminaColorScheme).toBe("light");
    expect(listbox.style.width).toBe("333px");
  });

  it("Select、AutoComplete 和 Popover 的主题 popup 宽度不会被定位样式覆盖", () => {
    render(
      <ThemeProvider
        target="scope"
        components={{
          Select: { styles: { popup: { width: 333 } } },
          AutoComplete: { styles: { popup: { width: 344 } } },
          Popover: { styles: { popup: { width: 355 } } },
        }}
      >
        <Select
          defaultOpen
          options={[{ value: "select", label: "Select" }]}
        />
        <AutoComplete
          options={[{ value: "auto", label: "Auto" }]}
          placeholder="自动完成"
        />
        <Popover content="浮层内容">
          <button type="button">打开浮层</button>
        </Popover>
      </ThemeProvider>
    );

    expect(screen.getByRole("listbox").style.width).toBe("333px");
    fireEvent.focus(screen.getByPlaceholderText("自动完成"));
    expect(screen.getAllByRole("listbox")[1].style.width).toBe("344px");
    fireEvent.click(screen.getByRole("button", { name: "打开浮层" }));
    expect(screen.getByRole("dialog").style.width).toBe("355px");
    expect(screen.getByRole("dialog").style.minWidth).toBe("");
  });

  it("Modal 和 Drawer 的主题 popup 尺寸覆盖默认值且显式尺寸仍优先", () => {
    const { rerender } = render(
      <ThemeProvider
        target="scope"
        components={{
          Modal: { styles: { popup: { width: 612, maxWidth: "98vw" } } },
          Drawer: { styles: { popup: { width: 544, maxWidth: "96vw" } } },
        }}
      >
        <Modal open data-testid="themed-modal" footer={null}>内容</Modal>
        <Drawer open data-testid="themed-drawer" mask={false}>内容</Drawer>
      </ThemeProvider>
    );

    expect(screen.getByTestId("themed-modal").style.width).toBe("612px");
    expect(screen.getByTestId("themed-modal").style.maxWidth).toBe("98vw");
    expect(screen.getByTestId("themed-drawer").style.width).toBe("544px");
    expect(screen.getByTestId("themed-drawer").style.maxWidth).toBe("96vw");

    rerender(
      <ThemeProvider
        target="scope"
        components={{
          Modal: { styles: { popup: { width: 612 } } },
          Drawer: { styles: { popup: { width: 544 } } },
        }}
      >
        <Modal open width={420} data-testid="themed-modal" footer={null}>内容</Modal>
        <Drawer open size={430} data-testid="themed-drawer" mask={false}>内容</Drawer>
      </ThemeProvider>
    );

    expect(screen.getByTestId("themed-modal").style.width).toBe("420px");
    expect(screen.getByTestId("themed-drawer").style.width).toBe("430px");
  });

  it("ContextMenu 的主题最小宽度覆盖默认值且显式 minWidth 仍优先", () => {
    /** 按不同实例宽度重绘同一个上下文菜单场景。 */
    const renderMenu = (minWidth?: number) => (
      <ThemeProvider
        target="scope"
        components={{ ContextMenu: { styles: { popup: { minWidth: 260 } } } }}
      >
        <ContextMenu
          minWidth={minWidth}
          items={[{ key: "copy", label: "复制" }]}
        >
          <button type="button">打开上下文菜单</button>
        </ContextMenu>
      </ThemeProvider>
    );
    const { rerender } = render(renderMenu());

    fireEvent.contextMenu(screen.getByRole("button", { name: "打开上下文菜单" }));
    expect(document.querySelector<HTMLElement>(".context-menu")?.style.minWidth).toBe("260px");

    rerender(renderMenu(190));
    expect(document.querySelector<HTMLElement>(".context-menu")?.style.minWidth).toBe("190px");
  });

  it("输入类组件的实例 style 覆盖同名根插槽但仍作用于原生输入", () => {
    render(
      <ThemeProvider
        target="scope"
        components={{
          Input: { styles: { root: { opacity: 0.5 } } },
          Textarea: { styles: { root: { opacity: 0.5 } } },
          AutoComplete: { styles: { root: { opacity: 0.5 } } },
        }}
      >
        <Input data-testid="styled-input" style={{ opacity: 1 }} />
        <Textarea data-testid="styled-textarea" style={{ opacity: 1 }} />
        <AutoComplete
          data-testid="styled-auto"
          style={{ opacity: 1 }}
          options={[]}
        />
      </ThemeProvider>
    );

    const input = screen.getByTestId("styled-input");
    const textarea = screen.getByTestId("styled-textarea");
    const autoInput = screen.getByTestId("styled-auto");
    expect(input.parentElement?.style.opacity).toBe("1");
    expect(input.style.opacity).toBe("1");
    expect(textarea.parentElement?.style.opacity).toBe("1");
    expect(textarea.style.opacity).toBe("1");
    expect(autoInput.closest(".autocomplete")?.getAttribute("style")).toContain("opacity: 1");
    expect(autoInput.style.opacity).toBe("1");
  });

  it("ThemePanel 应用预设时替换 baseColor、colors 与 components", () => {
    render(
      <ThemeProvider
        target="scope"
        baseColor="#dceaf8"
        colors={{ fg: "#123456" }}
        components={{ Button: { colors: { bg: "#112233" } } }}
      >
        <ThemePanel
          sections={["presets"]}
          allowCreateTheme={false}
          showReset={false}
          presetOptions={[
            {
              key: "warm",
              label: "暖色预设",
              preset: {
                base: "light",
                baseColor: "#f5dfd4",
                colors: { fg: "#654321" },
                components: { Tag: { colors: { bg: "#fedcba" } } },
              },
            },
          ]}
        />
        <Button data-testid="preset-old-button">按钮</Button>
        <Tag data-testid="preset-new-tag">标签</Tag>
        <ThemeStateProbe />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: /暖色预设/ }));

    expect(screen.getByTestId("theme-state").dataset.baseColor).toBe("#f5dfd4");
    expect(screen.getByTestId("theme-state").dataset.componentNames).toBe("Tag");
    expect(screen.getByTestId("preset-old-button").style.getPropertyValue("--lmn-button-bg")).toBe("");
    expect(screen.getByTestId("preset-new-tag").style.getPropertyValue("--lmn-tag-bg")).toBe("#fedcba");
  });

  it("ThemePanel 打开新建主题预览时不会因 components 克隆持续更新", () => {
    render(
      <ThemeProvider
        target="scope"
        components={{ Button: { colors: { fg: "#234567" } } }}
      >
        <ThemePanel
          sections={["presets"]}
          presetOptions={[]}
          showReset={false}
        />
        <ThemeStateProbe />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "新建主题" }));

    expect(screen.getByText("实时预览中")).toBeTruthy();
    expect(screen.getByTestId("theme-state").dataset.componentNames).toBe("Button");
  });

  it("CommandPalette 把组件主题变量复制到遮罩层", () => {
    render(
      <CommandPalette
        open
        items={[]}
        theme={{ colors: { fg: "#345678" } }}
      />
    );

    const overlay = document.querySelector<HTMLElement>(".cmdp-overlay");
    expect(overlay?.style.getPropertyValue("--lmn-command-palette-fg")).toBe("#345678");
  });

  it("未启用组件主题的 Portal 不写入浅色变量，避免覆盖外部暗色页面", () => {
    document.documentElement.dataset.theme = "dark";
    try {
      render(
        <Select
          defaultOpen
          options={[{ value: "dark", label: "Dark" }]}
        />
      );

      const listbox = screen.getByRole("listbox");
      expect(listbox.dataset.theme).toBeUndefined();
      expect(listbox.style.getPropertyValue("--bg")).toBe("");
      expect(listbox.style.getPropertyValue("--lmn-select-bg")).toBe("");
    } finally {
      delete document.documentElement.dataset.theme;
    }
  });
});
