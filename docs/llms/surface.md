# Surface 背景面

> 主题感知的背景承载容器,用于给特殊色调内容提供正确的拟态 token 语境。

## 导入

```tsx
import { Surface, SURFACE_THEME_PRESETS } from "@fangxinyan/lumina";
```

## 示例

### 基础承载

默认继承外部主题,只提供一片稳定的拟态背景。

```tsx
<Surface padding="lg" radius="xl">
  <Card title="运行概览" description="Surface 负责外部背景,Card 负责信息分组">
    <Button variant="primary">开始</Button>
  </Card>
</Surface>
```

### 内置背景预设

preset 会建立一套局部 ThemeProvider,子组件和 useTheme 都处在这套背景 token 下。

```tsx
<Surface preset="graphite" padding="lg" radius="xl">
  <Button variant="primary">深色面板</Button>
</Surface>

<Surface preset="porcelain" padding="lg" radius="xl">
  <Input placeholder="清亮浅色面板" />
</Surface>
```

### 背景语义

tone 只切换背景槽位;适合在同一主题里区分基底、凸起、凹陷和强调底。

```tsx
<Surface tone="base">base</Surface>
<Surface tone="raised">raised</Surface>
<Surface tone="sunken">sunken</Surface>
<Surface tone="accent">accent</Surface>
```

### 自定义局部主题

可直接传 mode、accent、tokens 等主题参数。themeRadius 控制子树 token, radius 控制 Surface 自身圆角。

```tsx
<Surface
  mode="dark"
  accent="mint"
  themeRadius={18}
  tokens={{
    bg: "#171d20",
    "bg-raised": "#20282c",
    "bg-sunken": "#101517",
  }}
>
  <Card>...</Card>
</Surface>
```

## API

**Surface**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| preset | `"inherit" | "mist" | "porcelain" | "graphite" | "ember"` | `"inherit"` | 内置局部背景预设 |
| tone | `"base" | "raised" | "sunken" | "accent"` | `"base"` | 可见背景槽位 |
| variant | `"plain" | "raised" | "sunken" | "floating"` | `"plain"` | Surface 自身拟态层级 |
| padding | `"none" | "sm" | "md" | "lg" | "xl"` | `"md"` | 内边距 |
| radius | `"none" | "sm" | "md" | "lg" | "xl"` | `"lg"` | Surface 自身圆角 |
| height | `"content" | "fill" | "screen"` | `"content"` | 高度语义 |
| bordered | `boolean` | `false` | 显示 token 描边 |
| scrollable | `boolean` | `false` | 受限高度下允许内部滚动 |
| mode / colorScheme / accent | `ThemeConfig fields` | — | 局部主题深浅色与强调色 |
| density / intensity / themeRadius / font | `ThemeConfig fields` | — | 局部密度、阴影、主题圆角和字体 |
| tokens | `ThemeTokens` | — | 局部 CSS token 覆写 |
| themes | `ThemePresets` | — | 局部自定义模式注册表 |


---
[← 回到索引](../llms.md)
