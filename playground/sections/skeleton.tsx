import * as React from "react";
import { Skeleton } from "lumina";
import { DocPage } from "../docs";
import { Row } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

const SectionSkeleton: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={<p>在数据加载前展示页面结构的轮廓,减少视觉跳变。</p>}
    demos={[
      {
        id: "basic",
        title: "基础",
        code: `<Skeleton height={16} width="40%" />
<Skeleton height={12} />
<Skeleton height={12} width="80%" />`,
        render: () => (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 12 }}>
            <Skeleton height={16} width="40%" />
            <Skeleton height={12} />
            <Skeleton height={12} />
            <Skeleton height={12} width="80%" />
          </div>
        ),
      },
      {
        id: "circle",
        title: "手动组合:头像 + 文本",
        description: "使用原语 Skeleton 手动拼装 — 更灵活但需要自己写布局。",
        code: `<Skeleton circle height={48} width={48} />
<Skeleton height={12} width="50%" />`,
        render: () => (
          <Row gap={12}>
            <Skeleton height={48} width={48} circle />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <Skeleton height={12} width="50%" />
              <Skeleton height={10} width="80%" />
            </div>
          </Row>
        ),
      },
      {
        id: "composite",
        title: "组合模式 (avatar + title + paragraph)",
        description: "设置 avatar / title / paragraph 任一即切换到组合模式,自动拼装布局。",
        span: 2,
        code: `<Skeleton avatar title paragraph />`,
        render: () => (
          <div style={{ padding: 12 }}>
            <Skeleton avatar title paragraph />
          </div>
        ),
      },
      {
        id: "composite-config",
        title: "组合:自定义头像形状、段落行数",
        span: 2,
        code: `<Skeleton
  avatar={{ shape: "square", size: "lg" }}
  title={{ width: "30%" }}
  paragraph={{ rows: 4, width: ["100%", "90%", "70%", "40%"] }}
/>`,
        render: () => (
          <div style={{ padding: 12 }}>
            <Skeleton
              avatar={{ shape: "square", size: "lg" }}
              title={{ width: "30%" }}
              paragraph={{ rows: 4, width: ["100%", "90%", "70%", "40%"] }}
            />
          </div>
        ),
      },
      {
        id: "composite-no-avatar",
        title: "组合:仅 title + paragraph",
        description: "关闭 avatar 只渲染标题与段落,其余布局自动调整。",
        span: 2,
        code: `<Skeleton title paragraph={{ rows: 2 }} />`,
        render: () => (
          <div style={{ padding: 12 }}>
            <Skeleton title paragraph={{ rows: 2 }} />
          </div>
        ),
      },
      {
        id: "animation",
        title: "动画",
        description: "wave 是闪光流动,pulse 是透明度脉动,none 是静态占位。",
        code: `<Skeleton animation="wave" />
<Skeleton animation="pulse" />
<Skeleton animation="none" />`,
        render: () => (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 4 }}>wave</div>
              <Skeleton animation="wave" height={14} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 4 }}>pulse</div>
              <Skeleton animation="pulse" height={14} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 4 }}>none</div>
              <Skeleton animation="none" height={14} />
            </div>
          </div>
        ),
      },
    ]}
    api={[
      {
        title: "Skeleton (原语模式)",
        rows: [
          { prop: "width", description: "宽度", type: "number | string", default: `"100%"` },
          { prop: "height", description: "高度", type: "number | string", default: "16" },
          { prop: "circle", description: "圆形", type: "boolean", default: "false" },
          { prop: "animation", description: "动画", type: `"wave" | "pulse" | "none"`, default: `"wave"` },
        ],
      },
      {
        title: "Skeleton (组合模式)",
        rows: [
          {
            prop: "avatar",
            description: "左侧头像骨架。为对象时可定制 shape / size",
            type: `boolean | { shape?: "circle" | "square"; size?: "sm" | "md" | "lg" }`,
            default: "false",
          },
          {
            prop: "title",
            description: "标题行骨架。组合模式下默认 true",
            type: `boolean | { width?: number | string }`,
            default: "true (composite)",
          },
          {
            prop: "paragraph",
            description: "段落行骨架。可指定 rows 与每行宽度(最后一行默认 60%)",
            type: `boolean | { rows?: number; width?: (number | string)[] }`,
            default: "{ rows: 3 }",
          },
        ],
      },
    ]}
  />
);

export default defineSection({
  id: "skeleton",
  group: "反馈",
  order: 90,
  label: "Skeleton 骨架屏",
  eyebrow: "FEEDBACK",
  title: "Skeleton 骨架屏",
  desc: "数据加载前展示页面结构轮廓。",
  Component: SectionSkeleton,
});
