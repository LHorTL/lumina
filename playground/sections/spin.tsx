import * as React from "react";
import { Spin } from "lumina";
import { DocPage } from "../docs";
import { Row } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

const SectionSpin: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={<p>表示任务正在进行中,用户需要等待。</p>}
    demos={[
      {
        id: "basic",
        title: "基础",
        code: `<Spin />
<Spin size="large" />
<Spin size={40} />`,
        render: () => (
          <Row gap={16}>
            <Spin />
            <Spin size="large" />
            <Spin size={40} />
          </Row>
        ),
      },
      {
        id: "tone",
        title: "色调",
        code: `<Spin tone="accent" />
<Spin tone="success" />
<Spin tone="warning" />
<Spin tone="danger" />`,
        render: () => (
          <Row gap={16}>
            <Spin tone="accent" size={24} />
            <Spin tone="success" size={24} />
            <Spin tone="warning" size={24} />
            <Spin tone="danger" size={24} />
          </Row>
        ),
      },
      {
        id: "dots",
        title: "Dots 变体",
        code: `<Spin variant="dots" />
<Spin variant="dots" size={24} />
<Spin variant="dots" size={32} />`,
        render: () => (
          <Row gap={16}>
            <Spin variant="dots" size={16} />
            <Spin variant="dots" size={24} />
            <Spin variant="dots" size={32} />
          </Row>
        ),
      },
      {
        id: "label",
        title: "带文案",
        code: `<Spin tip="加载中…" />
<Spin variant="dots" tone="accent" tip="正在同步" />`,
        render: () => (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Spin tip="加载中…" />
            <Spin tone="accent" tip="正在处理,请稍候" />
            <Spin variant="dots" tone="success" tip="同步完成中" size={20} />
          </div>
        ),
      },
    ]}
    api={[
      {
        title: "Spin",
        rows: [
          { prop: "size", description: "尺寸", type: `"small" | "default" | "large" | number`, default: `"default"` },
          { prop: "tone", description: "色调", type: `"accent" | "success" | "warning" | "danger" | "current"`, default: `"accent"` },
          { prop: "variant", description: "样式", type: `"ring" | "dots"`, default: `"ring"` },
          { prop: "tip / label", description: "文案", type: "ReactNode" },
          { prop: "spinning", description: "是否显示加载指示器", type: "boolean", default: "true" },
        ],
      },
    ]}
  />
);

export default defineSection({
  id: "spin",
  group: "反馈",
  order: 80,
  label: "Spin 加载",
  eyebrow: "FEEDBACK",
  title: "Spin 加载",
  desc: "表示任务正在进行,提示用户等待。",
  Component: SectionSpin,
});
