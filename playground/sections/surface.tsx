import * as React from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Input,
  Surface,
  Tag,
  SURFACE_THEME_PRESETS,
  type SurfacePreset,
} from "lumina";
import { DocPage } from "../docs";
import { Row } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

const presetKeys = Object.keys(SURFACE_THEME_PRESETS) as Exclude<SurfacePreset, "inherit">[];

const ControlCluster: React.FC = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
    <Input leadingIcon="search" placeholder="搜索内容" />
    <Row gap={8}>
      <Button variant="primary" icon="sparkle">
        运行
      </Button>
      <Button variant="ghost">详情</Button>
      <Tag tone="success" solid>
        Ready
      </Tag>
    </Row>
  </div>
);

const PresetPreview: React.FC<{ preset: Exclude<SurfacePreset, "inherit"> }> = ({ preset }) => (
  <Surface preset={preset} padding="lg" radius="xl" variant="raised" bordered>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{preset}</div>
        <div style={{ marginTop: 4, fontSize: 12, color: "var(--fg-muted)" }}>局部 token 面板</div>
      </div>
      <Badge count={3}>
        <Avatar size="sm" alt={preset.slice(0, 1).toUpperCase()} />
      </Badge>
    </div>
    <div style={{ marginTop: 16 }}>
      <ControlCluster />
    </div>
  </Surface>
);

const SectionSurface: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={
      <>
        <p>
          Surface 用来给一整片 Lumina 内容提供合适的拟态承载背景。组件阴影依赖周围背景色,
          所以当一块内容需要独立浅色/深色/品牌色语境时,优先用 Surface 包住,不要只给外层 div 写背景色。
        </p>
        <ul className="doc-usecase-list">
          <li>页面主内容区、抽屉内复杂面板、设置页分区</li>
          <li>需要局部套一组主题 token,但又不想把全局 ThemeProvider 改掉</li>
          <li>展示特殊色调背景上的按钮、输入框、卡片和状态组件</li>
        </ul>
      </>
    }
    demos={[
      {
        id: "basic",
        title: "基础承载",
        description: "默认继承外部主题,只提供一片稳定的拟态背景。",
        span: 2,
        code: `<Surface padding="lg" radius="xl">
  <Card title="运行概览" description="Surface 负责外部背景,Card 负责信息分组">
    <Button variant="primary">开始</Button>
  </Card>
</Surface>`,
        render: () => (
          <Surface padding="lg" radius="xl" bordered>
            <Card
              title="运行概览"
              description="Surface 负责外部背景,Card 负责信息分组"
              actions={<Tag tone="info">Live</Tag>}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 18, alignItems: "center" }}>
                <ControlCluster />
                <Surface tone="sunken" padding="md" radius="md">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ color: "var(--fg-muted)" }}>今日任务</span>
                    <strong style={{ color: "var(--accent-ink)" }}>24</strong>
                  </div>
                </Surface>
              </div>
            </Card>
          </Surface>
        ),
      },
      {
        id: "presets",
        title: "内置背景预设",
        description: "preset 会建立一套局部 ThemeProvider,子组件和 useTheme 都处在这套背景 token 下。",
        span: 2,
        code: `<Surface preset="graphite" padding="lg" radius="xl">
  <Button variant="primary">深色面板</Button>
</Surface>

<Surface preset="porcelain" padding="lg" radius="xl">
  <Input placeholder="清亮浅色面板" />
</Surface>`,
        render: () => (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
            {presetKeys.map((preset) => (
              <PresetPreview key={preset} preset={preset} />
            ))}
          </div>
        ),
      },
      {
        id: "tones",
        title: "背景语义",
        description: "tone 只切换背景槽位;适合在同一主题里区分基底、凸起、凹陷和强调底。",
        span: 2,
        code: `<Surface tone="base">base</Surface>
<Surface tone="raised">raised</Surface>
<Surface tone="sunken">sunken</Surface>
<Surface tone="accent">accent</Surface>`,
        render: () => (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14 }}>
            {(["base", "raised", "sunken", "accent"] as const).map((tone) => (
              <Surface key={tone} tone={tone} variant={tone === "sunken" ? "sunken" : "raised"} padding="md" radius="lg">
                <div style={{ fontWeight: 700 }}>{tone}</div>
                <div style={{ marginTop: 6, fontSize: 12, color: "var(--fg-muted)" }}>background slot</div>
              </Surface>
            ))}
          </div>
        ),
      },
      {
        id: "custom-theme",
        title: "自定义局部主题",
        description: "可直接传 mode、accent、tokens 等主题参数。themeRadius 控制子树 token, radius 控制 Surface 自身圆角。",
        span: 2,
        code: `<Surface
  mode="dark"
  accent="mint"
  themeRadius={18}
  tokens={{
    bg: "#171d20",
    "bg-raised": "#20282c",
    "bg-sunken": "#101517",
  }}
>
  <Card>...</Card>
</Surface>`,
        render: () => (
          <Surface
            mode="dark"
            accent="mint"
            themeRadius={18}
            padding="lg"
            radius="xl"
            variant="floating"
            tokens={{
              bg: "#171d20",
              "bg-raised": "#20282c",
              "bg-sunken": "#101517",
              "shadow-dark": "rgba(0, 0, 0, 0.58)",
              "shadow-light": "rgba(135, 166, 160, 0.08)",
            }}
          >
            <Card title="局部暗色任务面板" description="不影响外层 playground 主题">
              <ControlCluster />
            </Card>
          </Surface>
        ),
      },
    ]}
    api={[
      {
        title: "Surface",
        rows: [
          { prop: "preset", description: "内置局部背景预设", type: `"inherit" | "mist" | "porcelain" | "graphite" | "ember"`, default: `"inherit"` },
          { prop: "tone", description: "可见背景槽位", type: `"base" | "raised" | "sunken" | "accent"`, default: `"base"` },
          { prop: "variant", description: "Surface 自身拟态层级", type: `"plain" | "raised" | "sunken" | "floating"`, default: `"plain"` },
          { prop: "padding", description: "内边距", type: `"none" | "sm" | "md" | "lg" | "xl"`, default: `"md"` },
          { prop: "radius", description: "Surface 自身圆角", type: `"none" | "sm" | "md" | "lg" | "xl"`, default: `"lg"` },
          { prop: "height", description: "高度语义", type: `"content" | "fill" | "screen"`, default: `"content"` },
          { prop: "bordered", description: "显示 token 描边", type: "boolean", default: "false" },
          { prop: "scrollable", description: "受限高度下允许内部滚动", type: "boolean", default: "false" },
          { prop: "mode / colorScheme / accent", description: "局部主题深浅色与强调色", type: "ThemeConfig fields" },
          { prop: "density / intensity / themeRadius / font", description: "局部密度、阴影、主题圆角和字体", type: "ThemeConfig fields" },
          { prop: "tokens", description: "局部 CSS token 覆写", type: "ThemeTokens" },
          { prop: "themes", description: "局部自定义模式注册表", type: "ThemePresets" },
        ],
      },
    ]}
  />
);

export default defineSection({
  id: "surface",
  group: "起步",
  order: 30,
  label: "Surface 背景面",
  eyebrow: "FOUNDATION",
  title: "Surface 背景面",
  desc: "主题感知的背景承载容器,用于给特殊色调内容提供正确的拟态 token 语境。",
  Component: SectionSurface,
});
