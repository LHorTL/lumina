import * as React from "react";
import { Button, Input, Textarea, message } from "lumina";
import { DocPage, type ApiRow } from "../docs";
import { Field, Row } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

const textareaApi: ApiRow[] = [
  { prop: "value / defaultValue", description: "受控值 / 初值", type: "string" },
  { prop: "onChange", description: "变更回调,传入 React 原生事件", type: "(event) => void" },
  { prop: "onValueChange", description: "值回调便捷写法", type: "(value: string, event) => void" },
  { prop: "allowClear", description: "右上角显示清除按钮", type: "boolean", default: "false" },
  { prop: "maxLength", description: "最大字符数,透传至原生 textarea", type: "number" },
  { prop: "showCount", description: "显示字数统计;有 maxLength 时显示 N / max", type: "boolean", default: "false" },
  { prop: "invalid", description: "错误态", type: "boolean", default: "false" },
  { prop: "disabled", description: "禁用", type: "boolean", default: "false" },
  { prop: "rows", description: "文本域可见行数,透传至原生 textarea", type: "number" },
  { prop: "className / style / id / data-* / aria-*", description: "透传至原生 textarea", type: "native attrs" },
];

const SectionTextarea: React.FC<SectionCtx> = () => {
  const [notes, setNotes] = React.useState("把复杂配置先写成草稿,再提交。");
  const [feedback, setFeedback] = React.useState("");
  const [bio, setBio] = React.useState("Lumina 是面向 Electron 桌面应用的拟态组件库。");

  return (
    <DocPage
      whenToUse={
        <p>
          输入多行文本时使用,例如备注、描述、提示词、反馈内容。需要和单行输入混排时,也可以通过
          <code>Input.TextArea</code> 访问同一实现。
        </p>
      }
      demos={[
        {
          id: "basic",
          title: "基础用法",
          description: "Textarea 直接暴露原生 textarea ref 和常用原生属性。",
          code: `const [notes, setNotes] = useState("");

<Textarea
  value={notes}
  onValueChange={setNotes}
  rows={4}
  placeholder="写点什么..."
/>`,
          render: () => (
            <Field label="备注">
              <Textarea
                value={notes}
                onValueChange={setNotes}
                rows={4}
                placeholder="写点什么..."
              />
            </Field>
          ),
        },
        {
          id: "count-clear",
          title: "可清除与字数统计",
          description: "allowClear、maxLength、showCount 可组合使用,适合受限文本输入。",
          code: `<Textarea
  value={feedback}
  onValueChange={setFeedback}
  allowClear
  maxLength={160}
  showCount
  placeholder="最多输入 160 个字"
/>`,
          render: () => (
            <Field label="反馈">
              <Textarea
                value={feedback}
                onValueChange={setFeedback}
                allowClear
                maxLength={160}
                showCount
                placeholder="最多输入 160 个字"
              />
            </Field>
          ),
        },
        {
          id: "states",
          title: "错误与禁用",
          span: 2,
          description: "invalid 只负责视觉状态;错误文案通常交给 Field 或 Form.Item 展示。",
          code: `<Textarea invalid defaultValue="太短" />
<Textarea disabled defaultValue="只读说明..." />`,
          render: () => (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
              <Field label="简介" invalid={bio.length < 20} hint={bio.length < 20 ? "至少输入 20 个字符" : "长度合适"}>
                <Textarea
                  value={bio}
                  onValueChange={setBio}
                  invalid={bio.length < 20}
                  rows={3}
                />
              </Field>
              <Field label="系统说明">
                <Textarea
                  disabled
                  defaultValue="这段内容来自系统模板,当前不可编辑。"
                  rows={3}
                />
              </Field>
            </div>
          ),
        },
        {
          id: "input-alias",
          title: "Input.TextArea 别名",
          description: "当表单统一从 Input 命名空间取控件时,Input.TextArea 与 Textarea 等价。",
          code: `<Input.TextArea
  defaultValue="Input.TextArea 与 Textarea 使用同一套能力"
  allowClear
  showCount
/>`,
          render: () => (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Input.TextArea
                defaultValue="Input.TextArea 与 Textarea 使用同一套能力。"
                allowClear
                showCount
              />
              <Row gap={8}>
                <Button
                  size="sm"
                  icon="copy"
                  onClick={() => message.info("可以直接 import { Textarea } 使用")}
                >
                  复制提示
                </Button>
              </Row>
            </div>
          ),
        },
      ]}
      api={[
        { title: "Textarea / TextArea / Input.TextArea", rows: textareaApi },
      ]}
    />
  );
};

export default defineSection({
  id: "textarea",
  group: "表单",
  order: 11,
  label: "Textarea 多行输入",
  eyebrow: "DATA ENTRY",
  title: "Textarea 多行输入",
  desc: "多行文本输入域,支持清除、字数统计、错误态和原生 textarea 属性。",
  Component: SectionTextarea,
});
