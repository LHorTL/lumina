# List 列表

> 承载一组结构化的同质化数据。

## 导入

```tsx
import { List } from "@fangxinyan/lumina";
```

## 示例

### 基础列表

```tsx
<List items={[{ key, title, description, avatar, actions }]} />
```

## API

**List**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| items \* | `ListItem[]` | — | 数据列表 |
| dividers | `boolean` | `true` | 项之间显示分隔线 |


**ListItem**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| key \* | `string` | — | 唯一键 |
| title / description | `ReactNode` | — | 标题/描述 |
| avatar | `ReactNode` | — | 前置图标或头像 |
| actions | `ReactNode` | — | 右侧操作区 |
| onClick | `() => void` | — | 点击回调 |


---
[← 回到索引](../llms.md)
