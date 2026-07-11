# DatePicker 日期选择

> 输入框触发的日期选择器,复用 Calendar 并支持范围、禁用日期和格式化。

## 导入

```tsx
import { DatePicker } from "@fangxinyan/lumina";
```

## 示例

### 基础用法

```tsx
<DatePicker defaultValue={new Date(2026, 4, 25)} />
```

### 受控

value 使用 Date | null,onChange 同时返回 Date 和格式化字符串。

```tsx
const [date, setDate] = useState<Date | null>(new Date());
<DatePicker value={date} onChange={setDate} allowClear />
```

### 限制范围

min / max 与 disabledDate 会同步作用于 Calendar 单元格和手动输入。

```tsx
<DatePicker
  value={workday}
  onChange={setWorkday}
  min={new Date(2026, 4, 1)}
  max={new Date(2026, 4, 31)}
  disabledDate={(date) => date.getDay() === 0 || date.getDay() === 6}
/>
```

### 格式与尺寸

```tsx
<DatePicker size="sm" format="YYYY/MM/DD" />
<DatePicker format="YYYY年MM月DD日" />
<DatePicker size="lg" disabled />
```

### 自定义格式与解析

```tsx
<DatePicker format={formatDotDate} parse={parseDotDate} />
```

## API

**DatePicker**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| value / defaultValue | `Date | null` | — | 受控/初始日期 |
| onChange | `(date: Date | null, dateString: string) => void` | — | 选择或清空时触发 |
| format | `"YYYY-MM-DD" | "YYYY/MM/DD" | "YYYY年MM月DD日" | ((date) => string)` | `"YYYY-MM-DD"` | 显示格式或自定义格式化函数 |
| parse | `(input: string) => Date | null` | — | 自定义 format 函数对应的输入解析器 |
| min / max | `Date` | — | 可选日期范围 |
| disabledDate | `(date: Date) => boolean` | — | 自定义禁用日期 |
| size | `"sm" | "md" | "lg"` | `"md"` | 输入框尺寸 |
| allowClear | `boolean` | `false` | 允许清空 |
| open / defaultOpen / onOpenChange | `—` | — | 受控浮层显隐 |
| popupClassName / dropdownClassName | `string` | — | 浮层 className |
| disabled / readOnly / invalid / placeholder | `—` | — | 常规输入状态 |


---
[← 回到索引](../llms.md)
