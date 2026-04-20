import * as React from "react";
import { Card, Icon, Sidebar } from "lumina";
import { DocPage } from "../docs";
import { defineSection, type SectionCtx } from "./_types";

const SectionSidebar: React.FC<SectionCtx> = () => {
  const [active, setActive] = React.useState("projects");
  return (
    <DocPage
      whenToUse={<p>应用的主导航,沿屏幕左侧垂直排列。</p>}
      demos={[
        {
          id: "basic",
          title: "基础",
          span: 2,
          code: `<Sidebar items={[{ key, label, icon, badge }]} activeKey={active} onSelect={setActive} />`,
          render: () => (
            <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
              <div style={{ width: 220 }}>
                <Sidebar
                  items={[
                    { key: "inbox", label: "收件箱", icon: <Icon name="mail" size={14} />, badge: 4 },
                    { key: "starred", label: "星标", icon: <Icon name="star" size={14} /> },
                    { key: "projects", label: "项目", icon: <Icon name="folder" size={14} /> },
                    { key: "drafts", label: "草稿", icon: <Icon name="file" size={14} /> },
                    { key: "archive", label: "归档", icon: <Icon name="layers" size={14} /> },
                  ]}
                  activeKey={active}
                  onSelect={setActive}
                  header={<div style={{ fontWeight: 600, padding: "4px 8px" }}>工作台</div>}
                />
              </div>
              <Card style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>当前选中: {active}</div>
                <div style={{ color: "var(--fg-muted)", fontSize: 13, lineHeight: 1.7 }}>
                  Sidebar 使用凹陷选中 + 凸起悬停的层级关系。
                </div>
              </Card>
            </div>
          ),
        },
      ]}
      api={[
        {
          title: "Sidebar",
          rows: [
            { prop: "items", description: "导航项", type: "SidebarItem[]", required: true },
            { prop: "activeKey", description: "当前激活项", type: "string" },
            { prop: "onSelect", description: "选择回调", type: "(key: string) => void" },
            { prop: "collapsed", description: "折叠为图标", type: "boolean", default: "false" },
            { prop: "header / footer", description: "头/尾内容", type: "ReactNode" },
          ],
        },
        {
          title: "SidebarItem",
          rows: [
            { prop: "key", description: "唯一键", type: "string", required: true },
            { prop: "label", description: "文案", type: "ReactNode" },
            { prop: "icon", description: "前置图标", type: "ReactNode" },
            { prop: "badge", description: "尾部徽标", type: "ReactNode" },
          ],
        },
      ]}
    />
  );
};

export default defineSection({
  id: "sidebar",
  group: "Electron",
  order: 30,
  label: "Sidebar 侧边栏",
  eyebrow: "ELECTRON",
  title: "Sidebar 侧边栏",
  desc: "应用主导航,沿屏幕左侧垂直排列。",
  Component: SectionSidebar,
});
