# Card 卡片

> 信息分组容器,提供 raised / flat / sunken 三种视觉变体。

## 导入

```tsx
import { Card } from "@fangxinyan/lumina";
```

## 示例

### 三种变体

raised(默认凸起)、flat(扁平)、sunken(凹陷)。

```tsx
<Card>raised</Card>
<Card variant="flat">flat</Card>
<Card variant="sunken">sunken</Card>
```

### 悬浮抬起

hoverable 在鼠标悬浮时轻微上移并加强阴影,适合可点击的卡片列表。

```tsx
<Card hoverable>可点击卡片</Card>
```

### 整卡交互

interactive 提供按钮式焦点和键盘语义；标题区 actions 仍可独立响应，disabled 会隔离整张卡片。

```tsx
<Card
  interactive
  hoverable
  title="可操作卡片"
  actions={<Button onClick={handleAction}>独立操作</Button>}
  onClick={handleCardClick}
>
  点击卡片空白区域，或聚焦整卡后按 Enter / Space。
</Card>
<Card interactive disabled title="禁用卡片">不会响应</Card>
```

### 自定义背景色

background 可覆盖卡片根节点背景，纯色、主题 token、color-mix 与渐变都走同一个字段。

```tsx
<Card background="color-mix(in oklch, var(--accent-soft) 70%, var(--bg))">
  主题强调底色
</Card>
```

### 渐变背景

background 支持完整 CSS 背景值，适合给看板、概览指标或状态卡片做轻量分层。

```tsx
<Card background="linear-gradient(135deg, var(--bg-raised), var(--accent-soft))">
  渐变卡片
</Card>
```

### 带标题

带标题、描述、操作区。

```tsx
<Card title="月度营收" description="2026 年 4 月" actions={...}>
  ¥ 12,480
</Card>
```

### 标题区操作

```tsx
<Card title="..." actions={<Button size="sm" icon="plus">邀请</Button>}>...</Card>
```

### 正文布局

bodyLayout 控制正文槽布局，bodyClassName / bodyStyle / bodyProps 直接作用到 .card-body。

```tsx
<Card
  fill
  bodyLayout="stack"
  bodyClassName="settings-card-body"
  bodyStyle={{ minHeight: 160 }}
>
  ...
</Card>
```

### 加载覆盖

loading 会在正文区域显示中性 overlay；默认 Spin 跟随主题色，loadingOverlay 可替换内容。

```tsx
<Card loading>
  ...
</Card>
```

## API

**Card**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| variant | `"raised" | "flat" | "sunken"` | `"raised"` | 视觉变体 |
| background | `CSSProperties["background"]` | — | 自定义卡片根节点背景，支持主题 token / color-mix / linear-gradient / radial-gradient 等 CSS 背景值 |
| padding | `"none" | "sm" | "md" | "lg"` | `"md"` | 内边距 |
| hoverable | `boolean` | `false` | 悬浮时抬起 |
| interactive | `boolean` | — | 启用按钮式键盘语义；提供 onClick 时自动开启，内部按钮等控件保持独立响应 |
| disabled | `boolean` | `false` | 禁用交互式卡片并隔离内部控件 |
| title | `ReactNode` | — | 标题 |
| description | `ReactNode` | — | 副标题 |
| actions | `ReactNode` | — | 右上操作区 |
| fill | `boolean` | `false` | 卡片和正文填满可用高度 |
| bodyLayout | `"block" | "stack" | "fill" | "center"` | `"block"` | 正文布局策略 |
| bodyClassName | `string` | — | 正文容器 className |
| bodyStyle | `CSSProperties` | — | 正文容器内联样式 |
| bodyProps | `HTMLAttributes<HTMLDivElement>` | — | 透传给正文容器的 DOM props |
| loading | `boolean` | `false` | 显示正文加载覆盖层，并暂时隔离正文与标题操作区控件 |
| loadingOverlay | `ReactNode` | — | 自定义加载覆盖层内容 |


---
[← 回到索引](../llms.md)
