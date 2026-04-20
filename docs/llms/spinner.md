# Spinner 加载

> 表示任务正在进行,提示用户等待。

## 导入

```tsx
import { Spinner } from "@fangxinyan/lumina";
```

## 示例

### 基础

```tsx
<Spinner />
<Spinner size={28} />
<Spinner size={40} />
```

### 色调

```tsx
<Spinner tone="accent" />
<Spinner tone="success" />
<Spinner tone="warning" />
<Spinner tone="danger" />
```

### Dots 变体

```tsx
<Spinner variant="dots" />
<Spinner variant="dots" size={24} />
<Spinner variant="dots" size={32} />
```

### 带文案

```tsx
<Spinner label="加载中…" />
<Spinner variant="dots" tone="accent" label="正在同步" />
```

## API

**Spinner**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| size | `number` | `20` | 尺寸 (px) |
| tone | `"accent" | "success" | "warning" | "danger" | "current"` | `"accent"` | 色调 |
| variant | `"ring" | "dots"` | `"ring"` | 样式 |
| label | `ReactNode` | — | 文案 |


---
[← 回到索引](../llms.md)
