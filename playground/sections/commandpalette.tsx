import * as React from "react";
import { Button, CommandPalette, Icon, message } from "lumina";
import { DocPage } from "../docs";
import { defineSection, type SectionCtx } from "./_types";

const SectionCommandPalette: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={
      <>
        <p>⌘K 命令面板,全局快速启动入口。按 Linear / Figma / VSCode 风格组织分组与快捷键。</p>
        <ul className="doc-usecase-list">
          <li>应用动作快速检索与执行</li>
          <li>页面跳转、主题切换、设置项入口</li>
          <li>配合 Cmd/Ctrl + K 快捷键打开</li>
        </ul>
      </>
    }
    demos={[
      {
        id: "basic",
        title: "基础 + 快捷键",
        span: 2,
        description: "在当前页面按 ⌘K / Ctrl+K 打开。分组、快捷键提示、键盘导航都已内置。",
        code: `const [open, setOpen] = useState(false);
useEffect(() => {
  const h = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setOpen(o => !o);
    }
  };
  window.addEventListener("keydown", h);
  return () => window.removeEventListener("keydown", h);
}, []);

<CommandPalette open={open} onOpenChange={setOpen} items={[...]} />`,
        render: () => {
          const Live = () => {
            const [open, setOpen] = React.useState(false);
            React.useEffect(() => {
              const h = (e: KeyboardEvent) => {
                if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                  e.preventDefault();
                  setOpen((o) => !o);
                }
              };
              window.addEventListener("keydown", h);
              return () => window.removeEventListener("keydown", h);
            }, []);

            return (
              <>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 14,
                    height: 200,
                    borderRadius: "var(--r-lg)",
                    background: "var(--bg-sunken)",
                    boxShadow: "var(--neu-in-sm)",
                    padding: 20,
                  }}
                >
                  <div style={{ color: "var(--fg-muted)", fontSize: 13 }}>
                    按 <kbd style={kbd}>⌘</kbd> <kbd style={kbd}>K</kbd> 或点击下方按钮
                  </div>
                  <Button variant="primary" onClick={() => setOpen(true)}>
                    打开命令面板
                  </Button>
                </div>
                <CommandPalette
                  open={open}
                  onOpenChange={setOpen}
                  items={[
                    { key: "nav-home",    group: "导航", label: "回到首页",       icon: <Icon name="home" size={14} />,     shortcut: "⌘H", onSelect: () => message.info("回到首页") },
                    { key: "nav-inbox",   group: "导航", label: "收件箱",         icon: <Icon name="mail" size={14} />,     shortcut: "⌘1", keywords: ["inbox", "邮件"], onSelect: () => message.info("收件箱") },
                    { key: "nav-search",  group: "导航", label: "全局搜索",       icon: <Icon name="search" size={14} />,   shortcut: "⌘P",  onSelect: () => message.info("搜索") },

                    { key: "file-new",    group: "文件", label: "新建文件",       icon: <Icon name="plus" size={14} />,     shortcut: "⌘N",  onSelect: () => message.success("已创建") },
                    { key: "file-open",   group: "文件", label: "打开最近",       description: "README.md · 2 小时前", icon: <Icon name="folder" size={14} />, shortcut: "⌘O" },
                    { key: "file-save",   group: "文件", label: "保存",           icon: <Icon name="download" size={14} />, shortcut: "⌘S" },

                    { key: "theme-light", group: "主题", label: "切换到浅色",     icon: <Icon name="sun" size={14} />,      keywords: ["light", "日"] },
                    { key: "theme-dark",  group: "主题", label: "切换到深色",     icon: <Icon name="moon" size={14} />,     keywords: ["dark", "夜"] },

                    { key: "settings",    group: "其它", label: "偏好设置",       icon: <Icon name="settings" size={14} />, shortcut: "⌘,", onSelect: () => message.info("设置") },
                    { key: "shortcuts",   group: "其它", label: "键盘快捷键",     icon: <Icon name="sparkle" size={14} />,  disabled: true },
                  ]}
                />
              </>
            );
          };
          return <Live />;
        },
      },
    ]}
    api={[
      {
        title: "CommandPalette",
        rows: [
          { prop: "open / onOpenChange", description: "受控开关", type: "boolean / (open: boolean) => void", required: true },
          { prop: "items", description: "所有命令项", type: "CommandItem[]", required: true },
          { prop: "placeholder", description: "搜索框占位文本", type: "string", default: `"搜索命令…"` },
          { prop: "filter", description: "自定义过滤函数", type: "(item, query) => boolean", default: "子序列匹配" },
          { prop: "emptyText", description: "无结果占位", type: "ReactNode" },
          { prop: "resetOnOpen", description: "打开时清空输入", type: "boolean", default: "true" },
          { prop: "footer", description: "底部区;null 隐藏", type: "ReactNode" },
        ],
      },
      {
        title: "CommandItem",
        rows: [
          { prop: "key", description: "唯一键", type: "string", required: true },
          { prop: "label", description: "主文案(也参与搜索)", type: "string", required: true },
          { prop: "description", description: "副标题", type: "ReactNode" },
          { prop: "icon", description: "前置图标", type: "ReactNode" },
          { prop: "shortcut", description: "右侧快捷键", type: "ReactNode" },
          { prop: "keywords", description: "额外搜索关键词", type: "string[]" },
          { prop: "group", description: "分组标题", type: "string" },
          { prop: "disabled", description: "禁用", type: "boolean" },
          { prop: "onSelect", description: "选中回调(会自动关闭面板)", type: "() => void" },
        ],
      },
    ]}
  />
);

const kbd: React.CSSProperties = {
  display: "inline-grid",
  placeItems: "center",
  minWidth: 18,
  height: 20,
  padding: "0 5px",
  borderRadius: 5,
  background: "var(--bg)",
  boxShadow: "var(--neu-flat)",
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  color: "var(--fg-muted)",
};

export default defineSection({
  id: "commandpalette",
  group: "Electron",
  order: 70,
  label: "CommandPalette 命令面板",
  eyebrow: "ELECTRON",
  title: "CommandPalette ⌘K 命令面板",
  desc: "全局命令搜索与执行入口。",
  Component: SectionCommandPalette,
});
