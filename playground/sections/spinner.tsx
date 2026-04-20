import * as React from "react";
import { Spinner } from "lumina";
import { DocPage } from "../docs";
import { Row } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

const SectionSpinner: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={<p>表示任务正在进行中,用户需要等待。</p>}
    demos={[
      {
        id: "basic",
        title: "基础",
        code: `<Spinner />
<Spinner size={28} />
<Spinner size={40} />`,
        render: () => (
          <Row gap={16}>
            <Spinner />
            <Spinner size={28} />
            <Spinner size={40} />
          </Row>
        ),
      },
      {
        id: "tone",
        title: "色调",
        code: `<Spinner tone="accent" />
<Spinner tone="success" />
<Spinner tone="warning" />
<Spinner tone="danger" />`,
        render: () => (
          <Row gap={16}>
            <Spinner tone="accent" size={24} />
            <Spinner tone="success" size={24} />
            <Spinner tone="warning" size={24} />
            <Spinner tone="danger" size={24} />
          </Row>
        ),
      },
      {
        id: "dots",
        title: "Dots 变体",
        code: `<Spinner variant="dots" />
<Spinner variant="dots" size={24} />
<Spinner variant="dots" size={32} />`,
        render: () => (
          <Row gap={16}>
            <Spinner variant="dots" size={16} />
            <Spinner variant="dots" size={24} />
            <Spinner variant="dots" size={32} />
          </Row>
        ),
      },
      {
        id: "label",
        title: "带文案",
        code: `<Spinner label="加载中…" />
<Spinner variant="dots" tone="accent" label="正在同步" />`,
        render: () => (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Spinner label="加载中…" />
            <Spinner tone="accent" label="正在处理,请稍候" />
            <Spinner variant="dots" tone="success" label="同步完成中" size={20} />
          </div>
        ),
      },
    ]}
    api={[
      {
        title: "Spinner",
        rows: [
          { prop: "size", description: "尺寸 (px)", type: "number", default: "20" },
          { prop: "tone", description: "色调", type: `"accent" | "success" | "warning" | "danger" | "current"`, default: `"accent"` },
          { prop: "variant", description: "样式", type: `"ring" | "dots"`, default: `"ring"` },
          { prop: "label", description: "文案", type: "ReactNode" },
        ],
      },
    ]}
  />
);

export default defineSection({
  id: "spinner",
  group: "反馈",
  order: 80,
  label: "Spinner 加载",
  eyebrow: "FEEDBACK",
  title: "Spinner 加载",
  desc: "表示任务正在进行,提示用户等待。",
  Component: SectionSpinner,
});
