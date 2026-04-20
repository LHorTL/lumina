# Alert 警告提示

> 页面中嵌入的警告/提示。

## 导入

```tsx
import { Alert } from "@fangxinyan/lumina";
```

## 示例

### 四种语义

```tsx
<Alert tone="info" title="标题">内容</Alert>
```

### 无标题 / 可关闭

```tsx
<Alert tone="info" closable>仅一行的简短提示</Alert>
```

### 隐藏图标

showIcon={false} 可隐藏左侧语义图标,文本更紧凑。

```tsx
<Alert tone="info" showIcon={false}>纯文本提示</Alert>
```

### 自定义操作区

action 插槽可以放置按钮等操作元素,位于内容与关闭按钮之间。

```tsx
<Alert
  tone="warning"
  title="新版本可用"
  action={<Button size="sm" variant="primary">立即更新</Button>}
  closable
>
  v1.2.0 已发布。
</Alert>
```

## API

**Alert**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| tone | `"info" | "success" | "warning" | "danger"` | `"info"` | 语气 |
| title | `ReactNode` | — | 标题 |
| icon | `IconName` | — | 自定义图标 |
| showIcon | `boolean` | `true` | 是否显示语义图标 |
| action | `ReactNode` | — | 右侧操作区(如按钮) |
| closable | `boolean` | `false` | 可关闭 |
| onClose | `() => void` | — | 关闭回调 |


---
[← 回到索引](../llms.md)
