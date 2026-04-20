# TitleBar 标题栏

> Electron 应用窗口顶部的跨平台标题栏。

## 导入

```tsx
import { TitleBar } from "@fangxinyan/lumina";
```

## 示例

### macOS 风格

```tsx
<TitleBar platform="mac" title="无标题文档" actions={<>...</>} />
```

### Windows 风格

```tsx
<TitleBar platform="windows" title="..." actions={...} />
```

## API

**TitleBar**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| title | `ReactNode` | — | 标题 |
| platform | `"mac" | "windows"` | `"mac"` | 平台风格 |
| actions | `ReactNode` | — | 右侧操作区 |
| center | `ReactNode` | — | 中部内容 |
| draggable | `boolean` | `true` | 整条作为拖拽区 |
| onMinimize / onMaximize / onClose | `() => void` | — | 窗口控件回调 |


---
[← 回到索引](../llms.md)
