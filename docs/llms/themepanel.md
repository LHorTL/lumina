# ThemePanel 主题面板

> 可复用的主题快速调节面板,直接驱动最近的 ThemeProvider。

## 导入

```tsx
import { ThemeProvider, ThemePanel, THEME_PANEL_DEFAULT_PRESET_OPTIONS, THEME_PANEL_DEFAULT_THEME_PRESETS } from "@fangxinyan/lumina";
```

## 示例

### 完整面板

默认包含浅色、深色、瓷白、助手四个主题卡片,并提供新建主题入口;其余控制项直接驱动 useTheme。

```tsx
<ThemeProvider>
  <ThemePanel />
</ThemeProvider>
```

### 精简面板

用 sections 控制展示哪些调节项,适合放进抽屉、设置页侧栏或开发调试区。

```tsx
<ThemePanel
  compact
  title="微调"
  description={null}
  sections={["accent", "intensity", "radius"]}
  showReset={false}
/>
```

## API

**ThemePanel**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| title | `ReactNode` | `"主题"` | 面板标题;传 null 可隐藏标题文本 |
| description | `ReactNode` | `"快速调整当前 Lumina 主题"` | 面板副标题 |
| sections | `ThemePanelSection[]` | — | 展示的控制区及顺序 |
| modeOptions | `ThemePanelModeOption[]` | — | 模式切换项 |
| presetOptions | `ThemePanelPresetOption[]` | — | 命名主题预设卡片;不传时使用浅色/深色/瓷白/助手 + theme.themes |
| defaultCustomAccent | `string` | `"#845ef7"` | 自定义强调色初始值 |
| allowCreateTheme | `boolean` | `true` | 在预设区显示新建主题流程 |
| defaultCreateThemeName | `string` | `"我的主题"` | 新建主题的默认名称 |
| createThemeKeyPrefix | `string` | `"user"` | 生成自建主题 mode key 时使用的前缀 |
| onCreateTheme | `(payload: ThemePanelCreateThemePayload) => void` | — | 保存自建主题后的回调,可用于业务侧持久化 label / preset |
| showReset | `boolean` | `true` | 显示重置按钮 |
| compact | `boolean` | `false` | 紧凑布局 |


**默认预设常量**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| THEME_PANEL_DEFAULT_PRESET_OPTIONS | `ThemePanelPresetOption[]` | — | ThemePanel 默认卡片列表: 浅色、深色、瓷白、助手 |
| THEME_PANEL_DEFAULT_THEME_PRESETS | `Record<string, ThemePreset>` | — | 默认卡片背后的 ThemePreset 配置 |


**ThemePanelPresetOption**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| key \* | `ThemeMode` | — | 主题 mode key;若存在于 theme.themes 会应用对应 preset |
| label \* | `ReactNode` | — | 卡片标题 |
| description | `ReactNode` | — | 卡片说明 |
| preset | `ThemePreset` | — | 可选 preset;点击时会注册并应用 |


**ThemePanelCreateThemePayload**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| key | `ThemeMode` | — | 保存后注册到 ThemeProvider 的 mode key |
| label | `string` | — | 用户输入的主题名称 |
| description | `string` | — | ThemePanel 生成的说明文案,如自建亮/自建暗 |
| preset | `ThemePreset` | — | 最终保存到 theme.themes 的主题配置 |


---
[← 回到索引](../llms.md)
