import * as React from "react";
import { InputNumber } from "lumina";
import { DocPage } from "../docs";
import { Field, Row } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

const SectionInputNumber: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={<p>数字输入框,带上下步进按钮、键盘 ↑↓ 增减、min / max 钳位、precision 小数位控制。</p>}
    demos={[
      {
        id: "basic",
        title: "基础",
        code: `<InputNumber defaultValue={5} min={0} max={100} />`,
        render: () => (
          <Field label="数量">
            <InputNumber defaultValue={5} min={0} max={100} />
          </Field>
        ),
      },
      {
        id: "precision",
        title: "小数精度",
        code: `<InputNumber defaultValue={0.5} min={0} max={1} step={0.1} precision={2} />`,
        render: () => (
          <Field label="比例" hint="step 0.1, precision 2">
            <InputNumber defaultValue={0.5} min={0} max={1} step={0.1} precision={2} />
          </Field>
        ),
      },
      {
        id: "sizes",
        title: "尺寸",
        span: 2,
        code: `<InputNumber size="sm" /> / <InputNumber /> / <InputNumber size="lg" />`,
        render: () => (
          <Row gap={16}>
            <Field label="sm"><InputNumber size="sm" defaultValue={1} /></Field>
            <Field label="md"><InputNumber defaultValue={1} /></Field>
            <Field label="lg"><InputNumber size="lg" defaultValue={1} /></Field>
          </Row>
        ),
      },
      {
        id: "no-controls",
        title: "隐藏步进按钮",
        code: `<InputNumber controls={false} defaultValue={100} />`,
        render: () => (
          <Field label="纯输入">
            <InputNumber controls={false} defaultValue={100} />
          </Field>
        ),
      },
      {
        id: "controlled",
        title: "受控",
        span: 2,
        code: `const [v, setV] = useState(10);
<InputNumber value={v} onChange={setV} />`,
        render: () => {
          const Live = () => {
            const [v, setV] = React.useState<number | null>(10);
            return (
              <Row gap={16}>
                <Field label="value"><InputNumber value={v} onChange={setV} min={0} max={100} /></Field>
                <Field label=""><span style={{ fontSize: 12, color: "var(--fg-muted)" }}>当前:{v ?? "null"}</span></Field>
              </Row>
            );
          };
          return <Live />;
        },
      },
    ]}
    api={[
      {
        title: "InputNumber",
        rows: [
          { prop: "value / defaultValue", description: "受控 / 初始值", type: "number | null" },
          { prop: "onChange", description: "变更回调", type: "(value: number | null) => void" },
          { prop: "onPressEnter", description: "回车事件", type: "(e) => void" },
          { prop: "min / max", description: "数值范围", type: "number" },
          { prop: "step", description: "步进值", type: "number", default: "1" },
          { prop: "precision", description: "小数位数", type: "number" },
          { prop: "size", description: "尺寸", type: `"sm" | "md" | "lg"`, default: `"md"` },
          { prop: "controls", description: "是否显示步进按钮", type: "boolean", default: "true" },
          { prop: "disabled / readOnly / placeholder", description: "常规属性", type: "-" },
          { prop: "prefix / suffix", description: "内嵌前/后置内容", type: "ReactNode" },
        ],
      },
    ]}
  />
);

export default defineSection({
  id: "inputnumber",
  group: "表单",
  order: 15,
  label: "InputNumber 数字输入",
  eyebrow: "FORM",
  title: "InputNumber 数字输入",
  desc: "带步进按钮的数字输入框。",
  Component: SectionInputNumber,
});
