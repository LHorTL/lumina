# Select 下拉选择

> 下拉选择,支持单/多选、搜索、分组、加载态。

## 导入

```tsx
import { Select } from "@fangxinyan/lumina";
```

## 示例

### 单选

```tsx
<Select value={lang} onChange={setLang} options={[
  { value: "zh", label: "简体中文" },
  { value: "en", label: "English" },
]} />
```

### 多选

multiple + Tag 形式呈现已选项。

```tsx
<Select multiple clearable value={tags} onChange={setTags} options={...} />
```

### 搜索过滤

searchable + clearable + 选项 icon/description。icon 支持 IconName 或 ReactNode。

```tsx
<Select searchable clearable
  options={[{ value, label, icon, description }]}
/>
```

### 常用 prop 别名

allowClear / showSearch / popupClassName / optionFilterProp 可直接使用。

```tsx
<Select
  allowClear
  showSearch
  popupClassName="my-select-popup"
  optionFilterProp="label"
  value={value}
  onChange={setValue}
  options={options}
/>
```

### 复杂选项与独立选中渲染

optionRender 承载多行菜单内容；selectedRender 提供适合固定高度触发器的紧凑版本。listHeight 和 popupStyle 可调整浮层尺寸。

```tsx
<Select
  value={plan}
  onChange={setPlan}
  options={plans}
  optionRender={(option, info) => <PlanCard option={option} selected={info.selected} />}
  selectedRender={(option) => <CompactPlan option={option} />}
  listHeight={420}
  popupStyle={{ minWidth: "min(460px, calc(100vw - 16px))" }}
/>
```

### 分组

options 接受 { label, options } 表示分组。

```tsx
options={[
  { label: "前端", options: [...] },
  { label: "后端", options: [...] },
]}
```

### 加载态

loading 时显示 spinner,emptyContent 自定义空态。

```tsx
<Select searchable loading={loading} options={asyncOpts} />
```

### 尺寸 / 状态

```tsx
<Select size="sm" /> <Select /> <Select size="lg" />
<Select invalid /> <Select disabled />
```

## API

**Select**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| options \* | `SelectItem<T>[]` | — | 选项,可含 { label, options } 分组 |
| value / defaultValue | `T | T[]` | — | 受控/初始 |
| onChange | `(value) => void` | — | 变更 |
| placeholder | `string` | `"请选择…"` | 空选择时的提示文本 |
| multiple | `boolean` | `false` | 多选 |
| maxTagCount | `number` | — | 多选时显示的标签数(超出折叠 +N) |
| searchable | `boolean` | `false` | 可搜索 |
| showSearch | `boolean` | `false` | searchable 的等价别名 |
| filterOption | `(input, option) => boolean` | — | 自定义过滤 |
| optionFilterProp | `"label" | "value" | "text" | string` | — | 默认过滤使用的 option 字段 |
| clearable | `boolean` | `false` | 显示独立且可访问的清除按钮 |
| allowClear | `boolean | { clearIcon? }` | `false` | clearable 的等价别名 |
| onClear | `() => void` | — | 用户点击清除按钮后触发 |
| open / defaultOpen / onOpenChange | `boolean / (open: boolean) => void` | — | 受控或非受控菜单显隐；非受控组件禁用时会关闭 |
| id / aria-* | `原生属性` | — | 转发到实际 combobox 触发节点，便于 Form.Item 关联标签和错误说明 |
| menuClassName / popupClassName / dropdownClassName | `string` | — | 浮层菜单 className 别名 |
| loading | `boolean` | `false` | 加载态 |
| emptyContent | `ReactNode` | — | 空态文案 |
| optionRender | `(option, info) => ReactNode` | — | 自定义菜单内完整选项内容，并获得 selected / active / index 状态 |
| selectedRender | `(option, info) => ReactNode` | — | 自定义触发器中的紧凑已选内容；单选和多选标签均支持 |
| listHeight | `number` | `260` | 菜单选项滚动区域最大高度 |
| popupStyle | `CSSProperties` | — | Portal 菜单内联样式，可覆盖宽度或高度 |
| size | `"sm" | "md" | "lg"` | `"md"` | 尺寸 |
| invalid | `boolean` | `false` | 错误态 |
| disabled | `boolean` | `false` | 禁用 |


**SelectOption**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| value \* | `T` | — | 值 |
| label | `ReactNode` | — | 显示 |
| icon | `IconName | ReactNode` | — | 前置图标,可传内置图标名或自定义节点 |
| description | `ReactNode` | — | 次要描述 |
| disabled | `boolean` | `false` | 禁用项 |


---
[← 回到索引](../llms.md)
