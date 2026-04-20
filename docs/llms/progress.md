# Progress 进度

> 条形进度 Progress 与环形进度 Ring。

## 导入

```tsx
import { Progress, Ring } from "@fangxinyan/lumina";
```

## 示例

### 条形进度

```tsx
<Progress value={v} label="下载中" showValue />
```

### 尺寸

```tsx
<Progress size="sm" value={60} />
<Progress value={60} />
<Progress size="lg" value={60} />
```

### 环形进度

```tsx
<Ring value={65} />
<Ring value={90} tone="success" size={80}><strong>90%</strong></Ring>
```

## API

**Progress**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| value \* | `number` | — | 0–max 之间 |
| max | `number` | `100` | 最大值 |
| tone | `"accent" | "success" | "warning" | "danger"` | `"accent"` | 色调 |
| size | `"sm" | "md" | "lg"` | `"md"` | 尺寸 |
| label | `ReactNode` | — | 顶部文案 |
| showValue | `boolean` | `false` | 显示百分比 |


**Ring**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| value \* | `number` | — | 0–100 |
| size | `number` | `72` | 直径 (px) |
| tone | `"accent" | "success" | ...` | `"accent"` | 色调 |


---
[← 回到索引](../llms.md)
