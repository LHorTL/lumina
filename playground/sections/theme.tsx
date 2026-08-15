import * as React from "react";
import {
  AimOutlined,
  Button,
  Card,
  Input,
  Select,
  Surface,
  Tag,
  Spin,
  ThemeProvider,
  useTheme,
  ACCENT_PRESETS,
  LUMINA_THEME_PRESETS,
  type AccentKey,
  type ThemeMode,
  type ThemePresets,
} from "lumina";
import { DocPage } from "../docs";
import { Row } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

const ThemedSwatch: React.FC<{ palette: string; active: boolean; onClick: () => void; label: string }> = ({
  palette,
  active,
  onClick,
  label,
}) => (
  <Button
    onClick={onClick}
    aria-label={label}
    title={label}
    className="icon"
    size="sm"
    style={{
      width: 28,
      height: 28,
      borderRadius: 999,
      border: active ? "2px solid var(--fg)" : "2px solid transparent",
      background: palette,
      padding: 0,
      boxShadow: active ? "var(--neu-shadow-inset)" : "var(--neu-shadow-subtle)",
    }}
  />
);

const ThemePreviewBox: React.FC<{ children: React.ReactNode; label?: React.ReactNode }> = ({ children, label }) => (
  <div
    style={{
      padding: 14,
      borderRadius: "var(--r-md)",
      background: "var(--bg-sunken)",
      display: "flex",
      flexDirection: "column",
      gap: 10,
    }}
  >
    {label && <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>{label}</div>}
    {children}
  </div>
);

const ThemePreviewControls: React.FC = () => (
  <Row gap={8}>
    <Button variant="primary" icon="sparkle">
      主按钮
    </Button>
    <Button variant="ghost">次按钮</Button>
    <Tag solid>标签</Tag>
    <Spin size={18} />
  </Row>
);

const ThemePresetsDemo: React.FC = () => {
  const [accent, setAccent] = React.useState<AccentKey>("sky");
  const keys = Object.keys(ACCENT_PRESETS) as AccentKey[];
  return (
    <ThemeProvider target="scope" accent={accent} as="div">
      <ThemePreviewBox label={`accent = "${accent}"`}>
        <Row gap={8}>
          {keys.map((k) => (
            <ThemedSwatch
              key={k}
              label={k}
              palette={ACCENT_PRESETS[k].accent}
              active={accent === k}
              onClick={() => setAccent(k)}
            />
          ))}
        </Row>
        <ThemePreviewControls />
      </ThemePreviewBox>
    </ThemeProvider>
  );
};

const ThemeCustomDemo: React.FC = () => {
  const [color, setColor] = React.useState("oklch(70% 0.18 180)");
  return (
    <ThemeProvider target="scope" accent={color} as="div">
      <ThemePreviewBox label="ink / soft / glow 自动从主色推导">
        <Input
          value={color}
          onValueChange={(v) => setColor(v)}
          placeholder="oklch(70% 0.18 180) 或 #00b894"
        />
        <Row gap={8}>
          {["#00b894", "#ff6b6b", "oklch(70% 0.18 180)", "oklch(60% 0.2 310)"].map((c) => (
            <Button
              key={c}
              onClick={() => setColor(c)}
              size="sm"
              variant="ghost"
              style={{
                height: 26,
                padding: "0 10px",
                fontSize: 11,
                borderRadius: 999,
                border: "1px solid var(--divider)",
                background: "var(--bg)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {c}
            </Button>
          ))}
        </Row>
        <ThemePreviewControls />
      </ThemePreviewBox>
    </ThemeProvider>
  );
};

const CUSTOM_MODE_THEMES = {
  graphite: {
    ...LUMINA_THEME_PRESETS.graphite,
    label: "Graphite",
    description: "深色",
  },
  porcelain: {
    ...LUMINA_THEME_PRESETS.porcelain,
    label: "瓷白",
    description: "清亮",
  },
} satisfies ThemePresets;

const ThemeCustomModeDemo: React.FC = () => {
  const [mode, setMode] = React.useState<ThemeMode>("graphite");
  return (
    <ThemeProvider target="scope" mode={mode} themes={CUSTOM_MODE_THEMES} as="div">
      <ThemePreviewBox label={`mode="${mode}"`}>
        <Row gap={8}>
          <Button size="sm" onClick={() => setMode("graphite")}>
            graphite
          </Button>
          <Button size="sm" onClick={() => setMode("porcelain")}>
            porcelain
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setMode("light")}>
            light
          </Button>
        </Row>
        <ThemePreviewControls />
      </ThemePreviewBox>
    </ThemeProvider>
  );
};

const ThemeHookInner: React.FC = () => {
  const t = useTheme();
  return (
    <ThemePreviewBox label={`mode=${t.resolvedMode} · accent=${t.accent} · density=${t.density}`}>
      <Row gap={8}>
        <Button size="sm" onClick={t.toggleMode} icon={t.resolvedMode === "dark" ? "sun" : "moon"}>
          {t.resolvedMode === "dark" ? "切浅色" : "切深色"}
        </Button>
        <Button size="sm" onClick={() => t.setAccent("coral")}>
          accent = coral
        </Button>
        <Button size="sm" onClick={() => t.setAccent("mint")}>
          accent = mint
        </Button>
        <Button size="sm" onClick={() => t.setDensity(t.density === "compact" ? "spacious" : "compact")}>
          切密度
        </Button>
        <Button size="sm" variant="ghost" onClick={t.reset}>
          重置
        </Button>
      </Row>
      <ThemePreviewControls />
    </ThemePreviewBox>
  );
};

const ThemeHookDemo: React.FC = () => (
  <ThemeProvider target="scope" accent="violet" as="div">
    <ThemeHookInner />
  </ThemeProvider>
);

const ThemeScopeDemo: React.FC = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    <ThemePreviewBox label="外层 · 跟随全局">
      <ThemePreviewControls />
      <ThemeProvider target="scope" accent="coral" as="div">
        <ThemePreviewBox label='内层 · accent="coral"'>
          <ThemePreviewControls />
          <ThemeProvider target="scope" accent="mint" as="div">
            <ThemePreviewBox label='再嵌一层 · accent="mint"'>
              <ThemePreviewControls />
              <Select
                aria-label="作用域主题下的 Portal 下拉框"
                defaultValue="mint"
                options={[
                  { label: "Mint 浮层", value: "mint" },
                  { label: "Coral 浮层", value: "coral" },
                ]}
                style={{ width: 180 }}
              />
            </ThemePreviewBox>
          </ThemeProvider>
        </ThemePreviewBox>
      </ThemeProvider>
    </ThemePreviewBox>
  </div>
);

/** 展示同一页面中区域与组件实例使用不同表面色板。 */
const ThemeMultiColorDemo: React.FC = () => (
  <ThemeProvider target="scope" baseColor="#e7f0fa" as="section">
    <ThemePreviewBox label="页面区域 · baseColor = #e7f0fa">
      <Row gap={12}>
        <Card
          title="暖色卡片"
          description="只改变这个 Card"
          theme={{ baseColor: "#f5dfd4", colors: { fg: "#4d342b" } }}
          style={{ flex: "1 1 220px" }}
        >
          页面仍保持蓝灰色板。
        </Card>
        <Card
          title="薄荷卡片"
          description="组件 theme 默认 scope=self"
          theme={{ baseColor: "#dcefe5", accent: "mint" }}
          style={{ flex: "1 1 220px" }}
        >
          相邻组件不会被串色。
        </Card>
      </Row>
      <Row gap={12}>
        <Select
          theme={{ baseColor: "#eee3f8", accent: "violet" }}
          defaultValue="violet"
          options={[
            { value: "violet", label: "紫色 Select（浮层同色）" },
            { value: "page", label: "页面蓝灰色" },
          ]}
          style={{ width: 260 }}
        />
        <AimOutlined
          aria-label="单独着色的具名图标"
          size={28}
          theme={{ colors: { fg: "#7357c8" } }}
        />
      </Row>
    </ThemePreviewBox>
  </ThemeProvider>
);

/** 展示容器按组件类型覆写颜色、token 和根插槽样式。 */
const ThemeComponentOverridesDemo: React.FC = () => (
  <Surface
    baseColor="#f0ece6"
    padding="lg"
    components={{
      Button: {
        baseColor: "#dceaf8",
        accent: "violet",
        tokens: { hoverBackground: "#cbdff2" },
        styles: { root: { borderRadius: 999 } },
      },
      Tag: {
        baseColor: "#f4dfd8",
        colors: { fgMuted: "#70483c" },
      },
    }}
  >
    <Row gap={10}>
      <Button>容器内 Button</Button>
      <Button variant="primary">主按钮</Button>
      <Tag>容器内 Tag</Tag>
      <Input placeholder="Input 未被定向覆盖" style={{ width: 210 }} />
    </Row>
  </Surface>
);

const SectionTheme: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={
      <>
        <p>
          用 <code>ThemeProvider</code> 包裹应用或子树来统一管理主题,<code>useTheme()</code> 在子组件里读/改。
          覆盖 mode(深浅色)、accent(强调色)、density(密度)、intensity(阴影强度)、radius(圆角)、font(字体)、任意 token 覆写。
        </p>
        <ul className="doc-usecase-list">
          <li>想让整个应用能切深浅色/强调色</li>
          <li>想给某一块(推广卡片/对话框)单独换一套主题</li>
          <li>想让同一页面中的区域、卡片、表单或浮层使用不同表面颜色</li>
          <li>想在某个容器里只定向修改 Button / Select 等指定组件类型</li>
          <li>想把用户的偏好持久化(加 <code>storageKey</code>)</li>
          <li>想跟随系统主题(<code>mode="system"</code>)</li>
          <li>想暴露命名自定义模式(<code>mode="graphite"</code>)并一次套完整 token</li>
        </ul>
      </>
    }
    demos={[
      {
        id: "basic",
        title: "基础用法",
        description: "用 ThemeProvider 包住应用,所有 lumina 组件自动生效。",
        span: 2,
        code: `import { ThemeProvider } from "lumina";

function Root() {
  return (
    <ThemeProvider
      mode="system"        // "light" | "dark" | "system"
      accent="violet"      // 预设 或 自定义颜色
      themes={{ graphite: { base: "dark", tokens: {} } }}
      density="comfortable"
      intensity={5}        // 0..20 阴影强度
      radius={20}          // 圆角基准 px
      font="sf"            // 字体预设
      storageKey="app:theme"   // 持久化到 localStorage
    >
      <App />
    </ThemeProvider>
  );
}`,
        render: () => (
          <ThemePreviewBox label="这个 playground 本身就用 ThemeProvider 驱动 —— 右下角 Tweaks 面板改的就是它">
            <ThemePreviewControls />
          </ThemePreviewBox>
        ),
      },
      {
        id: "multi-color",
        title: "页面与组件多色组合",
        description: "baseColor 会生成完整拟态色板；普通组件的 theme 默认只作用于自身，Portal 浮层会复制同一色板。",
        span: 2,
        code: `<ThemeProvider target="scope" baseColor="#e7f0fa">
  <Card theme={{
    baseColor: "#f5dfd4",
    colors: { fg: "#4d342b" },
  }}>
    暖色卡片
  </Card>

  <Select
    theme={{ baseColor: "#eee3f8", accent: "violet" }}
    options={options}
  />

  <AimOutlined
    theme={{ colors: { fg: "#7357c8" } }}
    size={28}
  />
</ThemeProvider>`,
        render: () => <ThemeMultiColorDemo />,
      },
      {
        id: "component-overrides",
        title: "容器内定向修改组件",
        description: "components 按公共组件名称匹配后代实例，可分别覆盖派生色板、精确颜色、组件 token 与静态插槽样式。",
        span: 2,
        code: `<Surface
  baseColor="#f0ece6"
  components={{
    Button: {
      baseColor: "#dceaf8",
      accent: "violet",
      tokens: { hoverBackground: "#cbdff2" },
      styles: { root: { borderRadius: 999 } },
    },
    Tag: {
      colors: { fgMuted: "#70483c" },
    },
  }}
>
  <Button>只影响容器内 Button</Button>
  <Tag>只影响容器内 Tag</Tag>
  <Input placeholder="未配置，继续继承容器色板" />
</Surface>`,
        render: () => <ThemeComponentOverridesDemo />,
      },
      {
        id: "hook",
        title: "useTheme Hook",
        description: "子组件随时读/改主题。下面这块被独立的 ThemeProvider 包裹,不影响全局。",
        code: `const t = useTheme();
t.toggleMode();              // 切换深浅色
t.setAccent("coral");        // 换强调色
t.setDensity("compact");     // 改密度
t.update({ radius: 14 });    // 一次改多个
t.reset();                   // 重置到 props 初值`,
        render: () => <ThemeHookDemo />,
      },
      {
        id: "shadow-system",
        title: "阴影系统",
        description: "阴影强度、扩散和浮层深度都由 ThemeProvider tokens 驱动,组件只消费语义阴影 token。",
        code: `const t = useTheme();

t.setIntensity(6);
t.setTokens({
  ...t.tokens,
  "shadow-scale": "1.15",
  "shadow-float-scale": "1.25",
});`,
      },
      {
        id: "presets",
        title: "预设强调色",
        description: "内置 6 种拟态强调色,点击切换。",
        code: `<ThemeProvider accent="sky" />
<ThemeProvider accent="coral" />
<ThemeProvider accent="mint" />
<ThemeProvider accent="violet" />
<ThemeProvider accent="amber" />
<ThemeProvider accent="rose" />`,
        render: () => <ThemePresetsDemo />,
      },
      {
        id: "custom",
        title: "自定义强调色",
        description: "传任意 CSS 颜色(oklch / hex / rgb)。只给主色,ink / soft / glow 会用 color-mix 自动推导。",
        code: `// 只给主色,其他自动推导
<ThemeProvider accent="oklch(70% 0.18 180)" />
<ThemeProvider accent={{ accent: "#00b894" }} />

// 或给完整调色板
<ThemeProvider accent={{
  accent: "oklch(70% 0.18 180)",
  ink:    "oklch(40% 0.14 180)",
  soft:   "oklch(93% 0.04 180)",
  glow:   "oklch(70% 0.18 180 / 0.35)",
}} />`,
        render: () => <ThemeCustomDemo />,
      },
      {
        id: "custom-mode",
        title: "自定义主题模式",
        description: "mode 可以指向 themes 中的命名 preset；可直接复用公开的 Lumina 内置预设。",
        code: `import { LUMINA_THEME_PRESETS, ThemeProvider } from "lumina";

const themes = {
  graphite: LUMINA_THEME_PRESETS.graphite,
};

<ThemeProvider mode="graphite" themes={themes}>
  <App />
</ThemeProvider>`,
        render: () => <ThemeCustomModeDemo />,
      },
      {
        id: "scope",
        title: "作用域嵌套",
        description: "target=\"scope\" 只作用于子树,可以层层嵌套；Select 等 Portal 浮层也会继承所属作用域主题。",
        span: 2,
        code: `<ThemeProvider accent="sky">
  <Page />

  <ThemeProvider target="scope" accent="coral" as="section">
    <PromoCard />

    <ThemeProvider target="scope" accent="mint" as="div">
      <InnerCallout />
      <Select options={[{ label: "Mint 浮层", value: "mint" }]} />
    </ThemeProvider>
  </ThemeProvider>
</ThemeProvider>`,
        render: () => <ThemeScopeDemo />,
      },
      {
        id: "tokens",
        title: "覆盖任意 token",
        description: "tokens prop 可以改 tokens.css 里任何变量 —— 键名可省略 --。",
        code: `<ThemeProvider
  tokens={{
    bg: "#f5f5f7",           // 等价 --bg
    "--bg-sunken": "#e8e8ed",
    "shadow-dark": "rgba(0,0,0,0.18)",
    "shadow-scale": "0.9",
    "shadow-float-scale": "1.15",
    "--font-display": '"Inter", sans-serif',
  }}
/>`,
      },
      {
        id: "imperative",
        title: "命令式 API",
        description: "脱离 React 直接给元素套主题 —— 适合 vanilla JS 或 SSR 早期水合。",
        code: `import { applyTheme } from "lumina";

applyTheme(document.documentElement, {
  mode: "dark",
  accent: "violet",
  radius: 16,
});`,
      },
    ]}
    api={[
      {
        title: "ThemeProvider Props",
        rows: [
          { prop: "mode", description: "深浅色模式或自定义模式名", type: "ThemeMode", default: `"light"` },
          { prop: "colorScheme", description: "自定义模式使用的 light/dark 基底", type: `"light" | "dark"`, default: `"light"` },
          { prop: "baseColor", description: "表面基色；自动生成背景、文字、边框、阴影与默认强调色", type: "string" },
          { prop: "accent", description: "强调色,预设或自定义", type: "AccentKey | CustomAccentInput", default: `"sky"` },
          { prop: "colors", description: "对派生色板做最终精确覆盖；未提供字段继续继承", type: "ThemeColorOverrides" },
          { prop: "components", description: "按公共组件名定向覆盖容器内实例", type: "ComponentThemeOverrides" },
          { prop: "density", description: "密度", type: `"compact" | "comfortable" | "spacious"`, default: `"comfortable"` },
          { prop: "intensity", description: "阴影强度;ThemePanel 默认调节范围 0-20", type: "number", default: "5" },
          { prop: "radius", description: "圆角基准 px", type: "number", default: "20" },
          { prop: "font", description: "字体预设或 CSS 栈", type: "FontConfig", default: `"sf"` },
          {
            prop: "tokens",
            description: "任意 CSS 变量覆写;推荐用语义阴影 token 和 shadow-scale(0.2-3) / shadow-float-scale(0.2-4) 控制阴影系统",
            type: "Record<string, string>",
          },
          { prop: "themes", description: "命名自定义模式 preset", type: "Record<string, ThemePreset>" },
          { prop: "LUMINA_THEME_PRESETS", description: "可复用的 light/dark/porcelain/graphite/ember/assistant 内置预设", type: "Record<BuiltInLuminaThemePresetKey, ThemePreset>" },
          { prop: "cloneLuminaThemePreset / pickLuminaThemePresets", description: "克隆单个或挑选多个内置主题，避免修改共享预设", type: "function" },
          { prop: "ThemePreset.label / description", description: "可选展示元信息;ThemePanel 会读取它作为卡片标题和说明", type: "string" },
          { prop: "target", description: "应用到根还是局部", type: `"root" | "scope"`, default: `"root"` },
          { prop: "as", description: "scope 模式的元素标签", type: "keyof JSX.IntrinsicElements", default: `"div"` },
          { prop: "asChild", description: "scope 模式把主题直接合并到唯一子元素，不增加包装节点", type: "boolean", default: "false" },
          { prop: "enabled", description: "关闭当前主题层但保留 Provider 与 DOM 拓扑，适合平滑切换局部主题", type: "boolean", default: "true" },
          { prop: "storageKey", description: "带版本号的 localStorage 持久化 key；同源多窗口会自动同步当前主题与自定义 themes", type: "string" },
          { prop: "onChange", description: "主题值变更回调", type: "(value: ThemeValue) => void" },
        ],
      },
      {
        title: "useTheme() → ThemeValue",
        rows: [
          { prop: "mode", description: "请求的模式(保留 system)", type: "ThemeMode" },
          { prop: "resolvedMode", description: "解析后的具体模式;自定义模式保留名称", type: "ResolvedThemeMode" },
          { prop: "colorScheme", description: "当前 light/dark 基底", type: `"light" | "dark"` },
          { prop: "baseColor / colors / components", description: "当前基色、精确颜色与组件类型覆盖", type: "-" },
          { prop: "accent", description: "预设 key 或 \"custom\"", type: "AccentKey | \"custom\"" },
          { prop: "accentPalette", description: "当前完整调色板", type: "AccentPalette" },
          { prop: "density / intensity / radius / font / tokens", description: "当前各维度状态", type: "-" },
          { prop: "themes / activeTheme", description: "自定义模式注册表与当前命中的 preset", type: "-" },
          { prop: "setMode(m)", description: "切换模式", type: "(m: ThemeMode) => void" },
          { prop: "toggleMode()", description: "light ⇄ dark 切换", type: "() => void" },
          { prop: "setAccent(a)", description: "切换强调色", type: "(a: AccentKey | CustomAccentInput) => void" },
          { prop: "setBaseColor / setColors / setComponents", description: "更新多色主题与组件类型覆盖", type: "-" },
          { prop: "setDensity / setIntensity / setRadius / setFont / setTokens / setThemes", description: "对应字段的 setter", type: "-" },
          { prop: "update(cfg)", description: "浅合并多字段", type: "(cfg: Partial<ThemeConfig>) => void" },
          { prop: "reset()", description: "重置到初始 props", type: "() => void" },
        ],
      },
      {
        title: "组件 theme 与定向覆盖",
        rows: [
          { prop: "theme", description: "所有公共 UI 组件共享；强调色 key 或其他颜色字符串可直接简写", type: "ComponentTheme" },
          { prop: "theme.scope", description: "self 只改当前组件；subtree 同时向业务后代传递完整色板", type: `"self" | "subtree"`, default: `"self"` },
          { prop: "baseColor", description: "生成背景、文字、边框、阴影和默认强调色", type: "string" },
          { prop: "colorScheme / accent / intensity", description: "控制深浅基底、强调色和拟态强度", type: "-" },
          { prop: "colors", description: "精确覆盖 bg / fg / border / shadow / accent / semantic 等颜色槽", type: "ThemeColorOverrides" },
          { prop: "tokens", description: "短键会写入组件前缀变量；以 -- 开头的键作为高级原始变量逃生口", type: "ThemeTokens" },
          { prop: "components", description: "继续定向配置当前组件内部或 subtree 后代的组件类型", type: "ComponentThemeOverrides" },
          { prop: "styles.root", description: "所有组件都支持真实视觉根节点；调用方 style 仍保持最高优先级", type: "CSSProperties" },
          { prop: "styles.popup / overlay / header / body / footer", description: "浮层、遮罩和 Modal 头部/正文/footer 等稳定静态插槽；定位与用户实例样式不会被覆盖", type: "CSSProperties" },
        ],
      },
    ]}
  />
);

export default defineSection({
  id: "theme",
  group: "起步",
  order: 20,
  label: "Theme 主题",
  eyebrow: "FOUNDATION",
  title: "Theme 主题",
  desc: "ThemeProvider + 组件 theme，支持页面、区域、组件和 Portal 使用不同色板，并可按组件类型定向覆盖。",
  Component: SectionTheme,
});
