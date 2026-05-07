# Textarea 多行输入

> 多行文本输入域,支持清除、字数统计、错误态和原生 textarea 属性。

## 导入

```tsx
import { Textarea, TextArea, Input } from "@fangxinyan/lumina";
```

## 示例

### 基础用法

Textarea 直接暴露原生 textarea ref 和常用原生属性。

```tsx
const [notes, setNotes] = useState("");

<Textarea
  value={notes}
  onValueChange={setNotes}
  rows={4}
  placeholder="写点什么..."
/>
```

### 可清除与字数统计

allowClear、maxLength、showCount 可组合使用,适合受限文本输入。

```tsx
<Textarea
  value={feedback}
  onValueChange={setFeedback}
  allowClear
  maxLength={160}
  showCount
  placeholder="最多输入 160 个字"
/>
```

### 错误与禁用

invalid 只负责视觉状态;错误文案通常交给 Field 或 Form.Item 展示。

```tsx
<Textarea invalid defaultValue="太短" />
<Textarea disabled defaultValue="只读说明..." />
```

### Input.TextArea 别名

当表单统一从 Input 命名空间取控件时,Input.TextArea 与 Textarea 等价。

```tsx
<Input.TextArea
  defaultValue="Input.TextArea 与 Textarea 使用同一套能力"
  allowClear
  showCount
/>
```

## API

**Textarea / TextArea / Input.TextArea**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| value / defaultValue | `string` | — | 受控值 / 初值 |
| onChange | `(event) => void` | — | 变更回调,传入 React 原生事件 |
| onValueChange | `(value: string, event) => void` | — | 值回调便捷写法 |
| allowClear | `boolean` | `false` | 右上角显示清除按钮 |
| maxLength | `number` | — | 最大字符数,透传至原生 textarea |
| showCount | `boolean` | `false` | 显示字数统计;有 maxLength 时显示 N / max |
| invalid | `boolean` | `false` | 错误态 |
| disabled | `boolean` | `false` | 禁用 |
| rows | `number` | — | 文本域可见行数,透传至原生 textarea |
| className / style / id / data-* / aria-* | `native attrs` | — | 透传至原生 textarea |


---
[← 回到索引](../llms.md)
