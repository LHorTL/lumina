# Image 图片

> 凹陷外框包裹的图片容器,带预览、错误占位。

## 导入

```tsx
import { Image, ImageGrid, SpriteImage, LayeredImage } from "@fangxinyan/lumina";
```

## 示例

### 基础

```tsx
<Image src={url} width={240} height={160} />
```

### 图标 / 原始资源

variant="icon" 会默认去掉外层 padding,适合 1:1 装备、物品、头像缩略图；variant="raw" 保留原始图片比例。

```tsx
<Image variant="icon" src={iconUrl} width={56} height={56} preview={false} />
<Image variant="raw" src={bannerUrl} width={220} height={84} objectFit="contain" />
```

### Sprite 裁剪

SpriteImage 用 background-position 裁剪同一张雪碧图,适合 url + x/y/width/height 形式的图标资源。

```tsx
<SpriteImage src={sheetUrl} sprite={{ x: 32, y: 0, width: 32, height: 32 }} />
```

### 多图层图片

LayeredImage 将多张图片叠在同一个盒子里,适合头像 + 头像框、底图 + 标记等资产。

```tsx
<LayeredImage
  width={72}
  height={72}
  layers={[
    { src: headUrl, fit: "cover" },
    { src: frameUrl },
  ]}
/>
```

### 图片组

```tsx
<ImageGrid images={images} />
<ImageGrid images={icons} imageProps={{ variant: "icon", preview: false }} />
```

## API

**Image**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| src | `string` | — | 图片 URL |
| width / height | `number | string` | — | 尺寸 |
| variant | `"framed" | "raw" | "icon"` | `"framed"` | 视觉形态 |
| frame | `boolean` | `framed 时 true` | 是否保留内层凹陷 frame |
| padding | `number | string` | — | 外层留白,raw/icon 默认 0 |
| objectFit / objectPosition | `CSSProperties` | — | 底层 img 的 object-fit / object-position |
| preview | `boolean` | `true` | 支持点击全屏预览 |
| hover | `boolean` | `true` | 悬浮放大 |
| placeholder | `ReactNode` | — | 占位/错误时内容 |
| imgProps | `ImgHTMLAttributes` | — | 透传到底层 img 的属性 |


**ImageGrid**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| images \* | `ImageGridItem[]` | — | 图片项数组,单项也可覆盖 Image props |
| columns | `number` | — | 固定列数,不传则自动填充 |
| itemHeight | `number` | `130` | 默认图片高度 |
| minItemWidth | `number | string` | `160` | 自动填充时的最小列宽 |
| gap | `number | string` | `14` | 网格间距 |
| imageProps | `ImageProps` | — | 批量传给每个 Image 的属性 |


**SpriteImage**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| src \* | `string` | — | sprite sheet 图片 URL |
| sprite \* | `{ x; y; width; height }` | — | 裁剪区域 |
| width / height | `number | string` | — | 渲染尺寸,默认使用 sprite 尺寸 |
| scale | `number` | `1` | 未指定 width/height 时的缩放倍数 |
| backgroundSize | `string` | — | 自定义 background-size |
| variant / frame / padding | `ImageVariant / boolean / number` | — | 同 Image 的媒体外观控制 |


**LayeredImage**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| layers \* | `LayeredImageLayer[]` | — | 按顺序叠放的图片层 |
| width / height | `number | string` | — | 容器尺寸 |
| variant / frame / padding | `ImageVariant / boolean / number` | — | 同 Image 的媒体外观控制 |


---
[← 回到索引](../llms.md)
