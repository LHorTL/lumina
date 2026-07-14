import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Surface.css";
import * as React from "react";
import {
  ThemeProvider,
  useThemeOptional,
  type DensityMode,
  type FontConfig,
  type ThemeMode,
  type ThemePreset,
  type ThemePresets,
} from "../Theme/Theme";
import type {
  AccentKey,
  CustomAccentInput,
  ThemeBaseMode,
  ThemeColorOverrides,
  ThemeTokens,
} from "../Theme/themeTypes";
import type {
  ComponentTheme,
  ComponentThemeOptions,
  ComponentThemeOverrides,
} from "../Theme/componentThemeTypes";
import {
  ComponentOverridesProvider,
  mergeComponentThemeOverrides,
} from "../Theme/themeRuntime";
import {
  ComponentThemeBoundary,
  normalizeComponentThemeInput,
  useComponentThemeRootRef,
} from "../Theme/ComponentTheme";
import { cloneLuminaThemePreset } from "../Theme/presets";

export type SurfacePreset = "inherit" | "mist" | "porcelain" | "graphite" | "ember";
export type SurfaceTone = "base" | "raised" | "sunken" | "accent";
export type SurfaceVariant = "plain" | "raised" | "sunken" | "floating";
export type SurfacePadding = "none" | "sm" | "md" | "lg" | "xl";
export type SurfaceRadius = "none" | "sm" | "md" | "lg" | "xl";
export type SurfaceHeight = "content" | "fill" | "screen";

function createSurfaceThemePreset(
  key: "light" | "porcelain" | "graphite" | "ember"
): ThemePreset {
  const preset = cloneLuminaThemePreset(key) as ThemePreset;
  delete preset.density;
  delete preset.font;
  delete preset.label;
  delete preset.description;
  return preset;
}

export const SURFACE_THEME_PRESETS: Record<Exclude<SurfacePreset, "inherit">, ThemePreset> = {
  mist: createSurfaceThemePreset("light"),
  porcelain: createSurfaceThemePreset("porcelain"),
  graphite: createSurfaceThemePreset("graphite"),
  ember: createSurfaceThemePreset("ember"),
};

const surfacePresetMap = SURFACE_THEME_PRESETS;

export interface SurfaceProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Built-in local surface palette. `inherit` keeps the surrounding theme. */
  preset?: SurfacePreset;
  /** Background token used by the visible surface. */
  tone?: SurfaceTone;
  /** Neumorphic depth treatment for the surface itself. */
  variant?: SurfaceVariant;
  /** Inner padding. */
  padding?: SurfacePadding;
  /** Corner radius for the visible surface. */
  radius?: SurfaceRadius;
  /** Height behavior for page-sized surfaces. */
  height?: SurfaceHeight;
  /** Adds a subtle token-driven border. */
  bordered?: boolean;
  /** Allows the surface to scroll when constrained by its parent. */
  scrollable?: boolean;

  /** Local theme mode. Inherits the nearest ThemeProvider when omitted. */
  mode?: ThemeMode;
  /** Base light/dark color scheme for custom modes. */
  colorScheme?: ThemeBaseMode;
  /** Local accent palette or preset key. */
  accent?: AccentKey | CustomAccentInput;
  /** 从基色生成一套完整的局部拟态色板。 */
  baseColor?: string;
  /** Local density. */
  density?: DensityMode;
  /** Local shadow strength, 1..10. */
  intensity?: number;
  /** Local theme radius in px. This is separate from the surface's own `radius` prop. */
  themeRadius?: number;
  /** Local font preset or stack. */
  font?: FontConfig;
  /** Local token overrides. */
  tokens?: ThemeTokens;
  /** 对局部派生色板进行精确覆盖。 */
  colors?: ThemeColorOverrides;
  /** 对 Surface 后代中的指定组件类型应用覆盖。 */
  components?: ComponentThemeOverrides;
  /** Surface 局部主题简写，始终作为 subtree 主题使用。 */
  theme?: ComponentTheme;
  /** Local custom mode registry. */
  themes?: ThemePresets;
  children?: React.ReactNode;
}

const isDefined = <T,>(value: T | undefined): value is T => value !== undefined;

/**
 * `Surface` — theme-aware background container for Lumina content.
 *
 * @example
 * ```tsx
 * <Surface preset="graphite" padding="lg" radius="xl">
 *   <Card>Content that needs the graphite surface tokens.</Card>
 * </Surface>
 * ```
 */
export const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  (
    {
      preset = "inherit",
      tone = "base",
      variant = "plain",
      padding = "md",
      radius = "lg",
      height = "content",
      bordered,
      scrollable,
      mode,
      colorScheme,
      accent,
      baseColor,
      density,
      intensity,
      themeRadius,
      font,
      tokens,
      colors,
      components,
      theme,
      themes,
      className = "",
      children,
      style,
      ...rest
    },
    ref
  ) => {
    const inherited = useThemeOptional();
    const normalizedTheme = normalizeComponentThemeInput(theme);
    const presetConfig = preset === "inherit" ? undefined : surfacePresetMap[preset];
    const effectiveSurfaceMode =
      mode ??
      colorScheme ??
      normalizedTheme?.colorScheme ??
      (presetConfig?.base as ThemeMode | undefined) ??
      inherited?.mode ??
      "light";
    const [systemDark, setSystemDark] = React.useState(() =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );

    // Surface 根节点与内部 ThemeProvider 同步响应系统明暗变化。
    React.useEffect(() => {
      if (effectiveSurfaceMode !== "system" || typeof window === "undefined") return;
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      setSystemDark(media.matches);
      const handleChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
      media.addEventListener?.("change", handleChange);
      return () => media.removeEventListener?.("change", handleChange);
    }, [effectiveSurfaceMode]);
    const registeredModePreset =
      effectiveSurfaceMode != null &&
      effectiveSurfaceMode !== "light" &&
      effectiveSurfaceMode !== "dark" &&
      effectiveSurfaceMode !== "system"
        ? themes?.[effectiveSurfaceMode] ?? inherited?.themes[effectiveSurfaceMode]
        : undefined;
    const localComponents = mergeComponentThemeOverrides(
      normalizedTheme?.components,
      components
    );
    const hasLocalComponentPalette =
      normalizedTheme != null &&
      [
        normalizedTheme.baseColor,
        normalizedTheme.colorScheme,
        normalizedTheme.accent,
        normalizedTheme.intensity,
        normalizedTheme.colors,
        normalizedTheme.tokens,
      ].some(isDefined);
    const usesLocalTheme =
      preset !== "inherit" ||
      isDefined(mode) ||
      isDefined(colorScheme) ||
      isDefined(accent) ||
      isDefined(baseColor) ||
      isDefined(density) ||
      isDefined(intensity) ||
      isDefined(themeRadius) ||
      isDefined(font) ||
      isDefined(tokens) ||
      isDefined(colors) ||
      hasLocalComponentPalette ||
      isDefined(themes);
    const modeBaseColorScheme: ThemeBaseMode | undefined =
      effectiveSurfaceMode === "light" || effectiveSurfaceMode === "dark"
        ? (effectiveSurfaceMode as ThemeBaseMode)
        : effectiveSurfaceMode === "system"
          ? (systemDark ? "dark" : "light")
          : undefined;
    const localSurfaceColorScheme: ThemeBaseMode | undefined =
      modeBaseColorScheme ??
      colorScheme ??
      normalizedTheme?.colorScheme ??
      presetConfig?.base ??
      registeredModePreset?.base;
    const hasLocalSurfacePalette =
      presetConfig != null ||
      registeredModePreset != null ||
      mode === "light" ||
      mode === "dark" ||
      [
        colorScheme,
        accent,
        baseColor,
        intensity,
        tokens,
        colors,
      ].some(isDefined) ||
      hasLocalComponentPalette;
    const localSurfaceTheme: ComponentThemeOptions | undefined = hasLocalSurfacePalette
      ? {
          colorScheme: localSurfaceColorScheme,
          baseColor:
            baseColor ??
            normalizedTheme?.baseColor ??
            presetConfig?.baseColor ??
            registeredModePreset?.baseColor,
          accent:
            accent ??
            normalizedTheme?.accent ??
            presetConfig?.accent ??
            registeredModePreset?.accent,
          intensity:
            intensity ??
            normalizedTheme?.intensity ??
            presetConfig?.intensity ??
            registeredModePreset?.intensity,
          tokens: {
            ...(registeredModePreset?.tokens ?? {}),
            ...(presetConfig?.tokens ?? {}),
            ...(normalizedTheme?.tokens ?? {}),
            ...(tokens ?? {}),
          },
          colors: {
            ...(registeredModePreset?.colors ?? {}),
            ...(presetConfig?.colors ?? {}),
            ...(normalizedTheme?.colors ?? {}),
            ...(colors ?? {}),
          },
          scope: "self",
        }
      : undefined;
    const [themeRootElement, themeRootRef] = useComponentThemeRootRef<HTMLDivElement>(
      ref,
      { component: "Surface", theme: localSurfaceTheme }
    );

    const cls = [
      "surface",
      `tone-${tone}`,
      variant,
      `pad-${padding}`,
      `radius-${radius}`,
      `height-${height}`,
      bordered && "bordered",
      scrollable && "scrollable",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <ComponentThemeBoundary
        component="Surface"
        cssPrefix="surface"
        theme={localSurfaceTheme}
        rootElement={themeRootElement}
      >
        {(themeState) => {
          const surfaceNode = (
            <div
              ref={themeRootRef}
              className={cls}
              data-surface-preset={preset === "inherit" ? undefined : preset}
              data-surface-tone={tone}
              {...themeState.rootDataAttributes}
              {...rest}
              style={{ ...themeState.rootStyle, ...style }}
            >
              {children}
            </div>
          );

          return (
            <ComponentOverridesProvider value={localComponents}>
              <ThemeProvider
                enabled={usesLocalTheme}
                target="scope"
                asChild
                mode={effectiveSurfaceMode}
                colorScheme={localSurfaceColorScheme ?? inherited?.colorScheme ?? "light"}
                baseColor={baseColor ?? normalizedTheme?.baseColor ?? presetConfig?.baseColor}
                accent={accent ?? normalizedTheme?.accent ?? presetConfig?.accent}
                density={density ?? presetConfig?.density ?? registeredModePreset?.density ?? inherited?.density ?? "comfortable"}
                intensity={intensity ?? normalizedTheme?.intensity ?? presetConfig?.intensity ?? registeredModePreset?.intensity ?? inherited?.intensity ?? 5}
                radius={themeRadius ?? presetConfig?.radius ?? registeredModePreset?.radius ?? inherited?.radius ?? 20}
                font={font ?? presetConfig?.font ?? registeredModePreset?.font ?? inherited?.font ?? "sf"}
                tokens={{
                  ...(presetConfig?.tokens ?? {}),
                  ...(normalizedTheme?.tokens ?? {}),
                  ...(tokens ?? {}),
                }}
                colors={{
                  ...(presetConfig?.colors ?? {}),
                  ...(normalizedTheme?.colors ?? {}),
                  ...(colors ?? {}),
                }}
                components={mergeComponentThemeOverrides(
                  presetConfig?.components,
                  localComponents
                )}
                themes={{
                  ...(inherited?.themes ?? {}),
                  ...(themes ?? {}),
                }}
              >
                {surfaceNode}
              </ThemeProvider>
            </ComponentOverridesProvider>
          );
        }}
      </ComponentThemeBoundary>
    );
  }
);
Surface.displayName = "Surface";
