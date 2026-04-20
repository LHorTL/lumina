# Avatar 头像

> 用图像、首字母代表用户或事物。

## 导入

```tsx
import { Avatar } from "@fangxinyan/lumina";
```

## 示例

### 基础

通过 alt 自动生成首字母。

```tsx
<Avatar alt="金伟" />
<Avatar alt="陆" size="lg" />
```

### 方形头像

shape="square" 使用圆角方形,尺寸变化时圆角跟随变化。

```tsx
<Avatar alt="金" shape="square" />
<Avatar alt="陆" shape="square" size="lg" />
```

### 状态

在右下角显示状态点。

```tsx
<Avatar alt="金" status="online" />
<Avatar alt="陆" status="busy" />
```

## API

**Avatar**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| src | `string` | — | 图片 URL |
| alt | `string` | — | 替代文本/首字母来源 |
| initials | `string` | — | 自定义首字母 |
| size | `number | "sm" | "md" | "lg" | "xl"` | `"md"` | 尺寸 |
| shape | `"circle" | "square"` | `"circle"` | 形状 |
| status | `"online" | "busy" | "away" | "offline"` | — | 状态点 |


---
[← 回到索引](../llms.md)
