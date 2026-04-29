# Theme 主题

> ThemeProvider + useTheme,覆盖深浅色、自定义模式、强调色、密度、圆角、字体、阴影强度。

## 导入

```tsx
import { ThemeProvider, useTheme, applyTheme } from "@fangxinyan/lumina";
```

## 示例

### 基础用法

用 ThemeProvider 包住应用,所有 lumina 组件自动生效。

```tsx
import { ThemeProvider } from "lumina";

function Root() {
  return (
    <ThemeProvider
      mode="system"        // "light" | "dark" | "system"
      accent="violet"      // 预设 或 自定义颜色
      themes={{ graphite: { base: "dark", tokens: {} } }}
      density="comfortable"
      intensity={5}        // 1..10 阴影强度
      radius={20}          // 圆角基准 px
      font="sf"            // 字体预设
      storageKey="app:theme"   // 持久化到 localStorage
    >
      <App />
    </ThemeProvider>
  );
}
```

### useTheme Hook

子组件随时读/改主题。下面这块被独立的 ThemeProvider 包裹,不影响全局。

```tsx
const t = useTheme();
t.toggleMode();              // 切换深浅色
t.setAccent("coral");        // 换强调色
t.setDensity("compact");     // 改密度
t.update({ radius: 14 });    // 一次改多个
t.reset();                   // 重置到 props 初值
```

### 阴影系统

阴影强度、扩散和浮层深度都由 ThemeProvider tokens 驱动,组件只消费语义阴影 token。

```tsx
const t = useTheme();

t.setIntensity(6);
t.setTokens({
  ...t.tokens,
  "shadow-scale": "1.15",
  "shadow-float-scale": "1.25",
});
```

### 预设强调色

内置 6 种拟态强调色,点击切换。

```tsx
<ThemeProvider accent="sky" />
<ThemeProvider accent="coral" />
<ThemeProvider accent="mint" />
<ThemeProvider accent="violet" />
<ThemeProvider accent="amber" />
<ThemeProvider accent="rose" />
```

### 自定义强调色

传任意 CSS 颜色(oklch / hex / rgb)。只给主色,ink / soft / glow 会用 color-mix 自动推导。

```tsx
// 只给主色,其他自动推导
<ThemeProvider accent="oklch(70% 0.18 180)" />
<ThemeProvider accent={{ accent: "#00b894" }} />

// 或给完整调色板
<ThemeProvider accent={{
  accent: "oklch(70% 0.18 180)",
  ink:    "oklch(40% 0.14 180)",
  soft:   "oklch(93% 0.04 180)",
  glow:   "oklch(70% 0.18 180 / 0.35)",
}} />
```

### 自定义主题模式

mode 可以指向 themes 中的命名 preset。base 决定 light/dark 基底,tokens 决定完整视觉。

```tsx
const themes = {
  graphite: {
    label: "Graphite",
    description: "深色",
    base: "dark",
    accent: {
      accent: "oklch(72% 0.13 190)",
      ink: "oklch(85% 0.1 190)",
      soft: "oklch(31% 0.05 190)",
      glow: "oklch(72% 0.13 190 / 0.18)",
    },
    intensity: 4,
    radius: 18,
    tokens: {
      bg: "#181b22",
      "bg-raised": "#20242d",
      "bg-sunken": "#11141a",
      fg: "#edf1f7",
      "shadow-dark": "rgba(0,0,0,.58)",
      "shadow-light": "rgba(128,146,166,.07)",
      "shadow-scale": "1",
      "shadow-float-scale": "1",
    },
  },
};

<ThemeProvider mode="graphite" themes={themes}>
  <App />
</ThemeProvider>
```

### 作用域嵌套

target="scope" 只作用于子树,可以层层嵌套。

```tsx
<ThemeProvider accent="sky">
  <Page />

  <ThemeProvider target="scope" accent="coral" as="section">
    <PromoCard />

    <ThemeProvider target="scope" accent="mint" as="div">
      <InnerCallout />
    </ThemeProvider>
  </ThemeProvider>
</ThemeProvider>
```

### 覆盖任意 token

tokens prop 可以改 tokens.css 里任何变量 —— 键名可省略 --。

```tsx
<ThemeProvider
  tokens={{
    bg: "#f5f5f7",           // 等价 --bg
    "--bg-sunken": "#e8e8ed",
    "shadow-dark": "rgba(0,0,0,0.18)",
    "shadow-scale": "0.9",
    "shadow-float-scale": "1.15",
    "--font-display": '"Inter", sans-serif',
  }}
/>
```

### 命令式 API

脱离 React 直接给元素套主题 —— 适合 vanilla JS 或 SSR 早期水合。

```tsx
import { applyTheme } from "lumina";

applyTheme(document.documentElement, {
  mode: "dark",
  accent: "violet",
  radius: 16,
});
```

## API

**ThemeProvider Props**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| mode | `ThemeMode` | `"light"` | 深浅色模式或自定义模式名 |
| colorScheme | `"light" | "dark"` | `"light"` | 自定义模式使用的 light/dark 基底 |
| accent | `AccentKey | CustomAccentInput` | `"sky"` | 强调色,预设或自定义 |
| density | `"compact" | "comfortable" | "spacious"` | `"comfortable"` | 密度 |
| intensity | `number` | `5` | 阴影强度 1-10 |
| radius | `number` | `20` | 圆角基准 px |
| font | `FontConfig` | `"sf"` | 字体预设或 CSS 栈 |
| tokens | `Record<string, string>` | — | 任意 CSS 变量覆写;推荐用语义阴影 token 和 shadow-scale / shadow-float-scale 控制阴影系统 |
| themes | `Record<string, ThemePreset>` | — | 命名自定义模式 preset |
| ThemePreset.label / description | `string` | — | 可选展示元信息;ThemePanel 会读取它作为卡片标题和说明 |
| target | `"root" | "scope"` | `"root"` | 应用到根还是局部 |
| as | `keyof JSX.IntrinsicElements` | `"div"` | scope 模式的元素标签 |
| storageKey | `string` | — | localStorage 持久化 key,包含当前主题状态与自定义 themes |
| onChange | `(value: ThemeValue) => void` | — | 主题值变更回调 |


**useTheme() → ThemeValue**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| mode | `ThemeMode` | — | 请求的模式(保留 system) |
| resolvedMode | `ResolvedThemeMode` | — | 解析后的具体模式;自定义模式保留名称 |
| colorScheme | `"light" | "dark"` | — | 当前 light/dark 基底 |
| accent | `AccentKey | "custom"` | — | 预设 key 或 "custom" |
| accentPalette | `AccentPalette` | — | 当前完整调色板 |
| density / intensity / radius / font / tokens | `-` | — | 当前各维度状态 |
| themes / activeTheme | `-` | — | 自定义模式注册表与当前命中的 preset |
| setMode(m) | `(m: ThemeMode) => void` | — | 切换模式 |
| toggleMode() | `() => void` | — | light ⇄ dark 切换 |
| setAccent(a) | `(a: AccentKey | CustomAccentInput) => void` | — | 切换强调色 |
| setDensity / setIntensity / setRadius / setFont / setTokens / setThemes | `-` | — | 对应字段的 setter |
| update(cfg) | `(cfg: Partial<ThemeConfig>) => void` | — | 浅合并多字段 |
| reset() | `() => void` | — | 重置到初始 props |


---
[← 回到索引](../llms.md)
