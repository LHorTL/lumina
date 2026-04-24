import * as React from "react";
import { Avatar, Button, Popover, message, Input } from "lumina";
import { DocPage, type ApiRow } from "../docs";
import { Row } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

const popoverApi: ApiRow[] = [
  { prop: "content", description: "浮层内容", type: "ReactNode", required: true },
  { prop: "title", description: "标题", type: "ReactNode" },
  { prop: "placement", description: "弹出位置,支持 bottomLeft 等细分方向", type: `"top" | "bottom" | "left" | "right" | ...`, default: `"bottom"` },
  { prop: "trigger", description: "触发方式", type: `"click" | "hover"`, default: `"click"` },
  { prop: "arrow", description: "显示箭头", type: "boolean", default: "false" },
  { prop: "closable", description: "显示关闭按钮", type: "boolean", default: "false" },
  { prop: "width", description: "面板宽度，\"auto\" 自适应", type: `number | "auto"` },
  { prop: "open", description: "受控显示状态", type: "boolean" },
  { prop: "defaultOpen", description: "非受控初始状态", type: "boolean", default: "false" },
  { prop: "onOpenChange", description: "显示状态变化回调", type: "(open: boolean) => void" },
  { prop: "visible / onVisibleChange", description: "受控显示状态别名", type: "boolean / (visible) => void" },
  { prop: "overlayClassName / popupClassName", description: "浮层 className", type: "string" },
];

const SectionPopover: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={<p>比 Tooltip 更丰富的浮层，可承载交互元素如按钮、表单。</p>}
    demos={[
      {
        id: "basic",
        title: "基础用法",
        description: "点击触发，弹出气泡卡片",
        code: `<Row gap={24}>
  <Popover
    title="确认删除？"
    content={
      <div>
        <div style={{ color: "var(--fg-muted)", fontSize: 13, marginBottom: 12 }}>
          删除后无法恢复。
        </div>
        <Row gap={6}>
          <Button size="sm" variant="ghost">取消</Button>
          <Button size="sm" variant="danger">删除</Button>
        </Row>
      </div>
    }
  >
    <Button variant="danger" icon="trash">删除项目</Button>
  </Popover>

  <Popover
    placement="right"
    content={
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 160 }}>
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
</Row>`,
        render: () => (
          <Row gap={24}>
            <Popover
              title="确认删除？"
              content={
                <div>
                  <div style={{ color: "var(--fg-muted)", fontSize: 13, marginBottom: 12 }}>
                    删除后无法恢复。
                  </div>
                  <Row gap={6}>
                    <Button size="sm" variant="ghost">取消</Button>
                    <Button size="sm" variant="danger" onClick={() => message.error("已删除")}>删除</Button>
                  </Row>
                </div>
              }
            >
              <Button variant="danger" icon="trash">删除项目</Button>
            </Popover>
            <Popover
              placement="right"
              content={
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 160 }}>
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
      {
        id: "placement",
        title: "四方向",
        description: "支持 top / bottom / left / right 四个方向",
        code: `<div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
  <Popover placement="top" arrow content={<div>上方弹出内容</div>}>
    <Button variant="ghost">上方</Button>
  </Popover>
  <Popover placement="bottom" arrow content={<div>下方弹出内容</div>}>
    <Button variant="ghost">下方</Button>
  </Popover>
  <Popover placement="left" arrow content={<div>左侧弹出内容</div>}>
    <Button variant="ghost">左侧</Button>
  </Popover>
  <Popover placement="right" arrow content={<div>右侧弹出内容</div>}>
    <Button variant="ghost">右侧</Button>
  </Popover>
</div>`,
        render: () => (
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
            <Popover placement="top" arrow content={<div>上方弹出内容</div>}>
              <Button variant="ghost">上方</Button>
            </Popover>
            <Popover placement="bottom" arrow content={<div>下方弹出内容</div>}>
              <Button variant="ghost">下方</Button>
            </Popover>
            <Popover placement="left" arrow content={<div>左侧弹出内容</div>}>
              <Button variant="ghost">左侧</Button>
            </Popover>
            <Popover placement="right" arrow content={<div>右侧弹出内容</div>}>
              <Button variant="ghost">右侧</Button>
            </Popover>
          </div>
        ),
      },
      {
        id: "placement-detail",
        title: "细分位置与浮层 class",
        description: "placement 支持 bottomLeft 等细分方向,overlayClassName 可标记浮层节点。",
        code: `<Popover
  placement="bottomLeft"
  overlayClassName="settings-popover"
  title="快捷设置"
  content={<div>显示在触发器左下方。</div>}
>
  <Button icon="settings">设置</Button>
</Popover>`,
        render: () => (
          <Popover
            placement="bottomLeft"
            overlayClassName="demo-popover-overlay"
            title="快捷设置"
            content={<div style={{ color: "var(--fg-muted)", fontSize: 13 }}>显示在触发器左下方。</div>}
          >
            <Button icon="settings">设置</Button>
          </Popover>
        ),
      },
      {
        id: "arrow",
        title: "箭头",
        description: "arrow 属性添加指向触发元素的小箭头",
        code: `<Popover
  arrow
  title="系统通知"
  content={<div style={{ color: "var(--fg-muted)", fontSize: 13 }}>你有 3 条未读消息。</div>}
>
  <Button icon="bell">消息</Button>
</Popover>`,
        render: () => (
          <Popover
            arrow
            title="系统通知"
            content={<div style={{ color: "var(--fg-muted)", fontSize: 13 }}>你有 3 条未读消息。</div>}
          >
            <Button icon="bell">消息</Button>
          </Popover>
        ),
      },
      {
        id: "closable",
        title: "可关闭",
        description: "closable 显示关闭按钮，适合信息提示场景",
        code: `<Popover
  closable
  arrow
  title="注意事项"
  content={<div style={{ color: "var(--fg-muted)", fontSize: 13 }}>此操作需要管理员权限才能执行。</div>}
>
  <Button icon="alert">权限</Button>
</Popover>`,
        render: () => (
          <Popover
            closable
            arrow
            title="注意事项"
            content={
              <div style={{ color: "var(--fg-muted)", fontSize: 13 }}>
                此操作需要管理员权限才能执行。
              </div>
            }
          >
            <Button icon="alert">权限</Button>
          </Popover>
        ),
      },
      {
        id: "hover",
        title: "Hover 触发",
        description: "trigger=\"hover\" 鼠标悬停触发",
        code: `<Popover
  trigger="hover"
  arrow
  content={
    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 160 }}>
      <Avatar alt="云" size="sm" />
      <div>
        <div style={{ fontSize: 13, fontWeight: 600 }}>云曦</div>
        <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>前端工程师</div>
      </div>
    </div>
  }
>
  <Avatar alt="云" />
</Popover>`,
        render: () => (
          <Popover
            trigger="hover"
            arrow
            content={
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 160 }}>
                <Avatar alt="云" size="sm" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>云曦</div>
                  <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>前端工程师</div>
                </div>
              </div>
            }
          >
            <Avatar alt="云" />
          </Popover>
        ),
      },
      {
        id: "form",
        title: "表单内容",
        description: "气泡内可放置表单等复杂交互",
        code: `<Popover
  title="快速备注"
  closable
  arrow
  content={
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <Input placeholder="输入备注..." />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
        <Button size="sm">保存</Button>
      </div>
    </div>
  }
>
  <Button icon="edit">备注</Button>
</Popover>`,
        render: () => (
          <Popover
            title="快速备注"
            closable
            arrow
            content={
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Input placeholder="输入备注..." />
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                  <Button size="sm" onClick={() => message.success("已保存")}>保存</Button>
                </div>
              </div>
            }
          >
            <Button icon="edit">备注</Button>
          </Popover>
        ),
      },
    ]}
    api={[{ title: "Popover", rows: popoverApi }]}
  />
);

export default defineSection({
  id: "popover",
  group: "反馈",
  order: 50,
  label: "Popover 气泡卡片",
  eyebrow: "FEEDBACK",
  title: "Popover 气泡卡片",
  desc: "比 Tooltip 更丰富，可承载交互内容。",
  Component: SectionPopover,
});
