import * as React from "react";
import { AutoComplete } from "lumina";
import { DocPage } from "../docs";
import { Field } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

const SectionAutoComplete: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={<p>输入或聚焦时展示建议下拉。不强制从选项中选,用户仍可自由输入；Tab / 失焦会关闭下拉。</p>}
    demos={[
      {
        id: "basic",
        title: "基础",
        span: 2,
        description: "输入框使用 combobox / listbox 语义；方向键跳过禁用项，Enter 选择，Esc 或 Tab 关闭。",
        code: `<AutoComplete
  options={[
    { value: "light" },
    { value: "dark" },
    { value: "system" },
  ]}
  placeholder="主题"
/>`,
        render: () => (
          <Field label="主题">
            <AutoComplete
              options={[{ value: "light" }, { value: "dark" }, { value: "system" }]}
              placeholder="输入或选择主题"
            />
          </Field>
        ),
      },
      {
        id: "labels",
        title: "自定义 label",
        span: 2,
        description: "label 可以是任意 ReactNode；disabled 选项会保留展示，但不会被键盘或鼠标选中。",
        code: `options={[{ value: "zh", label: "中文 · Chinese" }]}`,
        render: () => (
          <Field label="语言" hint="label 可以是任意 ReactNode">
            <AutoComplete
              options={[
                { value: "zh", label: "中文 · Chinese" },
                { value: "en", label: "English" },
                { value: "ja", label: "日本語 · Japanese" },
                { value: "ko", label: "한국어 · Korean", disabled: true },
              ]}
              placeholder="搜索语言"
            />
          </Field>
        ),
      },
      {
        id: "dynamic",
        title: "动态加载",
        span: 2,
        description: "onSearch 在用户输入时触发,常配合后端检索使用。",
        code: `const [opts, setOpts] = useState([]);
<AutoComplete
  options={opts}
  onSearch={(text) => setOpts(generate(text))}
/>`,
        render: () => {
          const Live = () => {
            const [opts, setOpts] = React.useState<{ value: string }[]>([]);
            return (
              <Field label="邮箱后缀" hint='输入 "@" 前缀触发联想'>
                <AutoComplete
                  options={opts}
                  placeholder="输入邮箱"
                  filterOption={false}
                  onSearch={(text) => {
                    if (!text) return setOpts([]);
                    setOpts(
                      ["gmail.com", "outlook.com", "qq.com", "163.com"].map((d) => ({
                        value: `${text}@${d}`,
                      }))
                    );
                  }}
                />
              </Field>
            );
          };
          return <Live />;
        },
      },
    ]}
    api={[
      {
        title: "AutoComplete",
        rows: [
          { prop: "value / defaultValue", description: "受控 / 初始值", type: "string" },
          { prop: "onChange", description: "文本变更", type: "(value, option?) => void" },
          { prop: "onSelect", description: "选中项回调", type: "(value, option) => void" },
          { prop: "onSearch", description: "输入变化回调", type: "(text) => void" },
          { prop: "options", description: "候选项；空字符串 value 会过滤，disabled 项不可选且键盘导航会跳过", type: "{ value, label?, disabled? }[]", required: true },
          { prop: "filterOption", description: "过滤函数,false 关闭过滤", type: "boolean | (input, option) => boolean", default: "true" },
          { prop: "notFoundContent", description: "无匹配占位", type: "ReactNode" },
          { prop: "disabled", description: "禁用输入并立即关闭已打开的建议面板", type: "boolean", default: "false" },
          { prop: "allowClear / size / autoFocus / placeholder", description: "常规输入属性", type: "-" },
          { prop: "dropdownClassName", description: "Portal 下拉面板 className", type: "string" },
          { prop: "matchTriggerWidth", description: "下拉宽度跟随输入框", type: "boolean", default: "true" },
        ],
      },
    ]}
  />
);

export default defineSection({
  id: "autocomplete",
  group: "表单",
  order: 65,
  label: "AutoComplete 自动补全",
  eyebrow: "FORM",
  title: "AutoComplete 自动补全",
  desc: "输入时展示建议下拉,不限定必须从候选中选。",
  Component: SectionAutoComplete,
});
