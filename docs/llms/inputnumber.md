# InputNumber 数字输入

> 带步进按钮的数字输入框。

## 导入

```tsx
import { InputNumber } from "@fangxinyan/lumina";
```

## 示例

### 基础

```tsx
<InputNumber defaultValue={5} min={0} max={100} />
```

### 小数精度

```tsx
<InputNumber defaultValue={0.5} min={0} max={1} step={0.1} precision={2} />
```

### 尺寸

```tsx
<InputNumber size="sm" /> / <InputNumber /> / <InputNumber size="lg" />
```

### 隐藏步进按钮

```tsx
<InputNumber controls={false} defaultValue={100} />
```

### 受控

```tsx
const [v, setV] = useState(10);
<InputNumber value={v} onChange={setV} />
```

## API

**InputNumber**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| value / defaultValue | `number | null` | — | 受控 / 初始值 |
| onChange | `(value: number | null) => void` | — | 变更回调 |
| onPressEnter | `(e) => void` | — | 回车事件 |
| min / max | `number` | — | 数值范围 |
| step | `number` | `1` | 步进值 |
| precision | `number` | — | 小数位数 |
| size | `"sm" | "md" | "lg"` | `"md"` | 尺寸 |
| controls | `boolean` | `true` | 是否显示步进按钮 |
| disabled / readOnly / placeholder | `-` | — | 常规属性 |
| prefix / suffix | `ReactNode` | — | 内嵌前/后置内容 |


---
[← 回到索引](../llms.md)
