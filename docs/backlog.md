# Lumina 待开发项

> 只记录尚未开发的工作项；不表示已实现。

| ID | 状态 | 优先级 | 主题 | 范围 | 完成标准 |
| --- | --- | --- | --- | --- | --- |
| TEST-001 | 待开发 | P1 | 自动化测试体系补齐 | 为组件库补齐 **行为测试**、**视觉回归测试**、**CI 门禁** | 1. 引入 `Vitest + Testing Library` 覆盖 `useFloating`、`ThemeProvider/useTheme/applyTheme`、`Button/Input/Textarea` 等基础能力；2. 引入 `Playwright` 对 `Tooltip/Popover/Select/Cascader/ColorPicker/Modal/Drawer/AppShell` 建立稳定截图基线；3. 新增 CI，在 PR / push 中执行 `typecheck`、`gen:docs`、`build:lib`、`verify:public-api`、`test:unit`、`test:visual`；4. 浮层定位、Portal、主题切换、基础组件 attrs/ref 回归能被自动拦截。 |

## TEST-001 备注

| 项 | 内容 |
| --- | --- |
| 背景 | 当前仓库已具备类型、构建、发布物、公共 API 校验，但仍缺少行为/视觉自动化回归。 |
| 首批重点 | `src/utils/useFloating.ts` 及其依赖组件：`Tooltip`、`Popover`、`Select`、`Cascader`、`ColorPicker`。 |
| 第二批 | `ThemeProvider` / `useTheme` / `applyTheme`，以及 `Button`、`Input`、`Textarea` 等基础件。 |
| 第三批 | `Modal`、`Drawer`、`AppShell`、`TitleBar`、`StatusBar` 等视觉敏感组件。 |
| 当前决定 | **仅记录到待开发项，暂不开发。** |
