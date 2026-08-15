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
    expect(modalCss).toContain("margin-inline: calc(var(--overlay-shadow-safe-area) * -1)");
    expect(modalCss).toContain("overflow-x: hidden");
    expect(modalCss).toMatch(
      /\.modal-body\.default-overflow > \* \{[\s\S]*?flex-shrink: 0;/
    );
    expect(modalCss).not.toMatch(
      /\.modal-body:last-child \{[\s\S]*?margin-bottom: calc\(var\(--gap-6\) \* -1\);/
    );
    expect(modalCss).toMatch(
      /\.modal-foot \{[\s\S]*?min-height: var\(--lmn-modal-footer-min-height, var\(--ctrl-h\)\);[\s\S]*?margin-top: var\(--lmn-modal-footer-gap, var\(--gap-4\)\);[\s\S]*?align-items: center;/
    );
    expect(drawerCss).toContain("overflow: hidden");
    expect(drawerCss).toContain("padding: var(--overlay-shadow-safe-area)");
    expect(drawerCss).toContain("overflow: auto");
  });

  it("静态浅色与深色主题使用收紧后的默认拟态阴影尺寸", () => {
    const tokensCss = fs.readFileSync(
      path.join(ROOT, "src", "styles", "tokens.css"),
      "utf8"
    );

    expect(tokensCss).toContain("--shadow-offset: calc(5px * var(--d) * var(--shadow-scale))");
    expect(tokensCss).toContain("--shadow-blur: calc(12px * var(--d) * var(--shadow-scale))");
    expect(tokensCss).toContain("--shadow-inset-offset: calc(3px * var(--d) * var(--shadow-scale))");
    expect(tokensCss).toContain("--shadow-inset-blur: calc(8px * var(--d) * var(--shadow-scale))");
    expect(tokensCss).toContain("--shadow-offset: calc(3px * var(--d) * var(--shadow-scale))");
    expect(tokensCss).toContain("--shadow-blur: calc(8px * var(--d) * var(--shadow-scale))");
    expect(tokensCss).toContain("--shadow-inset-offset: calc(2px * var(--d) * var(--shadow-scale))");
    expect(tokensCss).toContain("--shadow-inset-blur: calc(5px * var(--d) * var(--shadow-scale))");
    expect(tokensCss).toContain("0.75px 0.75px 1.5px var(--shadow-dark)");
  });

  it("Select 选项高亮使用内阴影，避免滚动边缘裁掉左上高光", () => {
    const selectCss = fs.readFileSync(
      path.join(ROOT, "src", "components", "Select", "Select.css"),
      "utf8"
    );

    expect(selectCss).toMatch(
      /\.menu-item-row\.highlight:not\(\.disabled\)[\s\S]*?box-shadow: var\(--lmn-select-neu-shadow-inset, var\(--neu-shadow-inset\)\);/
    );
    expect(selectCss).toMatch(
      /\.menu-item-row:hover:not\(\.disabled\)[^\n]*box-shadow: var\(--lmn-select-neu-shadow-inset, var\(--neu-shadow-inset\)\);/
    );
  });

  it("ThemePanel 演示滚动区按实际浮起阴影预留安全区", () => {
    const playgroundCss = fs.readFileSync(
      path.join(ROOT, "playground", "playground.css"),
      "utf8"
    );

    expect(playgroundCss).toContain("--demo-theme-panel-shadow-safe-area");
    expect(playgroundCss).toContain("padding: var(--demo-theme-panel-shadow-safe-area)");
    expect(playgroundCss).toContain("overflow: auto");
    expect(playgroundCss).toMatch(
      /\.demo-theme-panel-scroll > \.theme-panel \{[\s\S]*?min-width: 280px;/
    );
    expect(playgroundCss).toContain("scrollbar-gutter: stable");
  });

  it("Checkbox 在已选和半选错误态下保留危险色错误环", () => {
    const checkboxCss = fs.readFileSync(
      path.join(ROOT, "src", "components", "Checkbox", "Checkbox.css"),
      "utf8"
    );

    expect(checkboxCss).toMatch(
      /\.checkbox\.checked\.invalid \.checkbox-box,[\s\S]*?\.checkbox\.indeterminate\.invalid \.checkbox-box \{[\s\S]*?var\(--lmn-checkbox-danger, var\(--danger\)\)/
    );
  });
});
