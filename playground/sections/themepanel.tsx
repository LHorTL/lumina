import * as React from "react";
import {
  Button,
  Card,
  Input,
  Surface,
  Tag,
  ThemePanel,
  ThemeProvider,
} from "lumina";
import { DocPage } from "../docs";
import { Row } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

const PreviewContent: React.FC = () => (
  <Surface padding="lg" radius="xl" bordered>
    <Card title="主题预览" description="与 ThemePanel 共享同一个 ThemeProvider">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Input leadingIcon="search" placeholder="搜索任务" />
        <Row gap={8}>
          <Button variant="primary" icon="sparkle">
            执行
          </Button>
          <Button variant="ghost">取消</Button>
          <Tag tone="success" solid>
            Synced
          </Tag>
        </Row>
        <Surface tone="sunken" padding="md" radius="md">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <span style={{ color: "var(--fg-muted)" }}>当前批次</span>
            <strong style={{ color: "var(--accent-ink)" }}>#0428</strong>
          </div>
        </Surface>
      </div>
    </Card>
  </Surface>
);

const ThemePanelDemo: React.FC = () => (
  <ThemeProvider target="scope" as="div">
    <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 340px) minmax(0, 1fr)", gap: 18, alignItems: "start" }}>
      <ThemePanel />
      <PreviewContent />
    </div>
  </ThemeProvider>
);

const CompactPanelDemo: React.FC = () => (
  <ThemeProvider target="scope" accent="violet" as="div">
    <div style={{ display: "grid", gridTemplateColumns: "minmax(240px, 300px) minmax(0, 1fr)", gap: 18, alignItems: "start" }}>
      <ThemePanel
        compact
        title="微调"
        description={null}
        sections={["accent", "intensity", "radius"]}
        showReset={false}
      />
      <PreviewContent />
    </div>
  </ThemeProvider>
);

const SectionThemePanel: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={
      <>
        <p>
          ThemePanel 是可直接放进应用的主题快速控制面板。它读取最近的 ThemeProvider,
          并通过 useTheme 修改 mode、命名主题、强调色、阴影、圆角、字体和密度,也可以把当前草稿保存成新的命名主题。
        </p>
        <ul className="doc-usecase-list">
          <li>开发期/内部工具想快速调试主题</li>
          <li>桌面应用想把主题设置作为偏好面板的一部分</li>
          <li>需要让用户基于当前外观快速保存自己的主题预设</li>
          <li>需要给某个局部 ThemeProvider 提供即时可视化调节</li>
        </ul>
      </>
    }
    demos={[
      {
        id: "basic",
        title: "完整面板",
        description: "默认包含浅色、深色、瓷白、助手四个主题卡片,并提供新建主题入口;其余控制项直接驱动 useTheme。",
        span: 2,
        code: `<ThemeProvider>
  <ThemePanel />
</ThemeProvider>`,
        render: () => <ThemePanelDemo />,
      },
      {
        id: "compact",
        title: "精简面板",
        description: "用 sections 控制展示哪些调节项,适合放进抽屉、设置页侧栏或开发调试区。",
        span: 2,
        code: `<ThemePanel
  compact
  title="微调"
  description={null}
  sections={["accent", "intensity", "radius"]}
  showReset={false}
/>`,
        render: () => <CompactPanelDemo />,
      },
    ]}
    api={[
      {
        title: "ThemePanel",
        rows: [
          { prop: "title", description: "面板标题;传 null 可隐藏标题文本", type: "ReactNode", default: `"主题"` },
          { prop: "description", description: "面板副标题", type: "ReactNode", default: `"快速调整当前 Lumina 主题"` },
          { prop: "sections", description: "展示的控制区及顺序", type: "ThemePanelSection[]" },
          { prop: "modeOptions", description: "模式切换项", type: "ThemePanelModeOption[]" },
          { prop: "presetOptions", description: "命名主题预设卡片;不传时使用浅色/深色/瓷白/助手 + theme.themes", type: "ThemePanelPresetOption[]" },
          { prop: "defaultCustomAccent", description: "自定义强调色初始值", type: "string", default: `"#845ef7"` },
          { prop: "allowCreateTheme", description: "在预设区显示新建主题流程", type: "boolean", default: "true" },
          { prop: "defaultCreateThemeName", description: "新建主题的默认名称", type: "string", default: `"我的主题"` },
          { prop: "createThemeKeyPrefix", description: "生成自建主题 mode key 时使用的前缀", type: "string", default: `"user"` },
          { prop: "onCreateTheme", description: "保存自建主题后的回调,可用于业务侧持久化 label / preset", type: "(payload: ThemePanelCreateThemePayload) => void" },
          { prop: "showReset", description: "显示重置按钮", type: "boolean", default: "true" },
          { prop: "compact", description: "紧凑布局", type: "boolean", default: "false" },
        ],
      },
      {
        title: "默认预设常量",
        rows: [
          { prop: "THEME_PANEL_DEFAULT_PRESET_OPTIONS", description: "ThemePanel 默认卡片列表: 浅色、深色、瓷白、助手", type: "ThemePanelPresetOption[]" },
          { prop: "THEME_PANEL_DEFAULT_THEME_PRESETS", description: "默认卡片背后的 ThemePreset 配置", type: "Record<string, ThemePreset>" },
        ],
      },
      {
        title: "ThemePanelPresetOption",
        rows: [
          { prop: "key", description: "主题 mode key;若存在于 theme.themes 会应用对应 preset", type: "ThemeMode", required: true },
          { prop: "label", description: "卡片标题", type: "ReactNode", required: true },
          { prop: "description", description: "卡片说明", type: "ReactNode" },
          { prop: "preset", description: "可选 preset;点击时会注册并应用", type: "ThemePreset" },
        ],
      },
      {
        title: "ThemePanelCreateThemePayload",
        rows: [
          { prop: "key", description: "保存后注册到 ThemeProvider 的 mode key", type: "ThemeMode" },
          { prop: "label", description: "用户输入的主题名称", type: "string" },
          { prop: "description", description: "ThemePanel 生成的说明文案,如自建亮/自建暗", type: "string" },
          { prop: "preset", description: "最终保存到 theme.themes 的主题配置", type: "ThemePreset" },
        ],
      },
    ]}
  />
);

export default defineSection({
  id: "themepanel",
  group: "起步",
  order: 40,
  label: "ThemePanel 主题面板",
  eyebrow: "FOUNDATION",
  title: "ThemePanel 主题面板",
  desc: "可复用的主题快速调节面板,直接驱动最近的 ThemeProvider。",
  Component: SectionThemePanel,
});
