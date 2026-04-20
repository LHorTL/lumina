# Tag 标签

> 标记关键词、状态或分类。

## 导入

```tsx
import { Tag } from "@fangxinyan/lumina";
```

## 示例

### 语气

```tsx
<Tag>Default</Tag>
<Tag tone="accent">Accent</Tag>
<Tag tone="success">Success</Tag>
```

### 实心

```tsx
<Tag tone="accent" solid>Solid</Tag>
```

### 圆点状态

dot 渲染前置色块。

```tsx
<Tag tone="success" dot>在线</Tag>
```

### 前置图标

icon 使用内置 Icon 组件,颜色随语气自动适配。

```tsx
<Tag tone="success" icon="check2">已完成</Tag>
<Tag tone="info" icon="star">推荐</Tag>
```

### 无边框

bordered={false} 去除 flat 阴影,只保留文本色。

```tsx
<Tag bordered={false}>Default</Tag>
<Tag tone="accent" bordered={false}>Accent</Tag>
```

### 可移除

removable + onRemove 实现关闭按钮。

```tsx
<Tag removable onRemove={() => remove(t.id)}>{t.label}</Tag>
```

## API

**Tag**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| tone | `"neutral" | "accent" | "info" | "success" | "warning" | "danger"` | `"neutral"` | 色调 |
| solid | `boolean` | `false` | 实心填充 |
| dot | `boolean` | `false` | 前置圆点 |
| icon | `IconName` | — | 前置图标 |
| bordered | `boolean` | `true` | 是否显示外框 flat 阴影 |
| removable | `boolean` | `false` | 显示 × |
| onRemove | `() => void` | — | 关闭回调 |


---
[← 回到索引](../llms.md)
