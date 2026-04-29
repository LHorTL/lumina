import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Surface.css";
import * as React from "react";
import {
  ThemeProvider,
  useThemeOptional,
  type AccentKey,
  type CustomAccentInput,
  type DensityMode,
  type FontConfig,
  type ThemeBaseMode,
  type ThemeMode,
  type ThemePreset,
  type ThemePresets,
  type ThemeTokens,
} from "../Theme";
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
  /** Local custom mode registry. */
  themes?: ThemePresets;
  children?: React.ReactNode;
}

const isDefined = <T,>(value: T | undefined): value is T => value !== undefined;

function getInheritedAccent(theme: ReturnType<typeof useThemeOptional>): AccentKey | CustomAccentInput | undefined {
  if (!theme) return undefined;
  return theme.accent === "custom" ? theme.accentPalette : theme.accent;
}

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
      density,
      intensity,
      themeRadius,
      font,
      tokens,
      themes,
      className = "",
      children,
      ...rest
    },
    ref
  ) => {
    const inherited = useThemeOptional();
    const presetConfig = preset === "inherit" ? undefined : surfacePresetMap[preset];
    const usesLocalTheme =
      preset !== "inherit" ||
      isDefined(mode) ||
      isDefined(colorScheme) ||
      isDefined(accent) ||
      isDefined(density) ||
      isDefined(intensity) ||
      isDefined(themeRadius) ||
      isDefined(font) ||
      isDefined(tokens) ||
      isDefined(themes);

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

    const surfaceNode = (
      <div
        ref={ref}
        className={cls}
        data-surface-preset={preset === "inherit" ? undefined : preset}
        data-surface-tone={tone}
        {...rest}
      >
        {children}
      </div>
    );

    if (!usesLocalTheme) return surfaceNode;

    return (
      <ThemeProvider
        target="scope"
        as="div"
        mode={mode ?? (presetConfig?.base as ThemeMode | undefined) ?? inherited?.mode ?? "light"}
        colorScheme={colorScheme ?? presetConfig?.base ?? inherited?.colorScheme ?? "light"}
        accent={accent ?? presetConfig?.accent ?? getInheritedAccent(inherited) ?? "sky"}
        density={density ?? presetConfig?.density ?? inherited?.density ?? "comfortable"}
        intensity={intensity ?? presetConfig?.intensity ?? inherited?.intensity ?? 5}
        radius={themeRadius ?? presetConfig?.radius ?? inherited?.radius ?? 20}
        font={font ?? presetConfig?.font ?? inherited?.font ?? "sf"}
        tokens={{
          ...(inherited?.tokens ?? {}),
          ...(presetConfig?.tokens ?? {}),
          ...(tokens ?? {}),
        }}
        themes={{
          ...(inherited?.themes ?? {}),
          ...(themes ?? {}),
        }}
        style={{ display: "contents" }}
      >
        {surfaceNode}
      </ThemeProvider>
    );
  }
);
Surface.displayName = "Surface";
