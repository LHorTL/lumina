# @fangxinyan/lumina · LLM Reference

> 拟态风格的 React 18 组件库,目标是 Electron 桌面应用。这份文档是**写给 AI 编程助手**读的单文件参考(也适合人工检索) —— 每个组件包含:导入、常见示例、完整 Props 表。示例源自 playground 的 demo,代码可直接复制运行。

- **包名**: `@fangxinyan/lumina`
- **版本**: `0.2.0`
- **React 最低版本**: 18
- **环境**: 带打包器的 React 工程(Vite / Next.js / Webpack / Remix / Electron + Vite 等)
- **零运行时依赖**: 只依赖 `react` / `react-dom` (peer deps)
- **发布仓库**: git+https://github.com/LHorTL/lumina.git

## 必读 · 全局约定

1. **安装**  
   `npm install @fangxinyan/lumina`
2. **引入样式**(任一即可):  
   ```tsx
   import "@fangxinyan/lumina/styles"; // 一次性引入全部组件样式
   ```
   或按组件单独引入(适合 tree-shake 到极限):  
   ```tsx
   import "@fangxinyan/lumina/tokens";         // 设计令牌 + 全局 reset
   import { Button } from "@fangxinyan/lumina"; // 会自动带上 Button.css
   ```
3. **TypeScript**: 所有 `XxxProps` 接口都是 `export`,可直接 `import { Button, type ButtonProps } from "@fangxinyan/lumina";`
4. **主题**: 用 `<ThemeProvider>` 包根;运行时可通过 `useTheme()` 改。六种强调色 (`rose / sky / coral / mint / violet / amber`) × 两种模式 (`light / dark` + `system`) × 三档密度 (`compact / comfortable / spacious`)。详见下方 Theme 小节。
5. **图标**: 所有接受 `icon / leadingIcon / trailingIcon` 的 prop 用字符串 `IconName`。完整列表见下方 Icon 小节。
6. **浮层组件**(Tooltip / Popover / Select / Cascader / ColorPicker / Modal / Drawer): 内部已 `createPortal` 到 `document.body` + 视口边界翻转,放在 `overflow: hidden` 的容器里也不会被裁。
7. **Electron 专属组件**: `TitleBar` / `WindowControls` / `Sidebar` / `AppShell` 提供 macOS / Windows 原生风格的标题栏与导航。

## 目录

- [Lumina](#lumina) — 为 Electron 应用定制的拟态风格 React 组件库。
- [Theme 主题](#theme-主题) — ThemeProvider + useTheme,覆盖深浅色、强调色、密度、圆角、字体、阴影强度。
- [Button 按钮](#button-按钮) — 标记一个操作命令,响应用户点击行为,触发相应业务逻辑。
- [Icon 图标](#icon-图标) — 线性图标集,继承当前文字颜色,可调整尺寸与描边。
- [Typography 排版](#typography-排版) — 标题、段落、文本、链接一体化排版组件,支持语义色、修饰、复制、编辑、省略。
- [Input 输入框](#input-输入框) — 凹陷凹槽式输入域,支持前后置图标、错误态、禁用态。
- [Switch 开关](#switch-开关) — 二元状态切换器。
- [Checkbox 复选框](#checkbox-复选框) — 在一组选项中进行多项选择,或独立切换某个开关项。
- [Radio 单选](#radio-单选) — 在多个互斥选项中进行单项选择。
- [Slider 滑块](#slider-滑块) — 在连续数值区间内取值。
- [Select 下拉选择](#select-下拉选择) — 下拉选择,支持单/多选、搜索、分组、加载态。
- [Cascader 级联选择](#cascader-级联选择) — 层级关联数据集合中的多级选择。
- [ColorPicker 颜色选择](#colorpicker-颜色选择) — 拟态风格的颜色选择器:HSV 色域、色相、hex 输入、预设调色板。
- [Card 卡片](#card-卡片) — 信息分组容器,提供 raised / flat / sunken 三种视觉变体。
- [Tag 标签](#tag-标签) — 标记关键词、状态或分类。
- [Badge 徽标数](#badge-徽标数) — 右上角的小型计数或状态指示器。
- [Avatar 头像](#avatar-头像) — 用图像、首字母代表用户或事物。
- [Divider 分隔符](#divider-分隔符) — 对内容进行分割。
- [Progress 进度](#progress-进度) — 条形进度 Progress 与环形进度 Ring。
- [List 列表](#list-列表) — 承载一组结构化的同质化数据。
- [Table 表格](#table-表格) — 结构化数据展示。
- [Table Pro](#table-pro) — 带工具栏 / 搜索 / 筛选 / 排序 / 多选 / 分页的全功能表格。
- [Image 图片](#image-图片) — 凹陷外框包裹的图片容器,带预览、错误占位。
- [Calendar 日历](#calendar-日历) — 查看与选择日期。
- [Pagination 分页](#pagination-分页) — 分页控件,支持快速跳转与每页条数切换。
- [Tabs 选项卡](#tabs-选项卡) — 同一层级的内容分组,通过标签切换。
- [Accordion 折叠面板](#accordion-折叠面板) — 纵向折叠面板。
- [Modal 对话框](#modal-对话框) — 在不离开当前页面的前提下处理事务。
- [Drawer 抽屉](#drawer-抽屉) — 从屏幕边缘滑出的浮层。
- [Toast 通知](#toast-通知) — 全局轻量提示,4 种语义。
- [Tooltip 文字提示](#tooltip-文字提示) — 鼠标悬浮触发的简短说明。
- [Popover 气泡卡片](#popover-气泡卡片) — 比 Tooltip 更丰富,可承载交互内容。
- [Alert 警告提示](#alert-警告提示) — 页面中嵌入的警告/提示。
- [Empty 空状态](#empty-空状态) — 列表、页面或容器无数据时的占位。
- [Spinner 加载](#spinner-加载) — 表示任务正在进行,提示用户等待。
- [Skeleton 骨架屏](#skeleton-骨架屏) — 数据加载前展示页面结构轮廓。
- [TitleBar 标题栏](#titlebar-标题栏) — Electron 应用窗口顶部的跨平台标题栏。
- [WindowControls 窗口控件](#windowcontrols-窗口控件) — 独立的窗口控件按钮组。
- [Sidebar 侧边栏](#sidebar-侧边栏) — 应用主导航,沿屏幕左侧垂直排列。

---

## Lumina

> 为 Electron 应用定制的拟态风格 React 组件库。


---

## Theme 主题

> ThemeProvider + useTheme,覆盖深浅色、强调色、密度、圆角、字体、阴影强度。

**导入**

```tsx
import { ThemeProvider, useTheme, applyTheme } from "@fangxinyan/lumina";
```

### 示例

#### 基础用法

用 ThemeProvider 包住应用,所有 lumina 组件自动生效。

```tsx
import { ThemeProvider } from "lumina";

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
}
```

#### useTheme Hook

子组件随时读/改主题。下面这块被独立的 ThemeProvider 包裹,不影响全局。

```tsx
const t = useTheme();
t.toggleMode();              // 切换深浅色
t.setAccent("coral");        // 换强调色
t.setDensity("compact");     // 改密度
t.update({ radius: 14 });    // 一次改多个
t.reset();                   // 重置到 props 初值
```

#### 预设强调色

内置 6 种拟态强调色,点击切换。

```tsx
<ThemeProvider accent="sky" />
<ThemeProvider accent="coral" />
<ThemeProvider accent="mint" />
<ThemeProvider accent="violet" />
<ThemeProvider accent="amber" />
<ThemeProvider accent="rose" />
```

#### 自定义强调色

传任意 CSS 颜色(oklch / hex / rgb)。只给主色,ink / soft / glow 会用 color-mix 自动推导。

```tsx
// 只给主色,其他自动推导
<ThemeProvider accent="oklch(70% 0.18 180)" />
<ThemeProvider accent={{ accent: "#00b894" }} />

// 或给完整调色板
<ThemeProvider accent={{
  accent: "oklch(70% 0.18 180)",
  ink:    "oklch(40% 0.14 180)",
  soft:   "oklch(93% 0.04 180)",
  glow:   "oklch(70% 0.18 180 / 0.35)",
}} />
```

#### 作用域嵌套

target="scope" 只作用于子树,可以层层嵌套。

```tsx
<ThemeProvider accent="sky">
  <Page />

  <ThemeProvider target="scope" accent="coral" as="section">
    <PromoCard />

    <ThemeProvider target="scope" accent="mint" as="div">
      <InnerCallout />
    </ThemeProvider>
  </ThemeProvider>
</ThemeProvider>
```

#### 覆盖任意 token

tokens prop 可以改 tokens.css 里任何变量 —— 键名可省略 --。

```tsx
<ThemeProvider
  tokens={{
    bg: "#f5f5f7",           // 等价 --bg
    "--bg-sunken": "#e8e8ed",
    "shadow-dark": "rgba(0,0,0,0.18)",
    "--font-display": '"Inter", sans-serif',
  }}
/>
```

#### 命令式 API

脱离 React 直接给元素套主题 —— 适合 vanilla JS 或 SSR 早期水合。

```tsx
import { applyTheme } from "lumina";

applyTheme(document.documentElement, {
  mode: "dark",
  accent: "violet",
  radius: 16,
});
```

### API

**ThemeProvider Props**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| mode | `"light" | "dark" | "system"` | `"light"` | 深浅色模式 |
| accent | `AccentKey | CustomAccentInput` | `"sky"` | 强调色,预设或自定义 |
| density | `"compact" | "comfortable" | "spacious"` | `"comfortable"` | 密度 |
| intensity | `number` | `5` | 阴影强度 1-10 |
| radius | `number` | `20` | 圆角基准 px |
| font | `FontConfig` | `"sf"` | 字体预设或 CSS 栈 |
| tokens | `Record<string, string>` | — | 任意 CSS 变量覆写 |
| target | `"root" | "scope"` | `"root"` | 应用到根还是局部 |
| as | `keyof JSX.IntrinsicElements` | `"div"` | scope 模式的元素标签 |
| storageKey | `string` | — | localStorage 持久化 key |
| onChange | `(value: ThemeValue) => void` | — | 主题值变更回调 |


**useTheme() → ThemeValue**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| mode | `ThemeMode` | — | 请求的模式(保留 system) |
| resolvedMode | `"light" | "dark"` | — | 解析后的具体模式 |
| accent | `AccentKey | "custom"` | — | 预设 key 或 "custom" |
| accentPalette | `AccentPalette` | — | 当前完整调色板 |
| density / intensity / radius / font / tokens | `-` | — | 当前各维度状态 |
| setMode(m) | `(m: ThemeMode) => void` | — | 切换模式 |
| toggleMode() | `() => void` | — | light ⇄ dark 切换 |
| setAccent(a) | `(a: AccentKey | CustomAccentInput) => void` | — | 切换强调色 |
| setDensity / setIntensity / setRadius / setFont / setTokens | `-` | — | 对应字段的 setter |
| update(cfg) | `(cfg: Partial<ThemeConfig>) => void` | — | 浅合并多字段 |
| reset() | `() => void` | — | 重置到初始 props |



---

## Button 按钮

> 标记一个操作命令,响应用户点击行为,触发相应业务逻辑。

**导入**

```tsx
import { Button, IconButton, Segmented } from "@fangxinyan/lumina";
```

### 示例

#### 基础按钮

四种风格:主要、默认、幽灵、危险。

```tsx
<Button variant="primary">主按钮</Button>
<Button>默认按钮</Button>
<Button variant="ghost">幽灵按钮</Button>
<Button variant="danger">删除</Button>
```

#### 图标按钮

icon 在前,trailingIcon 在后。

```tsx
<Button variant="primary" icon="sparkle">新建</Button>
<Button icon="download">下载</Button>
<Button trailingIcon="arrowRight">下一步</Button>
```

#### 加载与禁用

loading 期间禁用并显示 spinner。

```tsx
<Button loading={loading} variant="primary" onClick={...}>点我加载</Button>
<Button disabled>已禁用</Button>
```

#### 尺寸

提供 sm / md / lg 三种高度。

```tsx
<Button size="sm">Small</Button>
<Button>Medium</Button>
<Button size="lg">Large</Button>
```

#### 块级按钮

block 让按钮撑满容器宽度,常用于底部主操作或表单提交。

```tsx
<Button block variant="primary" icon="send">提交表单</Button>
<Button block>取消</Button>
```

#### 纯图标按钮

IconButton 是只含图标的方形按钮,常配合 tip 使用。

```tsx
<IconButton icon="heart" tip="收藏" />
<IconButton icon="bell" tip="通知" />
<IconButton icon="settings" tip="设置" />
```

#### 分段控制器

互斥多选项切换。

```tsx
<Segmented
  options={[
    { value: "grid", label: "网格" },
    { value: "list", label: "列表" },
    { value: "card", label: "卡片" },
  ]}
  defaultValue="grid"
/>
```

### API

**Button**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| variant | `"default" | "primary" | "ghost" | "danger"` | `"default"` | 按钮风格 |
| size | `"sm" | "md" | "lg"` | `"md"` | 按钮尺寸 |
| icon | `IconName` | — | 前置图标 |
| trailingIcon | `IconName` | — | 后置图标 |
| loading | `boolean` | `false` | 加载态 |
| block | `boolean` | `false` | 撑满父容器宽度 |
| disabled | `boolean` | `false` | 禁用 |
| onClick | `(e: MouseEvent) => void` | — | 点击回调 |


**IconButton**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| icon \* | `IconName` | — | 图标名 |
| tip | `string` | — | 悬浮提示 |
| size / variant | `—` | — | 继承自 Button |


**Segmented**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| options \* | `{ value, label, disabled? }[]` | — | 选项数组 |
| value / defaultValue | `T` | — | 受控/初始选中值 |
| onChange | `(value: T) => void` | — | 切换回调 |



---

## Icon 图标

> 线性图标集,继承当前文字颜色,可调整尺寸与描边。

**导入**

```tsx
import { Icon } from "@fangxinyan/lumina";
```

### 示例

#### 基础用法

通过 name 指定图标,size 控制尺寸,stroke 控制描边粗细。

```tsx
<Icon name="search" size={16} />
<Icon name="heart" size={20} stroke={1.5} />
```

### API

**Icon**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| name \* | `IconName` | — | 图标名 |
| size | `number` | `16` | 尺寸 (px) |
| stroke | `number` | `2` | 描边粗细 |



---

## Typography 排版

> 标题、段落、文本、链接一体化排版组件,支持语义色、修饰、复制、编辑、省略。

**导入**

```tsx
import { Typography } from "@fangxinyan/lumina";
```

### 示例

#### 基础组合

```tsx
<Typography>
  <Typography.Title level={2}>Lumina 排版</Typography.Title>
  <Typography.Paragraph>...</Typography.Paragraph>
  <Typography.Text type="secondary">次要文字</Typography.Text>
  <Typography.Link href="..." external>外部链接</Typography.Link>
</Typography>
```

#### 标题层级

```tsx
<Typography.Title level={1..5}>...</Typography.Title>
```

#### 语义色

```tsx
<Typography.Text type="success">...</Typography.Text>
```

#### 文字修饰

```tsx
<Typography.Text strong>...</Typography.Text>
```

#### 可复制

点击右侧图标复制文本，自动切成 ✓ 状态并 2.4 秒后复位。

```tsx
<Typography.Text copyable>...</Typography.Text>
```

#### 可编辑

点击图标或文本进入编辑状态，Enter 保存、Esc 取消。

```tsx
<Typography.Text editable={{ onChange, triggerType: ["icon", "text"] }}>{value}</Typography.Text>
```

#### 省略截断

多行截断并支持「展开」。

```tsx
<Typography.Paragraph ellipsis={{ rows: 2, expandable: true }}>{long}</Typography.Paragraph>
```

#### 链接

```tsx
<Typography.Link href="..." external>...</Typography.Link>
```

### API

**Typography.Title**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| level | `1 | 2 | 3 | 4 | 5` | `1` | 标题级别 |


**通用 Props (Title / Text / Paragraph / Link)**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| type | `"secondary" | "success" | "warning" | "danger"` | — | 语义色 |
| disabled | `boolean` | `false` | 禁用态 |
| mark / code / keyboard / underline / delete / strong / italic | `boolean` | `false` | 文字修饰 |
| copyable | `boolean | CopyableConfig` | — | 显示复制按钮 |
| editable | `boolean | EditableConfig` | — | 显示编辑按钮 |
| ellipsis | `boolean | EllipsisConfig` | — | 截断省略 |


**Typography.Link**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| href | `string` | — | 链接地址 |
| target / rel | `string` | — | 原生锚点属性 |
| external | `boolean` | `false` | 追加外链箭头 |



---

## Input 输入框

> 凹陷凹槽式输入域,支持前后置图标、错误态、禁用态。

**导入**

```tsx
import { Input, Textarea } from "@fangxinyan/lumina";
```

### 示例

#### 基础用法

```tsx
const [v, setV] = useState("");
<Input placeholder="输入用户名" value={v} onChange={setV} leadingIcon="user" />
```

#### 前后置图标

leadingIcon / trailingIcon。

```tsx
<Input placeholder="搜索..." leadingIcon="search" />
```

#### 密码切换

trailingIcon 可点击切换密码可见性。

```tsx
<Input
  type={showPw ? "text" : "password"}
  trailingIcon={showPw ? "eyeOff" : "eye"}
  onTrailingIconClick={() => setShowPw(s => !s)}
/>
```

#### 校验错误

invalid 触发红色凹槽。

```tsx
<Input invalid hint="请输入有效的邮箱" />
```

#### 可清除

allowClear 在值非空时显示 × 按钮,点击即清空。

```tsx
<Input value={v} onChange={setV} allowClear placeholder="输入后右侧会出现 ×" />
```

#### 前缀 / 后缀

prefix/suffix 在输入框内部以静态文本形式呈现,常用于单位或协议。

```tsx
<Input prefix="https://" suffix=".com" defaultValue="lumina" />
<Input prefix="¥" suffix="元" defaultValue="1280" />
```

#### 字数统计 + maxLength

showCount 显示当前字数,配合 maxLength 显示 N / max。

```tsx
<Input
  value={v}
  onChange={setV}
  maxLength={20}
  showCount
  placeholder="最多输入 20 个字"
/>
```

#### 多行文本

Textarea 与 Input 共享同款凹槽,也支持 allowClear / maxLength / showCount。

```tsx
<Textarea
  placeholder="..."
  value={msg}
  onChange={setMsg}
  allowClear
  maxLength={300}
  showCount
/>
```

### API

**Input**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| value / defaultValue | `string` | — | 受控值 / 初值 |
| onChange | `(value: string, e) => void` | — | 变更回调 |
| placeholder | `string` | — | 占位文案 |
| leadingIcon / trailingIcon | `IconName` | — | 前/后置图标 |
| prefix | `ReactNode` | — | 左侧内嵌内容(在 leadingIcon 之后) |
| suffix | `ReactNode` | — | 右侧内嵌内容(在 trailingIcon 之前) |
| allowClear | `boolean` | `false` | 显示内置的清除按钮 |
| maxLength | `number` | — | 最大字符数,透传至原生 input |
| showCount | `boolean` | `false` | 在输入框下方显示字数统计 |
| size | `"sm" | "md" | "lg"` | `"md"` | 尺寸 |
| invalid | `boolean` | `false` | 错误态 |
| disabled | `boolean` | `false` | 禁用 |


**Textarea**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| value / defaultValue | `string` | — | 受控值 / 初值 |
| onChange | `(value: string, e) => void` | — | 变更回调 |
| allowClear | `boolean` | `false` | 右上角显示清除按钮 |
| maxLength | `number` | — | 最大字符数 |
| showCount | `boolean` | `false` | 显示字数统计 |
| invalid | `boolean` | `false` | 错误态 |



---

## Switch 开关

> 二元状态切换器。

**导入**

```tsx
import { Switch } from "@fangxinyan/lumina";
```

### 示例

#### 基础用法

```tsx
<Switch checked={v} onChange={setV} label="开启通知" />
```

#### 尺寸

提供 sm / md 两档。

```tsx
<Switch size="sm" defaultChecked />
<Switch defaultChecked />
```

#### 禁用

```tsx
<Switch disabled label="不可用" />
<Switch disabled defaultChecked label="禁用且开启" />
```

#### 轨道内文本

checkedChildren / unCheckedChildren 在轨道内显示简短文字(如 ON/OFF)。

```tsx
<Switch defaultChecked checkedChildren="ON" unCheckedChildren="OFF" />
<Switch defaultChecked checkedChildren="1" unCheckedChildren="0" />
```

### API

**Switch**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| checked / defaultChecked | `boolean` | — | 受控/初始 |
| onChange | `(checked: boolean) => void` | — | 状态变更 |
| label | `ReactNode` | — | 右侧文案 |
| checkedChildren | `ReactNode` | — | 轨道内选中状态文本/图标 |
| unCheckedChildren | `ReactNode` | — | 轨道内未选中状态文本/图标 |
| size | `"sm" | "md"` | `"md"` | 尺寸 |
| disabled | `boolean` | `false` | 禁用 |



---

## Checkbox 复选框

> 在一组选项中进行多项选择,或独立切换某个开关项。

**导入**

```tsx
import { Checkbox } from "@fangxinyan/lumina";
```

### 示例

#### 基础用法

```tsx
<Checkbox checked={v} onChange={setV} label="同意协议" />
```

#### 全选/半选

indeterminate 用来表示部分选中。

```tsx
<Checkbox indeterminate={some} checked={all} onChange={...} label="全选" />
```

### API

**Checkbox**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| checked / defaultChecked | `boolean` | — | 受控/初始 |
| indeterminate | `boolean` | `false` | 半选态 |
| onChange | `(checked: boolean) => void` | — | 变更 |
| label | `ReactNode` | — | 右侧文案 |
| disabled | `boolean` | `false` | 禁用 |



---

## Radio 单选

> 在多个互斥选项中进行单项选择。

**导入**

```tsx
import { RadioGroup } from "@fangxinyan/lumina";
```

### 示例

#### 基础用法

```tsx
<RadioGroup value={v} onChange={setV} options={[
  { value: "daily", label: "每日" },
  { value: "weekly", label: "每周" },
]} />
```

#### 水平排列

direction='horizontal'。

```tsx
<RadioGroup direction="horizontal" ... />
```

### API

**RadioGroup**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| options \* | `{ value, label, disabled? }[]` | — | 选项数组 |
| value / defaultValue | `T` | — | 受控/初始 |
| onChange | `(value: T) => void` | — | 变更 |
| direction | `"vertical" | "horizontal"` | `"vertical"` | 方向 |



---

## Slider 滑块

> 在连续数值区间内取值。

**导入**

```tsx
import { Slider } from "@fangxinyan/lumina";
```

### 示例

#### 基础用法

```tsx
<Slider value={v} onChange={setV} showValue />
```

#### 步进 / 范围

min/max/step 控制取值范围与步进。

```tsx
<Slider min={0} max={10} step={1} defaultValue={5} showValue />
```

#### 色调

```tsx
<Slider tone="success" defaultValue={70} />
<Slider tone="warning" defaultValue={50} />
<Slider tone="danger" defaultValue={88} />
```

#### 双滑块区间

range 模式下 value / onChange 采用 [min, max] 元组。

```tsx
const [v, setV] = useState<[number, number]>([20, 70]);
<Slider range value={v} onChange={setV} showValue />
```

#### 刻度标记

marks 提供可点击刻度,点击即可跳到该值。

```tsx
<Slider
  defaultValue={37}
  marks={{ 0: "0°C", 26: "冷", 37: "正常", 100: "100°C" }}
/>
```

### API

**Slider**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| value / defaultValue | `number | [number, number]` | — | 受控/初始;range 模式下为 [number, number] |
| onChange | `(value) => void` | — | 变更回调,range 模式返回元组 |
| min / max / step | `number` | — | 区间与步进 |
| range | `boolean` | `false` | 是否为双滑块区间模式 |
| marks | `Record<number, ReactNode>` | — | 刻度,点击可跳到对应值 |
| tone | `"accent" | "success" | "warning" | "danger"` | `"accent"` | 色调 |
| showValue | `boolean` | `false` | 显示数值 |
| disabled | `boolean` | `false` | 禁用 |



---

## Select 下拉选择

> 下拉选择,支持单/多选、搜索、分组、加载态。

**导入**

```tsx
import { Select } from "@fangxinyan/lumina";
```

### 示例

#### 单选

```tsx
<Select value={lang} onChange={setLang} options={[
  { value: "zh", label: "简体中文" },
  { value: "en", label: "English" },
]} />
```

#### 多选

multiple + Tag 形式呈现已选项。

```tsx
<Select multiple clearable value={tags} onChange={setTags} options={...} />
```

#### 搜索过滤

searchable + clearable + 选项 icon/description。

```tsx
<Select searchable clearable
  options={[{ value, label, icon, description }]}
/>
```

#### 分组

options 接受 { label, options } 表示分组。

```tsx
options={[
  { label: "前端", options: [...] },
  { label: "后端", options: [...] },
]}
```

#### 加载态

loading 时显示 spinner,emptyContent 自定义空态。

```tsx
<Select searchable loading={loading} options={asyncOpts} />
```

#### 尺寸 / 状态

```tsx
<Select size="sm" /> <Select /> <Select size="lg" />
<Select invalid /> <Select disabled />
```

### API

**Select**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| options \* | `SelectItem<T>[]` | — | 选项,可含 { label, options } 分组 |
| value / defaultValue | `T | T[]` | — | 受控/初始 |
| onChange | `(value) => void` | — | 变更 |
| multiple | `boolean` | `false` | 多选 |
| maxTagCount | `number` | — | 多选时显示的标签数(超出折叠 +N) |
| searchable | `boolean` | `false` | 可搜索 |
| filterOption | `(input, option) => boolean` | — | 自定义过滤 |
| clearable | `boolean` | `false` | 可清除 |
| loading | `boolean` | `false` | 加载态 |
| emptyContent | `ReactNode` | — | 空态文案 |
| size | `"sm" | "md" | "lg"` | `"md"` | 尺寸 |
| invalid | `boolean` | `false` | 错误态 |
| disabled | `boolean` | `false` | 禁用 |


**SelectOption**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| value \* | `T` | — | 值 |
| label | `ReactNode` | — | 显示 |
| icon | `IconName` | — | 前置图标 |
| description | `ReactNode` | — | 次要描述 |
| disabled | `boolean` | `false` | 禁用项 |



---

## Cascader 级联选择

> 层级关联数据集合中的多级选择。

**导入**

```tsx
import { Cascader } from "@fangxinyan/lumina";
```

### 示例

#### 基础用法

```tsx
<Cascader options={regions} value={addr} onChange={setAddr} />
```

### API

**Cascader**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| options \* | `CascaderOption[]` | — | 层级选项树 |
| value / defaultValue | `string[]` | — | 受控/初始路径 |
| onChange | `(path: string[]) => void` | — | 选择叶子时触发 |
| placeholder | `string` | — | 占位文案 |
| disabled | `boolean` | `false` | 禁用 |



---

## ColorPicker 颜色选择

> 拟态风格的颜色选择器:HSV 色域、色相、hex 输入、预设调色板。

**导入**

```tsx
import { ColorPicker } from "@fangxinyan/lumina";
```

### 示例

#### 基础用法

非受控用法,点击色块弹出面板。

```tsx
<ColorPicker defaultValue="#ff6b6b" onChange={setColor} />
```

#### 受控

实时同步 value,失焦 / 拖拽结束时再调用 onChangeComplete。

```tsx
<ColorPicker value={color} onChange={setColor} showText />
```

#### 尺寸

```tsx
<ColorPicker size="sm" />
<ColorPicker />
<ColorPicker size="lg" />
```

#### 禁用

```tsx
<ColorPicker disabled defaultValue="#868e96" />
```

#### 自定义预设

presets 传入十六进制数组,面板底部会渲染一排色块。

```tsx
<ColorPicker
  presets={["#ff6b6b", "#ffd43b", "#51cf66", "#339af0", "#845ef7"]}
/>
```

#### 自定义触发器

将 children 作为触发器;色块容器会继承传入的交互元素。

```tsx
<ColorPicker value={brand} onChange={setBrand}>
  <Button icon="palette">品牌色 · {brand}</Button>
</ColorPicker>
```

### API

**ColorPicker**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| value / defaultValue | `string` | `"#845ef7"` | 十六进制颜色 |
| onChange | `(hex: string) => void` | — | 每次变化触发(拖拽 / 输入 / 预设点击) |
| onChangeComplete | `(hex: string) => void` | — | 拖拽/输入结束触发 |
| size | `"sm" | "md" | "lg"` | `"md"` | 触发器尺寸 |
| placement | `"top" | "bottom" | "left" | "right"` | `"bottom"` | 面板位置 |
| presets | `string[]` | — | 预设色数组 |
| showText | `boolean` | `false` | 触发器右侧显示 hex |
| disabled | `boolean` | `false` | 禁用 |
| open / defaultOpen / onOpenChange | `—` | — | 受控面板显隐 |
| children | `ReactNode` | — | 自定义触发器 |



---

## Card 卡片

> 信息分组容器,提供 raised / flat / sunken 三种视觉变体。

**导入**

```tsx
import { Card, Panel } from "@fangxinyan/lumina";
```

### 示例

#### 三种变体

raised(默认凸起)、flat(扁平)、sunken(凹陷)。

```tsx
<Card>raised</Card>
<Card variant="flat">flat</Card>
<Card variant="sunken">sunken</Card>
```

#### 悬浮抬起

hoverable 在鼠标悬浮时轻微上移并加强阴影,适合可点击的卡片列表。

```tsx
<Card hoverable>可点击卡片</Card>
```

#### Panel

带标题、描述、操作区。

```tsx
<Panel title="月度营收" description="2026 年 4 月" actions={...}>
  ¥ 12,480
</Panel>
```

#### Panel 带操作

```tsx
<Panel title="..." actions={<Button size="sm" icon="plus">邀请</Button>}>...</Panel>
```

### API

**Card**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| variant | `"raised" | "flat" | "sunken"` | `"raised"` | 视觉变体 |
| padding | `"none" | "sm" | "md" | "lg"` | `"md"` | 内边距 |
| hoverable | `boolean` | `false` | 悬浮时抬起 |


**Panel**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| title | `ReactNode` | — | 标题 |
| description | `ReactNode` | — | 副标题 |
| actions | `ReactNode` | — | 右上操作区 |



---

## Tag 标签

> 标记关键词、状态或分类。

**导入**

```tsx
import { Tag } from "@fangxinyan/lumina";
```

### 示例

#### 语气

```tsx
<Tag>Default</Tag>
<Tag tone="accent">Accent</Tag>
<Tag tone="success">Success</Tag>
```

#### 实心

```tsx
<Tag tone="accent" solid>Solid</Tag>
```

#### 圆点状态

dot 渲染前置色块。

```tsx
<Tag tone="success" dot>在线</Tag>
```

#### 前置图标

icon 使用内置 Icon 组件,颜色随语气自动适配。

```tsx
<Tag tone="success" icon="check2">已完成</Tag>
<Tag tone="info" icon="star">推荐</Tag>
```

#### 无边框

bordered={false} 去除 flat 阴影,只保留文本色。

```tsx
<Tag bordered={false}>Default</Tag>
<Tag tone="accent" bordered={false}>Accent</Tag>
```

#### 可移除

removable + onRemove 实现关闭按钮。

```tsx
<Tag removable onRemove={() => remove(t.id)}>{t.label}</Tag>
```

### API

**Tag**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| tone | `"neutral" | "accent" | "info" | "success" | "warning" | "danger"` | `"neutral"` | 色调 |
| solid | `boolean` | `false` | 实心填充 |
| dot | `boolean` | `false` | 前置圆点 |
| icon | `IconName` | — | 前置图标 |
| bordered | `boolean` | `true` | 是否显示外框 flat 阴影 |
| removable | `boolean` | `false` | 显示 × |
| onRemove | `() => void` | — | 关闭回调 |



---

## Badge 徽标数

> 右上角的小型计数或状态指示器。

**导入**

```tsx
import { Badge } from "@fangxinyan/lumina";
```

### 示例

#### 数字徽标

```tsx
<Badge count={3}><IconButton icon="bell" /></Badge>
<Badge count={128} max={99}><IconButton icon="mail" /></Badge>
```

#### 圆点

dot 模式不显示数字,只是状态指示。

```tsx
<Badge dot><IconButton icon="user" /></Badge>
```

### API

**Badge**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| count | `number` | — | 显示数字 |
| dot | `boolean` | `false` | 圆点模式 |
| max | `number` | `99` | 超过显示 max+ |
| tone | `"neutral" | "accent" | ...` | `"danger"` | 色调 |



---

## Avatar 头像

> 用图像、首字母代表用户或事物。

**导入**

```tsx
import { Avatar } from "@fangxinyan/lumina";
```

### 示例

#### 基础

通过 alt 自动生成首字母。

```tsx
<Avatar alt="金伟" />
<Avatar alt="陆" size="lg" />
```

#### 方形头像

shape="square" 使用圆角方形,尺寸变化时圆角跟随变化。

```tsx
<Avatar alt="金" shape="square" />
<Avatar alt="陆" shape="square" size="lg" />
```

#### 状态

在右下角显示状态点。

```tsx
<Avatar alt="金" status="online" />
<Avatar alt="陆" status="busy" />
```

### API

**Avatar**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| src | `string` | — | 图片 URL |
| alt | `string` | — | 替代文本/首字母来源 |
| initials | `string` | — | 自定义首字母 |
| size | `number | "sm" | "md" | "lg" | "xl"` | `"md"` | 尺寸 |
| shape | `"circle" | "square"` | `"circle"` | 形状 |
| status | `"online" | "busy" | "away" | "offline"` | — | 状态点 |



---

## Divider 分隔符

> 对内容进行分割。

**导入**

```tsx
import { Divider } from "@fangxinyan/lumina";
```

### 示例

#### 水平分隔

```tsx
<Divider />
```

#### 带文字

```tsx
<Divider label="分割标题" />
```

#### 文字位置

orientation 控制文字在线上的位置。

```tsx
<Divider label="左对齐" orientation="left" />
<Divider label="居中" orientation="center" />
<Divider label="右对齐" orientation="right" />
```

#### 虚线

dashed 切换为虚线样式,也适用于带文字或垂直方向。

```tsx
<Divider dashed />
<Divider dashed label="虚线带文字" />
<Row>
  <span>左</span>
  <Divider direction="vertical" dashed />
  <span>右</span>
</Row>
```

#### 垂直分隔

```tsx
<Divider direction="vertical" />
```

### API

**Divider**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| direction | `"horizontal" | "vertical"` | `"horizontal"` | 方向 |
| label | `ReactNode` | — | 中部文字 |
| orientation | `"left" | "center" | "right"` | `"center"` | 文字位置(仅水平) |
| dashed | `boolean` | `false` | 虚线样式 |
| sunken | `boolean` | `false` | 凹陷凹槽样式 |



---

## Progress 进度

> 条形进度 Progress 与环形进度 Ring。

**导入**

```tsx
import { Progress, Ring } from "@fangxinyan/lumina";
```

### 示例

#### 条形进度

```tsx
<Progress value={v} label="下载中" showValue />
```

#### 尺寸

```tsx
<Progress size="sm" value={60} />
<Progress value={60} />
<Progress size="lg" value={60} />
```

#### 环形进度

```tsx
<Ring value={65} />
<Ring value={90} tone="success" size={80}><strong>90%</strong></Ring>
```

### API

**Progress**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| value \* | `number` | — | 0–max 之间 |
| max | `number` | `100` | 最大值 |
| tone | `"accent" | "success" | "warning" | "danger"` | `"accent"` | 色调 |
| size | `"sm" | "md" | "lg"` | `"md"` | 尺寸 |
| label | `ReactNode` | — | 顶部文案 |
| showValue | `boolean` | `false` | 显示百分比 |


**Ring**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| value \* | `number` | — | 0–100 |
| size | `number` | `72` | 直径 (px) |
| tone | `"accent" | "success" | ...` | `"accent"` | 色调 |



---

## List 列表

> 承载一组结构化的同质化数据。

**导入**

```tsx
import { List } from "@fangxinyan/lumina";
```

### 示例

#### 基础列表

```tsx
<List items={[{ key, title, description, avatar, actions }]} />
```

### API

**List**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| items \* | `ListItem[]` | — | 数据列表 |
| dividers | `boolean` | `true` | 项之间显示分隔线 |


**ListItem**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| key \* | `string` | — | 唯一键 |
| title / description | `ReactNode` | — | 标题/描述 |
| avatar | `ReactNode` | — | 前置图标或头像 |
| actions | `ReactNode` | — | 右侧操作区 |
| onClick | `() => void` | — | 点击回调 |



---

## Table 表格

> 结构化数据展示。

**导入**

```tsx
import { Table } from "@fangxinyan/lumina";
```

### 示例

#### 基础表格

```tsx
<Table rowKey="id" columns={[...]} data={data} />
```

#### 样式变体

三种视觉变体:striped (条纹)、embossed (凸起)、cards (卡片行)。

```tsx
<Table variant="striped" ... />
<Table variant="embossed" ... />
<Table variant="cards" ... />
```

#### 内置分页

传入 pagination 即可自动分页;data 会按当前页切片。传 false 关闭。

```tsx
<Table
  rowKey="id"
  columns={[...]}
  data={data}               // 24 rows
  pagination={{ pageSize: 6 }}
/>
```

#### 固定表头 / 横向滚动

scroll.y 固定表头并限制表体最大高度;scroll.x 设置内容最小宽度。

```tsx
<Table
  scroll={{ y: 220, x: 900 }}
  columns={[...]}
  data={data}
/>
```

#### 行选择 (rowSelection)

antd 风格的 rowSelection。表头多选框支持 indeterminate;可通过 getCheckboxProps 禁用指定行。

```tsx
<Table
  rowSelection={{
    selectedRowKeys,
    onChange: (keys, rows) => setSelectedKeys(keys),
    getCheckboxProps: (row) => ({ disabled: row.status === "离线" }),
  }}
  columns={[...]}
  data={data}
/>
```

#### 行选择 · 单选

设置 rowSelection.type = 'radio' 变成单选模式。

```tsx
<Table
  rowSelection={{ type: "radio", defaultSelectedRowKeys: [1] }}
  columns={[...]}
  data={data}
/>
```

#### 可展开行

点击左侧箭头按钮展开/收起,在行下方渲染自定义内容。

```tsx
<Table
  expandable={{
    expandedRowRender: (row) => <div>…详情…</div>,
    rowExpandable: (row) => row.status !== "离线",
  }}
  columns={[...]}
  data={data}
/>
```

#### 列筛选

在列上配置 filters 即可在列头显示漏斗图标;点击弹出勾选面板,勾选后过滤数据。

```tsx
<Table
  columns={[
    {
      key: "role", title: "部门", dataIndex: "role",
      filters: [
        { text: "设计", value: "设计" },
        { text: "研发", value: "研发" },
      ],
      onFilter: (value, row) => row.role === value,
    },
  ]}
  data={data}
/>
```

### API

**Table**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| columns \* | `TableColumn[]` | — | 列定义 |
| data \* | `Row[]` | — | 数据数组 |
| rowKey | `string | (row) => key` | — | 行键 |
| variant | `"default" | "striped" | "embossed" | "cards"` | `"default"` | 视觉变体 |
| pagination | `false | PaginationConfig` | — | 分页配置;false 关闭 |
| scroll | `TableScrollConfig` | — | 滚动配置:{ x?, y? } |
| rowSelection | `RowSelectionConfig` | — | 行选择配置 (antd 风格) |
| expandable | `ExpandableConfig` | — | 可展开行配置 |
| sortKey / sortDir / onSort | `—` | — | 受控排序 |
| onRowClick | `(row, i) => void` | — | 点击行 |
| selectable / selected / onSelect | `—` | — | 旧版多选 API (保留兼容,优先使用 rowSelection) |


**TableColumn**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| key \* | `string` | — | 列唯一键 |
| title \* | `ReactNode` | — | 表头 |
| dataIndex | `keyof Row` | — | 取值字段 |
| render | `(value, row, index) => ReactNode` | — | 单元格渲染 |
| width | `number | string` | — | 列宽 |
| align | `"left" | "center" | "right"` | — | 对齐 |
| sortable | `boolean` | — | 是否可排序 |
| filters | `{ text, value }[]` | — | 筛选项 |
| onFilter | `(value, row) => boolean` | — | 筛选判定函数 |
| defaultFilteredValue | `(string | number)[]` | — | 非受控初始筛选 |
| filteredValue | `(string | number)[]` | — | 受控筛选值 |


**PaginationConfig**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| current | `number` | — | 当前页 (1-indexed),受控 |
| defaultCurrent | `number` | `1` | 非受控初始页 |
| pageSize | `number` | `10` | 每页条数 |
| defaultPageSize | `number` | — | 非受控初始每页条数 |
| total | `number` | — | 数据总量;默认为 data.length |
| onChange | `(page, pageSize) => void` | — | 切页回调 |


**RowSelectionConfig**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| type | `"checkbox" | "radio"` | `"checkbox"` | 多选或单选 |
| selectedRowKeys | `(string | number)[]` | — | 受控选中 key |
| defaultSelectedRowKeys | `(string | number)[]` | — | 非受控初始选中 |
| onChange | `(keys, rows) => void` | — | 选中变化 |
| getCheckboxProps | `(row) => { disabled? }` | — | 每行勾选框属性 |


**ExpandableConfig**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| expandedRowKeys | `(string | number)[]` | — | 受控已展开 key |
| defaultExpandedRowKeys | `(string | number)[]` | — | 非受控初始展开 |
| onExpand | `(expanded, row) => void` | — | 展开/收起回调 |
| expandedRowRender | `(row, i) => ReactNode` | — | 展开面板渲染 |
| rowExpandable | `(row) => boolean` | — | 该行是否可展开 |



---

## Table Pro

> 带工具栏 / 搜索 / 筛选 / 排序 / 多选 / 分页的全功能表格。

**导入**

```tsx
import { TablePro } from "@fangxinyan/lumina";
```

### 示例

#### 全功能

工具栏 + 排序 + 新版 rowSelection + 内置分页。相比旧版,Table 自己切片 data,不必外部 slice。

```tsx
<TablePro
  rowKey="id" data={filtered} columns={...}
  rowSelection={{ selectedRowKeys, onChange }}
  sortKey={sortKey} sortDir={sortDir} onSort={...}
  pagination={{ pageSize: 4 }}
  toolbar={<Input ... /> <Select ... />}
  actions={<Button>新增</Button>}
/>
```

#### 带可展开行

TablePro 直接透传 expandable 到 Table。

```tsx
<TablePro
  title="成员详情"
  expandable={{
    expandedRowRender: (row) => <div>...展开内容...</div>,
  }}
  ...
/>
```

### API

**TablePro**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| ... | `TableProps` | — | 继承自 Table 全部 props (包括新的 pagination / scroll / rowSelection / expandable / filters) |
| toolbar | `ReactNode` | — | 工具栏内容 |
| actions | `ReactNode` | — | 工具栏右侧操作 |
| footer | `ReactNode` | — | 底部 (可选,传了会渲染在分页下方) |
| title | `ReactNode` | — | 工具栏标题 |



---

## Image 图片

> 凹陷外框包裹的图片容器,带预览、错误占位。

**导入**

```tsx
import { Image, ImageGrid } from "@fangxinyan/lumina";
```

### 示例

#### 基础

```tsx
<Image src={url} width={240} height={160} />
```

#### 图片组

```tsx
<ImageGrid images={images} />
```

### API

**Image**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| src | `string` | — | 图片 URL |
| width / height | `number | string` | — | 尺寸 |
| preview | `boolean` | `true` | 支持点击全屏预览 |
| hover | `boolean` | `true` | 悬浮放大 |
| placeholder | `ReactNode` | — | 占位/错误时内容 |



---

## Calendar 日历

> 查看与选择日期。

**导入**

```tsx
import { Calendar } from "@fangxinyan/lumina";
```

### 示例

#### 基础用法

```tsx
<Calendar value={date} onChange={setDate} />
```

#### 禁用日期

通过 disabledDate 将周末标灰并禁止点击;与 min/max 可叠加使用。

```tsx
<Calendar
  value={workDate}
  onChange={setWorkDate}
  disabledDate={(d) => d.getDay() === 0 || d.getDay() === 6}
/>
```

### API

**Calendar**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| value / defaultValue | `Date` | — | 受控/初始日期 |
| onChange | `(date: Date) => void` | — | 选择回调 |
| min / max | `Date` | — | 可选范围 |
| disabledDate | `(date: Date) => boolean` | — | 自定义禁用判断,返回 true 的日期不可选 |



---

## Pagination 分页

> 分页控件,支持快速跳转与每页条数切换。

**导入**

```tsx
import { Pagination } from "@fangxinyan/lumina";
```

### 示例

#### 基础用法

```tsx
<Pagination total={85} page={page} onChange={setPage} />
```

#### 快速跳转

启用 showQuickJumper,输入页码按 Enter 跳转,超出范围会被夹紧。

```tsx
<Pagination
  total={250}
  page={jumpPage}
  onChange={setJumpPage}
  showQuickJumper
/>
```

#### 每页条数

启用 showSizeChanger,切换条数会回到第 1 页并触发 onShowSizeChange + onChange(1)。

```tsx
<Pagination
  total={320}
  page={sizePage}
  pageSize={pageSize}
  onChange={setSizePage}
  showSizeChanger
  onShowSizeChange={(_cur, size) => setPageSize(size)}
/>
```

#### 跳转 + 条数 + 自定义选项

同时启用两项,并通过 pageSizeOptions 自定义候选条数。

```tsx
<Pagination
  total={999}
  page={fullPage}
  pageSize={fullPageSize}
  onChange={setFullPage}
  showQuickJumper
  showSizeChanger
  pageSizeOptions={[20, 50, 100, 200]}
  onShowSizeChange={(_cur, size) => setFullPageSize(size)}
/>
```

### API

**Pagination**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| total \* | `number` | — | 数据总条数 |
| pageSize | `number` | `10` | 每页条数 |
| page / defaultPage | `number` | `1` | 受控/初始页码 |
| onChange | `(page: number) => void` | — | 页码变化回调 |
| siblings | `number` | `1` | 当前页两侧可见的页码数 |
| showQuickJumper | `boolean` | `false` | 显示跳转输入框,按 Enter 跳转 |
| showSizeChanger | `boolean` | `false` | 显示每页条数选择器,切换后回到第 1 页 |
| pageSizeOptions | `number[]` | `[10, 20, 50, 100]` | 每页条数候选项 |
| onShowSizeChange | `(current: number, size: number) => void` | — | 每页条数变更回调 |



---

## Tabs 选项卡

> 同一层级的内容分组,通过标签切换。

**导入**

```tsx
import { Tabs } from "@fangxinyan/lumina";
```

### 示例

#### 基础

```tsx
<Tabs items={[
  { key: "general", label: "通用", content: <>...</> },
  { key: "account", label: "账户", content: <>...</> },
]} />
```

#### 下划线变体

```tsx
<Tabs variant="line" items={[...]} />
```

#### 居中对齐

centered 让标签条在容器中水平居中。

```tsx
<Tabs centered items={[...]} />
```

### API

**Tabs**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| items \* | `TabItem[]` | — | 标签数据 |
| activeKey / defaultActiveKey | `string` | — | 受控/初始激活 |
| onChange | `(key: string) => void` | — | 切换 |
| variant | `"line" | "pill" | "segmented"` | `"line"` | 样式 |
| centered | `boolean` | `false` | 标签条居中对齐 |



---

## Accordion 折叠面板

> 纵向折叠面板。

**导入**

```tsx
import { Accordion } from "@fangxinyan/lumina";
```

### 示例

#### 基础

```tsx
<Accordion items={[{ key, title, content }]} />
```

#### 多项展开

multiple 允许同时展开多个面板。

```tsx
<Accordion multiple defaultActiveKeys={["1", "2"]} ... />
```

#### 手风琴模式

accordion={true} 同一时刻最多只展开一项;与 multiple 同时传入时 accordion 优先。

```tsx
<Accordion accordion defaultActiveKeys={["1"]} ... />
```

#### 仅图标可点

collapsible="icon" 将展开触发限制在右侧箭头图标上,标题区域不再响应。

```tsx
<Accordion collapsible="icon" ... />
```

#### 禁用展开

collapsible="disabled" 会禁用所有项的展开交互。

```tsx
<Accordion collapsible="disabled" defaultActiveKeys={["1"]} ... />
```

### API

**Accordion**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| items \* | `AccordionItem[]` | — | 面板数据 |
| multiple | `boolean` | `false` | 可同时展开多个 |
| accordion | `boolean` | `false` | 手风琴模式(同一时刻最多一项) |
| collapsible | `"header" | "icon" | "disabled"` | `"header"` | 展开触发区域 |
| activeKeys / defaultActiveKeys | `string[]` | — | 受控/初始展开 |
| onChange | `(keys: string[]) => void` | — | 展开变更 |



---

## Modal 对话框

> 在不离开当前页面的前提下处理事务。

**导入**

```tsx
import { Modal } from "@fangxinyan/lumina";
```

### 示例

#### 基础

```tsx
<Modal open={m} onClose={...} title="标题">...</Modal>
```

#### 确认操作 (footer 自定义)

用 footer 自定义底部按钮。传 null 可以去掉 footer。

```tsx
<Modal footer={<><Button>取消</Button><Button danger>删除</Button></>}>...
```

#### onOk / onCancel + 按钮定制

用默认 footer 的 onOk / onCancel 区分动作,okText / cancelText 改文案,okButtonProps 透传样式。

```tsx
<Modal
  onOk={handleSave}
  onCancel={() => setOpen(false)}
  okText="发布"
  cancelText="不发了"
  okButtonProps={{ icon: "send" }}
/>
```

#### 异步 confirmLoading

提交过程中 confirmLoading 显示按钮 spinner 并自动禁用;完成后外层再 setOpen(false)。

```tsx
<Modal confirmLoading={submitting} onOk={async () => {
  setSubmitting(true);
  await api.save();
  setSubmitting(false);
  setOpen(false);
}} />
```

#### 隐藏关闭按钮

closable={false} 隐藏右上角 ×,closeIcon 可自定义。

```tsx
<Modal closable={false} />
<Modal closeIcon={<Icon name="chevDown" />} />
```

### API

**Modal**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| open \* | `boolean` | — | 是否可见 |
| onClose | `() => void` | — | 关闭回调(遮罩/Esc/关闭按钮) |
| onOk | `() => void` | — | 默认 OK 按钮点击 |
| onCancel | `() => void` | — | 默认 Cancel 按钮 / Esc / 关闭 / 遮罩触发,缺省则用 onClose |
| title / description | `ReactNode` | — | 标题/说明 |
| footer | `ReactNode` | — | 自定义底部(null 去除) |
| okText / cancelText | `ReactNode` | `"确定" / "取消"` | 默认按钮文案 |
| okButtonProps / cancelButtonProps | `Partial<ButtonProps>` | — | 透传给默认按钮 |
| confirmLoading | `boolean` | `false` | OK 按钮显示 spinner 并禁用 |
| closable | `boolean` | `true` | 显示右上角 × |
| closeIcon | `ReactNode` | — | 自定义关闭图标 |
| maskClosable | `boolean` | `true` | 点击遮罩关闭 |
| escClosable | `boolean` | `true` | Esc 关闭 |
| width | `number | string` | `440` | 宽度 |
| destroyOnClose | `boolean` | `false` | 关闭时卸载子树 |
| afterOpenChange | `(open: boolean) => void` | — | 动画结束后回调 |
| zIndex | `number` | — | 覆盖遮罩 z-index |



---

## Drawer 抽屉

> 从屏幕边缘滑出的浮层。

**导入**

```tsx
import { Drawer } from "@fangxinyan/lumina";
```

### 示例

#### 基础

```tsx
<Drawer open={d} onClose={...} title="标题">...</Drawer>
```

#### 标题右侧 extra

extra 渲染到标题右边,常用来放刷新 / 更多 / 保存按钮。

```tsx
<Drawer
  title="订单详情"
  extra={<><IconButton icon="edit" tip="编辑" /><Button variant="primary">保存</Button></>}
/>
```

#### 四个方向

placement 控制滑出方向;top / bottom 用 size 控高度。

```tsx
<Drawer placement="left" size={320} />
<Drawer placement="top" size={240} />
```

#### 无遮罩 (mask={false})

关闭遮罩的抽屉不阻塞页面其他交互,适合辅助面板。

```tsx
<Drawer mask={false} />
```

### API

**Drawer**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| open \* | `boolean` | — | 可见 |
| onClose | `() => void` | — | 关闭回调 |
| placement | `"left" | "right" | "top" | "bottom"` | `"right"` | 出现位置 |
| size | `number | string` | `380` | 宽度(左右)或高度(上下) |
| title / footer / children | `ReactNode` | — | 头/脚/主体 |
| extra | `ReactNode` | — | 标题右侧的附加操作区 |
| mask | `boolean` | `true` | 是否渲染遮罩 |
| maskClosable | `boolean` | `true` | 点击遮罩关闭 |
| keyboard | `boolean` | `true` | Esc 关闭 |
| closable | `boolean` | `true` | 右上角 × |
| closeIcon | `ReactNode` | — | 自定义关闭图标 |
| destroyOnClose | `boolean` | `false` | 关闭时卸载子树 |
| afterOpenChange | `(open: boolean) => void` | — | 动画结束回调 |
| zIndex | `number` | — | 覆盖 z-index |



---

## Toast 通知

> 全局轻量提示,4 种语义。

**导入**

```tsx
import { toast, ToastContainer } from "@fangxinyan/lumina";
```

### 示例

#### 四种语义

```tsx
toast.info("已保存到草稿");
toast.success("操作完成");
toast.warn("请注意");
toast.error("发生错误");
```

#### 带标题

```tsx
toast.success("已上传 5 个文件", "上传完成");
```

### API

**toast.***

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| info(message, title?) | `(msg, title?) => id` | — | 信息提示 |
| success(message, title?) | `(msg, title?) => id` | — | 成功 |
| warn(message, title?) | `(msg, title?) => id` | — | 警告 |
| error(message, title?) | `(msg, title?) => id` | — | 错误 |
| show({ type, message, title?, duration? }) | `(item) => id` | — | 完整 API |
| dismiss(id) | `(id: number) => void` | — | 关闭一条 |
| clear() | `() => void` | — | 清空全部 |


**ToastContainer**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| placement | `"top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center"` | `"top-right"` | 位置 |



---

## Tooltip 文字提示

> 鼠标悬浮触发的简短说明。

**导入**

```tsx
import { Tooltip } from "@fangxinyan/lumina";
```

### 示例

#### 基础

```tsx
<Tooltip content="新建文档"><IconButton icon="plus" /></Tooltip>
```

#### 位置

```tsx
<Tooltip placement="bottom" content="..." />
```

### API

**Tooltip**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| content \* | `ReactNode` | — | 提示内容 |
| placement | `"top" | "bottom" | "left" | "right"` | `"top"` | 位置 |
| delay | `number` | `250` | 悬浮延时 (ms) |
| disabled | `boolean` | `false` | 禁用提示 |



---

## Popover 气泡卡片

> 比 Tooltip 更丰富,可承载交互内容。

**导入**

```tsx
import { Popover } from "@fangxinyan/lumina";
```

### 示例

#### 基础

```tsx
<Popover content={<>...</>}>
  <Button>触发</Button>
</Popover>
```

### API

**Popover**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| content \* | `ReactNode` | — | 浮层内容 |
| placement | `"top" | "bottom" | "left" | "right"` | `"bottom"` | 位置 |
| trigger | `"click" | "hover"` | `"click"` | 触发方式 |
| open / defaultOpen / onOpenChange | `—` | — | 受控显示 |



---

## Alert 警告提示

> 页面中嵌入的警告/提示。

**导入**

```tsx
import { Alert } from "@fangxinyan/lumina";
```

### 示例

#### 四种语义

```tsx
<Alert tone="info" title="标题">内容</Alert>
```

#### 无标题 / 可关闭

```tsx
<Alert tone="info" closable>仅一行的简短提示</Alert>
```

#### 隐藏图标

showIcon={false} 可隐藏左侧语义图标,文本更紧凑。

```tsx
<Alert tone="info" showIcon={false}>纯文本提示</Alert>
```

#### 自定义操作区

action 插槽可以放置按钮等操作元素,位于内容与关闭按钮之间。

```tsx
<Alert
  tone="warning"
  title="新版本可用"
  action={<Button size="sm" variant="primary">立即更新</Button>}
  closable
>
  v1.2.0 已发布。
</Alert>
```

### API

**Alert**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| tone | `"info" | "success" | "warning" | "danger"` | `"info"` | 语气 |
| title | `ReactNode` | — | 标题 |
| icon | `IconName` | — | 自定义图标 |
| showIcon | `boolean` | `true` | 是否显示语义图标 |
| action | `ReactNode` | — | 右侧操作区(如按钮) |
| closable | `boolean` | `false` | 可关闭 |
| onClose | `() => void` | — | 关闭回调 |



---

## Empty 空状态

> 列表、页面或容器无数据时的占位。

**导入**

```tsx
import { Empty } from "@fangxinyan/lumina";
```

### 示例

#### 基础

```tsx
<Empty title="暂无项目" description="创建一个开始吧" action={<Button>新建</Button>} />
```

#### Subtle 变体

去掉凹陷图标框,用于嵌入已有卡片/对话框中。

```tsx
<Empty variant="subtle" icon={<Icon name="search" size={28} />} title="未找到结果" />
```

#### 尺寸

sm 适合列表内嵌,md 是默认,lg 用作整页占位。

```tsx
<Empty size="sm" title="暂无数据" />
<Empty size="md" title="暂无数据" />
<Empty size="lg" title="暂无数据" />
```

### API

**Empty**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| title | `ReactNode` | `"暂无内容"` | 标题 |
| description | `ReactNode` | — | 描述 |
| icon | `ReactNode` | — | 图标 |
| action | `ReactNode` | — | 底部操作 |
| size | `"sm" | "md" | "lg"` | `"md"` | 尺寸 |
| variant | `"default" | "subtle"` | `"default"` | 样式 |



---

## Spinner 加载

> 表示任务正在进行,提示用户等待。

**导入**

```tsx
import { Spinner } from "@fangxinyan/lumina";
```

### 示例

#### 基础

```tsx
<Spinner />
<Spinner size={28} />
<Spinner size={40} />
```

#### 色调

```tsx
<Spinner tone="accent" />
<Spinner tone="success" />
<Spinner tone="warning" />
<Spinner tone="danger" />
```

#### Dots 变体

```tsx
<Spinner variant="dots" />
<Spinner variant="dots" size={24} />
<Spinner variant="dots" size={32} />
```

#### 带文案

```tsx
<Spinner label="加载中…" />
<Spinner variant="dots" tone="accent" label="正在同步" />
```

### API

**Spinner**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| size | `number` | `20` | 尺寸 (px) |
| tone | `"accent" | "success" | "warning" | "danger" | "current"` | `"accent"` | 色调 |
| variant | `"ring" | "dots"` | `"ring"` | 样式 |
| label | `ReactNode` | — | 文案 |



---

## Skeleton 骨架屏

> 数据加载前展示页面结构轮廓。

**导入**

```tsx
import { Skeleton } from "@fangxinyan/lumina";
```

### 示例

#### 基础

```tsx
<Skeleton height={16} width="40%" />
<Skeleton height={12} />
<Skeleton height={12} width="80%" />
```

#### 手动组合:头像 + 文本

使用原语 Skeleton 手动拼装 — 更灵活但需要自己写布局。

```tsx
<Skeleton circle height={48} width={48} />
<Skeleton height={12} width="50%" />
```

#### 组合模式 (avatar + title + paragraph)

设置 avatar / title / paragraph 任一即切换到组合模式,自动拼装布局。

```tsx
<Skeleton avatar title paragraph />
```

#### 组合:自定义头像形状、段落行数

```tsx
<Skeleton
  avatar={{ shape: "square", size: "lg" }}
  title={{ width: "30%" }}
  paragraph={{ rows: 4, width: ["100%", "90%", "70%", "40%"] }}
/>
```

#### 组合:仅 title + paragraph

关闭 avatar 只渲染标题与段落,其余布局自动调整。

```tsx
<Skeleton title paragraph={{ rows: 2 }} />
```

#### 动画

wave 是闪光流动,pulse 是透明度脉动,none 是静态占位。

```tsx
<Skeleton animation="wave" />
<Skeleton animation="pulse" />
<Skeleton animation="none" />
```

### API

**Skeleton (原语模式)**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| width | `number | string` | `"100%"` | 宽度 |
| height | `number | string` | `16` | 高度 |
| circle | `boolean` | `false` | 圆形 |
| animation | `"wave" | "pulse" | "none"` | `"wave"` | 动画 |


**Skeleton (组合模式)**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| avatar | `boolean | { shape?: "circle" | "square"; size?: "sm" | "md" | "lg" }` | `false` | 左侧头像骨架。为对象时可定制 shape / size |
| title | `boolean | { width?: number | string }` | `true (composite)` | 标题行骨架。组合模式下默认 true |
| paragraph | `boolean | { rows?: number; width?: (number | string)[] }` | `{ rows: 3 }` | 段落行骨架。可指定 rows 与每行宽度(最后一行默认 60%) |



---

## TitleBar 标题栏

> Electron 应用窗口顶部的跨平台标题栏。

**导入**

```tsx
import { TitleBar } from "@fangxinyan/lumina";
```

### 示例

#### macOS 风格

```tsx
<TitleBar platform="mac" title="无标题文档" actions={<>...</>} />
```

#### Windows 风格

```tsx
<TitleBar platform="windows" title="..." actions={...} />
```

### API

**TitleBar**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| title | `ReactNode` | — | 标题 |
| platform | `"mac" | "windows"` | `"mac"` | 平台风格 |
| actions | `ReactNode` | — | 右侧操作区 |
| center | `ReactNode` | — | 中部内容 |
| draggable | `boolean` | `true` | 整条作为拖拽区 |
| onMinimize / onMaximize / onClose | `() => void` | — | 窗口控件回调 |



---

## WindowControls 窗口控件

> 独立的窗口控件按钮组。

**导入**

```tsx
import { WindowControls } from "@fangxinyan/lumina";
```

### 示例

#### 两种平台

```tsx
<WindowControls platform="mac" />
<WindowControls platform="windows" />
```

### API

**WindowControls**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| platform | `"mac" | "windows"` | `"mac"` | 平台 |
| onMinimize / onMaximize / onClose | `() => void` | — | 回调 |



---

## Sidebar 侧边栏

> 应用主导航,沿屏幕左侧垂直排列。

**导入**

```tsx
import { Sidebar } from "@fangxinyan/lumina";
```

### 示例

#### 基础

```tsx
<Sidebar items={[{ key, label, icon, badge }]} activeKey={active} onSelect={setActive} />
```

### API

**Sidebar**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| items \* | `SidebarItem[]` | — | 导航项 |
| activeKey | `string` | — | 当前激活项 |
| onSelect | `(key: string) => void` | — | 选择回调 |
| collapsed | `boolean` | `false` | 折叠为图标 |
| header / footer | `ReactNode` | — | 头/尾内容 |


**SidebarItem**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| key \* | `string` | — | 唯一键 |
| label | `ReactNode` | — | 文案 |
| icon | `ReactNode` | — | 前置图标 |
| badge | `ReactNode` | — | 尾部徽标 |


