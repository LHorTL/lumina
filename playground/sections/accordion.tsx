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
    ]}
    api={[
      {
        title: "Accordion",
        rows: [
          { prop: "items", description: "面板数据", type: "AccordionItem[]", required: true },
          { prop: "multiple", description: "可同时展开多个", type: "boolean", default: "false" },
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
