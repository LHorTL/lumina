# Typography 排版

> 标题、段落、文本、链接一体化排版组件,支持语义色、修饰、复制、编辑、省略。

## 导入

```tsx
import { Typography } from "@fangxinyan/lumina";
```

## 示例

### 基础组合

```tsx
<Typography>
  <Typography.Title level={2}>Lumina 排版</Typography.Title>
  <Typography.Paragraph>...</Typography.Paragraph>
  <Typography.Text type="secondary">次要文字</Typography.Text>
  <Typography.Link href="..." external>外部链接</Typography.Link>
</Typography>
```

### 标题层级

```tsx
<Typography.Title level={1..5}>...</Typography.Title>
```

### 语义色

```tsx
<Typography.Text type="success">...</Typography.Text>
```

### 文字修饰

```tsx
<Typography.Text strong>...</Typography.Text>
```

### 可复制

点击右侧图标复制文本，自动切成 ✓ 状态并 2.4 秒后复位。

```tsx
<Typography.Text copyable>...</Typography.Text>
```

### 可编辑

点击图标或文本进入编辑状态，Enter 保存、Esc 取消。

```tsx
<Typography.Text editable={{ onChange, triggerType: ["icon", "text"] }}>{value}</Typography.Text>
```

### 省略截断

多行截断并支持「展开」。

```tsx
<Typography.Paragraph ellipsis={{ rows: 2, expandable: true }}>{long}</Typography.Paragraph>
```

### 链接

```tsx
<Typography.Link href="..." external>...</Typography.Link>
```

## API

**Typography.Title**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| level | `1 | 2 | 3 | 4 | 5` | `1` | 标题级别 |


**通用 Props (Title / Text / Paragraph / Link)**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| type | `"secondary" | "success" | "warning" | "danger"` | — | 语义色 |
| disabled | `boolean` | `false` | 禁用态 |
| mark / code / keyboard / underline / delete / strong / italic | `boolean` | `false` | 文字修饰 |
| copyable | `boolean | CopyableConfig` | — | 显示复制按钮 |
| editable | `boolean | EditableConfig` | — | 显示编辑按钮 |
| ellipsis | `boolean | EllipsisConfig` | — | 截断省略 |


**Typography.Link**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| href | `string` | — | 链接地址 |
| target / rel | `string` | — | 原生锚点属性 |
| external | `boolean` | `false` | 追加外链箭头 |


---
[← 回到索引](../llms.md)
