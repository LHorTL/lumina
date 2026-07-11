# Icon 图标

> 线性图标集,继承当前文字颜色,可调整尺寸与描边。

## 导入

```tsx
import { Icon, DeleteOutlined, LoadingOutlined, StarFilled, ICON_NAMES } from "@fangxinyan/lumina";
```

## 示例

### 基础用法

通过 name 指定图标,size 控制尺寸,stroke 控制描边粗细。

```tsx
<Icon name="search" size={16} />
<Icon name="heart" size={20} stroke={1.5} />
```

### 命名图标组件

Outlined / Filled 命名组件与 Icon 共用同一入口，也支持对应名称的包子路径。

```tsx
import { DeleteOutlined } from "@fangxinyan/lumina/DeleteOutlined";
import { LoadingOutlined } from "@fangxinyan/lumina/LoadingOutlined";
import { StarFilled } from "@fangxinyan/lumina/StarFilled";

<DeleteOutlined aria-label="删除" />
<LoadingOutlined aria-label="加载中" />
<StarFilled aria-label="收藏" />
```

## API

**Icon**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| name \* | `IconName` | — | 图标名 |
| size | `number` | `16` | 尺寸 (px) |
| stroke | `number` | `2` | 描边粗细 |
| title | `string` | — | 语义图标的可访问标题；省略时默认作为装饰图标 |


**NamedIconProps**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| size | `number | string` | `"1em"` | 尺寸 |
| spin | `boolean` | — | 旋转动画 |
| rotate | `number` | — | 静态旋转角度 |


---
[← 回到索引](../llms.md)
