import * as React from "react";
import { Avatar, Button, Card, Tag } from "lumina";
import { DocPage } from "../docs";
import { defineSection, type SectionCtx } from "./_types";

const SectionCard: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={<p>用作信息分组的容器。Card 可直接承载标题、描述与操作区。</p>}
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
        id: "hoverable",
        title: "悬浮抬起",
        description: "hoverable 在鼠标悬浮时轻微上移并加强阴影,适合可点击的卡片列表。",
        span: 2,
        code: `<Card hoverable>可点击卡片</Card>`,
        render: () => (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <Card hoverable>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>悬浮 Raised</div>
              <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>把鼠标移上来试试</div>
            </Card>
            <Card hoverable variant="flat">
              <div style={{ fontWeight: 600, marginBottom: 4 }}>悬浮 Flat</div>
              <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>轻量悬浮反馈</div>
            </Card>
            <Card hoverable variant="sunken">
              <div style={{ fontWeight: 600, marginBottom: 4 }}>悬浮 Sunken</div>
              <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>从下陷抬出</div>
            </Card>
          </div>
        ),
      },
      {
        id: "header",
        title: "带标题",
        description: "带标题、描述、操作区。",
        code: `<Card title="月度营收" description="2026 年 4 月" actions={...}>
  ¥ 12,480
</Card>`,
        render: () => (
          <Card title="月度营收" description="2026 年 4 月">
            <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "var(--accent-ink)" }}>¥ 12,480</div>
              <Tag tone="success">+18.2%</Tag>
            </div>
          </Card>
        ),
      },
      {
        id: "actions",
        title: "标题区操作",
        code: `<Card title="..." actions={<Button size="sm" icon="plus">邀请</Button>}>...</Card>`,
        render: () => (
          <Card
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
          </Card>
        ),
      },
      {
        id: "body-layout",
        title: "正文布局",
        description: "bodyLayout 控制正文槽布局，bodyClassName / bodyStyle / bodyProps 直接作用到 .card-body。",
        code: `<Card
  fill
  bodyLayout="stack"
  bodyClassName="settings-card-body"
  bodyStyle={{ minHeight: 160 }}
>
  ...
</Card>`,
        render: () => (
          <Card
            title="同步任务"
            description="正文槽可以独立布局"
            fill
            bodyLayout="stack"
            bodyStyle={{ minHeight: 160 }}
            bodyProps={{ "data-region": "task-body" }}
          >
            <Tag tone="info">运行中</Tag>
            <div style={{ color: "var(--fg-muted)", lineHeight: 1.7 }}>
              业务内容不需要再覆盖 .card-body，就可以获得堆叠布局、最小宽度收缩和独立样式入口。
            </div>
            <Button size="sm" variant="ghost">
              查看详情
            </Button>
          </Card>
        ),
      },
      {
        id: "loading",
        title: "加载覆盖",
        description: "loading 会在正文区域显示内建 overlay；loadingOverlay 可替换默认 Spin。",
        code: `<Card loading loadingOverlay="正在同步...">
  ...
</Card>`,
        render: () => (
          <Card
            title="资源面板"
            description="正文覆盖层"
            loading
            loadingOverlay="正在同步..."
            bodyStyle={{ minHeight: 120 }}
          >
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ height: 16, borderRadius: "var(--r-sm)", boxShadow: "var(--neu-shadow-inset)" }} />
              <div style={{ height: 16, borderRadius: "var(--r-sm)", boxShadow: "var(--neu-shadow-inset)" }} />
              <div style={{ height: 16, width: "72%", borderRadius: "var(--r-sm)", boxShadow: "var(--neu-shadow-inset)" }} />
            </div>
          </Card>
        ),
      },
    ]}
    api={[
      {
        title: "Card",
        rows: [
          { prop: "variant", description: "视觉变体", type: `"raised" | "flat" | "sunken"`, default: `"raised"` },
          { prop: "padding", description: "内边距", type: `"none" | "sm" | "md" | "lg"`, default: `"md"` },
          { prop: "hoverable", description: "悬浮时抬起", type: "boolean", default: "false" },
          { prop: "title", description: "标题", type: "ReactNode" },
          { prop: "description", description: "副标题", type: "ReactNode" },
          { prop: "actions", description: "右上操作区", type: "ReactNode" },
          { prop: "fill", description: "卡片和正文填满可用高度", type: "boolean", default: "false" },
          { prop: "bodyLayout", description: "正文布局策略", type: `"block" | "stack" | "fill" | "center"`, default: `"block"` },
          { prop: "bodyClassName", description: "正文容器 className", type: "string" },
          { prop: "bodyStyle", description: "正文容器内联样式", type: "CSSProperties" },
          { prop: "bodyProps", description: "透传给正文容器的 DOM props", type: "HTMLAttributes<HTMLDivElement>" },
          { prop: "loading", description: "显示正文加载覆盖层", type: "boolean", default: "false" },
          { prop: "loadingOverlay", description: "自定义加载覆盖层内容", type: "ReactNode" },
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
