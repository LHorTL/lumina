# ContextMenu 右键菜单

> 桌面应用风格的右键上下文菜单。

## 示例

### 基础

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

## API

**ContextMenu**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| items \* | `ContextMenuItem[]` | — | 菜单项 |
| children \* | `ReactElement` | — | 触发元素(恰好一个) |
| disabled | `boolean` | — | 禁用,恢复浏览器原生菜单 |
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
