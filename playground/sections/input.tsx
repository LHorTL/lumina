import * as React from "react";
import { Input, Textarea } from "lumina";
import { DocPage, type ApiRow } from "../docs";
import { Field } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

const inputApi: ApiRow[] = [
  { prop: "value / defaultValue", description: "受控值 / 初值", type: "string" },
  { prop: "onChange", description: "变更回调", type: "(value: string, e) => void" },
  { prop: "placeholder", description: "占位文案", type: "string" },
  { prop: "leadingIcon / trailingIcon", description: "前/后置图标", type: "IconName" },
  { prop: "prefix", description: "左侧内嵌内容(在 leadingIcon 之后)", type: "ReactNode" },
  { prop: "suffix", description: "右侧内嵌内容(在 trailingIcon 之前)", type: "ReactNode" },
  { prop: "allowClear", description: "显示内置的清除按钮", type: "boolean", default: "false" },
  { prop: "maxLength", description: "最大字符数,透传至原生 input", type: "number" },
  { prop: "showCount", description: "在输入框下方显示字数统计", type: "boolean", default: "false" },
  { prop: "size", description: "尺寸", type: `"sm" | "md" | "lg"`, default: `"md"` },
  { prop: "invalid", description: "错误态", type: "boolean", default: "false" },
  { prop: "disabled", description: "禁用", type: "boolean", default: "false" },
];

const textareaApi: ApiRow[] = [
  { prop: "value / defaultValue", description: "受控值 / 初值", type: "string" },
  { prop: "onChange", description: "变更回调", type: "(value: string, e) => void" },
  { prop: "allowClear", description: "右上角显示清除按钮", type: "boolean", default: "false" },
  { prop: "maxLength", description: "最大字符数", type: "number" },
  { prop: "showCount", description: "显示字数统计", type: "boolean", default: "false" },
  { prop: "invalid", description: "错误态", type: "boolean", default: "false" },
];

const SectionInput: React.FC<SectionCtx> = () => {
  const [v, setV] = React.useState("");
  const [pw, setPw] = React.useState("lumina-is-neat");
  const [showPw, setShowPw] = React.useState(false);
  const [msg, setMsg] = React.useState("");
  const [email, setEmail] = React.useState("invalid");
  const [clearable, setClearable] = React.useState("可以清空的输入");
  const [counted, setCounted] = React.useState("");
  return (
    <DocPage
      whenToUse={<p>用户输入文本时使用,提供单行 Input 与多行 Textarea 两种形态,均支持前后置图标、错误态、禁用态。</p>}
      demos={[
        {
          id: "basic",
          title: "基础用法",
          code: `const [v, setV] = useState("");
<Input placeholder="输入用户名" value={v} onChange={setV} leadingIcon="user" />`,
          render: () => (
            <Field label="用户名">
              <Input placeholder="输入你的用户名" value={v} onChange={setV} leadingIcon="user" />
            </Field>
          ),
        },
        {
          id: "icon",
          title: "前后置图标",
          description: "leadingIcon / trailingIcon。",
          code: `<Input placeholder="搜索..." leadingIcon="search" />`,
          render: () => (
            <Field label="搜索">
              <Input placeholder="搜索组件、图标..." leadingIcon="search" />
            </Field>
          ),
        },
        {
          id: "password",
          title: "密码切换",
          description: "trailingIcon 可点击切换密码可见性。",
          code: `<Input
  type={showPw ? "text" : "password"}
  trailingIcon={showPw ? "eyeOff" : "eye"}
  onTrailingIconClick={() => setShowPw(s => !s)}
/>`,
          render: () => (
            <Field label="密码">
              <Input
                type={showPw ? "text" : "password"}
                value={pw}
                onChange={setPw}
                leadingIcon="settings"
                trailingIcon={showPw ? "eyeOff" : "eye"}
                onTrailingIconClick={() => setShowPw((s) => !s)}
              />
            </Field>
          ),
        },
        {
          id: "invalid",
          title: "校验错误",
          description: "invalid 触发红色凹槽。",
          code: `<Input invalid hint="请输入有效的邮箱" />`,
          render: () => (
            <Field
              label="邮箱地址"
              invalid={!email.includes("@")}
              hint={!email.includes("@") ? "请输入有效的邮箱" : "我们不会发给第三方"}
            >
              <Input value={email} onChange={setEmail} leadingIcon="mail" invalid={!email.includes("@")} />
            </Field>
          ),
        },
        {
          id: "allowClear",
          title: "可清除",
          description: "allowClear 在值非空时显示 × 按钮,点击即清空。",
          code: `<Input value={v} onChange={setV} allowClear placeholder="输入后右侧会出现 ×" />`,
          render: () => (
            <Field label="可清除输入框">
              <Input
                value={clearable}
                onChange={setClearable}
                allowClear
                placeholder="输入后右侧会出现 ×"
              />
            </Field>
          ),
        },
        {
          id: "prefix-suffix",
          title: "前缀 / 后缀",
          description: "prefix/suffix 在输入框内部以静态文本形式呈现,常用于单位或协议。",
          code: `<Input prefix="https://" suffix=".com" defaultValue="lumina" />
<Input prefix="¥" suffix="元" defaultValue="1280" />`,
          render: () => (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Input prefix="https://" suffix=".com" defaultValue="lumina" />
              <Input prefix="¥" suffix="元" defaultValue="1280" />
            </div>
          ),
        },
        {
          id: "count",
          title: "字数统计 + maxLength",
          description: "showCount 显示当前字数,配合 maxLength 显示 N / max。",
          code: `<Input
  value={v}
  onChange={setV}
  maxLength={20}
  showCount
  placeholder="最多输入 20 个字"
/>`,
          render: () => (
            <Input
              value={counted}
              onChange={setCounted}
              maxLength={20}
              showCount
              placeholder="最多输入 20 个字"
            />
          ),
        },
        {
          id: "textarea",
          title: "多行文本",
          span: 2,
          description: "Textarea 与 Input 共享同款凹槽,也支持 allowClear / maxLength / showCount。",
          code: `<Textarea
  placeholder="..."
  value={msg}
  onChange={setMsg}
  allowClear
  maxLength={300}
  showCount
/>`,
          render: () => (
            <Textarea
              placeholder="写点什么..."
              value={msg}
              onChange={setMsg}
              allowClear
              maxLength={300}
              showCount
            />
          ),
        },
      ]}
      api={[
        { title: "Input", rows: inputApi },
        { title: "Textarea", rows: textareaApi },
      ]}
    />
  );
};

export default defineSection({
  id: "input",
  group: "表单",
  order: 10,
  label: "Input 输入框",
  eyebrow: "DATA ENTRY",
  title: "Input 输入框",
  desc: "凹陷凹槽式输入域,支持前后置图标、错误态、禁用态。",
  Component: SectionInput,
});
