# Icon 图标

> 线性图标集,继承当前文字颜色,可调整尺寸与描边。

## 导入

```tsx
import { Icon } from "@fangxinyan/lumina";
```

## 示例

### 基础用法

通过 name 指定图标,size 控制尺寸,stroke 控制描边粗细。

```tsx
<Icon name="search" size={16} />
<Icon name="heart" size={20} stroke={1.5} />
```

## API

**Icon**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| name \* | `IconName` | — | 图标名 |
| size | `number` | `16` | 尺寸 (px) |
| stroke | `number` | `2` | 描边粗细 |


---
[← 回到索引](../llms.md)
