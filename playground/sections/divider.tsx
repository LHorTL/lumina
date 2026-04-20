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
        id: "orientation",
        title: "文字位置",
        description: "orientation 控制文字在线上的位置。",
        span: 2,
        code: `<Divider label="左对齐" orientation="left" />
<Divider label="居中" orientation="center" />
<Divider label="右对齐" orientation="right" />`,
        render: () => (
          <div>
            <Divider label="左对齐" orientation="left" />
            <Divider label="居中" orientation="center" />
            <Divider label="右对齐" orientation="right" />
          </div>
        ),
      },
      {
        id: "dashed",
        title: "虚线",
        description: "dashed 切换为虚线样式,也适用于带文字或垂直方向。",
        span: 2,
        code: `<Divider dashed />
<Divider dashed label="虚线带文字" />
<Row>
  <span>左</span>
  <Divider direction="vertical" dashed />
  <span>右</span>
</Row>`,
        render: () => (
          <div>
            <Divider dashed />
            <Divider dashed label="虚线带文字" orientation="left" />
            <div style={{ paddingTop: 8 }}>
              <Row>
                <span>左</span>
                <Divider direction="vertical" dashed />
                <span>中</span>
                <Divider direction="vertical" dashed />
                <span>右</span>
              </Row>
            </div>
          </div>
        ),
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
          { prop: "orientation", description: "文字位置(仅水平)", type: `"left" | "center" | "right"`, default: `"center"` },
          { prop: "dashed", description: "虚线样式", type: "boolean", default: "false" },
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
