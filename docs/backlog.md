# Lumina 待开发项

> 只记录尚未开发的工作项；不表示已实现。

| ID | 状态 | 优先级 | 主题 | 范围 | 完成标准 |
| --- | --- | --- | --- | --- | --- |
| VISUAL-001 | 待评估 | P2 | 自动化视觉回归 | 在不启动独立 Playwright 浏览器的前提下，为视觉敏感组件建立可维护的截图基线 | 1. 方案兼容 Codex 内置浏览器 / Electron 页面验收约束；2. 覆盖 `Tooltip/Popover/Select/Cascader/ColorPicker/Modal/Drawer/AppShell`；3. 基线更新与差异审阅流程明确；4. 不与现有单元测试和 CI 重复。 |

## 已完成的测试基础设施

| 项 | 内容 |
| --- | --- |
| 行为测试 | 已引入 `Vitest + Testing Library`，覆盖浮层定位/层级/焦点、主题同步、表单控件、展示与布局组件等关键契约。 |
| CI 门禁 | PR / push 已执行 `typecheck`、`test:unit`、文档新鲜度、`build:lib`、`verify:public-api` 与 Playground 构建。 |
| 发布门禁 | npm 发布工作流已追加 `test:unit`，继续串联类型、文档与库构建。 |
| 剩余项 | 自动化截图基线仍需按仓库浏览器约束单独设计，记录为 `VISUAL-001`。 |
