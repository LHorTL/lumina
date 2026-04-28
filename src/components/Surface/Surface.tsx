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

export type SurfacePreset = "inherit" | "mist" | "porcelain" | "graphite" | "ember";
export type SurfaceTone = "base" | "raised" | "sunken" | "accent";
export type SurfaceVariant = "plain" | "raised" | "sunken" | "floating";
export type SurfacePadding = "none" | "sm" | "md" | "lg" | "xl";
export type SurfaceRadius = "none" | "sm" | "md" | "lg" | "xl";
export type SurfaceHeight = "content" | "fill" | "screen";

export const SURFACE_THEME_PRESETS: Record<Exclude<SurfacePreset, "inherit">, ThemePreset> = {
  mist: {
    base: "light",
    accent: "sky",
    intensity: 5,
    radius: 20,
    tokens: {
      bg: "#e8eef5",
      "bg-raised": "#edf2f8",
      "bg-sunken": "#dde4ed",
      fg: "#3a4558",
      "fg-muted": "#7b8599",
      "fg-subtle": "#9ca7ba",
      border: "rgba(130, 148, 175, 0.14)",
      divider: "rgba(130, 148, 175, 0.18)",
      "shadow-dark": "rgba(163, 177, 198, 0.55)",
      "shadow-light": "rgba(255, 255, 255, 0.95)",
    },
  },
  porcelain: {
    base: "light",
    accent: {
      accent: "oklch(66% 0.14 175)",
      ink: "oklch(39% 0.11 175)",
      soft: "oklch(92% 0.04 175)",
      glow: "oklch(66% 0.14 175 / 0.32)",
    },
    intensity: 6,
    radius: 24,
    tokens: {
      bg: "#edf3f1",
      "bg-raised": "#f5faf8",
      "bg-sunken": "#dfe8e5",
      fg: "#33434a",
      "fg-muted": "#75868c",
      "fg-subtle": "#9aa8ad",
      border: "rgba(101, 134, 139, 0.13)",
      divider: "rgba(101, 134, 139, 0.18)",
      "shadow-dark": "rgba(143, 163, 168, 0.45)",
      "shadow-light": "rgba(255, 255, 255, 0.96)",
    },
  },
  graphite: {
    base: "dark",
    accent: {
      accent: "oklch(72% 0.13 190)",
      ink: "oklch(85% 0.1 190)",
      soft: "oklch(31% 0.05 190)",
      glow: "oklch(72% 0.13 190 / 0.18)",
    },
    intensity: 4,
    radius: 18,
    tokens: {
      bg: "#181b22",
      "bg-raised": "#20242d",
      "bg-sunken": "#11141a",
      fg: "#edf1f7",
      "fg-muted": "#a3adbd",
      "fg-subtle": "#667285",
      border: "rgba(255, 255, 255, 0.07)",
      divider: "rgba(255, 255, 255, 0.08)",
      "shadow-dark": "rgba(0, 0, 0, 0.58)",
      "shadow-light": "rgba(128, 146, 166, 0.07)",
    },
  },
  ember: {
    base: "dark",
    accent: {
      accent: "oklch(76% 0.15 62)",
      ink: "oklch(86% 0.11 62)",
      soft: "oklch(34% 0.07 62)",
      glow: "oklch(76% 0.15 62 / 0.18)",
    },
    intensity: 5,
    radius: 16,
    tokens: {
      bg: "#201a18",
      "bg-raised": "#2a221f",
      "bg-sunken": "#171211",
      fg: "#f0e7df",
      "fg-muted": "#b09f93",
      "fg-subtle": "#78695f",
      border: "rgba(255, 233, 212, 0.08)",
      divider: "rgba(255, 233, 212, 0.09)",
      "shadow-dark": "rgba(0, 0, 0, 0.54)",
      "shadow-light": "rgba(232, 172, 118, 0.07)",
    },
  },
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
