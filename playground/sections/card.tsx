import * as React from "react";
import { Avatar, Button, Card, Panel, Tag } from "lumina";
import { DocPage } from "../docs";
import { defineSection, type SectionCtx } from "./_types";

const SectionCard: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={<p>用作信息分组的容器。Panel 是带标题与操作区的 Card 变体。</p>}
    demos={[
      {
        id: "variants",
        title: "三种变体",
        description: "raised(默认凸起)、flat(扁平)、sunken(凹陷)。",
        span: 2,
        code: `<Card>raised</Card>
<Card variant="flat">flat</Card>
<Card variant="sunken">sunken</Card>`,
        render: () => (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <Card>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Raised</div>
              <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>默认凸起样式</div>
            </Card>
            <Card variant="flat">
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Flat</div>
              <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>仅微弱描边</div>
            </Card>
            <Card variant="sunken">
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Sunken</div>
              <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>凹陷下沉</div>
            </Card>
          </div>
        ),
      },
      {
        id: "panel",
        title: "Panel",
        description: "带标题、描述、操作区。",
        code: `<Panel title="月度营收" description="2026 年 4 月" actions={...}>
  ¥ 12,480
</Panel>`,
        render: () => (
          <Panel title="月度营收" description="2026 年 4 月">
            <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "var(--accent-ink)" }}>¥ 12,480</div>
              <Tag tone="success">+18.2%</Tag>
            </div>
          </Panel>
        ),
      },
      {
        id: "panel-actions",
        title: "Panel 带操作",
        code: `<Panel title="..." actions={<Button size="sm" icon="plus">邀请</Button>}>...</Panel>`,
        render: () => (
          <Panel
            title="团队成员"
            description="活跃 7 / 12"
            actions={
              <Button size="sm" variant="ghost" icon="plus">
                邀请
              </Button>
            }
          >
            <div style={{ display: "flex", gap: 6 }}>
              {["金", "陆", "马", "周", "贺"].map((n) => (
                <Avatar key={n} alt={n} size="sm" />
              ))}
            </div>
          </Panel>
        ),
      },
    ]}
    api={[
      {
        title: "Card",
        rows: [
          { prop: "variant", description: "视觉变体", type: `"raised" | "flat" | "sunken"`, default: `"raised"` },
          { prop: "padding", description: "内边距", type: `"none" | "sm" | "md" | "lg"`, default: `"md"` },
        ],
      },
      {
        title: "Panel",
        rows: [
          { prop: "title", description: "标题", type: "ReactNode" },
          { prop: "description", description: "副标题", type: "ReactNode" },
          { prop: "actions", description: "右上操作区", type: "ReactNode" },
        ],
      },
    ]}
  />
);

export default defineSection({
  id: "card",
  group: "数据展示",
  order: 10,
  label: "Card 卡片",
  eyebrow: "DATA DISPLAY",
  title: "Card 卡片",
  desc: "信息分组容器,提供 raised / flat / sunken 三种视觉变体。",
  Component: SectionCard,
});
