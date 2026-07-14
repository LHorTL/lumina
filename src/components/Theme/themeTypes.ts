/** 主题使用的浅色或深色基础模式。 */
export type ThemeBaseMode = "light" | "dark";

/** 内置强调色名称。 */
export type AccentKey = "sky" | "coral" | "mint" | "violet" | "amber" | "rose";

/** 由基色或现有主题 token 解析出的完整拟态表面色板。 */
export interface ThemeSurfacePalette {
  bg: string;
  bgRaised: string;
  bgSunken: string;
  fg: string;
  fgMuted: string;
  fgSubtle: string;
  border: string;
  divider: string;
  shadowDark: string;
  shadowLight: string;
  accent: string;
  accentInk: string;
  accentSoft: string;
  accentGlow: string;
}

/** 默认继承、可以在任意主题作用域中精确覆盖的语义颜色。 */
export interface ThemeSemanticColors {
  info: string;
  success: string;
  warning: string;
  danger: string;
}

/** 主题颜色的最终精确覆盖；未提供的字段继续继承或使用派生值。 */
export type ThemeColorOverrides = Partial<ThemeSurfacePalette & ThemeSemanticColors>;

/** 组件和 Portal 运行时消费的完整解析色板。 */
export type ResolvedThemeColors = ThemeSurfacePalette & ThemeSemanticColors;

/** 完整强调色色板。 */
export interface AccentPalette {
  accent: string;
  ink: string;
  soft: string;
  glow: string;
}

/** 自定义强调色可以是颜色字符串或带主色的部分色板。 */
export type CustomAccentInput = string | Partial<AccentPalette> & { accent: string };

/** 任意 CSS 变量覆盖，键可使用短名称或完整变量名。 */
export type ThemeTokens = Record<string, string>;
