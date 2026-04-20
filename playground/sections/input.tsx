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
  { prop: "size", description: "尺寸", type: `"sm" | "md" | "lg"`, default: `"md"` },
  { prop: "invalid", description: "错误态", type: "boolean", default: "false" },
  { prop: "disabled", description: "禁用", type: "boolean", default: "false" },
];

const SectionInput: React.FC<SectionCtx> = () => {
  const [v, setV] = React.useState("");
  const [pw, setPw] = React.useState("lumina-is-neat");
  const [showPw, setShowPw] = React.useState(false);
  const [msg, setMsg] = React.useState("");
  const [email, setEmail] = React.useState("invalid");
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
          id: "textarea",
          title: "多行文本",
          span: 2,
          description: "Textarea 与 Input 共享同款凹槽。",
          code: `<Textarea placeholder="..." value={msg} onChange={setMsg} />`,
          render: () => (
            <Field label="消息内容" hint={`${msg.length} / 300`}>
              <Textarea placeholder="写点什么..." value={msg} onChange={setMsg} />
            </Field>
          ),
        },
      ]}
      api={[{ title: "Input / Textarea", rows: inputApi }]}
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
