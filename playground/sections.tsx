import * as React from "react";
import { DocPage, type ApiRow, type DocDemoSpec } from "./docs";
import {
  Button,
  IconButton,
  Input,
  Textarea,
  Switch,
  Checkbox,
  RadioGroup,
  Slider,
  Select,
  Tabs,
  Segmented,
  Accordion,
  Card,
  Panel,
  Tag,
  Badge,
  Avatar,
  Divider,
  Progress,
  Ring,
  Modal,
  Drawer,
  Tooltip,
  Popover,
  Alert,
  Table,
  TablePro,
  Pagination,
  Calendar,
  List,
  Empty,
  Spinner,
  Skeleton,
  toast,
  Icon,
  TitleBar,
  Sidebar,
  Image,
  ImageGrid,
  Cascader,
  WindowControls,
  ThemeProvider,
  useTheme,
  ACCENT_PRESETS,
  type AccentKey,
} from "lumina";

/* ========================================================================
 * Section keys + nav
 * ====================================================================== */

export type SectionKey =
  | "intro"
  | "theme"
  // 通用
  | "button"
  | "icon"
  // 表单
  | "input"
  | "switch"
  | "checkbox"
  | "radio"
  | "slider"
  | "select"
  | "cascader"
  // 数据展示
  | "card"
  | "tag"
  | "badge"
  | "avatar"
  | "divider"
  | "progress"
  | "list"
  | "table"
  | "tablepro"
  | "image"
  | "calendar"
  | "tabs"
  | "accordion"
  // 反馈
  | "modal"
  | "drawer"
  | "toast"
  | "tooltip"
  | "popover"
  | "alert"
  | "empty"
  | "spinner"
  | "skeleton"
  // 平台
  | "titlebar"
  | "windowcontrols"
  | "sidebar";

export interface NavItem {
  id: SectionKey;
  label: string;
}
export interface NavGroup {
  group: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    group: "起步",
    items: [
      { id: "intro", label: "开始" },
      { id: "theme", label: "Theme 主题" },
    ],
  },
  {
    group: "通用",
    items: [
      { id: "button", label: "Button 按钮" },
      { id: "icon", label: "Icon 图标" },
    ],
  },
  {
    group: "表单",
    items: [
      { id: "input", label: "Input 输入框" },
      { id: "switch", label: "Switch 开关" },
      { id: "checkbox", label: "Checkbox 复选框" },
      { id: "radio", label: "Radio 单选" },
      { id: "slider", label: "Slider 滑块" },
      { id: "select", label: "Select 下拉" },
      { id: "cascader", label: "Cascader 级联" },
    ],
  },
  {
    group: "数据展示",
    items: [
      { id: "card", label: "Card 卡片" },
      { id: "tag", label: "Tag 标签" },
      { id: "badge", label: "Badge 徽标" },
      { id: "avatar", label: "Avatar 头像" },
      { id: "divider", label: "Divider 分隔" },
      { id: "progress", label: "Progress 进度" },
      { id: "list", label: "List 列表" },
      { id: "table", label: "Table 表格" },
      { id: "tablepro", label: "Table Pro" },
      { id: "image", label: "Image 图片" },
      { id: "calendar", label: "Calendar 日历" },
      { id: "tabs", label: "Tabs 选项卡" },
      { id: "accordion", label: "Accordion 折叠" },
    ],
  },
  {
    group: "反馈",
    items: [
      { id: "modal", label: "Modal 对话框" },
      { id: "drawer", label: "Drawer 抽屉" },
      { id: "toast", label: "Toast 通知" },
      { id: "tooltip", label: "Tooltip 文字提示" },
      { id: "popover", label: "Popover 气泡卡片" },
      { id: "alert", label: "Alert 警告" },
      { id: "empty", label: "Empty 空状态" },
      { id: "spinner", label: "Spinner 加载" },
      { id: "skeleton", label: "Skeleton 骨架屏" },
    ],
  },
  {
    group: "Electron",
    items: [
      { id: "titlebar", label: "TitleBar 标题栏" },
      { id: "windowcontrols", label: "WindowControls" },
      { id: "sidebar", label: "Sidebar 侧边栏" },
    ],
  },
];

export interface SectionMeta {
  title: string;
  eyebrow: string;
  desc: string;
  Component: React.FC<SectionCtx>;
}

export interface SectionCtx {
  go: (id: SectionKey) => void;
  setTweak: (k: string, v: unknown) => void;
  openTweaks: () => void;
  scrollRoot?: React.RefObject<HTMLElement | null>;
}

/* ========================================================================
 * Helpers
 * ====================================================================== */

const Field: React.FC<{
  label?: React.ReactNode;
  hint?: React.ReactNode;
  invalid?: boolean;
  children: React.ReactNode;
}> = ({ label, hint, invalid, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
    {label && (
      <label style={{ fontSize: 12, fontWeight: 500, color: "var(--fg-muted)", paddingLeft: 4 }}>
        {label}
      </label>
    )}
    {children}
    {hint && (
      <div
        style={{
          fontSize: 11,
          color: invalid ? "var(--danger)" : "var(--fg-subtle)",
          paddingLeft: 4,
        }}
      >
        {hint}
      </div>
    )}
  </div>
);

const Row: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 12 }) => (
  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap }}>{children}</div>
);

/* ========================================================================
 * Intro
 * ====================================================================== */

const SectionIntro: React.FC<SectionCtx> = ({ go, setTweak, openTweaks }) => {
  const palette = ["sky", "coral", "mint", "violet", "amber", "rose"];
  return (
    <div>
      <div className="intro-grid">
        <div className="intro-card">
          <div className="showcase-label">拟态 · NEUMORPHIC UI</div>
          <h1>
            为 Electron 应用<br />定制的触感视觉系统
          </h1>
          <p>
            用凸起关系替代边框,用柔和阴影替代分隔线。30+ 组件 · 6 种强调色 · 三档密度 ·
            全部由 CSS 变量驱动,运行时可改。
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <Button variant="primary" trailingIcon="arrowRight" onClick={() => go("button")}>
              浏览组件
            </Button>
            <Button icon="sliders" onClick={openTweaks}>
              打开 Tweaks
            </Button>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>强调色</div>
            <div className="swatch-row">
              {palette.map((p) => (
                <button
                  key={p}
                  className="swatch"
                  style={{
                    background: {
                      sky: "oklch(68% 0.14 235)",
                      coral: "oklch(72% 0.16 35)",
                      mint: "oklch(72% 0.13 165)",
                      violet: "oklch(66% 0.16 290)",
                      amber: "oklch(76% 0.14 75)",
                      rose: "oklch(68% 0.17 10)",
                    }[p],
                  }}
                  onClick={() => setTweak("accent", p)}
                  aria-label={p}
                />
              ))}
            </div>
          </Card>
          <div className="stat-grid">
            <div className="stat">
              <div className="v">30+</div>
              <div className="l">组件</div>
            </div>
            <div className="stat">
              <div className="v">6</div>
              <div className="l">强调色</div>
            </div>
            <div className="stat">
              <div className="v">3</div>
              <div className="l">密度</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ========================================================================
 * Theme
 * ====================================================================== */

const ThemedSwatch: React.FC<{ palette: string; active: boolean; onClick: () => void; label: string }> = ({
  palette,
  active,
  onClick,
  label,
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    style={{
      width: 28,
      height: 28,
      borderRadius: 999,
      border: active ? "2px solid var(--fg)" : "2px solid transparent",
      background: palette,
      cursor: "pointer",
      padding: 0,
      boxShadow: "var(--neu-flat)",
    }}
  />
);

const ThemePreviewBox: React.FC<{ children: React.ReactNode; label?: React.ReactNode }> = ({ children, label }) => (
  <div
    style={{
      padding: 14,
      borderRadius: "var(--r-md)",
      background: "var(--bg-sunken)",
      display: "flex",
      flexDirection: "column",
      gap: 10,
    }}
  >
    {label && <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>{label}</div>}
    {children}
  </div>
);

const ThemePreviewControls: React.FC = () => (
  <Row gap={8}>
    <Button variant="primary" icon="sparkle">
      主按钮
    </Button>
    <Button variant="ghost">次按钮</Button>
    <Tag solid>标签</Tag>
    <Spinner size={18} />
  </Row>
);

const ThemePresetsDemo: React.FC = () => {
  const [accent, setAccent] = React.useState<AccentKey>("sky");
  const keys = Object.keys(ACCENT_PRESETS) as AccentKey[];
  return (
    <ThemeProvider target="scope" accent={accent} as="div">
      <ThemePreviewBox label={`accent = "${accent}"`}>
        <Row gap={8}>
          {keys.map((k) => (
            <ThemedSwatch
              key={k}
              label={k}
              palette={ACCENT_PRESETS[k].accent}
              active={accent === k}
              onClick={() => setAccent(k)}
            />
          ))}
        </Row>
        <ThemePreviewControls />
      </ThemePreviewBox>
    </ThemeProvider>
  );
};

const ThemeCustomDemo: React.FC = () => {
  const [color, setColor] = React.useState("oklch(70% 0.18 180)");
  return (
    <ThemeProvider target="scope" accent={color} as="div">
      <ThemePreviewBox label="ink / soft / glow 自动从主色推导">
        <Input
          value={color}
          onChange={(v) => setColor(v)}
          placeholder="oklch(70% 0.18 180) 或 #00b894"
        />
        <Row gap={8}>
          {["#00b894", "#ff6b6b", "oklch(70% 0.18 180)", "oklch(60% 0.2 310)"].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              style={{
                height: 26,
                padding: "0 10px",
                fontSize: 11,
                borderRadius: 999,
                border: "1px solid var(--divider)",
                background: "var(--bg)",
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
              }}
            >
              {c}
            </button>
          ))}
        </Row>
        <ThemePreviewControls />
      </ThemePreviewBox>
    </ThemeProvider>
  );
};

const ThemeHookDemo: React.FC = () => (
  <ThemeProvider target="scope" accent="violet" as="div">
    <ThemeHookInner />
  </ThemeProvider>
);

const ThemeHookInner: React.FC = () => {
  const t = useTheme();
  return (
    <ThemePreviewBox label={`mode=${t.resolvedMode} · accent=${t.accent} · density=${t.density}`}>
      <Row gap={8}>
        <Button size="sm" onClick={t.toggleMode} icon={t.resolvedMode === "dark" ? "sun" : "moon"}>
          {t.resolvedMode === "dark" ? "切浅色" : "切深色"}
        </Button>
        <Button size="sm" onClick={() => t.setAccent("coral")}>
          accent = coral
        </Button>
        <Button size="sm" onClick={() => t.setAccent("mint")}>
          accent = mint
        </Button>
        <Button size="sm" onClick={() => t.setDensity(t.density === "compact" ? "spacious" : "compact")}>
          切密度
        </Button>
        <Button size="sm" variant="ghost" onClick={t.reset}>
          重置
        </Button>
      </Row>
      <ThemePreviewControls />
    </ThemePreviewBox>
  );
};

const ThemeScopeDemo: React.FC = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    <ThemePreviewBox label="外层 · 跟随全局">
      <ThemePreviewControls />
      <ThemeProvider target="scope" accent="coral" as="div">
        <ThemePreviewBox label='内层 · accent="coral"'>
          <ThemePreviewControls />
          <ThemeProvider target="scope" accent="mint" as="div">
            <ThemePreviewBox label='再嵌一层 · accent="mint"'>
              <ThemePreviewControls />
            </ThemePreviewBox>
          </ThemeProvider>
        </ThemePreviewBox>
      </ThemeProvider>
    </ThemePreviewBox>
  </div>
);

const SectionTheme: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={
      <>
        <p>
          用 <code>ThemeProvider</code> 包裹应用或子树来统一管理主题,<code>useTheme()</code> 在子组件里读/改。
          覆盖 mode(深浅色)、accent(强调色)、density(密度)、intensity(阴影强度)、radius(圆角)、font(字体)、任意 token 覆写。
        </p>
        <ul className="doc-usecase-list">
          <li>想让整个应用能切深浅色/强调色</li>
          <li>想给某一块(推广卡片/对话框)单独换一套主题</li>
          <li>想把用户的偏好持久化(加 <code>storageKey</code>)</li>
          <li>想跟随系统主题(<code>mode="system"</code>)</li>
        </ul>
      </>
    }
    demos={[
      {
        id: "basic",
        title: "基础用法",
        description: "用 ThemeProvider 包住应用,所有 lumina 组件自动生效。",
        span: 2,
        code: `import { ThemeProvider } from "lumina";

function Root() {
  return (
    <ThemeProvider
      mode="system"        // "light" | "dark" | "system"
      accent="violet"      // 预设 或 自定义颜色
      density="comfortable"
      intensity={5}        // 1..10 阴影强度
      radius={20}          // 圆角基准 px
      font="sf"            // 字体预设
      storageKey="app:theme"   // 持久化到 localStorage
    >
      <App />
    </ThemeProvider>
  );
}`,
        render: () => (
          <ThemePreviewBox label="这个 playground 本身就用 ThemeProvider 驱动 —— 右下角 Tweaks 面板改的就是它">
            <ThemePreviewControls />
          </ThemePreviewBox>
        ),
      },
      {
        id: "hook",
        title: "useTheme Hook",
        description: "子组件随时读/改主题。下面这块被独立的 ThemeProvider 包裹,不影响全局。",
        code: `const t = useTheme();
t.toggleMode();              // 切换深浅色
t.setAccent("coral");        // 换强调色
t.setDensity("compact");     // 改密度
t.update({ radius: 14 });    // 一次改多个
t.reset();                   // 重置到 props 初值`,
        render: () => <ThemeHookDemo />,
      },
      {
        id: "presets",
        title: "预设强调色",
        description: "内置 6 种拟态强调色,点击切换。",
        code: `<ThemeProvider accent="sky" />
<ThemeProvider accent="coral" />
<ThemeProvider accent="mint" />
<ThemeProvider accent="violet" />
<ThemeProvider accent="amber" />
<ThemeProvider accent="rose" />`,
        render: () => <ThemePresetsDemo />,
      },
      {
        id: "custom",
        title: "自定义强调色",
        description: "传任意 CSS 颜色(oklch / hex / rgb)。只给主色,ink / soft / glow 会用 color-mix 自动推导。",
        code: `// 只给主色,其他自动推导
<ThemeProvider accent="oklch(70% 0.18 180)" />
<ThemeProvider accent={{ accent: "#00b894" }} />

// 或给完整调色板
<ThemeProvider accent={{
  accent: "oklch(70% 0.18 180)",
  ink:    "oklch(40% 0.14 180)",
  soft:   "oklch(93% 0.04 180)",
  glow:   "oklch(70% 0.18 180 / 0.35)",
}} />`,
        render: () => <ThemeCustomDemo />,
      },
      {
        id: "scope",
        title: "作用域嵌套",
        description: "target=\"scope\" 只作用于子树,可以层层嵌套。",
        span: 2,
        code: `<ThemeProvider accent="sky">
  <Page />

  <ThemeProvider target="scope" accent="coral" as="section">
    <PromoCard />

    <ThemeProvider target="scope" accent="mint" as="div">
      <InnerCallout />
    </ThemeProvider>
  </ThemeProvider>
</ThemeProvider>`,
        render: () => <ThemeScopeDemo />,
      },
      {
        id: "tokens",
        title: "覆盖任意 token",
        description: "tokens prop 可以改 tokens.css 里任何变量 —— 键名可省略 --。",
        code: `<ThemeProvider
  tokens={{
    bg: "#f5f5f7",           // 等价 --bg
    "--bg-sunken": "#e8e8ed",
    "shadow-dark": "rgba(0,0,0,0.18)",
    "--font-display": '"Inter", sans-serif',
  }}
/>`,
      },
      {
        id: "imperative",
        title: "命令式 API",
        description: "脱离 React 直接给元素套主题 —— 适合 vanilla JS 或 SSR 早期水合。",
        code: `import { applyTheme } from "lumina";

applyTheme(document.documentElement, {
  mode: "dark",
  accent: "violet",
  radius: 16,
});`,
      },
    ]}
    api={[
      {
        title: "ThemeProvider Props",
        rows: [
          { prop: "mode", description: "深浅色模式", type: `"light" | "dark" | "system"`, default: `"light"` },
          { prop: "accent", description: "强调色,预设或自定义", type: "AccentKey | CustomAccentInput", default: `"sky"` },
          { prop: "density", description: "密度", type: `"compact" | "comfortable" | "spacious"`, default: `"comfortable"` },
          { prop: "intensity", description: "阴影强度 1-10", type: "number", default: "5" },
          { prop: "radius", description: "圆角基准 px", type: "number", default: "20" },
          { prop: "font", description: "字体预设或 CSS 栈", type: "FontConfig", default: `"sf"` },
          { prop: "tokens", description: "任意 CSS 变量覆写", type: "Record<string, string>" },
          { prop: "target", description: "应用到根还是局部", type: `"root" | "scope"`, default: `"root"` },
          { prop: "as", description: "scope 模式的元素标签", type: "keyof JSX.IntrinsicElements", default: `"div"` },
          { prop: "storageKey", description: "localStorage 持久化 key", type: "string" },
          { prop: "onChange", description: "主题值变更回调", type: "(value: ThemeValue) => void" },
        ],
      },
      {
        title: "useTheme() → ThemeValue",
        rows: [
          { prop: "mode", description: "请求的模式(保留 system)", type: "ThemeMode" },
          { prop: "resolvedMode", description: "解析后的具体模式", type: `"light" | "dark"` },
          { prop: "accent", description: "预设 key 或 \"custom\"", type: "AccentKey | \"custom\"" },
          { prop: "accentPalette", description: "当前完整调色板", type: "AccentPalette" },
          { prop: "density / intensity / radius / font / tokens", description: "当前各维度状态", type: "-" },
          { prop: "setMode(m)", description: "切换模式", type: "(m: ThemeMode) => void" },
          { prop: "toggleMode()", description: "light ⇄ dark 切换", type: "() => void" },
          { prop: "setAccent(a)", description: "切换强调色", type: "(a: AccentKey | CustomAccentInput) => void" },
          { prop: "setDensity / setIntensity / setRadius / setFont / setTokens", description: "对应字段的 setter", type: "-" },
          { prop: "update(cfg)", description: "浅合并多字段", type: "(cfg: Partial<ThemeConfig>) => void" },
          { prop: "reset()", description: "重置到初始 props", type: "() => void" },
        ],
      },
    ]}
  />
);

/* ========================================================================
 * Button
 * ====================================================================== */

const buttonApi: ApiRow[] = [
  { prop: "variant", description: "按钮风格", type: `"default" | "primary" | "ghost" | "danger"`, default: `"default"` },
  { prop: "size", description: "按钮尺寸", type: `"sm" | "md" | "lg"`, default: `"md"` },
  { prop: "icon", description: "前置图标", type: "IconName" },
  { prop: "trailingIcon", description: "后置图标", type: "IconName" },
  { prop: "loading", description: "加载态", type: "boolean", default: "false" },
  { prop: "disabled", description: "禁用", type: "boolean", default: "false" },
  { prop: "onClick", description: "点击回调", type: "(e: MouseEvent) => void" },
];

const iconButtonApi: ApiRow[] = [
  { prop: "icon", description: "图标名", type: "IconName", required: true },
  { prop: "tip", description: "悬浮提示", type: "string" },
  { prop: "size / variant", description: "继承自 Button", type: "—" },
];

const segmentedApi: ApiRow[] = [
  { prop: "options", description: "选项数组", type: "{ value, label, disabled? }[]", required: true },
  { prop: "value / defaultValue", description: "受控/初始选中值", type: "T" },
  { prop: "onChange", description: "切换回调", type: "(value: T) => void" },
];

const SectionButton: React.FC<SectionCtx> = () => {
  const [loading, setLoading] = React.useState(false);
  const demos: DocDemoSpec[] = [
    {
      id: "basic",
      title: "基础按钮",
      description: "四种风格:主要、默认、幽灵、危险。",
      code: `<Button variant="primary">主按钮</Button>
<Button>默认按钮</Button>
<Button variant="ghost">幽灵按钮</Button>
<Button variant="danger">删除</Button>`,
      render: () => (
        <Row>
          <Button variant="primary">主按钮</Button>
          <Button>默认按钮</Button>
          <Button variant="ghost">幽灵按钮</Button>
          <Button variant="danger">删除</Button>
        </Row>
      ),
    },
    {
      id: "icon",
      title: "图标按钮",
      description: "icon 在前,trailingIcon 在后。",
      code: `<Button variant="primary" icon="sparkle">新建</Button>
<Button icon="download">下载</Button>
<Button trailingIcon="arrowRight">下一步</Button>`,
      render: () => (
        <Row>
          <Button variant="primary" icon="sparkle">新建</Button>
          <Button icon="download">下载</Button>
          <Button trailingIcon="arrowRight">下一步</Button>
        </Row>
      ),
    },
    {
      id: "loading",
      title: "加载与禁用",
      description: "loading 期间禁用并显示 spinner。",
      code: `<Button loading={loading} variant="primary" onClick={...}>点我加载</Button>
<Button disabled>已禁用</Button>`,
      render: () => (
        <Row>
          <Button
            loading={loading}
            variant="primary"
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
                toast.success("操作完成");
              }, 1400);
            }}
          >
            点我加载
          </Button>
          <Button disabled>已禁用</Button>
        </Row>
      ),
    },
    {
      id: "size",
      title: "尺寸",
      description: "提供 sm / md / lg 三种高度。",
      code: `<Button size="sm">Small</Button>
<Button>Medium</Button>
<Button size="lg">Large</Button>`,
      render: () => (
        <Row>
          <Button size="sm" variant="primary">Small</Button>
          <Button variant="primary">Medium</Button>
          <Button size="lg" variant="primary">Large</Button>
        </Row>
      ),
    },
    {
      id: "icon-only",
      title: "纯图标按钮",
      description: "IconButton 是只含图标的方形按钮,常配合 tip 使用。",
      code: `<IconButton icon="heart" tip="收藏" />
<IconButton icon="bell" tip="通知" />
<IconButton icon="settings" tip="设置" />`,
      render: () => (
        <Row>
          <IconButton icon="heart" size="sm" tip="收藏" />
          <IconButton icon="bell" tip="通知" />
          <IconButton icon="settings" tip="设置" />
        </Row>
      ),
    },
    {
      id: "segmented",
      title: "分段控制器",
      description: "互斥多选项切换。",
      code: `<Segmented
  options={[
    { value: "grid", label: "网格" },
    { value: "list", label: "列表" },
    { value: "card", label: "卡片" },
  ]}
  defaultValue="grid"
/>`,
      render: () => (
        <Segmented
          options={[
            { value: "grid", label: "网格" },
            { value: "list", label: "列表" },
            { value: "card", label: "卡片" },
          ]}
          defaultValue="grid"
        />
      ),
    },
  ];
  return (
    <DocPage
      whenToUse={
        <>
          <p>标记一个操作命令,响应用户点击行为,触发相应的业务逻辑。</p>
          <ul className="doc-usecase-list">
            <li>突出主操作时使用 <code>primary</code></li>
            <li>多个并列动作时使用默认按钮</li>
            <li>不希望过于醒目时使用 <code>ghost</code></li>
            <li>提示不可恢复的操作时使用 <code>danger</code></li>
          </ul>
        </>
      }
      demos={demos}
      api={[
        { title: "Button", rows: buttonApi },
        { title: "IconButton", rows: iconButtonApi },
        { title: "Segmented", rows: segmentedApi },
      ]}
    />
  );
};

/* ========================================================================
 * Icon
 * ====================================================================== */

const ICON_NAMES = [
  "search", "plus", "minus", "check", "x", "chevDown", "chevRight", "chevLeft", "chevUp",
  "arrowRight", "settings", "user", "bell", "mail", "heart", "star", "home", "folder",
  "file", "image", "play", "pause", "volume", "trash", "edit", "copy", "download", "upload",
  "info", "alert", "check2", "eye", "eyeOff", "sparkle", "moon", "sun", "palette", "layers",
  "grid", "list", "zap", "filter", "mic", "send", "calendar", "clock", "menu", "more", "sliders",
] as const;

const SectionIcon: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={
      <>
        <p>统一的图标集,所有图标继承当前文字颜色。共 {ICON_NAMES.length} 枚。</p>
      </>
    }
    demos={[
      {
        id: "basic",
        title: "基础用法",
        description: "通过 name 指定图标,size 控制尺寸,stroke 控制描边粗细。",
        code: `<Icon name="search" size={16} />
<Icon name="heart" size={20} stroke={1.5} />`,
        render: () => (
          <Row>
            <Icon name="search" size={16} />
            <Icon name="heart" size={20} stroke={1.5} />
            <Icon name="star" size={24} />
            <Icon name="bell" size={28} stroke={2.5} />
          </Row>
        ),
      },
      {
        id: "all",
        title: "全部图标",
        span: 2,
        description: "点击图标可复制名称。",
        render: () => (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
              gap: 6,
            }}
          >
            {ICON_NAMES.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(n);
                  toast.success(`已复制 "${n}"`);
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  padding: 10,
                  border: "none",
                  background: "transparent",
                  borderRadius: 10,
                  cursor: "pointer",
                  color: "var(--fg-muted)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--bg)";
                  e.currentTarget.style.boxShadow = "var(--neu-flat)";
                  e.currentTarget.style.color = "var(--accent-ink)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.color = "var(--fg-muted)";
                }}
              >
                <Icon name={n} size={18} />
                <span>{n}</span>
              </button>
            ))}
          </div>
        ),
      },
    ]}
    api={[
      {
        title: "Icon",
        rows: [
          { prop: "name", description: "图标名", type: "IconName", required: true },
          { prop: "size", description: "尺寸 (px)", type: "number", default: "16" },
          { prop: "stroke", description: "描边粗细", type: "number", default: "2" },
        ],
      },
    ]}
  />
);

/* ========================================================================
 * Input
 * ====================================================================== */

const inputApi: ApiRow[] = [
  { prop: "value / defaultValue", description: "受控值 / 初值", type: "string" },
  { prop: "onChange", description: "变更回调", type: "(value: string, e) => void" },
  { prop: "placeholder", description: "占位文案", type: "string" },
  { prop: "leadingIcon / trailingIcon", description: "前/后置图标", type: "IconName" },
  { prop: "size", description: "尺寸", type: `"sm" | "md" | "lg"`, default: `"md"` },
  { prop: "invalid", description: "错误态", type: "boolean", default: "false" },
  { prop: "disabled", description: "禁用", type: "boolean", default: "false" },
];

const SectionInput: React.FC<SectionCtx> = () => {
  const [v, setV] = React.useState("");
  const [pw, setPw] = React.useState("lumina-is-neat");
  const [showPw, setShowPw] = React.useState(false);
  const [msg, setMsg] = React.useState("");
  const [email, setEmail] = React.useState("invalid");
  return (
    <DocPage
      whenToUse={<p>用户输入文本时使用,提供单行 Input 与多行 Textarea 两种形态,均支持前后置图标、错误态、禁用态。</p>}
      demos={[
        {
          id: "basic",
          title: "基础用法",
          code: `const [v, setV] = useState("");
<Input placeholder="输入用户名" value={v} onChange={setV} leadingIcon="user" />`,
          render: () => (
            <Field label="用户名">
              <Input placeholder="输入你的用户名" value={v} onChange={setV} leadingIcon="user" />
            </Field>
          ),
        },
        {
          id: "icon",
          title: "前后置图标",
          description: "leadingIcon / trailingIcon。",
          code: `<Input placeholder="搜索..." leadingIcon="search" />`,
          render: () => (
            <Field label="搜索">
              <Input placeholder="搜索组件、图标..." leadingIcon="search" />
            </Field>
          ),
        },
        {
          id: "password",
          title: "密码切换",
          description: "trailingIcon 可点击切换密码可见性。",
          code: `<Input
  type={showPw ? "text" : "password"}
  trailingIcon={showPw ? "eyeOff" : "eye"}
  onTrailingIconClick={() => setShowPw(s => !s)}
/>`,
          render: () => (
            <Field label="密码">
              <Input
                type={showPw ? "text" : "password"}
                value={pw}
                onChange={setPw}
                leadingIcon="settings"
                trailingIcon={showPw ? "eyeOff" : "eye"}
                onTrailingIconClick={() => setShowPw((s) => !s)}
              />
            </Field>
          ),
        },
        {
          id: "invalid",
          title: "校验错误",
          description: "invalid 触发红色凹槽。",
          code: `<Input invalid hint="请输入有效的邮箱" />`,
          render: () => (
            <Field
              label="邮箱地址"
              invalid={!email.includes("@")}
              hint={!email.includes("@") ? "请输入有效的邮箱" : "我们不会发给第三方"}
            >
              <Input value={email} onChange={setEmail} leadingIcon="mail" invalid={!email.includes("@")} />
            </Field>
          ),
        },
        {
          id: "textarea",
          title: "多行文本",
          span: 2,
          description: "Textarea 与 Input 共享同款凹槽。",
          code: `<Textarea placeholder="..." value={msg} onChange={setMsg} />`,
          render: () => (
            <Field label="消息内容" hint={`${msg.length} / 300`}>
              <Textarea placeholder="写点什么..." value={msg} onChange={setMsg} />
            </Field>
          ),
        },
      ]}
      api={[{ title: "Input / Textarea", rows: inputApi }]}
    />
  );
};

/* ========================================================================
 * Switch
 * ====================================================================== */

const SectionSwitch: React.FC<SectionCtx> = () => {
  const [v, setV] = React.useState(true);
  return (
    <DocPage
      whenToUse={<p>表示两种相互对立状态的切换,例如开/关、启用/禁用。</p>}
      demos={[
        {
          id: "basic",
          title: "基础用法",
          code: `<Switch checked={v} onChange={setV} label="开启通知" />`,
          render: () => (
            <Row>
              <Switch checked={v} onChange={setV} label="开启通知" />
            </Row>
          ),
        },
        {
          id: "size",
          title: "尺寸",
          description: "提供 sm / md 两档。",
          code: `<Switch size="sm" defaultChecked />
<Switch defaultChecked />`,
          render: () => (
            <Row>
              <Switch size="sm" defaultChecked />
              <Switch defaultChecked />
            </Row>
          ),
        },
        {
          id: "disabled",
          title: "禁用",
          code: `<Switch disabled label="不可用" />
<Switch disabled defaultChecked label="禁用且开启" />`,
          render: () => (
            <Row>
              <Switch disabled label="不可用" />
              <Switch disabled defaultChecked label="禁用且开启" />
            </Row>
          ),
        },
      ]}
      api={[
        {
          title: "Switch",
          rows: [
            { prop: "checked / defaultChecked", description: "受控/初始", type: "boolean" },
            { prop: "onChange", description: "状态变更", type: "(checked: boolean) => void" },
            { prop: "label", description: "右侧文案", type: "ReactNode" },
            { prop: "size", description: "尺寸", type: `"sm" | "md"`, default: `"md"` },
            { prop: "disabled", description: "禁用", type: "boolean", default: "false" },
          ],
        },
      ]}
    />
  );
};

/* ========================================================================
 * Checkbox
 * ====================================================================== */

const SectionCheckbox: React.FC<SectionCtx> = () => {
  const [s, setS] = React.useState({ a: true, b: false, c: true });
  const all = s.a && s.b && s.c;
  const some = (s.a || s.b || s.c) && !all;
  return (
    <DocPage
      whenToUse={<p>在一组选项中进行多项选择,或单独切换某个开关项。</p>}
      demos={[
        {
          id: "basic",
          title: "基础用法",
          code: `<Checkbox checked={v} onChange={setV} label="同意协议" />`,
          render: () => (
            <Row>
              <Checkbox defaultChecked label="自动保存" />
              <Checkbox label="启用实验功能" />
              <Checkbox disabled label="已锁定" />
            </Row>
          ),
        },
        {
          id: "indeterminate",
          title: "全选/半选",
          description: "indeterminate 用来表示部分选中。",
          code: `<Checkbox indeterminate={some} checked={all} onChange={...} label="全选" />`,
          render: () => (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Checkbox
                checked={all}
                indeterminate={some}
                onChange={(v) => setS({ a: v, b: v, c: v })}
                label="全选"
              />
              <Divider />
              <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 22 }}>
                <Checkbox checked={s.a} onChange={(v) => setS((c) => ({ ...c, a: v }))} label="选项 A" />
                <Checkbox checked={s.b} onChange={(v) => setS((c) => ({ ...c, b: v }))} label="选项 B" />
                <Checkbox checked={s.c} onChange={(v) => setS((c) => ({ ...c, c: v }))} label="选项 C" />
              </div>
            </div>
          ),
        },
      ]}
      api={[
        {
          title: "Checkbox",
          rows: [
            { prop: "checked / defaultChecked", description: "受控/初始", type: "boolean" },
            { prop: "indeterminate", description: "半选态", type: "boolean", default: "false" },
            { prop: "onChange", description: "变更", type: "(checked: boolean) => void" },
            { prop: "label", description: "右侧文案", type: "ReactNode" },
            { prop: "disabled", description: "禁用", type: "boolean", default: "false" },
          ],
        },
      ]}
    />
  );
};

/* ========================================================================
 * Radio
 * ====================================================================== */

const SectionRadio: React.FC<SectionCtx> = () => {
  const [v, setV] = React.useState("weekly");
  return (
    <DocPage
      whenToUse={<p>在多个互斥的选项中进行单项选择。</p>}
      demos={[
        {
          id: "basic",
          title: "基础用法",
          code: `<RadioGroup value={v} onChange={setV} options={[
  { value: "daily", label: "每日" },
  { value: "weekly", label: "每周" },
]} />`,
          render: () => (
            <RadioGroup
              value={v}
              onChange={setV}
              options={[
                { value: "daily", label: "每日摘要" },
                { value: "weekly", label: "每周摘要" },
                { value: "monthly", label: "每月摘要" },
                { value: "never", label: "从不发送" },
              ]}
            />
          ),
        },
        {
          id: "horizontal",
          title: "水平排列",
          description: "direction='horizontal'。",
          code: `<RadioGroup direction="horizontal" ... />`,
          render: () => (
            <RadioGroup
              direction="horizontal"
              defaultValue="m"
              options={[
                { value: "s", label: "小" },
                { value: "m", label: "中" },
                { value: "l", label: "大" },
                { value: "xl", label: "超大", disabled: true },
              ]}
            />
          ),
        },
      ]}
      api={[
        {
          title: "RadioGroup",
          rows: [
            { prop: "options", description: "选项数组", type: "{ value, label, disabled? }[]", required: true },
            { prop: "value / defaultValue", description: "受控/初始", type: "T" },
            { prop: "onChange", description: "变更", type: "(value: T) => void" },
            { prop: "direction", description: "方向", type: `"vertical" | "horizontal"`, default: `"vertical"` },
          ],
        },
      ]}
    />
  );
};

/* ========================================================================
 * Slider
 * ====================================================================== */

const SectionSlider: React.FC<SectionCtx> = () => {
  const [v, setV] = React.useState(40);
  return (
    <DocPage
      whenToUse={<p>需要在一段连续的数值区间内取值时使用,例如音量、亮度。</p>}
      demos={[
        {
          id: "basic",
          title: "基础用法",
          code: `<Slider value={v} onChange={setV} showValue />`,
          render: () => <Slider value={v} onChange={setV} showValue />,
        },
        {
          id: "step",
          title: "步进 / 范围",
          description: "min/max/step 控制取值范围与步进。",
          code: `<Slider min={0} max={10} step={1} defaultValue={5} showValue />`,
          render: () => <Slider min={0} max={10} step={1} defaultValue={5} showValue />,
        },
        {
          id: "tone",
          title: "色调",
          code: `<Slider tone="success" defaultValue={70} />
<Slider tone="warning" defaultValue={50} />
<Slider tone="danger" defaultValue={88} />`,
          render: () => (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Slider tone="success" defaultValue={70} />
              <Slider tone="warning" defaultValue={50} />
              <Slider tone="danger" defaultValue={88} />
            </div>
          ),
        },
      ]}
      api={[
        {
          title: "Slider",
          rows: [
            { prop: "value / defaultValue", description: "受控/初始", type: "number" },
            { prop: "onChange", description: "变更", type: "(value: number) => void" },
            { prop: "min / max / step", description: "区间与步进", type: "number" },
            { prop: "tone", description: "色调", type: `"accent" | "success" | "warning" | "danger"`, default: `"accent"` },
            { prop: "showValue", description: "显示数值", type: "boolean", default: "false" },
            { prop: "disabled", description: "禁用", type: "boolean", default: "false" },
          ],
        },
      ]}
    />
  );
};

/* ========================================================================
 * Select
 * ====================================================================== */

const SectionSelect: React.FC<SectionCtx> = () => {
  const [lang, setLang] = React.useState("zh");
  const [tags, setTags] = React.useState<string[]>(["design", "ui"]);
  const [city, setCity] = React.useState<string | undefined>("sh");
  const [framework, setFramework] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [asyncOpts, setAsyncOpts] = React.useState<{ value: string; label: string }[]>([]);
  const triggerLoad = () => {
    setLoading(true);
    setAsyncOpts([]);
    setTimeout(() => {
      setAsyncOpts([
        { value: "a", label: "Apple" },
        { value: "b", label: "Banana" },
        { value: "c", label: "Cherry" },
      ]);
      setLoading(false);
    }, 1000);
  };
  return (
    <DocPage
      whenToUse={
        <>
          <p>从一组选项中选择一个或多个,常见于表单和过滤场景。</p>
          <ul className="doc-usecase-list">
            <li>选项数量 ≥ 4 时优先使用 Select 而非 Radio / Checkbox</li>
            <li>需要搜索过滤时启用 <code>searchable</code></li>
            <li>多选场景使用 <code>multiple</code>,可配合 <code>maxTagCount</code> 折叠</li>
          </ul>
        </>
      }
      demos={[
        {
          id: "basic",
          title: "单选",
          code: `<Select value={lang} onChange={setLang} options={[
  { value: "zh", label: "简体中文" },
  { value: "en", label: "English" },
]} />`,
          render: () => (
            <Field label="界面语言">
              <Select
                value={lang}
                onChange={setLang}
                options={[
                  { value: "zh", label: "简体中文" },
                  { value: "en", label: "English" },
                  { value: "ja", label: "日本語" },
                  { value: "ko", label: "한국어" },
                ]}
              />
            </Field>
          ),
        },
        {
          id: "multi",
          title: "多选",
          description: "multiple + Tag 形式呈现已选项。",
          code: `<Select multiple clearable value={tags} onChange={setTags} options={...} />`,
          render: () => (
            <Field label={`标签 (已选 ${tags.length})`}>
              <Select
                multiple
                clearable
                value={tags}
                onChange={setTags}
                options={[
                  { value: "design", label: "设计" },
                  { value: "ui", label: "UI" },
                  { value: "ux", label: "UX" },
                  { value: "frontend", label: "前端" },
                  { value: "backend", label: "后端" },
                ]}
              />
            </Field>
          ),
        },
        {
          id: "search",
          title: "搜索过滤",
          description: "searchable + clearable + 选项 icon/description。",
          code: `<Select searchable clearable
  options={[{ value, label, icon, description }]}
/>`,
          render: () => (
            <Field label="城市">
              <Select
                searchable
                clearable
                value={city}
                onChange={setCity}
                onClear={() => setCity(undefined)}
                placeholder="搜索城市..."
                options={[
                  { value: "bj", label: "北京", icon: "home", description: "中国 · 首都" },
                  { value: "sh", label: "上海", icon: "home", description: "中国 · 直辖市" },
                  { value: "tk", label: "东京", icon: "home", description: "日本" },
                  { value: "ld", label: "伦敦", icon: "home", description: "英国" },
                  { value: "pa", label: "巴黎", icon: "home", description: "法国" },
                ]}
              />
            </Field>
          ),
        },
        {
          id: "group",
          title: "分组",
          description: "options 接受 { label, options } 表示分组。",
          code: `options={[
  { label: "前端", options: [...] },
  { label: "后端", options: [...] },
]}`,
          render: () => (
            <Field label="技术栈">
              <Select
                searchable
                value={framework}
                onChange={setFramework}
                placeholder="选择技术栈..."
                options={[
                  {
                    label: "前端",
                    options: [
                      { value: "react", label: "React", icon: "zap" },
                      { value: "vue", label: "Vue", icon: "zap" },
                      { value: "svelte", label: "Svelte", icon: "zap" },
                    ],
                  },
                  {
                    label: "后端",
                    options: [
                      { value: "node", label: "Node.js", icon: "layers" },
                      { value: "deno", label: "Deno", icon: "layers" },
                      { value: "go", label: "Go", icon: "layers", disabled: true },
                    ],
                  },
                ]}
              />
            </Field>
          ),
        },
        {
          id: "async",
          title: "加载态",
          description: "loading 时显示 spinner,emptyContent 自定义空态。",
          code: `<Select searchable loading={loading} options={asyncOpts} />`,
          render: () => (
            <Field
              label={
                <Row>
                  <span>异步加载</span>
                  <Button size="sm" variant="ghost" icon="arrowRight" onClick={triggerLoad}>
                    重新加载
                  </Button>
                </Row>
              }
            >
              <Select
                searchable
                loading={loading}
                options={asyncOpts}
                placeholder="点击重新加载..."
                emptyContent="没有水果了"
              />
            </Field>
          ),
        },
        {
          id: "size",
          title: "尺寸 / 状态",
          code: `<Select size="sm" /> <Select /> <Select size="lg" />
<Select invalid /> <Select disabled />`,
          render: () => (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Row>
                <Select size="sm" defaultValue="1" options={[{ value: "1", label: "Small" }]} />
                <Select defaultValue="1" options={[{ value: "1", label: "Medium" }]} />
                <Select size="lg" defaultValue="1" options={[{ value: "1", label: "Large" }]} />
              </Row>
              <Row>
                <Select invalid placeholder="错误态" options={[{ value: "1", label: "Option" }]} />
                <Select disabled defaultValue="a" options={[{ value: "a", label: "已锁定" }]} />
              </Row>
            </div>
          ),
        },
      ]}
      api={[
        {
          title: "Select",
          rows: [
            { prop: "options", description: "选项,可含 { label, options } 分组", type: "SelectItem<T>[]", required: true },
            { prop: "value / defaultValue", description: "受控/初始", type: "T | T[]" },
            { prop: "onChange", description: "变更", type: "(value) => void" },
            { prop: "multiple", description: "多选", type: "boolean", default: "false" },
            { prop: "maxTagCount", description: "多选时显示的标签数(超出折叠 +N)", type: "number" },
            { prop: "searchable", description: "可搜索", type: "boolean", default: "false" },
            { prop: "filterOption", description: "自定义过滤", type: "(input, option) => boolean" },
            { prop: "clearable", description: "可清除", type: "boolean", default: "false" },
            { prop: "loading", description: "加载态", type: "boolean", default: "false" },
            { prop: "emptyContent", description: "空态文案", type: "ReactNode" },
            { prop: "size", description: "尺寸", type: `"sm" | "md" | "lg"`, default: `"md"` },
            { prop: "invalid", description: "错误态", type: "boolean", default: "false" },
            { prop: "disabled", description: "禁用", type: "boolean", default: "false" },
          ],
        },
        {
          title: "SelectOption",
          rows: [
            { prop: "value", description: "值", type: "T", required: true },
            { prop: "label", description: "显示", type: "ReactNode" },
            { prop: "icon", description: "前置图标", type: "IconName" },
            { prop: "description", description: "次要描述", type: "ReactNode" },
            { prop: "disabled", description: "禁用项", type: "boolean", default: "false" },
          ],
        },
      ]}
    />
  );
};

/* ========================================================================
 * Cascader
 * ====================================================================== */

const SectionCascader: React.FC<SectionCtx> = () => {
  const [addr, setAddr] = React.useState<string[]>(["asia", "cn", "shanghai"]);
  const regions = [
    {
      value: "asia",
      label: "亚洲",
      icon: "layers" as const,
      children: [
        {
          value: "cn",
          label: "中国",
          children: [
            { value: "beijing", label: "北京" },
            { value: "shanghai", label: "上海" },
            { value: "hangzhou", label: "杭州" },
          ],
        },
        {
          value: "jp",
          label: "日本",
          children: [
            { value: "tokyo", label: "东京" },
            { value: "osaka", label: "大阪" },
          ],
        },
      ],
    },
    {
      value: "europe",
      label: "欧洲",
      icon: "layers" as const,
      children: [
        { value: "de", label: "德国", children: [{ value: "berlin", label: "柏林" }] },
        { value: "fr", label: "法国", children: [{ value: "paris", label: "巴黎" }] },
      ],
    },
  ];
  return (
    <DocPage
      whenToUse={<p>从一组关联数据集合中进行多级选择,例如选择省/市/区。</p>}
      demos={[
        {
          id: "basic",
          title: "基础用法",
          span: 2,
          code: `<Cascader options={regions} value={addr} onChange={setAddr} />`,
          render: () => (
            <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
              <Field label="地区">
                <Cascader options={regions} value={addr} onChange={setAddr} />
              </Field>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 22 }}>
                <div className="showcase-label">已选路径</div>
                <div style={{ fontFamily: "var(--font-mono)", color: "var(--accent-ink)" }}>
                  {addr.join(" / ") || "—"}
                </div>
              </div>
            </div>
          ),
        },
      ]}
      api={[
        {
          title: "Cascader",
          rows: [
            { prop: "options", description: "层级选项树", type: "CascaderOption[]", required: true },
            { prop: "value / defaultValue", description: "受控/初始路径", type: "string[]" },
            { prop: "onChange", description: "选择叶子时触发", type: "(path: string[]) => void" },
            { prop: "placeholder", description: "占位文案", type: "string" },
            { prop: "disabled", description: "禁用", type: "boolean", default: "false" },
          ],
        },
      ]}
    />
  );
};

/* ========================================================================
 * Card / Panel
 * ====================================================================== */

const SectionCard: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={<p>用作信息分组的容器。Panel 是带标题与操作区的 Card 变体。</p>}
    demos={[
      {
        id: "variants",
        title: "三种变体",
        description: "raised(默认凸起)、flat(扁平)、sunken(凹陷)。",
        span: 2,
        code: `<Card>raised</Card>
<Card variant="flat">flat</Card>
<Card variant="sunken">sunken</Card>`,
        render: () => (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <Card>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Raised</div>
              <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>默认凸起样式</div>
            </Card>
            <Card variant="flat">
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Flat</div>
              <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>仅微弱描边</div>
            </Card>
            <Card variant="sunken">
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Sunken</div>
              <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>凹陷下沉</div>
            </Card>
          </div>
        ),
      },
      {
        id: "panel",
        title: "Panel",
        description: "带标题、描述、操作区。",
        code: `<Panel title="月度营收" description="2026 年 4 月" actions={...}>
  ¥ 12,480
</Panel>`,
        render: () => (
          <Panel title="月度营收" description="2026 年 4 月">
            <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "var(--accent-ink)" }}>¥ 12,480</div>
              <Tag tone="success">+18.2%</Tag>
            </div>
          </Panel>
        ),
      },
      {
        id: "panel-actions",
        title: "Panel 带操作",
        code: `<Panel title="..." actions={<Button size="sm" icon="plus">邀请</Button>}>...</Panel>`,
        render: () => (
          <Panel
            title="团队成员"
            description="活跃 7 / 12"
            actions={
              <Button size="sm" variant="ghost" icon="plus">
                邀请
              </Button>
            }
          >
            <div style={{ display: "flex", gap: 6 }}>
              {["金", "陆", "马", "周", "贺"].map((n) => (
                <Avatar key={n} alt={n} size="sm" />
              ))}
            </div>
          </Panel>
        ),
      },
    ]}
    api={[
      {
        title: "Card",
        rows: [
          { prop: "variant", description: "视觉变体", type: `"raised" | "flat" | "sunken"`, default: `"raised"` },
          { prop: "padding", description: "内边距", type: `"none" | "sm" | "md" | "lg"`, default: `"md"` },
        ],
      },
      {
        title: "Panel",
        rows: [
          { prop: "title", description: "标题", type: "ReactNode" },
          { prop: "description", description: "副标题", type: "ReactNode" },
          { prop: "actions", description: "右上操作区", type: "ReactNode" },
        ],
      },
    ]}
  />
);

/* ========================================================================
 * Tag
 * ====================================================================== */

const RemovableTagsDemo: React.FC = () => {
  const [tags, setTags] = React.useState([
    { id: "1", label: "设计", tone: "accent" as const },
    { id: "2", label: "前端", tone: "info" as const },
    { id: "3", label: "Lumina", tone: "success" as const },
    { id: "4", label: "Electron", tone: "warning" as const },
  ]);
  return (
    <Row>
      {tags.length === 0 ? (
        <Button
          size="sm"
          variant="ghost"
          icon="plus"
          onClick={() =>
            setTags([
              { id: "1", label: "设计", tone: "accent" },
              { id: "2", label: "前端", tone: "info" },
              { id: "3", label: "Lumina", tone: "success" },
              { id: "4", label: "Electron", tone: "warning" },
            ])
          }
        >
          重置
        </Button>
      ) : (
        tags.map((t) => (
          <Tag
            key={t.id}
            tone={t.tone}
            removable
            onRemove={() => setTags((list) => list.filter((x) => x.id !== t.id))}
          >
            {t.label}
          </Tag>
        ))
      )}
    </Row>
  );
};

const SectionTag: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={<p>标记关键词、状态或分类。</p>}
    demos={[
      {
        id: "tone",
        title: "语气",
        code: `<Tag>Default</Tag>
<Tag tone="accent">Accent</Tag>
<Tag tone="success">Success</Tag>`,
        render: () => (
          <Row>
            <Tag>Default</Tag>
            <Tag tone="accent">Accent</Tag>
            <Tag tone="info">Info</Tag>
            <Tag tone="success">Success</Tag>
            <Tag tone="warning">Warning</Tag>
            <Tag tone="danger">Danger</Tag>
          </Row>
        ),
      },
      {
        id: "solid",
        title: "实心",
        code: `<Tag tone="accent" solid>Solid</Tag>`,
        render: () => (
          <Row>
            <Tag tone="accent" solid>Accent</Tag>
            <Tag tone="success" solid>Success</Tag>
            <Tag tone="warning" solid>Warning</Tag>
            <Tag tone="danger" solid>Danger</Tag>
          </Row>
        ),
      },
      {
        id: "dot",
        title: "圆点状态",
        description: "dot 渲染前置色块。",
        code: `<Tag tone="success" dot>在线</Tag>`,
        render: () => (
          <Row>
            <Tag tone="success" dot>在线</Tag>
            <Tag tone="warning" dot>忙碌</Tag>
            <Tag tone="danger" dot>异常</Tag>
            <Tag dot>离线</Tag>
          </Row>
        ),
      },
      {
        id: "removable",
        title: "可移除",
        description: "removable + onRemove 实现关闭按钮。",
        code: `<Tag removable onRemove={() => remove(t.id)}>{t.label}</Tag>`,
        render: () => <RemovableTagsDemo />,
      },
    ]}
    api={[
      {
        title: "Tag",
        rows: [
          { prop: "tone", description: "色调", type: `"neutral" | "accent" | "info" | "success" | "warning" | "danger"`, default: `"neutral"` },
          { prop: "solid", description: "实心填充", type: "boolean", default: "false" },
          { prop: "dot", description: "前置圆点", type: "boolean", default: "false" },
          { prop: "removable", description: "显示 ×", type: "boolean", default: "false" },
          { prop: "onRemove", description: "关闭回调", type: "() => void" },
        ],
      },
    ]}
  />
);

/* ========================================================================
 * Badge
 * ====================================================================== */

const SectionBadge: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={<p>展示在元素角落的小型计数或状态指示器,常用于通知、消息、未读数。</p>}
    demos={[
      {
        id: "basic",
        title: "数字徽标",
        code: `<Badge count={3}><IconButton icon="bell" /></Badge>
<Badge count={128} max={99}><IconButton icon="mail" /></Badge>`,
        render: () => (
          <Row gap={32}>
            <Badge count={3}>
              <IconButton icon="bell" tip="3 条新通知" />
            </Badge>
            <Badge count={128}>
              <IconButton icon="mail" tip="未读消息" />
            </Badge>
            <Badge count={1000}>
              <IconButton icon="info" />
            </Badge>
          </Row>
        ),
      },
      {
        id: "dot",
        title: "圆点",
        description: "dot 模式不显示数字,只是状态指示。",
        code: `<Badge dot><IconButton icon="user" /></Badge>`,
        render: () => (
          <Row gap={32}>
            <Badge dot>
              <IconButton icon="user" tip="在线" />
            </Badge>
            <Badge dot>
              <Avatar alt="金" />
            </Badge>
          </Row>
        ),
      },
    ]}
    api={[
      {
        title: "Badge",
        rows: [
          { prop: "count", description: "显示数字", type: "number" },
          { prop: "dot", description: "圆点模式", type: "boolean", default: "false" },
          { prop: "max", description: "超过显示 max+", type: "number", default: "99" },
          { prop: "tone", description: "色调", type: `"neutral" | "accent" | ...`, default: `"danger"` },
        ],
      },
    ]}
  />
);

/* ========================================================================
 * Avatar
 * ====================================================================== */

const SectionAvatar: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={<p>用图像、首字母代表用户或事物。</p>}
    demos={[
      {
        id: "basic",
        title: "基础",
        description: "通过 alt 自动生成首字母。",
        code: `<Avatar alt="金伟" />
<Avatar alt="陆" size="lg" />`,
        render: () => (
          <Row>
            <Avatar alt="金" size="sm" />
            <Avatar alt="陆" />
            <Avatar alt="马" size="lg" />
            <Avatar alt="ZY" size="xl" />
            <Avatar alt="周" size={64} />
          </Row>
        ),
      },
      {
        id: "status",
        title: "状态",
        description: "在右下角显示状态点。",
        code: `<Avatar alt="金" status="online" />
<Avatar alt="陆" status="busy" />`,
        render: () => (
          <Row>
            <Avatar alt="金" status="online" />
            <Avatar alt="陆" status="busy" />
            <Avatar alt="马" status="away" />
            <Avatar alt="周" status="offline" />
          </Row>
        ),
      },
    ]}
    api={[
      {
        title: "Avatar",
        rows: [
          { prop: "src", description: "图片 URL", type: "string" },
          { prop: "alt", description: "替代文本/首字母来源", type: "string" },
          { prop: "initials", description: "自定义首字母", type: "string" },
          { prop: "size", description: "尺寸", type: `number | "sm" | "md" | "lg" | "xl"`, default: `"md"` },
          { prop: "status", description: "状态点", type: `"online" | "busy" | "away" | "offline"` },
        ],
      },
    ]}
  />
);

/* ========================================================================
 * Divider
 * ====================================================================== */

const SectionDivider: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={<p>对内容进行分割,水平或垂直方向皆可。</p>}
    demos={[
      {
        id: "basic",
        title: "水平分隔",
        code: `<Divider />`,
        render: () => (
          <div>
            <p>段落一</p>
            <Divider />
            <p>段落二</p>
          </div>
        ),
      },
      {
        id: "label",
        title: "带文字",
        code: `<Divider label="分割标题" />`,
        render: () => <Divider label="分割标题" />,
      },
      {
        id: "vertical",
        title: "垂直分隔",
        code: `<Divider direction="vertical" />`,
        render: () => (
          <Row>
            <span>左</span>
            <Divider direction="vertical" />
            <span>中</span>
            <Divider direction="vertical" />
            <span>右</span>
          </Row>
        ),
      },
    ]}
    api={[
      {
        title: "Divider",
        rows: [
          { prop: "direction", description: "方向", type: `"horizontal" | "vertical"`, default: `"horizontal"` },
          { prop: "label", description: "中部文字", type: "ReactNode" },
          { prop: "sunken", description: "凹陷凹槽样式", type: "boolean", default: "false" },
        ],
      },
    ]}
  />
);

/* ========================================================================
 * Progress
 * ====================================================================== */

const SectionProgress: React.FC<SectionCtx> = () => {
  const [v, setV] = React.useState(45);
  React.useEffect(() => {
    const t = setInterval(() => setV((p) => (p + 1) % 101), 80);
    return () => clearInterval(t);
  }, []);
  return (
    <DocPage
      whenToUse={<p>展示一项操作的当前进度。</p>}
      demos={[
        {
          id: "basic",
          title: "条形进度",
          code: `<Progress value={v} label="下载中" showValue />`,
          render: () => (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Progress value={v} label="下载中" showValue />
              <Progress value={72} tone="success" label="同步完成" showValue />
              <Progress value={45} tone="warning" label="磁盘占用" showValue />
              <Progress value={92} tone="danger" label="负载" showValue />
            </div>
          ),
        },
        {
          id: "size",
          title: "尺寸",
          code: `<Progress size="sm" value={60} />
<Progress value={60} />
<Progress size="lg" value={60} />`,
          render: () => (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Progress size="sm" value={60} />
              <Progress value={60} />
              <Progress size="lg" value={60} />
            </div>
          ),
        },
        {
          id: "ring",
          title: "环形进度",
          code: `<Ring value={65} />
<Ring value={90} tone="success" size={80}><strong>90%</strong></Ring>`,
          render: () => (
            <Row gap={24}>
              <Ring value={25} />
              <Ring value={62} />
              <Ring value={v} />
              <Ring value={100} size={64} tone="success" />
            </Row>
          ),
        },
      ]}
      api={[
        {
          title: "Progress",
          rows: [
            { prop: "value", description: "0–max 之间", type: "number", required: true },
            { prop: "max", description: "最大值", type: "number", default: "100" },
            { prop: "tone", description: "色调", type: `"accent" | "success" | "warning" | "danger"`, default: `"accent"` },
            { prop: "size", description: "尺寸", type: `"sm" | "md" | "lg"`, default: `"md"` },
            { prop: "label", description: "顶部文案", type: "ReactNode" },
            { prop: "showValue", description: "显示百分比", type: "boolean", default: "false" },
          ],
        },
        {
          title: "Ring",
          rows: [
            { prop: "value", description: "0–100", type: "number", required: true },
            { prop: "size", description: "直径 (px)", type: "number", default: "72" },
            { prop: "tone", description: "色调", type: `"accent" | "success" | ...`, default: `"accent"` },
          ],
        },
      ]}
    />
  );
};

/* ========================================================================
 * List
 * ====================================================================== */

const SectionList: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={<p>承载一组结构化的同质化数据。</p>}
    demos={[
      {
        id: "basic",
        title: "基础列表",
        span: 2,
        code: `<List items={[{ key, title, description, avatar, actions }]} />`,
        render: () => (
          <List
            items={[
              {
                key: "1",
                avatar: <Icon name="folder" size={18} />,
                title: "设计系统",
                description: "42 个文件 · 更新于 2 小时前",
                actions: (
                  <Button size="sm" variant="ghost">
                    打开
                  </Button>
                ),
              },
              {
                key: "2",
                avatar: <Icon name="folder" size={18} />,
                title: "客户项目",
                description: "128 个文件 · 昨天",
              },
              {
                key: "3",
                avatar: <Icon name="file" size={18} />,
                title: "周报.md",
                description: "草稿 · 未发布",
              },
            ]}
          />
        ),
      },
    ]}
    api={[
      {
        title: "List",
        rows: [
          { prop: "items", description: "数据列表", type: "ListItem[]", required: true },
          { prop: "dividers", description: "项之间显示分隔线", type: "boolean", default: "true" },
        ],
      },
      {
        title: "ListItem",
        rows: [
          { prop: "key", description: "唯一键", type: "string", required: true },
          { prop: "title / description", description: "标题/描述", type: "ReactNode" },
          { prop: "avatar", description: "前置图标或头像", type: "ReactNode" },
          { prop: "actions", description: "右侧操作区", type: "ReactNode" },
          { prop: "onClick", description: "点击回调", type: "() => void" },
        ],
      },
    ]}
  />
);

/* ========================================================================
 * Table
 * ====================================================================== */

const SectionTable: React.FC<SectionCtx> = () => {
  const data = [
    { id: 1, name: "金伟", role: "设计", status: "在线", joined: "2024-03-12" },
    { id: 2, name: "陆希", role: "研发", status: "忙碌", joined: "2024-05-28" },
    { id: 3, name: "马可", role: "产品", status: "离线", joined: "2023-11-04" },
    { id: 4, name: "周妍", role: "研发", status: "在线", joined: "2025-01-20" },
  ];
  return (
    <DocPage
      whenToUse={<p>用于结构化的数据展示。需要复杂功能时请使用 Table Pro。</p>}
      demos={[
        {
          id: "basic",
          title: "基础表格",
          span: 2,
          code: `<Table rowKey="id" columns={[...]} data={data} />`,
          render: () => (
            <Table
              rowKey="id"
              columns={[
                {
                  key: "name",
                  title: "姓名",
                  dataIndex: "name",
                  render: (v) => (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <Avatar alt={String(v)} size="sm" /> {v}
                    </span>
                  ),
                },
                { key: "role", title: "部门", dataIndex: "role", render: (v) => <Tag tone="accent">{v}</Tag> },
                {
                  key: "status",
                  title: "状态",
                  dataIndex: "status",
                  render: (v) => (
                    <Tag tone={v === "在线" ? "success" : v === "忙碌" ? "warning" : "neutral"} dot>
                      {v}
                    </Tag>
                  ),
                },
                { key: "joined", title: "加入时间", dataIndex: "joined" },
              ]}
              data={data}
            />
          ),
        },
        {
          id: "variants",
          title: "样式变体",
          span: 2,
          description: "三种视觉变体:striped (条纹)、embossed (凸起)、cards (卡片行)。",
          code: `<Table variant="striped" ... />
<Table variant="embossed" ... />
<Table variant="cards" ... />`,
          render: () => (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Table
                rowKey="id"
                variant="striped"
                columns={[
                  { key: "name", title: "条纹", dataIndex: "name" },
                  { key: "role", title: "部门", dataIndex: "role" },
                ]}
                data={data}
              />
            </div>
          ),
        },
      ]}
      api={[
        {
          title: "Table",
          rows: [
            { prop: "columns", description: "列定义", type: "TableColumn[]", required: true },
            { prop: "data", description: "数据数组", type: "Row[]", required: true },
            { prop: "rowKey", description: "行键", type: "string | (row) => key" },
            { prop: "variant", description: "视觉变体", type: `"default" | "striped" | "embossed" | "cards"`, default: `"default"` },
            { prop: "selectable", description: "显示选择列", type: "boolean", default: "false" },
            { prop: "selected / onSelect", description: "受控选中", type: "(string | number)[]" },
            { prop: "sortKey / sortDir / onSort", description: "受控排序", type: "—" },
            { prop: "onRowClick", description: "点击行", type: "(row, i) => void" },
          ],
        },
      ]}
    />
  );
};

/* ========================================================================
 * Table Pro
 * ====================================================================== */

const SectionTablePro: React.FC<SectionCtx> = () => {
  const raw = React.useMemo(
    () => [
      { id: 1, name: "金伟", role: "设计", status: "在线", level: "P7", progress: 92 },
      { id: 2, name: "陆希", role: "研发", status: "忙碌", level: "P6", progress: 71 },
      { id: 3, name: "马可", role: "产品", status: "离线", level: "P8", progress: 45 },
      { id: 4, name: "周妍", role: "研发", status: "在线", level: "P5", progress: 88 },
      { id: 5, name: "何秋", role: "运营", status: "在线", level: "P6", progress: 63 },
      { id: 6, name: "林夕", role: "研发", status: "忙碌", level: "P7", progress: 76 },
      { id: 7, name: "白露", role: "设计", status: "在线", level: "P5", progress: 54 },
      { id: 8, name: "吴桐", role: "产品", status: "离线", level: "P6", progress: 40 },
    ],
    []
  );
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [selected, setSelected] = React.useState<(string | number)[]>([]);
  const [sortKey, setSortKey] = React.useState("id");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");
  const [page, setPage] = React.useState(1);
  const pageSize = 4;

  const filtered = React.useMemo(() => {
    let d = raw;
    if (search) d = d.filter((r) => r.name.includes(search));
    if (roleFilter !== "all") d = d.filter((r) => r.role === roleFilter);
    return [...d].sort((a, b) => {
      const A = (a as any)[sortKey];
      const B = (b as any)[sortKey];
      const cmp = A > B ? 1 : A < B ? -1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [raw, search, roleFilter, sortKey, sortDir]);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <DocPage
      whenToUse={<p>带工具栏、搜索、筛选、排序、多选、分页的全功能表格。</p>}
      demos={[
        {
          id: "full",
          title: "全功能",
          span: 2,
          code: `<TablePro
  rowKey="id" data={paged} columns={...}
  selectable selected={selected} onSelect={setSelected}
  sortKey={sortKey} sortDir={sortDir} onSort={...}
  toolbar={<Input ... /> <Select ... />}
  actions={<Button>新增</Button>}
  footer={<Pagination ... />}
/>`,
          render: () => (
            <TablePro
              rowKey="id"
              data={paged}
              selectable
              selected={selected}
              onSelect={setSelected}
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={(k) => {
                if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                else {
                  setSortKey(k);
                  setSortDir("asc");
                }
              }}
              columns={[
                {
                  key: "name",
                  title: "姓名",
                  dataIndex: "name",
                  sortable: true,
                  render: (v) => (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <Avatar alt={String(v)} size="sm" /> {v}
                    </span>
                  ),
                },
                { key: "role", title: "部门", dataIndex: "role", sortable: true, render: (v) => <Tag tone="accent">{v}</Tag> },
                { key: "level", title: "级别", dataIndex: "level", sortable: true },
                {
                  key: "status",
                  title: "状态",
                  dataIndex: "status",
                  render: (v) => (
                    <Tag tone={v === "在线" ? "success" : v === "忙碌" ? "warning" : "neutral"} dot>
                      {v}
                    </Tag>
                  ),
                },
                {
                  key: "progress",
                  title: "完成度",
                  dataIndex: "progress",
                  sortable: true,
                  render: (v) => (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 120 }}>
                      <div style={{ flex: 1 }}>
                        <Progress value={Number(v)} size="sm" />
                      </div>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, width: 32, textAlign: "right" }}>
                        {v}%
                      </span>
                    </div>
                  ),
                },
              ]}
              toolbar={
                <>
                  <div style={{ width: 200 }}>
                    <Input placeholder="搜索成员..." leadingIcon="search" value={search} onChange={setSearch} />
                  </div>
                  <div style={{ width: 140 }}>
                    <Select
                      value={roleFilter}
                      onChange={setRoleFilter}
                      options={[
                        { value: "all", label: "全部" },
                        { value: "设计", label: "设计" },
                        { value: "研发", label: "研发" },
                        { value: "产品", label: "产品" },
                        { value: "运营", label: "运营" },
                      ]}
                    />
                  </div>
                </>
              }
              actions={
                <>
                  {selected.length > 0 && (
                    <>
                      <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>已选 {selected.length}</span>
                      <Button
                        size="sm"
                        variant="danger"
                        icon="trash"
                        onClick={() => {
                          toast.error(`已删除 ${selected.length} 条`);
                          setSelected([]);
                        }}
                      >
                        批量删除
                      </Button>
                      <Divider direction="vertical" />
                    </>
                  )}
                  <Button size="sm" variant="primary" icon="plus">
                    新增
                  </Button>
                </>
              }
              footer={
                <Pagination total={filtered.length} pageSize={pageSize} page={page} onChange={setPage} />
              }
            />
          ),
        },
      ]}
      api={[
        {
          title: "TablePro",
          rows: [
            { prop: "...", description: "继承自 Table 全部 props", type: "TableProps" },
            { prop: "toolbar", description: "工具栏内容", type: "ReactNode" },
            { prop: "actions", description: "工具栏右侧操作", type: "ReactNode" },
            { prop: "footer", description: "底部 (一般放 Pagination)", type: "ReactNode" },
            { prop: "title", description: "工具栏标题", type: "ReactNode" },
          ],
        },
      ]}
    />
  );
};

/* ========================================================================
 * Image
 * ====================================================================== */

const SectionImage: React.FC<SectionCtx> = () => {
  const mkSvg = (h1: number, h2: number) =>
    `data:image/svg+xml;utf8,` +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'>
      <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='hsl(${h1}, 60%, 72%)'/>
        <stop offset='1' stop-color='hsl(${h2}, 55%, 58%)'/>
      </linearGradient></defs>
      <rect width='400' height='300' fill='url(%23g)'/>
    </svg>`
    );
  const images = [
    { src: mkSvg(210, 260), alt: "Image 1" },
    { src: mkSvg(30, 80), alt: "Image 2" },
    { src: mkSvg(140, 180), alt: "Image 3" },
    { src: mkSvg(340, 20), alt: "Image 4" },
    { src: mkSvg(90, 140), alt: "Image 5" },
    { src: mkSvg(280, 320), alt: "Image 6" },
  ];
  return (
    <DocPage
      whenToUse={<p>承载图片资源,带凹陷边框、悬浮预览、错误占位。</p>}
      demos={[
        {
          id: "basic",
          title: "基础",
          code: `<Image src={url} width={240} height={160} />`,
          render: () => (
            <Row gap={20}>
              <Image src={images[0].src} alt="demo" width={240} height={160} />
              <Image width={160} height={160} placeholder={<Icon name="image" size={28} />} />
              <Image src="https://broken.fake" width={160} height={160} />
            </Row>
          ),
        },
        {
          id: "grid",
          title: "图片组",
          span: 2,
          code: `<ImageGrid images={images} />`,
          render: () => <ImageGrid images={images} />,
        },
      ]}
      api={[
        {
          title: "Image",
          rows: [
            { prop: "src", description: "图片 URL", type: "string" },
            { prop: "width / height", description: "尺寸", type: "number | string" },
            { prop: "preview", description: "支持点击全屏预览", type: "boolean", default: "true" },
            { prop: "hover", description: "悬浮放大", type: "boolean", default: "true" },
            { prop: "placeholder", description: "占位/错误时内容", type: "ReactNode" },
          ],
        },
      ]}
    />
  );
};

/* ========================================================================
 * Calendar
 * ====================================================================== */

const SectionCalendar: React.FC<SectionCtx> = () => {
  const [date, setDate] = React.useState<Date>(new Date());
  return (
    <DocPage
      whenToUse={<p>查看与选择日期。</p>}
      demos={[
        {
          id: "basic",
          title: "基础用法",
          span: 2,
          code: `<Calendar value={date} onChange={setDate} />`,
          render: () => (
            <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
              <Calendar value={date} onChange={setDate} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 8 }}>
                <div className="showcase-label">已选日期</div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 18,
                    fontWeight: 600,
                    color: "var(--accent-ink)",
                  }}
                >
                  {date.toISOString().slice(0, 10)}
                </div>
                <div style={{ color: "var(--fg-muted)", fontSize: 13 }}>点击日期切换。</div>
              </div>
            </div>
          ),
        },
      ]}
      api={[
        {
          title: "Calendar",
          rows: [
            { prop: "value / defaultValue", description: "受控/初始日期", type: "Date" },
            { prop: "onChange", description: "选择回调", type: "(date: Date) => void" },
            { prop: "min / max", description: "可选范围", type: "Date" },
          ],
        },
      ]}
    />
  );
};

/* ========================================================================
 * Tabs
 * ====================================================================== */

const PadBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ padding: 16, color: "var(--fg-muted)" }}>{children}</div>
);

const SectionTabs: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={<p>同一层级的内容分组,通过标签切换。</p>}
    demos={[
      {
        id: "basic",
        title: "基础",
        span: 2,
        code: `<Tabs items={[
  { key: "general", label: "通用", content: <>...</> },
  { key: "account", label: "账户", content: <>...</> },
]} />`,
        render: () => (
          <Tabs
            items={[
              { key: "general", label: "通用", content: <PadBox>通用设置</PadBox> },
              { key: "account", label: "账户", content: <PadBox>账户设置</PadBox> },
              { key: "notify", label: "通知", content: <PadBox>通知设置</PadBox> },
              { key: "privacy", label: "隐私", content: <PadBox>隐私设置</PadBox> },
            ]}
          />
        ),
      },
      {
        id: "variant",
        title: "下划线变体",
        span: 2,
        code: `<Tabs variant="line" items={[...]} />`,
        render: () => (
          <Tabs
            variant="line"
            items={[
              { key: "overview", label: "总览" },
              { key: "activity", label: "活动" },
              { key: "members", label: "成员" },
              { key: "integrations", label: "集成" },
            ]}
          />
        ),
      },
    ]}
    api={[
      {
        title: "Tabs",
        rows: [
          { prop: "items", description: "标签数据", type: "TabItem[]", required: true },
          { prop: "activeKey / defaultActiveKey", description: "受控/初始激活", type: "string" },
          { prop: "onChange", description: "切换", type: "(key: string) => void" },
          { prop: "variant", description: "样式", type: `"line" | "pill" | "segmented"`, default: `"line"` },
        ],
      },
    ]}
  />
);

/* ========================================================================
 * Accordion
 * ====================================================================== */

const SectionAccordion: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={<p>纵向折叠面板,适合 FAQ、设置项分组等场景。</p>}
    demos={[
      {
        id: "basic",
        title: "基础",
        span: 2,
        code: `<Accordion items={[{ key, title, content }]} />`,
        render: () => (
          <Accordion
            items={[
              { key: "1", title: "如何开始使用 Lumina?", content: <div>引入 lumina 与样式表,立刻可用。</div> },
              { key: "2", title: "支持哪些主题?", content: <div>开箱浅 / 深 + 6 个强调色,可通过 Tweaks 实时调整。</div> },
              { key: "3", title: "是否兼容 Electron?", content: <div>已针对 macOS 与 Windows 提供 TitleBar 与 Sidebar 组件。</div> },
            ]}
          />
        ),
      },
      {
        id: "multiple",
        title: "多项展开",
        span: 2,
        description: "multiple 允许同时展开多个面板。",
        code: `<Accordion multiple defaultActiveKeys={["1", "2"]} ... />`,
        render: () => (
          <Accordion
            multiple
            defaultActiveKeys={["1", "2"]}
            items={[
              { key: "1", title: "面板 1", content: <div>内容 1</div> },
              { key: "2", title: "面板 2", content: <div>内容 2</div> },
              { key: "3", title: "面板 3", content: <div>内容 3</div> },
            ]}
          />
        ),
      },
    ]}
    api={[
      {
        title: "Accordion",
        rows: [
          { prop: "items", description: "面板数据", type: "AccordionItem[]", required: true },
          { prop: "multiple", description: "可同时展开多个", type: "boolean", default: "false" },
          { prop: "activeKeys / defaultActiveKeys", description: "受控/初始展开", type: "string[]" },
          { prop: "onChange", description: "展开变更", type: "(keys: string[]) => void" },
        ],
      },
    ]}
  />
);

/* ========================================================================
 * Modal
 * ====================================================================== */

const SectionModal: React.FC<SectionCtx> = () => {
  const [m, setM] = React.useState(false);
  const [confirm, setConfirm] = React.useState(false);
  return (
    <DocPage
      whenToUse={<p>需要用户处理事务,又不希望跳转页面以致打断工作流时,使用 Modal 在当前页面弹出。</p>}
      demos={[
        {
          id: "basic",
          title: "基础",
          code: `<Modal open={m} onClose={...} title="标题">...</Modal>`,
          render: () => (
            <>
              <Button onClick={() => setM(true)}>打开</Button>
              <Modal open={m} onClose={() => setM(false)} title="基础对话框" description="这是一个简单的弹窗示例">
                Modal 会渲染到 document.body,自动处理 Esc 关闭和点击遮罩关闭。
              </Modal>
            </>
          ),
        },
        {
          id: "confirm",
          title: "确认操作",
          description: "用 footer 自定义底部按钮。",
          code: `<Modal footer={<><Button>取消</Button><Button danger>删除</Button></>}>...`,
          render: () => (
            <>
              <Button variant="danger" icon="trash" onClick={() => setConfirm(true)}>
                删除项目
              </Button>
              <Modal
                open={confirm}
                onClose={() => setConfirm(false)}
                title="确认删除项目?"
                description="此操作不可恢复"
                footer={
                  <>
                    <Button variant="ghost" onClick={() => setConfirm(false)}>
                      取消
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        setConfirm(false);
                        toast.error("项目已删除");
                      }}
                    >
                      删除
                    </Button>
                  </>
                }
              >
                将永久删除该项目及其下属的所有资源。
              </Modal>
            </>
          ),
        },
      ]}
      api={[
        {
          title: "Modal",
          rows: [
            { prop: "open", description: "是否可见", type: "boolean", required: true },
            { prop: "onClose", description: "关闭回调", type: "() => void" },
            { prop: "title / description", description: "标题/说明", type: "ReactNode" },
            { prop: "footer", description: "底部内容", type: "ReactNode" },
            { prop: "width", description: "宽度", type: "number | string", default: "440" },
            { prop: "maskClosable", description: "点击遮罩关闭", type: "boolean", default: "true" },
            { prop: "escClosable", description: "Esc 键关闭", type: "boolean", default: "true" },
          ],
        },
      ]}
    />
  );
};

/* ========================================================================
 * Drawer
 * ====================================================================== */

const SectionDrawer: React.FC<SectionCtx> = () => {
  const [d, setD] = React.useState(false);
  return (
    <DocPage
      whenToUse={<p>从屏幕边缘滑出的抽屉,常用于详情查看、设置面板。</p>}
      demos={[
        {
          id: "basic",
          title: "基础",
          code: `<Drawer open={d} onClose={...} title="标题">...</Drawer>`,
          render: () => (
            <>
              <Button icon="layers" onClick={() => setD(true)}>
                打开抽屉
              </Button>
              <Drawer open={d} onClose={() => setD(false)} title="快速操作">
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <Field label="名称">
                    <Input placeholder="未命名项目" leadingIcon="edit" />
                  </Field>
                  <Field label="标签">
                    <Input placeholder="用逗号分隔" leadingIcon="filter" />
                  </Field>
                  <Switch label="公开访问" />
                  <Row gap={8}>
                    <Button variant="ghost" onClick={() => setD(false)}>
                      取消
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => {
                        setD(false);
                        toast.success("已创建");
                      }}
                    >
                      创建
                    </Button>
                  </Row>
                </div>
              </Drawer>
            </>
          ),
        },
      ]}
      api={[
        {
          title: "Drawer",
          rows: [
            { prop: "open", description: "可见", type: "boolean", required: true },
            { prop: "onClose", description: "关闭", type: "() => void" },
            { prop: "title", description: "标题", type: "ReactNode" },
            { prop: "placement", description: "出现位置", type: `"left" | "right" | "top" | "bottom"`, default: `"right"` },
            { prop: "size", description: "尺寸", type: "number | string", default: "380" },
          ],
        },
      ]}
    />
  );
};

/* ========================================================================
 * Toast
 * ====================================================================== */

const SectionToast: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={
      <>
        <p>非阻塞式的轻量反馈,用于操作完成后的提示。</p>
        <p>需要在应用根节点渲染 <code>&lt;ToastContainer /&gt;</code> 一次,然后通过 <code>toast.*</code> 调用。</p>
      </>
    }
    demos={[
      {
        id: "basic",
        title: "四种语义",
        code: `toast.info("已保存到草稿");
toast.success("操作完成");
toast.warn("请注意");
toast.error("发生错误");`,
        render: () => (
          <Row>
            <Button onClick={() => toast.info("已保存到草稿")}>Info</Button>
            <Button variant="primary" onClick={() => toast.success("上传成功 3 个文件")}>
              Success
            </Button>
            <Button onClick={() => toast.warn("连接不稳定")}>Warn</Button>
            <Button variant="danger" onClick={() => toast.error("同步失败")}>
              Error
            </Button>
          </Row>
        ),
      },
      {
        id: "title",
        title: "带标题",
        code: `toast.success("已上传 5 个文件", "上传完成");`,
        render: () => (
          <Button onClick={() => toast.success("已上传 5 个文件", "上传完成")}>
            带标题的提示
          </Button>
        ),
      },
    ]}
    api={[
      {
        title: "toast.*",
        rows: [
          { prop: "info(message, title?)", description: "信息提示", type: "(msg, title?) => id" },
          { prop: "success(message, title?)", description: "成功", type: "(msg, title?) => id" },
          { prop: "warn(message, title?)", description: "警告", type: "(msg, title?) => id" },
          { prop: "error(message, title?)", description: "错误", type: "(msg, title?) => id" },
          { prop: "show({ type, message, title?, duration? })", description: "完整 API", type: "(item) => id" },
          { prop: "dismiss(id)", description: "关闭一条", type: "(id: number) => void" },
          { prop: "clear()", description: "清空全部", type: "() => void" },
        ],
      },
      {
        title: "ToastContainer",
        rows: [
          { prop: "placement", description: "位置", type: `"top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center"`, default: `"top-right"` },
        ],
      },
    ]}
  />
);

/* ========================================================================
 * Tooltip
 * ====================================================================== */

const SectionTooltip: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={<p>对元素进行简短的辅助说明,鼠标悬浮触发。</p>}
    demos={[
      {
        id: "basic",
        title: "基础",
        code: `<Tooltip content="新建文档"><IconButton icon="plus" /></Tooltip>`,
        render: () => (
          <Row>
            <Tooltip content="新建文档">
              <IconButton icon="plus" />
            </Tooltip>
            <Tooltip content="收藏">
              <IconButton icon="star" />
            </Tooltip>
            <Tooltip content="发送 ⌘↵">
              <IconButton icon="send" />
            </Tooltip>
          </Row>
        ),
      },
      {
        id: "placement",
        title: "位置",
        code: `<Tooltip placement="bottom" content="..." />`,
        render: () => (
          <Row gap={32}>
            <Tooltip content="顶部" placement="top">
              <Button>Top</Button>
            </Tooltip>
            <Tooltip content="底部" placement="bottom">
              <Button>Bottom</Button>
            </Tooltip>
            <Tooltip content="左侧" placement="left">
              <Button>Left</Button>
            </Tooltip>
            <Tooltip content="右侧" placement="right">
              <Button>Right</Button>
            </Tooltip>
          </Row>
        ),
      },
    ]}
    api={[
      {
        title: "Tooltip",
        rows: [
          { prop: "content", description: "提示内容", type: "ReactNode", required: true },
          { prop: "placement", description: "位置", type: `"top" | "bottom" | "left" | "right"`, default: `"top"` },
          { prop: "delay", description: "悬浮延时 (ms)", type: "number", default: "250" },
          { prop: "disabled", description: "禁用提示", type: "boolean", default: "false" },
        ],
      },
    ]}
  />
);

/* ========================================================================
 * Popover
 * ====================================================================== */

const SectionPopover: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={<p>比 Tooltip 更丰富的浮层,可承载交互元素如按钮、表单。</p>}
    demos={[
      {
        id: "basic",
        title: "基础",
        code: `<Popover content={<>...</>}>
  <Button>触发</Button>
</Popover>`,
        render: () => (
          <Row gap={24}>
            <Popover
              content={
                <div style={{ padding: 12, minWidth: 200 }}>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>确认删除?</div>
                  <div style={{ color: "var(--fg-muted)", fontSize: 12, marginBottom: 10 }}>
                    删除后无法恢复。
                  </div>
                  <Row gap={6}>
                    <Button size="sm" variant="ghost">
                      取消
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => toast.error("已删除")}>
                      删除
                    </Button>
                  </Row>
                </div>
              }
            >
              <Button variant="danger" icon="trash">
                删除项目
              </Button>
            </Popover>
            <Popover
              placement="right"
              content={
                <div style={{ padding: 10, display: "flex", alignItems: "center", gap: 10, minWidth: 180 }}>
                  <Avatar alt="金" size="sm" />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>金伟</div>
                    <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>设计总监</div>
                  </div>
                </div>
              }
            >
              <Avatar alt="金" />
            </Popover>
          </Row>
        ),
      },
    ]}
    api={[
      {
        title: "Popover",
        rows: [
          { prop: "content", description: "浮层内容", type: "ReactNode", required: true },
          { prop: "placement", description: "位置", type: `"top" | "bottom" | "left" | "right"`, default: `"bottom"` },
          { prop: "trigger", description: "触发方式", type: `"click" | "hover"`, default: `"click"` },
          { prop: "open / defaultOpen / onOpenChange", description: "受控显示", type: "—" },
        ],
      },
    ]}
  />
);

/* ========================================================================
 * Alert
 * ====================================================================== */

const SectionAlert: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={<p>页面中嵌入的警告/提示,与 Toast 不同的是它常驻于页面上,需要用户感知。</p>}
    demos={[
      {
        id: "tones",
        title: "四种语义",
        span: 2,
        code: `<Alert tone="info" title="标题">内容</Alert>`,
        render: () => (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Alert tone="info" title="系统更新可用">
              新版本 v1.2.0 已发布,包含性能改进与 15 个修复。
            </Alert>
            <Alert tone="success" title="备份完成">
              所有文件已成功备份到云端。
            </Alert>
            <Alert tone="warning" title="存储空间不足" closable>
              剩余空间不足 10%。
            </Alert>
            <Alert tone="danger" title="连接失败">
              无法连接到服务器。
            </Alert>
          </div>
        ),
      },
      {
        id: "no-title",
        title: "无标题 / 可关闭",
        span: 2,
        code: `<Alert tone="info" closable>仅一行的简短提示</Alert>`,
        render: () => (
          <Alert tone="info" closable>
            仅一行的简短提示,默认垂直居中显示。
          </Alert>
        ),
      },
    ]}
    api={[
      {
        title: "Alert",
        rows: [
          { prop: "tone", description: "语气", type: `"info" | "success" | "warning" | "danger"`, default: `"info"` },
          { prop: "title", description: "标题", type: "ReactNode" },
          { prop: "icon", description: "自定义图标", type: "IconName" },
          { prop: "closable", description: "可关闭", type: "boolean", default: "false" },
          { prop: "onClose", description: "关闭回调", type: "() => void" },
        ],
      },
    ]}
  />
);

/* ========================================================================
 * Empty / Loading
 * ====================================================================== */

const SectionEmpty: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={<p>用于列表、表格、页面无数据时的占位。</p>}
    demos={[
      {
        id: "basic",
        title: "基础",
        span: 2,
        code: `<Empty title="暂无项目" description="创建一个开始吧" action={<Button>新建</Button>} />`,
        render: () => (
          <Empty
            icon={<Icon name="folder" size={32} />}
            title="暂无项目"
            description="创建一个开始吧"
            action={
              <Button variant="primary" icon="plus">
                新建
              </Button>
            }
          />
        ),
      },
      {
        id: "subtle",
        title: "Subtle 变体",
        description: "去掉凹陷图标框,用于嵌入已有卡片/对话框中。",
        span: 2,
        code: `<Empty variant="subtle" icon={<Icon name="search" size={28} />} title="未找到结果" />`,
        render: () => (
          <Empty
            variant="subtle"
            icon={<Icon name="search" size={28} />}
            title="未找到结果"
            description="换个关键词试试"
          />
        ),
      },
      {
        id: "size",
        title: "尺寸",
        description: "sm 适合列表内嵌,md 是默认,lg 用作整页占位。",
        span: 2,
        code: `<Empty size="sm" title="暂无数据" />
<Empty size="md" title="暂无数据" />
<Empty size="lg" title="暂无数据" />`,
        render: () => (
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", alignItems: "center" }}>
            <Empty size="sm" icon={<Icon name="file" size={20} />} title="sm" description="列表内嵌" />
            <Divider direction="vertical" style={{ height: "70%", alignSelf: "center" }} />
            <Empty size="md" icon={<Icon name="file" size={28} />} title="md" description="默认尺寸" />
            <Divider direction="vertical" style={{ height: "70%", alignSelf: "center" }} />
            <Empty size="lg" icon={<Icon name="file" size={36} />} title="lg" description="整页占位" />
          </div>
        ),
      },
    ]}
    api={[
      {
        title: "Empty",
        rows: [
          { prop: "title", description: "标题", type: "ReactNode", default: `"暂无内容"` },
          { prop: "description", description: "描述", type: "ReactNode" },
          { prop: "icon", description: "图标", type: "ReactNode" },
          { prop: "action", description: "底部操作", type: "ReactNode" },
          { prop: "size", description: "尺寸", type: `"sm" | "md" | "lg"`, default: `"md"` },
          { prop: "variant", description: "样式", type: `"default" | "subtle"`, default: `"default"` },
        ],
      },
    ]}
  />
);

/* ========================================================================
 * Spinner
 * ====================================================================== */

const SectionSpinner: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={<p>表示任务正在进行中,用户需要等待。</p>}
    demos={[
      {
        id: "basic",
        title: "基础",
        code: `<Spinner />
<Spinner size={28} />
<Spinner size={40} />`,
        render: () => (
          <Row gap={16}>
            <Spinner />
            <Spinner size={28} />
            <Spinner size={40} />
          </Row>
        ),
      },
      {
        id: "tone",
        title: "色调",
        code: `<Spinner tone="accent" />
<Spinner tone="success" />
<Spinner tone="warning" />
<Spinner tone="danger" />`,
        render: () => (
          <Row gap={16}>
            <Spinner tone="accent" size={24} />
            <Spinner tone="success" size={24} />
            <Spinner tone="warning" size={24} />
            <Spinner tone="danger" size={24} />
          </Row>
        ),
      },
      {
        id: "dots",
        title: "Dots 变体",
        code: `<Spinner variant="dots" />
<Spinner variant="dots" size={24} />
<Spinner variant="dots" size={32} />`,
        render: () => (
          <Row gap={16}>
            <Spinner variant="dots" size={16} />
            <Spinner variant="dots" size={24} />
            <Spinner variant="dots" size={32} />
          </Row>
        ),
      },
      {
        id: "label",
        title: "带文案",
        code: `<Spinner label="加载中…" />
<Spinner variant="dots" tone="accent" label="正在同步" />`,
        render: () => (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Spinner label="加载中…" />
            <Spinner tone="accent" label="正在处理,请稍候" />
            <Spinner variant="dots" tone="success" label="同步完成中" size={20} />
          </div>
        ),
      },
    ]}
    api={[
      {
        title: "Spinner",
        rows: [
          { prop: "size", description: "尺寸 (px)", type: "number", default: "20" },
          { prop: "tone", description: "色调", type: `"accent" | "success" | "warning" | "danger" | "current"`, default: `"accent"` },
          { prop: "variant", description: "样式", type: `"ring" | "dots"`, default: `"ring"` },
          { prop: "label", description: "文案", type: "ReactNode" },
        ],
      },
    ]}
  />
);

/* ========================================================================
 * Skeleton
 * ====================================================================== */

const SectionSkeleton: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={<p>在数据加载前展示页面结构的轮廓,减少视觉跳变。</p>}
    demos={[
      {
        id: "basic",
        title: "基础",
        code: `<Skeleton height={16} width="40%" />
<Skeleton height={12} />
<Skeleton height={12} width="80%" />`,
        render: () => (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 12 }}>
            <Skeleton height={16} width="40%" />
            <Skeleton height={12} />
            <Skeleton height={12} />
            <Skeleton height={12} width="80%" />
          </div>
        ),
      },
      {
        id: "circle",
        title: "组合:头像 + 文本",
        code: `<Skeleton circle height={48} width={48} />
<Skeleton height={12} width="50%" />`,
        render: () => (
          <Row gap={12}>
            <Skeleton height={48} width={48} circle />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <Skeleton height={12} width="50%" />
              <Skeleton height={10} width="80%" />
            </div>
          </Row>
        ),
      },
      {
        id: "animation",
        title: "动画",
        description: "wave 是闪光流动,pulse 是透明度脉动,none 是静态占位。",
        code: `<Skeleton animation="wave" />
<Skeleton animation="pulse" />
<Skeleton animation="none" />`,
        render: () => (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 4 }}>wave</div>
              <Skeleton animation="wave" height={14} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 4 }}>pulse</div>
              <Skeleton animation="pulse" height={14} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 4 }}>none</div>
              <Skeleton animation="none" height={14} />
            </div>
          </div>
        ),
      },
    ]}
    api={[
      {
        title: "Skeleton",
        rows: [
          { prop: "width", description: "宽度", type: "number | string", default: `"100%"` },
          { prop: "height", description: "高度", type: "number | string", default: "16" },
          { prop: "circle", description: "圆形", type: "boolean", default: "false" },
          { prop: "animation", description: "动画", type: `"wave" | "pulse" | "none"`, default: `"wave"` },
        ],
      },
    ]}
  />
);

/* ========================================================================
 * TitleBar
 * ====================================================================== */

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
          <div style={{ borderRadius: "var(--r-lg)", overflow: "hidden", boxShadow: "var(--neu-out)" }}>
            <TitleBar
              title="无标题文档"
              platform="mac"
              actions={
                <Row gap={6}>
                  <IconButton icon="search" size="sm" tip="搜索" />
                  <IconButton icon="sparkle" size="sm" tip="AI 助手" />
                  <IconButton icon="settings" size="sm" tip="设置" />
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
          <div style={{ borderRadius: "var(--r-lg)", overflow: "hidden", boxShadow: "var(--neu-out)" }}>
            <TitleBar
              title="无标题文档"
              platform="windows"
              actions={
                <Row gap={6}>
                  <IconButton icon="search" size="sm" tip="搜索" />
                  <IconButton icon="settings" size="sm" tip="设置" />
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

/* ========================================================================
 * WindowControls
 * ====================================================================== */

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

/* ========================================================================
 * Sidebar
 * ====================================================================== */

const SectionSidebar: React.FC<SectionCtx> = () => {
  const [active, setActive] = React.useState("projects");
  return (
    <DocPage
      whenToUse={<p>应用的主导航,沿屏幕左侧垂直排列。</p>}
      demos={[
        {
          id: "basic",
          title: "基础",
          span: 2,
          code: `<Sidebar items={[{ key, label, icon, badge }]} activeKey={active} onSelect={setActive} />`,
          render: () => (
            <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
              <div style={{ width: 220 }}>
                <Sidebar
                  items={[
                    { key: "inbox", label: "收件箱", icon: <Icon name="mail" size={14} />, badge: 4 },
                    { key: "starred", label: "星标", icon: <Icon name="star" size={14} /> },
                    { key: "projects", label: "项目", icon: <Icon name="folder" size={14} /> },
                    { key: "drafts", label: "草稿", icon: <Icon name="file" size={14} /> },
                    { key: "archive", label: "归档", icon: <Icon name="layers" size={14} /> },
                  ]}
                  activeKey={active}
                  onSelect={setActive}
                  header={<div style={{ fontWeight: 600, padding: "4px 8px" }}>工作台</div>}
                />
              </div>
              <Card style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>当前选中: {active}</div>
                <div style={{ color: "var(--fg-muted)", fontSize: 13, lineHeight: 1.7 }}>
                  Sidebar 使用凹陷选中 + 凸起悬停的层级关系。
                </div>
              </Card>
            </div>
          ),
        },
      ]}
      api={[
        {
          title: "Sidebar",
          rows: [
            { prop: "items", description: "导航项", type: "SidebarItem[]", required: true },
            { prop: "activeKey", description: "当前激活项", type: "string" },
            { prop: "onSelect", description: "选择回调", type: "(key: string) => void" },
            { prop: "collapsed", description: "折叠为图标", type: "boolean", default: "false" },
            { prop: "header / footer", description: "头/尾内容", type: "ReactNode" },
          ],
        },
        {
          title: "SidebarItem",
          rows: [
            { prop: "key", description: "唯一键", type: "string", required: true },
            { prop: "label", description: "文案", type: "ReactNode" },
            { prop: "icon", description: "前置图标", type: "ReactNode" },
            { prop: "badge", description: "尾部徽标", type: "ReactNode" },
          ],
        },
      ]}
    />
  );
};

/* ========================================================================
 * Sections registry
 * ====================================================================== */

export const SECTIONS: Record<SectionKey, SectionMeta> = {
  intro: {
    eyebrow: "OVERVIEW",
    title: "Lumina",
    desc: "为 Electron 应用定制的拟态风格 React 组件库。",
    Component: SectionIntro,
  },
  theme: {
    eyebrow: "FOUNDATION",
    title: "Theme 主题",
    desc: "ThemeProvider + useTheme,覆盖深浅色、强调色、密度、圆角、字体、阴影强度。",
    Component: SectionTheme,
  },
  // 通用
  button: {
    eyebrow: "GENERAL",
    title: "Button 按钮",
    desc: "标记一个操作命令,响应用户点击行为,触发相应业务逻辑。",
    Component: SectionButton,
  },
  icon: {
    eyebrow: "GENERAL",
    title: "Icon 图标",
    desc: "线性图标集,继承当前文字颜色,可调整尺寸与描边。",
    Component: SectionIcon,
  },
  // 表单
  input: {
    eyebrow: "DATA ENTRY",
    title: "Input 输入框",
    desc: "凹陷凹槽式输入域,支持前后置图标、错误态、禁用态。",
    Component: SectionInput,
  },
  switch: {
    eyebrow: "DATA ENTRY",
    title: "Switch 开关",
    desc: "二元状态切换器。",
    Component: SectionSwitch,
  },
  checkbox: {
    eyebrow: "DATA ENTRY",
    title: "Checkbox 复选框",
    desc: "在一组选项中进行多项选择,或独立切换某个开关项。",
    Component: SectionCheckbox,
  },
  radio: {
    eyebrow: "DATA ENTRY",
    title: "Radio 单选",
    desc: "在多个互斥选项中进行单项选择。",
    Component: SectionRadio,
  },
  slider: {
    eyebrow: "DATA ENTRY",
    title: "Slider 滑块",
    desc: "在连续数值区间内取值。",
    Component: SectionSlider,
  },
  select: {
    eyebrow: "DATA ENTRY",
    title: "Select 下拉选择",
    desc: "下拉选择,支持单/多选、搜索、分组、加载态。",
    Component: SectionSelect,
  },
  cascader: {
    eyebrow: "DATA ENTRY",
    title: "Cascader 级联选择",
    desc: "层级关联数据集合中的多级选择。",
    Component: SectionCascader,
  },
  // 数据展示
  card: {
    eyebrow: "DATA DISPLAY",
    title: "Card 卡片",
    desc: "信息分组容器,提供 raised / flat / sunken 三种视觉变体。",
    Component: SectionCard,
  },
  tag: {
    eyebrow: "DATA DISPLAY",
    title: "Tag 标签",
    desc: "标记关键词、状态或分类。",
    Component: SectionTag,
  },
  badge: {
    eyebrow: "DATA DISPLAY",
    title: "Badge 徽标数",
    desc: "右上角的小型计数或状态指示器。",
    Component: SectionBadge,
  },
  avatar: {
    eyebrow: "DATA DISPLAY",
    title: "Avatar 头像",
    desc: "用图像、首字母代表用户或事物。",
    Component: SectionAvatar,
  },
  divider: {
    eyebrow: "DATA DISPLAY",
    title: "Divider 分隔符",
    desc: "对内容进行分割。",
    Component: SectionDivider,
  },
  progress: {
    eyebrow: "DATA DISPLAY",
    title: "Progress 进度",
    desc: "条形进度 Progress 与环形进度 Ring。",
    Component: SectionProgress,
  },
  list: {
    eyebrow: "DATA DISPLAY",
    title: "List 列表",
    desc: "承载一组结构化的同质化数据。",
    Component: SectionList,
  },
  table: {
    eyebrow: "DATA DISPLAY",
    title: "Table 表格",
    desc: "结构化数据展示。",
    Component: SectionTable,
  },
  tablepro: {
    eyebrow: "DATA DISPLAY",
    title: "Table Pro",
    desc: "带工具栏 / 搜索 / 筛选 / 排序 / 多选 / 分页的全功能表格。",
    Component: SectionTablePro,
  },
  image: {
    eyebrow: "DATA DISPLAY",
    title: "Image 图片",
    desc: "凹陷外框包裹的图片容器,带预览、错误占位。",
    Component: SectionImage,
  },
  calendar: {
    eyebrow: "DATA DISPLAY",
    title: "Calendar 日历",
    desc: "查看与选择日期。",
    Component: SectionCalendar,
  },
  tabs: {
    eyebrow: "DATA DISPLAY",
    title: "Tabs 选项卡",
    desc: "同一层级的内容分组,通过标签切换。",
    Component: SectionTabs,
  },
  accordion: {
    eyebrow: "DATA DISPLAY",
    title: "Accordion 折叠面板",
    desc: "纵向折叠面板。",
    Component: SectionAccordion,
  },
  // 反馈
  modal: {
    eyebrow: "FEEDBACK",
    title: "Modal 对话框",
    desc: "在不离开当前页面的前提下处理事务。",
    Component: SectionModal,
  },
  drawer: {
    eyebrow: "FEEDBACK",
    title: "Drawer 抽屉",
    desc: "从屏幕边缘滑出的浮层。",
    Component: SectionDrawer,
  },
  toast: {
    eyebrow: "FEEDBACK",
    title: "Toast 通知",
    desc: "全局轻量提示,4 种语义。",
    Component: SectionToast,
  },
  tooltip: {
    eyebrow: "FEEDBACK",
    title: "Tooltip 文字提示",
    desc: "鼠标悬浮触发的简短说明。",
    Component: SectionTooltip,
  },
  popover: {
    eyebrow: "FEEDBACK",
    title: "Popover 气泡卡片",
    desc: "比 Tooltip 更丰富,可承载交互内容。",
    Component: SectionPopover,
  },
  alert: {
    eyebrow: "FEEDBACK",
    title: "Alert 警告提示",
    desc: "页面中嵌入的警告/提示。",
    Component: SectionAlert,
  },
  empty: {
    eyebrow: "FEEDBACK",
    title: "Empty 空状态",
    desc: "列表、页面或容器无数据时的占位。",
    Component: SectionEmpty,
  },
  spinner: {
    eyebrow: "FEEDBACK",
    title: "Spinner 加载",
    desc: "表示任务正在进行,提示用户等待。",
    Component: SectionSpinner,
  },
  skeleton: {
    eyebrow: "FEEDBACK",
    title: "Skeleton 骨架屏",
    desc: "数据加载前展示页面结构轮廓。",
    Component: SectionSkeleton,
  },
  // 平台
  titlebar: {
    eyebrow: "ELECTRON",
    title: "TitleBar 标题栏",
    desc: "Electron 应用窗口顶部的跨平台标题栏。",
    Component: SectionTitleBar,
  },
  windowcontrols: {
    eyebrow: "ELECTRON",
    title: "WindowControls 窗口控件",
    desc: "独立的窗口控件按钮组。",
    Component: SectionWindowControls,
  },
  sidebar: {
    eyebrow: "ELECTRON",
    title: "Sidebar 侧边栏",
    desc: "应用主导航,沿屏幕左侧垂直排列。",
    Component: SectionSidebar,
  },
};
