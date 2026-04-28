import * as React from "react";
import { Cascader } from "lumina";
import { DocPage } from "../docs";
import { Field } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

const SectionCascader: React.FC<SectionCtx> = () => {
  const [addr, setAddr] = React.useState<string[]>(["asia", "cn", "shanghai"]);
  const regionIcon = (color: string) => (
    <span
      style={{
        width: 14,
        height: 14,
        borderRadius: 4,
        background: color,
        boxShadow: "var(--neu-flat)",
      }}
    />
  );
  const regions = [
    {
      value: "asia",
      label: "亚洲",
      icon: "layers" as const,
      children: [
        {
          value: "cn",
          label: "中国",
          icon: regionIcon("var(--accent)"),
          children: [
            { value: "beijing", label: "北京" },
            { value: "shanghai", label: "上海" },
            { value: "hangzhou", label: "杭州" },
          ],
        },
        {
          value: "jp",
          label: "日本",
          icon: regionIcon("var(--success)"),
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
      icon: regionIcon("var(--info)"),
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
          description: "option.icon 支持 IconName 或 ReactNode。",
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
        {
          id: "search",
          title: "搜索与清除",
          span: 2,
          description: "showSearch 开启路径搜索,allowClear 提供一键清空,popupClassName 可标记浮层。",
          code: `<Cascader
  showSearch={{ limit: 8 }}
  allowClear
  popupClassName="my-cascader-popup"
  options={regions}
  value={addr}
  onChange={setAddr}
/>`,
          render: () => (
            <Field label="可搜索地区">
              <Cascader
                showSearch={{ limit: 8 }}
                allowClear
                popupClassName="demo-cascader-popup"
                options={regions}
                value={addr}
                onChange={setAddr}
              />
            </Field>
          ),
        },
      ]}
      api={[
        {
          title: "Cascader",
          rows: [
            { prop: "options", description: "层级选项树", type: "CascaderOption[]", required: true },
            { prop: "options[].icon", description: "选项前置图标,可传内置图标名或自定义节点", type: "IconName | ReactNode" },
            { prop: "value / defaultValue", description: "受控/初始路径", type: "string[]" },
            { prop: "onChange", description: "选择叶子时触发", type: "(path: string[]) => void" },
            { prop: "placeholder", description: "占位文案", type: "string" },
            { prop: "disabled", description: "禁用", type: "boolean", default: "false" },
            { prop: "allowClear", description: "显示清除按钮", type: "boolean", default: "false" },
            { prop: "showSearch", description: "搜索路径,支持 boolean / 对象配置", type: "boolean | { filter?, render?, limit? }" },
            { prop: "popupClassName / dropdownClassName", description: "浮层面板 className", type: "string" },
            { prop: "changeOnSelect", description: "允许选中非叶子节点", type: "boolean", default: "false" },
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
