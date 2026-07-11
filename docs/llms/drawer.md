# Drawer 抽屉

> 从屏幕边缘滑出的浮层。

## 导入

```tsx
import { Drawer } from "@fangxinyan/lumina";
```

## 示例

### 基础

有遮罩时会锁定页面滚动并把焦点限制在抽屉及其子浮层；关闭后焦点回到原触发控件。

```tsx
<Drawer open={d} onClose={...} title="标题">...</Drawer>
```

### 标题右侧 extra

extra 渲染到标题右边,常用来放刷新 / 更多 / 保存按钮。

```tsx
<Drawer
  title="订单详情"
  extra={<><Button icon="edit" tip="编辑" /><Button variant="primary">保存</Button></>}
/>
```

### 拟态阴影安全区

抽屉只让正文区滚动，并自动为拟态阴影留出空间；全宽内容可通过 bodyInset="none" 贴边。

```tsx
<Drawer open={open} title="连接配置">
  <Card title="远程节点">无需手工补 padding 或修改 overflow。</Card>
</Drawer>
```

### 四个方向

placement 控制滑出方向;top / bottom 用 size 控高度。

```tsx
<Drawer placement="left" size={320} />
<Drawer placement="top" size={240} />
```

### 无遮罩 (mask={false})

关闭遮罩的抽屉不锁定滚动、不限制焦点，页面其他区域仍可交互；Esc 与关闭后的焦点归还仍然生效。

```tsx
<Drawer mask={false} />
```

### 遮罩定制

默认遮罩使用中性 --mask-bg,不跟随 --bg-sunken 的色相;maskClassName / maskStyle 可定制遮罩层。

```tsx
<Drawer
  maskClassName="settings-drawer-mask"
  maskStyle={{ background: "var(--mask-bg)", backdropFilter: "none" }}
/>
```

## API

**Drawer**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| open \* | `boolean` | — | 可见 |
| onClose | `() => void` | — | 关闭回调；Esc 仅由当前最上层浮层响应 |
| placement | `"left" | "right" | "top" | "bottom"` | `"right"` | 出现位置 |
| size | `number | string` | `380` | 宽度(左右)或高度(上下) |
| title / footer / children | `ReactNode` | — | 头/脚/主体 |
| extra | `ReactNode` | — | 标题右侧的附加操作区 |
| bodyClassName / bodyStyle / bodyProps | `string / CSSProperties / HTMLAttributes<HTMLDivElement>` | — | 正文容器的 class、样式与 DOM 属性 |
| bodyOverflow | `CSSProperties['overflow']` | — | 正文容器 overflow 快捷控制 |
| bodyInset | `"safe" | "none"` | `"safe"` | 正文边缘留白；safe 自动保护拟态阴影，none 用于贴边内容 |
| mask | `boolean` | `true` | 是否渲染遮罩；有遮罩时启用焦点限制与页面滚动锁定 |
| maskClosable | `boolean` | `true` | 点击遮罩关闭 |
| maskClassName | `string` | — | 遮罩层 className |
| maskStyle | `CSSProperties` | — | 遮罩层内联样式 |
| className | `string` | — | 抽屉面板 className；ref 同样指向面板 |
| keyboard | `boolean` | `true` | Esc 关闭 |
| closable | `boolean` | `true` | 右上角 × |
| closeIcon | `ReactNode` | — | 自定义关闭图标 |
| destroyOnClose | `boolean` | `false` | 关闭时卸载子树 |
| afterOpenChange | `(open: boolean) => void` | — | 动画结束回调 |
| zIndex | `number` | — | 覆盖抽屉起始层级；所属子浮层会自动排在其上 |


---
[← 回到索引](../llms.md)
