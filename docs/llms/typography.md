# Typography 排版

> 标题、段落、文本、链接一体化排版组件,支持语义色、修饰、复制、编辑、省略。

## 导入

```tsx
import { Typography, Title, Text, Paragraph, Link } from "@fangxinyan/lumina";
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

点击图标或文本进入编辑状态，Enter 或确认按钮保存，Esc 或失焦取消。

```tsx
<Typography.Text editable={{ onChange, triggerType: ["icon", "text"], enterIcon: <Icon name="check" /> }}>{value}</Typography.Text>
```

### 省略截断

多行截断支持「展开」，悬停时可查看完整内容；suffix 会始终保留在裁切区域外。

```tsx
<Typography.Paragraph ellipsis={{ rows: 2, expandable: true, tooltip: true }}>{long}</Typography.Paragraph>
<Typography.Text ellipsis={{ suffix: "— Lumina" }}>{long}</Typography.Text>
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
| id / data-* / aria-* / 原生事件 | `native attrs` | — | 透传到实际标题、文本、段落或链接根节点 |


**EditableConfig**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| editing | `boolean` | — | 受控编辑状态 |
| text | `string` | — | 编辑器受控文本来源 |
| triggerType | `Array<"icon" | "text">` | `["icon"]` | 进入编辑态的触发方式 |
| enterIcon | `ReactNode` | `check icon` | 单行编辑器的确认按钮内容；传 null 隐藏 |
| onChange / onCancel / onStart / onEnd | `function` | — | 编辑生命周期回调 |


**EllipsisConfig**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| rows | `number` | `1` | 截断行数 |
| expandable | `boolean` | `false` | 显示展开入口 |
| tooltip | `boolean | ReactNode` | `false` | 悬停显示完整内容 |
| symbol | `ReactNode` | `"展开"` | 自定义展开文案 |
| suffix | `string` | — | 追加到截断文本末尾的后缀 |


**CopyableConfig**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| text | `string` | — | 覆盖复制文本 |
| format | `"text/plain" | "text/html"` | `"text/plain"` | 剪贴板文本格式 |
| onCopy | `(event) => void` | — | 浏览器确认复制成功后触发 |
| onCopyError | `(error) => void` | — | 复制失败时触发 |


**Typography.Link**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| href | `string` | — | 链接地址 |
| target / rel | `string` | — | 原生锚点属性 |
| external | `boolean` | `false` | 追加外链箭头 |


---
[← 回到索引](../llms.md)
