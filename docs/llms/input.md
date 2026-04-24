# Input 输入框

> 凹陷凹槽式输入域,支持前后置图标、错误态、禁用态。

## 导入

```tsx
import { Input, Textarea } from "@fangxinyan/lumina";
```

## 示例

### 基础用法

```tsx
const [v, setV] = useState("");
<Input
  placeholder="输入用户名"
  value={v}
  onChange={(e) => setV(e.target.value)}
  leadingIcon="user"
/>
```

### 前后置图标

leadingIcon / trailingIcon。

```tsx
<Input placeholder="搜索..." leadingIcon="search" />
```

### Input.Password

密码输入框,内置显隐切换。

```tsx
<Input.Password
  value={pw}
  onChange={(e) => setPw(e.target.value)}
  allowClear
/>
```

### 校验错误

invalid 触发红色凹槽。

```tsx
<Input invalid hint="请输入有效的邮箱" />
```

### 可清除

allowClear 在值非空时显示 × 按钮,点击即清空。

```tsx
<Input value={v} onValueChange={setV} allowClear placeholder="输入后右侧会出现 ×" />
```

### 前缀 / 后缀

prefix/suffix 在输入框内部以静态文本形式呈现,常用于单位或协议。

```tsx
<Input prefix="https://" suffix=".com" defaultValue="lumina" />
<Input prefix="¥" suffix="元" defaultValue="1280" />
```

### 字数统计 + maxLength

showCount 显示当前字数,配合 maxLength 显示 N / max。

```tsx
<Input
  value={v}
  onValueChange={setV}
  maxLength={20}
  showCount
  placeholder="最多输入 20 个字"
/>
```

### Input.TextArea 多行文本

Input.TextArea 与 Textarea 使用同一套多行输入能力,也支持 allowClear / maxLength / showCount。

```tsx
<Input.TextArea
  placeholder="..."
  value={msg}
  onChange={(e) => setMsg(e.target.value)}
  allowClear
  maxLength={300}
  showCount
/>
```

## API

**Input**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| value / defaultValue | `string` | — | 受控值 / 初值 |
| onChange | `(event) => void` | — | 变更回调,传入 React 原生事件 |
| onValueChange | `(value: string, event) => void` | — | 值回调便捷写法 |
| placeholder | `string` | — | 占位文案 |
| leadingIcon / trailingIcon | `IconName` | — | 前/后置图标 |
| prefix | `ReactNode` | — | 左侧内嵌内容(在 leadingIcon 之后) |
| suffix | `ReactNode` | — | 右侧内嵌内容(在 trailingIcon 之前) |
| allowClear | `boolean` | `false` | 显示内置的清除按钮 |
| maxLength | `number` | — | 最大字符数,透传至原生 input |
| showCount | `boolean` | `false` | 在输入框下方显示字数统计 |
| Input.Password | `Component` | — | 密码输入框,内置显隐切换 |
| Input.TextArea | `typeof Textarea` | — | 多行文本别名 |
| size | `"sm" | "md" | "lg"` | `"md"` | 尺寸 |
| invalid | `boolean` | `false` | 错误态 |
| disabled | `boolean` | `false` | 禁用 |


**Input.TextArea / Textarea**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| value / defaultValue | `string` | — | 受控值 / 初值 |
| onChange | `(event) => void` | — | 变更回调,传入 React 原生事件 |
| onValueChange | `(value: string, event) => void` | — | 值回调便捷写法 |
| allowClear | `boolean` | `false` | 右上角显示清除按钮 |
| maxLength | `number` | — | 最大字符数 |
| showCount | `boolean` | `false` | 显示字数统计 |
| invalid | `boolean` | `false` | 错误态 |


---
[← 回到索引](../llms.md)
