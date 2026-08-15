# Checkbox 复选框

> 在一组选项中进行多项选择,或独立切换某个开关项。

## 导入

```tsx
import { Checkbox } from "@fangxinyan/lumina";
```

## 示例

### 基础用法

```tsx
<Checkbox checked={v} onChange={setV} label="同意协议" />
```

### Lumina 表单校验

通过 Form.Item 与 message 提供一致的组件反馈，不再触发浏览器原生 required 气泡。name / value 仍会透传到真实 checkbox。

```tsx
<Form
  layout="inline"
  onFinish={() => message.success({ key: "checkbox-validation", content: "条款已确认" })}
  onFinishFailed={() => message.warning({ key: "checkbox-validation", content: "请先同意条款" })}
>
  <Form.Item
    name="agreement"
    valuePropName="checked"
    rules={[{
      required: true,
      message: "请同意条款",
      validator: (_rule, checked) => checked
        ? Promise.resolve()
        : Promise.reject(new Error("请同意条款")),
    }]}
  >
    <Checkbox name="agreement" value="accepted" label="同意条款" />
  </Form.Item>
  <Button type="submit">验证提交</Button>
</Form>
```

### 全选/半选

indeterminate 用来表示部分选中。

```tsx
<Checkbox indeterminate={some} checked={all} onChange={...} label="全选" />
```

## API

**Checkbox**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| checked / defaultChecked | `boolean` | — | 受控/初始 |
| indeterminate | `boolean` | `false` | 半选态 |
| onChange | `(checked: boolean) => void` | — | 变更 |
| label | `ReactNode` | — | 右侧文案 |
| name / value | `string` | — | 原生表单字段名与选中时提交的值 |
| required / form | `boolean / string` | — | 原生必填约束与关联 form id |
| invalid | `boolean` | `false` | 错误态，可由 Form.Item 自动注入 |
| disabled | `boolean` | `false` | 禁用 |


---
[← 回到索引](../llms.md)
