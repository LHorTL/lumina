# Skeleton 骨架屏

> 数据加载前展示页面结构轮廓。

## 导入

```tsx
import { Skeleton } from "@fangxinyan/lumina";
```

## 示例

### 基础

```tsx
<Skeleton height={16} width="40%" />
<Skeleton height={12} />
<Skeleton height={12} width="80%" />
```

### 手动组合:头像 + 文本

使用原语 Skeleton 手动拼装 — 更灵活但需要自己写布局。

```tsx
<Skeleton circle height={48} width={48} />
<Skeleton height={12} width="50%" />
```

### 组合模式 (avatar + title + paragraph)

设置 avatar / title / paragraph 任一即切换到组合模式,自动拼装布局。

```tsx
<Skeleton avatar title paragraph />
```

### 组合:自定义头像形状、段落行数

```tsx
<Skeleton
  avatar={{ shape: "square", size: "lg" }}
  title={{ width: "30%" }}
  paragraph={{ rows: 4, width: ["100%", "90%", "70%", "40%"] }}
/>
```

### 组合:仅 title + paragraph

关闭 avatar 只渲染标题与段落,其余布局自动调整。

```tsx
<Skeleton title paragraph={{ rows: 2 }} />
```

### 动画

wave 是闪光流动,pulse 是透明度脉动,none 是静态占位。

```tsx
<Skeleton animation="wave" />
<Skeleton animation="pulse" />
<Skeleton animation="none" />
```

## API

**Skeleton (原语模式)**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| width | `number | string` | `"100%"` | 宽度 |
| height | `number | string` | `16` | 高度 |
| circle | `boolean` | `false` | 圆形 |
| animation | `"wave" | "pulse" | "none"` | `"wave"` | 动画 |


**Skeleton (组合模式)**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| avatar | `boolean | { shape?: "circle" | "square"; size?: "sm" | "md" | "lg" }` | `false` | 左侧头像骨架。为对象时可定制 shape / size |
| title | `boolean | { width?: number | string }` | `true (composite)` | 标题行骨架。组合模式下默认 true |
| paragraph | `boolean | { rows?: number; width?: (number | string)[] }` | `{ rows: 3 }` | 段落行骨架。可指定 rows 与每行宽度(最后一行默认 60%) |


---
[← 回到索引](../llms.md)
