# DateTimePicker 日期时间选择

> 输入框触发的日期时间选择器,把 Calendar 与时分秒列组合在同一个浮层内。

## 导入

```tsx
import { DateTimePicker } from "@fangxinyan/lumina";
```

## 示例

### 基础用法

```tsx
<DateTimePicker defaultValue={new Date(2026, 4, 25, 9, 30)} />
```

### 受控

value 使用 Date | null,onChange 同时返回 Date 和格式化字符串。

```tsx
const [startAt, setStartAt] = useState<Date | null>(new Date(2026, 4, 25, 9, 30));
<DateTimePicker value={startAt} onChange={setStartAt} allowClear />
```

### 秒级选择

```tsx
<DateTimePicker
  value={deployAt}
  onChange={setDeployAt}
  format="YYYY-MM-DD HH:mm:ss"
  showSecond
/>
```

### 范围与步进

15 分钟粒度,只允许工作日 08:00 到 20:00 之间的时间。

```tsx
<DateTimePicker
  min={new Date(2026, 4, 1, 8)}
  max={new Date(2026, 4, 31, 20)}
  minuteStep={15}
  disabledDate={(date) => date.getDay() === 0 || date.getDay() === 6}
  disabledTime={(time) => time.hour === 12}
/>
```

### 尺寸与状态

```tsx
<DateTimePicker size="sm" />
<DateTimePicker invalid />
<DateTimePicker size="lg" disabled />
```

## API

**DateTimePicker**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| value / defaultValue | `Date | null` | — | 受控/初始日期时间 |
| onChange | `(date: Date | null, dateString: string) => void` | — | 选择或清空时触发 |
| format | `"YYYY-MM-DD HH:mm" | "YYYY-MM-DD HH:mm:ss" | ((date) => string)` | `"YYYY-MM-DD HH:mm"` | 显示格式或自定义格式化函数 |
| showSecond | `boolean` | — | 显示秒列 |
| hourStep / minuteStep / secondStep | `number` | `1` | 列选项步进 |
| min / max | `Date` | — | 可选日期时间范围 |
| disabledDate | `(date: Date) => boolean` | — | 自定义禁用日期 |
| disabledTime | `(time: TimePickerValue, date: Date) => boolean` | — | 按当前日期禁用具体时间 |
| size | `"sm" | "md" | "lg"` | `"md"` | 输入框尺寸 |
| allowClear | `boolean` | `false` | 允许清空 |
| open / defaultOpen / onOpenChange | `—` | — | 受控浮层显隐 |
| popupClassName / dropdownClassName | `string` | — | 浮层 className |
| disabled / readOnly / invalid / placeholder | `—` | — | 常规输入状态 |


---
[← 回到索引](../llms.md)
