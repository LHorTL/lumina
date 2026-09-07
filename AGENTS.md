# AGENTS.md

本文件是 Lumina 仓库始终生效的开发规范。任何新会话都应先完整读取本文件再行动。

## 项目概览

**Lumina** 是面向 Electron 桌面应用的 React 18 + TypeScript 拟态组件库。

- npm：`@fangxinyan/lumina`
- 构建：tsup，输出 ESM + CJS + DTS
- Playground：Vite，根目录 `playground/`
- 测试：Vitest + jsdom
- 样式：CSS variables + PostCSS
- 运行时依赖：仅 React / ReactDOM peer dependencies

## 核心不变量

- 禁止新增 lodash、classnames、clsx 等运行时依赖。
- 公共 DOM 组件必须使用 `React.forwardRef`，透传原生 attrs，并接入组件级 `theme`；纯 Provider / Hook 容器可例外。
- 组件 CSS 禁止硬编码颜色；使用 `--lmn-<component>-*` 并回退到全局 token。
- 新组件和 demo 优先复用已有 Lumina 组件，不手写等价原生控件。
- Portal / 浮层统一使用定位、Portal 容器、Overlay 栈和组件主题基础设施，不直接挂 `document.body`、不独立监听全局 Esc、不写死 z-index。
- 影响公共行为的修改必须同步 Playground demo、回归测试和生成文档源。
- `docs/llms.md` 与 `docs/llms/*.md` 是生成物，禁止手工编辑。

## 组件与公共 API

### 新组件接入

1. 在 `src/components/<Name>/` 创建 `<Name>.tsx`、`<Name>.css`、`index.ts`。
2. TSX 顶部依次导入 `../../styles/tokens.css`、`../../styles/shared.css`、组件 CSS、React，保证独立子路径导入仍带样式。
3. Props 接口必须导出，继承合适的原生 attrs 和 `ComponentThemeProps`；冲突键用 `Omit` 显式排除。
4. 用 `React.forwardRef` 声明 `<Name>Base`，ref 必须落到真实 DOM 根节点。纯 Provider / Hook 容器可例外。
5. 在 `ComponentThemeName` 注册组件名，用 `withComponentTheme(<Name>Base, "<Name>", "<css-prefix>")` 导出公共组件。
6. `index.ts` 只做 `export * from "./<Name>";`，同时在 `src/index.ts` 暴露组件。
7. 公共 API 必须有简短 JSDoc 和最小 `@example`。

### DOM 与 Props 契约

- 渲染真实 DOM 的公共组件至少透传 `className / style / id / data-* / aria-*`。
- 默认值写在参数解构中。不要在函数体里用散落的判空重新定义默认值。
- 对原生 `size / onChange / color / type` 等冲突属性使用 `Omit`，避免交叉类型产生错误契约。
- 调用方直接传入的 `style` 保持最高优先级；HOC 不得截断 ref 或原生属性。
- 新增复合导出时同步检查根导出、子路径、文档导入名映射和构建后的 `.d.ts`。

### 受控与非受控状态

- 有内部状态的公共组件优先同时提供 `value / defaultValue`、`open / defaultOpen`、`expandedKeys / defaultExpandedKeys` 等双模式 API。
- 是否受控按 prop 是否为 `undefined` 判断，不用真假值判断。
- 受控模式只发变化回调，不偷偷写真实 DOM 或把内部状态当成事实来源；外部 prop 更新必须立即反映。
- Sidebar 分组、Table 的分页 / 选择 / 展开 / 筛选，以及 Select 类组件的 value / open 契约不得在重构时退化。

### 富内容渲染

- Select / Cascader 等菜单把菜单完整内容和触发器紧凑选中态分开：`optionRender` 负责多行复杂内容，`selectedRender` 负责固定高度摘要。
- 组件继续负责选中标记、键盘高亮、禁用态和 ARIA；渲染函数只提供内容。
- 富内容 API 同时提供 `listHeight` 和 `popupStyle`。调用方自定义 popup 宽度后，不再强制匹配触发器宽度。
- 复杂 `ReactNode` 标签允许提供独立的搜索文本和可访问名称，不能依赖自动字符串化。

### 内部组件复用

- 新组件和 Playground demo 能用现有 Lumina 组件时不得手写等价原生控件。
- 文本输入用 `Input`，多行用 `Textarea`，操作用 `Button / IconButton`，图标用 `Icon`，小标签用 `Tag / Badge`，列表与导航用 `List / Sidebar`。
- 下拉菜单优先用 `Select / Popover`；确有特殊需求时仍必须接入统一浮层基础设施。
- 只有现有 API 无法满足特殊语义或视觉时才写原生 DOM；样式必须复用 tokens，不得硬编码颜色。

## 主题与样式

### 样式基础

- CSS 中颜色、阴影、间距和圆角必须使用变量，禁止硬编码色值。
- 组件 class 使用现有短类名风格，避免引入另一套 BEM 命名。
- 深浅模式通过 `[data-theme="dark"]` 和运行时属性切换，不在组件 CSS 内写 `prefers-color-scheme`。
- 动画优先复用 `src/styles/shared.css` 的 keyframes。
- `@fangxinyan/lumina/styles` 是 tokens + base + shared + 全部组件样式；`/tokens` 只导出设计令牌。修改入口语义时同步检查 package exports 和文档。

### 组件级变量

- 可主题化值使用 `--lmn-<component>-*` 前缀，并回退到全局 token，例如 `var(--lmn-button-bg, var(--bg))`。
- 不要把局部组件颜色写回 `--bg / --fg / --shadow-*` 等全局变量，避免污染同级组件。
- `ThemeProvider.components` 的 `styles` 只定义稳定插槽，如 `root / popup / overlay / body / header / footer`。
- 合并顺序保持：继承配置 → 类型覆盖 → 组件自身主题 → 调用方 `style / popupStyle / maskStyle / bodyStyle`。实例样式最高。
- Modal、Drawer、Image 等遮罩使用中性 `--mask-bg`，不要从页面表面色推导蒙层。

### 主题层级

- `<ThemeProvider>` 与 `useTheme()` 管理 React 运行时主题，`applyTheme(element, config)` 提供命令式挂载。
- 静态属性使用 `data-theme`、`data-accent`、`data-density`；accent 预设为 `rose / sky / coral / mint / violet / amber`，密度为 `compact / comfortable / spacious`。
- `ThemeProvider target="root"` 管理页面；`target="scope"` 和 `Surface` 管理局部区域。
- `baseColor` 接受任意合法 CSS 颜色，由 `deriveThemeColors` 生成完整色板；与黑白混合使用 `color-mix(in srgb, ...)`，避免无色端点丢失原始色相。
- `colors` 精确覆盖颜色槽，`tokens` 覆盖非颜色设计令牌，`components` 按公共组件名定向覆盖后代实例。
- 嵌套配置按组件以及 `colors / tokens / styles` 深合并，后层优先；仅提供 `components` 时不得重置外层页面色板。

### 公共组件 theme

- 所有公共 UI 组件支持 `theme?: ComponentTheme`。预设 accent key 字符串表示强调色，其他字符串表示 `baseColor`；对象支持 `baseColor / colorScheme / accent / intensity / colors / tokens / components / scope`。
- 默认 `scope="self"` 只改变组件自身；仅显式 `scope="subtree"` 时向业务后代传递完整主题。
- 新组件必须同步完成：`ComponentThemeName` 登记、Props 继承、`withComponentTheme` 包装、`--lmn-*` fallback 和类型 smoke。
- 组件 Portal 调用 `useComponentPortalTheme`，复制 CSS 变量、`data-theme`、`data-lumina-color-scheme` 和 popup / overlay 插槽。
- 没有任何局部主题时不要强写浅色属性，以免覆盖宿主暗色页面。
- `ComponentThemeBoundary`、`withComponentTheme` 和运行时 Context 是内部基础设施，不从公共出口暴露。

### 主题持久化

- 持久化使用带版本结构，并监听其他窗口的 `storage` 事件。
- 新字段同步更新序列化、旧版本兼容和跨窗口测试。
- 外部明确受控的字段不能被本地存储或跨窗口同步覆盖。

## 可访问性、表单与浮层

### 可访问性与表单

- 优先使用原生语义元素；复合控件补齐 role、可访问名称、状态和关联属性。
- 图标按钮必须有 `aria-label` 或 `tip`；复杂标签允许单独传可访问名称。
- 菜单、Tabs、RadioGroup、Calendar 等支持对应方向键并跳过禁用项。只在真正处理按键后阻止默认滚动。
- 禁止嵌套 button / link。自定义 trigger 优先克隆现有交互元素并合并原事件；非交互节点才补 role、tabIndex 和键盘入口。
- `Form.Item` 合并而不是覆盖子控件的 `aria-invalid / aria-required / aria-describedby / aria-labelledby`。
- blur 校验用 `isTargetWithinOverlayScope` 识别控件拥有的 Portal，避免在 Select / DatePicker 浮层内切换焦点时误校验。
- 受控 Input / Textarea 清空时不越权修改 DOM；需要向 `onChange` 报告空值时复用 `createValueOverrideTarget`。
- Checkbox / Radio / Switch 等保留 `name / value / checked` 的原生表单提交语义。

### 锚定浮层

Tooltip、Popover、Select、Cascader、ColorPicker、日期时间选择器等必须同时接入：

1. `useFloating`：fixed 坐标、flip、shift、scroll / resize 更新。
2. `usePortalContainer`：局部主题容器优先，无局部容器才回退 body；禁止直接硬编码 `document.body`。
3. `useOverlayLayer`：最上层 Esc、逻辑父子、焦点管理、焦点归还和引用计数滚动锁。
4. `useComponentPortalTheme`：复制所属组件主题和 popup 插槽。

`ownerRef` 指向触发器，`containerRef` 指向 Portal 根节点。禁止每个组件自行添加独立的 `document.keydown`。

Portal 根节点样式按以下顺序合并：

```tsx
style={{
  ...floatingStyle,
  ...portalTheme.style,
  ...portalTheme.styles.popup,
  ...popupStyle,
}}
```

CSS 不写 `position: absolute` 或方向 offset；定位由 `floatingStyle` 提供，方向 class 只控制箭头等视觉。

### 完整覆盖层与嵌套

- Modal、Drawer、Image Preview、CommandPalette 等使用 `useOverlayZIndex`，并用 `OverlayZIndexProvider` 把层级基线传给子树。
- 不用固定 z-index 修复嵌套；后打开或逻辑子浮层必须位于父层之上。
- 全局栈只允许当前最上层处理 Esc；连续 Esc 先关闭子浮层，再关闭父层。
- 焦点陷阱包含逻辑拥有的子 Portal，关闭后把焦点归还到仍有效的触发器。
- 页面滚动锁按文档引用计数，关闭一个嵌套层不能提前解锁其他层。

### 拟态阴影安全区

- Modal / Drawer 正文默认 `bodyInset="safe"`，按当前 shadow offset + blur 预留空间；贴边图片或表格可显式使用 `none`。
- 新增允许任意 Lumina 子组件且带 `overflow: auto / hidden` 的容器时，必须由容器统一评估并提供阴影安全区，不能让业务逐个补 padding。
- Modal / Drawer 只让正文滚动，header / footer 保持在滚动区外。

## Playground 与文档同步

### Playground 是行为文档

- 任何影响组件对外行为的改动都同步到 `playground/sections/<id>.tsx`。
- 新组件创建新 section；`_registry.ts` 会自动扫描，不手改导航注册表。
- 新 prop、variant、子组件或交互能力必须有最小可见 demo。
- API 重命名、类型或默认值变化时更新现有 demo 并移除失效写法。
- 纯 CSS 调整可不改 demo，但必须在实际 Playground 页面中目视回归。
- demo 内部优先使用 Lumina 自己的组件，不手写等价原生控件。

### 生成式 AI 文档

- `docs/llms.md` 和 `docs/llms/*.md` 由 `scripts/gen-llms-doc.mjs` 从 Playground sections 生成，禁止手工编辑。
- 真正的文档源是 section 传给 `DocPage` 的 demos 和 api 对象。
- 修改 section 后运行 `npm run gen:docs`，并确认生成物没有意外大范围漂移。
- 根 `llms.txt` 是 crawler 索引；调整生成逻辑时同步检查。

### 公共符号完整性

新增公共组件、子组件或组合组件时同时满足：

1. `src/index.ts` 有导出。
2. Playground 有 section 和可运行示例。
3. 运行文档生成后存在 `docs/llms/<id>.md`。
4. `docs/llms.md` 能索引该组件。
5. 若导出名不是 dist 文件名，更新生成脚本的导入名映射和 package 子路径。

缺任一项都不算完成。

## 验证、构建与发布

### 常用命令

```bash
npm run dev               # Playground: http://localhost:5173
npm run typecheck         # tsc --noEmit
npm run test:unit         # Vitest + jsdom
npm run gen:docs          # 生成 docs/llms
npm run build:lib         # ESM + CJS + DTS + styles.css
npm run verify:public-api # 版本、导出、子路径和类型 smoke
npm run build             # Playground 生产构建
```

`prepublishOnly` 顺序为 `typecheck → test:unit → gen:docs → build:lib → verify:public-api`。DTS 构建已有 6144 MB Node 堆上限，这是上限而非固定占用。

### 验收矩阵

- 公共 API、Props、导出、样式入口、Playground 或文档改动：运行 `npm run prepublishOnly`。
- ref、DOM attrs、子路径导出、文档映射或 Vite chunk 改动：额外运行 `npm run build`。
- 修复交互、受控状态、边界、Overlay、主题或渲染问题：在 `tests/` 添加回归测试。
- 公共组件契约：增加 TypeScript smoke，覆盖 ref、className、style、data-*、aria-*。
- 子路径导出：构建后实际执行 `require.resolve("@fangxinyan/lumina/<Name>")` 或等价解析。
- 视觉、主题、浮层和响应式变化：在实际 Playground 或目标应用页面中回归。
- Playground live tools、Babel、Prism 或分包策略变化：生产构建不得新增 chunk 或 circular warning。

### CI

`.github/workflows/ci.yml` 在 Node 24 下执行：

`typecheck → test:unit → gen:docs → 生成文档无差异检查 → build:lib → verify:public-api → build`

修改本地质量门禁、生成文档或构建步骤时同步维护 CI。发布工作流至少执行 typecheck、test、docs 和库构建。

仅在用户明确要求 Select 定向验证时，CI 和 Publish 的手动入口可选择 `validation_scope=select`：运行 `tsconfig.select.json`、Select 自适应/搜索测试、现有测试中的 Select 用例，以及构建后的 `scripts/check-select-package.mjs`。自动 CI 和 tag 发布通过提交正文的独立行 `Lumina-Validation: select` 选择相同范围；手动输入优先，未明确标记时仍使用完整验证。提交范围标记必须与用户授权一致，不能自行缩小默认验证范围。

### 构建与子路径

- dist 为扁平结构，`package.json.exports` 的 `./*` 只适用于导出名等于 dist 文件名的情况。
- 复合导出、同文件附带导出和具名图标需要显式 alias。
- 具名 `*Outlined / *Filled` 图标子路径指向 `dist/Icon.*`；新增或改名时同步 package exports 和公共 API 校验。
- `sideEffects: ["*.css"]` 必须保留，避免组件样式被 tree-shake。
- `@fangxinyan/lumina/styles` 与 `/tokens` 的语义不得漂移。
- 发布包的 `files` 必须保留 `dist`、`docs/llms.md`、`docs/llms`、README 和 LICENSE；生成文档的 exports 也要同步可用。

### 发布与 Git

- 主分支：`main`。
- 远程：`https://github.com/LHorTL/lumina.git`。
- 正式发布走 `.github/workflows/publish.yml`，通过 `v*` tag 或手动 workflow 触发；不得把本地 `npm publish` 当作默认路径。
- 发布 workflow 逐项验证后执行 `npm pack`，再发布该 tarball，避免目录发布隐式重复运行 `prepublishOnly`。定向发布仍须先通过相同提交的 CI，再推送版本 tag 或使用手动发布入口。
- 包名保持 `@fangxinyan/lumina`，`publishConfig.access` 保持 `public`。
- 发布前确保 `src/index.ts` 的 `VERSION` 与 `package.json.version` 一致。
- 不提交 `dist/`、`node_modules/`，不使用 `--ignore-scripts` 绕过 `prepublishOnly`。
- 修改 publish workflow、files、exports 或校验步骤时同步检查本地说明和 CI。

### 常见故障

- Playground 无法解析 `lumina`：检查 Vite 的 `lumina` 与 `lumina/styles` alias。
- 消费方有组件无样式：确认导入 `@fangxinyan/lumina/styles`，并使用支持 CSS import 的打包器。
- 类型缺失：检查对应 dist `.d.ts` 和 `build:lib` 是否完整结束。
- `dist/styles.css` 为空：检查 tsup onSuccess 的 PostCSS + postcss-import。
