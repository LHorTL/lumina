# Lumina

> A neumorphic React + TypeScript component library designed for Electron desktop apps.

柔和、温润的拟态（Neumorphism）风格组件库，使用 **React 18** + **TypeScript**，开箱即用地适配 **Electron** 桌面应用场景 —— 包含窗口标题栏、侧边栏、抽屉、弹窗等桌面级组件。

> **🤖 AI coding assistants**: this package ships a **per-component LLM reference** designed for on-demand reading, so you don't have to pull the full API dump every time.
>
> - **Index** (global conventions + component list): `node_modules/@fangxinyan/lumina/docs/llms.md`
>   — subpath export `@fangxinyan/lumina/llms.md`
> - **Per-component docs** (import / runnable examples / full props table): `node_modules/@fangxinyan/lumina/docs/llms/<id>.md`
>   — subpath export `@fangxinyan/lumina/llms/<id>.md` (e.g. `.../llms/button.md`, `.../llms/table.md`)
>
> Online raw URLs:
> <https://raw.githubusercontent.com/LHorTL/lumina/main/docs/llms.md>
> <https://raw.githubusercontent.com/LHorTL/lumina/main/docs/llms/button.md>

## ✨ 特性

- **TypeScript 优先** — 全量类型定义，IDE 智能提示完善
- **拟态设计语言** — 统一的凸起/凹陷/柔光阴影系统，通过 CSS 变量自定义
- **45+ 公共组件** — Button、Input、Table、Modal、Message、Calendar …
- **Electron 原生感** — `TitleBar`、`Sidebar`、`AppShell` 直接拼出窗口布局
- **主题化** — 明/暗模式、6 套强调色、3 档密度（紧凑/标准/宽松）
- **零运行时依赖** — 只依赖 React；样式纯 CSS 变量驱动

## Why Lumina matters for AI-assisted development

Lumina 不只是把组件打成 npm 包，也把“AI 能按需读懂组件”的上下文一起发布出去。

- **内置 LLM 文档** — 每个组件都有独立 `docs/llms/<id>.md`，覆盖导入方式、可复制示例和完整 Props 表，AI 不必一次读取整份 API。
- **按需组件文档** — `@fangxinyan/lumina/llms.md` 提供全局约定和组件索引，`@fangxinyan/lumina/llms/button.md` 这类子路径可直接定位到单组件。
- **零运行时依赖** — 运行时只依赖 React / React DOM，组件逻辑、主题 token 和样式入口都更容易被 AI 审查、迁移和解释。
- **Electron 场景优先** — `TitleBar`、`WindowControls`、`Sidebar`、`StatusBar`、`AppShell` 等桌面应用原语减少了业务侧临时拼装窗口 UI 的成本。

## 📦 安装

```bash
npm install @fangxinyan/lumina
# 或
pnpm add @fangxinyan/lumina
# 或
yarn add @fangxinyan/lumina
```

Peer deps: `react@>=18`, `react-dom@>=18`.

## 🚀 快速上手

```tsx
import { Button, Card, toast, ToastContainer } from "@fangxinyan/lumina";
import "@fangxinyan/lumina/styles"; // 全局样式 + 设计令牌

export default function App() {
  return (
    <>
      <Card padding="lg">
        <h2>欢迎使用 Lumina</h2>
        <Button variant="primary" onClick={() => toast.success("你好！")}>
          点我
        </Button>
      </Card>
      <ToastContainer />
    </>
  );
}
```

## 🛠 本地开发（下载即用）

```bash
cd lumina
npm install
npm run dev          # 启动 Playground（http://localhost:5173）
npm run typecheck    # 类型检查
npm run build:lib    # 构建库 → dist/（ESM + CJS + .d.ts）
```

> Vite 已配置好 `lumina` 的别名，直接指向 `src/index.ts`。
> 你修改 `src/components/*.tsx` 或 `src/styles/*.css`，Playground 会即时热更新。

项目结构：

```
lumina/
├── src/
│   ├── components/       # 每个组件一个目录，包含 .tsx / .css / index.ts
│   ├── styles/
│   │   ├── tokens.css    # 设计令牌（主题 / 颜色 / 阴影 / 间距）
│   │   ├── base.css      # 基础样式（body / scrollbar / focus）
│   │   ├── shared.css    # 共享动画 / 跨组件样式
│   │   └── index.css     # 完整样式入口
│   └── index.ts          # 公共出口
├── playground/           # 本地演示应用（Vite）
├── docs/                 # 组件文档 & API 文档
├── scripts/              # 文档生成 / 公开 API 校验脚本
├── tsup.config.ts        # 库构建配置
└── vite.config.ts        # Playground 开发服务器
```

## 🎨 主题定制

所有设计令牌都在 `:root` 上定义，可以通过 `data-*` 属性切换主题：

```html
<html data-theme="dark" data-theme-mode="graphite" data-accent="sky" data-density="compact">
```

- `data-theme`: `light` | `dark`
- `data-theme-mode`: 当前模式名，例如 `light` / `dark` / `system` / 自定义模式名
- `data-accent`: `rose` | `sky` | `coral` | `mint` | `violet` | `amber`
- `data-density`: `compact` | `comfortable` | `spacious`

覆写任意 CSS 变量即可局部定制：

```css
.my-scope {
  --accent: oklch(72% 0.18 200);
  --r-md: 12px;
  --d: 0.8; /* 阴影强度乘数 */
}
```

## 📚 文档

- **[🤖 AI / LLM 组件参考(索引)](./docs/llms.md)** — 全局约定 + 完整组件索引
- **[单组件文档](./docs/llms/)** — 每个组件一份 `.md`,AI 按需读取(例如 [`llms/button.md`](./docs/llms/button.md))
- [设计令牌](./docs/tokens.md)
- [Electron 集成](./docs/electron.md)

## 📄 许可证

MIT
