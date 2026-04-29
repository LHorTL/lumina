import * as React from "react";
import { Button, Tooltip } from "lumina";
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
        code: `<Tooltip content="新建文档"><Button icon="plus" /></Tooltip>`,
        render: () => (
          <Row>
            <Tooltip content="新建文档">
              <Button icon="plus" />
            </Tooltip>
            <Tooltip content="收藏">
              <Button icon="star" />
            </Tooltip>
            <Tooltip content="发送 ⌘↵">
              <Button icon="send" />
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
      {
        id: "title-alias",
        title: "title 别名",
        description: "title 与 content 等价,也支持 bottomLeft 等细分位置。",
        code: `<Tooltip title="复制路径" placement="bottomLeft">
  <Button icon="copy">复制</Button>
</Tooltip>`,
        render: () => (
          <Tooltip title="复制路径" placement="bottomLeft" overlayClassName="demo-tooltip-overlay">
            <Button icon="copy">复制</Button>
          </Tooltip>
        ),
      },
    ]}
    api={[
      {
        title: "Tooltip",
        rows: [
          { prop: "content", description: "提示内容", type: "ReactNode" },
          { prop: "title", description: "content 的等价别名", type: "ReactNode" },
          { prop: "placement", description: "位置,支持 bottomLeft 等细分方向", type: `"top" | "bottom" | "left" | "right" | ...`, default: `"top"` },
          { prop: "delay", description: "悬浮延时 (ms)", type: "number", default: "250" },
          { prop: "closeDelay", description: "离开触发器或提示浮层后的关闭延时 (ms)", type: "number", default: "300" },
          { prop: "disabled", description: "禁用提示", type: "boolean", default: "false" },
          { prop: "open / visible", description: "受控显示状态", type: "boolean" },
          { prop: "overlayClassName / popupClassName", description: "浮层 className", type: "string" },
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
