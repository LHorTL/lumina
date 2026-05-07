# ThemePanel 主题面板

> 可复用的主题快速调节面板,直接驱动最近的 ThemeProvider。

## 导入

```tsx
import { ThemeProvider, ThemePanel, THEME_PANEL_DEFAULT_PRESET_OPTIONS, THEME_PANEL_DEFAULT_THEME_PRESETS } from "@fangxinyan/lumina";
```

## 示例

### 完整面板

默认包含浅色、深色、瓷白、助手、助手暗五个主题卡片,并提供简洁/深度两档新建主题入口;高级调整区可编辑当前主题的 token、palette 和自定义字体,默认主题另存时可填写新主题名和副标题,非默认主题可直接改名、修改副标题后保存。

```tsx
<ThemeProvider>
  <ThemePanel />
</ThemeProvider>
```

### 外部保存与回灌

onCreateTheme / onUpdateTheme / onDeleteTheme 会把新建、另存为、更新和删除事件交给业务侧;主题名和卡片第二行副标题会分别通过 payload.label / payload.description 传出,业务侧保存后通过 ThemeProvider themes 回灌。

```tsx
import { ThemeProvider, ThemePanel, type ThemePresets } from "lumina";

const [themes, setThemes] = React.useState<ThemePresets>({});

<ThemeProvider themes={themes} storageKey="app:theme">
  <ThemePanel
    onCreateTheme={(payload) => {
      setThemes((current) => ({
        ...current,
        [String(payload.key)]: payload.preset,
      }));
      saveThemeToServerOrStorage(payload);
    }}
    onDeleteTheme={(payload) => {
      setThemes((current) => {
        const { [String(payload.key)]: removed, ...next } = current;
        return next;
      });
      deleteThemeFromServerOrStorage(payload);
    }}
    onUpdateTheme={(payload) => {
      setThemes((current) => ({
        ...current,
        [String(payload.key)]: payload.preset,
      }));
      saveThemeToServerOrStorage(payload);
    }}
  />
</ThemeProvider>
```

### 精简面板

用 sections 控制展示哪些调节项,适合放进抽屉、设置页侧栏或开发调试区。

```tsx
<ThemePanel
  compact
  title="微调"
  description={null}
  sections={["accent", "shadow", "radius"]}
  showReset={false}
/>
```

## API

**ThemePanel**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| title | `ReactNode` | `"主题"` | 面板标题;传 null 可隐藏标题文本 |
| description | `ReactNode` | `"快速调整当前 Lumina 主题"` | 面板副标题 |
| sections | `ThemePanelSection[]` | — | 展示的控制区及顺序;advanced 区提供完整 token / palette 编辑,shadow 区同时控制 intensity / shadow-scale / shadow-float-scale |
| modeOptions | `ThemePanelModeOption[]` | — | 模式切换项 |
| presetOptions | `ThemePanelPresetOption[]` | — | 命名主题预设卡片;不传时使用浅色/深色/瓷白/助手/助手暗 + theme.themes,也可完全由业务侧控制 |
| defaultCustomAccent | `string` | `"#845ef7"` | 自定义强调色初始值 |
| allowCreateTheme | `boolean` | `true` | 在预设区显示新建主题流程 |
| defaultCreateThemeName | `string` | `"我的主题"` | 新建主题的默认名称 |
| createThemeKeyPrefix | `string` | `"user"` | 生成自建主题 mode key 时使用的前缀 |
| onCreateTheme | `(payload: ThemePanelCreateThemePayload) => void` | — | 保存自建主题或高级区命名另存为后的回调;主题名和副标题通过 payload.label / payload.description 传出,业务侧可把 payload.preset 存起来并通过 ThemeProvider themes 回灌 |
| allowDeleteTheme | `boolean` | `true` | 为非默认主题显示删除按钮;默认主题不会显示删除入口 |
| onDeleteTheme | `(payload: ThemePanelDeleteThemePayload) => void` | — | 删除非默认主题后的回调,业务侧可同步删除外部存储 |
| allowUpdateTheme | `boolean` | `true` | 在高级调整区为非默认主题显示保存修改能力;默认主题保存时会另存为新主题 |
| onUpdateTheme | `(payload: ThemePanelUpdateThemePayload) => void` | — | 覆盖保存非默认主题修改后的回调;名称和副标题修改通过 payload.label / payload.description 传出,另存为仍走 onCreateTheme |
| showReset | `boolean` | `true` | 显示重置按钮 |
| compact | `boolean` | `false` | 紧凑布局 |


**默认预设常量**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| THEME_PANEL_DEFAULT_PRESET_OPTIONS | `ThemePanelPresetOption[]` | — | ThemePanel 默认卡片列表: 浅色、深色、瓷白、助手、助手暗 |
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
| description | `string` | — | 用户输入的主题副标题,会显示在主题卡片第二行 |
| preset | `ThemePreset` | — | 最终保存到 theme.themes 的主题配置 |
| presetOption | `ThemePanelPresetOption` | — | 可直接追加到受控 presetOptions 的卡片配置 |


**ThemePanelUpdateThemePayload**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| key | `ThemeMode` | — | 被更新的主题 mode key |
| label | `string` | — | 被更新主题的展示名称 |
| description | `string` | — | 被更新主题的副标题,会显示在主题卡片第二行 |
| preset | `ThemePreset` | — | 从当前面板状态生成的新主题配置 |
| previousPreset | `ThemePreset` | — | 更新前的主题配置 |
| presetOption | `ThemePanelPresetOption` | — | 可直接回灌到受控 presetOptions 的卡片配置 |


**ThemePanelDeleteThemePayload**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| key | `ThemeMode` | — | 被删除的主题 mode key |
| label | `string` | — | 被删除主题的展示名称 |
| description | `string` | — | 被删除主题的说明文案 |
| preset | `ThemePreset` | — | 删除前的主题配置;如果对应 key 不存在于 ThemeProvider themes 则为空 |


---
[← 回到索引](../llms.md)
