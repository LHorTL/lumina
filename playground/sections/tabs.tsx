import * as React from "react";
import { Tabs } from "lumina";
import { DocPage } from "../docs";
import { defineSection, type SectionCtx } from "./_types";

const PadBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ padding: 16, color: "var(--fg-muted)" }}>{children}</div>
);

/** 渲染足够长的内容，用于验证满高 Tabs 的独立正文滚动。 */
const ScrollableSettings: React.FC<{ prefix: string }> = ({ prefix }) => (
  <div style={{ display: "grid", gap: 10, padding: "var(--gap-2) var(--gap-1)" }}>
    {Array.from({ length: 12 }, (_, index) => (
      <div
        key={index}
        style={{
          padding: "10px 12px",
          borderRadius: "var(--r-sm)",
          background: "var(--bg-sunken)",
          color: "var(--fg-muted)",
        }}
      >
        {prefix} · 设置项 {index + 1}
      </div>
    ))}
  </div>
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
        id: "fill-scroll",
        title: "满高布局 / 正文独立滚动",
        span: 2,
        description: "fill 让 Tabs 占满父容器，标签条保持固定，只有 tabs-content 滚动；两个 className 可定向接入业务布局。",
        code: `<div style={{ height: 260 }}>
  <Tabs
    fill
    tabBarClassName="workspace-tabs-bar"
    contentClassName="workspace-tabs-content"
    items={[
      { key: "general", label: "通用", content: <LongSettings /> },
      { key: "advanced", label: "高级", content: <LongSettings /> },
    ]}
  />
</div>`,
        render: () => (
          <div
            style={{
              height: 260,
              overflow: "hidden",
              padding: 14,
              borderRadius: "var(--r-lg)",
              boxShadow: "var(--neu-shadow-inset)",
            }}
          >
            <Tabs
              fill
              tabBarClassName="workspace-tabs-bar"
              contentClassName="workspace-tabs-content"
              items={[
                { key: "general", label: "通用", content: <ScrollableSettings prefix="通用" /> },
                { key: "advanced", label: "高级", content: <ScrollableSettings prefix="高级" /> },
              ]}
            />
          </div>
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
          { prop: "tabBarClassName", description: "标签条容器的附加类名", type: "string" },
          { prop: "contentClassName", description: "正文容器的附加类名", type: "string" },
          { prop: "fill", description: "占满父容器，并让正文区域独立滚动", type: "boolean", default: "false" },
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
