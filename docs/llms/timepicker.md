# TimePicker 时间选择

> 输入框触发的时分秒选择器,支持步进、范围、禁用时间和秒级选择。

## 导入

```tsx
import { TimePicker } from "@fangxinyan/lumina";
```

## 示例

### 基础用法

确认或 Esc 关闭后焦点回到输入框并保持关闭；再次点击、Enter / ↓ 或 Tab 重新进入可展开。

```tsx
<TimePicker defaultValue="09:30" />
```

### 受控

value 是 HH:mm / HH:mm:ss 字符串或 null,onChange 第二个参数返回结构化 time。

```tsx
const [time, setTime] = useState<string | null>("09:30");
<TimePicker value={time} onChange={setTime} allowClear />
```

### 秒级选择

```tsx
<TimePicker
  value={precise}
  onChange={setPrecise}
  format="HH:mm:ss"
  showSecond
/>
```

### 范围与步进

15 分钟粒度,只允许 08:00 到 20:00 之间的时间。

```tsx
<TimePicker
  min="08:00"
  max="20:00"
  minuteStep={15}
  disabledTime={(time) => time.hour === 12}
/>
```

### 尺寸与状态

```tsx
<TimePicker size="sm" />
<TimePicker invalid />
<TimePicker size="lg" disabled />
```

## API

**TimePicker**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| value / defaultValue | `string | null` | — | 受控/初始时间 |
| onChange | `(value: string | null, time: TimePickerValue | null) => void` | — | 选择或清空时触发 |
| format | `"HH:mm" | "HH:mm:ss"` | `"HH:mm"` | 输出和显示格式 |
| showSecond | `boolean` | — | 显示秒列 |
| hourStep / minuteStep / secondStep | `number` | `1` | 列选项步进 |
| min / max | `string` | — | 可选时间范围 |
| disabledTime | `(time: TimePickerValue) => boolean` | — | 自定义禁用时间 |
| size | `"sm" | "md" | "lg"` | `"md"` | 输入框尺寸 |
| allowClear | `boolean` | `false` | 允许清空 |
| open / defaultOpen / onOpenChange | `—` | — | 受控/初始显隐及变化回调；关闭后的焦点归还不会再次请求打开 |
| popupClassName / dropdownClassName | `string` | — | 浮层 className |
| disabled / readOnly / invalid / placeholder | `—` | — | 常规输入状态 |


---
[← 回到索引](../llms.md)
