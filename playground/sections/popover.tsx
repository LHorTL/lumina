import * as React from "react";
import { Avatar, Button, Popover, toast } from "lumina";
import { DocPage } from "../docs";
import { Row } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

const SectionPopover: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={<p>比 Tooltip 更丰富的浮层,可承载交互元素如按钮、表单。</p>}
    demos={[
      {
        id: "basic",
        title: "基础",
        code: `<Popover content={<>...</>}>
  <Button>触发</Button>
</Popover>`,
        render: () => (
          <Row gap={24}>
            <Popover
              content={
                <div style={{ padding: 12, minWidth: 200 }}>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>确认删除?</div>
                  <div style={{ color: "var(--fg-muted)", fontSize: 12, marginBottom: 10 }}>
                    删除后无法恢复。
                  </div>
                  <Row gap={6}>
                    <Button size="sm" variant="ghost">
                      取消
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => toast.error("已删除")}>
                      删除
                    </Button>
                  </Row>
                </div>
              }
            >
              <Button variant="danger" icon="trash">
                删除项目
              </Button>
            </Popover>
            <Popover
              placement="right"
              content={
                <div style={{ padding: 10, display: "flex", alignItems: "center", gap: 10, minWidth: 180 }}>
                  <Avatar alt="金" size="sm" />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>金伟</div>
                    <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>设计总监</div>
                  </div>
                </div>
              }
            >
              <Avatar alt="金" />
            </Popover>
          </Row>
        ),
      },
    ]}
    api={[
      {
        title: "Popover",
        rows: [
          { prop: "content", description: "浮层内容", type: "ReactNode", required: true },
          { prop: "placement", description: "位置", type: `"top" | "bottom" | "left" | "right"`, default: `"bottom"` },
          { prop: "trigger", description: "触发方式", type: `"click" | "hover"`, default: `"click"` },
          { prop: "open / defaultOpen / onOpenChange", description: "受控显示", type: "—" },
        ],
      },
    ]}
  />
);

export default defineSection({
  id: "popover",
  group: "反馈",
  order: 50,
  label: "Popover 气泡卡片",
  eyebrow: "FEEDBACK",
  title: "Popover 气泡卡片",
  desc: "比 Tooltip 更丰富,可承载交互内容。",
  Component: SectionPopover,
});
