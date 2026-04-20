import * as React from "react";
import { Cascader } from "lumina";
import { DocPage } from "../docs";
import { Field } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

const SectionCascader: React.FC<SectionCtx> = () => {
  const [addr, setAddr] = React.useState<string[]>(["asia", "cn", "shanghai"]);
  const regions = [
    {
      value: "asia",
      label: "亚洲",
      icon: "layers" as const,
      children: [
        {
          value: "cn",
          label: "中国",
          children: [
            { value: "beijing", label: "北京" },
            { value: "shanghai", label: "上海" },
            { value: "hangzhou", label: "杭州" },
          ],
        },
        {
          value: "jp",
          label: "日本",
          children: [
            { value: "tokyo", label: "东京" },
            { value: "osaka", label: "大阪" },
          ],
        },
      ],
    },
    {
      value: "europe",
      label: "欧洲",
      icon: "layers" as const,
      children: [
        { value: "de", label: "德国", children: [{ value: "berlin", label: "柏林" }] },
        { value: "fr", label: "法国", children: [{ value: "paris", label: "巴黎" }] },
      ],
    },
  ];
  return (
    <DocPage
      whenToUse={<p>从一组关联数据集合中进行多级选择,例如选择省/市/区。</p>}
      demos={[
        {
          id: "basic",
          title: "基础用法",
          span: 2,
          code: `<Cascader options={regions} value={addr} onChange={setAddr} />`,
          render: () => (
            <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
              <Field label="地区">
                <Cascader options={regions} value={addr} onChange={setAddr} />
              </Field>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 22 }}>
                <div className="showcase-label">已选路径</div>
                <div style={{ fontFamily: "var(--font-mono)", color: "var(--accent-ink)" }}>
                  {addr.join(" / ") || "—"}
                </div>
              </div>
            </div>
          ),
        },
      ]}
      api={[
        {
          title: "Cascader",
          rows: [
            { prop: "options", description: "层级选项树", type: "CascaderOption[]", required: true },
            { prop: "value / defaultValue", description: "受控/初始路径", type: "string[]" },
            { prop: "onChange", description: "选择叶子时触发", type: "(path: string[]) => void" },
            { prop: "placeholder", description: "占位文案", type: "string" },
            { prop: "disabled", description: "禁用", type: "boolean", default: "false" },
          ],
        },
      ]}
    />
  );
};

export default defineSection({
  id: "cascader",
  group: "表单",
  order: 70,
  label: "Cascader 级联",
  eyebrow: "DATA ENTRY",
  title: "Cascader 级联选择",
  desc: "层级关联数据集合中的多级选择。",
  Component: SectionCascader,
});
