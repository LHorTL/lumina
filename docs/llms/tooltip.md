# Tooltip 文字提示

> 鼠标悬浮触发的简短说明。

## 导入

```tsx
import { Tooltip } from "@fangxinyan/lumina";
```

## 示例

### 基础

```tsx
<Tooltip content="新建文档"><Button icon="plus" /></Tooltip>
```

### 位置

```tsx
<Tooltip placement="bottom" content="..." />
```

### title 别名

title 与 content 等价,也支持 bottomLeft 等细分位置。

```tsx
<Tooltip title="复制路径" placement="bottomLeft">
  <Button icon="copy">复制</Button>
</Tooltip>
```

## API

**Tooltip**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| content | `ReactNode` | — | 提示内容 |
| title | `ReactNode` | — | content 的等价别名 |
| placement | `"top" | "bottom" | "left" | "right" | ...` | `"top"` | 位置,支持 bottomLeft 等细分方向 |
| delay | `number` | `250` | 悬浮延时 (ms) |
| closeDelay | `number` | `300` | 离开触发器或提示浮层后的关闭延时 (ms) |
| disabled | `boolean` | `false` | 禁用提示 |
| open / visible | `boolean` | — | 受控显示状态 |
| overlayClassName / popupClassName | `string` | — | 浮层 className |


---
[← 回到索引](../llms.md)
