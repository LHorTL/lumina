# Theme 主题

> ThemeProvider + 组件 theme，支持页面、区域、组件和 Portal 使用不同色板，并可按组件类型定向覆盖。

## 导入

```tsx
import { ThemeProvider, useTheme, applyTheme, LUMINA_THEME_PRESETS, cloneLuminaThemePreset, pickLuminaThemePresets, Select } from "@fangxinyan/lumina";
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
      intensity={5}        // 0..20 阴影强度
      radius={20}          // 圆角基准 px
      font="sf"            // 字体预设
      storageKey="app:theme"   // 持久化到 localStorage
    >
      <App />
    </ThemeProvider>
  );
}
```

### 页面与组件多色组合

baseColor 会生成完整拟态色板；普通组件的 theme 默认只作用于自身，Portal 浮层会复制同一色板。

```tsx
<ThemeProvider target="scope" baseColor="#e7f0fa">
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
</ThemeProvider>
```

### 容器内定向修改组件

components 按公共组件名称匹配后代实例，可分别覆盖派生色板、精确颜色、组件 token 与静态插槽样式。

```tsx
<Surface
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
</Surface>
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

mode 可以指向 themes 中的命名 preset；可直接复用公开的 Lumina 内置预设。

```tsx
import { LUMINA_THEME_PRESETS, ThemeProvider } from "lumina";

const themes = {
  graphite: LUMINA_THEME_PRESETS.graphite,
};

<ThemeProvider mode="graphite" themes={themes}>
  <App />
</ThemeProvider>
```

### 作用域嵌套

target="scope" 只作用于子树,可以层层嵌套；Select 等 Portal 浮层也会继承所属作用域主题。

```tsx
<ThemeProvider accent="sky">
  <Page />

  <ThemeProvider target="scope" accent="coral" as="section">
    <PromoCard />

    <ThemeProvider target="scope" accent="mint" as="div">
      <InnerCallout />
      <Select options={[{ label: "Mint 浮层", value: "mint" }]} />
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
| baseColor | `string` | — | 表面基色；自动生成背景、文字、边框、阴影与默认强调色 |
| accent | `AccentKey | CustomAccentInput` | `"sky"` | 强调色,预设或自定义 |
| colors | `ThemeColorOverrides` | — | 对派生色板做最终精确覆盖；未提供字段继续继承 |
| components | `ComponentThemeOverrides` | — | 按公共组件名定向覆盖容器内实例 |
| density | `"compact" | "comfortable" | "spacious"` | `"comfortable"` | 密度 |
| intensity | `number` | `5` | 阴影强度;ThemePanel 默认调节范围 0-20 |
| radius | `number` | `20` | 圆角基准 px |
| font | `FontConfig` | `"sf"` | 字体预设或 CSS 栈 |
| tokens | `Record<string, string>` | — | 任意 CSS 变量覆写;推荐用语义阴影 token 和 shadow-scale(0.2-3) / shadow-float-scale(0.2-4) 控制阴影系统 |
| themes | `Record<string, ThemePreset>` | — | 命名自定义模式 preset |
| LUMINA_THEME_PRESETS | `Record<BuiltInLuminaThemePresetKey, ThemePreset>` | — | 可复用的 light/dark/porcelain/graphite/ember/assistant 内置预设 |
| cloneLuminaThemePreset / pickLuminaThemePresets | `function` | — | 克隆单个或挑选多个内置主题，避免修改共享预设 |
| ThemePreset.label / description | `string` | — | 可选展示元信息;ThemePanel 会读取它作为卡片标题和说明 |
| target | `"root" | "scope"` | `"root"` | 应用到根还是局部 |
| as | `keyof JSX.IntrinsicElements` | `"div"` | scope 模式的元素标签 |
| asChild | `boolean` | `false` | scope 模式把主题直接合并到唯一子元素，不增加包装节点 |
| enabled | `boolean` | `true` | 关闭当前主题层但保留 Provider 与 DOM 拓扑，适合平滑切换局部主题 |
| storageKey | `string` | — | 带版本号的 localStorage 持久化 key；同源多窗口会自动同步当前主题与自定义 themes |
| onChange | `(value: ThemeValue) => void` | — | 主题值变更回调 |


**useTheme() → ThemeValue**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| mode | `ThemeMode` | — | 请求的模式(保留 system) |
| resolvedMode | `ResolvedThemeMode` | — | 解析后的具体模式;自定义模式保留名称 |
| colorScheme | `"light" | "dark"` | — | 当前 light/dark 基底 |
| baseColor / colors / components | `-` | — | 当前基色、精确颜色与组件类型覆盖 |
| accent | `AccentKey | "custom"` | — | 预设 key 或 "custom" |
| accentPalette | `AccentPalette` | — | 当前完整调色板 |
| density / intensity / radius / font / tokens | `-` | — | 当前各维度状态 |
| themes / activeTheme | `-` | — | 自定义模式注册表与当前命中的 preset |
| setMode(m) | `(m: ThemeMode) => void` | — | 切换模式 |
| toggleMode() | `() => void` | — | light ⇄ dark 切换 |
| setAccent(a) | `(a: AccentKey | CustomAccentInput) => void` | — | 切换强调色 |
| setBaseColor / setColors / setComponents | `-` | — | 更新多色主题与组件类型覆盖 |
| setDensity / setIntensity / setRadius / setFont / setTokens / setThemes | `-` | — | 对应字段的 setter |
| update(cfg) | `(cfg: Partial<ThemeConfig>) => void` | — | 浅合并多字段 |
| reset() | `() => void` | — | 重置到初始 props |


**组件 theme 与定向覆盖**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| theme | `ComponentTheme` | — | 所有公共 UI 组件共享；强调色 key 或其他颜色字符串可直接简写 |
| theme.scope | `"self" | "subtree"` | `"self"` | self 只改当前组件；subtree 同时向业务后代传递完整色板 |
| baseColor | `string` | — | 生成背景、文字、边框、阴影和默认强调色 |
| colorScheme / accent / intensity | `-` | — | 控制深浅基底、强调色和拟态强度 |
| colors | `ThemeColorOverrides` | — | 精确覆盖 bg / fg / border / shadow / accent / semantic 等颜色槽 |
| tokens | `ThemeTokens` | — | 短键会写入组件前缀变量；以 -- 开头的键作为高级原始变量逃生口 |
| components | `ComponentThemeOverrides` | — | 继续定向配置当前组件内部或 subtree 后代的组件类型 |
| styles.root | `CSSProperties` | — | 所有组件都支持真实视觉根节点；调用方 style 仍保持最高优先级 |
| styles.popup / overlay / body | `CSSProperties` | — | 浮层、遮罩和正文等组件专用静态插槽；定位与用户 popupStyle 不会被覆盖 |


---
[← 回到索引](../llms.md)
