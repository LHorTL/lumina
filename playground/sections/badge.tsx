import * as React from "react";
import { Avatar, Badge, IconButton } from "lumina";
import { DocPage } from "../docs";
import { Row } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

const SectionBadge: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={<p>展示在元素角落的小型计数或状态指示器,常用于通知、消息、未读数。</p>}
    demos={[
      {
        id: "basic",
        title: "数字徽标",
        code: `<Badge count={3}><IconButton icon="bell" /></Badge>
<Badge count={128} max={99}><IconButton icon="mail" /></Badge>`,
        render: () => (
          <Row gap={32}>
            <Badge count={3}>
              <IconButton icon="bell" tip="3 条新通知" />
            </Badge>
            <Badge count={128}>
              <IconButton icon="mail" tip="未读消息" />
            </Badge>
            <Badge count={1000}>
              <IconButton icon="info" />
            </Badge>
          </Row>
        ),
      },
      {
        id: "dot",
        title: "圆点",
        description: "dot 模式不显示数字,只是状态指示。",
        code: `<Badge dot><IconButton icon="user" /></Badge>`,
        render: () => (
          <Row gap={32}>
            <Badge dot>
              <IconButton icon="user" tip="在线" />
            </Badge>
            <Badge dot>
              <Avatar alt="金" />
            </Badge>
          </Row>
        ),
      },
    ]}
    api={[
      {
        title: "Badge",
        rows: [
          { prop: "count", description: "显示数字", type: "number" },
          { prop: "dot", description: "圆点模式", type: "boolean", default: "false" },
          { prop: "max", description: "超过显示 max+", type: "number", default: "99" },
          { prop: "tone", description: "色调", type: `"neutral" | "accent" | ...`, default: `"danger"` },
        ],
      },
    ]}
  />
);

export default defineSection({
  id: "badge",
  group: "数据展示",
  order: 30,
  label: "Badge 徽标",
  eyebrow: "DATA DISPLAY",
  title: "Badge 徽标数",
  desc: "右上角的小型计数或状态指示器。",
  Component: SectionBadge,
});
