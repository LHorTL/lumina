# Badge 徽标数

> 右上角的小型计数或状态指示器。

## 导入

```tsx
import { Badge } from "@fangxinyan/lumina";
```

## 示例

### 数字徽标

```tsx
<Badge count={3}><IconButton icon="bell" /></Badge>
<Badge count={128} max={99}><IconButton icon="mail" /></Badge>
```

### 圆点

dot 模式不显示数字,只是状态指示。

```tsx
<Badge dot><IconButton icon="user" /></Badge>
```

## API

**Badge**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| count | `number` | — | 显示数字 |
| dot | `boolean` | `false` | 圆点模式 |
| max | `number` | `99` | 超过显示 max+ |
| tone | `"neutral" | "accent" | ...` | `"danger"` | 色调 |


---
[← 回到索引](../llms.md)
