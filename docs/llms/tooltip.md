# Tooltip 文字提示

> 鼠标悬浮触发的简短说明。

## 导入

```tsx
import { Tooltip } from "@fangxinyan/lumina";
```

## 示例

### 基础

```tsx
<Tooltip content="新建文档"><IconButton icon="plus" /></Tooltip>
```

### 位置

```tsx
<Tooltip placement="bottom" content="..." />
```

## API

**Tooltip**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| content \* | `ReactNode` | — | 提示内容 |
| placement | `"top" | "bottom" | "left" | "right"` | `"top"` | 位置 |
| delay | `number` | `250` | 悬浮延时 (ms) |
| disabled | `boolean` | `false` | 禁用提示 |


---
[← 回到索引](../llms.md)
