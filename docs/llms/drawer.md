# Drawer 抽屉

> 从屏幕边缘滑出的浮层。

## 导入

```tsx
import { Drawer } from "@fangxinyan/lumina";
```

## 示例

### 基础

```tsx
<Drawer open={d} onClose={...} title="标题">...</Drawer>
```

### 标题右侧 extra

extra 渲染到标题右边,常用来放刷新 / 更多 / 保存按钮。

```tsx
<Drawer
  title="订单详情"
  extra={<><IconButton icon="edit" tip="编辑" /><Button variant="primary">保存</Button></>}
/>
```

### 四个方向

placement 控制滑出方向;top / bottom 用 size 控高度。

```tsx
<Drawer placement="left" size={320} />
<Drawer placement="top" size={240} />
```

### 无遮罩 (mask={false})

关闭遮罩的抽屉不阻塞页面其他交互,适合辅助面板。

```tsx
<Drawer mask={false} />
```

## API

**Drawer**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| open \* | `boolean` | — | 可见 |
| onClose | `() => void` | — | 关闭回调 |
| placement | `"left" | "right" | "top" | "bottom"` | `"right"` | 出现位置 |
| size | `number | string` | `380` | 宽度(左右)或高度(上下) |
| title / footer / children | `ReactNode` | — | 头/脚/主体 |
| extra | `ReactNode` | — | 标题右侧的附加操作区 |
| mask | `boolean` | `true` | 是否渲染遮罩 |
| maskClosable | `boolean` | `true` | 点击遮罩关闭 |
| keyboard | `boolean` | `true` | Esc 关闭 |
| closable | `boolean` | `true` | 右上角 × |
| closeIcon | `ReactNode` | — | 自定义关闭图标 |
| destroyOnClose | `boolean` | `false` | 关闭时卸载子树 |
| afterOpenChange | `(open: boolean) => void` | — | 动画结束回调 |
| zIndex | `number` | — | 覆盖 z-index |


---
[← 回到索引](../llms.md)
