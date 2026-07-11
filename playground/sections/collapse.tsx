import * as React from "react";
import { Collapse } from "lumina";
import { DocPage } from "../docs";
import { defineSection, type SectionCtx } from "./_types";

const SectionCollapse: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={<p>纵向折叠面板,适合 FAQ、设置项分组等场景。关闭面板会从键盘焦点顺序中移除内部控件。</p>}
    demos={[
      {
        id: "basic",
        title: "基础",
        span: 2,
        code: `<Collapse items={[{ key, label, children }]} />`,
        render: () => (
          <Collapse
            items={[
              { key: "1", label: "如何开始使用 Lumina?", children: <div>引入 lumina 与样式表,立刻可用。</div> },
              { key: "2", label: "支持哪些主题?", children: <div>开箱浅 / 深 + 6 个强调色,可通过 Tweaks 实时调整。</div> },
              { key: "3", label: "是否兼容 Electron?", children: <div>已针对 macOS 与 Windows 提供 TitleBar 与 Sidebar 组件。</div> },
            ]}
          />
        ),
      },
      {
        id: "multiple",
        title: "多项展开",
        span: 2,
        description: "multiple={true} 允许同时展开多个面板，也是默认行为。",
        code: `<Collapse multiple defaultActiveKey={["1", "2"]} ... />`,
        render: () => (
          <Collapse
            multiple
            defaultActiveKey={["1", "2"]}
            items={[
              { key: "1", label: "面板 1", children: <div>内容 1</div> },
              { key: "2", label: "面板 2", children: <div>内容 2</div> },
              { key: "3", label: "面板 3", children: <div>内容 3</div> },
            ]}
          />
        ),
      },
      {
        id: "single-open",
        title: "multiple={false}",
        span: 2,
        description: "单开模式最多保留一项；即使 activeKey / defaultActiveKey 传入数组，也只采用首项。",
        code: `<Collapse multiple={false} defaultActiveKey={["1", "2"]} ... />`,
        render: () => (
          <Collapse
            multiple={false}
            defaultActiveKey={["1", "2"]}
            items={[
              { key: "1", label: "首项会被保留", children: <div>数组中的第二项会在初始化时被忽略。</div> },
              { key: "2", label: "展开本项会收起首项", children: <div>单开行为与 accordion 一致。</div> },
            ]}
          />
        ),
      },
      {
        id: "accordion",
        title: "手风琴模式",
        span: 2,
        description: "accordion={true} 同一时刻最多只展开一项;与 multiple 同时传入时 accordion 优先。",
        code: `<Collapse accordion defaultActiveKey="1" ... />`,
        render: () => (
          <Collapse
            accordion
            defaultActiveKey="1"
            items={[
              { key: "1", label: "手风琴 Item A", children: <div>展开 B 时 A 会自动收起。</div> },
              { key: "2", label: "手风琴 Item B", children: <div>只保留最后展开的那一项。</div> },
              { key: "3", label: "手风琴 Item C", children: <div>严格的互斥行为。</div> },
            ]}
          />
        ),
      },
      {
        id: "collapsible-icon",
        title: "仅图标可点",
        span: 2,
        description: "collapsible=\"icon\" 将展开触发限制在右侧箭头图标上,标题区域不再响应。",
        code: `<Collapse collapsible="icon" ... />`,
        render: () => (
          <Collapse
            collapsible="icon"
            items={[
              { key: "1", label: "只有箭头可点击", children: <div>点击标题不会展开,请点击右侧箭头。</div> },
              { key: "2", label: "第二项", children: <div>同样只有箭头可触发。</div> },
            ]}
          />
        ),
      },
      {
        id: "collapsible-disabled",
        title: "禁用展开",
        span: 2,
        description: "collapsible=\"disabled\" 会禁用所有项的展开交互。",
        code: `<Collapse collapsible="disabled" defaultActiveKey="1" ... />`,
        render: () => (
          <Collapse
            collapsible="disabled"
            defaultActiveKey="1"
            items={[
              { key: "1", label: "无法折叠(已展开)", children: <div>这个面板始终保持当前状态。</div> },
              { key: "2", label: "无法展开", children: <div>你点不到我。</div> },
            ]}
          />
        ),
      },
    ]}
    api={[
      {
        title: "Collapse",
        rows: [
          { prop: "items", description: "面板数据", type: "CollapseItem[]", required: true },
          { prop: "accordion", description: "手风琴模式(同一时刻最多一项)", type: "boolean", default: "false" },
          { prop: "multiple", description: "是否可同时展开多个；false 时数组键值只保留首项", type: "boolean", default: "true" },
          { prop: "collapsible", description: "展开触发区域", type: `"header" | "icon" | "disabled"`, default: `"header"` },
          { prop: "activeKey / defaultActiveKey", description: "受控/初始展开；单开模式会归一为至多一项", type: "string | string[]" },
          { prop: "ghost", description: "无外框/阴影的轻量样式", type: "boolean", default: "false" },
          { prop: "size", description: "尺寸", type: `"small" | "middle" | "large"`, default: `"middle"` },
          { prop: "onChange", description: "展开变更；单开模式仍统一返回长度不超过 1 的数组", type: "(keys: string[]) => void" },
        ],
      },
    ]}
  />
);

export default defineSection({
  id: "collapse",
  group: "数据展示",
  order: 130,
  label: "Collapse 折叠",
  eyebrow: "DATA DISPLAY",
  title: "Collapse 折叠面板",
  desc: "纵向折叠面板。",
  Component: SectionCollapse,
});
