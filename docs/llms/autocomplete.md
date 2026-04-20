# AutoComplete 自动补全

> 输入时展示建议下拉,不限定必须从候选中选。

## 示例

### 基础

```tsx
<AutoComplete
  options={[
    { value: "light" },
    { value: "dark" },
    { value: "system" },
  ]}
  placeholder="主题"
/>
```

### 自定义 label

```tsx
options={[{ value: "zh", label: "中文 · Chinese" }]}
```

### 动态加载

onSearch 在用户输入时触发,常配合后端检索使用。

```tsx
const [opts, setOpts] = useState([]);
<AutoComplete
  options={opts}
  onSearch={(text) => setOpts(generate(text))}
/>
```

## API

**AutoComplete**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| value / defaultValue | `string` | — | 受控 / 初始值 |
| onChange | `(value, option?) => void` | — | 文本变更 |
| onSelect | `(value, option) => void` | — | 选中项回调 |
| onSearch | `(text) => void` | — | 输入变化回调 |
| options \* | `{ value, label?, disabled? }[]` | — | 候选项 |
| filterOption | `boolean | (input, option) => boolean` | `true` | 过滤函数,false 关闭过滤 |
| notFoundContent | `ReactNode` | — | 无匹配占位 |
| allowClear / disabled / size / autoFocus / placeholder | `-` | — | 常规属性 |
| matchTriggerWidth | `boolean` | `true` | 下拉宽度跟随输入框 |


---
[← 回到索引](../llms.md)
