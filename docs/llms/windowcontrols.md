# WindowControls 窗口控件

> 独立的窗口控件按钮组。

## 导入

```tsx
import { WindowControls } from "@fangxinyan/lumina";
```

## 示例

### 两种平台

```tsx
<WindowControls platform="mac" />
<WindowControls platform="windows" />
```

## API

**WindowControls**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| platform | `"mac" | "windows"` | `"mac"` | 平台 |
| onMinimize / onMaximize / onClose | `() => void` | — | 回调 |


---
[← 回到索引](../llms.md)
