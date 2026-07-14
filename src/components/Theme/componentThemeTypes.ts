import type * as React from "react";
import type {
  AccentKey,
  CustomAccentInput,
  ThemeBaseMode,
  ThemeColorOverrides,
  ThemeTokens,
} from "./themeTypes";

/** 普通组件主题影响自身，subtree 主题继续向业务后代传递。 */
export type ComponentThemeScope = "self" | "subtree";

/** 所有可以通过 ThemeProvider.components 定向配置的公共 UI 组件。 */
export type ComponentThemeName =
  | "Alert"
  | "AppShell"
  | "TitleBar"
  | "WindowControls"
  | "Sidebar"
  | "AutoComplete"
  | "Avatar"
  | "Badge"
  | "Button"
  | "IconButton"
  | "Calendar"
  | "Card"
  | "Cascader"
  | "Checkbox"
  | "Collapse"
  | "ColorPicker"
  | "CommandPalette"
  | "ContextMenu"
  | "DatePicker"
  | "DateTimePicker"
  | "Divider"
  | "Drawer"
  | "Empty"
  | "Form"
  | "FormItem"
  | "Icon"
  | "Image"
  | "ImageGrid"
  | "SpriteImage"
  | "LayeredImage"
  | "Input"
  | "InputPassword"
  | "InputNumber"
  | "List"
  | "MessageContainer"
  | "Modal"
  | "Pagination"
  | "Popover"
  | "Progress"
  | "Radio"
  | "RadioGroup"
  | "Select"
  | "Skeleton"
  | "Slider"
  | "Spin"
  | "Splitter"
  | "StatusBar"
  | "StatusBarItem"
  | "Surface"
  | "Switch"
  | "Table"
  | "TablePro"
  | "Tabs"
  | "Tag"
  | "Textarea"
  | "ThemePanel"
  | "Timeline"
  | "TimePicker"
  | "Tooltip"
  | "Typography"
  | "Title"
  | "Text"
  | "Paragraph"
  | "Link";

/** 单个组件类型可以覆盖的颜色、token 与静态插槽样式。 */
export interface ComponentThemeOverride<TSlot extends string = string> {
  baseColor?: string;
  colorScheme?: ThemeBaseMode;
  accent?: AccentKey | CustomAccentInput;
  intensity?: number;
  colors?: ThemeColorOverrides;
  tokens?: ThemeTokens;
  styles?: Partial<Record<TSlot, React.CSSProperties>>;
}

/** 按公共组件名称配置的主题覆盖。 */
export type ComponentThemeOverrides = Partial<
  Record<ComponentThemeName, ComponentThemeOverride>
>;

/** 单个组件或组件子树使用的视觉主题。 */
export interface ComponentThemeOptions
  extends Omit<ComponentThemeOverride, "styles"> {
  scope?: ComponentThemeScope;
  components?: ComponentThemeOverrides;
}

/** AccentKey 使用预设，其他字符串作为表面基色。 */
export type ComponentTheme = AccentKey | string | ComponentThemeOptions;

/** 所有公共 UI 组件共享的局部主题属性。 */
export interface ComponentThemeProps {
  theme?: ComponentTheme;
}
