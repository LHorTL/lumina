import * as React from "react";
import { Radio, RadioGroup } from "lumina";
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
          id: "single",
          title: "单个 Radio",
          description: "单项控件可用于自定义组合场景;表单里通常优先使用 RadioGroup。",
          code: `<Radio label="接收更新" defaultChecked />`,
          render: () => <Radio label="接收更新" defaultChecked />,
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
        {
          id: "segmented",
          title: "分段外观",
          description: "variant=\"segmented\" 用同一组选项表达更紧凑的互斥切换。",
          code: `<RadioGroup
  variant="segmented"
  defaultValue="grid"
  options={[
    { value: "grid", label: "网格" },
    { value: "list", label: "列表" },
    { value: "card", label: "卡片" },
  ]}
/>`,
          render: () => (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-start" }}>
              <RadioGroup
                variant="segmented"
                defaultValue="grid"
                options={[
                  { value: "grid", label: "网格" },
                  { value: "list", label: "列表" },
                  { value: "card", label: "卡片" },
                ]}
              />
              <RadioGroup
                variant="segmented"
                size="sm"
                defaultValue="day"
                options={[
                  { value: "day", label: "日" },
                  { value: "week", label: "周" },
                  { value: "month", label: "月" },
                ]}
              />
              <RadioGroup
                variant="segmented"
                size="lg"
                defaultValue="all"
                options={[
                  { value: "all", label: "全部" },
                  { value: "open", label: "进行中" },
                  { value: "done", label: "已完成" },
                ]}
              />
            </div>
          ),
        },
      ]}
      api={[
        {
          title: "Radio",
          rows: [
            { prop: "checked / defaultChecked", description: "受控/初始选中", type: "boolean" },
            { prop: "onChange", description: "变更", type: "(checked: boolean) => void" },
            { prop: "label", description: "标签", type: "ReactNode" },
            { prop: "disabled", description: "禁用", type: "boolean" },
          ],
        },
        {
          title: "RadioGroup",
          rows: [
            { prop: "options", description: "选项数组", type: "{ value, label, disabled? }[]", required: true },
            { prop: "value / defaultValue", description: "受控/初始", type: "T" },
            { prop: "onChange", description: "变更", type: "(value: T) => void" },
            { prop: "direction", description: "方向", type: `"vertical" | "horizontal"`, default: `"vertical"` },
            { prop: "variant", description: "外观", type: `"default" | "segmented"`, default: `"default"` },
            { prop: "size", description: "分段外观尺寸", type: `"sm" | "md" | "lg"`, default: `"md"` },
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
