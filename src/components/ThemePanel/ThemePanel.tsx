import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./ThemePanel.css";
import * as React from "react";
import { Button } from "../Button";
import { ColorPicker } from "../ColorPicker";
import { Icon } from "../Icon";
import { Input } from "../Input";
import { RadioGroup } from "../Radio";
import { Slider } from "../Slider";
import { Switch } from "../Switch";
import {
  ACCENT_PRESETS,
  FONT_STACKS,
  useTheme,
  type AccentPalette,
  type AccentKey,
  type DensityMode,
  type FontConfig,
  type FontKey,
  type ThemeBaseMode,
  type ThemeConfig,
  type ThemeMode,
  type ThemePreset,
} from "../Theme";
import { pickLuminaThemePresets } from "../Theme/presets";

export type ThemePanelSection =
  | "mode"
  | "presets"
  | "accent"
  | "shadow"
  | "intensity"
  | "radius"
  | "font"
  | "density";

export interface ThemePanelPresetOption {
  /** Mode key. If it exists in `theme.themes`, the registered preset is used. */
  key: ThemeMode;
  label: React.ReactNode;
  description?: React.ReactNode;
  /** Optional preset to apply and register on click. */
  preset?: ThemePreset;
}

export interface ThemePanelModeOption {
  key: ThemeMode;
  label: React.ReactNode;
}

export interface ThemePanelCreatedThemeMeta {
  key: ThemeMode;
  label: string;
  description: string;
}

export interface ThemePanelCreateThemePayload extends ThemePanelCreatedThemeMeta {
  preset: ThemePreset;
  /** Ready-to-append preset option for callers that control `presetOptions`. */
  presetOption: ThemePanelPresetOption;
}

export interface ThemePanelDeleteThemePayload extends ThemePanelCreatedThemeMeta {
  preset?: ThemePreset;
}

type ThemePanelDefaultPresetKey = "light" | "dark" | "porcelain" | "assistant" | "assistantDark";
type ThemePanelDefaultPreset = ThemePreset & {
  base: ThemeBaseMode;
  tokens: NonNullable<ThemePreset["tokens"]>;
};

export const THEME_PANEL_DEFAULT_THEME_PRESETS: Record<ThemePanelDefaultPresetKey, ThemePanelDefaultPreset> =
  pickLuminaThemePresets(["light", "dark", "porcelain", "assistant", "assistantDark"]);

export const THEME_PANEL_DEFAULT_PRESET_OPTIONS: ThemePanelPresetOption[] = [
  { key: "light", label: "浅色", description: "默认", preset: THEME_PANEL_DEFAULT_THEME_PRESETS.light },
  { key: "dark", label: "深色", description: "默认", preset: THEME_PANEL_DEFAULT_THEME_PRESETS.dark },
  { key: "porcelain", label: "瓷白", description: "清亮", preset: THEME_PANEL_DEFAULT_THEME_PRESETS.porcelain },
  { key: "assistant", label: "助手", description: "Soft", preset: THEME_PANEL_DEFAULT_THEME_PRESETS.assistant },
  { key: "assistantDark", label: "助手暗", description: "Soft", preset: THEME_PANEL_DEFAULT_THEME_PRESETS.assistantDark },
];

export interface ThemePanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Header title. Pass `null` to hide the title text while keeping the panel layout. */
  title?: React.ReactNode;
  /** Secondary header text. */
  description?: React.ReactNode;
  /** Sections to render, in order. */
  sections?: ThemePanelSection[];
  /** Built-in mode buttons. */
  modeOptions?: ThemePanelModeOption[];
  /** Named theme preset cards. Defaults to Lumina presets plus registered `theme.themes`. */
  presetOptions?: ThemePanelPresetOption[];
  /** Initial color used by the custom accent picker. */
  defaultCustomAccent?: string;
  /** Show the inline create-theme flow in the preset section. */
  allowCreateTheme?: boolean;
  /** Default name for a newly created theme. */
  defaultCreateThemeName?: string;
  /** Prefix used when generating a mode key for a created theme. */
  createThemeKeyPrefix?: string;
  /** Called after a custom theme is saved into the nearest ThemeProvider. */
  onCreateTheme?: (payload: ThemePanelCreateThemePayload) => void;
  /** Show delete actions for non-default named themes. */
  allowDeleteTheme?: boolean;
  /** Called after a non-default theme is removed from the nearest ThemeProvider. */
  onDeleteTheme?: (payload: ThemePanelDeleteThemePayload) => void;
  /** Show the reset button. */
  showReset?: boolean;
  /** Compact typography and spacing. */
  compact?: boolean;
}

const DRAFT_THEME_MODE = "__theme_panel_draft__";
const DEFAULT_SURFACE_BY_BASE = {
  light: THEME_PANEL_DEFAULT_THEME_PRESETS.light.tokens.bg,
  dark: THEME_PANEL_DEFAULT_THEME_PRESETS.dark.tokens.bg,
} satisfies Record<ThemeBaseMode, string>;

const SURFACE_TOKEN_KEYS = [
  "bg",
  "bg-raised",
  "bg-sunken",
  "fg",
  "fg-muted",
  "fg-subtle",
  "border",
  "divider",
] as const;
const SHADOW_TOKEN_KEYS = [
  "shadow-dark",
  "shadow-light",
  "shadow-scale",
  "shadow-float-scale",
] as const;
const THEME_TOKEN_KEYS = [...SURFACE_TOKEN_KEYS, ...SHADOW_TOKEN_KEYS] as const;
type SurfaceTokenKey = (typeof SURFACE_TOKEN_KEYS)[number];
type ShadowTokenKey = (typeof SHADOW_TOKEN_KEYS)[number];
type ThemeTokenKey = (typeof THEME_TOKEN_KEYS)[number];
type AccentPaletteKey = keyof AccentPalette;
type ThemeCreateMode = "simple" | "advanced";
type AdvancedFontMode = "preset" | "custom";

const DEFAULT_SECTIONS: ThemePanelSection[] = [
  "mode",
  "presets",
  "accent",
  "shadow",
  "radius",
  "font",
  "density",
];

const DEFAULT_MODE_OPTIONS: ThemePanelModeOption[] = [
  { key: "light", label: "浅色" },
  { key: "dark", label: "深色" },
  { key: "system", label: "系统" },
];

const DENSITY_OPTIONS = [
  { value: "compact", label: "紧凑" },
  { value: "comfortable", label: "舒适" },
  { value: "spacious", label: "宽松" },
] as const;

const FONT_OPTIONS = [
  { value: "system", label: "系统" },
  { value: "sf", label: "SF Pro" },
  { value: "serif", label: "衬线" },
  { value: "mono", label: "等宽" },
] as const;

const THEME_CREATE_MODE_OPTIONS = [
  { value: "simple", label: "简洁" },
  { value: "advanced", label: "深度" },
] as const;

const ADVANCED_FONT_MODE_OPTIONS = [
  { value: "preset", label: "预设字体" },
  { value: "custom", label: "自定义栈" },
] as const;

const SURFACE_TOKEN_FIELDS: { key: SurfaceTokenKey; label: string }[] = [
  { key: "bg", label: "背景" },
  { key: "bg-raised", label: "凸起面" },
  { key: "bg-sunken", label: "凹陷面" },
  { key: "fg", label: "正文" },
  { key: "fg-muted", label: "次级文字" },
  { key: "fg-subtle", label: "弱文字" },
  { key: "border", label: "描边" },
  { key: "divider", label: "分割线" },
];

const SHADOW_TOKEN_FIELDS: { key: ShadowTokenKey; label: string; kind: "color" | "scale" }[] = [
  { key: "shadow-dark", label: "暗阴影", kind: "color" },
  { key: "shadow-light", label: "亮阴影", kind: "color" },
  { key: "shadow-scale", label: "阴影扩散", kind: "scale" },
  { key: "shadow-float-scale", label: "浮层深度", kind: "scale" },
];

const ACCENT_PALETTE_FIELDS: { key: AccentPaletteKey; label: string }[] = [
  { key: "accent", label: "主色" },
  { key: "ink", label: "文字色" },
  { key: "soft", label: "柔和底" },
  { key: "glow", label: "光晕" },
];

function accentFromPreset(preset: ThemePreset | undefined): string {
  const accent = preset?.accent ?? "sky";
  if (typeof accent === "string") {
    return (ACCENT_PRESETS as Record<string, { accent: string } | undefined>)[accent]?.accent ?? accent;
  }
  return accent.accent;
}

function fallbackPresetLabel(key: string): string {
  return key
    .replace(/^user-/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function nodeToText(node: React.ReactNode, fallback: string): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  return fallback;
}

function createThemeKey(label: string, themes: Record<string, ThemePreset>, prefix: string): ThemeMode {
  const normalizedPrefix = prefix.trim().replace(/[^a-z0-9-]+/gi, "-").replace(/^-+|-+$/g, "") || "user";
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const base = `${normalizedPrefix}-${slug || "custom-theme"}`;
  let key = base;
  let i = 2;
  while (key in themes || key in THEME_PANEL_DEFAULT_THEME_PRESETS || key === DRAFT_THEME_MODE) {
    key = `${base}-${i}`;
    i += 1;
  }
  return key as ThemeMode;
}

const clampColor = (value: number): number => Math.min(1, Math.max(0, value));

function normalizeHexColor(input: string): string | null {
  const value = input.trim().replace(/^#/, "");
  if (!/^([\da-f]{3}|[\da-f]{6})$/i.test(value)) return null;
  const hex = value.length === 3 ? value.split("").map((part) => part + part).join("") : value;
  return `#${hex.toLowerCase()}`;
}

function hexToRgbColor(hex: string): [number, number, number] | null {
  const normalized = normalizeHexColor(hex);
  if (!normalized) return null;
  const value = Number.parseInt(normalized.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function rgbToHexColor(red: number, green: number, blue: number): string {
  const toHex = (value: number) =>
    Math.round(Math.min(255, Math.max(0, value))).toString(16).padStart(2, "0");
  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}

function parseRgbColor(value: string): string | null {
  const match = value.trim().match(/^rgba?\((.+)\)$/i);
  if (!match) return null;
  const parts = match[1]
    .replace(/\s*\/\s*[\d.]+%?$/, "")
    .split(/[\s,]+/)
    .filter(Boolean)
    .slice(0, 3);
  if (parts.length < 3) return null;
  const channels = parts.map((part) => {
    const numeric = Number.parseFloat(part);
    return part.endsWith("%") ? (numeric / 100) * 255 : numeric;
  });
  return channels.every(Number.isFinite) ? rgbToHexColor(channels[0], channels[1], channels[2]) : null;
}

function parseOklchColor(value: string): string | null {
  const match = value
    .trim()
    .match(/^oklch\(\s*([+-]?\d*\.?\d+)(%)?\s+([+-]?\d*\.?\d+)\s+([+-]?\d*\.?\d+)(deg|rad|turn)?(?:\s*\/\s*[^)]+)?\s*\)$/i);
  if (!match) return null;
  const lightness = Number.parseFloat(match[1]);
  const chroma = Number.parseFloat(match[3]);
  const hueValue = Number.parseFloat(match[4]);
  if (![lightness, chroma, hueValue].every(Number.isFinite)) return null;
  const hue =
    match[5] === "rad"
      ? (hueValue * 180) / Math.PI
      : match[5] === "turn"
        ? hueValue * 360
        : hueValue;
  const l = match[2] ? lightness / 100 : lightness;
  const a = chroma * Math.cos((hue * Math.PI) / 180);
  const b = chroma * Math.sin((hue * Math.PI) / 180);
  const lmsL = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const lmsM = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const lmsS = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const linearR = 4.0767416621 * lmsL - 3.3077115913 * lmsM + 0.2309699292 * lmsS;
  const linearG = -1.2684380046 * lmsL + 2.6097574011 * lmsM - 0.3413193965 * lmsS;
  const linearB = -0.0041960863 * lmsL - 0.7034186147 * lmsM + 1.707614701 * lmsS;
  const encode = (channel: number) => {
    const c = clampColor(channel);
    return c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;
  };
  return rgbToHexColor(encode(linearR) * 255, encode(linearG) * 255, encode(linearB) * 255);
}

function cssColorToHex(value: string, fallback: string): string {
  return normalizeHexColor(value) ?? parseRgbColor(value) ?? parseOklchColor(value) ?? fallback;
}

function sameHexColor(a: string, b: string): boolean {
  const left = normalizeHexColor(a);
  const right = normalizeHexColor(b);
  return !!left && left === right;
}

function shiftHexColor(value: string | undefined, delta: [number, number, number]): string | undefined {
  if (!value) return undefined;
  const rgb = hexToRgbColor(value);
  if (!rgb) return value;
  return rgbToHexColor(rgb[0] + delta[0], rgb[1] + delta[1], rgb[2] + delta[2]);
}

function createAccentPalette(accent: string, base: ThemeBaseMode): AccentPalette {
  return {
    accent,
    ink: base === "dark" ? `color-mix(in oklch, ${accent} 68%, white)` : `color-mix(in oklch, ${accent} 65%, black)`,
    soft: base === "dark" ? `color-mix(in oklch, ${accent} 28%, black)` : `color-mix(in oklch, ${accent} 15%, white)`,
    glow: base === "dark" ? `color-mix(in oklch, ${accent} 18%, transparent)` : `color-mix(in oklch, ${accent} 35%, transparent)`,
  };
}

function createSurfaceTokens(surface: string, base: ThemeBaseMode): NonNullable<ThemePreset["tokens"]> {
  return base === "dark"
    ? {
        bg: surface,
        "bg-raised": `color-mix(in oklch, ${surface} 88%, white)`,
        "bg-sunken": `color-mix(in oklch, ${surface} 84%, black)`,
        fg: `color-mix(in oklch, ${surface} 18%, white)`,
        "fg-muted": `color-mix(in oklch, ${surface} 48%, white)`,
        "fg-subtle": `color-mix(in oklch, ${surface} 66%, white)`,
        border: "rgba(255, 255, 255, 0.08)",
        divider: "rgba(255, 255, 255, 0.08)",
        "shadow-dark": "rgba(0, 0, 0, 0.56)",
        "shadow-light": "rgba(130, 145, 180, 0.06)",
        "shadow-scale": "1",
        "shadow-float-scale": "1",
      }
    : {
        bg: surface,
        "bg-raised": `color-mix(in oklch, ${surface} 82%, white)`,
        "bg-sunken": `color-mix(in oklch, ${surface} 88%, black)`,
        fg: `color-mix(in oklch, ${surface} 24%, black)`,
        "fg-muted": `color-mix(in oklch, ${surface} 48%, black)`,
        "fg-subtle": `color-mix(in oklch, ${surface} 66%, black)`,
        border: "rgba(110, 130, 150, 0.14)",
        divider: "rgba(110, 130, 150, 0.18)",
        "shadow-dark": `color-mix(in oklch, ${surface} 68%, black)`,
        "shadow-light": "rgba(255, 255, 255, 0.96)",
        "shadow-scale": "1",
        "shadow-float-scale": "1",
      };
}

function defaultBaseTokens(base: ThemeBaseMode): NonNullable<ThemePreset["tokens"]> {
  const tokens = THEME_PANEL_DEFAULT_THEME_PRESETS[base].tokens;
  return { ...tokens };
}

function createDraftSurfaceTokens(
  surface: string,
  base: ThemeBaseMode,
  sourceSurface: string,
  sourceTokens: NonNullable<ThemePreset["tokens"]>
): NonNullable<ThemePreset["tokens"]> {
  if (sameHexColor(surface, sourceSurface)) return { ...sourceTokens };
  const current = hexToRgbColor(surface);
  const source = hexToRgbColor(sourceSurface);
  if (!current || !source) return createSurfaceTokens(surface, base);
  const delta: [number, number, number] = [
    current[0] - source[0],
    current[1] - source[1],
    current[2] - source[2],
  ];
  return {
    ...sourceTokens,
    bg: normalizeHexColor(surface) ?? surface,
    "bg-raised": shiftHexColor(sourceTokens["bg-raised"], delta) ?? sourceTokens["bg-raised"],
    "bg-sunken": shiftHexColor(sourceTokens["bg-sunken"], delta) ?? sourceTokens["bg-sunken"],
  };
}

function createDraftAccentPalette(
  accent: string,
  base: ThemeBaseMode,
  sourceAccent: string,
  sourcePalette: AccentPalette
): AccentPalette {
  return sameHexColor(accent, sourceAccent) ? { ...sourcePalette } : createAccentPalette(accent, base);
}

function readCssVar(element: HTMLElement | null, name: string, fallback: string): string {
  if (!element || typeof window === "undefined") return fallback;
  return getComputedStyle(element).getPropertyValue(name).trim() || fallback;
}

function readCurrentThemeTokens(
  element: HTMLElement | null,
  base: ThemeBaseMode
): NonNullable<ThemePreset["tokens"]> {
  const fallbackTokens = defaultBaseTokens(base);
  return Object.fromEntries(
    THEME_TOKEN_KEYS.map((key) => [
      key,
      readCssVar(element, `--${key}`, fallbackTokens[key] ?? DEFAULT_SURFACE_BY_BASE[base]),
    ])
  );
}

function readCurrentAccentPalette(element: HTMLElement | null, fallback: AccentPalette): AccentPalette {
  return {
    accent: readCssVar(element, "--accent", fallback.accent),
    ink: readCssVar(element, "--accent-ink", fallback.ink),
    soft: readCssVar(element, "--accent-soft", fallback.soft),
    glow: readCssVar(element, "--accent-glow", fallback.glow),
  };
}

function toFontKey(font: FontConfig): FontKey {
  return typeof font === "string" && FONT_OPTIONS.some((option) => option.value === font)
    ? (font as FontKey)
    : "system";
}

function fontConfigToText(font: FontConfig): string {
  return typeof font === "string" ? font : JSON.stringify(font);
}

function fontToStack(font: FontConfig): string {
  if (typeof font === "string") return FONT_STACKS[font as FontKey] ?? font;
  return font.sans ?? font.display ?? FONT_STACKS.system;
}

function tokenPickerValue(value: string | undefined, fallback: string): string {
  return cssColorToHex(value ?? fallback, fallback);
}

function parseScaleToken(value: string | undefined, fallback = 1): number {
  const parsed = Number.parseFloat(value ?? "");
  return Number.isFinite(parsed) ? Math.min(2, Math.max(0.2, parsed)) : fallback;
}

function formatScaleToken(value: number): string {
  return value.toFixed(2).replace(/\.?0+$/, "");
}

/**
 * `ThemePanel` — ready-made controls for quickly editing and saving the nearest Lumina theme.
 *
 * @example
 * ```tsx
 * <ThemeProvider>
 *   <ThemePanel />
 *   <App />
 * </ThemeProvider>
 * ```
 */
export const ThemePanel = React.forwardRef<HTMLDivElement, ThemePanelProps>(
  (
    {
      title = "主题",
      description = "快速调整当前 Lumina 主题",
      sections = DEFAULT_SECTIONS,
      modeOptions = DEFAULT_MODE_OPTIONS,
      presetOptions,
      defaultCustomAccent = "#845ef7",
      allowCreateTheme = true,
      defaultCreateThemeName = "我的主题",
      createThemeKeyPrefix = "user",
      onCreateTheme,
      allowDeleteTheme = true,
      onDeleteTheme,
      showReset = true,
      compact,
      className = "",
      ...rest
    },
    ref
  ) => {
    const theme = useTheme();
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const previewSnapshotRef = React.useRef<ThemeConfig | null>(null);
    const updateThemeRef = React.useRef(theme.update);
    updateThemeRef.current = theme.update;
    const [customAccent, setCustomAccent] = React.useState(defaultCustomAccent);
    const [createdThemeMeta, setCreatedThemeMeta] = React.useState<Record<string, ThemePanelCreatedThemeMeta>>({});
    const [isCreatingTheme, setIsCreatingTheme] = React.useState(false);
    const [previewDraft, setPreviewDraft] = React.useState(true);
    const [draftName, setDraftName] = React.useState(defaultCreateThemeName);
    const [draftBase, setDraftBase] = React.useState<ThemeBaseMode>("light");
    const [draftSurface, setDraftSurface] = React.useState(DEFAULT_SURFACE_BY_BASE.light);
    const [draftAccent, setDraftAccent] = React.useState(defaultCustomAccent);
    const [draftTokens, setDraftTokens] = React.useState<NonNullable<ThemePreset["tokens"]>>(() =>
      defaultBaseTokens("light")
    );
    const [draftSourceSurface, setDraftSourceSurface] = React.useState(DEFAULT_SURFACE_BY_BASE.light);
    const [draftSourceTokens, setDraftSourceTokens] = React.useState<NonNullable<ThemePreset["tokens"]>>(() =>
      defaultBaseTokens("light")
    );
    const [draftAccentPalette, setDraftAccentPalette] = React.useState<AccentPalette>(() =>
      createAccentPalette(defaultCustomAccent, "light")
    );
    const [draftSourceAccent, setDraftSourceAccent] = React.useState(defaultCustomAccent);
    const [draftSourceAccentPalette, setDraftSourceAccentPalette] = React.useState<AccentPalette>(() =>
      createAccentPalette(defaultCustomAccent, "light")
    );
    const [draftDensity, setDraftDensity] = React.useState<DensityMode>("comfortable");
    const [draftIntensity, setDraftIntensity] = React.useState(5);
    const [draftRadius, setDraftRadius] = React.useState(20);
    const [draftFont, setDraftFont] = React.useState<NonNullable<ThemeConfig["font"]>>("sf");
    const [createMode, setCreateMode] = React.useState<ThemeCreateMode>("simple");
    const [advancedFontMode, setAdvancedFontMode] = React.useState<AdvancedFontMode>("preset");
    const [draftBasePresets, setDraftBasePresets] = React.useState<Record<ThemeBaseMode, ThemePreset>>(() => ({
      light: THEME_PANEL_DEFAULT_THEME_PRESETS.light,
      dark: THEME_PANEL_DEFAULT_THEME_PRESETS.dark,
    }));
    const modeValue = String(theme.mode);
    const protectedPresetKeys = React.useMemo(
      () => new Set(["system", ...THEME_PANEL_DEFAULT_PRESET_OPTIONS.map((option) => String(option.key))]),
      []
    );

    const setRootRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref]
    );

    const draftPreset = React.useMemo<ThemePreset>(
      () => ({
        base: draftBase,
        accent: draftAccentPalette,
        density: draftDensity,
        intensity: draftIntensity,
        radius: draftRadius,
        font: draftFont,
        tokens: draftTokens,
      }),
      [draftAccentPalette, draftBase, draftDensity, draftFont, draftIntensity, draftRadius, draftTokens]
    );

    const resolvedPresetOptions = React.useMemo<ThemePanelPresetOption[]>(() => {
      if (presetOptions) return presetOptions;
      const defaultKeys = new Set(THEME_PANEL_DEFAULT_PRESET_OPTIONS.map((option) => String(option.key)));
      const builtIns = THEME_PANEL_DEFAULT_PRESET_OPTIONS.map((option) => {
        const key = String(option.key);
        return {
          ...option,
          preset: theme.themes[key] ?? option.preset,
        };
      });
      const customOptions = Object.entries(theme.themes)
        .filter(([key]) => !defaultKeys.has(key))
        .map(([key, preset]) => ({
          key,
          label: createdThemeMeta[key]?.label ?? preset.label ?? fallbackPresetLabel(key),
          description:
            createdThemeMeta[key]?.description ?? preset.description ?? (preset.base === "dark" ? "深色" : "浅色"),
          preset,
        }));
      return [...builtIns, ...customOptions];
    }, [createdThemeMeta, presetOptions, theme.themes]);

    React.useEffect(() => {
      if (!isCreatingTheme || !previewDraft) return;
      updateThemeRef.current({
        mode: DRAFT_THEME_MODE,
        colorScheme: draftPreset.base,
        accent: draftPreset.accent,
        density: draftPreset.density,
        intensity: draftPreset.intensity,
        radius: draftPreset.radius,
        font: draftPreset.font,
        tokens: draftPreset.tokens,
      });
    }, [draftPreset, isCreatingTheme, previewDraft]);

    const clearCreateState = () => {
      previewSnapshotRef.current = null;
      setIsCreatingTheme(false);
      setPreviewDraft(true);
    };

    const restorePreviewSnapshot = () => {
      const snapshot = previewSnapshotRef.current;
      if (!snapshot) return;
      theme.update({
        ...snapshot,
        mode: snapshot.mode === DRAFT_THEME_MODE ? snapshot.colorScheme ?? "light" : snapshot.mode,
      });
    };

    const applyMode = (mode: string) => {
      clearCreateState();
      if (mode === "light" || mode === "dark" || mode === "system") {
        theme.update({ mode, colorScheme: mode === "system" ? theme.colorScheme : mode, tokens: {} });
        return;
      }
      theme.setMode(mode);
    };

    const applyPreset = (option: ThemePanelPresetOption) => {
      clearCreateState();
      const key = String(option.key);
      const preset = option.preset ?? theme.themes[key];
      if (!preset) {
        theme.setMode(option.key);
        return;
      }
      const isBuiltInMode = key === "light" || key === "dark" || key === "system";
      const fallbackAccent = theme.accent === "custom" ? theme.accentPalette : theme.accent;
      theme.update({
        ...(!isBuiltInMode ? { themes: { ...theme.themes, [key]: preset } } : null),
        mode: option.key,
        colorScheme: preset.base ?? theme.colorScheme,
        accent: preset.accent ?? fallbackAccent,
        density: preset.density ?? theme.density,
        intensity: preset.intensity ?? theme.intensity,
        radius: preset.radius ?? theme.radius,
        font: preset.font ?? theme.font,
        tokens: preset.tokens ?? {},
      });
    };

    const deletePreset = (option: ThemePanelPresetOption) => {
      clearCreateState();
      const key = String(option.key);
      if (protectedPresetKeys.has(key) || !(key in theme.themes)) return;

      const preset = option.preset ?? theme.themes[key];
      const { [key]: _removed, ...nextThemes } = theme.themes;
      const active = modeValue === key;
      const nextBase = theme.colorScheme === "dark" ? "dark" : "light";
      const fallbackPreset = THEME_PANEL_DEFAULT_THEME_PRESETS[nextBase];
      const nextConfig: Partial<ThemeConfig> = active
        ? {
            mode: nextBase,
            colorScheme: fallbackPreset.base,
            accent: fallbackPreset.accent,
            density: fallbackPreset.density,
            intensity: fallbackPreset.intensity,
            radius: fallbackPreset.radius,
            font: fallbackPreset.font,
            tokens: fallbackPreset.tokens,
          }
        : {};

      theme.update({
        ...nextConfig,
        themes: nextThemes,
      });
      setCreatedThemeMeta((current) => {
        if (!(key in current)) return current;
        const { [key]: _meta, ...next } = current;
        return next;
      });
      onDeleteTheme?.({
        key,
        label: nodeToText(option.label, preset?.label ?? fallbackPresetLabel(key)),
        description: nodeToText(
          option.description,
          preset?.description ?? (preset?.base === "dark" ? "深色" : "浅色")
        ),
        preset,
      });
    };

    const beginCreateTheme = () => {
      const root = rootRef.current;
      const base = theme.colorScheme;
      const surface = cssColorToHex(
        readCssVar(root, "--bg", DEFAULT_SURFACE_BY_BASE[base]),
        DEFAULT_SURFACE_BY_BASE[base]
      );
      const accentPalette = readCurrentAccentPalette(root, theme.accentPalette);
      const accent = cssColorToHex(accentPalette.accent, defaultCustomAccent);
      const currentTokens = readCurrentThemeTokens(root, base);
      const currentPreset: ThemePreset = {
        base,
        accent: accentPalette,
        density: theme.density,
        intensity: theme.intensity,
        radius: theme.radius,
        font: theme.font,
        tokens: currentTokens,
      };
      const basePresets: Record<ThemeBaseMode, ThemePreset> = {
        light: base === "light" ? currentPreset : THEME_PANEL_DEFAULT_THEME_PRESETS.light,
        dark: base === "dark" ? currentPreset : THEME_PANEL_DEFAULT_THEME_PRESETS.dark,
      };

      previewSnapshotRef.current = {
        mode: theme.mode,
        colorScheme: theme.colorScheme,
        accent: theme.accent === "custom" ? theme.accentPalette : theme.accent,
        density: theme.density,
        intensity: theme.intensity,
        radius: theme.radius,
        font: theme.font,
        tokens: theme.tokens,
        themes: theme.themes,
      };
      setDraftBasePresets(basePresets);
      setDraftName(defaultCreateThemeName);
      setDraftBase(base);
      setDraftSurface(cssColorToHex(currentTokens.bg ?? surface, surface));
      setDraftTokens(currentTokens);
      setDraftSourceSurface(cssColorToHex(currentTokens.bg ?? surface, surface));
      setDraftSourceTokens(currentTokens);
      setDraftAccent(accent);
      setDraftAccentPalette(accentPalette);
      setDraftSourceAccent(accent);
      setDraftSourceAccentPalette(accentPalette);
      setDraftDensity(theme.density);
      setDraftIntensity(theme.intensity);
      setDraftRadius(theme.radius);
      setDraftFont(theme.font ?? "sf");
      setAdvancedFontMode(toFontKey(theme.font) === theme.font ? "preset" : "custom");
      setCreateMode("simple");
      setCustomAccent(accent);
      setPreviewDraft(true);
      setIsCreatingTheme(true);
    };

    const cancelCreateTheme = () => {
      restorePreviewSnapshot();
      clearCreateState();
    };

    const toggleDraftPreview = (checked: boolean) => {
      setPreviewDraft(checked);
      if (!checked) restorePreviewSnapshot();
    };

    const updateDraftBase = (base: ThemeBaseMode) => {
      const preset = draftBasePresets[base] ?? THEME_PANEL_DEFAULT_THEME_PRESETS[base];
      const tokens = { ...(preset.tokens ?? defaultBaseTokens(base)) };
      const surface = cssColorToHex(tokens.bg ?? DEFAULT_SURFACE_BY_BASE[base], DEFAULT_SURFACE_BY_BASE[base]);
      setDraftBase(base);
      setDraftSurface(surface);
      setDraftTokens(tokens);
      setDraftSourceSurface(surface);
      setDraftSourceTokens(tokens);
      const nextAccent = cssColorToHex(draftAccent, defaultCustomAccent);
      const accentPalette = createAccentPalette(nextAccent, base);
      setDraftAccent(nextAccent);
      setDraftAccentPalette(accentPalette);
      setDraftSourceAccent(nextAccent);
      setDraftSourceAccentPalette(accentPalette);
    };

    const updateDraftSurface = (surface: string) => {
      setDraftSurface(surface);
      setDraftTokens(createDraftSurfaceTokens(surface, draftBase, draftSourceSurface, draftSourceTokens));
    };

    const updateDraftToken = (key: ThemeTokenKey, value: string) => {
      setDraftTokens((current) => ({ ...current, [key]: value }));
      if (key === "bg") setDraftSurface(cssColorToHex(value, draftSurface));
    };

    const updateDraftAccent = (accent: string) => {
      setDraftAccent(accent);
      setDraftAccentPalette(createDraftAccentPalette(accent, draftBase, draftSourceAccent, draftSourceAccentPalette));
      if (previewDraft) setCustomAccent(accent);
    };

    const updateDraftAccentSlot = (key: AccentPaletteKey, value: string) => {
      setDraftAccentPalette((current) => ({ ...current, [key]: value }));
      if (key === "accent") {
        const accent = cssColorToHex(value, draftAccent);
        setDraftAccent(accent);
        if (previewDraft) setCustomAccent(accent);
      }
    };

    const saveCustomTheme = () => {
      const label = draftName.trim() || defaultCreateThemeName || "自定义主题";
      const key = createThemeKey(label, theme.themes, createThemeKeyPrefix);
      const description = draftBase === "dark" ? "自建暗" : "自建亮";
      const preset: ThemePreset = { ...draftPreset, label, description };
      const presetOption: ThemePanelPresetOption = { key, label, description, preset };
      const nextThemes = { ...theme.themes, [String(key)]: preset };
      const meta = { key, label, description };
      setCreatedThemeMeta((current) => ({ ...current, [String(key)]: meta }));
      theme.update({
        themes: nextThemes,
        mode: key,
        colorScheme: preset.base,
        accent: preset.accent,
        density: preset.density,
        intensity: preset.intensity,
        radius: preset.radius,
        font: preset.font,
        tokens: preset.tokens,
      });
      setCustomAccent(draftAccent);
      onCreateTheme?.({ ...meta, preset, presetOption });
      clearCreateState();
    };

    const resetTheme = () => {
      clearCreateState();
      theme.reset();
    };

    const rootClass = ["theme-panel", compact && "compact", className]
      .filter(Boolean)
      .join(" ");
    const shadowScale = parseScaleToken(
      theme.tokens["shadow-scale"] ?? readCssVar(rootRef.current, "--shadow-scale", "1")
    );
    const shadowFloatScale = parseScaleToken(
      theme.tokens["shadow-float-scale"] ?? readCssVar(rootRef.current, "--shadow-float-scale", "1")
    );
    const updateThemeToken = (key: ShadowTokenKey, value: string) => {
      theme.setTokens({ ...theme.tokens, [key]: value });
    };

    return (
      <div ref={setRootRef} className={rootClass} {...rest}>
        {(title || description) && (
          <div className="theme-panel-head">
            <div className="theme-panel-title">
              <Icon name="sliders" size={14} />
              {title && <span>{title}</span>}
            </div>
            {description && <div className="theme-panel-desc">{description}</div>}
          </div>
        )}

        {sections.includes("mode") && (
          <div className="theme-panel-row">
            <div className="theme-panel-label">
              <span>模式</span>
              <span>{theme.colorScheme}</span>
            </div>
            <RadioGroup
              variant="segmented"
              size="sm"
              value={modeValue}
              options={modeOptions.map((option) => ({
                value: String(option.key),
                label: option.label,
              }))}
              onChange={applyMode}
            />
          </div>
        )}

        {sections.includes("presets") && (resolvedPresetOptions.length > 0 || allowCreateTheme) && (
          <div className="theme-panel-row">
            <div className="theme-panel-label">
              <span>主题预设</span>
              <span>{modeValue}</span>
            </div>
            {resolvedPresetOptions.length > 0 && (
              <div className="theme-panel-presets">
                {resolvedPresetOptions.map((option) => {
                  const key = String(option.key);
                  const preset = option.preset ?? theme.themes[key];
                  const active = modeValue === key;
                  const deletable = allowDeleteTheme && !protectedPresetKeys.has(key) && key in theme.themes;
                  return (
                    <div key={key} className={`theme-panel-preset-shell ${deletable ? "deletable" : ""}`}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={`theme-panel-preset ${active ? "active" : ""}`}
                        onClick={() => applyPreset(option)}
                      >
                        <span className="theme-panel-preset-ink" aria-hidden>
                          <span style={{ background: preset?.tokens?.bg ?? "var(--bg)" }} />
                          <span style={{ background: preset?.tokens?.["bg-raised"] ?? "var(--bg-raised)" }} />
                          <span style={{ background: accentFromPreset(preset) }} />
                        </span>
                        <span className="theme-panel-preset-copy">
                          <span>{option.label}</span>
                          {option.description && <small>{option.description}</small>}
                        </span>
                      </Button>
                      {deletable && (
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          icon="trash"
                          iconOnly
                          tip={`删除 ${nodeToText(option.label, fallbackPresetLabel(key))}`}
                          className="theme-panel-preset-delete"
                          onClick={() => deletePreset(option)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {allowCreateTheme && !isCreatingTheme && (
              <Button type="button" variant="primary" size="sm" icon="plus" block onClick={beginCreateTheme}>
                新建主题
              </Button>
            )}

            {allowCreateTheme && isCreatingTheme && (
              <div className="theme-panel-create">
                <div className="theme-panel-create-head">
                  <div>
                    <span>新建主题</span>
                    <small>{previewDraft ? "实时预览中" : "预览已暂停"}</small>
                  </div>
                  <Switch
                    size="sm"
                    checked={previewDraft}
                    onChange={toggleDraftPreview}
                    checkedChildren="预览"
                    unCheckedChildren="停"
                  />
                </div>
                <Input
                  size="sm"
                  value={draftName}
                  onValueChange={setDraftName}
                  placeholder="输入主题名称"
                  leadingIcon="palette"
                  allowClear
                />
                <RadioGroup
                  className="theme-panel-create-mode"
                  variant="segmented"
                  size="sm"
                  value={createMode}
                  options={THEME_CREATE_MODE_OPTIONS.map((option) => ({
                    value: option.value,
                    label: option.label,
                  }))}
                  onChange={setCreateMode}
                />
                <div className="theme-panel-create-field">
                  <span>基底</span>
                  <RadioGroup
                    variant="segmented"
                    size="sm"
                    value={draftBase}
                    options={[
                      { value: "light", label: "浅" },
                      { value: "dark", label: "深" },
                    ]}
                    onChange={updateDraftBase}
                  />
                </div>
                {createMode === "simple" && (
                  <div className="theme-panel-create-grid">
                    <div className="theme-panel-create-field">
                      <span>表面</span>
                      <ColorPicker size="sm" value={draftSurface} onChange={updateDraftSurface} />
                    </div>
                    <div className="theme-panel-create-field">
                      <span>强调</span>
                      <ColorPicker size="sm" value={draftAccent} onChange={updateDraftAccent} />
                    </div>
                  </div>
                )}
                <div className="theme-panel-create-sliders">
                  <div className="theme-panel-label">
                    <span>阴影强度</span>
                    <span>{draftIntensity}</span>
                  </div>
                  <Slider value={draftIntensity} onChange={setDraftIntensity} min={1} max={10} step={1} />
                  <div className="theme-panel-label">
                    <span>圆角</span>
                    <span>{draftRadius}px</span>
                  </div>
                  <Slider value={draftRadius} onChange={setDraftRadius} min={8} max={36} step={2} />
                </div>
                <div className="theme-panel-create-field">
                  <span>密度</span>
                  <RadioGroup
                    variant="segmented"
                    size="sm"
                    value={draftDensity}
                    options={DENSITY_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
                    onChange={setDraftDensity}
                  />
                </div>
                <div className="theme-panel-create-field">
                  <span>字体</span>
                  <RadioGroup
                    variant="segmented"
                    size="sm"
                    value={toFontKey(draftFont)}
                    options={FONT_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
                    onChange={(value) => setDraftFont(value as FontKey)}
                  />
                </div>
                {createMode === "advanced" && (
                  <div className="theme-panel-advanced">
                    <div className="theme-panel-advanced-section compact">
                      <div className="theme-panel-advanced-title">
                        <span>字体</span>
                        <small>{advancedFontMode === "preset" ? "选择内置字体" : "填写 CSS font-family"}</small>
                      </div>
                      <RadioGroup
                        className="theme-panel-create-mode"
                        variant="segmented"
                        size="sm"
                        value={advancedFontMode}
                        options={ADVANCED_FONT_MODE_OPTIONS.map((option) => ({
                          value: option.value,
                          label: option.label,
                        }))}
                        onChange={(value) => {
                          setAdvancedFontMode(value);
                          if (value === "preset") setDraftFont(toFontKey(draftFont));
                        }}
                      />
                      {advancedFontMode === "custom" && (
                        <div className="theme-panel-create-field">
                          <span>字体栈</span>
                          <Input
                            size="sm"
                            value={fontConfigToText(draftFont)}
                            onValueChange={(value) => setDraftFont(value || "system")}
                            placeholder="CSS font-family"
                          />
                        </div>
                      )}
                    </div>

                    <div className="theme-panel-advanced-section">
                      <div className="theme-panel-advanced-title">
                        <span>表面 tokens</span>
                        <small>完整覆写 --bg / --fg</small>
                      </div>
                      <div className="theme-panel-token-grid">
                        {SURFACE_TOKEN_FIELDS.map((field) => (
                          <div className="theme-panel-token-field" key={field.key}>
                            <span className="theme-panel-token-label">
                              <span>{field.label}</span>
                              <code>--{field.key}</code>
                            </span>
                            <span className="theme-panel-token-input">
                              <ColorPicker
                                className="theme-panel-token-picker"
                                value={tokenPickerValue(draftTokens[field.key], draftSurface)}
                                onChange={(value) => updateDraftToken(field.key, value)}
                                placement="left"
                                aria-label={`选择 ${field.label}`}
                              >
                                <span
                                  className="theme-panel-token-swatch"
                                  style={{ background: draftTokens[field.key] }}
                                />
                              </ColorPicker>
                              <Input
                                size="sm"
                                value={draftTokens[field.key] ?? ""}
                                onValueChange={(value) => updateDraftToken(field.key, value)}
                              />
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="theme-panel-advanced-section">
                      <div className="theme-panel-advanced-title">
                        <span>阴影系统</span>
                        <small>暗/亮阴影与层级缩放</small>
                      </div>
                      <div className="theme-panel-token-grid">
                        {SHADOW_TOKEN_FIELDS.map((field) =>
                          field.kind === "color" ? (
                            <div className="theme-panel-token-field" key={field.key}>
                              <span className="theme-panel-token-label">
                                <span>{field.label}</span>
                                <code>--{field.key}</code>
                              </span>
                              <span className="theme-panel-token-input">
                                <ColorPicker
                                  className="theme-panel-token-picker"
                                  value={tokenPickerValue(draftTokens[field.key], draftSurface)}
                                  onChange={(value) => updateDraftToken(field.key, value)}
                                  placement="left"
                                  aria-label={`选择 ${field.label}`}
                                >
                                  <span
                                    className="theme-panel-token-swatch"
                                    style={{ background: draftTokens[field.key] }}
                                  />
                                </ColorPicker>
                                <Input
                                  size="sm"
                                  value={draftTokens[field.key] ?? ""}
                                  onValueChange={(value) => updateDraftToken(field.key, value)}
                                />
                              </span>
                            </div>
                          ) : (
                            <div className="theme-panel-token-field scale" key={field.key}>
                              <span className="theme-panel-token-label">
                                <span>{field.label}</span>
                                <code>--{field.key}</code>
                              </span>
                              <span className="theme-panel-token-scale">
                                <Input
                                  size="sm"
                                  value={draftTokens[field.key] ?? "1"}
                                  onValueChange={(value) => updateDraftToken(field.key, value || "1")}
                                />
                                <Slider
                                  value={parseScaleToken(draftTokens[field.key])}
                                  onChange={(value) => updateDraftToken(field.key, formatScaleToken(value))}
                                  min={0.6}
                                  max={field.key === "shadow-float-scale" ? 1.8 : 1.6}
                                  step={0.05}
                                />
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div className="theme-panel-advanced-section">
                      <div className="theme-panel-advanced-title">
                        <span>强调 palette</span>
                        <small>完整覆写 accent / ink / soft / glow</small>
                      </div>
                      <div className="theme-panel-token-grid">
                        {ACCENT_PALETTE_FIELDS.map((field) => (
                          <div className="theme-panel-token-field" key={field.key}>
                            <span className="theme-panel-token-label">
                              <span>{field.label}</span>
                              <code>accent.{field.key}</code>
                            </span>
                            <span className="theme-panel-token-input">
                              <ColorPicker
                                className="theme-panel-token-picker"
                                value={tokenPickerValue(draftAccentPalette[field.key], draftAccent)}
                                onChange={(value) => updateDraftAccentSlot(field.key, value)}
                                placement="left"
                                aria-label={`选择 ${field.label}`}
                              >
                                <span
                                  className="theme-panel-token-swatch"
                                  style={{ background: draftAccentPalette[field.key] }}
                                />
                              </ColorPicker>
                              <Input
                                size="sm"
                                value={draftAccentPalette[field.key]}
                                onValueChange={(value) => updateDraftAccentSlot(field.key, value)}
                              />
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div
                  className="theme-panel-create-preview"
                  style={{
                    "--preview-bg": draftTokens.bg,
                    "--preview-fg": draftTokens.fg,
                    "--preview-accent": draftAccentPalette.accent,
                    "--preview-radius": `${draftRadius}px`,
                    "--preview-shadow-dark": draftTokens["shadow-dark"],
                    "--preview-shadow-light": draftTokens["shadow-light"],
                    "--preview-shadow-scale": draftTokens["shadow-scale"] ?? "1",
                    "--preview-accent-glow": draftAccentPalette.glow,
                    "--preview-font": fontToStack(draftFont),
                  } as React.CSSProperties}
                >
                  <span className="theme-panel-create-preview-label">
                    <Icon name="palette" size={13} />
                    <span>{draftName.trim() || "自定义主题"}</span>
                  </span>
                  <i aria-hidden />
                </div>
                <div className="theme-panel-create-actions">
                  <Button type="button" variant="ghost" size="sm" icon="x" onClick={cancelCreateTheme}>
                    取消
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    icon="check"
                    onClick={saveCustomTheme}
                    disabled={!draftName.trim()}
                  >
                    保存主题
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {sections.includes("accent") && (
          <div className="theme-panel-row">
            <div className="theme-panel-label">
              <span>强调色</span>
              <span>{theme.accent === "custom" ? customAccent : theme.accent}</span>
            </div>
            <div className="theme-panel-swatches">
              {(Object.keys(ACCENT_PRESETS) as AccentKey[]).map((key) => (
                <Button
                  key={key}
                  type="button"
                  size="sm"
                  aria-label={key}
                  className={`theme-panel-swatch ${theme.accent === key ? "active" : ""}`}
                  style={{ background: ACCENT_PRESETS[key].accent }}
                  onClick={() => theme.setAccent(key)}
                />
              ))}
              <ColorPicker
                size="sm"
                value={customAccent}
                onChange={(value) => {
                  setCustomAccent(value);
                  theme.setAccent(value);
                }}
              />
            </div>
          </div>
        )}

        {sections.includes("shadow") && (
          <div className="theme-panel-row theme-panel-shadow">
            <div className="theme-panel-label">
              <span>阴影强度</span>
              <span>{theme.intensity}</span>
            </div>
            <Slider value={theme.intensity} onChange={theme.setIntensity} min={1} max={10} step={1} />
            <div className="theme-panel-label">
              <span>阴影扩散</span>
              <span>{formatScaleToken(shadowScale)}x</span>
            </div>
            <Slider
              value={shadowScale}
              onChange={(value) => updateThemeToken("shadow-scale", formatScaleToken(value))}
              min={0.6}
              max={1.6}
              step={0.05}
            />
            <div className="theme-panel-label">
              <span>浮层深度</span>
              <span>{formatScaleToken(shadowFloatScale)}x</span>
            </div>
            <Slider
              value={shadowFloatScale}
              onChange={(value) => updateThemeToken("shadow-float-scale", formatScaleToken(value))}
              min={0.6}
              max={1.8}
              step={0.05}
            />
          </div>
        )}

        {sections.includes("intensity") && !sections.includes("shadow") && (
          <div className="theme-panel-row">
            <div className="theme-panel-label">
              <span>阴影</span>
              <span>{theme.intensity}</span>
            </div>
            <Slider value={theme.intensity} onChange={theme.setIntensity} min={1} max={10} step={1} />
          </div>
        )}

        {sections.includes("radius") && (
          <div className="theme-panel-row">
            <div className="theme-panel-label">
              <span>圆角</span>
              <span>{theme.radius}px</span>
            </div>
            <Slider value={theme.radius} onChange={theme.setRadius} min={8} max={36} step={2} />
          </div>
        )}

        {sections.includes("font") && (
          <div className="theme-panel-row">
            <div className="theme-panel-label">
              <span>字体</span>
            </div>
            <RadioGroup
              variant="segmented"
              size="sm"
              value={typeof theme.font === "string" ? theme.font : "system"}
              options={FONT_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
              onChange={(value) => theme.setFont(value as FontKey)}
            />
          </div>
        )}

        {sections.includes("density") && (
          <div className="theme-panel-row">
            <div className="theme-panel-label">
              <span>密度</span>
            </div>
            <RadioGroup
              variant="segmented"
              size="sm"
              value={theme.density}
              options={DENSITY_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
              onChange={theme.setDensity}
            />
          </div>
        )}

        {showReset && (
          <Button type="button" variant="ghost" size="sm" icon="reload" block onClick={resetTheme}>
            重置主题
          </Button>
        )}
      </div>
    );
  }
);
ThemePanel.displayName = "ThemePanel";
