# Electron 集成指南

`lumina` 在设计时针对 Electron 桌面应用做了专门优化。本指南介绍如何把窗口标题栏、侧边栏、主题切换等组件无缝接入你的 Electron 工程。

## 1. 隐藏系统标题栏

在主进程创建 `BrowserWindow` 时：

```js
// main.js
const win = new BrowserWindow({
  width: 1200,
  height: 800,
  titleBarStyle: "hiddenInset", // macOS: 保留红绿灯位置占位
  // 或 frame: false（Windows/Linux: 完全无边框）
  webPreferences: { preload: path.join(__dirname, "preload.js") },
});
```

## 2. 暴露窗口控制 API（preload）

```js
// preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("winApi", {
  minimize: () => ipcRenderer.send("win:minimize"),
  maximize: () => ipcRenderer.send("win:maximize"),
  close:    () => ipcRenderer.send("win:close"),
});
```

主进程监听：

```js
const { ipcMain, BrowserWindow } = require("electron");
ipcMain.on("win:minimize", (e) => BrowserWindow.fromWebContents(e.sender)?.minimize());
ipcMain.on("win:maximize", (e) => {
  const w = BrowserWindow.fromWebContents(e.sender);
  w?.isMaximized() ? w.unmaximize() : w?.maximize();
});
ipcMain.on("win:close",    (e) => BrowserWindow.fromWebContents(e.sender)?.close());
```

## 3. 在 React 中使用 `AppShell + TitleBar`

```tsx
import { AppShell, TitleBar, Sidebar, Icon } from "lumina";
import "lumina/styles";

declare global {
  interface Window {
    winApi?: {
      minimize(): void;
      maximize(): void;
      close(): void;
    };
  }
}

export default function Shell() {
  return (
    <AppShell
      titleBar={
        <TitleBar
          title="我的应用"
          platform={process.platform === "darwin" ? "mac" : "windows"}
          onMinimize={() => window.winApi?.minimize()}
          onMaximize={() => window.winApi?.maximize()}
          onClose={() => window.winApi?.close()}
        />
      }
      sidebar={
        <Sidebar
          activeKey="home"
          items={[
            { key: "home", label: "首页", icon: <Icon name="home" /> },
            { key: "files", label: "文件", icon: <Icon name="folder" /> },
            { key: "settings", label: "设置", icon: <Icon name="settings" /> },
          ]}
        />
      }
    >
      <YourPages />
    </AppShell>
  );
}
```

## 4. 拖拽区域

`TitleBar` 默认给自己加了 `-webkit-app-region: drag`，内部的按钮区域自动标记为 `no-drag`。如果你在标题栏里放自定义内容：

- 默认不可拖拽的元素（按钮、输入框、link）可以保持原样。
- 如果你放了一个大面积的 `<div>` 又希望它不拖，包一层 `style={{ WebkitAppRegion: "no-drag" }}`。
- 反之如果在主体里想加一个自定义拖拽条，`style={{ WebkitAppRegion: "drag" }}`。

## 5. 跟随系统主题

```tsx
import { useEffect, useState } from "react";

export function useSystemTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const h = (e: MediaQueryListEvent) => setTheme(e.matches ? "dark" : "light");
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  return theme;
}
```

## 6. 在 Electron 中禁用拖放 / 右键菜单

拟态风格的组件不提供默认右键菜单，你可以在主进程侧统一禁用：

```js
app.on("web-contents-created", (_, contents) => {
  contents.on("context-menu", (e) => e.preventDefault());
});
```

## 7. 打包注意

- `lumina` 无 native 依赖，直接被 Vite / Webpack / esbuild 打包即可。
- 样式通过 `import "lumina/styles"`，确保你的打包器能解析 CSS（Vite 默认支持）。
- 图标使用内联 SVG，无需额外 font / icon 资源。
