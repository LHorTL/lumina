import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

describe("完整样式入口", () => {
  it("包含每一个组件目录中的 CSS 文件", () => {
    const componentsRoot = path.join(ROOT, "src", "components");
    const entrySource = fs.readFileSync(path.join(ROOT, "src", "styles", "index.css"), "utf8");
    const missing = fs
      .readdirSync(componentsRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .flatMap((entry) => {
        const cssName = `${entry.name}.css`;
        const cssPath = path.join(componentsRoot, entry.name, cssName);
        if (!fs.existsSync(cssPath)) return [];
        const expectedImport = `@import "../components/${entry.name}/${cssName}";`;
        return entrySource.includes(expectedImport) ? [] : [entry.name];
      });

    expect(missing).toEqual([]);
  });

  it("由 Modal 和 Drawer 正文滚动区统一保护拟态阴影", () => {
    const modalCss = fs.readFileSync(
      path.join(ROOT, "src", "components", "Modal", "Modal.css"),
      "utf8"
    );
    const drawerCss = fs.readFileSync(
      path.join(ROOT, "src", "components", "Drawer", "Drawer.css"),
      "utf8"
    );

    expect(modalCss).toContain("--overlay-shadow-safe-area");
    expect(modalCss).toContain("padding: var(--overlay-shadow-safe-area)");
    expect(drawerCss).toContain("overflow: hidden");
    expect(drawerCss).toContain("padding: var(--overlay-shadow-safe-area)");
    expect(drawerCss).toContain("overflow: auto");
  });
});
