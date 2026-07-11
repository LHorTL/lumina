# Calendar 日历

> 查看与选择日期,支持快速切换年份和月份。

## 导入

```tsx
import { Calendar } from "@fangxinyan/lumina";
```

## 示例

### 基础用法

受控 value 可传 null 表示尚未选择，日历仍保留可操作的当前月份。

```tsx
<Calendar value={date} viewDate={viewDate}
  onChange={setDate} onViewChange={setViewDate} />
<Button onClick={() => setDate(null)}>清空选择</Button>
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
| value / defaultValue | `Date | null` | — | 受控/初始日期;null 表示没有选中日期 |
| viewDate | `Date` | — | 外部日期变化时同步可视月份 |
| onViewChange | `(date: Date) => void` | — | 用户切换可视月份或年份时回调 |
| onChange | `(date: Date) => void` | — | 选择回调 |
| min / max | `Date` | — | 可选范围 |
| disabledDate | `(date: Date) => boolean` | — | 自定义禁用判断,返回 true 的日期不可选 |


---
[← 回到索引](../llms.md)
