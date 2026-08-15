import "../../styles/tokens.css";
import * as React from "react";
import { PortalScopeProvider, usePortalContainer } from "../../utils/portal";
import type { ComponentThemeOverrides } from "./componentThemeTypes";
import type {
  AccentKey,
  AccentPalette,
  CustomAccentInput,
  ResolvedThemeColors,
  ThemeBaseMode,
  ThemeColorOverrides,
  ThemeSurfacePalette,
  ThemeTokens,
} from "./themeTypes";
import {
  ComponentOverridesProvider,
  mergeComponentThemeOverrides,
  notifyImperativeThemeChange,
  useVisualThemeSnapshot,
  VisualThemeProvider,
  type VisualThemeSnapshot,
} from "./themeRuntime";

/* ============================================================================
 * Theme — full custom theming system for lumina
 *
 * - <ThemeProvider> manages theme state and applies CSS variables / data-attrs
 *   to either <html> (global) or a local scope.
 * - useTheme() exposes read/write access for descendants.
 * - Presets: accent palettes, font stacks, densities.
 * - Custom accent: pass a full palette or only a base color — missing slots
 *   are auto-derived via `color-mix`.
 * - Persistence: optional localStorage via `storageKey` prop, including custom
 *   named themes.
 * - "system" mode respects `prefers-color-scheme` via matchMedia.
 * - Arbitrary token overrides through the `tokens` prop.
 * ========================================================================== */

/* ------------------------------- Types ---------------------------------- */

export type BuiltInThemeMode = ThemeBaseMode | "system";
export type ThemeMode = BuiltInThemeMode | (string & {});
export type ResolvedThemeMode = ThemeBaseMode | (string & {});
export type DensityMode = "compact" | "comfortable" | "spacious";
export type FontKey = "system" | "sf" | "serif" | "mono";

/** Font config — either a preset key, a single sans string, or a granular object. */
export type FontConfig =
  | FontKey
  | string
  | { sans?: string; display?: string; mono?: string };


/** Named custom theme mode. `base` keeps dark/light specific component rules. */
export interface ThemePreset {
  /** Optional display name used by ThemePanel or other theme pickers. */
  label?: string;
  /** Optional helper text used by ThemePanel or other theme pickers. */
  description?: string;
  base?: ThemeBaseMode;
  /** 可选表面基色；存在时生成完整拟态色板。 */
  baseColor?: string;
  accent?: AccentKey | CustomAccentInput;
  density?: DensityMode;
  intensity?: number;
  radius?: number;
  font?: FontConfig;
  /** 对派生色板进行最终精确覆盖。 */
  colors?: ThemeColorOverrides;
  tokens?: ThemeTokens;
  /** React 组件树中按公开组件名称应用的覆盖。 */
  components?: ComponentThemeOverrides;
}

export type ThemePresets = Record<string, ThemePreset>;

export interface ThemeConfig {
  mode?: ThemeMode;
  /** Base light/dark color scheme used by custom modes. */
  colorScheme?: ThemeBaseMode;
  /** 生成完整表面色板的基色。 */
  baseColor?: string;
  accent?: AccentKey | CustomAccentInput;
  density?: DensityMode;
  /** Shadow strength. ThemePanel exposes 0..20, mapping to `--d` (0.4..2.8). */
  intensity?: number;
  /** Base radius in px — generates the full `--r-*` scale. */
  radius?: number;
  font?: FontConfig;
  /** 对派生色板进行最终精确覆盖。 */
  colors?: ThemeColorOverrides;
  tokens?: ThemeTokens;
  /** React 组件树消费的按组件名称覆盖；applyTheme 会忽略该字段。 */
  components?: ComponentThemeOverrides;
  /** Custom named modes addressable through `mode` / `setMode`. */
  themes?: ThemePresets;
}

/** ThemeProvider 在普通主题配置上增加 React 组件类型覆盖。 */
export interface ThemeProviderConfig extends ThemeConfig {}

export interface ThemeValue {
  /** Requested mode ("system" is preserved here). */
  mode: ThemeMode;
  /** Resolved concrete mode ("system" → "light" | "dark"; custom modes keep their name). */
  resolvedMode: ResolvedThemeMode;
  /** The light/dark base currently used for component-specific selectors. */
  colorScheme: ThemeBaseMode;
  /** 当前显式基色；未设置时为空。 */
  baseColor?: string;
  /** Accent key or "custom" if a palette was supplied. */
  accent: AccentKey | "custom";
  /** Resolved palette currently in effect. */
  accentPalette: AccentPalette;
  density: DensityMode;
  intensity: number;
  radius: number;
  font: FontConfig;
  colors: ThemeColorOverrides;
  tokens: ThemeTokens;
  themes: ThemePresets;
  components: ComponentThemeOverrides;
  activeTheme: ThemePreset | null;

  setMode: (m: ThemeMode) => void;
  toggleMode: () => void;
  setBaseColor: (color?: string) => void;
  setAccent: (a: AccentKey | CustomAccentInput) => void;
  setDensity: (d: DensityMode) => void;
  setIntensity: (n: number) => void;
  setRadius: (n: number) => void;
  setFont: (f: FontConfig) => void;
  setColors: (colors: ThemeColorOverrides) => void;
  setTokens: (t: ThemeTokens) => void;
  setThemes: (t: ThemePresets) => void;
  setComponents: (components: ComponentThemeOverrides) => void;
  /** Shallow-merge a partial config. */
  update: (cfg: Partial<ThemeProviderConfig>) => void;
  /** Reset to the initial props. */
  reset: () => void;
}

/* --------------------------- Built-in presets --------------------------- */

/** Built-in accent palettes (light-mode values). */
export const ACCENT_PRESETS: Record<AccentKey, AccentPalette> = {
  sky:    { accent: "oklch(68% 0.14 235)", ink: "oklch(42% 0.12 235)", soft: "oklch(92% 0.04 235)", glow: "oklch(68% 0.14 235 / 0.35)" },
  coral:  { accent: "oklch(72% 0.16 35)",  ink: "oklch(48% 0.14 35)",  soft: "oklch(94% 0.04 35)",  glow: "oklch(72% 0.16 35 / 0.35)"  },
  mint:   { accent: "oklch(72% 0.13 165)", ink: "oklch(46% 0.11 165)", soft: "oklch(93% 0.04 165)", glow: "oklch(72% 0.13 165 / 0.35)" },
  violet: { accent: "oklch(66% 0.16 290)", ink: "oklch(44% 0.14 290)", soft: "oklch(93% 0.04 290)", glow: "oklch(66% 0.16 290 / 0.35)" },
  amber:  { accent: "oklch(76% 0.14 75)",  ink: "oklch(50% 0.12 75)",  soft: "oklch(94% 0.05 75)",  glow: "oklch(76% 0.14 75 / 0.35)"  },
  rose:   { accent: "oklch(68% 0.17 10)",  ink: "oklch(46% 0.15 10)",  soft: "oklch(93% 0.04 10)",  glow: "oklch(68% 0.17 10 / 0.35)"  },
};

/** Dark-mode overrides — ink/soft shift, and glow alpha is halved so the outer
 *  button bloom doesn't read as a bright ring on dark surfaces. */
export const ACCENT_PRESETS_DARK: Record<AccentKey, Pick<AccentPalette, "ink" | "soft" | "glow">> = {
  sky:    { soft: "oklch(35% 0.08 235)", ink: "oklch(82% 0.10 235)", glow: "oklch(68% 0.14 235 / 0.18)" },
  coral:  { soft: "oklch(38% 0.09 35)",  ink: "oklch(84% 0.10 35)",  glow: "oklch(72% 0.16 35 / 0.18)"  },
  mint:   { soft: "oklch(36% 0.08 165)", ink: "oklch(83% 0.10 165)", glow: "oklch(72% 0.13 165 / 0.18)" },
  violet: { soft: "oklch(36% 0.09 290)", ink: "oklch(82% 0.11 290)", glow: "oklch(66% 0.16 290 / 0.18)" },
  amber:  { soft: "oklch(38% 0.08 75)",  ink: "oklch(85% 0.10 75)",  glow: "oklch(76% 0.14 75 / 0.18)"  },
  rose:   { soft: "oklch(38% 0.09 10)",  ink: "oklch(84% 0.11 10)",  glow: "oklch(68% 0.17 10 / 0.18)"  },
};

/** Built-in font family stacks. */
export const FONT_STACKS: Record<FontKey, string> = {
  system: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
  sf: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif',
  serif: 'Cambria, Georgia, "Songti SC", "STSong", serif',
  mono: 'ui-monospace, "SF Mono", "JetBrains Mono", Consolas, monospace',
};

/** 主题解析后的完整配置；基色仍允许为空以保持现有主题行为。 */
type ResolvedThemeConfig = Required<Omit<ThemeConfig, "baseColor">> & {
  baseColor?: string;
  /** 内部标记：accent 是否来自调用方或 preset，而不是默认 sky。 */
  accentExplicit: boolean;
};

const DEFAULT_CONFIG: ResolvedThemeConfig = {
  mode: "light",
  colorScheme: "light",
  baseColor: undefined,
  accent: "sky",
  density: "comfortable",
  intensity: 5,
  radius: 20,
  font: "sf",
  colors: {},
  tokens: {},
  components: {},
  themes: {},
  accentExplicit: false,
};

/* ------------------------------ Helpers --------------------------------- */

const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";
/** 浏览器使用布局副作用，服务端回退为普通副作用以避免 SSR 警告。 */
const useIsomorphicLayoutEffect = isBrowser ? React.useLayoutEffect : React.useEffect;

function isThemeBaseMode(mode: ThemeMode | undefined): mode is ThemeBaseMode {
  return mode === "light" || mode === "dark";
}

function isBuiltInThemeMode(mode: ThemeMode | undefined): mode is BuiltInThemeMode {
  return mode === "light" || mode === "dark" || mode === "system";
}

const TRANSIENT_THEME_MODES = new Set<ThemeMode>(["__theme_panel_draft__"]);

function isTransientThemeMode(mode: ThemeMode | undefined): boolean {
  return mode != null && TRANSIENT_THEME_MODES.has(mode);
}

function getThemePreset(themes: ThemePresets | undefined, mode: ThemeMode | undefined): ThemePreset | undefined {
  if (!mode || isBuiltInThemeMode(mode)) return undefined;
  return themes?.[mode];
}

/** 比较当前配置是否仍等于命名预设写入的值。 */
function isThemePresetValueEqual(current: unknown, preset: unknown): boolean {
  if (current === preset) return true;
  if (current == null || preset == null || typeof current !== "object" || typeof preset !== "object") {
    return false;
  }
  return JSON.stringify(current) === JSON.stringify(preset);
}

/** 移除上一命名预设仍未被调用方改写的字段，避免切换模式后残留旧色板。 */
function clearActiveThemePreset(config: ThemeConfig): ThemeConfig {
  const preset = getThemePreset(config.themes, config.mode);
  if (!preset) return config;

  const next: ThemeConfig = { ...config };
  const presetFields: Array<[keyof ThemeConfig, unknown]> = [
    ["colorScheme", preset.base],
    ["baseColor", preset.baseColor],
    ["accent", preset.accent],
    ["density", preset.density],
    ["intensity", preset.intensity],
    ["radius", preset.radius],
    ["font", preset.font],
    ["colors", preset.colors],
    ["tokens", preset.tokens],
    [
      "components",
      preset.components
        ? mergeComponentThemeOverrides(undefined, preset.components)
        : undefined,
    ],
  ];

  for (const [key, presetValue] of presetFields) {
    if (presetValue !== undefined && isThemePresetValueEqual(next[key], presetValue)) {
      delete next[key];
    }
  }
  return next;
}

/** 切换模式时先清理上一命名预设，再写入新预设的完整配置。 */
function applyThemePreset(config: ThemeConfig, mode: ThemeMode): ThemeConfig {
  const base = clearActiveThemePreset(config);
  const preset = getThemePreset(base.themes, mode);
  if (!preset) {
    return {
      ...base,
      mode,
      colorScheme: isThemeBaseMode(mode) ? mode : base.colorScheme,
    };
  }
  return {
    ...base,
    mode,
    colorScheme: preset.base ?? base.colorScheme ?? DEFAULT_CONFIG.colorScheme,
    baseColor: preset.baseColor ?? base.baseColor,
    accent: preset.accent ?? base.accent,
    density: preset.density ?? base.density,
    intensity: preset.intensity ?? base.intensity,
    radius: preset.radius ?? base.radius,
    font: preset.font ?? base.font,
    colors: preset.colors ? { ...preset.colors } : base.colors,
    tokens: preset.tokens ? { ...preset.tokens } : base.tokens,
    components: preset.components
      ? mergeComponentThemeOverrides(undefined, preset.components)
      : base.components,
  };
}

/** 合并运行时主题更新；mode 或 themes 变化时同步替换命名预设层。 */
function patchThemeConfig(
  current: ThemeConfig,
  patch: Partial<ThemeProviderConfig>
): ThemeConfig {
  const themesChanged = Object.prototype.hasOwnProperty.call(patch, "themes");
  const modeChanged = Object.prototype.hasOwnProperty.call(patch, "mode");
  let base = themesChanged ? clearActiveThemePreset(current) : current;
  if (themesChanged) {
    base = { ...base, themes: patch.themes };
  }

  const mode = modeChanged ? patch.mode : base.mode;
  const withMode = (modeChanged || themesChanged) && mode !== undefined
    ? applyThemePreset(base, mode)
    : base;
  return { ...withMode, ...patch };
}

function resolveThemeConfig(config: ThemeConfig): ResolvedThemeConfig {
  const mode = config.mode ?? DEFAULT_CONFIG.mode;
  const themes = config.themes ?? DEFAULT_CONFIG.themes;
  const preset = getThemePreset(themes, mode);
  const accentExplicit = config.accent !== undefined || preset?.accent !== undefined;
  const presetConfig = preset
    ? {
        ...(preset.base ? { colorScheme: preset.base } : null),
        ...(preset.baseColor ? { baseColor: preset.baseColor } : null),
        ...(preset.accent ? { accent: preset.accent } : null),
        ...(preset.density ? { density: preset.density } : null),
        ...(preset.intensity != null ? { intensity: preset.intensity } : null),
        ...(preset.radius != null ? { radius: preset.radius } : null),
        ...(preset.font ? { font: preset.font } : null),
      }
    : {};
  const merged = {
    ...DEFAULT_CONFIG,
    ...presetConfig,
    ...config,
    mode,
    themes,
    colors: {
      ...(preset?.colors ?? {}),
      ...(config.colors ?? {}),
    },
    components: mergeComponentThemeOverrides(preset?.components, config.components),
    tokens: {
      ...(preset?.tokens ?? {}),
      ...(config.tokens ?? {}),
    },
  };
  return {
    ...merged,
    colorScheme: merged.colorScheme ?? preset?.base ?? DEFAULT_CONFIG.colorScheme,
    baseColor: merged.baseColor ?? preset?.baseColor,
    accent: merged.accent ?? preset?.accent ?? DEFAULT_CONFIG.accent,
    density: merged.density ?? preset?.density ?? DEFAULT_CONFIG.density,
    intensity: merged.intensity ?? preset?.intensity ?? DEFAULT_CONFIG.intensity,
    radius: merged.radius ?? preset?.radius ?? DEFAULT_CONFIG.radius,
    font: merged.font ?? preset?.font ?? DEFAULT_CONFIG.font,
    accentExplicit,
  };
}

/** Resolve "system" mode against `prefers-color-scheme`; custom modes keep their name. */
export function resolveThemeMode(mode: ThemeMode): ResolvedThemeMode {
  if (mode !== "system") return mode;
  if (!isBrowser) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function resolveThemeColorScheme(
  mode: ThemeMode,
  themes?: ThemePresets,
  fallback?: ThemeBaseMode
): ThemeBaseMode {
  if (mode === "system") return fallback ?? (resolveThemeMode(mode) as ThemeBaseMode);
  if (isThemeBaseMode(mode)) return mode;
  return getThemePreset(themes, mode)?.base ?? fallback ?? DEFAULT_CONFIG.colorScheme;
}

/** Fill missing slots of a custom accent via color-mix. */
export function normalizeAccentInput(
  input: AccentKey | CustomAccentInput,
  colorScheme: ThemeBaseMode
): { key: AccentKey | "custom"; palette: AccentPalette } {
  // Preset key?
  if (typeof input === "string" && input in ACCENT_PRESETS) {
    const key = input as AccentKey;
    const base = ACCENT_PRESETS[key];
    if (colorScheme === "dark") {
      return { key, palette: { ...base, ...ACCENT_PRESETS_DARK[key] } };
    }
    return { key, palette: base };
  }
  // Custom — either a raw color string or a partial palette object.
  const raw = typeof input === "string" ? { accent: input } : input;
  const { accent } = raw;
  const ink = raw.ink ?? `color-mix(in oklch, ${accent} 65%, black)`;
  const soft =
    raw.soft ??
    (colorScheme === "dark"
      ? `color-mix(in oklch, ${accent} 30%, black)`
      : `color-mix(in oklch, ${accent} 15%, white)`);
  // Dark-mode glow is halved so it doesn't wash into a white halo on dark surfaces.
  const glow =
    raw.glow ??
    (colorScheme === "dark"
      ? `color-mix(in oklch, ${accent} 18%, transparent)`
      : `color-mix(in oklch, ${accent} 35%, transparent)`);
  return { key: "custom", palette: { accent, ink, soft, glow } };
}

/** Lumina 当前浅色与深色主题的基础颜色，保持未启用多色主题时视觉不变。 */
export const DEFAULT_THEME_COLORS: Record<ThemeBaseMode, ResolvedThemeColors> = {
  light: {
    bg: "#e8eef5",
    bgRaised: "#edf2f8",
    bgSunken: "#dde4ed",
    fg: "#3a4558",
    fgMuted: "#7b8599",
    fgSubtle: "#9ca7ba",
    border: "rgba(130, 148, 175, 0.14)",
    divider: "rgba(130, 148, 175, 0.18)",
    shadowDark: "rgba(163, 177, 198, 0.55)",
    shadowLight: "rgba(255, 255, 255, 0.95)",
    accent: ACCENT_PRESETS.sky.accent,
    accentInk: ACCENT_PRESETS.sky.ink,
    accentSoft: ACCENT_PRESETS.sky.soft,
    accentGlow: ACCENT_PRESETS.sky.glow,
    info: "oklch(68% 0.14 235)",
    success: "oklch(68% 0.14 150)",
    warning: "oklch(75% 0.14 75)",
    danger: "oklch(64% 0.18 25)",
  },
  dark: {
    bg: "#1b2030",
    bgRaised: "#242a3c",
    bgSunken: "#151a27",
    fg: "#d8deeb",
    fgMuted: "#8b94ab",
    fgSubtle: "#5f6a82",
    border: "rgba(0, 0, 0, 0.35)",
    divider: "rgba(255, 255, 255, 0.06)",
    shadowDark: "rgba(0, 0, 0, 0.55)",
    shadowLight: "rgba(130, 145, 180, 0.06)",
    accent: ACCENT_PRESETS.sky.accent,
    accentInk: ACCENT_PRESETS_DARK.sky.ink,
    accentSoft: ACCENT_PRESETS_DARK.sky.soft,
    accentGlow: ACCENT_PRESETS_DARK.sky.glow,
    info: "oklch(78% 0.12 235)",
    success: "oklch(78% 0.14 150)",
    warning: "oklch(82% 0.14 75)",
    danger: "oklch(76% 0.16 25)",
  },
};

/** 把颜色值与黑白端点稳定混合，避免无彩端点让 OKLCH 色相退化为 none。 */
function mixColor(value: string, percent: number, other: "black" | "white"): string {
  return `color-mix(in srgb, ${value} ${percent}%, ${other})`;
}

/** 给颜色增加可控透明度，返回浏览器直接解析的 CSS 表达式。 */
function fadeColor(value: string, percent: number): string {
  return `color-mix(in srgb, ${value} ${percent}%, transparent)`;
}

/**
 * 从基色生成差异明显的拟态表面色板。
 *
 * @example
 * ```ts
 * const palette = deriveThemeColors("#ffe8df", { colorScheme: "light" });
 * ```
 */
export function deriveThemeColors(
  baseColor: string,
  options: {
    colorScheme?: ThemeBaseMode;
    accent?: AccentKey | CustomAccentInput;
  } = {}
): ThemeSurfacePalette {
  const colorScheme = options.colorScheme ?? "light";
  const dark = colorScheme === "dark";
  const derivedAccent = dark
    ? mixColor(baseColor, 68, "white")
    : mixColor(baseColor, 62, "black");
  const explicitAccent = options.accent
    ? normalizeAccentInput(options.accent, colorScheme).palette
    : null;
  const accent = explicitAccent?.accent ?? derivedAccent;

  return {
    bg: baseColor,
    bgRaised: mixColor(baseColor, dark ? 86 : 82, "white"),
    bgSunken: mixColor(baseColor, dark ? 80 : 86, "black"),
    fg: mixColor(baseColor, 18, dark ? "white" : "black"),
    fgMuted: mixColor(baseColor, 38, dark ? "white" : "black"),
    fgSubtle: mixColor(baseColor, 55, dark ? "white" : "black"),
    border: mixColor(baseColor, 82, dark ? "white" : "black"),
    divider: mixColor(baseColor, 88, dark ? "white" : "black"),
    shadowDark: fadeColor(
      mixColor(baseColor, dark ? 40 : 58, "black"),
      dark ? 65 : 55
    ),
    shadowLight: fadeColor(
      mixColor(baseColor, dark ? 82 : 28, "white"),
      dark ? 22 : 88
    ),
    accent,
    accentInk:
      explicitAccent?.ink ?? mixColor(accent, 65, dark ? "white" : "black"),
    accentSoft:
      explicitAccent?.soft ?? mixColor(accent, dark ? 30 : 15, dark ? "black" : "white"),
    accentGlow: explicitAccent?.glow ?? fadeColor(accent, dark ? 25 : 40),
  };
}

const COLOR_TOKEN_KEYS: Record<keyof ResolvedThemeColors, string> = {
  bg: "bg",
  bgRaised: "bg-raised",
  bgSunken: "bg-sunken",
  fg: "fg",
  fgMuted: "fg-muted",
  fgSubtle: "fg-subtle",
  border: "border",
  divider: "divider",
  shadowDark: "shadow-dark",
  shadowLight: "shadow-light",
  accent: "accent",
  accentInk: "accent-ink",
  accentSoft: "accent-soft",
  accentGlow: "accent-glow",
  info: "info",
  success: "success",
  warning: "warning",
  danger: "danger",
};

/** 判断精确颜色或 token 是否改写了最终强调色色板。 */
function hasAccentColorOverride(
  config: Pick<ThemeConfig, "colors" | "tokens">
): boolean {
  return ["accent", "accentInk", "accentSoft", "accentGlow"].some((key) => {
    const tokenKey = COLOR_TOKEN_KEYS[key as keyof ResolvedThemeColors];
    return config.colors?.[key as keyof ThemeColorOverrides] !== undefined ||
      config.tokens?.[tokenKey] !== undefined ||
      config.tokens?.[`--${tokenKey}`] !== undefined;
  });
}

/** 从主题配置解析完整颜色，供 ThemeProvider、组件作用域和 Portal 共用。 */
export function resolveThemeColors(
  config: Pick<ThemeConfig, "baseColor" | "accent" | "colors" | "tokens">,
  colorScheme: ThemeBaseMode,
  inherited?: ResolvedThemeColors
): ResolvedThemeColors {
  const fallback = inherited ?? DEFAULT_THEME_COLORS[colorScheme];
  const surface = config.baseColor
    ? deriveThemeColors(config.baseColor, { colorScheme, accent: config.accent })
    : { ...fallback };

  if (!config.baseColor && config.accent) {
    const palette = normalizeAccentInput(config.accent, colorScheme).palette;
    surface.accent = palette.accent;
    surface.accentInk = palette.ink;
    surface.accentSoft = palette.soft;
    surface.accentGlow = palette.glow;
  }

  const resolved: ResolvedThemeColors = {
    ...fallback,
    ...surface,
    ...(config.colors ?? {}),
  };

  for (const [colorKey, tokenKey] of Object.entries(COLOR_TOKEN_KEYS) as Array<
    [keyof ResolvedThemeColors, string]
  >) {
    const value = config.tokens?.[tokenKey] ?? config.tokens?.[`--${tokenKey}`];
    if (value !== undefined) resolved[colorKey] = value;
  }
  return resolved;
}

/** 把完整颜色表转换为可直接合并到 React style 的 CSS 变量。 */
export function themeColorsToStyle(
  colors: ResolvedThemeColors,
  prefix = ""
): React.CSSProperties {
  const style: Record<string, string> = {};
  for (const [colorKey, tokenKey] of Object.entries(COLOR_TOKEN_KEYS) as Array<
    [keyof ResolvedThemeColors, string]
  >) {
    style[`--${prefix}${tokenKey}`] = colors[colorKey];
  }
  return style as React.CSSProperties;
}

/** 把 camelCase token 名转换为 CSS 自定义属性使用的 kebab-case。 */
export function themeTokenToKebabCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/_/g, "-")
    .toLowerCase();
}

/** 根据完整主题快照生成全局或组件前缀 CSS 变量。 */
export function visualThemeToStyle(
  snapshot: VisualThemeSnapshot,
  prefix = ""
): React.CSSProperties {
  const style = themeColorsToStyle(snapshot.colors, prefix) as Record<string, string>;
  const variable = (name: string) => `--${prefix}${name}`;
  const reference = (name: string) => `var(${variable(name)})`;
  /** 组件短 token 未设置时继续继承同名全局 token。 */
  const inheritedReference = (name: string) =>
    prefix ? `var(${variable(name)}, var(--${name}))` : `var(--${name})`;
  const d = 0.4 + snapshot.intensity * 0.12;
  const dark = snapshot.colorScheme === "dark";

  style[variable("d")] = String(d);
  style[variable("shadow-offset")] = `calc(${dark ? 3 : 5}px * ${reference("d")} * ${inheritedReference("shadow-scale")})`;
  style[variable("shadow-blur")] = `calc(${dark ? 8 : 12}px * ${reference("d")} * ${inheritedReference("shadow-scale")})`;
  style[variable("shadow-inset-offset")] = `calc(${dark ? 2 : 3}px * ${reference("d")} * ${inheritedReference("shadow-scale")})`;
  style[variable("shadow-inset-blur")] = `calc(${dark ? 5 : 8}px * ${reference("d")} * ${inheritedReference("shadow-scale")})`;
  style[variable("neu-shadow-panel")] =
    `${reference("shadow-offset")} ${reference("shadow-offset")} ${reference("shadow-blur")} ${reference("shadow-dark")}, ` +
    `calc(${reference("shadow-offset")} * -1) calc(${reference("shadow-offset")} * -1) ${reference("shadow-blur")} ${reference("shadow-light")}`;
  style[variable("neu-shadow-control")] =
    `calc(${reference("shadow-offset")} * .5) calc(${reference("shadow-offset")} * .5) calc(${reference("shadow-blur")} * .6) ${reference("shadow-dark")}, ` +
    `calc(${reference("shadow-offset")} * -.5) calc(${reference("shadow-offset")} * -.5) calc(${reference("shadow-blur")} * .6) ${reference("shadow-light")}`;
  style[variable("neu-shadow-lift")] =
    `calc(${reference("shadow-offset")} * 1.6) calc(${reference("shadow-offset")} * 1.6) calc(${reference("shadow-blur")} * 1.4) ${reference("shadow-dark")}, ` +
    `calc(${reference("shadow-offset")} * -1.6) calc(${reference("shadow-offset")} * -1.6) calc(${reference("shadow-blur")} * 1.4) ${reference("shadow-light")}`;
  style[variable("neu-shadow-inset-strong")] =
    `inset ${reference("shadow-inset-offset")} ${reference("shadow-inset-offset")} ${reference("shadow-inset-blur")} ${reference("shadow-dark")}, ` +
    `inset calc(${reference("shadow-inset-offset")} * -1) calc(${reference("shadow-inset-offset")} * -1) ${reference("shadow-inset-blur")} ${reference("shadow-light")}`;
  style[variable("neu-shadow-inset")] =
    `inset calc(${reference("shadow-inset-offset")} * .6) calc(${reference("shadow-inset-offset")} * .6) calc(${reference("shadow-inset-blur")} * .6) ${reference("shadow-dark")}, ` +
    `inset calc(${reference("shadow-inset-offset")} * -.6) calc(${reference("shadow-inset-offset")} * -.6) calc(${reference("shadow-inset-blur")} * .6) ${reference("shadow-light")}`;
  style[variable("neu-shadow-subtle")] =
    `.75px .75px 1.5px ${reference("shadow-dark")}, -.75px -.75px 1.5px ${reference("shadow-light")}`;
  style[variable("neu-shadow-float")] =
    `0 calc(${reference("shadow-offset")} * 1.8 * ${inheritedReference("shadow-float-scale")}) calc(${reference("shadow-blur")} * 2.2 * ${inheritedReference("shadow-float-scale")}) ${reference("shadow-dark")}, ` +
    `0 calc(${reference("shadow-offset")} * .4 * ${inheritedReference("shadow-float-scale")}) calc(${reference("shadow-blur")} * .7 * ${inheritedReference("shadow-float-scale")}) ${reference("shadow-dark")}`;
  style[variable("neu-out")] = reference("neu-shadow-panel");
  style[variable("neu-out-sm")] = reference("neu-shadow-control");
  style[variable("neu-out-lg")] = reference("neu-shadow-lift");
  style[variable("neu-in")] = reference("neu-shadow-inset-strong");
  style[variable("neu-in-sm")] = reference("neu-shadow-inset");
  style[variable("neu-flat")] = reference("neu-shadow-subtle");
  style[variable("neu-float")] = reference("neu-shadow-float");
  return style as React.CSSProperties;
}

/** 把组件短 token 映射到当前组件前缀；完整变量名作为高级逃生口原样保留。 */
export function componentTokensToStyle(
  tokens: ThemeTokens | undefined,
  prefix: string
): React.CSSProperties {
  if (!tokens) return {};
  const style: Record<string, string> = {};
  for (const [key, value] of Object.entries(tokens)) {
    const property = key.startsWith("--")
      ? key
      : `--${prefix}${themeTokenToKebabCase(key)}`;
    style[property] = value;
  }
  return style as React.CSSProperties;
}

/** 把主题输入与继承快照解析为组件和 Portal 共用的完整视觉快照。 */
export function resolveVisualThemeSnapshot(
  config: Pick<ThemeConfig, "baseColor" | "colorScheme" | "accent" | "intensity" | "colors" | "tokens">,
  inherited?: VisualThemeSnapshot
): VisualThemeSnapshot {
  const colorScheme = config.colorScheme ?? inherited?.colorScheme ?? "light";
  const inheritedColors =
    inherited?.colorScheme === colorScheme ? inherited.colors : DEFAULT_THEME_COLORS[colorScheme];
  return {
    colorScheme,
    intensity: config.intensity ?? inherited?.intensity ?? DEFAULT_CONFIG.intensity,
    colors: resolveThemeColors(config, colorScheme, inheritedColors),
  };
}

/** Normalize a token key to a CSS custom property name. */
function toVar(key: string): string {
  return key.startsWith("--") ? key : `--${key}`;
}

const LEGACY_SHADOW_TOKEN_ALIASES: Record<string, string> = {
  "--neu-flat": "--neu-shadow-subtle",
  "--neu-out-sm": "--neu-shadow-control",
  "--neu-out": "--neu-shadow-panel",
  "--neu-out-lg": "--neu-shadow-lift",
  "--neu-in-sm": "--neu-shadow-inset",
  "--neu-in": "--neu-shadow-inset-strong",
  "--neu-float": "--neu-shadow-float",
};

/** 把解析后的完整主题转换为作用域节点使用的 CSS 变量。 */
function resolvedThemeConfigToStyle(
  config: ResolvedThemeConfig,
  snapshot: VisualThemeSnapshot
): React.CSSProperties {
  const style = { ...visualThemeToStyle(snapshot) } as Record<string, string>;
  const radius = config.radius ?? DEFAULT_CONFIG.radius;
  style["--r-xs"] = `${Math.max(4, radius - 16)}px`;
  style["--r-sm"] = `${Math.max(6, radius - 12)}px`;
  style["--r-md"] = `${Math.max(8, radius - 6)}px`;
  style["--r-lg"] = `${radius}px`;
  style["--r-xl"] = `${radius + 10}px`;

  const font = config.font ?? DEFAULT_CONFIG.font;
  if (typeof font === "string") {
    style["--font-sans"] = (FONT_STACKS as Record<string, string>)[font] ?? font;
    if (font === "mono") style["--font-display"] = FONT_STACKS.mono;
  } else {
    if (font.sans) style["--font-sans"] = font.sans;
    if (font.display) style["--font-display"] = font.display;
    if (font.mono) style["--font-mono"] = font.mono;
  }

  const tokenVars = new Set(Object.keys(config.tokens).map(toVar));
  for (const [key, value] of Object.entries(config.tokens)) {
    const variable = toVar(key);
    const semanticAlias = LEGACY_SHADOW_TOKEN_ALIASES[variable];
    if (semanticAlias && !tokenVars.has(semanticAlias)) {
      style[semanticAlias] = value;
    }
    style[variable] = value;
  }
  return style as React.CSSProperties;
}

/** 返回主题作用域需要写入的静态 data 属性。 */
function resolvedThemeConfigToDataAttributes(
  config: ResolvedThemeConfig,
  colorScheme: ThemeBaseMode
): Record<string, string | undefined> {
  const accentResult = normalizeAccentInput(config.accent, colorScheme);
  const hidesAccent =
    (config.baseColor && !config.accentExplicit) ||
    accentResult.key === "custom" ||
    hasAccentColorOverride(config);
  return {
    "data-theme": colorScheme,
    "data-theme-mode": config.mode,
    "data-density": config.density,
    "data-accent": hidesAccent ? undefined : accentResult.key,
  };
}

const imperativeThemeStyleKeys = new WeakMap<HTMLElement, Set<string>>();

/** ThemeProvider 接管根节点前单个内联样式属性的快照。 */
interface RootThemeStyleSnapshot {
  value: string;
  priority: string;
}

/** ThemeProvider 对 document 根节点的可恢复写入状态。 */
interface RootThemeMutationState {
  target: HTMLElement;
  attributes: Map<string, string | null>;
  styles: Map<string, RootThemeStyleSnapshot>;
  activeStyleKeys: Set<string>;
  previousImperativeStyleKeys?: Set<string>;
}

const ROOT_THEME_ATTRIBUTES = [
  "data-theme",
  "data-theme-mode",
  "data-density",
  "data-accent",
] as const;

/** 记录 ThemeProvider 接管 document 根节点前的主题属性与命令式所有权。 */
function createRootThemeMutationState(target: HTMLElement): RootThemeMutationState {
  const previousImperativeStyleKeys = imperativeThemeStyleKeys.get(target);
  const styles = new Map<string, RootThemeStyleSnapshot>();
  previousImperativeStyleKeys?.forEach((property) => {
    styles.set(property, {
      value: target.style.getPropertyValue(property),
      priority: target.style.getPropertyPriority(property),
    });
  });
  return {
    target,
    attributes: new Map(
      ROOT_THEME_ATTRIBUTES.map((attribute) => [attribute, target.getAttribute(attribute)])
    ),
    styles,
    activeStyleKeys: new Set(),
    previousImperativeStyleKeys: previousImperativeStyleKeys
      ? new Set(previousImperativeStyleKeys)
      : undefined,
  };
}

/** 恢复一个被 ThemeProvider 接管前的内联样式属性。 */
function restoreRootThemeStyleProperty(
  state: RootThemeMutationState,
  property: string
): void {
  const snapshot = state.styles.get(property);
  if (!snapshot || snapshot.value === "") {
    state.target.style.removeProperty(property);
    return;
  }
  state.target.style.setProperty(property, snapshot.value, snapshot.priority);
}

/** 在保留原值的前提下把本次解析主题写入 document 根节点。 */
function applyProviderThemeToRoot(
  state: RootThemeMutationState,
  config: ThemeConfig,
  style: React.CSSProperties
): void {
  const nextStyleKeys = new Set(Object.keys(style));
  for (const property of nextStyleKeys) {
    if (state.styles.has(property)) continue;
    state.styles.set(property, {
      value: state.target.style.getPropertyValue(property),
      priority: state.target.style.getPropertyPriority(property),
    });
  }

  const removedStyleKeys = [...state.activeStyleKeys].filter(
    (property) => !nextStyleKeys.has(property)
  );
  applyTheme(state.target, config);
  removedStyleKeys.forEach((property) => restoreRootThemeStyleProperty(state, property));
  state.activeStyleKeys = nextStyleKeys;
}

/** 关闭或卸载根主题层时恢复接管前的属性与命令式主题状态。 */
function restoreRootThemeMutationState(state: RootThemeMutationState): void {
  state.styles.forEach((_snapshot, property) => {
    restoreRootThemeStyleProperty(state, property);
  });
  state.attributes.forEach((value, attribute) => {
    if (value === null) state.target.removeAttribute(attribute);
    else state.target.setAttribute(attribute, value);
  });
  if (state.previousImperativeStyleKeys) {
    imperativeThemeStyleKeys.set(state.target, state.previousImperativeStyleKeys);
  } else {
    imperativeThemeStyleKeys.delete(state.target);
  }
  notifyImperativeThemeChange(state.target);
}

/** Imperative theme application — writes CSS vars / data-attrs on a target. */
export function applyTheme(target: HTMLElement, config: ThemeConfig): void {
  const cfg = resolveThemeConfig(config);
  const colorScheme = resolveThemeColorScheme(cfg.mode, cfg.themes, cfg.colorScheme);
  const snapshot = resolveVisualThemeSnapshot({
    baseColor: cfg.baseColor,
    colorScheme,
    accent: cfg.accentExplicit ? cfg.accent : undefined,
    intensity: cfg.intensity,
    colors: cfg.colors,
    tokens: cfg.tokens,
  });
  const dataAttributes = resolvedThemeConfigToDataAttributes(cfg, colorScheme);
  for (const [attribute, value] of Object.entries(dataAttributes)) {
    if (value === undefined) target.removeAttribute(attribute);
    else target.setAttribute(attribute, value);
  }

  const style = resolvedThemeConfigToStyle(cfg, snapshot) as Record<string, string>;
  const nextStyleKeys = new Set(Object.keys(style));
  for (const property of imperativeThemeStyleKeys.get(target) ?? []) {
    if (!nextStyleKeys.has(property)) target.style.removeProperty(property);
  }
  for (const [property, value] of Object.entries(style)) {
    target.style.setProperty(property, value);
  }
  imperativeThemeStyleKeys.set(target, nextStyleKeys);
  notifyImperativeThemeChange(target);
}

/* ----------------------------- Context ---------------------------------- */

const ThemeCtx = React.createContext<ThemeValue | null>(null);
/** ThemeProvider 内部继承原始主题语义，避免把派生色误当成子级显式配置。 */
const ThemeInheritanceCtx = React.createContext<ThemeConfig | undefined>(undefined);

/** Read/write access to the nearest `<ThemeProvider>`. */
export function useTheme(): ThemeValue {
  const ctx = React.useContext(ThemeCtx);
  if (!ctx) {
    throw new Error(
      "useTheme() must be used inside <ThemeProvider>. Wrap your app (or a subtree) with <ThemeProvider>."
    );
  }
  return ctx;
}

/** Read theme value without throwing — returns `null` outside of a provider. */
export function useThemeOptional(): ThemeValue | null {
  return React.useContext(ThemeCtx);
}

/** 深合并父级与当前主题配置；当前选中的预设先覆盖父级，再由本地显式字段覆盖。 */
function mergeThemeConfigs(
  inherited: ThemeConfig | undefined,
  local: ThemeConfig
): ThemeConfig {
  const merged: ThemeConfig = { ...(inherited ?? {}) };
  const themes = { ...(inherited?.themes ?? {}), ...(local.themes ?? {}) };
  const mode = local.mode ?? inherited?.mode;
  const localDefinesActivePreset =
    mode !== undefined &&
    local.themes !== undefined &&
    Object.prototype.hasOwnProperty.call(local.themes, mode);
  const preset =
    mode !== undefined && (local.mode !== undefined || localDefinesActivePreset)
      ? getThemePreset(themes, mode)
      : undefined;

  if (mode !== undefined) merged.mode = mode;
  if (local.mode !== undefined && isThemeBaseMode(mode)) {
    merged.colorScheme = mode;
  }
  if (preset) {
    if (preset.base !== undefined) merged.colorScheme = preset.base;
    if (preset.baseColor !== undefined) merged.baseColor = preset.baseColor;
    if (preset.accent !== undefined) merged.accent = preset.accent;
    if (preset.density !== undefined) merged.density = preset.density;
    if (preset.intensity !== undefined) merged.intensity = preset.intensity;
    if (preset.radius !== undefined) merged.radius = preset.radius;
    if (preset.font !== undefined) merged.font = preset.font;
  }

  const scalarKeys: Array<
    keyof Pick<
      ThemeConfig,
      | "mode"
      | "colorScheme"
      | "baseColor"
      | "accent"
      | "density"
      | "intensity"
      | "radius"
      | "font"
    >
  > = [
    "mode",
    "colorScheme",
    "baseColor",
    "accent",
    "density",
    "intensity",
    "radius",
    "font",
  ];

  for (const key of scalarKeys) {
    const value = local[key];
    if (value !== undefined) {
      (merged as Record<string, unknown>)[key] = value;
    }
  }

  if (
    (local.baseColor !== undefined || preset?.baseColor !== undefined) &&
    local.accent === undefined &&
    preset?.accent === undefined
  ) {
    delete merged.accent;
  }
  const inheritedColors = { ...(inherited?.colors ?? {}) };
  const inheritedTokens = { ...(inherited?.tokens ?? {}) };
  const resetColorKeys = new Set<keyof ResolvedThemeColors>();
  if (local.baseColor !== undefined || preset?.baseColor !== undefined) {
    for (const key of Object.keys(COLOR_TOKEN_KEYS) as Array<keyof ResolvedThemeColors>) {
      resetColorKeys.add(key);
    }
  } else {
    for (const key of [
      ...Object.keys(preset?.colors ?? {}),
      ...Object.keys(local.colors ?? {}),
    ] as Array<keyof ResolvedThemeColors>) {
      resetColorKeys.add(key);
    }
    if (local.accent !== undefined || preset?.accent !== undefined) {
      resetColorKeys.add("accent");
      resetColorKeys.add("accentInk");
      resetColorKeys.add("accentSoft");
      resetColorKeys.add("accentGlow");
    }
  }
  for (const key of resetColorKeys) {
    delete inheritedColors[key];
    const tokenKey = COLOR_TOKEN_KEYS[key];
    delete inheritedTokens[tokenKey];
    delete inheritedTokens[`--${tokenKey}`];
  }
  merged.colors = {
    ...inheritedColors,
    ...(preset?.colors ?? {}),
    ...(local.colors ?? {}),
  };
  merged.tokens = {
    ...inheritedTokens,
    ...(preset?.tokens ?? {}),
    ...(local.tokens ?? {}),
  };
  merged.components = mergeComponentThemeOverrides(
    inherited?.components,
    preset?.components,
    local.components
  );
  merged.themes = themes;
  return merged;
}

/* ---------------------------- Persistence ------------------------------- */

const THEME_STORAGE_VERSION = 1;

/** localStorage 中带版本号的主题配置封装。 */
interface PersistedThemeEnvelope {
  version: number;
  config: Partial<ThemeConfig>;
}

/** 判断持久化数据是否采用当前的版本化封装。 */
function isPersistedThemeEnvelope(value: unknown): value is PersistedThemeEnvelope {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<PersistedThemeEnvelope>;
  return typeof candidate.version === "number" && !!candidate.config && typeof candidate.config === "object";
}

function loadPersisted(key: string | undefined): Partial<ThemeConfig> | null {
  if (!key || !isBrowser) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    const persisted = isPersistedThemeEnvelope(parsed)
      ? parsed.config
      : (parsed as Partial<ThemeConfig>);
    if (isTransientThemeMode(persisted.mode)) {
      localStorage.removeItem(key);
      return null;
    }
    return persisted;
  } catch {
    return null;
  }
}

function persist(key: string | undefined, cfg: ThemeConfig): void {
  if (!key || !isBrowser) return;
  if (isTransientThemeMode(cfg.mode)) return;
  try {
    const payload: PersistedThemeEnvelope = {
      version: THEME_STORAGE_VERSION,
      config: cfg,
    };
    localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    /* quota exceeded / disabled storage — ignore */
  }
}

/** 把调用方显式传入的受控主题字段覆盖到基础配置上。 */
function applyExplicitThemeProps(base: ThemeConfig, props: ThemeConfig): ThemeConfig {
  return {
    ...base,
    ...(props.mode !== undefined ? { mode: props.mode } : null),
    ...(props.colorScheme !== undefined ? { colorScheme: props.colorScheme } : null),
    ...(props.baseColor !== undefined ? { baseColor: props.baseColor } : null),
    ...(props.accent !== undefined ? { accent: props.accent } : null),
    ...(props.density !== undefined ? { density: props.density } : null),
    ...(props.intensity !== undefined ? { intensity: props.intensity } : null),
    ...(props.radius !== undefined ? { radius: props.radius } : null),
    ...(props.font !== undefined ? { font: props.font } : null),
    ...(props.colors !== undefined ? { colors: props.colors } : null),
    ...(props.tokens !== undefined ? { tokens: props.tokens } : null),
    ...(props.components !== undefined ? { components: props.components } : null),
    ...(props.themes !== undefined ? { themes: props.themes } : null),
  };
}

/** 只根据当前属性创建主题配置；顶层 Provider 同时补齐默认值。 */
function createThemeConfigFromProps(
  props: ThemeConfig,
  includeDefaults = true
): ThemeConfig {
  if (!includeDefaults) {
    return applyExplicitThemeProps({}, props);
  }
  const mode = props.mode ?? DEFAULT_CONFIG.mode;
  const fromProps: ThemeConfig = {
    mode,
    colorScheme: props.colorScheme,
    baseColor: props.baseColor,
    accent: props.accent,
    density: props.density ?? DEFAULT_CONFIG.density,
    intensity: props.intensity ?? DEFAULT_CONFIG.intensity,
    radius: props.radius ?? DEFAULT_CONFIG.radius,
    font: props.font ?? DEFAULT_CONFIG.font,
    colors: props.colors ?? {},
    tokens: props.tokens ?? {},
    components: props.components ?? {},
    themes: props.themes ?? DEFAULT_CONFIG.themes,
  };
  return applyExplicitThemeProps(applyThemePreset(fromProps, mode), props);
}

/* --------------------------- ThemeProvider ------------------------------ */

export interface ThemeProviderProps extends ThemeProviderConfig {
  children?: React.ReactNode;
  /** 是否启用当前 Provider；关闭时保持 Context 拓扑但完整继承外层主题。 */
  enabled?: boolean;
  /**
   * Where to apply the theme.
   * - `"root"` (default): on `<html>` — affects the whole document.
   * - `"scope"`: on a local wrapper element — scoped to descendants.
   */
  target?: "root" | "scope";
  /** Tag for scope mode. Default `"div"`. */
  as?: keyof JSX.IntrinsicElements;
  /** scope 模式直接把主题应用到唯一子元素，避免增加额外 DOM 包装。 */
  asChild?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** 使用带版本号的结构持久化主题，并同步同源窗口。 */
  storageKey?: string;
  /** Called whenever the resolved theme value changes. */
  onChange?: (value: ThemeValue) => void;
}

/** 可由 ThemeProvider 合并属性的主题作用域子元素属性。 */
interface ThemeScopeChildProps {
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLElement>;
}

/** 带可合并 ref 的主题作用域唯一子元素。 */
type ThemeScopeChildElement = React.ReactElement<ThemeScopeChildProps> & {
  ref?: React.Ref<HTMLElement>;
};

/** 合并 ThemeProvider 内部 ref 与唯一子元素已有 ref。 */
function mergeThemeScopeRefs(
  internalRef: React.MutableRefObject<HTMLElement | null>,
  childRef: React.Ref<HTMLElement> | undefined
): React.RefCallback<HTMLElement> {
  return (node) => {
    internalRef.current = node;
    if (typeof childRef === "function") childRef(node);
    else if (childRef) {
      (childRef as React.MutableRefObject<HTMLElement | null>).current = node;
    }
  };
}

/**
 * `<ThemeProvider>` — manage theme state and apply CSS variables.
 *
 * @example
 * ```tsx
 * <ThemeProvider mode="system" accent="violet" storageKey="app:theme">
 *   <App />
 * </ThemeProvider>
 * ```
 *
 * @example Custom accent
 * ```tsx
 * <ThemeProvider accent={{ accent: "oklch(70% 0.2 180)" }} />
 * // or just
 * <ThemeProvider accent="oklch(70% 0.2 180)" />
 * ```
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = (props) => {
  const {
    children,
    enabled = true,
    target = "root",
    as: Tag = "div",
    asChild = false,
    className,
    style,
    storageKey,
    onChange,
    ...configProps
  } = props;
  const inheritedConfig = React.useContext(ThemeInheritanceCtx);
  const inheritedThemeValue = React.useContext(ThemeCtx);
  const inheritedVisualSnapshot = useVisualThemeSnapshot();
  const inheritedPortalContainer = usePortalContainer();
  const hasInheritedTheme = inheritedConfig !== undefined;

  // Build the initial config: defaults ← props ← custom preset ← persisted (if any)
  const initialConfig = React.useMemo<ThemeConfig>(() => {
    const fromProps = createThemeConfigFromProps(configProps, !hasInheritedTheme);
    const persisted = loadPersisted(storageKey);
    const withExplicitProps = fromProps;
    if (!persisted) return withExplicitProps;

    let persistedForMerge = persisted;
    if (configProps.themes !== undefined) {
      const { themes: _persistedThemes, ...rest } = persisted;
      persistedForMerge = rest;
    }

    const persistedMode = persistedForMerge.mode ?? withExplicitProps.mode;
    const presetBase =
      persistedMode === undefined
        ? withExplicitProps
        : applyThemePreset(
            { ...withExplicitProps, mode: persistedMode },
            persistedMode
          );
    const withPersisted: ThemeConfig = {
      ...presetBase,
      ...persistedForMerge,
      ...(configProps.themes !== undefined ? { themes: configProps.themes } : null),
    };
    const withControlledThemePreset =
      configProps.themes !== undefined &&
      persistedMode !== undefined &&
      !isBuiltInThemeMode(persistedMode)
        ? applyThemePreset(withPersisted, persistedMode)
        : withPersisted;
    return applyExplicitThemeProps(withControlledThemePreset, configProps);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [config, setConfig] = React.useState<ThemeConfig>(initialConfig);
  const previousPropsRef = React.useRef<ThemeConfig>({
    mode: configProps.mode,
    colorScheme: configProps.colorScheme,
    baseColor: configProps.baseColor,
    accent: configProps.accent,
    density: configProps.density,
    intensity: configProps.intensity,
    radius: configProps.radius,
    font: configProps.font,
    colors: configProps.colors,
    tokens: configProps.tokens,
    components: configProps.components,
    themes: configProps.themes,
  });

  // Sync external prop changes into state — so callers can drive the provider
  // "controlled-style" (e.g. <ThemeProvider accent={reactState} />).
  // `setMode`/`setAccent`/etc. still work; they just get overridden if the
  // parent later changes the prop.
  React.useEffect(() => {
    const previous = previousPropsRef.current;
    const changedProps: Partial<ThemeConfig> = {};
    const assignIfChanged = <K extends keyof ThemeConfig>(key: K, value: ThemeConfig[K] | undefined) => {
      if (value !== previous[key]) changedProps[key] = value;
    };

    assignIfChanged("mode", configProps.mode);
    assignIfChanged("colorScheme", configProps.colorScheme);
    assignIfChanged("baseColor", configProps.baseColor);
    assignIfChanged("accent", configProps.accent);
    assignIfChanged("density", configProps.density);
    assignIfChanged("intensity", configProps.intensity);
    assignIfChanged("radius", configProps.radius);
    assignIfChanged("font", configProps.font);
    assignIfChanged("colors", configProps.colors);
    assignIfChanged("tokens", configProps.tokens);
    assignIfChanged("components", configProps.components);
    assignIfChanged("themes", configProps.themes);

    previousPropsRef.current = {
      mode: configProps.mode,
      colorScheme: configProps.colorScheme,
      baseColor: configProps.baseColor,
      accent: configProps.accent,
      density: configProps.density,
      intensity: configProps.intensity,
      radius: configProps.radius,
      font: configProps.font,
      colors: configProps.colors,
      tokens: configProps.tokens,
      components: configProps.components,
      themes: configProps.themes,
    };

    if (Object.keys(changedProps).length === 0) return;

    setConfig((c) => {
      const currentBase = Object.prototype.hasOwnProperty.call(changedProps, "themes")
        ? clearActiveThemePreset(c)
        : c;
      const base: ThemeConfig = {
        ...currentBase,
        ...(Object.prototype.hasOwnProperty.call(changedProps, "themes")
          ? { themes: configProps.themes ?? DEFAULT_CONFIG.themes }
          : null),
      };
      const fallbackMode = hasInheritedTheme ? undefined : DEFAULT_CONFIG.mode;
      const mode =
        Object.prototype.hasOwnProperty.call(changedProps, "mode")
          ? (configProps.mode ?? fallbackMode)
          : (c.mode ?? fallbackMode);
      const shouldApplyPreset =
        mode !== undefined &&
        (
          Object.prototype.hasOwnProperty.call(changedProps, "mode") ||
          (Object.prototype.hasOwnProperty.call(changedProps, "themes") &&
            !isBuiltInThemeMode(mode))
        );
      const shouldUseProp = <K extends keyof ThemeConfig>(key: K) =>
        Object.prototype.hasOwnProperty.call(changedProps, key) || configProps[key] !== undefined;
      const nextFromMode = shouldApplyPreset
        ? applyThemePreset(base, mode as ThemeMode)
        : base;
      const next: ThemeConfig = {
        ...nextFromMode,
        mode,
        ...(shouldUseProp("colorScheme")
          ? { colorScheme: configProps.colorScheme }
          : null),
        ...(shouldUseProp("baseColor") ? { baseColor: configProps.baseColor } : null),
        ...(shouldUseProp("accent") ? { accent: configProps.accent } : null),
        ...(shouldUseProp("density") ? { density: configProps.density } : null),
        ...(shouldUseProp("intensity")
          ? { intensity: configProps.intensity }
          : null),
        ...(shouldUseProp("radius") ? { radius: configProps.radius } : null),
        ...(shouldUseProp("font") ? { font: configProps.font } : null),
        ...(shouldUseProp("colors") ? { colors: configProps.colors } : null),
        ...(shouldUseProp("tokens") ? { tokens: configProps.tokens } : null),
        ...(shouldUseProp("components") ? { components: configProps.components } : null),
      };
      if (
        next.mode === c.mode &&
        next.colorScheme === c.colorScheme &&
        next.baseColor === c.baseColor &&
        next.accent === c.accent &&
        next.density === c.density &&
        next.intensity === c.intensity &&
        next.radius === c.radius &&
        next.font === c.font &&
        next.colors === c.colors &&
        next.tokens === c.tokens &&
        next.components === c.components &&
        next.themes === c.themes
      ) {
        return c;
      }
      return next;
    });
  }, [
    configProps.mode,
    configProps.colorScheme,
    configProps.baseColor,
    configProps.accent,
    configProps.density,
    configProps.intensity,
    configProps.radius,
    configProps.font,
    configProps.colors,
    configProps.tokens,
    configProps.components,
    configProps.themes,
    hasInheritedTheme,
  ]);

  // 同源的其他窗口更新主题时，同步当前非受控状态。
  React.useEffect(() => {
    if (!storageKey || !isBrowser) return;

    /** 合并跨窗口主题数据，并保留调用方显式控制的字段。 */
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== storageKey && event.key !== null) return;
      if (event.newValue === null) {
        setConfig(createThemeConfigFromProps(configProps, !hasInheritedTheme));
        return;
      }

      const persisted = loadPersisted(storageKey);
      if (!persisted) return;
      setConfig((current) => {
        const persistedForMerge = { ...persisted };
        if (configProps.themes !== undefined) delete persistedForMerge.themes;
        const mode =
          configProps.mode ??
          persistedForMerge.mode ??
          current.mode ??
          (hasInheritedTheme ? undefined : DEFAULT_CONFIG.mode);
        const persistedConfig = {
          ...current,
          ...persistedForMerge,
          ...(configProps.themes !== undefined ? { themes: configProps.themes } : null),
        };
        const merged =
          mode === undefined
            ? persistedConfig
            : applyThemePreset(persistedConfig, mode);
        return applyExplicitThemeProps({
          ...merged,
          ...(mode !== undefined ? { mode } : null),
        }, configProps);
      });
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [
    configProps.mode,
    configProps.colorScheme,
    configProps.baseColor,
    configProps.accent,
    configProps.density,
    configProps.intensity,
    configProps.radius,
    configProps.font,
    configProps.colors,
    configProps.tokens,
    configProps.components,
    configProps.themes,
    hasInheritedTheme,
    storageKey,
  ]);

  // Listen for system preference changes when mode === "system".
  const [systemDark, setSystemDark] = React.useState<boolean>(() =>
    isBrowser && window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  React.useEffect(() => {
    if (!isBrowser) return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mql.addEventListener?.("change", handler);
    return () => mql.removeEventListener?.("change", handler);
  }, []);

  const effectiveConfig = React.useMemo(
    () => resolveThemeConfig(mergeThemeConfigs(inheritedConfig, config)),
    [config, inheritedConfig]
  );
  const activeTheme = React.useMemo(
    () => getThemePreset(effectiveConfig.themes, effectiveConfig.mode) ?? null,
    [effectiveConfig.mode, effectiveConfig.themes]
  );
  const colorScheme: ThemeBaseMode =
    effectiveConfig.mode === "system"
      ? (systemDark ? "dark" : "light")
      : isThemeBaseMode(effectiveConfig.mode)
        ? effectiveConfig.mode
        : effectiveConfig.colorScheme ?? activeTheme?.base ?? DEFAULT_CONFIG.colorScheme;
  const resolvedMode: ResolvedThemeMode =
    effectiveConfig.mode === "system" ? colorScheme : (effectiveConfig.mode as ResolvedThemeMode);

  const visualSnapshot = React.useMemo(
    () =>
      resolveVisualThemeSnapshot({
        baseColor: effectiveConfig.baseColor,
        colorScheme,
        accent: effectiveConfig.accentExplicit ? effectiveConfig.accent : undefined,
        intensity: effectiveConfig.intensity,
        colors: effectiveConfig.colors,
        tokens: effectiveConfig.tokens,
      }),
    [
      effectiveConfig.baseColor,
      effectiveConfig.accent,
      effectiveConfig.accentExplicit,
      effectiveConfig.intensity,
      effectiveConfig.colors,
      effectiveConfig.tokens,
      colorScheme,
    ]
  );

  const { key: accentKey, palette: accentPalette } = React.useMemo(() => {
    if (
      (effectiveConfig.baseColor && !effectiveConfig.accentExplicit) ||
      hasAccentColorOverride(effectiveConfig)
    ) {
      return {
        key: "custom" as const,
        palette: {
          accent: visualSnapshot.colors.accent,
          ink: visualSnapshot.colors.accentInk,
          soft: visualSnapshot.colors.accentSoft,
          glow: visualSnapshot.colors.accentGlow,
        },
      };
    }
    return normalizeAccentInput(effectiveConfig.accent, colorScheme);
  }, [
    effectiveConfig.baseColor,
    effectiveConfig.accent,
    effectiveConfig.accentExplicit,
    colorScheme,
    visualSnapshot.colors,
  ]);

  const scopeRef = React.useRef<HTMLElement | null>(null);
  const scopeChild =
    target === "scope" && asChild
      ? (React.Children.only(children) as ThemeScopeChildElement)
      : null;
  const scopeChildRef = scopeChild?.ref;
  const mergedScopeRef = React.useMemo(
    () => mergeThemeScopeRefs(scopeRef, scopeChildRef),
    [scopeChildRef]
  );
  const [portalContainer, setPortalContainer] = React.useState<HTMLElement | null>(null);
  const rootThemeMutationRef = React.useRef<RootThemeMutationState | null>(null);

  // scope 模式的浮层仍挂到 body，但通过独立容器继承同一套主题变量。
  useIsomorphicLayoutEffect(() => {
    if (!isBrowser || !enabled || target !== "scope") {
      setPortalContainer(null);
      return;
    }

    const container = document.createElement("div");
    container.dataset.luminaPortalScope = "";
    container.style.display = "contents";
    document.body.appendChild(container);
    setPortalContainer(container);

    return () => {
      container.remove();
    };
  }, [enabled, target]);

  // 根主题层关闭、切换目标或卸载时恢复接管前的 document 根节点状态。
  useIsomorphicLayoutEffect(() => {
    if (!isBrowser || !enabled || target !== "root") return;
    const state = createRootThemeMutationState(document.documentElement);
    rootThemeMutationRef.current = state;
    return () => {
      if (rootThemeMutationRef.current !== state) return;
      restoreRootThemeMutationState(state);
      rootThemeMutationRef.current = null;
    };
  }, [enabled, target]);

  // Apply theme whenever config/resolvedMode changes.
  useIsomorphicLayoutEffect(() => {
    if (!isBrowser || !enabled) return;
    const targets = (
      target === "root"
        ? [document.documentElement]
        : [portalContainer]
    ).filter((element): element is HTMLElement => element != null);
    if (targets.length === 0) return;
    for (const el of targets) {
      const resolvedConfig = {
        ...effectiveConfig,
        accent: effectiveConfig.accentExplicit ? effectiveConfig.accent : undefined,
        colorScheme,
      };
      if (target === "root" && rootThemeMutationRef.current?.target === el) {
        applyProviderThemeToRoot(
          rootThemeMutationRef.current,
          resolvedConfig,
          resolvedThemeConfigToStyle(effectiveConfig, visualSnapshot)
        );
      } else {
        applyTheme(el, resolvedConfig);
      }
    }
    persist(storageKey, config);
  }, [
    colorScheme,
    config,
    effectiveConfig,
    enabled,
    portalContainer,
    storageKey,
    target,
  ]);

  const value: ThemeValue = React.useMemo(() => {
    const patch = (p: Partial<ThemeProviderConfig>) => setConfig((c) => patchThemeConfig(c, p));
    return {
      mode: effectiveConfig.mode,
      resolvedMode,
      colorScheme,
      baseColor: effectiveConfig.baseColor,
      accent: accentKey,
      accentPalette,
      density: effectiveConfig.density,
      intensity: effectiveConfig.intensity,
      radius: effectiveConfig.radius,
      font: effectiveConfig.font,
      colors: effectiveConfig.colors,
      tokens: effectiveConfig.tokens,
      themes: effectiveConfig.themes,
      components: effectiveConfig.components,
      activeTheme,
      setMode: (m) => patch({ mode: m }),
      toggleMode: () =>
        setConfig((currentConfig) => {
          const currentMode = currentConfig.mode ?? effectiveConfig.mode;
          return patchThemeConfig(currentConfig, {
            mode: (currentMode === "dark" ? "light" : "dark") as ThemeMode,
          });
        }),
      setBaseColor: (baseColor) => patch({ baseColor }),
      setAccent: (a) => patch({ accent: a }),
      setDensity: (d) => patch({ density: d }),
      setIntensity: (n) => patch({ intensity: n }),
      setRadius: (n) => patch({ radius: n }),
      setFont: (f) => patch({ font: f }),
      setColors: (colors) => patch({ colors }),
      setTokens: (t) => patch({ tokens: t }),
      setThemes: (t) => patch({ themes: t }),
      setComponents: (components) => patch({ components }),
      update: patch,
      reset: () => setConfig(initialConfig),
    };
  }, [effectiveConfig, resolvedMode, colorScheme, accentKey, accentPalette, activeTheme, initialConfig]);

  /** 向嵌套 Provider 传递可继承配置；隐式强调色保持未指定状态以便按子级模式重新派生。 */
  const inheritanceConfig = React.useMemo<ThemeConfig>(() => ({
    mode: effectiveConfig.mode,
    colorScheme,
    baseColor: effectiveConfig.baseColor,
    ...(effectiveConfig.accentExplicit ? { accent: effectiveConfig.accent } : null),
    density: effectiveConfig.density,
    intensity: effectiveConfig.intensity,
    radius: effectiveConfig.radius,
    font: effectiveConfig.font,
    colors: effectiveConfig.colors,
    tokens: effectiveConfig.tokens,
    components: effectiveConfig.components,
    themes: effectiveConfig.themes,
  }), [effectiveConfig, colorScheme]);

  // onChange callback.
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;
  React.useEffect(() => {
    if (!enabled) return;
    onChangeRef.current?.(value);
  }, [enabled, value]);

  const activePortalContainer = enabled
    ? (target === "scope" ? portalContainer : null)
    : inheritedPortalContainer;
  const activeVisualSnapshot = enabled ? visualSnapshot : inheritedVisualSnapshot;
  const activeComponentOverrides = enabled ? effectiveConfig.components : undefined;
  const activeInheritanceConfig = enabled ? inheritanceConfig : inheritedConfig;
  const activeThemeValue = enabled ? value : inheritedThemeValue;

  if (target === "scope") {
    const Component = Tag as React.ElementType;
    const scopeThemeStyle = enabled
      ? {
          color: "var(--fg)",
          fontFamily: "var(--font-sans)",
          ...resolvedThemeConfigToStyle(effectiveConfig, visualSnapshot),
        }
      : {};
    const scopeDataAttributes = enabled
      ? resolvedThemeConfigToDataAttributes(effectiveConfig, colorScheme)
      : {};
    const scopeNode = asChild && scopeChild
      ? React.cloneElement(scopeChild, {
          ...scopeDataAttributes,
          ref: mergedScopeRef,
          className: [className, scopeChild.props.className]
            .filter(Boolean)
            .join(" ") || undefined,
          style: {
            ...scopeThemeStyle,
            ...style,
            ...scopeChild.props.style,
          },
        })
      : (
          <Component
            ref={scopeRef as React.Ref<never>}
            className={className}
            {...scopeDataAttributes}
            style={{
              ...scopeThemeStyle,
              ...style,
            }}
          >
            {children}
          </Component>
        );
    return (
      <PortalScopeProvider container={activePortalContainer}>
        <VisualThemeProvider value={activeVisualSnapshot}>
          <ComponentOverridesProvider value={activeComponentOverrides}>
            <ThemeInheritanceCtx.Provider value={activeInheritanceConfig}>
              <ThemeCtx.Provider value={activeThemeValue}>
                {scopeNode}
              </ThemeCtx.Provider>
            </ThemeInheritanceCtx.Provider>
          </ComponentOverridesProvider>
        </VisualThemeProvider>
      </PortalScopeProvider>
    );
  }

  return (
    <PortalScopeProvider container={activePortalContainer}>
      <VisualThemeProvider value={activeVisualSnapshot}>
        <ComponentOverridesProvider value={activeComponentOverrides}>
          <ThemeInheritanceCtx.Provider value={activeInheritanceConfig}>
            <ThemeCtx.Provider value={activeThemeValue}>{children}</ThemeCtx.Provider>
          </ThemeInheritanceCtx.Provider>
        </ComponentOverridesProvider>
      </VisualThemeProvider>
    </PortalScopeProvider>
  );
};
