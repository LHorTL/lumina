# Progress 进度

> 条形进度 Progress。

## 导入

```tsx
import { Progress } from "@fangxinyan/lumina";
```

## 示例

### 条形进度

```tsx
<Progress value={v} label="下载中" showValue />
```

### 自定义颜色

```tsx
<Progress value={66} color="oklch(72% 0.18 285)" label="品牌同步" showValue />
<Progress value={38} color="#22c1c3" label="音频缓冲" showValue />
```

### 尺寸

```tsx
<Progress size="sm" value={60} />
<Progress value={60} />
<Progress size="lg" value={60} />
```

## API

**Progress**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| value \* | `number` | — | 0–max 之间 |
| max | `number` | `100` | 最大值 |
| tone | `"accent" | "success" | "warning" | "danger"` | `"accent"` | 色调 |
| color | `string` | — | 自定义填充色,覆盖 tone |
| size | `"sm" | "md" | "lg"` | `"md"` | 尺寸 |
| label | `ReactNode` | — | 顶部文案 |
| showValue | `boolean` | `false` | 显示百分比 |


---
[← 回到索引](../llms.md)
