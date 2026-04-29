import * as React from "react";
import {
  Button,
  Checkbox,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  message,
} from "lumina";
import { DocPage } from "../docs";
import { Row } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

const SectionForm: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={
      <>
        <p>受控表单,封装字段绑定、校验规则、错误展示,适合中小型配置表单与提交流程。</p>
        <ul className="doc-usecase-list">
          <li>用 <code>Form.useForm()</code> 拿到实例,通过 <code>validateFields</code> / <code>setFieldsValue</code> / <code>resetFields</code> 操作表单</li>
          <li><code>Form.Item</code> 包裹输入控件,自动注入 value / onChange</li>
          <li>Checkbox 等用 <code>valuePropName=&quot;checked&quot;</code> 指定绑定到哪个 prop</li>
        </ul>
      </>
    }
    demos={[
      {
        id: "basic",
        title: "基础",
        span: 2,
        code: `const [form] = Form.useForm();

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
</Form>`,
        render: () => {
          const Live = () => {
            const [form] = Form.useForm<{ username: string; email: string }>();
            return (
              <Form
                form={form}
                layout="vertical"
                onFinish={(values) => message.success(`提交:${JSON.stringify(values)}`)}
                onFinishFailed={() => message.error("校验未通过")}
              >
                <Form.Item
                  name="username"
                  label="用户名"
                  rules={[{ required: true, message: "请输入用户名" }, { min: 3, message: "至少 3 个字符" }]}
                >
                  <Input placeholder="输入用户名" />
                </Form.Item>
                <Form.Item
                  name="email"
                  label="邮箱"
                  rules={[{ required: true, message: "请输入邮箱" }, { type: "email", message: "邮箱格式不正确" }]}
                >
                  <Input placeholder="foo@example.com" />
                </Form.Item>
                <Form.Item>
                  <Row gap={8}>
                    <Button type="submit" variant="primary">提交</Button>
                    <Button variant="ghost" type="button" onClick={() => form.resetFields()}>重置</Button>
                  </Row>
                </Form.Item>
              </Form>
            );
          };
          return <Live />;
        },
      },
      {
        id: "rules",
        title: "复合校验 + 自定义 validator",
        span: 2,
        description: "rules 支持 required / min / max / pattern / type / validator。validator 可返回 Promise。",
        code: `rules={[
  { required: true, message: "必填" },
  { pattern: /^[a-z0-9_]+$/, message: "只允许小写字母、数字和下划线" },
  {
    validator: async (_, value) => {
      if (value === "admin") throw new Error("admin 已被占用");
    },
  },
]}`,
        render: () => {
          const Live = () => {
            const [form] = Form.useForm<{ handle: string; port: number }>();
            return (
              <Form
                form={form}
                layout="vertical"
                initialValues={{ port: 8080 }}
                onFinish={(v) => message.success(`OK: ${JSON.stringify(v)}`)}
              >
                <Form.Item
                  name="handle"
                  label="handle"
                  rules={[
                    { required: true, message: "必填" },
                    { pattern: /^[a-z0-9_]+$/, message: "只允许小写字母、数字、下划线" },
                    {
                      validator: async (_, v) => {
                        if (v === "admin") throw new Error("admin 已被占用");
                      },
                    },
                  ]}
                  help="试试输入 admin"
                >
                  <Input placeholder="试试 admin / My-Name / hello_world" />
                </Form.Item>
                <Form.Item
                  name="port"
                  label="端口"
                  rules={[{ required: true }, { type: "number", min: 1024, max: 65535, message: "端口范围 1024-65535" }]}
                >
                  <InputNumber min={0} max={99999} />
                </Form.Item>
                <Form.Item>
                  <Button type="submit" variant="primary">提交</Button>
                </Form.Item>
              </Form>
            );
          };
          return <Live />;
        },
      },
      {
        id: "value-prop-name",
        title: "非 value 类控件",
        span: 2,
        description: "Checkbox / Switch 的绑定属性不是 value,需要用 valuePropName 指定;对应的 trigger 名称通常仍是 onChange。",
        code: `<Form.Item name="agree" valuePropName="checked">
  <Checkbox>同意协议</Checkbox>
</Form.Item>

<Form.Item name="notify" valuePropName="checked">
  <Switch />
</Form.Item>`,
        render: () => {
          const Live = () => {
            const [form] = Form.useForm<{ agree: boolean; notify: boolean; plan: string }>();
            return (
              <Form
                form={form}
                layout="vertical"
                initialValues={{ agree: false, notify: true, plan: "pro" }}
                onFinish={(v) => message.success(JSON.stringify(v))}
              >
                <Form.Item
                  name="agree"
                  valuePropName="checked"
                  rules={[{ validator: async (_, v) => { if (!v) throw new Error("请先勾选"); } }]}
                >
                  <Checkbox label="我已阅读并同意协议" />
                </Form.Item>
                <Form.Item name="notify" label="推送通知" valuePropName="checked">
                  <Switch />
                </Form.Item>
                <Form.Item name="plan" label="套餐">
                  <Select
                    options={[
                      { value: "free", label: "Free" },
                      { value: "pro", label: "Pro" },
                      { value: "team", label: "Team" },
                    ]}
                  />
                </Form.Item>
                <Form.Item>
                  <Button type="submit" variant="primary">提交</Button>
                </Form.Item>
              </Form>
            );
          };
          return <Live />;
        },
      },
      {
        id: "live",
        title: "实时值预览",
        span: 2,
        description: "onValuesChange 可以监听任何字段变化。下方面板会实时展示 form.getFieldsValue() 的结果。",
        code: `<Form onValuesChange={(changed, all) => setSnapshot(all)}>
  ...
</Form>
<pre>{JSON.stringify(snapshot, null, 2)}</pre>`,
        render: () => {
          const Live = () => {
            const [form] = Form.useForm<{ name: string; age: number; role: string; active: boolean }>();
            const [snapshot, setSnapshot] = React.useState<Record<string, unknown>>({
              name: "Alice",
              age: 28,
              role: "editor",
              active: true,
            });
            return (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
                <Form
                  form={form}
                  layout="vertical"
                  initialValues={{ name: "Alice", age: 28, role: "editor", active: true }}
                  onValuesChange={(_, all) => setSnapshot(all)}
                >
                  <Form.Item name="name" label="姓名" rules={[{ required: true, message: "必填" }]}>
                    <Input />
                  </Form.Item>
                  <Form.Item name="age" label="年龄" rules={[{ required: true }, { type: "number", min: 0, max: 120 }]}>
                    <InputNumber min={0} max={120} />
                  </Form.Item>
                  <Form.Item name="role" label="角色">
                    <Select
                      options={[
                        { value: "viewer", label: "Viewer" },
                        { value: "editor", label: "Editor" },
                        { value: "admin", label: "Admin" },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item name="active" label="启用" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Form>
                <pre
                  style={{
                    margin: 0,
                    padding: 14,
                    background: "var(--bg)",
                    boxShadow: "var(--neu-shadow-inset)",
                    borderRadius: "var(--r-md)",
                    fontSize: 12,
                    fontFamily: "var(--font-mono)",
                    color: "var(--fg-muted)",
                    lineHeight: 1.6,
                    overflow: "auto",
                  }}
                >
                  {JSON.stringify(snapshot, null, 2)}
                </pre>
              </div>
            );
          };
          return <Live />;
        },
      },
      {
        id: "nested",
        title: "横排复选 (嵌套 Form.Item)",
        span: 2,
        description: "外层 Form.Item 只做布局(无 name),内层若干 Form.Item 各自绑定字段并加 noStyle。my-assistant 里 \"新建角色\" 弹窗用的就是这个模式。",
        code: `<Form.Item className="checkbox-row">
  <Form.Item name="addToHistory" valuePropName="checked" initialValue={true} noStyle>
    <Checkbox label="添加到登录列表" />
  </Form.Item>
  <Form.Item name="setAsLast" valuePropName="checked" initialValue={false} noStyle>
    <Checkbox label="设为最近登录" />
  </Form.Item>
</Form.Item>`,
        render: () => {
          const Live = () => {
            const [form] = Form.useForm<{ addToHistory: boolean; setAsLast: boolean }>();
            const [last, setLast] = React.useState<Record<string, unknown> | null>(null);
            return (
              <Form
                form={form}
                layout="vertical"
                onFinish={(v) => setLast(v)}
              >
                <Form.Item name="account" label="账号" rules={[{ required: true, message: "必填" }]}>
                  <Input placeholder="输入账号" />
                </Form.Item>
                <Form.Item>
                  <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                    <Form.Item name="addToHistory" valuePropName="checked" initialValue={true} noStyle>
                      <Checkbox label="添加到登录列表" />
                    </Form.Item>
                    <Form.Item name="setAsLast" valuePropName="checked" initialValue={false} noStyle>
                      <Checkbox label="设为最近登录" />
                    </Form.Item>
                  </div>
                </Form.Item>
                <Form.Item>
                  <Button type="submit" variant="primary">提交</Button>
                </Form.Item>
                {last && (
                  <div style={{ fontSize: 12, color: "var(--fg-muted)", fontFamily: "var(--font-mono)" }}>
                    最近提交:{JSON.stringify(last)}
                  </div>
                )}
              </Form>
            );
          };
          return <Live />;
        },
      },
      {
        id: "imperative",
        title: "命令式 API",
        span: 2,
        description: "通过 Form.useForm() 拿到实例,外部可主动 setFieldsValue / validateFields / resetFields。",
        code: `form.setFieldsValue({ title: "..." })
form.validateFields().then(values => {...})
form.resetFields()`,
        render: () => {
          const Live = () => {
            const [form] = Form.useForm<{ title: string }>();
            return (
              <>
                <Form form={form} layout="vertical">
                  <Form.Item name="title" label="标题" rules={[{ required: true, message: "必填" }]}>
                    <Input placeholder="输入标题" />
                  </Form.Item>
                </Form>
                <Row gap={8}>
                  <Button onClick={() => form.setFieldsValue({ title: "来自 setFieldsValue" })}>Set</Button>
                  <Button onClick={async () => {
                    try {
                      const v = await form.validateFields();
                      message.success(`validate ok: ${JSON.stringify(v)}`);
                    } catch {
                      message.error("validate 失败");
                    }
                  }}>Validate</Button>
                  <Button variant="ghost" onClick={() => form.resetFields()}>Reset</Button>
                </Row>
              </>
            );
          };
          return <Live />;
        },
      },
    ]}
    api={[
      {
        title: "Form",
        rows: [
          { prop: "form", description: "由 useForm() 创建的实例,受控推荐传入", type: "FormInstance" },
          { prop: "layout", description: "布局方式", type: `"horizontal" | "vertical" | "inline"`, default: `"horizontal"` },
          { prop: "initialValues", description: "字段初始值", type: "Partial<V>" },
          { prop: "onFinish / onFinishFailed", description: "提交成功/失败", type: "(values | {values, errorFields}) => void" },
          { prop: "onValuesChange", description: "任一字段变化", type: "(changed, all) => void" },
          { prop: "requiredMark", description: "是否在必填 label 前显示 *", type: "boolean", default: "true" },
          { prop: "disabled", description: "整体禁用", type: "boolean" },
        ],
      },
      {
        title: "Form.Item",
        rows: [
          { prop: "name", description: "字段 key;省略则仅布局不绑定", type: "string" },
          { prop: "label", description: "字段标签", type: "ReactNode" },
          { prop: "rules", description: "校验规则数组", type: "Rule[]" },
          { prop: "noStyle", description: "不渲染外层 item 包装", type: "boolean" },
          { prop: "valuePropName", description: "注入值的 prop 名", type: "string", default: `"value"` },
          { prop: "trigger", description: "监听的事件名", type: "string", default: `"onChange"` },
          { prop: "initialValue", description: "此字段初始值;优先级低于 Form initialValues", type: "any" },
          { prop: "help / extra", description: "辅助/补充说明", type: "ReactNode" },
          { prop: "hidden", description: "隐藏(字段仍保留)", type: "boolean" },
        ],
      },
      {
        title: "Rule",
        rows: [
          { prop: "required", description: "必填", type: "boolean" },
          { prop: "message", description: "错误提示文案", type: "string" },
          { prop: "pattern", description: "正则校验", type: "RegExp" },
          { prop: "min / max / len", description: "字符串/数组长度或数字范围", type: "number" },
          { prop: "type", description: '"string" | "number" | "email" | "url" | "array"', type: "string" },
          { prop: "validator", description: "自定义,抛出错误或 reject 视为失败", type: "(rule, value) => Promise<void>" },
        ],
      },
      {
        title: "FormInstance",
        rows: [
          { prop: "getFieldValue / getFieldsValue", description: "读取字段值", type: "(name?) => any" },
          { prop: "setFieldValue / setFieldsValue", description: "写入字段值", type: "(name/obj, value) => void" },
          { prop: "validateFields", description: "触发校验,返回 Promise<values>,失败时 reject({errorFields})", type: "(names?) => Promise<V>" },
          { prop: "resetFields", description: "重置到初始值", type: "(names?) => void" },
          { prop: "isFieldTouched", description: "字段是否交互过", type: "(name) => boolean" },
          { prop: "getFieldError", description: "字段当前错误信息", type: "(name) => string[]" },
          { prop: "submit", description: "等同于触发提交", type: "() => void" },
        ],
      },
    ]}
  />
);

export default defineSection({
  id: "form",
  group: "表单",
  order: 90,
  label: "Form 表单",
  eyebrow: "FORM",
  title: "Form 表单",
  desc: "受控表单,字段绑定 + 校验。",
  Component: SectionForm,
});
