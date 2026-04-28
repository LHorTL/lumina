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

export type ThemePanelSection =
  | "mode"
  | "presets"
  | "accent"
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
}

export const THEME_PANEL_DEFAULT_THEME_PRESETS = {
  light: {
    base: "light",
    accent: "sky",
    density: "comfortable",
    intensity: 5,
    radius: 20,
    font: "sf",
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
  dark: {
    base: "dark",
    accent: "sky",
    density: "comfortable",
    intensity: 5,
    radius: 20,
    font: "sf",
    tokens: {
      bg: "#1b2030",
      "bg-raised": "#242a3c",
      "bg-sunken": "#151a27",
      fg: "#d8deeb",
      "fg-muted": "#8b94ab",
      "fg-subtle": "#5f6a82",
      border: "rgba(0, 0, 0, 0.35)",
      divider: "rgba(255, 255, 255, 0.06)",
      "shadow-dark": "rgba(0, 0, 0, 0.55)",
      "shadow-light": "rgba(130, 145, 180, 0.06)",
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
    density: "comfortable",
    intensity: 6,
    radius: 24,
    font: "sf",
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
  assistant: {
    base: "light",
    accent: {
      accent: "#646cff",
      ink: "#4f56d8",
      soft: "rgba(100, 108, 255, 0.12)",
      glow: "rgba(100, 108, 255, 0.26)",
    },
    density: "comfortable",
    intensity: 4,
    radius: 16,
    font: "system",
    tokens: {
      bg: "#e6eaf4",
      "bg-raised": "#f9f9f9",
      "bg-sunken": "#d7dce8",
      fg: "#213547",
      "fg-muted": "#68768a",
      "fg-subtle": "#9aa6b8",
      border: "rgba(240, 247, 255, 0.72)",
      divider: "rgba(33, 53, 71, 0.12)",
      "shadow-dark": "#d1d5de",
      "shadow-light": "#fbffff",
    },
  },
} satisfies Record<string, ThemePreset>;

export const THEME_PANEL_DEFAULT_PRESET_OPTIONS: ThemePanelPresetOption[] = [
  { key: "light", label: "浅色", description: "默认", preset: THEME_PANEL_DEFAULT_THEME_PRESETS.light },
  { key: "dark", label: "深色", description: "默认", preset: THEME_PANEL_DEFAULT_THEME_PRESETS.dark },
  { key: "porcelain", label: "瓷白", description: "清亮", preset: THEME_PANEL_DEFAULT_THEME_PRESETS.porcelain },
  { key: "assistant", label: "助手", description: "Soft", preset: THEME_PANEL_DEFAULT_THEME_PRESETS.assistant },
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
  /** Show the reset button. */
  showReset?: boolean;
  /** Compact typography and spacing. */
  compact?: boolean;
}

const DRAFT_THEME_MODE = "__theme_panel_draft__";
const DEFAULT_SURFACE_BY_BASE = {
  light: "#e8eef5",
  dark: "#1b2030",
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
  "shadow-dark",
  "shadow-light",
] as const;

const DEFAULT_SECTIONS: ThemePanelSection[] = [
  "mode",
  "presets",
  "accent",
  "intensity",
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
        "shadow-light": `color-mix(in oklch, ${surface} 72%, white)`,
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
      };
}

function readCssVar(element: HTMLElement | null, name: string, fallback: string): string {
  if (!element || typeof window === "undefined") return fallback;
  return getComputedStyle(element).getPropertyValue(name).trim() || fallback;
}

function readCurrentSurfaceTokens(
  element: HTMLElement | null,
  base: ThemeBaseMode
): NonNullable<ThemePreset["tokens"]> {
  const fallbackTokens = createSurfaceTokens(DEFAULT_SURFACE_BY_BASE[base], base);
  return Object.fromEntries(
    SURFACE_TOKEN_KEYS.map((key) => [
      key,
      readCssVar(element, `--${key}`, fallbackTokens[key] ?? DEFAULT_SURFACE_BY_BASE[base]),
    ])
  );
}

function toFontKey(font: FontConfig): FontKey {
  return typeof font === "string" && FONT_OPTIONS.some((option) => option.value === font)
    ? (font as FontKey)
    : "system";
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
      createSurfaceTokens(DEFAULT_SURFACE_BY_BASE.light, "light")
    );
    const [draftDensity, setDraftDensity] = React.useState<DensityMode>("comfortable");
    const [draftIntensity, setDraftIntensity] = React.useState(5);
    const [draftRadius, setDraftRadius] = React.useState(20);
    const [draftFont, setDraftFont] = React.useState<FontKey>("sf");
    const modeValue = String(theme.mode);

    const setRootRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref]
    );

    const draftAccentPalette = React.useMemo(
      () => createAccentPalette(draftAccent, draftBase),
      [draftAccent, draftBase]
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
        label: createdThemeMeta[key]?.label ?? fallbackPresetLabel(key),
        description: createdThemeMeta[key]?.description ?? (preset.base === "dark" ? "深色" : "浅色"),
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
      theme.update({
        ...(!isBuiltInMode ? { themes: { ...theme.themes, [key]: preset } } : null),
        mode: option.key,
        colorScheme: preset.base ?? theme.colorScheme,
        accent: preset.accent ?? theme.accentPalette,
        density: preset.density ?? theme.density,
        intensity: preset.intensity ?? theme.intensity,
        radius: preset.radius ?? theme.radius,
        font: preset.font ?? theme.font,
        tokens: preset.tokens ?? {},
      });
    };

    const beginCreateTheme = () => {
      const root = rootRef.current;
      const base = theme.colorScheme;
      const surface = cssColorToHex(
        readCssVar(root, "--bg", DEFAULT_SURFACE_BY_BASE[base]),
        DEFAULT_SURFACE_BY_BASE[base]
      );
      const accent = cssColorToHex(readCssVar(root, "--accent", theme.accentPalette.accent), defaultCustomAccent);
      const currentTokens = readCurrentSurfaceTokens(root, base);

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
      setDraftName(defaultCreateThemeName);
      setDraftBase(base);
      setDraftSurface(cssColorToHex(currentTokens.bg ?? surface, surface));
      setDraftTokens(currentTokens);
      setDraftAccent(accent);
      setDraftDensity(theme.density);
      setDraftIntensity(theme.intensity);
      setDraftRadius(theme.radius);
      setDraftFont(toFontKey(theme.font));
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
      const surface = DEFAULT_SURFACE_BY_BASE[base];
      setDraftBase(base);
      setDraftSurface(surface);
      setDraftTokens(createSurfaceTokens(surface, base));
      setDraftAccent((current) => cssColorToHex(current, defaultCustomAccent));
    };

    const updateDraftSurface = (surface: string) => {
      setDraftSurface(surface);
      setDraftTokens(createSurfaceTokens(surface, draftBase));
    };

    const saveCustomTheme = () => {
      const label = draftName.trim() || defaultCreateThemeName || "自定义主题";
      const key = createThemeKey(label, theme.themes, createThemeKeyPrefix);
      const description = draftBase === "dark" ? "自建暗" : "自建亮";
      const nextThemes = { ...theme.themes, [String(key)]: draftPreset };
      const meta = { key, label, description };
      setCreatedThemeMeta((current) => ({ ...current, [String(key)]: meta }));
      theme.update({
        themes: nextThemes,
        mode: key,
        colorScheme: draftPreset.base,
        accent: draftPreset.accent,
        density: draftPreset.density,
        intensity: draftPreset.intensity,
        radius: draftPreset.radius,
        font: draftPreset.font,
        tokens: draftPreset.tokens,
      });
      setCustomAccent(draftAccent);
      onCreateTheme?.({ ...meta, preset: draftPreset });
      clearCreateState();
    };

    const resetTheme = () => {
      clearCreateState();
      theme.reset();
    };

    const rootClass = ["theme-panel", compact && "compact", className]
      .filter(Boolean)
      .join(" ");

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
                  return (
                    <Button
                      key={key}
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
                <div className="theme-panel-create-grid">
                  <div className="theme-panel-create-field">
                    <span>表面</span>
                    <ColorPicker size="sm" value={draftSurface} onChange={updateDraftSurface} />
                  </div>
                  <div className="theme-panel-create-field">
                    <span>强调</span>
                    <ColorPicker size="sm" value={draftAccent} onChange={setDraftAccent} />
                  </div>
                </div>
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
                    value={draftFont}
                    options={FONT_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
                    onChange={setDraftFont}
                  />
                </div>
                <div
                  className="theme-panel-create-preview"
                  style={{
                    "--preview-bg": draftTokens.bg,
                    "--preview-fg": draftTokens.fg,
                    "--preview-accent": draftAccentPalette.accent,
                    "--preview-radius": `${draftRadius}px`,
                    "--preview-shadow-dark": draftTokens["shadow-dark"],
                    "--preview-shadow-light": draftTokens["shadow-light"],
                    "--preview-accent-glow": draftAccentPalette.glow,
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

        {sections.includes("intensity") && (
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
