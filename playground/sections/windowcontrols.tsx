import * as React from "react";
import { Tag, WindowControls } from "lumina";
import { DocPage } from "../docs";
import { Row } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

/** 演示窗口按钮回调和最大化/还原图标切换。 */
const InteractiveWindowControlsDemo: React.FC = () => {
  const [maximized, setMaximized] = React.useState(false);
  const [lastAction, setLastAction] = React.useState("等待操作");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Row gap={40}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="showcase-label">macOS</div>
          <WindowControls
            platform="mac"
            maximized={maximized}
            onClose={() => setLastAction("macOS · 关闭")}
            onMinimize={() => setLastAction("macOS · 最小化")}
            onMaximize={() => {
              setMaximized((value) => !value);
              setLastAction(maximized ? "macOS · 还原" : "macOS · 最大化");
            }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="showcase-label">Windows</div>
          <WindowControls
            platform="windows"
            maximized={maximized}
            onClose={() => setLastAction("Windows · 关闭")}
            onMinimize={() => setLastAction("Windows · 最小化")}
            onMaximize={() => {
              setMaximized((value) => !value);
              setLastAction(maximized ? "Windows · 还原" : "Windows · 最大化");
            }}
          />
        </div>
      </Row>
      <Tag tone="info">{lastAction} · {maximized ? "已最大化" : "普通窗口"}</Tag>
    </div>
  );
};

const SectionWindowControls: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={<p>独立的窗口控件按钮组,可在自定义标题栏中复用。</p>}
    demos={[
      {
        id: "basic",
        title: "平台与回调",
        description: "点击窗口按钮可观察回调；最大化按钮会在最大化与还原图标间切换。",
        code: `<WindowControls
  platform="windows"
  maximized={maximized}
  onMinimize={handleMinimize}
  onMaximize={handleMaximize}
  onClose={handleClose}
/>`,
        render: () => <InteractiveWindowControlsDemo />,
      },
    ]}
    api={[
      {
        title: "WindowControls",
        rows: [
          { prop: "platform", description: "平台", type: `"mac" | "windows"`, default: `"mac"` },
          { prop: "onMinimize / onMaximize / onClose", description: "回调", type: "() => void" },
          { prop: "maximized", description: "显示还原状态", type: "boolean", default: "false" },
        ],
      },
    ]}
  />
);

export default defineSection({
  id: "windowcontrols",
  group: "Electron",
  order: 20,
  label: "WindowControls",
  eyebrow: "ELECTRON",
  title: "WindowControls 窗口控件",
  desc: "独立的窗口控件按钮组。",
  Component: SectionWindowControls,
});
