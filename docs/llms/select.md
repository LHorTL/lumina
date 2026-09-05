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

### 远程搜索多选

searchable 在单选和多选中都复用选择框本体作为输入；多选 Tag 后的空输入会收缩，不单独占行。选中后保持展开和关键词，业务层负责防抖与迟到结果保护。

```tsx
const [value, setValue] = useState<string[]>([]);
const [searchValue, setSearchValue] = useState("");
const [options, setOptions] = useState<SelectOption[]>([]);
const [loading, setLoading] = useState(false);
const latestRequest = useRef(0);

useEffect(() => {
  const requestId = ++latestRequest.current;
  setLoading(true);
  const timer = window.setTimeout(() => {
    void fetchOptions(searchValue).then((nextOptions) => {
      if (requestId !== latestRequest.current) return;
      setOptions(nextOptions);
      setLoading(false);
    });
  }, 300);
  return () => {
    window.clearTimeout(timer);
    if (requestId === latestRequest.current) latestRequest.current += 1;
  };
}, [searchValue]);

<Select
  multiple searchable clearable
  value={value} onChange={setValue}
  searchValue={searchValue} onSearch={setSearchValue}
  options={options} loading={loading}
  filterOption={false}
  maxTagCount={2}
/>
```

### 数量上限 / 分类限选

maxCount 限制总数；getOptionDisabled 可读取当前选择，实现“一类最多选一个”。

```tsx
<Select
  multiple
  maxCount={2}
  value={values}
  onChange={setValues}
  getOptionDisabled={(option, selectedValues) =>
    hasOtherSelectionInCategory(option, selectedValues)
  }
  options={groupedOptions}
/>
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
  aria-label="订阅套餐"
  value={plan}
  onChange={setPlan}
  options={plans}
  optionRender={(option, info) => <PlanCard option={option} selected={info.selected} />}
  selectedRender={(option) => <CompactPlan option={option} />}
  listHeight={420}
  popupStyle={{ minWidth: "min(460px, calc(100vw - 16px))" }}
/>
```

### 置顶分组与额外操作

分组设置 pinned 后会稳定提升到菜单顶部；optionExtraRender 提供不会触发选中的独立尾部区域。收藏仅是业务侧示例。

```tsx
const groups = [
  { label: "其他服务", options: otherOptions },
  { label: "已收藏", pinned: true, options: favoriteOptions },
];

<Select
  value={service}
  onChange={setService}
  options={groups}
  optionExtraRender={(option) => (
    <IconButton icon={isFavorite(option) ? "starFilled" : "star"} />
  )}
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
| maxCount | `number` | — | 多选允许的最大选择数；达到上限后禁用未选项 |
| getOptionDisabled | `(option, selectedValues) => boolean` | — | 基于候选项和当前选择动态判断禁用状态 |
| searchable | `boolean` | `false` | 在选择框本体内启用搜索，单选和多选共用同一交互形态 |
| showSearch | `boolean` | `false` | searchable 的等价别名 |
| searchValue / defaultSearchValue | `string` | — | 受控搜索词 / 非受控初始搜索词；多选 searchable 时输入框位于标签同一触发器内 |
| onSearch | `(value: string) => void` | — | 搜索词交互变化回调；多选选中不会清空关键词，关闭时清空并回调空字符串 |
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
| optionExtraRender | `(option, info) => ReactNode` | — | 自定义选项尾部的独立内容或操作，不触发选中；info 含 disabled / groupPinned |
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
| text | `string` | — | 复杂 label 的独立搜索文本 |
| ariaLabel | `string` | — | 复杂选项或 optionRender 的独立可访问名称 |
| icon | `IconName | ReactNode` | — | 前置图标,可传内置图标名或自定义节点 |
| description | `ReactNode` | — | 次要描述 |
| extra | `ReactNode` | — | 选项尾部的静态独立内容或操作；optionExtraRender 存在时由其覆盖 |
| disabled | `boolean` | `false` | 禁用项 |


**SelectOptionGroup**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| label \* | `ReactNode` | — | 分组标题 |
| options \* | `SelectOption<T>[]` | — | 分组内选项 |
| pinned | `boolean` | `false` | 稳定提升到菜单顶部，其他项目保持原始顺序 |


---
[← 回到索引](../llms.md)
