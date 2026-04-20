import * as React from "react";
import { Accordion } from "lumina";
import { DocPage } from "../docs";
import { defineSection, type SectionCtx } from "./_types";

const SectionAccordion: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={<p>纵向折叠面板,适合 FAQ、设置项分组等场景。</p>}
    demos={[
      {
        id: "basic",
        title: "基础",
        span: 2,
        code: `<Accordion items={[{ key, title, content }]} />`,
        render: () => (
          <Accordion
            items={[
              { key: "1", title: "如何开始使用 Lumina?", content: <div>引入 lumina 与样式表,立刻可用。</div> },
              { key: "2", title: "支持哪些主题?", content: <div>开箱浅 / 深 + 6 个强调色,可通过 Tweaks 实时调整。</div> },
              { key: "3", title: "是否兼容 Electron?", content: <div>已针对 macOS 与 Windows 提供 TitleBar 与 Sidebar 组件。</div> },
            ]}
          />
        ),
      },
      {
        id: "multiple",
        title: "多项展开",
        span: 2,
        description: "multiple 允许同时展开多个面板。",
        code: `<Accordion multiple defaultActiveKeys={["1", "2"]} ... />`,
        render: () => (
          <Accordion
            multiple
            defaultActiveKeys={["1", "2"]}
            items={[
              { key: "1", title: "面板 1", content: <div>内容 1</div> },
              { key: "2", title: "面板 2", content: <div>内容 2</div> },
              { key: "3", title: "面板 3", content: <div>内容 3</div> },
            ]}
          />
        ),
      },
      {
        id: "accordion",
        title: "手风琴模式",
        span: 2,
        description: "accordion={true} 同一时刻最多只展开一项;与 multiple 同时传入时 accordion 优先。",
        code: `<Accordion accordion defaultActiveKeys={["1"]} ... />`,
        render: () => (
          <Accordion
            accordion
            defaultActiveKeys={["1"]}
            items={[
              { key: "1", title: "手风琴 Item A", content: <div>展开 B 时 A 会自动收起。</div> },
              { key: "2", title: "手风琴 Item B", content: <div>只保留最后展开的那一项。</div> },
              { key: "3", title: "手风琴 Item C", content: <div>严格的互斥行为。</div> },
            ]}
          />
        ),
      },
      {
        id: "collapsible-icon",
        title: "仅图标可点",
        span: 2,
        description: "collapsible=\"icon\" 将展开触发限制在右侧箭头图标上,标题区域不再响应。",
        code: `<Accordion collapsible="icon" ... />`,
        render: () => (
          <Accordion
            collapsible="icon"
            items={[
              { key: "1", title: "只有箭头可点击", content: <div>点击标题不会展开,请点击右侧箭头。</div> },
              { key: "2", title: "第二项", content: <div>同样只有箭头可触发。</div> },
            ]}
          />
        ),
      },
      {
        id: "collapsible-disabled",
        title: "禁用展开",
        span: 2,
        description: "collapsible=\"disabled\" 会禁用所有项的展开交互。",
        code: `<Accordion collapsible="disabled" defaultActiveKeys={["1"]} ... />`,
        render: () => (
          <Accordion
            collapsible="disabled"
            defaultActiveKeys={["1"]}
            items={[
              { key: "1", title: "无法折叠(已展开)", content: <div>这个面板始终保持当前状态。</div> },
              { key: "2", title: "无法展开", content: <div>你点不到我。</div> },
            ]}
          />
        ),
      },
    ]}
    api={[
      {
        title: "Accordion",
        rows: [
          { prop: "items", description: "面板数据", type: "AccordionItem[]", required: true },
          { prop: "multiple", description: "可同时展开多个", type: "boolean", default: "false" },
          { prop: "accordion", description: "手风琴模式(同一时刻最多一项)", type: "boolean", default: "false" },
          { prop: "collapsible", description: "展开触发区域", type: `"header" | "icon" | "disabled"`, default: `"header"` },
          { prop: "activeKeys / defaultActiveKeys", description: "受控/初始展开", type: "string[]" },
          { prop: "onChange", description: "展开变更", type: "(keys: string[]) => void" },
        ],
      },
    ]}
  />
);

export default defineSection({
  id: "accordion",
  group: "数据展示",
  order: 130,
  label: "Accordion 折叠",
  eyebrow: "DATA DISPLAY",
  title: "Accordion 折叠面板",
  desc: "纵向折叠面板。",
  Component: SectionAccordion,
});
