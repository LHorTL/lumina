# Spin 加载

> 表示任务正在进行,提示用户等待。

## 导入

```tsx
import { Spin } from "@fangxinyan/lumina";
```

## 示例

### 基础

```tsx
<Spin />
<Spin size="large" />
<Spin size={40} />
```

### 色调

```tsx
<Spin tone="accent" />
<Spin tone="success" />
<Spin tone="warning" />
<Spin tone="danger" />
```

### Dots 变体

```tsx
<Spin variant="dots" />
<Spin variant="dots" size={24} />
<Spin variant="dots" size={32} />
```

### 带文案

```tsx
<Spin tip="加载中…" />
<Spin variant="dots" tone="accent" tip="正在同步" />
```

## API

**Spin**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| size | `"small" | "default" | "large" | number` | `"default"` | 尺寸 |
| tone | `"accent" | "success" | "warning" | "danger" | "current"` | `"accent"` | 色调 |
| variant | `"ring" | "dots"` | `"ring"` | 样式 |
| tip / label | `ReactNode` | — | 文案 |
| spinning | `boolean` | `true` | 是否显示加载指示器 |


---
[← 回到索引](../llms.md)
