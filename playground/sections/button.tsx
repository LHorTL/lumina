import * as React from "react";
import { Button, IconButton, message } from "lumina";
import { DocPage, type ApiRow, type DocDemoSpec } from "../docs";
import { Row } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

const buttonApi: ApiRow[] = [
  { prop: "variant", description: "按钮风格", type: `"default" | "primary" | "ghost" | "danger"`, default: `"default"` },
  { prop: "size", description: "按钮尺寸", type: `"sm" | "md" | "lg"`, default: `"md"` },
  { prop: "icon", description: "前置图标,可传内置图标名或自定义节点", type: "IconName | ReactNode" },
  { prop: "trailingIcon", description: "后置图标,可传内置图标名或自定义节点", type: "IconName | ReactNode" },
  { prop: "iconOnly", description: "渲染为纯图标方形按钮", type: "boolean", default: "自动" },
  { prop: "tip", description: "原生悬浮提示,常用于纯图标按钮", type: "string" },
  { prop: "loading", description: "加载态", type: "boolean", default: "false" },
  { prop: "block", description: "撑满父容器宽度", type: "boolean", default: "false" },
  { prop: "disabled", description: "禁用", type: "boolean", default: "false" },
  { prop: "onClick", description: "点击回调", type: "(e: MouseEvent) => void" },
];

const iconButtonApi: ApiRow[] = [
  { prop: "icon", description: "按钮图标,可传内置图标名或自定义节点", type: "IconName | ReactNode", required: true },
  { prop: "tip", description: "原生悬浮提示,也会作为缺省 aria-label", type: "string" },
  { prop: "variant", description: "按钮风格", type: `"default" | "primary" | "ghost" | "danger"`, default: `"default"` },
  { prop: "size", description: "按钮尺寸", type: `"sm" | "md" | "lg"`, default: `"md"` },
  { prop: "loading", description: "加载态", type: "boolean", default: "false" },
  { prop: "disabled", description: "禁用", type: "boolean", default: "false" },
];

const SectionButton: React.FC<SectionCtx> = () => {
  const [loading, setLoading] = React.useState(false);
  const itemIcon = (
    <span
      style={{
        width: 14,
        height: 14,
        borderRadius: 4,
        background: "linear-gradient(135deg, var(--accent), var(--success))",
        boxShadow: "0 0 8px var(--accent-glow)",
      }}
    />
  );
  const demos: DocDemoSpec[] = [
    {
      id: "basic",
      title: "基础按钮",
      description: "四种风格:主要、默认、幽灵、危险。",
      code: `<Button variant="primary">主按钮</Button>
<Button>默认按钮</Button>
<Button variant="ghost">幽灵按钮</Button>
<Button variant="danger">删除</Button>`,
      render: () => (
        <Row>
          <Button variant="primary">主按钮</Button>
          <Button>默认按钮</Button>
          <Button variant="ghost">幽灵按钮</Button>
          <Button variant="danger">删除</Button>
        </Row>
      ),
    },
    {
      id: "icon",
      title: "图标按钮",
      description: "icon 在前,trailingIcon 在后,既支持内置 IconName,也支持外部 ReactNode。",
      code: `<Button variant="primary" icon="sparkle">新建</Button>
<Button icon="download">下载</Button>
<Button trailingIcon="arrowRight">下一步</Button>
<Button icon={<img src={iconUrl} alt="" />}>外部图标</Button>`,
      render: () => (
        <Row>
          <Button variant="primary" icon="sparkle">新建</Button>
          <Button icon="download">下载</Button>
          <Button trailingIcon="arrowRight">下一步</Button>
          <Button icon={itemIcon}>外部图标</Button>
        </Row>
      ),
    },
    {
      id: "loading",
      title: "加载与禁用",
      description: "loading 期间禁用并显示 spinner。",
      code: `<Button loading={loading} variant="primary" onClick={...}>点我加载</Button>
<Button disabled>已禁用</Button>`,
      render: () => (
        <Row>
          <Button
            loading={loading}
            variant="primary"
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
                message.success("操作完成");
              }, 1400);
            }}
          >
            点我加载
          </Button>
          <Button disabled>已禁用</Button>
        </Row>
      ),
    },
    {
      id: "size",
      title: "尺寸",
      description: "提供 sm / md / lg 三种高度。",
      code: `<Button size="sm">Small</Button>
<Button>Medium</Button>
<Button size="lg">Large</Button>`,
      render: () => (
        <Row>
          <Button size="sm" variant="primary">Small</Button>
          <Button variant="primary">Medium</Button>
          <Button size="lg" variant="primary">Large</Button>
        </Row>
      ),
    },
    {
      id: "block",
      title: "块级按钮",
      description: "block 让按钮撑满容器宽度,常用于底部主操作或表单提交。",
      span: 2,
      code: `<Button block variant="primary" icon="send">提交表单</Button>
<Button block>取消</Button>`,
      render: () => (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Button block variant="primary" icon="send">
            提交表单
          </Button>
          <Button block>取消</Button>
        </div>
      ),
    },
    {
      id: "icon-only",
      title: "纯图标按钮",
      description: "IconButton 是 Button 的方形图标专用封装;Button 在只有 icon 时也会自动呈现为同样形态。",
      code: `<Button icon="heart" tip="收藏" />
<IconButton icon="bell" tip="通知" />
<IconButton icon="settings" tip="设置" />`,
      render: () => (
        <Row>
          <Button icon="heart" size="sm" tip="收藏" />
          <IconButton icon="bell" tip="通知" />
          <IconButton icon="settings" tip="设置" />
        </Row>
      ),
    },
  ];
  return (
    <DocPage
      whenToUse={
        <>
          <p>标记一个操作命令,响应用户点击行为,触发相应的业务逻辑。</p>
          <ul className="doc-usecase-list">
            <li>突出主操作时使用 <code>primary</code></li>
            <li>多个并列动作时使用默认按钮</li>
            <li>不希望过于醒目时使用 <code>ghost</code></li>
            <li>提示不可恢复的操作时使用 <code>danger</code></li>
          </ul>
        </>
      }
      demos={demos}
      api={[
        { title: "Button", rows: buttonApi },
        { title: "IconButton", rows: iconButtonApi },
      ]}
    />
  );
};

export default defineSection({
  id: "button",
  group: "通用",
  order: 10,
  label: "Button 按钮",
  eyebrow: "GENERAL",
  title: "Button 按钮",
  desc: "标记一个操作命令,响应用户点击行为,触发相应业务逻辑。",
  Component: SectionButton,
});
