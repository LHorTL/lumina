# Splitter 可拖拽分栏

> 两栏之间可拖拽的分隔条,支持横向、纵向与嵌套。

## 示例

### 水平分栏

```tsx
<Splitter defaultSize={200} min={120} max={360}>
  <SidePanel />
  <MainPanel />
</Splitter>
```

### 垂直分栏

direction="vertical" 让面板上下排列,分隔条变成横条。

```tsx
<Splitter direction="vertical" defaultSize={120} min={60}>...</Splitter>
```

### 嵌套分栏

组合使用两个 Splitter 可以搭出 IDE 风格的三区布局。

```tsx
<Splitter defaultSize={180}>
  <SideNav />
  <Splitter direction="vertical" defaultSize={180}>
    <Editor />
    <Terminal />
  </Splitter>
</Splitter>
```

### 受控模式

通过 size / onResize 可以持久化宽度或与其他状态联动。

```tsx
const [w, setW] = useState(220);
<Splitter size={w} onResize={setW}>...</Splitter>
```

## API

**Splitter**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| direction | `"horizontal" | "vertical"` | `"horizontal"` | 布局方向 |
| defaultSize | `number` | `240` | 非受控初始宽/高 (px) |
| size / onResize | `number / (n: number) => void` | — | 受控宽/高 |
| onResizeEnd | `(n: number) => void` | — | 拖动结束回调 |
| min / max | `number` | `80 / Infinity` | 尺寸限制 (px) |
| step | `number` | `16` | 方向键步长 (px) |
| children \* | `[ReactNode, ReactNode]` | — | 必须恰好两个子节点 |


---
[← 回到索引](../llms.md)
