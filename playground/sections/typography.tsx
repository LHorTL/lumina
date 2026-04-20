import * as React from "react";
import { Typography } from "lumina";
import { DocPage } from "../docs";
import { Row } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

const SectionTypography: React.FC<SectionCtx> = () => {
  const [editValue, setEditValue] = React.useState("点击右侧图标编辑");
  const longText =
    "Lumina 是为 Electron 桌面应用打造的 React 18 组件库。" +
    "用柔和的凸起与凹陷替代硬边框、用 CSS 变量驱动整套设计令牌，在运行时可以无刷新地切换深浅色、" +
    "六种强调色、三档密度与四种字体家族。零运行时依赖，与 Vite、Next.js、Electron + Vite 等现代打包器无缝协作。";
  return (
    <DocPage
      whenToUse={
        <p>
          承载页面文字的基础组件族：<Typography.Text code>Title</Typography.Text> /{" "}
          <Typography.Text code>Text</Typography.Text> /{" "}
          <Typography.Text code>Paragraph</Typography.Text> /{" "}
          <Typography.Text code>Link</Typography.Text>。提供语义颜色、文字修饰、可复制、可编辑、省略截断等常用能力，
          样式与 Lumina 的拟态令牌一致。
        </p>
      }
      demos={[
        {
          id: "basic",
          title: "基础组合",
          span: 2,
          code: `<Typography>
  <Typography.Title level={2}>Lumina 排版</Typography.Title>
  <Typography.Paragraph>...</Typography.Paragraph>
  <Typography.Text type="secondary">次要文字</Typography.Text>
  <Typography.Link href="..." external>外部链接</Typography.Link>
</Typography>`,
          render: () => (
            <Typography>
              <Typography.Title level={2}>Lumina 排版</Typography.Title>
              <Typography.Paragraph>
                Typography 提供语义化的标题、段落、行内文字与链接，统一继承 Lumina 的拟态令牌。
              </Typography.Paragraph>
              <Typography.Text type="secondary">次要文字 · secondary</Typography.Text>{" · "}
              <Typography.Link href="https://www.npmjs.com/package/@fangxinyan/lumina" target="_blank" external>
                npm 包页面
              </Typography.Link>
            </Typography>
          ),
        },
        {
          id: "level",
          title: "标题层级",
          span: 2,
          code: `<Typography.Title level={1..5}>...</Typography.Title>`,
          render: () => (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <Typography.Title level={1}>H1 标题</Typography.Title>
              <Typography.Title level={2}>H2 标题</Typography.Title>
              <Typography.Title level={3}>H3 标题</Typography.Title>
              <Typography.Title level={4}>H4 标题</Typography.Title>
              <Typography.Title level={5}>H5 标题</Typography.Title>
            </div>
          ),
        },
        {
          id: "type",
          title: "语义色",
          code: `<Typography.Text type="success">...</Typography.Text>`,
          render: () => (
            <Row>
              <Typography.Text>default</Typography.Text>
              <Typography.Text type="secondary">secondary</Typography.Text>
              <Typography.Text type="success">success</Typography.Text>
              <Typography.Text type="warning">warning</Typography.Text>
              <Typography.Text type="danger">danger</Typography.Text>
              <Typography.Text disabled>disabled</Typography.Text>
            </Row>
          ),
        },
        {
          id: "decoration",
          title: "文字修饰",
          code: `<Typography.Text strong>...</Typography.Text>`,
          render: () => (
            <Row>
              <Typography.Text strong>strong</Typography.Text>
              <Typography.Text italic>italic</Typography.Text>
              <Typography.Text underline>underline</Typography.Text>
              <Typography.Text delete>delete</Typography.Text>
              <Typography.Text mark>mark</Typography.Text>
              <Typography.Text code>code</Typography.Text>
              <Typography.Text keyboard>⌘K</Typography.Text>
            </Row>
          ),
        },
        {
          id: "copyable",
          title: "可复制",
          description: "点击右侧图标复制文本，自动切成 ✓ 状态并 2.4 秒后复位。",
          code: `<Typography.Text copyable>...</Typography.Text>`,
          render: () => (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Typography.Text copyable>@fangxinyan/lumina</Typography.Text>
              <Typography.Text copyable={{ text: "npm install @fangxinyan/lumina" }}>
                自定义复制内容
              </Typography.Text>
            </div>
          ),
        },
        {
          id: "editable",
          title: "可编辑",
          description: "点击图标或文本进入编辑状态，Enter 保存、Esc 取消。",
          code: `<Typography.Text editable={{ onChange, triggerType: ["icon", "text"] }}>{value}</Typography.Text>`,
          render: () => (
            <Typography.Text
              editable={{ onChange: setEditValue, triggerType: ["icon", "text"] }}
            >
              {editValue}
            </Typography.Text>
          ),
        },
        {
          id: "ellipsis",
          title: "省略截断",
          span: 2,
          description: "多行截断并支持「展开」。",
          code: `<Typography.Paragraph ellipsis={{ rows: 2, expandable: true }}>{long}</Typography.Paragraph>`,
          render: () => (
            <div style={{ maxWidth: 520 }}>
              <Typography.Paragraph ellipsis={{ rows: 2, expandable: true }}>
                {longText}
              </Typography.Paragraph>
            </div>
          ),
        },
        {
          id: "link",
          title: "链接",
          code: `<Typography.Link href="..." external>...</Typography.Link>`,
          render: () => (
            <Row>
              <Typography.Link href="#">内部链接</Typography.Link>
              <Typography.Link href="https://github.com/LHorTL/lumina" target="_blank" external>
                GitHub
              </Typography.Link>
              <Typography.Link disabled>禁用</Typography.Link>
            </Row>
          ),
        },
      ]}
      api={[
        {
          title: "Typography.Title",
          rows: [
            { prop: "level", description: "标题级别", type: "1 | 2 | 3 | 4 | 5", default: "1" },
          ],
        },
        {
          title: "通用 Props (Title / Text / Paragraph / Link)",
          rows: [
            { prop: "type", description: "语义色", type: `"secondary" | "success" | "warning" | "danger"` },
            { prop: "disabled", description: "禁用态", type: "boolean", default: "false" },
            {
              prop: "mark / code / keyboard / underline / delete / strong / italic",
              description: "文字修饰",
              type: "boolean",
              default: "false",
            },
            { prop: "copyable", description: "显示复制按钮", type: "boolean | CopyableConfig" },
            { prop: "editable", description: "显示编辑按钮", type: "boolean | EditableConfig" },
            { prop: "ellipsis", description: "截断省略", type: "boolean | EllipsisConfig" },
          ],
        },
        {
          title: "Typography.Link",
          rows: [
            { prop: "href", description: "链接地址", type: "string" },
            { prop: "target / rel", description: "原生锚点属性", type: "string" },
            { prop: "external", description: "追加外链箭头", type: "boolean", default: "false" },
          ],
        },
      ]}
    />
  );
};

export default defineSection({
  id: "typography",
  group: "通用",
  order: 30,
  label: "Typography 排版",
  eyebrow: "GENERAL",
  title: "Typography 排版",
  desc: "标题、段落、文本、链接一体化排版组件,支持语义色、修饰、复制、编辑、省略。",
  Component: SectionTypography,
});
