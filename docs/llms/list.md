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

### 可点击与无分隔线

提供 onClick 时整行获得按钮语义；dividers={false} 适合更轻量的操作列表。

```tsx
<List
  dividers={false}
  items={[{ title: "下载构建产物", onClick: handleClick }]}
/>
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
