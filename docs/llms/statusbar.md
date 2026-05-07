# StatusBar 状态栏

> 窗口底部状态栏,展示分支、编码、行列等应用元信息。

## 导入

```tsx
import { StatusBar, StatusBarItem } from "@fangxinyan/lumina";
```

## 示例

### 基础

```tsx
<StatusBar
  left={<StatusBar.Item icon={<Icon name="check" size={12} />} tone="success">Ready</StatusBar.Item>}
  right={<StatusBar.Item tone="muted">UTF-8</StatusBar.Item>}
/>
```

### 可点击项

为 Item 提供 onClick 会渲染成按钮,支持悬停高亮。

```tsx
<StatusBar.Item onClick={...}>TypeScript</StatusBar.Item>
```

### 语义色

tone 控制文字颜色:default / muted / accent / success / warning / danger。

```tsx
<StatusBar.Item tone="danger">3 errors</StatusBar.Item>
```

## API

**StatusBar**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| left | `ReactNode` | — | 左侧槽位 |
| center | `ReactNode` | — | 中部槽位(绝对居中) |
| right | `ReactNode` | — | 右侧槽位 |


**StatusBar.Item**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| icon | `ReactNode` | — | 前置图标 |
| tone | `"default" | "muted" | "accent" | "success" | "warning" | "danger"` | `"default"` | 语义色 |
| onClick | `(e) => void` | — | 点击回调(提供时渲染为 button) |


---
[← 回到索引](../llms.md)
