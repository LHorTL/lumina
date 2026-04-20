import * as React from "react";
import { Slider } from "lumina";
import { DocPage } from "../docs";
import { defineSection, type SectionCtx } from "./_types";

const SectionSlider: React.FC<SectionCtx> = () => {
  const [v, setV] = React.useState(40);
  return (
    <DocPage
      whenToUse={<p>需要在一段连续的数值区间内取值时使用,例如音量、亮度。</p>}
      demos={[
        {
          id: "basic",
          title: "基础用法",
          code: `<Slider value={v} onChange={setV} showValue />`,
          render: () => <Slider value={v} onChange={setV} showValue />,
        },
        {
          id: "step",
          title: "步进 / 范围",
          description: "min/max/step 控制取值范围与步进。",
          code: `<Slider min={0} max={10} step={1} defaultValue={5} showValue />`,
          render: () => <Slider min={0} max={10} step={1} defaultValue={5} showValue />,
        },
        {
          id: "tone",
          title: "色调",
          code: `<Slider tone="success" defaultValue={70} />
<Slider tone="warning" defaultValue={50} />
<Slider tone="danger" defaultValue={88} />`,
          render: () => (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Slider tone="success" defaultValue={70} />
              <Slider tone="warning" defaultValue={50} />
              <Slider tone="danger" defaultValue={88} />
            </div>
          ),
        },
      ]}
      api={[
        {
          title: "Slider",
          rows: [
            { prop: "value / defaultValue", description: "受控/初始", type: "number" },
            { prop: "onChange", description: "变更", type: "(value: number) => void" },
            { prop: "min / max / step", description: "区间与步进", type: "number" },
            { prop: "tone", description: "色调", type: `"accent" | "success" | "warning" | "danger"`, default: `"accent"` },
            { prop: "showValue", description: "显示数值", type: "boolean", default: "false" },
            { prop: "disabled", description: "禁用", type: "boolean", default: "false" },
          ],
        },
      ]}
    />
  );
};

export default defineSection({
  id: "slider",
  group: "表单",
  order: 50,
  label: "Slider 滑块",
  eyebrow: "DATA ENTRY",
  title: "Slider 滑块",
  desc: "在连续数值区间内取值。",
  Component: SectionSlider,
});
