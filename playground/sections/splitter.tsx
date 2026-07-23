import * as React from "react";
import { Splitter } from "lumina";
import { DocPage } from "../docs";
import { defineSection, type SectionCtx } from "./_types";

const Panel: React.FC<{ bg?: string; children: React.ReactNode }> = ({ bg = "var(--bg)", children }) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      background: bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--fg-muted)",
      fontSize: 13,
      padding: 16,
      boxSizing: "border-box",
    }}
  >
    {children}
  </div>
);

const SectionSplitter: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={
      <>
        <p>两栏之间可拖拽的分隔条,支持键盘方向键调整。</p>
        <ul className="doc-usecase-list">
          <li>编辑器 / IDE 的侧边栏 + 内容区</li>
          <li>聊天类应用的会话列表 + 消息区</li>
          <li>纵向分屏:预览区 + 代码区</li>
        </ul>
      </>
    }
    demos={[
      {
        id: "horizontal",
        title: "水平分栏",
        span: 2,
        code: `<Splitter
  defaultSize={200}
  min={120}
  max={360}
  firstPaneClassName="workspace-sidebar-pane"
  firstPaneStyle={{ overflow: "hidden" }}
  secondPaneClassName="workspace-main-pane"
  handle={<span aria-hidden>⋮</span>}
>
  <SidePanel />
  <MainPanel />
</Splitter>`,
        render: () => (
          <div
            style={{
              height: 240,
              borderRadius: "var(--r-lg)",
              overflow: "hidden",
              boxShadow: "var(--neu-shadow-panel)",
            }}
          >
            <Splitter
              defaultSize={200}
              min={120}
              max={360}
              firstPaneClassName="workspace-sidebar-pane"
              firstPaneStyle={{ overflow: "hidden" }}
              secondPaneClassName="workspace-main-pane"
              secondPaneStyle={{ overflow: "auto" }}
              handle={
                <span
                  aria-hidden
                  style={{
                    color: "var(--accent-ink)",
                    fontSize: 15,
                    lineHeight: 1,
                    transform: "translateY(-1px)",
                  }}
                >
                  ⋮
                </span>
              }
            >
              <Panel bg="var(--bg-sunken)">左侧 · 可拖拽 120–360px</Panel>
              <Panel>右侧内容区 · 自适应剩余空间</Panel>
            </Splitter>
          </div>
        ),
      },
      {
        id: "vertical",
        title: "垂直分栏",
        span: 2,
        description: "direction=\"vertical\" 让面板上下排列,分隔条变成横条。",
        code: `<Splitter direction="vertical" defaultSize={120} min={60}>...</Splitter>`,
        render: () => (
          <div
            style={{
              height: 280,
              borderRadius: "var(--r-lg)",
              overflow: "hidden",
              boxShadow: "var(--neu-shadow-panel)",
            }}
          >
            <Splitter direction="vertical" defaultSize={120} min={60} max={220}>
              <Panel bg="var(--bg-sunken)">上方 · 预览</Panel>
              <Panel>下方 · 代码 / 控制台</Panel>
            </Splitter>
          </div>
        ),
      },
      {
        id: "nested",
        title: "嵌套分栏",
        span: 2,
        description: "组合使用两个 Splitter 可以搭出 IDE 风格的三区布局。",
        code: `<Splitter defaultSize={180}>
  <SideNav />
  <Splitter direction="vertical" defaultSize={180}>
    <Editor />
    <Terminal />
  </Splitter>
</Splitter>`,
        render: () => (
          <div
            style={{
              height: 320,
              borderRadius: "var(--r-lg)",
              overflow: "hidden",
              boxShadow: "var(--neu-shadow-panel)",
            }}
          >
            <Splitter defaultSize={180} min={120} max={280}>
              <Panel bg="var(--bg-sunken)">活动栏</Panel>
              <Splitter direction="vertical" defaultSize={200} min={80}>
                <Panel>编辑器</Panel>
                <Panel bg="var(--bg-sunken)">终端 / 输出</Panel>
              </Splitter>
            </Splitter>
          </div>
        ),
      },
      {
        id: "controlled",
        title: "受控模式",
        span: 2,
        description: "通过 size / onResize 与外部状态联动；storageKey 可直接持久化最后一次完成的尺寸。",
        code: `const [w, setW] = useState(220);
<Splitter size={w} onResize={setW} storageKey="workspace-sidebar">...</Splitter>`,
        render: () => {
          const Live = () => {
            const [w, setW] = React.useState(220);
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>
                  当前宽度:<span style={{ fontFamily: "var(--font-mono)", color: "var(--accent-ink)" }}>{w}px</span>
                </div>
                <div
                  style={{
                    height: 220,
                    borderRadius: "var(--r-lg)",
                    overflow: "hidden",
                    boxShadow: "var(--neu-shadow-panel)",
                  }}
                >
                  <Splitter size={w} onResize={setW} min={100} max={400}>
                    <Panel bg="var(--bg-sunken)">拖动右侧分隔条</Panel>
                    <Panel>上方会实时显示宽度</Panel>
                  </Splitter>
                </div>
              </div>
            );
          };
          return <Live />;
        },
      },
    ]}
    api={[
      {
        title: "Splitter",
        rows: [
          { prop: "direction", description: "布局方向", type: `"horizontal" | "vertical"`, default: `"horizontal"` },
          { prop: "defaultSize", description: "非受控初始宽/高 (px)", type: "number", default: "240" },
          { prop: "size / onResize", description: "受控宽/高", type: "number / (n: number) => void" },
          { prop: "onResizeEnd", description: "拖动结束回调", type: "(n: number) => void" },
          { prop: "min / max", description: "尺寸限制 (px)", type: "number", default: "80 / Infinity" },
          { prop: "step", description: "方向键步长 (px)", type: "number", default: "16" },
          { prop: "secondMin", description: "第二面板保留的最小尺寸", type: "number", default: "24" },
          { prop: "storageKey", description: "持久化尺寸的本地存储键", type: "string" },
          { prop: "firstPaneClassName / firstPaneStyle", description: "第一个面板的 class 与内联样式", type: "string / CSSProperties" },
          { prop: "secondPaneClassName / secondPaneStyle", description: "第二个面板的 class 与内联样式", type: "string / CSSProperties" },
          { prop: "handle", description: "正式的分隔手柄内容槽；null 隐藏默认握柄", type: "ReactNode" },
          { prop: "handleProps", description: "分隔手柄原生属性与 aria-label", type: "HTMLAttributes<HTMLDivElement>" },
          { prop: "children", description: "必须恰好两个子节点", type: "[ReactNode, ReactNode]", required: true },
        ],
      },
    ]}
  />
);

export default defineSection({
  id: "splitter",
  group: "Electron",
  order: 50,
  label: "Splitter 分栏",
  eyebrow: "ELECTRON",
  title: "Splitter 可拖拽分栏",
  desc: "两栏之间可拖拽的分隔条,支持横向、纵向与嵌套。",
  Component: SectionSplitter,
});
