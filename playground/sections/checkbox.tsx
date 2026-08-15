import * as React from "react";
import { Button, Checkbox, Divider, Form, message } from "lumina";
import { DocPage } from "../docs";
import { Row } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

const SectionCheckbox: React.FC<SectionCtx> = () => {
  const [s, setS] = React.useState({ a: true, b: false, c: true });
  const all = s.a && s.b && s.c;
  const some = (s.a || s.b || s.c) && !all;
  return (
    <DocPage
      whenToUse={<p>在一组选项中进行多项选择,或单独切换某个开关项。</p>}
      demos={[
        {
          id: "basic",
          title: "基础用法",
          code: `<Checkbox checked={v} onChange={setV} label="同意协议" />`,
          render: () => (
            <Row>
              <Checkbox defaultChecked label="自动保存" />
              <Checkbox label="启用实验功能" />
              <Checkbox disabled label="已锁定" />
            </Row>
          ),
        },
        {
          id: "native-form",
          title: "Lumina 表单校验",
          description: "通过 Form.Item 与 message 提供一致的组件反馈，不再触发浏览器原生 required 气泡。name / value 仍会透传到真实 checkbox。",
          code: `<Form
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
</Form>`,
          render: () => (
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
              <Button type="submit" size="sm">验证提交</Button>
            </Form>
          ),
        },
        {
          id: "indeterminate",
          title: "全选/半选",
          description: "indeterminate 用来表示部分选中。",
          code: `<Checkbox indeterminate={some} checked={all} onChange={...} label="全选" />`,
          render: () => (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Checkbox
                checked={all}
                indeterminate={some}
                onChange={(v) => setS({ a: v, b: v, c: v })}
                label="全选"
              />
              <Divider />
              <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 22 }}>
                <Checkbox checked={s.a} onChange={(v) => setS((c) => ({ ...c, a: v }))} label="选项 A" />
                <Checkbox checked={s.b} onChange={(v) => setS((c) => ({ ...c, b: v }))} label="选项 B" />
                <Checkbox checked={s.c} onChange={(v) => setS((c) => ({ ...c, c: v }))} label="选项 C" />
              </div>
            </div>
          ),
        },
      ]}
      api={[
        {
          title: "Checkbox",
          rows: [
            { prop: "checked / defaultChecked", description: "受控/初始", type: "boolean" },
            { prop: "indeterminate", description: "半选态", type: "boolean", default: "false" },
            { prop: "onChange", description: "变更", type: "(checked: boolean) => void" },
            { prop: "label", description: "右侧文案", type: "ReactNode" },
            { prop: "name / value", description: "原生表单字段名与选中时提交的值", type: "string" },
            { prop: "required / form", description: "原生必填约束与关联 form id", type: "boolean / string" },
            { prop: "invalid", description: "错误态，可由 Form.Item 自动注入", type: "boolean", default: "false" },
            { prop: "disabled", description: "禁用", type: "boolean", default: "false" },
          ],
        },
      ]}
    />
  );
};

export default defineSection({
  id: "checkbox",
  group: "表单",
  order: 30,
  label: "Checkbox 复选框",
  eyebrow: "DATA ENTRY",
  title: "Checkbox 复选框",
  desc: "在一组选项中进行多项选择,或独立切换某个开关项。",
  Component: SectionCheckbox,
});
