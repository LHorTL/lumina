import * as React from "react";
import { Button, Select } from "lumina";
import { DocPage } from "../docs";
import { Field, Row } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

const SectionSelect: React.FC<SectionCtx> = () => {
  const [lang, setLang] = React.useState("zh");
  const [tags, setTags] = React.useState<string[]>(["design", "ui"]);
  const [city, setCity] = React.useState<string | undefined>("sh");
  const [framework, setFramework] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [asyncOpts, setAsyncOpts] = React.useState<{ value: string; label: string }[]>([]);
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
          description: "searchable + clearable + 选项 icon/description。",
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
                  { value: "sh", label: "上海", icon: "home", description: "中国 · 直辖市" },
                  { value: "tk", label: "东京", icon: "home", description: "日本" },
                  { value: "ld", label: "伦敦", icon: "home", description: "英国" },
                  { value: "pa", label: "巴黎", icon: "home", description: "法国" },
                ]}
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
            { prop: "multiple", description: "多选", type: "boolean", default: "false" },
            { prop: "maxTagCount", description: "多选时显示的标签数(超出折叠 +N)", type: "number" },
            { prop: "searchable", description: "可搜索", type: "boolean", default: "false" },
            { prop: "filterOption", description: "自定义过滤", type: "(input, option) => boolean" },
            { prop: "clearable", description: "可清除", type: "boolean", default: "false" },
            { prop: "loading", description: "加载态", type: "boolean", default: "false" },
            { prop: "emptyContent", description: "空态文案", type: "ReactNode" },
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
            { prop: "icon", description: "前置图标", type: "IconName" },
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
