import * as React from "react";
import { Button, Card, Icon, Sidebar, Tag } from "lumina";
import { DocPage } from "../docs";
import { defineSection, type SectionCtx } from "./_types";

const SectionSidebar: React.FC<SectionCtx> = () => {
  const [active, setActive] = React.useState("projects");
  const [collapsed, setCollapsed] = React.useState(false);
  const [expandedKeys, setExpandedKeys] = React.useState<string[]>(["workspace"]);
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
        {
          id: "nested",
          title: "折叠与多级导航",
          description: "切换 collapsed 比较完整侧栏与图标轨道；点击含 children 的分组可独立展开或收起。",
          span: 2,
          code: `<Sidebar
  collapsed={collapsed}
  expandedKeys={expandedKeys}
  onExpandedKeysChange={setExpandedKeys}
  items={[{
    key: "workspace",
    label: <span>工作区 <Tag tone="info">团队</Tag></span>,
    ariaLabel: "工作区",
    icon: <Icon name="folder" />,
    children: [{ key: "design", label: "设计系统" }],
  }]}
/>`,
          render: () => (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
                <Button size="sm" icon={collapsed ? "chevRight" : "chevLeft"} onClick={() => setCollapsed((value) => !value)}>
                  {collapsed ? "展开" : "折叠"}
                </Button>
                <Tag tone="info">当前：{collapsed ? "图标轨道" : "完整侧栏"}</Tag>
                <Tag tone="neutral">展开：{expandedKeys.join("、") || "无"}</Tag>
              </div>
              <div style={{ display: "flex", gap: 20, alignItems: "stretch", minHeight: 260 }}>
                <Sidebar
                  collapsed={collapsed}
                  items={[
                    {
                      key: "workspace",
                      label: <span>工作区 <Tag tone="info">团队</Tag></span>,
                      ariaLabel: "工作区",
                      icon: <Icon name="folder" size={14} />,
                      children: [
                        { key: "design", label: "设计系统", icon: <Icon name="palette" size={14} /> },
                        { key: "client", label: "客户项目", icon: <Icon name="user" size={14} /> },
                      ],
                    },
                    { key: "settings", label: "设置", icon: <Icon name="settings" size={14} /> },
                  ]}
                  activeKey={active}
                  onSelect={setActive}
                  expandedKeys={expandedKeys}
                  onExpandedKeysChange={setExpandedKeys}
                  footer={!collapsed && <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>Lumina Workspace</span>}
                />
                <Card style={{ flex: 1, minWidth: 0 }} title="交互结果" description={`已选择 ${active}`}>
                  多级导航项会保持清晰的缩进层级；复杂 ReactNode 标签可通过 ariaLabel 在折叠后保留名称与 title 提示。
                </Card>
              </div>
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
            { prop: "expandedKeys / defaultExpandedKeys", description: "受控/初始展开的分组键；省略初始值时默认全部展开", type: "string[]" },
            { prop: "onExpandedKeysChange", description: "点击含 children 的分组后返回新的展开键", type: "(keys: string[]) => void" },
            { prop: "collapsed", description: "折叠为图标", type: "boolean", default: "false" },
            { prop: "header / footer", description: "头/尾内容", type: "ReactNode" },
            { prop: "navigationLabel", description: "导航区域可访问名称", type: "string", default: `"主导航"` },
          ],
        },
        {
          title: "SidebarItem",
          rows: [
            { prop: "key", description: "唯一键", type: "string", required: true },
            { prop: "label", description: "文案", type: "ReactNode" },
            { prop: "ariaLabel", description: "复杂标签在折叠状态下使用的可访问名称与 title", type: "string" },
            { prop: "icon", description: "前置图标", type: "ReactNode" },
            { prop: "badge", description: "尾部徽标", type: "ReactNode" },
            { prop: "children", description: "递归子导航项", type: "SidebarItem[]" },
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
