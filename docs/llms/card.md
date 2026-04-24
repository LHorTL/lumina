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


---
[← 回到索引](../llms.md)
