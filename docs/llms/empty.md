# Empty 空状态

> 列表、页面或容器无数据时的占位。

## 导入

```tsx
import { Empty } from "@fangxinyan/lumina";
```

## 示例

### 基础

```tsx
<Empty title="暂无项目" description="创建一个开始吧" action={<Button>新建</Button>} />
```

### Subtle 变体

去掉凹陷图标框,用于嵌入已有卡片/对话框中。

```tsx
<Empty variant="subtle" icon={<Icon name="search" size={28} />} title="未找到结果" />
```

### 尺寸

sm 适合列表内嵌,md 是默认,lg 用作整页占位。

```tsx
<Empty size="sm" title="暂无数据" />
<Empty size="md" title="暂无数据" />
<Empty size="lg" title="暂无数据" />
```

## API

**Empty**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| title | `ReactNode` | `"暂无内容"` | 标题 |
| description | `ReactNode` | — | 描述 |
| icon | `ReactNode` | — | 图标 |
| action | `ReactNode` | — | 底部操作 |
| size | `"sm" | "md" | "lg"` | `"md"` | 尺寸 |
| variant | `"default" | "subtle"` | `"default"` | 样式 |


---
[← 回到索引](../llms.md)
