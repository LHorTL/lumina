import * as React from "react";
import { AppShell, Card, Icon, Sidebar, StatusBar, TitleBar } from "lumina";
import { DocPage } from "../docs";
import { defineSection, type SectionCtx } from "./_types";

const SectionAppShell: React.FC<SectionCtx> = () => {
  const [active, setActive] = React.useState("inbox");

  return (
    <DocPage
      whenToUse={
        <>
          <p>把 Electron 应用常见的标题栏、侧边导航、内容区、状态栏组合成一个稳定外壳。</p>
          <ul className="doc-usecase-list">
            <li>需要快速搭建桌面应用骨架,不想自己写多层布局胶水代码</li>
            <li>希望 TitleBar / Sidebar / StatusBar 在视觉上保持一套拟态层级</li>
            <li>适合邮件、IDE、知识库、设置中心这类双栏或三栏桌面应用</li>
          </ul>
        </>
      }
      demos={[
        {
          id: "workspace-shell",
          title: "完整工作台外壳",
          span: 2,
          code: `<AppShell
  titleBar={<TitleBar title="Lumina Mail" platform="mac" />}
  sidebar={<Sidebar items={items} activeKey={active} onSelect={setActive} />}
>
  <main>...</main>
</AppShell>`,
          render: () => (
            <div style={{ borderRadius: "var(--r-xl)", overflow: "hidden", boxShadow: "var(--neu-shadow-lift)" }}>
              <AppShell
                titleBar={
                  <TitleBar
                    platform="mac"
                    title="Lumina Mail"
                    center={<span style={{ color: "var(--fg-subtle)", fontSize: 12 }}>Workspace · 桌面外壳</span>}
                  />
                }
                sidebar={
                  <Sidebar
                    items={[
                      { key: "inbox", label: "收件箱", icon: <Icon name="mail" size={14} />, badge: 12 },
                      { key: "drafts", label: "草稿", icon: <Icon name="file" size={14} /> },
                      { key: "projects", label: "项目", icon: <Icon name="folder" size={14} /> },
                      { key: "archive", label: "归档", icon: <Icon name="layers" size={14} /> },
                    ]}
                    activeKey={active}
                    onSelect={setActive}
                    header={<div style={{ fontWeight: 600, padding: "4px 8px" }}>团队空间</div>}
                    footer={<div style={{ color: "var(--fg-subtle)", fontSize: 12 }}>当前视图: {active}</div>}
                  />
                }
              >
                <div style={{ display: "grid", gap: 16, padding: 20, minHeight: 280, background: "var(--bg-sunken)" }}>
                  <Card>
                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>主内容区</div>
                    <div style={{ color: "var(--fg-muted)", lineHeight: 1.7 }}>
                      AppShell 只负责外壳编排:title bar 在顶部,sidebar 在左侧,内容区自动填满剩余空间。
                    </div>
                  </Card>
                  <Card variant="sunken">
                    <div style={{ color: "var(--fg-muted)", fontSize: 13 }}>
                      当前模块 <strong style={{ color: "var(--fg)" }}>{active}</strong> 可以替换成路由页面、编辑器、表格或设置表单。
                    </div>
                  </Card>
                </div>
                <StatusBar
                  left={<StatusBar.Item icon={<Icon name="check" size={12} />} tone="success">Ready</StatusBar.Item>}
                  right={<StatusBar.Item tone="muted">macOS · React 18</StatusBar.Item>}
                />
              </AppShell>
            </div>
          ),
        },
      ]}
      api={[
        {
          title: "AppShell",
          rows: [
            { prop: "titleBar", description: "顶部标题栏区域", type: "ReactNode" },
            { prop: "sidebar", description: "左侧导航区域", type: "ReactNode" },
            { prop: "children", description: "主内容区", type: "ReactNode" },
          ],
        },
      ]}
    />
  );
};

export default defineSection({
  id: "appshell",
  group: "Electron",
  order: 50,
  label: "AppShell 外壳",
  eyebrow: "ELECTRON",
  title: "AppShell 应用外壳",
  desc: "组合 TitleBar、Sidebar 与主内容区的 Electron 桌面布局容器。",
  Component: SectionAppShell,
});
