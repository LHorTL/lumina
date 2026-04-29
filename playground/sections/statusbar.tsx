import * as React from "react";
import { Icon, StatusBar } from "lumina";
import { DocPage } from "../docs";
import { defineSection, type SectionCtx } from "./_types";

const SectionStatusBar: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={
      <>
        <p>窗口底部细条,展示分支、行列、同步状态、字符编码等应用元信息。</p>
        <ul className="doc-usecase-list">
          <li>编辑器 / IDE 风格应用的底栏</li>
          <li>与 TitleBar 上下呼应,包夹主内容区</li>
          <li>三个槽位(left / center / right)配合自动布局</li>
        </ul>
      </>
    }
    demos={[
      {
        id: "basic",
        title: "基础",
        span: 2,
        code: `<StatusBar
  left={<StatusBar.Item icon={<Icon name="check" size={12} />} tone="success">Ready</StatusBar.Item>}
  right={<StatusBar.Item tone="muted">UTF-8</StatusBar.Item>}
/>`,
        render: () => (
          <div style={{ borderRadius: "var(--r-lg)", overflow: "hidden", boxShadow: "var(--neu-shadow-panel)" }}>
            <div style={{ padding: 24, background: "var(--bg-sunken)", color: "var(--fg-muted)", fontSize: 13, minHeight: 80 }}>
              应用内容区
            </div>
            <StatusBar
              left={
                <>
                  <StatusBar.Item icon={<Icon name="check" size={12} />} tone="success">
                    已同步
                  </StatusBar.Item>
                  <StatusBar.Item tone="muted">main</StatusBar.Item>
                </>
              }
              right={
                <>
                  <StatusBar.Item tone="muted">第 128 行,第 24 列</StatusBar.Item>
                  <StatusBar.Item tone="muted">UTF-8</StatusBar.Item>
                  <StatusBar.Item tone="muted">LF</StatusBar.Item>
                </>
              }
            />
          </div>
        ),
      },
      {
        id: "interactive",
        title: "可点击项",
        span: 2,
        description: "为 Item 提供 onClick 会渲染成按钮,支持悬停高亮。",
        code: `<StatusBar.Item onClick={...}>TypeScript</StatusBar.Item>`,
        render: () => {
          const Live = () => {
            const [branch, setBranch] = React.useState("main");
            return (
              <div style={{ borderRadius: "var(--r-lg)", overflow: "hidden", boxShadow: "var(--neu-shadow-panel)" }}>
                <div style={{ padding: 24, background: "var(--bg-sunken)", color: "var(--fg-muted)", fontSize: 13, minHeight: 80 }}>
                  点击底部任意项试试
                </div>
                <StatusBar
                  left={
                    <StatusBar.Item
                      icon={<Icon name="folder" size={12} />}
                      onClick={() => setBranch((b) => (b === "main" ? "feat/palette" : "main"))}
                    >
                      {branch}
                    </StatusBar.Item>
                  }
                  center={<StatusBar.Item tone="accent">Lumina Playground</StatusBar.Item>}
                  right={
                    <>
                      <StatusBar.Item tone="warning" icon={<Icon name="alert" size={12} />}>
                        3
                      </StatusBar.Item>
                      <StatusBar.Item onClick={() => alert("打开设置")} icon={<Icon name="settings" size={12} />}>
                        设置
                      </StatusBar.Item>
                    </>
                  }
                />
              </div>
            );
          };
          return <Live />;
        },
      },
      {
        id: "tones",
        title: "语义色",
        span: 2,
        description: "tone 控制文字颜色:default / muted / accent / success / warning / danger。",
        code: `<StatusBar.Item tone="danger">3 errors</StatusBar.Item>`,
        render: () => (
          <div style={{ borderRadius: "var(--r-lg)", overflow: "hidden", boxShadow: "var(--neu-shadow-panel)" }}>
            <StatusBar
              left={
                <>
                  <StatusBar.Item>default</StatusBar.Item>
                  <StatusBar.Item tone="muted">muted</StatusBar.Item>
                  <StatusBar.Item tone="accent">accent</StatusBar.Item>
                </>
              }
              right={
                <>
                  <StatusBar.Item tone="success" icon={<Icon name="check" size={12} />}>
                    success
                  </StatusBar.Item>
                  <StatusBar.Item tone="warning" icon={<Icon name="alert" size={12} />}>
                    warning
                  </StatusBar.Item>
                  <StatusBar.Item tone="danger" icon={<Icon name="x" size={12} />}>
                    danger
                  </StatusBar.Item>
                </>
              }
            />
          </div>
        ),
      },
    ]}
    api={[
      {
        title: "StatusBar",
        rows: [
          { prop: "left", description: "左侧槽位", type: "ReactNode" },
          { prop: "center", description: "中部槽位(绝对居中)", type: "ReactNode" },
          { prop: "right", description: "右侧槽位", type: "ReactNode" },
        ],
      },
      {
        title: "StatusBar.Item",
        rows: [
          { prop: "icon", description: "前置图标", type: "ReactNode" },
          { prop: "tone", description: "语义色", type: `"default" | "muted" | "accent" | "success" | "warning" | "danger"`, default: `"default"` },
          { prop: "onClick", description: "点击回调(提供时渲染为 button)", type: "(e) => void" },
        ],
      },
    ]}
  />
);

export default defineSection({
  id: "statusbar",
  group: "Electron",
  order: 40,
  label: "StatusBar 状态栏",
  eyebrow: "ELECTRON",
  title: "StatusBar 状态栏",
  desc: "窗口底部状态栏,展示分支、编码、行列等应用元信息。",
  Component: SectionStatusBar,
});
