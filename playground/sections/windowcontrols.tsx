import * as React from "react";
import { WindowControls } from "lumina";
import { DocPage } from "../docs";
import { Row } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

const SectionWindowControls: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={<p>独立的窗口控件按钮组,可在自定义标题栏中复用。</p>}
    demos={[
      {
        id: "basic",
        title: "两种平台",
        code: `<WindowControls platform="mac" />
<WindowControls platform="windows" />`,
        render: () => (
          <Row gap={40}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div className="showcase-label">macOS</div>
              <WindowControls platform="mac" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div className="showcase-label">Windows</div>
              <WindowControls platform="windows" />
            </div>
          </Row>
        ),
      },
    ]}
    api={[
      {
        title: "WindowControls",
        rows: [
          { prop: "platform", description: "平台", type: `"mac" | "windows"`, default: `"mac"` },
          { prop: "onMinimize / onMaximize / onClose", description: "回调", type: "() => void" },
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
