# ContextMenu 右键菜单

> 桌面应用风格的右键上下文菜单。

## 导入

```tsx
import { ContextMenu } from "@fangxinyan/lumina";
```

## 示例

### 基础

方向键、Home / End、Enter 提供完整键盘导航；Esc 会关闭并把焦点归还给打开前的控件，Tab 会退出并关闭菜单。

```tsx
<ContextMenu items={[
  { key: "copy", label: "复制", shortcut: "⌘C", onSelect: () => {} },
  { key: "cut",  label: "剪切", shortcut: "⌘X", onSelect: () => {} },
  { key: "d",    type: "divider" },
  { key: "del",  label: "删除", danger: true, onSelect: () => {} },
]}>
  <div>右键点击我</div>
</ContextMenu>
```

### 文件管理器示例

典型的文件右键菜单,带图标、快捷键、分组分隔、危险操作高亮。

```tsx
<ContextMenu items={[...]}>...
```

### 禁用自定义菜单

disabled 会立即关闭已打开的菜单，之后不再拦截 contextmenu，浏览器原生菜单恢复可用。

```tsx
<ContextMenu disabled items={items}>
  <div>这里使用浏览器原生右键菜单</div>
</ContextMenu>
```

## API

**ContextMenu**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| items \* | `ContextMenuItem[]` | — | 菜单项 |
| children \* | `ReactNode` | — | 任意触发内容；内部 display: contents 包装不改变布局 |
| disabled | `boolean` | `false` | 禁用并关闭当前菜单，恢复浏览器原生菜单 |
| minWidth | `number` | `180` | 面板最小宽度 |


**ContextMenuItem**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| key \* | `string` | — | 唯一键 |
| label | `ReactNode` | — | 文案 |
| icon | `ReactNode` | — | 前置图标 |
| shortcut | `ReactNode` | — | 右侧快捷键提示 |
| disabled | `boolean` | — | 禁用 |
| danger | `boolean` | — | 危险态(红色) |
| type | `"divider"` | — | 置为 "divider" 渲染分隔线 |
| onSelect | `() => void` | — | 选中回调 |


---
[← 回到索引](../llms.md)
