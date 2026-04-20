import * as React from "react";
import { Progress, Ring } from "lumina";
import { DocPage } from "../docs";
import { Row } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

const SectionProgress: React.FC<SectionCtx> = () => {
  const [v, setV] = React.useState(45);
  React.useEffect(() => {
    const t = setInterval(() => setV((p) => (p + 1) % 101), 80);
    return () => clearInterval(t);
  }, []);
  return (
    <DocPage
      whenToUse={<p>展示一项操作的当前进度。</p>}
      demos={[
        {
          id: "basic",
          title: "条形进度",
          code: `<Progress value={v} label="下载中" showValue />`,
          render: () => (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Progress value={v} label="下载中" showValue />
              <Progress value={72} tone="success" label="同步完成" showValue />
              <Progress value={45} tone="warning" label="磁盘占用" showValue />
              <Progress value={92} tone="danger" label="负载" showValue />
            </div>
          ),
        },
        {
          id: "size",
          title: "尺寸",
          code: `<Progress size="sm" value={60} />
<Progress value={60} />
<Progress size="lg" value={60} />`,
          render: () => (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Progress size="sm" value={60} />
              <Progress value={60} />
              <Progress size="lg" value={60} />
            </div>
          ),
        },
        {
          id: "ring",
          title: "环形进度",
          code: `<Ring value={65} />
<Ring value={90} tone="success" size={80}><strong>90%</strong></Ring>`,
          render: () => (
            <Row gap={24}>
              <Ring value={25} />
              <Ring value={62} />
              <Ring value={v} />
              <Ring value={100} size={64} tone="success" />
            </Row>
          ),
        },
      ]}
      api={[
        {
          title: "Progress",
          rows: [
            { prop: "value", description: "0–max 之间", type: "number", required: true },
            { prop: "max", description: "最大值", type: "number", default: "100" },
            { prop: "tone", description: "色调", type: `"accent" | "success" | "warning" | "danger"`, default: `"accent"` },
            { prop: "size", description: "尺寸", type: `"sm" | "md" | "lg"`, default: `"md"` },
            { prop: "label", description: "顶部文案", type: "ReactNode" },
            { prop: "showValue", description: "显示百分比", type: "boolean", default: "false" },
          ],
        },
        {
          title: "Ring",
          rows: [
            { prop: "value", description: "0–100", type: "number", required: true },
            { prop: "size", description: "直径 (px)", type: "number", default: "72" },
            { prop: "tone", description: "色调", type: `"accent" | "success" | ...`, default: `"accent"` },
          ],
        },
      ]}
    />
  );
};

export default defineSection({
  id: "progress",
  group: "数据展示",
  order: 70,
  label: "Progress 进度",
  eyebrow: "DATA DISPLAY",
  title: "Progress 进度",
  desc: "条形进度 Progress 与环形进度 Ring。",
  Component: SectionProgress,
});
