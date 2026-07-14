import * as React from "react";
import {
  Avatar,
  Button,
  Icon,
  Select,
  Tag,
  type SelectOption,
  type SelectOptionRenderInfo,
} from "lumina";
import { DocPage } from "../docs";
import { Field, Row } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

/** 套餐复杂选项所需的附加展示信息。 */
interface PlanMeta {
  description: string;
  price: string;
  tone: "accent" | "info" | "success";
  icon: "sparkle" | "user" | "layers";
}

const PLAN_META: Record<string, PlanMeta> = {
  personal: { description: "个人项目与轻量原型", price: "免费", tone: "info", icon: "user" },
  pro: { description: "完整组件库与高级主题能力", price: "¥99/月", tone: "accent", icon: "sparkle" },
  team: { description: "团队权限、审计与共享资产", price: "¥299/月", tone: "success", icon: "layers" },
};

/** 渲染包含图标、说明和价格的复杂 Select 菜单项。 */
const renderPlanOption = (
  option: SelectOption<string>,
  info: SelectOptionRenderInfo
): React.ReactNode => {
  const meta = PLAN_META[String(option.value)];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBlock: 6 }}>
      <Avatar size="sm" shape="square" alt={String(option.label).slice(0, 1)} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 650 }}>
          <span>{option.label}</span>
          {info.selected && <Tag tone="accent">当前</Tag>}
        </div>
        <div style={{ marginTop: 4, color: "var(--fg-muted)", fontSize: 12 }}>{meta.description}</div>
      </div>
      <Tag tone={meta.tone}>{meta.price}</Tag>
    </div>
  );
};

/** 把复杂套餐压缩为适合固定高度触发器的已选内容。 */
const renderPlanSelected = (option: SelectOption<string>): React.ReactNode => {
  const meta = PLAN_META[String(option.value)];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, minWidth: 0 }}>
      <Icon name={meta.icon} size={14} />
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{option.label}</span>
      <Tag tone={meta.tone}>{meta.price}</Tag>
    </span>
  );
};

const SectionSelect: React.FC<SectionCtx> = () => {
  const [lang, setLang] = React.useState("zh");
  const [tags, setTags] = React.useState<string[]>(["design", "ui"]);
  const [city, setCity] = React.useState<string | undefined>("sh");
  const [aliasValue, setAliasValue] = React.useState<string | undefined>();
  const [framework, setFramework] = React.useState("");
  const [plan, setPlan] = React.useState("pro");
  const [loading, setLoading] = React.useState(false);
  const [asyncOpts, setAsyncOpts] = React.useState<{ value: string; label: string }[]>([]);
  const itemIcon = (tone: string) => (
    <span
      style={{
        width: 16,
        height: 16,
        borderRadius: 5,
        background: tone,
        boxShadow: "var(--neu-shadow-subtle)",
      }}
    />
  );
  const triggerLoad = () => {
    setLoading(true);
    setAsyncOpts([]);
    setTimeout(() => {
      setAsyncOpts([
        { value: "a", label: "Apple" },
        { value: "b", label: "Banana" },
        { value: "c", label: "Cherry" },
      ]);
      setLoading(false);
    }, 1000);
  };
  return (
    <DocPage
      whenToUse={
        <>
          <p>从一组选项中选择一个或多个,常见于表单和过滤场景。</p>
          <ul className="doc-usecase-list">
            <li>选项数量 ≥ 4 时优先使用 Select 而非 Radio / Checkbox</li>
            <li>需要搜索过滤时启用 <code>searchable</code></li>
            <li>多选场景使用 <code>multiple</code>,可配合 <code>maxTagCount</code> 折叠</li>
            <li>菜单内容复杂时分别使用 <code>optionRender</code> 与 <code>selectedRender</code></li>
          </ul>
        </>
      }
      demos={[
        {
          id: "basic",
          title: "单选",
          code: `<Select value={lang} onChange={setLang} options={[
  { value: "zh", label: "简体中文" },
  { value: "en", label: "English" },
]} />`,
          render: () => (
            <Field label="界面语言">
              <Select
                value={lang}
                onChange={setLang}
                options={[
                  { value: "zh", label: "简体中文" },
                  { value: "en", label: "English" },
                  { value: "ja", label: "日本語" },
                  { value: "ko", label: "한국어" },
                ]}
              />
            </Field>
          ),
        },
        {
          id: "multi",
          title: "多选",
          description: "multiple + Tag 形式呈现已选项。",
          code: `<Select multiple clearable value={tags} onChange={setTags} options={...} />`,
          render: () => (
            <Field label={`标签 (已选 ${tags.length})`}>
              <Select
                multiple
                clearable
                value={tags}
                onChange={setTags}
                options={[
                  { value: "design", label: "设计" },
                  { value: "ui", label: "UI" },
                  { value: "ux", label: "UX" },
                  { value: "frontend", label: "前端" },
                  { value: "backend", label: "后端" },
                ]}
              />
            </Field>
          ),
        },
        {
          id: "search",
          title: "搜索过滤",
          description: "searchable + clearable + 选项 icon/description。icon 支持 IconName 或 ReactNode。",
          code: `<Select searchable clearable
  options={[{ value, label, icon, description }]}
/>`,
          render: () => (
            <Field label="城市">
              <Select
                searchable
                clearable
                value={city}
                onChange={setCity}
                onClear={() => setCity(undefined)}
                placeholder="搜索城市..."
                options={[
                  { value: "bj", label: "北京", icon: "home", description: "中国 · 首都" },
                  { value: "sh", label: "上海", icon: itemIcon("var(--accent)"), description: "中国 · 直辖市" },
                  { value: "tk", label: "东京", icon: itemIcon("var(--success)"), description: "日本" },
                  { value: "ld", label: "伦敦", icon: "home", description: "英国" },
                  { value: "pa", label: "巴黎", icon: "home", description: "法国" },
                ]}
              />
            </Field>
          ),
        },
        {
          id: "prop-aliases",
          title: "常用 prop 别名",
          description: "allowClear / showSearch / popupClassName / optionFilterProp 可直接使用。",
          code: `<Select
  allowClear
  showSearch
  popupClassName="my-select-popup"
  optionFilterProp="label"
  value={value}
  onChange={setValue}
  options={options}
/>`,
          render: () => (
            <Field label="别名写法">
              <Select
                allowClear
                showSearch
                popupClassName="demo-select-popup"
                optionFilterProp="label"
                value={aliasValue}
                onChange={setAliasValue}
                placeholder="搜索组件..."
                options={[
                  { value: "modal", label: "Modal 对话框" },
                  { value: "message", label: "Message 消息" },
                  { value: "cascader", label: "Cascader 级联" },
                  { value: "popover", label: "Popover 气泡卡片" },
                ]}
              />
            </Field>
          ),
        },
        {
          id: "custom-content",
          title: "复杂选项与独立选中渲染",
          span: 2,
          description: "optionRender 承载多行菜单内容；selectedRender 提供适合固定高度触发器的紧凑版本。listHeight 和 popupStyle 可调整浮层尺寸。",
          code: `<Select
  aria-label="订阅套餐"
  value={plan}
  onChange={setPlan}
  options={plans}
  optionRender={(option, info) => <PlanCard option={option} selected={info.selected} />}
  selectedRender={(option) => <CompactPlan option={option} />}
  listHeight={420}
  popupStyle={{ minWidth: "min(460px, calc(100vw - 16px))" }}
/>`,
          render: () => (
            <Field label="订阅套餐" hint="菜单使用完整信息，选中后只保留名称与价格。">
              <Select
                aria-label="订阅套餐"
                value={plan}
                onChange={setPlan}
                options={[
                  { value: "personal", label: "个人版", text: "个人版 免费 个人项目", ariaLabel: "个人版套餐" },
                  { value: "pro", label: "专业版", text: "专业版 高级主题", ariaLabel: "专业版套餐" },
                  { value: "team", label: "团队版", text: "团队版 权限 审计", ariaLabel: "团队版套餐" },
                ]}
                optionRender={renderPlanOption}
                selectedRender={renderPlanSelected}
                listHeight={420}
                popupStyle={{ minWidth: "min(460px, calc(100vw - 16px))" }}
              />
            </Field>
          ),
        },
        {
          id: "group",
          title: "分组",
          description: "options 接受 { label, options } 表示分组。",
          code: `options={[
  { label: "前端", options: [...] },
  { label: "后端", options: [...] },
]}`,
          render: () => (
            <Field label="技术栈">
              <Select
                searchable
                value={framework}
                onChange={setFramework}
                placeholder="选择技术栈..."
                options={[
                  {
                    label: "前端",
                    options: [
                      { value: "react", label: "React", icon: "zap" },
                      { value: "vue", label: "Vue", icon: "zap" },
                      { value: "svelte", label: "Svelte", icon: "zap" },
                    ],
                  },
                  {
                    label: "后端",
                    options: [
                      { value: "node", label: "Node.js", icon: "layers" },
                      { value: "deno", label: "Deno", icon: "layers" },
                      { value: "go", label: "Go", icon: "layers", disabled: true },
                    ],
                  },
                ]}
              />
            </Field>
          ),
        },
        {
          id: "async",
          title: "加载态",
          description: "loading 时显示 spinner,emptyContent 自定义空态。",
          code: `<Select searchable loading={loading} options={asyncOpts} />`,
          render: () => (
            <Field
              label={
                <Row>
                  <span>异步加载</span>
                  <Button size="sm" variant="ghost" icon="arrowRight" onClick={triggerLoad}>
                    重新加载
                  </Button>
                </Row>
              }
            >
              <Select
                searchable
                loading={loading}
                options={asyncOpts}
                placeholder="点击重新加载..."
                emptyContent="没有水果了"
              />
            </Field>
          ),
        },
        {
          id: "size",
          title: "尺寸 / 状态",
          code: `<Select size="sm" /> <Select /> <Select size="lg" />
<Select invalid /> <Select disabled />`,
          render: () => (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Row>
                <Select size="sm" defaultValue="1" options={[{ value: "1", label: "Small" }]} />
                <Select defaultValue="1" options={[{ value: "1", label: "Medium" }]} />
                <Select size="lg" defaultValue="1" options={[{ value: "1", label: "Large" }]} />
              </Row>
              <Row>
                <Select invalid placeholder="错误态" options={[{ value: "1", label: "Option" }]} />
                <Select disabled defaultValue="a" options={[{ value: "a", label: "已锁定" }]} />
              </Row>
            </div>
          ),
        },
      ]}
      api={[
        {
          title: "Select",
          rows: [
            { prop: "options", description: "选项,可含 { label, options } 分组", type: "SelectItem<T>[]", required: true },
            { prop: "value / defaultValue", description: "受控/初始", type: "T | T[]" },
            { prop: "onChange", description: "变更", type: "(value) => void" },
            { prop: "placeholder", description: "空选择时的提示文本", type: "string", default: `"请选择…"` },
            { prop: "multiple", description: "多选", type: "boolean", default: "false" },
            { prop: "maxTagCount", description: "多选时显示的标签数(超出折叠 +N)", type: "number" },
            { prop: "searchable", description: "可搜索", type: "boolean", default: "false" },
            { prop: "showSearch", description: "searchable 的等价别名", type: "boolean", default: "false" },
            { prop: "filterOption", description: "自定义过滤", type: "(input, option) => boolean" },
            { prop: "optionFilterProp", description: "默认过滤使用的 option 字段", type: `"label" | "value" | "text" | string` },
            { prop: "clearable", description: "显示独立且可访问的清除按钮", type: "boolean", default: "false" },
            { prop: "allowClear", description: "clearable 的等价别名", type: "boolean | { clearIcon? }", default: "false" },
            { prop: "onClear", description: "用户点击清除按钮后触发", type: "() => void" },
            { prop: "open / defaultOpen / onOpenChange", description: "受控或非受控菜单显隐；非受控组件禁用时会关闭", type: "boolean / (open: boolean) => void" },
            { prop: "id / aria-*", description: "转发到实际 combobox 触发节点，便于 Form.Item 关联标签和错误说明", type: "原生属性" },
            { prop: "menuClassName / popupClassName / dropdownClassName", description: "浮层菜单 className 别名", type: "string" },
            { prop: "loading", description: "加载态", type: "boolean", default: "false" },
            { prop: "emptyContent", description: "空态文案", type: "ReactNode" },
            { prop: "optionRender", description: "自定义菜单内完整选项内容，并获得 selected / active / index 状态", type: "(option, info) => ReactNode" },
            { prop: "selectedRender", description: "自定义触发器中的紧凑已选内容；单选和多选标签均支持", type: "(option, info) => ReactNode" },
            { prop: "listHeight", description: "菜单选项滚动区域最大高度", type: "number", default: "260" },
            { prop: "popupStyle", description: "Portal 菜单内联样式，可覆盖宽度或高度", type: "CSSProperties" },
            { prop: "size", description: "尺寸", type: `"sm" | "md" | "lg"`, default: `"md"` },
            { prop: "invalid", description: "错误态", type: "boolean", default: "false" },
            { prop: "disabled", description: "禁用", type: "boolean", default: "false" },
          ],
        },
        {
          title: "SelectOption",
          rows: [
            { prop: "value", description: "值", type: "T", required: true },
            { prop: "label", description: "显示", type: "ReactNode" },
            { prop: "text", description: "复杂 label 的独立搜索文本", type: "string" },
            { prop: "ariaLabel", description: "复杂选项或 optionRender 的独立可访问名称", type: "string" },
            { prop: "icon", description: "前置图标,可传内置图标名或自定义节点", type: "IconName | ReactNode" },
            { prop: "description", description: "次要描述", type: "ReactNode" },
            { prop: "disabled", description: "禁用项", type: "boolean", default: "false" },
          ],
        },
      ]}
    />
  );
};

export default defineSection({
  id: "select",
  group: "表单",
  order: 60,
  label: "Select 下拉",
  eyebrow: "DATA ENTRY",
  title: "Select 下拉选择",
  desc: "下拉选择,支持单/多选、搜索、分组、加载态。",
  Component: SectionSelect,
});
