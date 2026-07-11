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

### 原生同名分组

独立 Radio 传入相同 name 后仍保持原生互斥，并可用 value 参与表单提交。

```tsx
<Radio name="billing" value="monthly" defaultChecked label="按月" />
<Radio name="billing" value="yearly" label="按年" />
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
| name / value | `string / string | number` | — | 原生单选分组名与提交值;同名非受控 Radio 自动互斥 |
| required / form | `boolean / string` | — | 原生表单必填约束与关联 form id |
| disabled | `boolean` | — | 禁用 |


**RadioGroup**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| options \* | `{ value, label, disabled? }[]` | — | 选项数组 |
| value / defaultValue | `T` | — | 受控/初始 |
| onChange | `(value: T) => void` | — | 变更 |
| name | `string` | — | 原生分组名;省略时自动生成 |
| required / form | `boolean / string` | — | 整组的原生必填约束与关联 form id |
| direction | `"vertical" | "horizontal"` | `"vertical"` | 方向 |
| variant | `"default" | "segmented"` | `"default"` | 外观 |
| size | `"sm" | "md" | "lg"` | `"md"` | 分段外观尺寸 |


---
[← 回到索引](../llms.md)
