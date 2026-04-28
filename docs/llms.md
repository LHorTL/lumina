# @fangxinyan/lumina · LLM Reference

> 拟态风格的 React 18 组件库,目标是 Electron 桌面应用。**写给 AI 编程助手**的按需文档 —— 每个组件单独一个 `.md`,避免一次性读取全部。示例源自 playground 的 demo,可直接复制运行。

- **包名**: `@fangxinyan/lumina`
- **版本**: `0.6.3`
- **React 最低版本**: 18
- **环境**: 带打包器的 React 工程(Vite / Next.js / Webpack / Remix / Electron + Vite 等)
- **零运行时依赖**: 只依赖 `react` / `react-dom` (peer deps)
- **仓库**: git+https://github.com/LHorTL/lumina.git

## 用法建议(给 AI)

- **只需要某个组件时**: 直接读 `./llms/<id>.md`(例如 `./llms/button.md`)。每份 50-300 行,覆盖导入 / 示例 / 完整 Props 表。
- **需要全局概念时**(安装、主题、图标、浮层): 读本文件底部的「必读 · 全局约定」一节。
- **通过 npm 包内置路径**:
  - 索引: `node_modules/@fangxinyan/lumina/docs/llms.md` 或子路径导出 `@fangxinyan/lumina/llms.md`
  - 单组件: `node_modules/@fangxinyan/lumina/docs/llms/<id>.md`

## 必读 · 全局约定

1. **安装**  
   `npm install @fangxinyan/lumina`
2. **引入样式**(任一即可):  
   ```tsx
   import "@fangxinyan/lumina/styles"; // 设计令牌 + 全局 reset + 全部组件样式
   ```
   或按组件单独引入(适合 tree-shake 到极限):  
   ```tsx
   import "@fangxinyan/lumina/tokens";         // 仅设计令牌,不含全局 reset
   import { Button } from "@fangxinyan/lumina"; // 会自动带上 Button.css / shared.css
   ```
   如果你还需要 reset / scrollbar / focus-visible 基线样式,请改用 `@fangxinyan/lumina/styles`。
3. **TypeScript**: 所有 `XxxProps` 接口都是 `export`,可直接 `import { Button, type ButtonProps } from "@fangxinyan/lumina";`
4. **主题**: 用 `<ThemeProvider>` 包根;运行时可通过 `useTheme()` 改。六种强调色 (`rose / sky / coral / mint / violet / amber`) × 内置模式 (`light / dark / system`) × 命名自定义模式 × 三档密度 (`compact / comfortable / spacious`)。详见 [`llms/theme.md`](./llms/theme.md)。
5. **图标**: 常用 `icon / leadingIcon / trailingIcon` prop 支持内置字符串 `IconName`,高频组件也可传 `ReactNode`(如远程图片图标)。完整内置列表见 [`llms/icon.md`](./llms/icon.md)。
6. **浮层组件**(Tooltip / Popover / Select / Cascader / ColorPicker / Modal / Drawer): 内部已 `createPortal` 到 `document.body` + 视口边界翻转,放在 `overflow: hidden` 的容器里也不会被裁。
7. **Electron 专属组件**: `TitleBar` / `WindowControls` / `Sidebar` / `AppShell` 提供 macOS / Windows 原生风格的标题栏与导航。

## 组件索引

### 起步

- [Lumina](./llms/intro.md) — 为 Electron 应用定制的拟态风格 React 组件库。
- [Theme 主题](./llms/theme.md) — ThemeProvider + useTheme,覆盖深浅色、自定义模式、强调色、密度、圆角、字体、阴影强度。

### 通用

- [Button 按钮](./llms/button.md) — 标记一个操作命令,响应用户点击行为,触发相应业务逻辑。
- [Icon 图标](./llms/icon.md) — 线性图标集,继承当前文字颜色,可调整尺寸与描边。
- [Typography 排版](./llms/typography.md) — 标题、段落、文本、链接一体化排版组件,支持语义色、修饰、复制、编辑、省略。

### 表单

- [Input 输入框](./llms/input.md) — 凹陷凹槽式输入域,支持前后置图标、错误态、禁用态。
- [InputNumber 数字输入](./llms/inputnumber.md) — 带步进按钮的数字输入框。
- [Switch 开关](./llms/switch.md) — 二元状态切换器。
- [Checkbox 复选框](./llms/checkbox.md) — 在一组选项中进行多项选择,或独立切换某个开关项。
- [Radio 单选](./llms/radio.md) — 在多个互斥选项中进行单项选择。
- [Slider 滑块](./llms/slider.md) — 在连续数值区间内取值。
- [Select 下拉选择](./llms/select.md) — 下拉选择,支持单/多选、搜索、分组、加载态。
- [AutoComplete 自动补全](./llms/autocomplete.md) — 输入时展示建议下拉,不限定必须从候选中选。
- [Cascader 级联选择](./llms/cascader.md) — 层级关联数据集合中的多级选择。
- [ColorPicker 颜色选择](./llms/colorpicker.md) — 拟态风格的颜色选择器:HSV 色域、色相、hex 输入、预设调色板。
- [Form 表单](./llms/form.md) — 受控表单,字段绑定 + 校验。

### 数据展示

- [Card 卡片](./llms/card.md) — 信息分组容器,提供 raised / flat / sunken 三种视觉变体。
- [Tag 标签](./llms/tag.md) — 标记关键词、状态或分类。
- [Badge 徽标数](./llms/badge.md) — 右上角的小型计数或状态指示器。
- [Avatar 头像](./llms/avatar.md) — 用图像、首字母代表用户或事物。
- [Image 图片](./llms/image.md) — 凹陷外框包裹的图片容器,带预览、错误占位。
- [Divider 分隔符](./llms/divider.md) — 对内容进行分割。
- [Progress 进度](./llms/progress.md) — 条形进度 Progress。
- [Timeline 时间线](./llms/timeline.md) — 垂直时间线，支持等待状态、自定义圆点、交替布局
- [List 列表](./llms/list.md) — 承载一组结构化的同质化数据。
- [Table 表格](./llms/table.md) — 结构化数据展示。
- [Table Pro](./llms/tablepro.md) — 带工具栏 / 搜索 / 筛选 / 排序 / 多选 / 分页的全功能表格。
- [Pagination 分页](./llms/pagination.md) — 分页控件,支持快速跳转与每页条数切换。
- [Tabs 选项卡](./llms/tabs.md) — 同一层级的内容分组,通过标签切换。
- [Collapse 折叠面板](./llms/collapse.md) — 纵向折叠面板。
- [Calendar 日历](./llms/calendar.md) — 查看与选择日期。

### 反馈

- [Modal 对话框](./llms/modal.md) — 在不离开当前页面的前提下处理事务。
- [Drawer 抽屉](./llms/drawer.md) — 从屏幕边缘滑出的浮层。
- [Message 全局消息](./llms/message.md) — 全局轻量提示,支持函数调用与对象配置。
- [Tooltip 文字提示](./llms/tooltip.md) — 鼠标悬浮触发的简短说明。
- [Popover 气泡卡片](./llms/popover.md) — 比 Tooltip 更丰富，可承载交互内容。
- [Alert 警告提示](./llms/alert.md) — 页面中嵌入的警告/提示。
- [Empty 空状态](./llms/empty.md) — 列表、页面或容器无数据时的占位。
- [Spin 加载](./llms/spin.md) — 表示任务正在进行,提示用户等待。
- [Skeleton 骨架屏](./llms/skeleton.md) — 数据加载前展示页面结构轮廓。

### Electron

- [TitleBar 标题栏](./llms/titlebar.md) — Electron 应用窗口顶部的跨平台标题栏。
- [WindowControls 窗口控件](./llms/windowcontrols.md) — 独立的窗口控件按钮组。
- [Sidebar 侧边栏](./llms/sidebar.md) — 应用主导航,沿屏幕左侧垂直排列。
- [StatusBar 状态栏](./llms/statusbar.md) — 窗口底部状态栏,展示分支、编码、行列等应用元信息。
- [AppShell 应用外壳](./llms/appshell.md) — 组合 TitleBar、Sidebar 与主内容区的 Electron 桌面布局容器。
- [Splitter 可拖拽分栏](./llms/splitter.md) — 两栏之间可拖拽的分隔条,支持横向、纵向与嵌套。
- [ContextMenu 右键菜单](./llms/contextmenu.md) — 桌面应用风格的右键上下文菜单。
- [CommandPalette ⌘K 命令面板](./llms/commandpalette.md) — 全局命令搜索与执行入口。

