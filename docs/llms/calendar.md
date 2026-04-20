# Calendar 日历

> 查看与选择日期。

## 导入

```tsx
import { Calendar } from "@fangxinyan/lumina";
```

## 示例

### 基础用法

```tsx
<Calendar value={date} onChange={setDate} />
```

### 禁用日期

通过 disabledDate 将周末标灰并禁止点击;与 min/max 可叠加使用。

```tsx
<Calendar
  value={workDate}
  onChange={setWorkDate}
  disabledDate={(d) => d.getDay() === 0 || d.getDay() === 6}
/>
```

## API

**Calendar**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| value / defaultValue | `Date` | — | 受控/初始日期 |
| onChange | `(date: Date) => void` | — | 选择回调 |
| min / max | `Date` | — | 可选范围 |
| disabledDate | `(date: Date) => boolean` | — | 自定义禁用判断,返回 true 的日期不可选 |


---
[← 回到索引](../llms.md)
