# Theme 主题

> ThemeProvider + useTheme,覆盖深浅色、强调色、密度、圆角、字体、阴影强度。

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
| mode | `"light" | "dark" | "system"` | `"light"` | 深浅色模式 |
| accent | `AccentKey | CustomAccentInput` | `"sky"` | 强调色,预设或自定义 |
| density | `"compact" | "comfortable" | "spacious"` | `"comfortable"` | 密度 |
| intensity | `number` | `5` | 阴影强度 1-10 |
| radius | `number` | `20` | 圆角基准 px |
| font | `FontConfig` | `"sf"` | 字体预设或 CSS 栈 |
| tokens | `Record<string, string>` | — | 任意 CSS 变量覆写 |
| target | `"root" | "scope"` | `"root"` | 应用到根还是局部 |
| as | `keyof JSX.IntrinsicElements` | `"div"` | scope 模式的元素标签 |
| storageKey | `string` | — | localStorage 持久化 key |
| onChange | `(value: ThemeValue) => void` | — | 主题值变更回调 |


**useTheme() → ThemeValue**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| mode | `ThemeMode` | — | 请求的模式(保留 system) |
| resolvedMode | `"light" | "dark"` | — | 解析后的具体模式 |
| accent | `AccentKey | "custom"` | — | 预设 key 或 "custom" |
| accentPalette | `AccentPalette` | — | 当前完整调色板 |
| density / intensity / radius / font / tokens | `-` | — | 当前各维度状态 |
| setMode(m) | `(m: ThemeMode) => void` | — | 切换模式 |
| toggleMode() | `() => void` | — | light ⇄ dark 切换 |
| setAccent(a) | `(a: AccentKey | CustomAccentInput) => void` | — | 切换强调色 |
| setDensity / setIntensity / setRadius / setFont / setTokens | `-` | — | 对应字段的 setter |
| update(cfg) | `(cfg: Partial<ThemeConfig>) => void` | — | 浅合并多字段 |
| reset() | `() => void` | — | 重置到初始 props |


---
[← 回到索引](../llms.md)
