import * as React from "react";
import { ContextMenu, Icon, message } from "lumina";
import { DocPage } from "../docs";
import { defineSection, type SectionCtx } from "./_types";

const Dropzone: React.FC<{ children?: React.ReactNode; hint?: React.ReactNode }> = ({
  children,
  hint,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      height: 160,
      borderRadius: "var(--r-lg)",
      background: "var(--bg-sunken)",
      color: "var(--fg-muted)",
      fontSize: 13,
      userSelect: "none",
      boxShadow: "var(--neu-in-sm)",
      padding: 16,
      textAlign: "center",
    }}
  >
    {children ?? (
      <>
        <div>{hint ?? "在此区域调出上下文菜单"}</div>
        <div style={{ fontSize: 11.5, color: "var(--fg-subtle)" }}>
          Mac: <kbd style={kbdStyle}>Control</kbd> + 单击 或 双指点按触控板 · Windows / Linux: 右键
        </div>
      </>
    )}
  </div>
);

const kbdStyle: React.CSSProperties = {
  display: "inline-grid",
  placeItems: "center",
  minWidth: 18,
  height: 18,
  padding: "0 5px",
  borderRadius: 5,
  background: "var(--bg)",
  boxShadow: "var(--neu-flat)",
  fontFamily: "var(--font-mono)",
  fontSize: 10.5,
  color: "var(--fg-muted)",
};

const SectionContextMenu: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={
      <>
        <p>在鼠标光标处弹出的菜单,屏蔽浏览器原生右键菜单,更贴近桌面应用体验。</p>
        <ul className="doc-usecase-list">
          <li>文件 / 列表项的"复制、剪切、删除"等操作</li>
          <li>画布 / 编辑器区域的上下文操作</li>
          <li>与快捷键展示呼应(⌘C / ⌘V)</li>
        </ul>
      </>
    }
    demos={[
      {
        id: "basic",
        title: "基础",
        span: 2,
        code: `<ContextMenu items={[
  { key: "copy", label: "复制", shortcut: "⌘C", onSelect: () => {} },
  { key: "cut",  label: "剪切", shortcut: "⌘X", onSelect: () => {} },
  { key: "d",    type: "divider" },
  { key: "del",  label: "删除", danger: true, onSelect: () => {} },
]}>
  <div>右键点击我</div>
</ContextMenu>`,
        render: () => (
          <ContextMenu
            items={[
              { key: "copy", label: "复制", icon: <Icon name="copy" size={14} />, shortcut: "⌘C", onSelect: () => message.success("已复制") },
              { key: "cut",  label: "剪切", icon: <Icon name="x" size={14} />,   shortcut: "⌘X", onSelect: () => message.success("已剪切") },
              { key: "paste", label: "粘贴", icon: <Icon name="plus" size={14} />, shortcut: "⌘V", disabled: true },
              { key: "d1",   type: "divider" },
              { key: "del",  label: "删除", icon: <Icon name="trash" size={14} />, danger: true, onSelect: () => message.error("已删除") },
            ]}
          >
            <Dropzone />
          </ContextMenu>
        ),
      },
      {
        id: "file-like",
        title: "文件管理器示例",
        span: 2,
        description: "典型的文件右键菜单,带图标、快捷键、分组分隔、危险操作高亮。",
        code: `<ContextMenu items={[...]}>...`,
        render: () => (
          <ContextMenu
            items={[
              { key: "open",    label: "打开", icon: <Icon name="folder" size={14} />, shortcut: "⏎", onSelect: () => message.info("打开") },
              { key: "open-in", label: "在新窗口打开", icon: <Icon name="eye" size={14} />, shortcut: "⌘⇧O" },
              { key: "d1",      type: "divider" },
              { key: "rename",  label: "重命名", icon: <Icon name="edit" size={14} />, shortcut: "⏎" },
              { key: "dup",     label: "制作副本", icon: <Icon name="copy" size={14} />, shortcut: "⌘D" },
              { key: "d2",      type: "divider" },
              { key: "info",    label: "显示简介", icon: <Icon name="info" size={14} />, shortcut: "⌘I" },
              { key: "d3",      type: "divider" },
              { key: "trash",   label: "移到废纸篓", icon: <Icon name="trash" size={14} />, shortcut: "⌘⌫", danger: true, onSelect: () => message.error("已丢到废纸篓") },
            ]}
          >
            <Dropzone>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <Icon name="file" size={36} />
                <div>README.md</div>
                <div style={{ fontSize: 11.5, color: "var(--fg-subtle)" }}>
                  Mac: <kbd style={kbdStyle}>Control</kbd> + 单击 · Windows / Linux: 右键
                </div>
              </div>
            </Dropzone>
          </ContextMenu>
        ),
      },
    ]}
    api={[
      {
        title: "ContextMenu",
        rows: [
          { prop: "items", description: "菜单项", type: "ContextMenuItem[]", required: true },
          { prop: "children", description: "触发元素(恰好一个)", type: "ReactElement", required: true },
          { prop: "disabled", description: "禁用,恢复浏览器原生菜单", type: "boolean" },
          { prop: "minWidth", description: "面板最小宽度", type: "number", default: "180" },
        ],
      },
      {
        title: "ContextMenuItem",
        rows: [
          { prop: "key", description: "唯一键", type: "string", required: true },
          { prop: "label", description: "文案", type: "ReactNode" },
          { prop: "icon", description: "前置图标", type: "ReactNode" },
          { prop: "shortcut", description: "右侧快捷键提示", type: "ReactNode" },
          { prop: "disabled", description: "禁用", type: "boolean" },
          { prop: "danger", description: "危险态(红色)", type: "boolean" },
          { prop: "type", description: "置为 \"divider\" 渲染分隔线", type: `"divider"` },
          { prop: "onSelect", description: "选中回调", type: "() => void" },
        ],
      },
    ]}
  />
);

export default defineSection({
  id: "contextmenu",
  group: "Electron",
  order: 60,
  label: "ContextMenu 右键菜单",
  eyebrow: "ELECTRON",
  title: "ContextMenu 右键菜单",
  desc: "桌面应用风格的右键上下文菜单。",
  Component: SectionContextMenu,
});
