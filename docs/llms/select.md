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

searchable + clearable + 选项 icon/description。

```tsx
<Select searchable clearable
  options={[{ value, label, icon, description }]}
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
| multiple | `boolean` | `false` | 多选 |
| maxTagCount | `number` | — | 多选时显示的标签数(超出折叠 +N) |
| searchable | `boolean` | `false` | 可搜索 |
| filterOption | `(input, option) => boolean` | — | 自定义过滤 |
| clearable | `boolean` | `false` | 可清除 |
| loading | `boolean` | `false` | 加载态 |
| emptyContent | `ReactNode` | — | 空态文案 |
| size | `"sm" | "md" | "lg"` | `"md"` | 尺寸 |
| invalid | `boolean` | `false` | 错误态 |
| disabled | `boolean` | `false` | 禁用 |


**SelectOption**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| value \* | `T` | — | 值 |
| label | `ReactNode` | — | 显示 |
| icon | `IconName` | — | 前置图标 |
| description | `ReactNode` | — | 次要描述 |
| disabled | `boolean` | `false` | 禁用项 |


---
[← 回到索引](../llms.md)
