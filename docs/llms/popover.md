# Popover 气泡卡片

> 比 Tooltip 更丰富,可承载交互内容。

## 导入

```tsx
import { Popover } from "@fangxinyan/lumina";
```

## 示例

### 基础

```tsx
<Popover content={<>...</>}>
  <Button>触发</Button>
</Popover>
```

## API

**Popover**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| content \* | `ReactNode` | — | 浮层内容 |
| placement | `"top" | "bottom" | "left" | "right"` | `"bottom"` | 位置 |
| trigger | `"click" | "hover"` | `"click"` | 触发方式 |
| open / defaultOpen / onOpenChange | `—` | — | 受控显示 |


---
[← 回到索引](../llms.md)
