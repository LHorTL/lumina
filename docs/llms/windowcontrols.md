# WindowControls 窗口控件

> 独立的窗口控件按钮组。

## 导入

```tsx
import { WindowControls } from "@fangxinyan/lumina";
```

## 示例

### 平台与回调

点击窗口按钮可观察回调；最大化按钮会在最大化与还原图标间切换。

```tsx
<WindowControls
  platform="windows"
  maximized={maximized}
  onMinimize={handleMinimize}
  onMaximize={handleMaximize}
  onClose={handleClose}
/>
```

## API

**WindowControls**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| platform | `"mac" | "windows"` | `"mac"` | 平台 |
| onMinimize / onMaximize / onClose | `() => void` | — | 回调 |
| maximized | `boolean` | `false` | 显示还原状态 |


---
[← 回到索引](../llms.md)
