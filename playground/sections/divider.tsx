import * as React from "react";
import { Divider } from "lumina";
import { DocPage } from "../docs";
import { Row } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

const SectionDivider: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={<p>对内容进行分割,水平或垂直方向皆可。</p>}
    demos={[
      {
        id: "basic",
        title: "水平分隔",
        code: `<Divider />`,
        render: () => (
          <div>
            <p>段落一</p>
            <Divider />
            <p>段落二</p>
          </div>
        ),
      },
      {
        id: "label",
        title: "带文字",
        code: `<Divider label="分割标题" />`,
        render: () => <Divider label="分割标题" />,
      },
      {
        id: "vertical",
        title: "垂直分隔",
        code: `<Divider direction="vertical" />`,
        render: () => (
          <Row>
            <span>左</span>
            <Divider direction="vertical" />
            <span>中</span>
            <Divider direction="vertical" />
            <span>右</span>
          </Row>
        ),
      },
    ]}
    api={[
      {
        title: "Divider",
        rows: [
          { prop: "direction", description: "方向", type: `"horizontal" | "vertical"`, default: `"horizontal"` },
          { prop: "label", description: "中部文字", type: "ReactNode" },
          { prop: "sunken", description: "凹陷凹槽样式", type: "boolean", default: "false" },
        ],
      },
    ]}
  />
);

export default defineSection({
  id: "divider",
  group: "数据展示",
  order: 50,
  label: "Divider 分隔",
  eyebrow: "DATA DISPLAY",
  title: "Divider 分隔符",
  desc: "对内容进行分割。",
  Component: SectionDivider,
});
