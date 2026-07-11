# AutoComplete 自动补全

> 输入时展示建议下拉,不限定必须从候选中选。

## 导入

```tsx
import { AutoComplete } from "@fangxinyan/lumina";
```

## 示例

### 基础

输入框使用 combobox / listbox 语义；方向键跳过禁用项，Enter 选择，Esc 或 Tab 关闭。

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

label 可以是任意 ReactNode；disabled 选项会保留展示，但不会被键盘或鼠标选中。

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
| options \* | `{ value, label?, disabled? }[]` | — | 候选项；空字符串 value 会过滤，disabled 项不可选且键盘导航会跳过 |
| filterOption | `boolean | (input, option) => boolean` | `true` | 过滤函数,false 关闭过滤 |
| notFoundContent | `ReactNode` | — | 无匹配占位 |
| disabled | `boolean` | `false` | 禁用输入并立即关闭已打开的建议面板 |
| allowClear / size / autoFocus / placeholder | `-` | — | 常规输入属性 |
| dropdownClassName | `string` | — | Portal 下拉面板 className |
| matchTriggerWidth | `boolean` | `true` | 下拉宽度跟随输入框 |


---
[← 回到索引](../llms.md)
