# CommandPalette ⌘K 命令面板

> 全局命令搜索与执行入口。

## 示例

### 基础 + 快捷键

在当前页面按 ⌘K / Ctrl+K 打开。分组、快捷键提示、键盘导航都已内置。

```tsx
const [open, setOpen] = useState(false);
useEffect(() => {
  const h = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setOpen(o => !o);
    }
  };
  window.addEventListener("keydown", h);
  return () => window.removeEventListener("keydown", h);
}, []);

<CommandPalette open={open} onOpenChange={setOpen} items={[...]} />
```

## API

**CommandPalette**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| open / onOpenChange \* | `boolean / (open: boolean) => void` | — | 受控开关 |
| items \* | `CommandItem[]` | — | 所有命令项 |
| placeholder | `string` | `"搜索命令…"` | 搜索框占位文本 |
| filter | `(item, query) => boolean` | `子序列匹配` | 自定义过滤函数 |
| emptyText | `ReactNode` | — | 无结果占位 |
| resetOnOpen | `boolean` | `true` | 打开时清空输入 |
| footer | `ReactNode` | — | 底部区;null 隐藏 |


**CommandItem**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| key \* | `string` | — | 唯一键 |
| label \* | `string` | — | 主文案(也参与搜索) |
| description | `ReactNode` | — | 副标题 |
| icon | `ReactNode` | — | 前置图标 |
| shortcut | `ReactNode` | — | 右侧快捷键 |
| keywords | `string[]` | — | 额外搜索关键词 |
| group | `string` | — | 分组标题 |
| disabled | `boolean` | — | 禁用 |
| onSelect | `() => void` | — | 选中回调(会自动关闭面板) |


---
[← 回到索引](../llms.md)
