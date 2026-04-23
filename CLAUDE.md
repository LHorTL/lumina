# CLAUDE.md

本文件是给 Claude Code 在本仓库工作时的开发规范。任何新会话都应先读完这份文件再动手。

## 项目概览

**Lumina** —— 面向 Electron 桌面应用的 React 18 + TypeScript 拟态风（Neumorphism）组件库。

- 发布名：`@fangxinyan/lumina`（scoped，公开发布）
- 目标环境：带打包器的 React 工程（Vite / Next.js / Webpack / Remix / Electron + Vite 等）
- 零运行时依赖：只依赖 `react` / `react-dom`（peer deps），样式由 CSS 变量驱动
- 远程仓库：`https://github.com/LHorTL/lumina.git`

## 技术栈

| 用途 | 工具 |
|---|---|
| 库构建 | **tsup**（`tsup.config.ts`），输出 ESM + CJS + `.d.ts` |
| Playground 开发服务器 | **Vite**（`vite.config.ts`），根目录 `./playground` |
| 类型检查 | `tsc --noEmit` |
| 样式打包 | PostCSS + `postcss-import`（tsup `onSuccess` hook 合并出 `dist/styles.css`） |

## 目录结构

```
lumina/
├── src/
│   ├── components/<Name>/       # 每个组件独占一个目录
│   │   ├── <Name>.tsx           # 组件代码（必须 forwardRef）
│   │   ├── <Name>.css           # 组件独立样式
│   │   └── index.ts             # `export * from "./<Name>";`
│   ├── styles/
│   │   ├── tokens.css           # 设计令牌（色/阴影/间距/圆角），:root + [data-theme="dark"]
│   │   ├── base.css             # 全局 reset / 滚动条 / focus-visible
│   │   ├── shared.css           # 跨组件共享 keyframes
│   │   └── index.css            # 汇总入口，@import 上述三个
│   ├── utils/
│   │   └── useFloating.ts       # 所有浮层组件共用的定位 hook（Portal + flip + shift）
│   └── index.ts                 # 公共出口 barrel（含 `VERSION` 常量）
├── playground/                  # Vite 演示站（`npm run dev`）
│   ├── App.tsx                  # 外壳 + TweaksPanel + 主题调试
│   ├── router.ts                # Hash 路由（URL 形如 `#/button`）
│   ├── docs.tsx                 # 文档展示组件（DocPage / AnchorNav / ApiTable）
│   ├── sections/                # 每个组件一个 <name>.tsx，用 defineSection(...) 注册
│   │   ├── _types.ts            # SectionMeta 类型 + defineSection helper
│   │   ├── _registry.ts         # import.meta.glob 自动扫描 *.tsx，产出 SECTIONS + NAV
│   │   ├── _shared.tsx          # Row / Field 等 demo 辅助组件
│   │   └── <name>.tsx           # 单组件 demo section（default export defineSection 对象）
│   └── main.tsx, index.html
├── docs/
│   ├── llms.md                  # AI 文档索引（自动生成，不手改）
│   ├── llms/<id>.md             # AI 单组件文档（自动生成，不手改）
│   ├── api.md / components.md / tokens.md / electron.md  # 人工手写的用户文档（逐步被 llms 替代）
├── scripts/
│   ├── gen-llms-doc.mjs         # 从 playground/sections/*.tsx 生成 docs/llms/*
│   └── *.mjs                    # 其他一次性迁移脚本
├── llms.txt                     # llmstxt.org 规范索引（给 crawler）
├── tsup.config.ts               # 库构建配置
├── vite.config.ts               # Playground 配置（alias `lumina` → src/index.ts 和 `lumina/styles` → src/styles/index.css）
└── CLAUDE.md                    # ← 你正在读的这份
```

## 开发命令

```bash
npm run dev          # 启动 playground 热更新（http://localhost:5173）
npm run typecheck    # tsc --noEmit 全量类型检查
npm run build:lib    # tsup 构建库 → dist/（自动生成 ESM + CJS + .d.ts + .d.cts + styles.css）
npm run gen:docs     # 从 playground/sections 生成 docs/llms.md 和 docs/llms/<id>.md
npm run build        # Vite 构建 playground（一般用不上）
```

`prepublishOnly` 串联发布前必过的三步：`typecheck && gen:docs && build:lib`。执行 `npm publish` 会自动先跑这三步，**不要用 `--ignore-scripts` 跳过**。

## 组件开发规范

### 新增一个组件的完整流程

1. 在 `src/components/` 下新建 `<Name>/` 目录，放三个文件：
   - `<Name>.tsx`、`<Name>.css`、`index.ts`
2. `<Name>.tsx` 顶部按以下顺序导入（**不能省略**，否则单独 `import "@fangxinyan/lumina/<Name>"` 时样式会丢）：
   ```tsx
   import "../../styles/tokens.css";
   import "../../styles/shared.css";
   import "./<Name>.css";
   import * as React from "react";
   ```
3. 用 `React.forwardRef` 声明组件，接口命名 `<Name>Props`，extends 合适的 HTML attrs。
4. `index.ts` 内容固定：`export * from "./<Name>";`
5. 在 `src/index.ts` 末尾加一行 `export * from "./components/<Name>";`
6. 在 `playground/sections/` 下新建一个 `<name>.tsx` demo section。
7. （可选）在 `docs/api.md` 追加 API 说明。

tsup 会自动扫描 `src/components/*` 目录作为独立入口，**无需手动改** `tsup.config.ts`。

### Playground 同步规则（强约束）

**任何影响组件对外行为的改动都要同步到 `playground/sections/<name>.tsx`**，以便肉眼回归、并作为使用者的即时文档：

- **新增组件** → 在 `playground/sections/` 下新建一个 `<name>.tsx`，`export default defineSection({...})`。`_registry.ts` 会自动扫描到，不用改 App.tsx。
- **新增 prop / 新增 variant / 新增子组件** → 在对应 section 的 `demos` 数组里加一个最小可见的演示。
- **改 API 形状（prop 重命名、类型变更、默认值调整）** → 更新现有 demo 的用法，删掉失效示例。
- **只改 CSS / 视觉调优** → 不必改 section，但要自己 `npm run dev` 目视确认效果。

缺失 demo 的改动不算完成，即便类型检查和构建都过。

### AI / LLM 文档同步规则

面向 AI 编程助手(Claude Code / Cursor / Copilot 等)的文档有两层,都**不手写**,由 `scripts/gen-llms-doc.mjs` 从 `playground/sections/*.tsx` 自动生成:

- `docs/llms.md` — **索引文件**: 全局约定 + 组件列表 + 链接
- `docs/llms/<id>.md` — **单组件文档**: 每个组件一份,包含导入 / 示例 / 完整 Props 表

**工作流**:
- 改过 playground demo 后,跑 `npm run gen:docs` 刷新。脚本会清空 `docs/llms/` 并重新写全部文件。
- 发布流程 (`prepublishOnly`) 已内置 gen:docs,`npm publish` 会自动带上最新文档。
- 两份生成物都通过 npm 包的 `exports` 和 `files` 字段打包给消费者:
  - 索引: `@fangxinyan/lumina/llms.md` 或 `node_modules/@fangxinyan/lumina/docs/llms.md`
  - 单组件: `@fangxinyan/lumina/llms/<id>.md` 或 `node_modules/@fangxinyan/lumina/docs/llms/<id>.md`
- **不要手工编辑 `docs/llms.md` 或 `docs/llms/*.md`** — 下次生成时会被全量覆盖。真正的"源"是 playground section 里传给 `<DocPage demos api />` 的对象字面量。
- 根目录的 `llms.txt` 是给 LLM crawler 看的索引(遵循 <https://llmstxt.org/> 规范)。
- **新增或暴露新的公共组件 / 子组件 / 组合组件时，必须同时满足四件事**：`src/index.ts` 有导出；`playground/sections/<id>.tsx` 有 section；`npm run gen:docs` 后生成对应 `docs/llms/<id>.md`；`docs/llms.md` 能索引到它。缺任何一项都不算完成。
- **若导出名不是 dist 文件名本身**（例如复合导出、同文件附带导出），还要同步检查 `scripts/gen-llms-doc.mjs` 里的导入名映射，不能只让“主组件”出现在文档里。

### TypeScript 约定

- 所有导出的 props 接口必须 `export`，用户需要能 import。
- 默认值用参数解构默认值写在函数签名里，不要在函数体内判空。
- 所有**渲染真实 DOM 根节点**的公共组件必须用 `React.forwardRef` 暴露根节点 ref，并把 ref 真正落到外层 DOM；只有纯 provider / hook 容器（如 `ThemeProvider`）可以例外。
- 这类组件的 `Props` 必须继承合适的原生 attrs，并保证消费者至少能传 `className` / `style` / `id` / `data-*` / `aria-*`。如果业务 prop 与原生 prop 同名，必须显式 `Omit` 冲突键。
- 对 React 原生 prop 的重命名要用 `Omit<..., "size" | "onChange">` 避开冲突（参考 `Button.tsx` / `Input.tsx`）。
- 公共 API 加简短 JSDoc，用 `@example` 给一个最小示例（现有组件都是这么写的）。

### 样式约定

- 所有颜色/阴影/间距/圆角走 `var(--xxx)`，**绝对不要**硬编码色值。可用变量见 `src/styles/tokens.css`。
- 组件 class 名小写短词，避免嵌套过深。Button 的 class 是 `.btn`、`.btn.primary`、`.btn.sm`，而不是 BEM。
- 深浅模式靠 `[data-theme="dark"]` 选择器覆写 tokens，不要在组件 CSS 里写 `@media (prefers-color-scheme)`。
- 如需动画，优先复用 `src/styles/shared.css` 里的 keyframes（`spin` / `fadeIn` / `menuIn`）。
- `@fangxinyan/lumina/styles` 表示**完整样式入口**：`tokens + base + shared + 全部组件样式`；`@fangxinyan/lumina/tokens` 只表示**设计令牌**，**不包含** reset / scrollbar / focus-visible 基线样式。
- 任何改动只要触及样式入口语义（`styles` / `tokens`）、`src/styles/*`、或相关文档描述，都必须同步检查 `package.json.exports` 与 `docs/llms.md`，避免“代码语义”和“文档语义”漂移。

### 主题系统

- `<ThemeProvider>` + `useTheme()` 管理运行时主题。
- 静态样式切换通过 `<html data-theme="dark" data-accent="sky" data-density="compact">` 属性。
- `data-accent`：`rose | sky | coral | mint | violet | amber`
- `data-density`：`compact | comfortable | spacious`
- 运行时可通过 `applyTheme(element, {...})` 对任意元素挂主题（命令式 API）。

### 内部组件复用规范（强约束）

**新组件 / 新 demo / playground section 的任何内部实现,凡能用已存在的 Lumina 组件就必须用,不许裸写 HTML 等价物。**

**为什么**:库内自造控件会直接继承全局样式(比如 `:focus-visible` 会给裸 `<input>` 套一圈 accent-glow),看起来像"原生控件"而非拟态;且主题 / 密度 / 强调色都通过 tokens 联动,自己写一遍只会和主题脱节。早期 CommandPalette 用裸 `<input>` 就是这个坑——换成 `Input` 之后凹陷槽、focus 光晕、尺寸变体全都自动对齐。

**常见对应关系**:

| 别手写 | 用这个 |
|---|---|
| `<input type="text">` / `<input type="password">` / 搜索框 | `Input`(带 `leadingIcon / trailingIcon / prefix / suffix / size / allowClear`) |
| 多行文本 | `Textarea` |
| 裸 `<button>` | `Button` / `IconButton` |
| 自己画图标 SVG | `Icon`(按 `IconName` 联合类型取) |
| 下拉菜单 / 弹出面板 | `Select` / `Popover`(或参考"浮层定位规范"自己写) |
| 列表 + 选中态 | `List` / `Sidebar` |
| 标签页 | `Tabs` |
| 小 tag / badge | `Tag` / `Badge` |
| alert / 错误提示条 | `Alert` |
| toast / 瞬时通知 | `toast.success / error / info / warning` |
| 图标按钮带 tooltip | `IconButton tip="..."`(自带 Tooltip) |

**新增 Electron / 大型组合组件时尤其注意**:像 CommandPalette 这种"搜索 + 列表 + 快捷键"的复合件,搜索条必须走 `Input`,list item 的激活态参考 Sidebar 的 `var(--neu-in-sm)` 写法,不要凭空造一套。

**唯一例外**:组件内部确实有特殊视觉要求、且现有组件的 API 不够灵活(例如 CommandPalette 的底部 `kbd` 键帽),才允许写原生 DOM + 手写样式,并且样式必须复用 tokens(`--neu-flat` / `var(--bg)` / `var(--fg-muted)` 等),不许硬编码。

### 浮层定位规范（强约束）

**所有弹出层组件**（Tooltip / Popover / Select / Cascader / ColorPicker / 新建的任何下拉菜单 / 弹出面板）**必须使用 `useFloating` + `createPortal` 组合**，不要用 `position: absolute`。

**为什么**：消费者经常把我们的组件放在带 `overflow: hidden` 的容器里（卡片、抽屉、对话框、虚拟滚动列表）。绝对定位的浮层一旦超出父容器就被裁切。

**怎么做**：
```tsx
import { useFloating } from "../../utils/useFloating";
import { createPortal } from "react-dom";

const { triggerRef, floatingStyle, placement } = useFloating<HTMLDivElement>({
  open,
  placement: "bottom",     // 首选方向
  panelWidth, panelHeight, // 用于 flip / shift 判断，估计值即可
  matchTriggerWidth,       // Select / Cascader / 任何"菜单宽度跟 trigger"场景
  alignCross: "center",    // Tooltip / Popover 需要视觉居中时
});

// 触发器
<button ref={triggerRef} onClick={...}>...</button>

// 浮层 — 一定要 Portal 到 body
{open && createPortal(
  <div className="your-panel" style={floatingStyle}>...</div>,
  document.body
)}
```

Hook 免费提供：
- Portal 渲染位置（脱离父容器 overflow clip）
- `position: fixed` + 视口坐标
- **flip** — 首选方向放不下自动翻到反面
- **shift** — 横/纵向钳位到视口边缘
- `scroll` / `resize` 时自动更新位置

**CSS 侧**：浮层的 class **不要**写 `position: absolute` 或 `.xxx.top / .bottom / .left / .right` 的定位 offset —— 坐标由 inline `floatingStyle` 给。保留 className 仅用于指示方向（比如 arrow 朝向）。

## 构建产物 & 打包策略

- 当前 dist 是**扁平结构**（`dist/Button.js`、`dist/Button.css` 等），`package.json` 的 `exports` 用 `./*` 通配。
- `./*` 通配**只覆盖“导出名 = dist 文件名”** 的场景；凡是复合导出 / 同文件附带导出（例如 `Badge`、`IconButton`、`TablePro`、`StatusBarItem`），如果希望支持 `@fangxinyan/lumina/<Name>`，就必须在 `package.json.exports` 里加显式 alias，不能假设通配自动生效。
- 如需按 Ant Design 风格改成 `dist/es/components/Button/`、`dist/lib/...` 分目录，需要重写 tsup 配置或加 post-build 脚本（当前未做，只有讨论过）。
- `sideEffects: ["*.css"]` 告诉打包器 CSS 导入有副作用，不要摇掉。JS 部分则完全可 tree-shake。

## 发布前验收清单（强约束）

- 任何影响公共 API / props / 导出 / 样式入口 / playground / 文档的改动，结束前至少执行：`npm run typecheck`、`npm run gen:docs`、`npm run build:lib`。
- 若改动涉及 **ref / DOM attrs / 子路径导出 / docs 映射 / Vite chunk**，还必须额外执行：`npm run build`。
- 若改动涉及公共组件对外契约，至少写一个本地 **TypeScript smoke snippet** 验证 `ref`、`className`、`style`、`data-*` 可正常通过类型检查。
- 若改动涉及子路径导出，必须对受影响符号实际做一次 `require.resolve("@fangxinyan/lumina/<Name>")`（或等价解析检查），不要只看 `src/index.ts` 是否导出了它。
- 若改动涉及 playground live demo / `@babel/standalone` / Prism / `vite.config.ts` 分包策略，必须确认 `npm run build` 没有新增的 chunk warning 或 circular chunk warning。
- 未通过上述检查的改动不算完成，即使页面能跑、类型大体能过也一样。

## 发布到 npm

```bash
# 正式发布走 GitHub Actions
npm version patch              # 自动改 package.json + 打 git tag (vX.Y.Z)
git push --follow-tags         # 推送 tag 后触发 .github/workflows/publish.yml
```

- **正式发布以 GitHub Actions 为准**，工作流文件是 `.github/workflows/publish.yml`。
- 触发方式：`push` 一个 `v*` tag，或在 GitHub Actions 页面手动 `workflow_dispatch`。
- CI 发布前会执行：`npm ci` → `npm run typecheck` → `npm run gen:docs` → `npm run build:lib` → `npm publish --provenance --access public`。
- 本地 `npm publish` **不是默认发布路径**；除非在排查 CI / registry 问题，否则不要把手工本地发布当成常规流程。
- 如果改了发布脚本、npm 产物、`files` / `exports`、或发布前校验步骤，必须同步检查 `.github/workflows/publish.yml`，不要只改本地命令说明。

`package.json` 中关键字段：
- `"name": "@fangxinyan/lumina"` — scope 必须匹配 npm 用户名
- `"publishConfig": { "access": "public" }` — scope 包默认私有，这个字段必须设成 public
- `"files": ["dist", "docs/llms.md", "docs/llms", "README.md", "LICENSE"]` — 发布构建产物与 LLM 文档，不发源码

**注意**：发布前确保 `src/index.ts` 里的 `VERSION` 常量和 `package.json` 的 `version` 保持一致（目前是手动同步的）。

## Git 工作流

- 主分支 `main`，远程 `origin` 指向 GitHub 的 `LHorTL/lumina` 仓库。
- 日常提交：直接在 `main` 开发。大改动可用特性分支。
- `dist/` 已加入 `.gitignore`，不要提交构建产物。

## 不要做的事

- ❌ 不要在组件 CSS 里硬编码颜色 —— 永远用 `var(--xxx)`，否则主题切换失效。
- ❌ 不要在组件 `.tsx` 里漏掉 `import "../../styles/tokens.css"` —— 单独按组件 import 时会样式丢失。
- ❌ 不要引入运行时依赖（lodash、classnames、clsx 等）—— 库承诺零运行时依赖。
- ❌ 不要 `git commit` `dist/` 或 `node_modules/`。
- ❌ 发布时不要跳过 `prepublishOnly`（即不要用 `--ignore-scripts`），否则 dist 可能是旧的。
- ❌ 不要在未确认的情况下 `npm publish` —— 版本号一旦发布就永久占位，72 小时后不能 unpublish。

## 常见 bug 排查

- **playground 报 `Cannot resolve "lumina"`** → 检查 `vite.config.ts` 的 alias 是否还在；应该有 `lumina` 和 `lumina/styles` 两条。
- **消费方 `import` 成功但没样式** → 消费方忘了 `import "@fangxinyan/lumina/styles"`，或没走打包器（Node.js 直接跑会报 `ERR_UNKNOWN_FILE_EXTENSION: .css`，这是正常现象）。
- **类型提示缺失** → 检查 `dist/` 里有没有对应 `.d.ts`；可能是 `npm run build:lib` 没跑完或跑失败了。
- **构建时 `tokens.css` 没被内联** → tsup 的 `onSuccess` hook 里有 PostCSS + postcss-import 处理，确认 `dist/styles.css` 不是空的。
