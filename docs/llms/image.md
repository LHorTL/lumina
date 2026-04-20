# Image 图片

> 凹陷外框包裹的图片容器,带预览、错误占位。

## 导入

```tsx
import { Image, ImageGrid } from "@fangxinyan/lumina";
```

## 示例

### 基础

```tsx
<Image src={url} width={240} height={160} />
```

### 图片组

```tsx
<ImageGrid images={images} />
```

## API

**Image**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| src | `string` | — | 图片 URL |
| width / height | `number | string` | — | 尺寸 |
| preview | `boolean` | `true` | 支持点击全屏预览 |
| hover | `boolean` | `true` | 悬浮放大 |
| placeholder | `ReactNode` | — | 占位/错误时内容 |


---
[← 回到索引](../llms.md)
