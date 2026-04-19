# Lumina

> A neumorphic React + TypeScript component library designed for Electron desktop apps.

柔和、温润的拟态（Neumorphism）风格组件库，使用 **React 18** + **TypeScript**，开箱即用地适配 **Electron** 桌面应用场景 —— 包含窗口标题栏、侧边栏、抽屉、弹窗等桌面级组件。

## ✨ 特性

- **TypeScript 优先** — 全量类型定义，IDE 智能提示完善
- **拟态设计语言** — 统一的凸起/凹陷/柔光阴影系统，通过 CSS 变量自定义
- **25+ 基础组件** — Button、Input、Table、Modal、Toast、Calendar …
- **Electron 原生感** — `TitleBar`、`Sidebar`、`AppShell` 直接拼出窗口布局
- **主题化** — 明/暗模式、6 套强调色、3 档密度（紧凑/标准/宽松）
- **零运行时依赖** — 只依赖 React；样式纯 CSS 变量驱动

## 📦 安装

```bash
npm install lumina
# 或
pnpm add lumina
# 或
yarn add lumina
```

Peer deps: `react@>=18`, `react-dom@>=18`.

## 🚀 快速上手

```tsx
import { Button, Card, toast, ToastContainer } from "lumina";
import "lumina/styles"; // 全局样式 + 设计令牌

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
cd package
npm install
npm run dev          # 启动 Playground（http://localhost:5173）
npm run typecheck    # 类型检查
npm run build:lib    # 构建库 → dist/（ESM + CJS + .d.ts）
```

> Vite 已配置好 `lumina` 的别名，直接指向 `src/index.ts`。
> 你修改 `src/components/*.tsx` 或 `src/styles/*.css`，Playground 会即时热更新。

项目结构：

```
package/
├── src/
│   ├── components/       # 所有 .tsx 组件源码
│   ├── styles/
│   │   ├── tokens.css    # 设计令牌（主题 / 颜色 / 阴影 / 间距）
│   │   ├── base.css      # 基础样式（body / scrollbar / focus）
│   │   └── components/   # 每个组件对应一个 .css 文件
│   └── index.ts          # 公共出口
├── playground/           # 本地演示应用（Vite）
├── docs/                 # 组件文档 & API 文档
├── tsup.config.ts        # 库构建配置
└── vite.config.ts        # Playground 开发服务器
```

## 🎨 主题定制

所有设计令牌都在 `:root` 上定义，可以通过 `data-*` 属性切换主题：

```html
<html data-theme="dark" data-accent="sky" data-density="compact">
```

- `data-theme`: `light` | `dark`
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

- [组件清单](./docs/components.md)
- [API 参考](./docs/api.md)
- [设计令牌](./docs/tokens.md)
- [Electron 集成](./docs/electron.md)

## 📄 许可证

MIT
