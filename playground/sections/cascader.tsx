import * as React from "react";
import {
  Cascader,
  Icon,
  Tag,
  type CascaderOption,
  type CascaderOptionRenderInfo,
} from "lumina";
import { DocPage } from "../docs";
import { Field } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

/** 资源级联节点的附加展示信息。 */
interface AssetNodeMeta {
  description: string;
  count: number;
  tone: "neutral" | "info" | "accent" | "success";
  icon: "folder" | "image" | "file" | "layers";
}

const ASSET_NODE_META: Record<string, AssetNodeMeta> = {
  workspace: { description: "团队共享空间", count: 128, tone: "accent", icon: "layers" },
  design: { description: "设计源文件与规范", count: 64, tone: "info", icon: "folder" },
  marketing: { description: "市场活动素材", count: 38, tone: "success", icon: "folder" },
  components: { description: "组件截图与封面", count: 26, tone: "accent", icon: "image" },
  guidelines: { description: "品牌与交互规范", count: 12, tone: "neutral", icon: "file" },
  campaign: { description: "夏季推广活动", count: 18, tone: "success", icon: "image" },
};

const ASSET_OPTIONS: CascaderOption[] = [
  {
    value: "workspace",
    label: "Lumina 工作区",
    text: "Lumina 工作区 团队共享空间",
    ariaLabel: "Lumina 工作区",
    children: [
      {
        value: "design",
        label: "设计资产",
        text: "设计资产 源文件 规范",
        ariaLabel: "设计资产",
        children: [
          { value: "components", label: "组件素材", text: "组件素材 截图 封面", ariaLabel: "组件素材" },
          { value: "guidelines", label: "规范文档", text: "规范文档 品牌 交互", ariaLabel: "规范文档" },
        ],
      },
      {
        value: "marketing",
        label: "市场素材",
        text: "市场素材 活动",
        ariaLabel: "市场素材",
        children: [{ value: "campaign", label: "夏季活动", text: "夏季推广活动", ariaLabel: "夏季活动" }],
      },
    ],
  },
];

/** 渲染带说明和数量的复杂级联节点。 */
const renderAssetOption = (
  option: CascaderOption,
  info: CascaderOptionRenderInfo
): React.ReactNode => {
  const meta = ASSET_NODE_META[option.value];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBlock: 5 }}>
      <Icon name={meta.icon} size={15} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 650 }}>
          <span>{option.label}</span>
          {info.selected && <Tag tone="accent">当前层</Tag>}
        </div>
        <div style={{ marginTop: 3, color: "var(--fg-muted)", fontSize: 11 }}>{meta.description}</div>
      </div>
      <Tag tone={meta.tone}>{meta.count}</Tag>
    </div>
  );
};

/** 把完整资源路径压缩为适合触发器的一行摘要。 */
const renderAssetSelected = (selectedOptions: CascaderOption[]): React.ReactNode => {
  const leaf = selectedOptions[selectedOptions.length - 1];
  if (!leaf) return null;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, minWidth: 0 }}>
      <Icon name={ASSET_NODE_META[leaf.value].icon} size={14} />
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{leaf.label}</span>
      <Tag tone="neutral">{selectedOptions.length} 级路径</Tag>
    </span>
  );
};

const SectionCascader: React.FC<SectionCtx> = () => {
  const [addr, setAddr] = React.useState<string[]>(["asia", "cn", "shanghai"]);
  const [assetPath, setAssetPath] = React.useState<string[]>(["workspace", "design", "components"]);
  const regionIcon = (color: string) => (
    <span
      style={{
        width: 14,
        height: 14,
        borderRadius: 4,
        background: color,
        boxShadow: "var(--neu-shadow-subtle)",
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
            { value: "hangzhou", label: "杭州（禁用）", disabled: true },
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
      whenToUse={<p>从一组关联数据集合中进行多级选择,例如选择省/市/区。触发器支持 ArrowDown 打开、Esc 关闭，以及 Delete / Backspace 清空。</p>}
      demos={[
        {
          id: "basic",
          title: "基础用法",
          span: 2,
          description: "option.icon 支持 IconName 或 ReactNode；禁用节点不可通过列选择或搜索结果绕过选中。",
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
          id: "custom-content",
          title: "复杂节点与独立选中渲染",
          span: 2,
          description: "optionRender 可为每一级节点添加多行信息；selectedRender 只在触发器中显示紧凑摘要。listHeight 与 popupStyle 控制列高和面板宽度。",
          code: `<Cascader
  options={assetOptions}
  value={assetPath}
  onChange={setAssetPath}
  optionRender={(option, info) => <AssetNode option={option} selected={info.selected} />}
  selectedRender={(selectedOptions) => <AssetPath options={selectedOptions} />}
  listHeight={380}
  popupStyle={{ minWidth: "min(680px, calc(100vw - 16px))" }}
/>`,
          render: () => (
            <Field label="资源目录" hint="面板展示完整节点信息，触发器只显示叶子节点与路径层级。">
              <Cascader
                options={ASSET_OPTIONS}
                value={assetPath}
                onChange={setAssetPath}
                optionRender={renderAssetOption}
                selectedRender={renderAssetSelected}
                listHeight={380}
                popupStyle={{ minWidth: "min(680px, calc(100vw - 16px))" }}
              />
            </Field>
          ),
        },
        {
          id: "search",
          title: "搜索与清除",
          span: 2,
          description: "showSearch 开启路径搜索,allowClear 提供一键清空；搜索框打开后自动聚焦，禁用任一节点的路径不会进入搜索结果。",
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
            { prop: "options[].text", description: "复杂 label 的独立默认搜索文本", type: "string" },
            { prop: "options[].ariaLabel", description: "复杂节点或 optionRender 的独立可访问名称", type: "string" },
            { prop: "value / defaultValue", description: "受控/初始路径", type: "string[]" },
            { prop: "onChange", description: "提交路径时触发，同时返回对应选项对象", type: "(path: string[], selectedOptions?: CascaderOption[]) => void" },
            { prop: "placeholder", description: "占位文案", type: "string" },
            { prop: "disabled", description: "禁用触发器并立即关闭已打开的面板", type: "boolean", default: "false" },
            { prop: "allowClear", description: "显示清除按钮", type: "boolean", default: "false" },
            { prop: "showSearch", description: "搜索路径,支持 boolean / 对象配置", type: "boolean | { filter?, render?, limit? }" },
            { prop: "optionRender", description: "自定义每一级菜单节点内容，并获得 depth / selected / hasChildren 状态", type: "(option, info) => ReactNode" },
            { prop: "selectedRender", description: "自定义触发器中的紧凑已选路径内容", type: "(selectedOptions, values) => ReactNode" },
            { prop: "listHeight", description: "每列和搜索结果滚动区域的最大高度", type: "number", default: "280" },
            { prop: "popupStyle", description: "Portal 浮层内联样式，可覆盖宽度或高度", type: "CSSProperties" },
            { prop: "popupClassName / dropdownClassName", description: "Portal 浮层面板 className；会自动跟随所属 Modal / Drawer 的层级", type: "string" },
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
