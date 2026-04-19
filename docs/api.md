# API 参考 API Reference

> 所有组件均从 `lumina` 主入口导出。类型定义随包一起发布。

```tsx
import { Button, Input, Modal, toast } from "lumina";
```

---

## Button

按钮。

```tsx
<Button variant="primary" icon="plus" onClick={...}>新建</Button>
```

| Prop | 类型 | 默认 | 说明 |
|---|---|---|---|
| `variant` | `"default" \| "primary" \| "ghost" \| "danger"` | `"default"` | 视觉变体 |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | 尺寸 |
| `icon` | `IconName` | — | 前置图标 |
| `trailingIcon` | `IconName` | — | 后置图标 |
| `loading` | `boolean` | `false` | 加载中（禁用交互 + 显示 spinner） |
| `disabled` | `boolean` | `false` | 禁用 |
| `type` | `"button" \| "submit" \| "reset"` | `"button"` | 表单类型 |

继承 `React.ButtonHTMLAttributes<HTMLButtonElement>`。

## IconButton

方形图标按钮。

| Prop | 类型 | 说明 |
|---|---|---|
| `icon` | `IconName` | **必填**，图标名 |
| `tip` | `string` | Tooltip 文本（也用作 aria-label） |

其余 props 同 `Button`。

## Icon

```tsx
<Icon name="plus" size={18} />
```

| Prop | 类型 | 默认 | 说明 |
|---|---|---|---|
| `name` | `IconName` | — | 图标名，共 49 个 |
| `size` | `number` | `16` | 像素尺寸 |
| `stroke` | `number` | `2` | 描边宽度 |

支持的 `IconName`：`search`, `plus`, `minus`, `check`, `x`, `chevDown/Right/Left/Up`, `arrowRight`, `settings`, `user`, `bell`, `mail`, `heart`, `star`, `home`, `folder`, `file`, `image`, `play`, `pause`, `volume`, `trash`, `edit`, `copy`, `download`, `upload`, `info`, `alert`, `check2`, `eye`, `eyeOff`, `sparkle`, `moon`, `sun`, `palette`, `layers`, `grid`, `list`, `zap`, `filter`, `mic`, `send`, `calendar`, `clock`, `menu`, `more`, `sliders`.

---

## Input

| Prop | 类型 | 说明 |
|---|---|---|
| `value` / `defaultValue` | `string` | 受控 / 非受控值 |
| `onChange` | `(value, event) => void` | 值变化回调，第一个参数是新字符串 |
| `leadingIcon` / `trailingIcon` | `IconName` | 前/后置图标 |
| `size` | `"sm" \| "md" \| "lg"` | 尺寸 |
| `invalid` | `boolean` | 校验错误态 |

## Textarea

同 `Input`，无图标 prop。

---

## Switch

| Prop | 类型 | 说明 |
|---|---|---|
| `checked` / `defaultChecked` | `boolean` | 受控 / 非受控 |
| `onChange` | `(checked) => void` | 切换回调 |
| `label` | `ReactNode` | 右侧文本 |
| `size` | `"sm" \| "md"` | 尺寸 |

## Checkbox

| Prop | 类型 | 说明 |
|---|---|---|
| `checked` / `defaultChecked` | `boolean` | 受控 / 非受控 |
| `indeterminate` | `boolean` | 半选状态 |
| `onChange` | `(checked) => void` | 切换回调 |
| `label` | `ReactNode` | 右侧文本 |

## RadioGroup

```tsx
<RadioGroup
  options={[{ value: "a", label: "选项 A" }, ...]}
  value={v} onChange={setV}
/>
```

| Prop | 类型 | 说明 |
|---|---|---|
| `options` | `RadioOption<T>[]` | 选项数组 |
| `value` / `defaultValue` | `T` | 受控 / 非受控 |
| `onChange` | `(value) => void` | 选中变化 |
| `direction` | `"vertical" \| "horizontal"` | 方向 |

## Select

```tsx
<Select options={[{ value: "cn", label: "中国" }, ...]} />
```

| Prop | 类型 | 说明 |
|---|---|---|
| `options` | `SelectOption<T>[]` | 选项 |
| `value` / `defaultValue` | `T` | 受控 / 非受控 |
| `onChange` | `(value) => void` | 选中变化 |
| `placeholder` | `string` | 占位符 |
| `size` | `"sm" \| "md" \| "lg"` | 尺寸 |

## Slider

| Prop | 类型 | 说明 |
|---|---|---|
| `value` / `defaultValue` | `number` | 值 |
| `onChange` | `(value) => void` | 回调 |
| `min` / `max` / `step` | `number` | 范围 / 步长 |
| `showValue` | `boolean` | 显示数值 |
| `tone` | `"accent" \| "success" \| "warning" \| "danger"` | 填充色 |

## Segmented

```tsx
<Segmented options={[{ value: "day", label: "日" }, ...]} />
```

同 `RadioGroup` 的 props 形态。

---

## Tabs

```tsx
<Tabs items={[{ key: "1", label: "概览", content: <Overview /> }, ...]} />
```

| Prop | 类型 | 说明 |
|---|---|---|
| `items` | `TabItem[]` | `{ key, label, content?, disabled? }` |
| `activeKey` / `defaultActiveKey` | `string` | 受控 / 非受控 |
| `onChange` | `(key) => void` | 切换回调 |
| `variant` | `"line" \| "pill" \| "segmented"` | 样式 |

## Accordion

| Prop | 类型 | 说明 |
|---|---|---|
| `items` | `AccordionItem[]` | `{ key, title, content, disabled? }` |
| `multiple` | `boolean` | 是否允许多项同时展开 |
| `activeKeys` / `defaultActiveKeys` | `string[]` | 展开项 |
| `onChange` | `(keys) => void` | 展开变化 |

## Pagination

| Prop | 类型 | 说明 |
|---|---|---|
| `total` | `number` | 总条数 |
| `pageSize` | `number` | 每页条数，默认 10 |
| `page` / `defaultPage` | `number` | 当前页（1-based） |
| `onChange` | `(page) => void` | 翻页回调 |

---

## Card

| Prop | 类型 | 说明 |
|---|---|---|
| `variant` | `"raised" \| "sunken" \| "flat"` | 视觉变体 |
| `padding` | `"none" \| "sm" \| "md" \| "lg"` | 内边距 |

## Panel

带标题的 Card。

| Prop | 类型 | 说明 |
|---|---|---|
| `title` | `ReactNode` | 标题 |
| `description` | `ReactNode` | 副标题 |
| `actions` | `ReactNode` | 右侧操作 |

## Divider

| Prop | 类型 | 说明 |
|---|---|---|
| `direction` | `"horizontal" \| "vertical"` | 方向 |
| `label` | `ReactNode` | 中间文本 |
| `sunken` | `boolean` | 凹陷样式 |

---

## Modal

```tsx
<Modal open={open} onClose={close} title="确认" description="...">
  内容
</Modal>
```

| Prop | 类型 | 说明 |
|---|---|---|
| `open` | `boolean` | 是否显示 |
| `onClose` | `() => void` | 关闭回调 |
| `title` / `description` | `ReactNode` | 头部 |
| `footer` | `ReactNode` | 自定义底部（不传时默认：取消 / 确定） |
| `width` | `number \| string` | 宽度 |
| `maskClosable` | `boolean` | 点击遮罩关闭，默认 true |
| `escClosable` | `boolean` | Esc 关闭，默认 true |

## Drawer

| Prop | 类型 | 说明 |
|---|---|---|
| `placement` | `"left" \| "right" \| "top" \| "bottom"` | 方向 |
| `size` | `number \| string` | 宽/高 |

其余同 `Modal`。

## Tooltip

```tsx
<Tooltip content="提示"><Button>...</Button></Tooltip>
```

| Prop | 类型 | 说明 |
|---|---|---|
| `content` | `ReactNode` | 气泡内容 |
| `placement` | `"top" \| "bottom" \| "left" \| "right"` | 方向 |
| `delay` | `number` | 显示延迟 (ms) |
| `disabled` | `boolean` | 禁用 |

## Popover

同 `Tooltip`，外加：
| Prop | 类型 | 说明 |
|---|---|---|
| `trigger` | `"click" \| "hover"` | 触发方式 |
| `open` / `defaultOpen` | `boolean` | 受控 / 非受控 |
| `onOpenChange` | `(open) => void` | 开关变化 |

## Alert

| Prop | 类型 | 说明 |
|---|---|---|
| `tone` | `"info" \| "success" \| "warning" \| "danger"` | 语气 |
| `title` | `ReactNode` | 标题 |
| `icon` | `IconName` | 自定义图标 |
| `closable` | `boolean` | 显示关闭按钮 |
| `onClose` | `() => void` | 关闭回调 |

## toast

命令式 API。先在应用根挂载 `<ToastContainer />`。

```tsx
toast.info("消息");
toast.success("成功", "标题");
toast.warn("警告");
toast.error("失败");
toast.dismiss(id);
toast.clear();
```

`<ToastContainer placement="top-right" />` 可选位置：`top-right | top-left | bottom-right | bottom-left | top-center`。

## Progress / Ring

```tsx
<Progress value={60} showValue label="下载中" />
<Ring value={80} size={64}><strong>80%</strong></Ring>
```

| Prop | 类型 | 说明 |
|---|---|---|
| `value` | `number` | 0–`max` |
| `max` | `number` | 最大值，默认 100 |
| `tone` | `"accent" \| "success" \| "warning" \| "danger"` | 颜色 |
| `size` | Progress: `"sm" \| "md" \| "lg"` / Ring: `number` | 尺寸 |

## Spinner / Skeleton

```tsx
<Spinner size={20} />
<Skeleton height={12} width="70%" />
```

---

## Table

```tsx
<Table
  rowKey="id"
  columns={[
    { key: "name", title: "姓名", dataIndex: "name" },
    { key: "op", title: "操作", render: (_, row) => <Button>编辑</Button> },
  ]}
  data={data}
/>
```

| Prop | 类型 | 说明 |
|---|---|---|
| `columns` | `TableColumn<Row>[]` | 列定义 |
| `data` | `Row[]` | 数据 |
| `rowKey` | `keyof Row \| (row) => string \| number` | 行 key |
| `hoverable` | `boolean` | 悬浮高亮，默认 true |
| `striped` | `boolean` | 斑马纹 |
| `onRowClick` | `(row, i) => void` | 行点击 |
| `empty` | `ReactNode` | 空状态 |

`TableColumn`:
```ts
{
  key: string;
  title: ReactNode;
  dataIndex?: keyof Row;
  render?: (value, row, index) => ReactNode;
  width?: number | string;
  align?: "left" | "center" | "right";
}
```

## List

```tsx
<List items={[{ key, title, description?, avatar?, actions?, onClick? }, ...]} />
```

## Tag / Badge

```tsx
<Tag tone="success">在线</Tag>
<Badge count={5}><IconButton icon="bell" /></Badge>
```

| Tag Prop | 说明 |
|---|---|
| `tone` | `"neutral" \| "accent" \| "info" \| "success" \| "warning" \| "danger"` |
| `solid` | 实心填充 |

| Badge Prop | 说明 |
|---|---|
| `count` | 数字（>99 显示 "99+"） |
| `dot` | 只显示红点 |
| `tone` | 同 Tag |

## Avatar

| Prop | 类型 | 说明 |
|---|---|---|
| `src` | `string` | 图片 URL |
| `alt` | `string` | 替代文本（也用于生成首字母） |
| `initials` | `string` | 手动指定首字母 |
| `size` | `"sm" \| "md" \| "lg" \| number` | 尺寸 |
| `status` | `"online" \| "busy" \| "away" \| "offline"` | 状态点 |

## Calendar

| Prop | 类型 | 说明 |
|---|---|---|
| `value` / `defaultValue` | `Date` | 选中日期 |
| `onChange` | `(date) => void` | 选择回调 |
| `min` / `max` | `Date` | 可选范围 |

## Empty

| Prop | 类型 | 说明 |
|---|---|---|
| `title` | `ReactNode` | 标题 |
| `description` | `ReactNode` | 副标题 |
| `icon` | `ReactNode` | 图标 |
| `action` | `ReactNode` | 底部操作 |

---

## Electron 布局

### AppShell

```tsx
<AppShell titleBar={<TitleBar ... />} sidebar={<Sidebar ... />}>
  {main}
</AppShell>
```

### TitleBar

| Prop | 类型 | 说明 |
|---|---|---|
| `title` | `ReactNode` | 标题 |
| `platform` | `"mac" \| "windows"` | 按钮位置 |
| `onMinimize` / `onMaximize` / `onClose` | `() => void` | 窗口操作回调 |
| `center` | `ReactNode` | 居中槽位 |
| `actions` | `ReactNode` | 右侧槽位 |
| `draggable` | `boolean` | 可拖拽（默认 true，通过 `-webkit-app-region: drag`） |

### Sidebar

| Prop | 类型 | 说明 |
|---|---|---|
| `items` | `SidebarItem[]` | `{ key, label, icon?, badge?, children? }` |
| `activeKey` | `string` | 当前选中 |
| `onSelect` | `(key) => void` | 选中回调 |
| `collapsed` | `boolean` | 折叠为图标 |
| `header` / `footer` | `ReactNode` | 顶部 / 底部槽位 |
