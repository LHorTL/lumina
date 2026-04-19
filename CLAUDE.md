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
softkit/
├── src/
│   ├── components/<Name>/     # 每个组件独占一个目录
│   │   ├── <Name>.tsx         # 组件代码（必须 forwardRef）
│   │   ├── <Name>.css         # 组件独立样式
│   │   └── index.ts           # `export * from "./<Name>";`
│   ├── styles/
│   │   ├── tokens.css         # 设计令牌（色/阴影/间距/圆角），:root + [data-theme="dark"]
│   │   ├── base.css           # 全局 reset / 滚动条 / focus-visible
│   │   ├── shared.css         # 跨组件共享 keyframes
│   │   └── index.css          # 汇总入口，@import 上述三个
│   └── index.ts               # 公共出口 barrel
├── playground/                # Vite 演示站（`npm run dev`）
│   ├── App.tsx                # 外壳 + TweaksPanel + 主题调试
│   ├── sections.tsx           # 所有组件的 demo 分区
│   ├── docs.tsx               # 文档展示组件（AnchorNav、DemoCard 等）
│   └── main.tsx, index.html
├── docs/                      # 用户文档（api.md / components.md / tokens.md / electron.md）
├── scripts/                   # 构建/迁移辅助脚本（.mjs）
├── tsup.config.ts             # 库构建配置
└── vite.config.ts             # Playground 配置（含 `lumina` / `lumina/styles` 别名）
```

## 开发命令

```bash
npm run dev          # 启动 playground 热更新（http://localhost:5173）
npm run typecheck    # tsc --noEmit 全量类型检查
npm run build:lib    # tsup 构建库 → dist/
npm run build        # Vite 构建 playground（一般用不上）
```

发布流程内置在 `prepublishOnly`：执行 `npm publish` 会自动先跑 `typecheck` + `build:lib`。

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
6. 在 `playground/sections.tsx` 加一个 demo section。
7. （可选）在 `docs/api.md` 追加 API 说明。

tsup 会自动扫描 `src/components/*` 目录作为独立入口，**无需手动改** `tsup.config.ts`。

### TypeScript 约定

- 所有导出的 props 接口必须 `export`，用户需要能 import。
- 默认值用参数解构默认值写在函数签名里，不要在函数体内判空。
- 对 React 原生 prop 的重命名要用 `Omit<..., "size" | "onChange">` 避开冲突（参考 `Button.tsx` / `Input.tsx`）。
- 公共 API 加简短 JSDoc，用 `@example` 给一个最小示例（现有组件都是这么写的）。

### 样式约定

- 所有颜色/阴影/间距/圆角走 `var(--xxx)`，**绝对不要**硬编码色值。可用变量见 `src/styles/tokens.css`。
- 组件 class 名小写短词，避免嵌套过深。Button 的 class 是 `.btn`、`.btn.primary`、`.btn.sm`，而不是 BEM。
- 深浅模式靠 `[data-theme="dark"]` 选择器覆写 tokens，不要在组件 CSS 里写 `@media (prefers-color-scheme)`。
- 如需动画，优先复用 `src/styles/shared.css` 里的 keyframes（`spin` / `fadeIn` / `menuIn`）。

### 主题系统

- `<ThemeProvider>` + `useTheme()` 管理运行时主题。
- 静态样式切换通过 `<html data-theme="dark" data-accent="sky" data-density="compact">` 属性。
- `data-accent`：`rose | sky | coral | mint | violet | amber`
- `data-density`：`compact | comfortable | spacious`
- 运行时可通过 `applyTheme(element, {...})` 对任意元素挂主题（命令式 API）。

## 构建产物 & 打包策略

- 当前 dist 是**扁平结构**（`dist/Button.js`、`dist/Button.css` 等），`package.json` 的 `exports` 用 `./*` 通配。
- 如需按 Ant Design 风格改成 `dist/es/components/Button/`、`dist/lib/...` 分目录，需要重写 tsup 配置或加 post-build 脚本（当前未做，只有讨论过）。
- `sideEffects: ["*.css"]` 告诉打包器 CSS 导入有副作用，不要摇掉。JS 部分则完全可 tree-shake。

## 发布到 npm

```bash
# 前置：确保 npm whoami 是 fangxinyan
npm whoami

# 首次或版本升级
npm version patch              # 自动改 package.json + 打 git tag
npm publish                    # prepublishOnly 会先跑 typecheck + build:lib
git push --follow-tags
```

`package.json` 中关键字段：
- `"name": "@fangxinyan/lumina"` — scope 必须匹配 npm 用户名
- `"publishConfig": { "access": "public" }` — scope 包默认私有，这个字段必须设成 public
- `"files": ["dist", "README.md", "LICENSE"]` — 只发这三样，源码不发

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
