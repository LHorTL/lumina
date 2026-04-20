import * as React from "react";
import { Button, IconButton, Tooltip } from "lumina";
import { DocPage } from "../docs";
import { Row } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

const SectionTooltip: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={<p>对元素进行简短的辅助说明,鼠标悬浮触发。</p>}
    demos={[
      {
        id: "basic",
        title: "基础",
        code: `<Tooltip content="新建文档"><IconButton icon="plus" /></Tooltip>`,
        render: () => (
          <Row>
            <Tooltip content="新建文档">
              <IconButton icon="plus" />
            </Tooltip>
            <Tooltip content="收藏">
              <IconButton icon="star" />
            </Tooltip>
            <Tooltip content="发送 ⌘↵">
              <IconButton icon="send" />
            </Tooltip>
          </Row>
        ),
      },
      {
        id: "placement",
        title: "位置",
        code: `<Tooltip placement="bottom" content="..." />`,
        render: () => (
          <Row gap={32}>
            <Tooltip content="顶部" placement="top">
              <Button>Top</Button>
            </Tooltip>
            <Tooltip content="底部" placement="bottom">
              <Button>Bottom</Button>
            </Tooltip>
            <Tooltip content="左侧" placement="left">
              <Button>Left</Button>
            </Tooltip>
            <Tooltip content="右侧" placement="right">
              <Button>Right</Button>
            </Tooltip>
          </Row>
        ),
      },
    ]}
    api={[
      {
        title: "Tooltip",
        rows: [
          { prop: "content", description: "提示内容", type: "ReactNode", required: true },
          { prop: "placement", description: "位置", type: `"top" | "bottom" | "left" | "right"`, default: `"top"` },
          { prop: "delay", description: "悬浮延时 (ms)", type: "number", default: "250" },
          { prop: "disabled", description: "禁用提示", type: "boolean", default: "false" },
        ],
      },
    ]}
  />
);

export default defineSection({
  id: "tooltip",
  group: "反馈",
  order: 40,
  label: "Tooltip 文字提示",
  eyebrow: "FEEDBACK",
  title: "Tooltip 文字提示",
  desc: "鼠标悬浮触发的简短说明。",
  Component: SectionTooltip,
});
