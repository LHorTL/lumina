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
        title: "组合:头像 + 文本",
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
        title: "Skeleton",
        rows: [
          { prop: "width", description: "宽度", type: "number | string", default: `"100%"` },
          { prop: "height", description: "高度", type: "number | string", default: "16" },
          { prop: "circle", description: "圆形", type: "boolean", default: "false" },
          { prop: "animation", description: "动画", type: `"wave" | "pulse" | "none"`, default: `"wave"` },
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
