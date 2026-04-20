# Slider 滑块

> 在连续数值区间内取值。

## 导入

```tsx
import { Slider } from "@fangxinyan/lumina";
```

## 示例

### 基础用法

```tsx
<Slider value={v} onChange={setV} showValue />
```

### 步进 / 范围

min/max/step 控制取值范围与步进。

```tsx
<Slider min={0} max={10} step={1} defaultValue={5} showValue />
```

### 色调

```tsx
<Slider tone="success" defaultValue={70} />
<Slider tone="warning" defaultValue={50} />
<Slider tone="danger" defaultValue={88} />
```

### 双滑块区间

range 模式下 value / onChange 采用 [min, max] 元组。

```tsx
const [v, setV] = useState<[number, number]>([20, 70]);
<Slider range value={v} onChange={setV} showValue />
```

### 刻度标记

marks 提供可点击刻度,点击即可跳到该值。

```tsx
<Slider
  defaultValue={37}
  marks={{ 0: "0°C", 26: "冷", 37: "正常", 100: "100°C" }}
/>
```

## API

**Slider**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| value / defaultValue | `number | [number, number]` | — | 受控/初始;range 模式下为 [number, number] |
| onChange | `(value) => void` | — | 变更回调,range 模式返回元组 |
| min / max / step | `number` | — | 区间与步进 |
| range | `boolean` | `false` | 是否为双滑块区间模式 |
| marks | `Record<number, ReactNode>` | — | 刻度,点击可跳到对应值 |
| tone | `"accent" | "success" | "warning" | "danger"` | `"accent"` | 色调 |
| showValue | `boolean` | `false` | 显示数值 |
| disabled | `boolean` | `false` | 禁用 |


---
[← 回到索引](../llms.md)
