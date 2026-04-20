import * as React from "react";
import { RadioGroup } from "lumina";
import { DocPage } from "../docs";
import { defineSection, type SectionCtx } from "./_types";

const SectionRadio: React.FC<SectionCtx> = () => {
  const [v, setV] = React.useState("weekly");
  return (
    <DocPage
      whenToUse={<p>在多个互斥的选项中进行单项选择。</p>}
      demos={[
        {
          id: "basic",
          title: "基础用法",
          code: `<RadioGroup value={v} onChange={setV} options={[
  { value: "daily", label: "每日" },
  { value: "weekly", label: "每周" },
]} />`,
          render: () => (
            <RadioGroup
              value={v}
              onChange={setV}
              options={[
                { value: "daily", label: "每日摘要" },
                { value: "weekly", label: "每周摘要" },
                { value: "monthly", label: "每月摘要" },
                { value: "never", label: "从不发送" },
              ]}
            />
          ),
        },
        {
          id: "horizontal",
          title: "水平排列",
          description: "direction='horizontal'。",
          code: `<RadioGroup direction="horizontal" ... />`,
          render: () => (
            <RadioGroup
              direction="horizontal"
              defaultValue="m"
              options={[
                { value: "s", label: "小" },
                { value: "m", label: "中" },
                { value: "l", label: "大" },
                { value: "xl", label: "超大", disabled: true },
              ]}
            />
          ),
        },
      ]}
      api={[
        {
          title: "RadioGroup",
          rows: [
            { prop: "options", description: "选项数组", type: "{ value, label, disabled? }[]", required: true },
            { prop: "value / defaultValue", description: "受控/初始", type: "T" },
            { prop: "onChange", description: "变更", type: "(value: T) => void" },
            { prop: "direction", description: "方向", type: `"vertical" | "horizontal"`, default: `"vertical"` },
          ],
        },
      ]}
    />
  );
};

export default defineSection({
  id: "radio",
  group: "表单",
  order: 40,
  label: "Radio 单选",
  eyebrow: "DATA ENTRY",
  title: "Radio 单选",
  desc: "在多个互斥选项中进行单项选择。",
  Component: SectionRadio,
});
