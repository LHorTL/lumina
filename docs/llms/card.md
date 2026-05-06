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

loading 会在正文区域显示内建 overlay；loadingOverlay 可替换默认 Spin。

```tsx
<Card loading loadingOverlay="正在同步...">
  ...
</Card>
```

## API

**Card**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| variant | `"raised" | "flat" | "sunken"` | `"raised"` | 视觉变体 |
| padding | `"none" | "sm" | "md" | "lg"` | `"md"` | 内边距 |
| hoverable | `boolean` | `false` | 悬浮时抬起 |
| title | `ReactNode` | — | 标题 |
| description | `ReactNode` | — | 副标题 |
| actions | `ReactNode` | — | 右上操作区 |
| fill | `boolean` | `false` | 卡片和正文填满可用高度 |
| bodyLayout | `"block" | "stack" | "fill" | "center"` | `"block"` | 正文布局策略 |
| bodyClassName | `string` | — | 正文容器 className |
| bodyStyle | `CSSProperties` | — | 正文容器内联样式 |
| bodyProps | `HTMLAttributes<HTMLDivElement>` | — | 透传给正文容器的 DOM props |
| loading | `boolean` | `false` | 显示正文加载覆盖层 |
| loadingOverlay | `ReactNode` | — | 自定义加载覆盖层内容 |


---
[← 回到索引](../llms.md)
