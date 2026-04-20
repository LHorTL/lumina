# Form 表单

> 受控表单,字段绑定 + 校验,API 对齐 antd。

## 示例

### 基础

```tsx
const [form] = Form.useForm();

<Form form={form} layout="vertical" onFinish={(values) => console.log(values)}>
  <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
    <Input placeholder="输入用户名" />
  </Form.Item>
  <Form.Item name="email" label="邮箱" rules={[{ type: "email", message: "邮箱格式不正确" }]}>
    <Input placeholder="foo@example.com" />
  </Form.Item>
  <Form.Item>
    <Button type="submit" variant="primary">提交</Button>
  </Form.Item>
</Form>
```

### 复合校验 + 自定义 validator

rules 支持 required / min / max / pattern / type / validator。validator 可返回 Promise。

```tsx
rules={[
  { required: true, message: "必填" },
  { pattern: /^[a-z0-9_]+$/, message: "只允许小写字母、数字和下划线" },
  {
    validator: async (_, value) => {
      if (value === "admin") throw new Error("admin 已被占用");
    },
  },
]}
```

### 非 value 类控件

Checkbox / Switch 的绑定属性不是 value,需要用 valuePropName 指定;对应的 trigger 名称通常仍是 onChange。

```tsx
<Form.Item name="agree" valuePropName="checked">
  <Checkbox>同意协议</Checkbox>
</Form.Item>

<Form.Item name="notify" valuePropName="checked">
  <Switch />
</Form.Item>
```

### 实时值预览

onValuesChange 可以监听任何字段变化。下方面板会实时展示 form.getFieldsValue() 的结果。

```tsx
<Form onValuesChange={(changed, all) => setSnapshot(all)}>
  ...
</Form>
<pre>{JSON.stringify(snapshot, null, 2)}</pre>
```

### 横排复选 (嵌套 Form.Item)

外层 Form.Item 只做布局(无 name),内层若干 Form.Item 各自绑定字段并加 noStyle。my-assistant 里 "新建角色" 弹窗用的就是这个模式。

```tsx
<Form.Item className="checkbox-row">
  <Form.Item name="addToHistory" valuePropName="checked" initialValue={true} noStyle>
    <Checkbox label="添加到登录列表" />
  </Form.Item>
  <Form.Item name="setAsLast" valuePropName="checked" initialValue={false} noStyle>
    <Checkbox label="设为最近登录" />
  </Form.Item>
</Form.Item>
```

### 命令式 API

通过 Form.useForm() 拿到实例,外部可主动 setFieldsValue / validateFields / resetFields。

```tsx
form.setFieldsValue({ title: "..." })
form.validateFields().then(values => {...})
form.resetFields()
```

## API

**Form**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| form | `FormInstance` | — | 由 useForm() 创建的实例,受控推荐传入 |
| layout | `"horizontal" | "vertical" | "inline"` | `"horizontal"` | 布局方式 |
| initialValues | `Partial<V>` | — | 字段初始值 |
| onFinish / onFinishFailed | `(values | {values, errorFields}) => void` | — | 提交成功/失败 |
| onValuesChange | `(changed, all) => void` | — | 任一字段变化 |
| requiredMark | `boolean` | `true` | 是否在必填 label 前显示 * |
| disabled | `boolean` | — | 整体禁用 |


**Form.Item**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| name | `string` | — | 字段 key;省略则仅布局不绑定 |
| label | `ReactNode` | — | 字段标签 |
| rules | `Rule[]` | — | 校验规则数组 |
| noStyle | `boolean` | — | 不渲染外层 item 包装 |
| valuePropName | `string` | `"value"` | 注入值的 prop 名 |
| trigger | `string` | `"onChange"` | 监听的事件名 |
| initialValue | `any` | — | 此字段初始值;优先级低于 Form initialValues |
| help / extra | `ReactNode` | — | 辅助/补充说明 |
| hidden | `boolean` | — | 隐藏(字段仍保留) |


**Rule**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| required | `boolean` | — | 必填 |
| message | `string` | — | 错误提示文案 |
| pattern | `RegExp` | — | 正则校验 |
| min / max / len | `number` | — | 字符串/数组长度或数字范围 |
| type | `string` | — | "string" \| "number" \| "email" \| "url" \| "array" |
| validator | `(rule, value) => Promise<void>` | — | 自定义,抛出错误或 reject 视为失败 |


**FormInstance**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| getFieldValue / getFieldsValue | `(name?) => any` | — | 读取字段值 |
| setFieldValue / setFieldsValue | `(name/obj, value) => void` | — | 写入字段值 |
| validateFields | `(names?) => Promise<V>` | — | 触发校验,返回 Promise<values>,失败时 reject({errorFields}) |
| resetFields | `(names?) => void` | — | 重置到初始值 |
| isFieldTouched | `(name) => boolean` | — | 字段是否交互过 |
| getFieldError | `(name) => string[]` | — | 字段当前错误信息 |
| submit | `() => void` | — | 等同于触发提交 |


---
[← 回到索引](../llms.md)
