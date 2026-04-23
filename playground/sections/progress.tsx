import * as React from "react";
import { Progress } from "lumina";
import { DocPage } from "../docs";
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
          id: "custom-color",
          title: "自定义颜色",
          code: `<Progress value={66} color="oklch(72% 0.18 285)" label="品牌同步" showValue />
<Progress value={38} color="#22c1c3" label="音频缓冲" showValue />`,
          render: () => (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Progress value={66} color="oklch(72% 0.18 285)" label="品牌同步" showValue />
              <Progress value={38} color="#22c1c3" label="音频缓冲" showValue />
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
      ]}
      api={[
        {
          title: "Progress",
          rows: [
            { prop: "value", description: "0–max 之间", type: "number", required: true },
            { prop: "max", description: "最大值", type: "number", default: "100" },
            { prop: "tone", description: "色调", type: `"accent" | "success" | "warning" | "danger"`, default: `"accent"` },
            { prop: "color", description: "自定义填充色,覆盖 tone", type: "string" },
            { prop: "size", description: "尺寸", type: `"sm" | "md" | "lg"`, default: `"md"` },
            { prop: "label", description: "顶部文案", type: "ReactNode" },
            { prop: "showValue", description: "显示百分比", type: "boolean", default: "false" },
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
  desc: "条形进度 Progress。",
  Component: SectionProgress,
});
