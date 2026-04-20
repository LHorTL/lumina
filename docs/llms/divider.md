# Divider 分隔符

> 对内容进行分割。

## 导入

```tsx
import { Divider } from "@fangxinyan/lumina";
```

## 示例

### 水平分隔

```tsx
<Divider />
```

### 带文字

```tsx
<Divider label="分割标题" />
```

### 文字位置

orientation 控制文字在线上的位置。

```tsx
<Divider label="左对齐" orientation="left" />
<Divider label="居中" orientation="center" />
<Divider label="右对齐" orientation="right" />
```

### 虚线

dashed 切换为虚线样式,也适用于带文字或垂直方向。

```tsx
<Divider dashed />
<Divider dashed label="虚线带文字" />
<Row>
  <span>左</span>
  <Divider direction="vertical" dashed />
  <span>右</span>
</Row>
```

### 垂直分隔

```tsx
<Divider direction="vertical" />
```

## API

**Divider**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| direction | `"horizontal" | "vertical"` | `"horizontal"` | 方向 |
| label | `ReactNode` | — | 中部文字 |
| orientation | `"left" | "center" | "right"` | `"center"` | 文字位置(仅水平) |
| dashed | `boolean` | `false` | 虚线样式 |
| sunken | `boolean` | `false` | 凹陷凹槽样式 |


---
[← 回到索引](../llms.md)
