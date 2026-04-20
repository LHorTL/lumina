import * as React from "react";
import { Slider } from "lumina";
import { DocPage } from "../docs";
import { defineSection, type SectionCtx } from "./_types";

const SectionSlider: React.FC<SectionCtx> = () => {
  const [v, setV] = React.useState(40);
  const [rangeVal, setRangeVal] = React.useState<[number, number]>([20, 70]);
  return (
    <DocPage
      whenToUse={<p>需要在一段连续的数值区间内取值时使用,例如音量、亮度、价格区间。</p>}
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
        {
          id: "range",
          title: "双滑块区间",
          description: "range 模式下 value / onChange 采用 [min, max] 元组。",
          span: 2,
          code: `const [v, setV] = useState<[number, number]>([20, 70]);
<Slider range value={v} onChange={setV} showValue />`,
          render: () => <Slider range value={rangeVal} onChange={setRangeVal} showValue />,
        },
        {
          id: "marks",
          title: "刻度标记",
          description: "marks 提供可点击刻度,点击即可跳到该值。",
          span: 2,
          code: `<Slider
  defaultValue={37}
  marks={{ 0: "0°C", 26: "冷", 37: "正常", 100: "100°C" }}
/>`,
          render: () => (
            <Slider
              defaultValue={37}
              marks={{ 0: "0°C", 26: "冷", 37: "正常", 100: "100°C" }}
            />
          ),
        },
      ]}
      api={[
        {
          title: "Slider",
          rows: [
            { prop: "value / defaultValue", description: "受控/初始;range 模式下为 [number, number]", type: "number | [number, number]" },
            { prop: "onChange", description: "变更回调,range 模式返回元组", type: "(value) => void" },
            { prop: "min / max / step", description: "区间与步进", type: "number" },
            { prop: "range", description: "是否为双滑块区间模式", type: "boolean", default: "false" },
            { prop: "marks", description: "刻度,点击可跳到对应值", type: "Record<number, ReactNode>" },
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
