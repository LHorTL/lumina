# Modal 对话框

> 在不离开当前页面的前提下处理事务。

## 导入

```tsx
import { Modal } from "@fangxinyan/lumina";
```

## 示例

### 基础

```tsx
<Modal open={m} onClose={...} title="标题">...</Modal>
```

### 确认操作 (footer 自定义)

用 footer 自定义底部按钮。传 null 可以去掉 footer。

```tsx
<Modal footer={<><Button>取消</Button><Button danger>删除</Button></>}>...
```

### onOk / onCancel + 按钮定制

用默认 footer 的 onOk / onCancel 区分动作,okText / cancelText 改文案,okButtonProps 透传样式。

```tsx
<Modal
  onOk={handleSave}
  onCancel={() => setOpen(false)}
  okText="发布"
  cancelText="不发了"
  okButtonProps={{ icon: "send" }}
/>
```

### 异步 confirmLoading

提交过程中 confirmLoading 显示按钮 spinner 并自动禁用;完成后外层再 setOpen(false)。

```tsx
<Modal confirmLoading={submitting} onOk={async () => {
  setSubmitting(true);
  await api.save();
  setSubmitting(false);
  setOpen(false);
}} />
```

### 隐藏关闭按钮

closable={false} 隐藏右上角 ×,closeIcon 可自定义。

```tsx
<Modal closable={false} />
<Modal closeIcon={<Icon name="chevDown" />} />
```

## API

**Modal**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| open \* | `boolean` | — | 是否可见 |
| onClose | `() => void` | — | 关闭回调(遮罩/Esc/关闭按钮) |
| onOk | `() => void` | — | 默认 OK 按钮点击 |
| onCancel | `() => void` | — | 默认 Cancel 按钮 / Esc / 关闭 / 遮罩触发,缺省则用 onClose |
| title / description | `ReactNode` | — | 标题/说明 |
| footer | `ReactNode` | — | 自定义底部(null 去除) |
| okText / cancelText | `ReactNode` | `"确定" / "取消"` | 默认按钮文案 |
| okButtonProps / cancelButtonProps | `Partial<ButtonProps>` | — | 透传给默认按钮 |
| confirmLoading | `boolean` | `false` | OK 按钮显示 spinner 并禁用 |
| closable | `boolean` | `true` | 显示右上角 × |
| closeIcon | `ReactNode` | — | 自定义关闭图标 |
| maskClosable | `boolean` | `true` | 点击遮罩关闭 |
| escClosable | `boolean` | `true` | Esc 关闭 |
| width | `number | string` | `440` | 宽度 |
| destroyOnClose | `boolean` | `false` | 关闭时卸载子树 |
| afterOpenChange | `(open: boolean) => void` | — | 动画结束后回调 |
| zIndex | `number` | — | 覆盖遮罩 z-index |


---
[← 回到索引](../llms.md)
