# Radio 单选

> 在多个互斥选项中进行单项选择。

## 导入

```tsx
import { Radio, RadioGroup } from "@fangxinyan/lumina";
```

## 示例

### 基础用法

```tsx
<RadioGroup value={v} onChange={setV} options={[
  { value: "daily", label: "每日" },
  { value: "weekly", label: "每周" },
]} />
```

### 单个 Radio

单项控件可用于自定义组合场景;表单里通常优先使用 RadioGroup。

```tsx
<Radio label="接收更新" defaultChecked />
```

### 水平排列

direction='horizontal'。

```tsx
<RadioGroup direction="horizontal" ... />
```

### 分段外观

variant="segmented" 用同一组选项表达更紧凑的互斥切换。

```tsx
<RadioGroup
  variant="segmented"
  defaultValue="grid"
  options={[
    { value: "grid", label: "网格" },
    { value: "list", label: "列表" },
    { value: "card", label: "卡片" },
  ]}
/>
```

## API

**Radio**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| checked / defaultChecked | `boolean` | — | 受控/初始选中 |
| onChange | `(checked: boolean) => void` | — | 变更 |
| label | `ReactNode` | — | 标签 |
| disabled | `boolean` | — | 禁用 |


**RadioGroup**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| options \* | `{ value, label, disabled? }[]` | — | 选项数组 |
| value / defaultValue | `T` | — | 受控/初始 |
| onChange | `(value: T) => void` | — | 变更 |
| direction | `"vertical" | "horizontal"` | `"vertical"` | 方向 |
| variant | `"default" | "segmented"` | `"default"` | 外观 |
| size | `"sm" | "md" | "lg"` | `"md"` | 分段外观尺寸 |


---
[← 回到索引](../llms.md)
