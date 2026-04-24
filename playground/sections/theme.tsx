import * as React from "react";
import {
  Button,
  Input,
  Tag,
  Spin,
  ThemeProvider,
  useTheme,
  ACCENT_PRESETS,
  type AccentKey,
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
      boxShadow: active ? "var(--neu-in-sm)" : "var(--neu-flat)",
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
            </ThemePreviewBox>
          </ThemeProvider>
        </ThemePreviewBox>
      </ThemeProvider>
    </ThemePreviewBox>
  </div>
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
          <li>想把用户的偏好持久化(加 <code>storageKey</code>)</li>
          <li>想跟随系统主题(<code>mode="system"</code>)</li>
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
      density="comfortable"
      intensity={5}        // 1..10 阴影强度
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
        id: "scope",
        title: "作用域嵌套",
        description: "target=\"scope\" 只作用于子树,可以层层嵌套。",
        span: 2,
        code: `<ThemeProvider accent="sky">
  <Page />

  <ThemeProvider target="scope" accent="coral" as="section">
    <PromoCard />

    <ThemeProvider target="scope" accent="mint" as="div">
      <InnerCallout />
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
          { prop: "mode", description: "深浅色模式", type: `"light" | "dark" | "system"`, default: `"light"` },
          { prop: "accent", description: "强调色,预设或自定义", type: "AccentKey | CustomAccentInput", default: `"sky"` },
          { prop: "density", description: "密度", type: `"compact" | "comfortable" | "spacious"`, default: `"comfortable"` },
          { prop: "intensity", description: "阴影强度 1-10", type: "number", default: "5" },
          { prop: "radius", description: "圆角基准 px", type: "number", default: "20" },
          { prop: "font", description: "字体预设或 CSS 栈", type: "FontConfig", default: `"sf"` },
          { prop: "tokens", description: "任意 CSS 变量覆写", type: "Record<string, string>" },
          { prop: "target", description: "应用到根还是局部", type: `"root" | "scope"`, default: `"root"` },
          { prop: "as", description: "scope 模式的元素标签", type: "keyof JSX.IntrinsicElements", default: `"div"` },
          { prop: "storageKey", description: "localStorage 持久化 key", type: "string" },
          { prop: "onChange", description: "主题值变更回调", type: "(value: ThemeValue) => void" },
        ],
      },
      {
        title: "useTheme() → ThemeValue",
        rows: [
          { prop: "mode", description: "请求的模式(保留 system)", type: "ThemeMode" },
          { prop: "resolvedMode", description: "解析后的具体模式", type: `"light" | "dark"` },
          { prop: "accent", description: "预设 key 或 \"custom\"", type: "AccentKey | \"custom\"" },
          { prop: "accentPalette", description: "当前完整调色板", type: "AccentPalette" },
          { prop: "density / intensity / radius / font / tokens", description: "当前各维度状态", type: "-" },
          { prop: "setMode(m)", description: "切换模式", type: "(m: ThemeMode) => void" },
          { prop: "toggleMode()", description: "light ⇄ dark 切换", type: "() => void" },
          { prop: "setAccent(a)", description: "切换强调色", type: "(a: AccentKey | CustomAccentInput) => void" },
          { prop: "setDensity / setIntensity / setRadius / setFont / setTokens", description: "对应字段的 setter", type: "-" },
          { prop: "update(cfg)", description: "浅合并多字段", type: "(cfg: Partial<ThemeConfig>) => void" },
          { prop: "reset()", description: "重置到初始 props", type: "() => void" },
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
  desc: "ThemeProvider + useTheme,覆盖深浅色、强调色、密度、圆角、字体、阴影强度。",
  Component: SectionTheme,
});
