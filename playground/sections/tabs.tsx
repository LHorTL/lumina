import * as React from "react";
import { Tabs } from "lumina";
import { DocPage } from "../docs";
import { defineSection, type SectionCtx } from "./_types";

const PadBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ padding: 16, color: "var(--fg-muted)" }}>{children}</div>
);

const SectionTabs: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={<p>同一层级的内容分组,通过标签切换。</p>}
    demos={[
      {
        id: "basic",
        title: "基础",
        span: 2,
        code: `<Tabs items={[
  { key: "general", label: "通用", content: <>...</> },
  { key: "account", label: "账户", content: <>...</> },
]} />`,
        render: () => (
          <Tabs
            items={[
              { key: "general", label: "通用", content: <PadBox>通用设置</PadBox> },
              { key: "account", label: "账户", content: <PadBox>账户设置</PadBox> },
              { key: "notify", label: "通知", content: <PadBox>通知设置</PadBox> },
              { key: "privacy", label: "隐私", content: <PadBox>隐私设置</PadBox> },
            ]}
          />
        ),
      },
      {
        id: "variant",
        title: "下划线变体",
        span: 2,
        code: `<Tabs variant="line" items={[...]} />`,
        render: () => (
          <Tabs
            variant="line"
            items={[
              { key: "overview", label: "总览" },
              { key: "activity", label: "活动" },
              { key: "members", label: "成员" },
              { key: "integrations", label: "集成" },
            ]}
          />
        ),
      },
      {
        id: "centered",
        title: "居中对齐",
        span: 2,
        description: "centered 让标签条在容器中水平居中。",
        code: `<Tabs centered items={[...]} />`,
        render: () => (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Tabs
              centered
              items={[
                { key: "a", label: "第一项" },
                { key: "b", label: "第二项" },
                { key: "c", label: "第三项" },
              ]}
            />
            <Tabs
              centered
              variant="line"
              items={[
                { key: "a", label: "Overview" },
                { key: "b", label: "Billing" },
                { key: "c", label: "Security" },
              ]}
            />
          </div>
        ),
      },
    ]}
    api={[
      {
        title: "Tabs",
        rows: [
          { prop: "items", description: "标签数据", type: "TabItem[]", required: true },
          { prop: "activeKey / defaultActiveKey", description: "受控/初始激活", type: "string" },
          { prop: "onChange", description: "切换", type: "(key: string) => void" },
          { prop: "variant", description: "样式", type: `"line" | "pill" | "segmented"`, default: `"line"` },
          { prop: "centered", description: "标签条居中对齐", type: "boolean", default: "false" },
        ],
      },
    ]}
  />
);

export default defineSection({
  id: "tabs",
  group: "数据展示",
  order: 120,
  label: "Tabs 选项卡",
  eyebrow: "DATA DISPLAY",
  title: "Tabs 选项卡",
  desc: "同一层级的内容分组,通过标签切换。",
  Component: SectionTabs,
});
