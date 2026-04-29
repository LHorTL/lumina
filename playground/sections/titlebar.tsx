import * as React from "react";
import { Button, TitleBar } from "lumina";
import { DocPage } from "../docs";
import { Row } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

const SectionTitleBar: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={
      <>
        <p>Electron 应用窗口顶部的标题栏,集成了应用品牌、拖拽区域、操作按钮、窗口控件。</p>
        <ul className="doc-usecase-list">
          <li>macOS 平台:窗口控件在左,应用菜单在右</li>
          <li>Windows 平台:控件在右,close 悬浮变红</li>
        </ul>
      </>
    }
    demos={[
      {
        id: "mac",
        title: "macOS 风格",
        span: 2,
        code: `<TitleBar platform="mac" title="无标题文档" actions={<>...</>} />`,
        render: () => (
          <div style={{ borderRadius: "var(--r-lg)", overflow: "hidden", boxShadow: "var(--neu-shadow-panel)" }}>
            <TitleBar
              title="无标题文档"
              platform="mac"
              actions={
                <Row gap={6}>
                  <Button icon="search" size="sm" tip="搜索" />
                  <Button icon="sparkle" size="sm" tip="AI 助手" />
                  <Button icon="settings" size="sm" tip="设置" />
                </Row>
              }
            />
            <div style={{ padding: 24, background: "var(--bg-sunken)" }}>
              <div style={{ color: "var(--fg-muted)", fontSize: 13 }}>
                ⌨️ 这里是应用内容区。
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "windows",
        title: "Windows 风格",
        span: 2,
        code: `<TitleBar platform="windows" title="..." actions={...} />`,
        render: () => (
          <div style={{ borderRadius: "var(--r-lg)", overflow: "hidden", boxShadow: "var(--neu-shadow-panel)" }}>
            <TitleBar
              title="无标题文档"
              platform="windows"
              actions={
                <Row gap={6}>
                  <Button icon="search" size="sm" tip="搜索" />
                  <Button icon="settings" size="sm" tip="设置" />
                </Row>
              }
            />
            <div style={{ padding: 24, background: "var(--bg-sunken)" }}>
              <div style={{ color: "var(--fg-muted)", fontSize: 13 }}>
                Windows 风格的标题栏将窗口控件放在右侧,采用矩形按钮且关闭键悬停时变红。
              </div>
            </div>
          </div>
        ),
      },
    ]}
    api={[
      {
        title: "TitleBar",
        rows: [
          { prop: "title", description: "标题", type: "ReactNode" },
          { prop: "platform", description: "平台风格", type: `"mac" | "windows"`, default: `"mac"` },
          { prop: "actions", description: "右侧操作区", type: "ReactNode" },
          { prop: "center", description: "中部内容", type: "ReactNode" },
          { prop: "draggable", description: "整条作为拖拽区", type: "boolean", default: "true" },
          { prop: "onMinimize / onMaximize / onClose", description: "窗口控件回调", type: "() => void" },
        ],
      },
    ]}
  />
);

export default defineSection({
  id: "titlebar",
  group: "Electron",
  order: 10,
  label: "TitleBar 标题栏",
  eyebrow: "ELECTRON",
  title: "TitleBar 标题栏",
  desc: "Electron 应用窗口顶部的跨平台标题栏。",
  Component: SectionTitleBar,
});
