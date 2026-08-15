# Switch 开关

> 二元状态切换器。

## 导入

```tsx
import { Switch } from "@fangxinyan/lumina";
```

## 示例

### 基础用法

```tsx
<Switch checked={v} onChange={setV} label="开启通知" />
```

### Lumina 表单校验

通过 Form.Item 与 message 提供一致的组件反馈，不再触发浏览器原生 required 气泡。name / value 仍会透传到真实 checkbox。

```tsx
<Form
  layout="inline"
  onFinish={() => message.success({ key: "switch-validation", content: "通知已开启" })}
  onFinishFailed={() => message.warning({ key: "switch-validation", content: "请先开启通知" })}
>
  <Form.Item
    name="notifications"
    valuePropName="checked"
    rules={[{
      required: true,
      message: "请开启通知",
      validator: (_rule, checked) => checked
        ? Promise.resolve()
        : Promise.reject(new Error("请开启通知")),
    }]}
  >
    <Switch name="notifications" value="enabled" label="开启通知" />
  </Form.Item>
  <Button type="submit">验证提交</Button>
</Form>
```

### 尺寸

提供 sm / md 两档。

```tsx
<Switch size="sm" defaultChecked />
<Switch defaultChecked />
```

### 禁用

```tsx
<Switch disabled label="不可用" />
<Switch disabled defaultChecked label="禁用且开启" />
```

### 轨道内文本

checkedChildren / unCheckedChildren 在轨道内显示简短文字(如 ON/OFF)。

```tsx
<Switch defaultChecked checkedChildren="ON" unCheckedChildren="OFF" />
<Switch defaultChecked checkedChildren="1" unCheckedChildren="0" />
```

## API

**Switch**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| checked / defaultChecked | `boolean` | — | 受控/初始 |
| onChange | `(checked: boolean) => void` | — | 状态变更 |
| label | `ReactNode` | — | 右侧文案 |
| checkedChildren | `ReactNode` | — | 轨道内选中状态文本/图标 |
| unCheckedChildren | `ReactNode` | — | 轨道内未选中状态文本/图标 |
| size | `"sm" | "md"` | `"md"` | 尺寸 |
| name / value | `string` | — | 原生表单字段名与开启时提交的值 |
| required / form | `boolean / string` | — | 原生必填约束与关联 form id |
| invalid | `boolean` | `false` | 错误态，可由 Form.Item 自动注入 |
| disabled | `boolean` | `false` | 禁用 |


---
[← 回到索引](../llms.md)
