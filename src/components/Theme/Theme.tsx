import "../../styles/tokens.css";
import * as React from "react";

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

export type ThemeBaseMode = "light" | "dark";
export type BuiltInThemeMode = ThemeBaseMode | "system";
export type ThemeMode = BuiltInThemeMode | (string & {});
export type ResolvedThemeMode = ThemeBaseMode | (string & {});
export type AccentKey = "sky" | "coral" | "mint" | "violet" | "amber" | "rose";
export type DensityMode = "compact" | "comfortable" | "spacious";
export type FontKey = "system" | "sf" | "serif" | "mono";

/** Full accent color slots. All four CSS variables the library reads. */
export interface AccentPalette {
  /** Primary accent — `--accent`. */
  accent: string;
  /** Darker text-on-soft variant — `--accent-ink`. */
  ink: string;
  /** Pale tint for backgrounds — `--accent-soft`. */
  soft: string;
  /** Halo / glow color (typically with alpha) — `--accent-glow`. */
  glow: string;
}

/** Input type for custom accent: either full palette, or just a base color
 *  (missing slots derived via color-mix in CSS). */
export type CustomAccentInput = string | Partial<AccentPalette> & { accent: string };

/** Font config — either a preset key, a single sans string, or a granular object. */
export type FontConfig =
  | FontKey
  | string
  | { sans?: string; display?: string; mono?: string };

/** Arbitrary CSS variable overrides. Keys may be either a short name
 *  (e.g. `"bg"` → `--bg`) or a full var name (e.g. `"--bg"`). */
export type ThemeTokens = Record<string, string>;

/** Named custom theme mode. `base` keeps dark/light specific component rules. */
export interface ThemePreset {
  /** Optional display name used by ThemePanel or other theme pickers. */
  label?: string;
  /** Optional helper text used by ThemePanel or other theme pickers. */
  description?: string;
  base?: ThemeBaseMode;
  accent?: AccentKey | CustomAccentInput;
  density?: DensityMode;
  intensity?: number;
  radius?: number;
  font?: FontConfig;
  tokens?: ThemeTokens;
}

export type ThemePresets = Record<string, ThemePreset>;

export interface ThemeConfig {
  mode?: ThemeMode;
  /** Base light/dark color scheme used by custom modes. */
  colorScheme?: ThemeBaseMode;
  accent?: AccentKey | CustomAccentInput;
  density?: DensityMode;
  /** Shadow strength, 1..10. Maps to `--d` (0.4..1.6). */
  intensity?: number;
  /** Base radius in px — generates the full `--r-*` scale. */
  radius?: number;
  font?: FontConfig;
  tokens?: ThemeTokens;
  /** Custom named modes addressable through `mode` / `setMode`. */
  themes?: ThemePresets;
}

export interface ThemeValue {
  /** Requested mode ("system" is preserved here). */
  mode: ThemeMode;
  /** Resolved concrete mode ("system" → "light" | "dark"; custom modes keep their name). */
  resolvedMode: ResolvedThemeMode;
  /** The light/dark base currently used for component-specific selectors. */
  colorScheme: ThemeBaseMode;
  /** Accent key or "custom" if a palette was supplied. */
  accent: AccentKey | "custom";
  /** Resolved palette currently in effect. */
  accentPalette: AccentPalette;
  density: DensityMode;
  intensity: number;
  radius: number;
  font: FontConfig;
  tokens: ThemeTokens;
  themes: ThemePresets;
  activeTheme: ThemePreset | null;

  setMode: (m: ThemeMode) => void;
  toggleMode: () => void;
  setAccent: (a: AccentKey | CustomAccentInput) => void;
  setDensity: (d: DensityMode) => void;
  setIntensity: (n: number) => void;
  setRadius: (n: number) => void;
  setFont: (f: FontConfig) => void;
  setTokens: (t: ThemeTokens) => void;
  setThemes: (t: ThemePresets) => void;
  /** Shallow-merge a partial config. */
  update: (cfg: Partial<ThemeConfig>) => void;
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

const DEFAULT_CONFIG: Required<ThemeConfig> = {
  mode: "light",
  colorScheme: "light",
  accent: "sky",
  density: "comfortable",
  intensity: 5,
  radius: 20,
  font: "sf",
  tokens: {},
  themes: {},
};

/* ------------------------------ Helpers --------------------------------- */

const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

function isThemeBaseMode(mode: ThemeMode | undefined): mode is ThemeBaseMode {
  return mode === "light" || mode === "dark";
}

function isBuiltInThemeMode(mode: ThemeMode | undefined): mode is BuiltInThemeMode {
  return mode === "light" || mode === "dark" || mode === "system";
}

function getThemePreset(themes: ThemePresets | undefined, mode: ThemeMode | undefined): ThemePreset | undefined {
  if (!mode || isBuiltInThemeMode(mode)) return undefined;
  return themes?.[mode];
}

function applyThemePreset(config: ThemeConfig, mode: ThemeMode): ThemeConfig {
  const preset = getThemePreset(config.themes, mode);
  if (!preset) {
    return {
      ...config,
      mode,
      colorScheme: isThemeBaseMode(mode) ? mode : config.colorScheme,
    };
  }
  return {
    ...config,
    mode,
    colorScheme: preset.base ?? config.colorScheme ?? DEFAULT_CONFIG.colorScheme,
    accent: preset.accent ?? config.accent,
    density: preset.density ?? config.density,
    intensity: preset.intensity ?? config.intensity,
    radius: preset.radius ?? config.radius,
    font: preset.font ?? config.font,
    tokens: preset.tokens ? { ...preset.tokens } : config.tokens,
  };
}

function resolveThemeConfig(config: ThemeConfig): Required<ThemeConfig> {
  const mode = config.mode ?? DEFAULT_CONFIG.mode;
  const themes = config.themes ?? DEFAULT_CONFIG.themes;
  const preset = getThemePreset(themes, mode);
  const presetConfig = preset
    ? {
        ...(preset.base ? { colorScheme: preset.base } : null),
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
    tokens: {
      ...(preset?.tokens ?? {}),
      ...(config.tokens ?? {}),
    },
  };
  return {
    ...merged,
    colorScheme: merged.colorScheme ?? preset?.base ?? DEFAULT_CONFIG.colorScheme,
    accent: merged.accent ?? preset?.accent ?? DEFAULT_CONFIG.accent,
    density: merged.density ?? preset?.density ?? DEFAULT_CONFIG.density,
    intensity: merged.intensity ?? preset?.intensity ?? DEFAULT_CONFIG.intensity,
    radius: merged.radius ?? preset?.radius ?? DEFAULT_CONFIG.radius,
    font: merged.font ?? preset?.font ?? DEFAULT_CONFIG.font,
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

/** Normalize a token key to a CSS custom property name. */
function toVar(key: string): string {
  return key.startsWith("--") ? key : `--${key}`;
}

function applyShadowTokens(target: HTMLElement, colorScheme: ThemeBaseMode): void {
  if (colorScheme === "dark") {
    target.style.setProperty("--shadow-offset", "calc(4px * var(--d))");
    target.style.setProperty("--shadow-blur", "calc(10px * var(--d))");
    target.style.setProperty("--shadow-inset-offset", "calc(3px * var(--d))");
    target.style.setProperty("--shadow-inset-blur", "calc(7px * var(--d))");
  } else {
    target.style.setProperty("--shadow-offset", "calc(6px * var(--d))");
    target.style.setProperty("--shadow-blur", "calc(16px * var(--d))");
    target.style.setProperty("--shadow-inset-offset", "calc(4px * var(--d))");
    target.style.setProperty("--shadow-inset-blur", "calc(10px * var(--d))");
  }

  target.style.setProperty(
    "--neu-out",
    "var(--shadow-offset) var(--shadow-offset) var(--shadow-blur) var(--shadow-dark), calc(var(--shadow-offset) * -1) calc(var(--shadow-offset) * -1) var(--shadow-blur) var(--shadow-light)"
  );
  target.style.setProperty(
    "--neu-out-sm",
    "calc(var(--shadow-offset) * 0.5) calc(var(--shadow-offset) * 0.5) calc(var(--shadow-blur) * 0.6) var(--shadow-dark), calc(var(--shadow-offset) * -0.5) calc(var(--shadow-offset) * -0.5) calc(var(--shadow-blur) * 0.6) var(--shadow-light)"
  );
  target.style.setProperty(
    "--neu-out-lg",
    "calc(var(--shadow-offset) * 1.6) calc(var(--shadow-offset) * 1.6) calc(var(--shadow-blur) * 1.4) var(--shadow-dark), calc(var(--shadow-offset) * -1.6) calc(var(--shadow-offset) * -1.6) calc(var(--shadow-blur) * 1.4) var(--shadow-light)"
  );
  target.style.setProperty(
    "--neu-in",
    "inset var(--shadow-inset-offset) var(--shadow-inset-offset) var(--shadow-inset-blur) var(--shadow-dark), inset calc(var(--shadow-inset-offset) * -1) calc(var(--shadow-inset-offset) * -1) var(--shadow-inset-blur) var(--shadow-light)"
  );
  target.style.setProperty(
    "--neu-in-sm",
    "inset calc(var(--shadow-inset-offset) * 0.6) calc(var(--shadow-inset-offset) * 0.6) calc(var(--shadow-inset-blur) * 0.6) var(--shadow-dark), inset calc(var(--shadow-inset-offset) * -0.6) calc(var(--shadow-inset-offset) * -0.6) calc(var(--shadow-inset-blur) * 0.6) var(--shadow-light)"
  );
  target.style.setProperty(
    "--neu-flat",
    "1px 1px 2px var(--shadow-dark), -1px -1px 2px var(--shadow-light)"
  );
  target.style.setProperty(
    "--neu-float",
    "0 calc(var(--shadow-offset) * 1.8) calc(var(--shadow-blur) * 2.2) var(--shadow-dark), 0 calc(var(--shadow-offset) * 0.4) calc(var(--shadow-blur) * 0.7) var(--shadow-dark)"
  );
}

/** Imperative theme application — writes CSS vars / data-attrs on a target. */
export function applyTheme(target: HTMLElement, config: ThemeConfig): void {
  const cfg = resolveThemeConfig(config);
  const resolvedMode = resolveThemeMode(cfg.mode);
  const colorScheme = resolveThemeColorScheme(cfg.mode, cfg.themes, cfg.colorScheme);
  const { key, palette } = normalizeAccentInput(cfg.accent, colorScheme);

  // data-* attributes
  target.dataset.theme = colorScheme;
  target.dataset.themeMode = cfg.mode;
  target.dataset.density = cfg.density;
  if (key === "custom") {
    delete target.dataset.accent;
  } else {
    target.dataset.accent = key;
  }

  // Accent palette — always set inline so custom overrides win and preset
  // stays deterministic across mode switches.
  target.style.setProperty("--accent", palette.accent);
  target.style.setProperty("--accent-ink", palette.ink);
  target.style.setProperty("--accent-soft", palette.soft);
  target.style.setProperty("--accent-glow", palette.glow);

  // Shadow intensity (1..10 → 0.4..1.6)
  const intensity = cfg.intensity ?? DEFAULT_CONFIG.intensity;
  target.style.setProperty("--d", String(0.4 + intensity * 0.12));
  applyShadowTokens(target, colorScheme);

  // Radius scale
  const r = cfg.radius ?? DEFAULT_CONFIG.radius;
  target.style.setProperty("--r-xs", `${Math.max(4, r - 16)}px`);
  target.style.setProperty("--r-sm", `${Math.max(6, r - 12)}px`);
  target.style.setProperty("--r-md", `${Math.max(8, r - 6)}px`);
  target.style.setProperty("--r-lg", `${r}px`);
  target.style.setProperty("--r-xl", `${r + 10}px`);

  // Fonts
  const font = cfg.font ?? DEFAULT_CONFIG.font;
  if (typeof font === "string") {
    const stack = (FONT_STACKS as Record<string, string>)[font] ?? font;
    target.style.setProperty("--font-sans", stack);
    if (font === "mono") target.style.setProperty("--font-display", FONT_STACKS.mono);
  } else {
    if (font.sans) target.style.setProperty("--font-sans", font.sans);
    if (font.display) target.style.setProperty("--font-display", font.display);
    if (font.mono) target.style.setProperty("--font-mono", font.mono);
  }

  // Arbitrary token overrides
  if (cfg.tokens) {
    for (const [k, v] of Object.entries(cfg.tokens)) {
      target.style.setProperty(toVar(k), v);
    }
  }
}

/* ----------------------------- Context ---------------------------------- */

const ThemeCtx = React.createContext<ThemeValue | null>(null);

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

/* ---------------------------- Persistence ------------------------------- */

function loadPersisted(key: string | undefined): Partial<ThemeConfig> | null {
  if (!key || !isBrowser) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<ThemeConfig>;
  } catch {
    return null;
  }
}

function persist(key: string | undefined, cfg: ThemeConfig): void {
  if (!key || !isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(cfg));
  } catch {
    /* quota exceeded / disabled storage — ignore */
  }
}

/* --------------------------- ThemeProvider ------------------------------ */

export interface ThemeProviderProps extends ThemeConfig {
  children?: React.ReactNode;
  /**
   * Where to apply the theme.
   * - `"root"` (default): on `<html>` — affects the whole document.
   * - `"scope"`: on a local wrapper element — scoped to descendants.
   */
  target?: "root" | "scope";
  /** Tag for scope mode. Default `"div"`. */
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
  /** If set, theme state and custom named themes are persisted to localStorage under this key. */
  storageKey?: string;
  /** Called whenever the resolved theme value changes. */
  onChange?: (value: ThemeValue) => void;
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
    target = "root",
    as: Tag = "div",
    className,
    style,
    storageKey,
    onChange,
    ...configProps
  } = props;

  // Build the initial config: defaults ← props ← custom preset ← persisted (if any)
  const initialConfig = React.useMemo<ThemeConfig>(() => {
    const fromProps: ThemeConfig = {
      mode: configProps.mode ?? DEFAULT_CONFIG.mode,
      colorScheme: configProps.colorScheme,
      accent: configProps.accent ?? DEFAULT_CONFIG.accent,
      density: configProps.density ?? DEFAULT_CONFIG.density,
      intensity: configProps.intensity ?? DEFAULT_CONFIG.intensity,
      radius: configProps.radius ?? DEFAULT_CONFIG.radius,
      font: configProps.font ?? DEFAULT_CONFIG.font,
      tokens: configProps.tokens ?? {},
      themes: configProps.themes ?? DEFAULT_CONFIG.themes,
    };
    const persisted = loadPersisted(storageKey);
    const seeded = applyThemePreset(fromProps, fromProps.mode ?? DEFAULT_CONFIG.mode);
    const withExplicitProps: ThemeConfig = {
      ...seeded,
      ...(configProps.colorScheme ? { colorScheme: configProps.colorScheme } : null),
      ...(configProps.accent ? { accent: configProps.accent } : null),
      ...(configProps.density ? { density: configProps.density } : null),
      ...(configProps.intensity != null ? { intensity: configProps.intensity } : null),
      ...(configProps.radius != null ? { radius: configProps.radius } : null),
      ...(configProps.font ? { font: configProps.font } : null),
      ...(configProps.tokens ? { tokens: configProps.tokens } : null),
    };
    if (!persisted) return withExplicitProps;
    const persistedMode = persisted.mode ?? withExplicitProps.mode ?? DEFAULT_CONFIG.mode;
    return {
      ...applyThemePreset({ ...withExplicitProps, mode: persistedMode }, persistedMode),
      ...persisted,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [config, setConfig] = React.useState<ThemeConfig>(initialConfig);
  const previousPropsRef = React.useRef<ThemeConfig>({
    mode: configProps.mode,
    colorScheme: configProps.colorScheme,
    accent: configProps.accent,
    density: configProps.density,
    intensity: configProps.intensity,
    radius: configProps.radius,
    font: configProps.font,
    tokens: configProps.tokens,
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
    assignIfChanged("accent", configProps.accent);
    assignIfChanged("density", configProps.density);
    assignIfChanged("intensity", configProps.intensity);
    assignIfChanged("radius", configProps.radius);
    assignIfChanged("font", configProps.font);
    assignIfChanged("tokens", configProps.tokens);
    assignIfChanged("themes", configProps.themes);

    previousPropsRef.current = {
      mode: configProps.mode,
      colorScheme: configProps.colorScheme,
      accent: configProps.accent,
      density: configProps.density,
      intensity: configProps.intensity,
      radius: configProps.radius,
      font: configProps.font,
      tokens: configProps.tokens,
      themes: configProps.themes,
    };

    if (Object.keys(changedProps).length === 0) return;

    setConfig((c) => {
      const base: ThemeConfig = {
        ...c,
        ...(Object.prototype.hasOwnProperty.call(changedProps, "themes")
          ? { themes: configProps.themes ?? DEFAULT_CONFIG.themes }
          : null),
      };
      const mode =
        Object.prototype.hasOwnProperty.call(changedProps, "mode")
          ? (configProps.mode ?? DEFAULT_CONFIG.mode)
          : (c.mode ?? DEFAULT_CONFIG.mode);
      const nextFromMode = Object.prototype.hasOwnProperty.call(changedProps, "mode")
        ? applyThemePreset(base, mode)
        : base;
      const next: ThemeConfig = {
        ...nextFromMode,
        mode,
        ...(Object.prototype.hasOwnProperty.call(changedProps, "colorScheme")
          ? { colorScheme: configProps.colorScheme }
          : null),
        ...(Object.prototype.hasOwnProperty.call(changedProps, "accent") ? { accent: configProps.accent } : null),
        ...(Object.prototype.hasOwnProperty.call(changedProps, "density") ? { density: configProps.density } : null),
        ...(Object.prototype.hasOwnProperty.call(changedProps, "intensity")
          ? { intensity: configProps.intensity }
          : null),
        ...(Object.prototype.hasOwnProperty.call(changedProps, "radius") ? { radius: configProps.radius } : null),
        ...(Object.prototype.hasOwnProperty.call(changedProps, "font") ? { font: configProps.font } : null),
        ...(Object.prototype.hasOwnProperty.call(changedProps, "tokens") ? { tokens: configProps.tokens } : null),
      };
      if (
        next.mode === c.mode &&
        next.colorScheme === c.colorScheme &&
        next.accent === c.accent &&
        next.density === c.density &&
        next.intensity === c.intensity &&
        next.radius === c.radius &&
        next.font === c.font &&
        next.tokens === c.tokens &&
        next.themes === c.themes
      ) {
        return c;
      }
      return next;
    });
  }, [
    configProps.mode,
    configProps.colorScheme,
    configProps.accent,
    configProps.density,
    configProps.intensity,
    configProps.radius,
    configProps.font,
    configProps.tokens,
    configProps.themes,
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

  const effectiveConfig = React.useMemo(() => resolveThemeConfig(config), [config]);
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

  const { key: accentKey, palette: accentPalette } = React.useMemo(
    () => normalizeAccentInput(effectiveConfig.accent, colorScheme),
    [effectiveConfig.accent, colorScheme]
  );

  const scopeRef = React.useRef<HTMLElement | null>(null);
  const appliedTokenKeysRef = React.useRef<Set<string>>(new Set());

  // Apply theme whenever config/resolvedMode changes.
  React.useEffect(() => {
    if (!isBrowser) return;
    const el = target === "root" ? document.documentElement : scopeRef.current;
    if (!el) return;
    const nextTokenKeys = new Set(Object.keys(effectiveConfig.tokens));
    for (const key of appliedTokenKeysRef.current) {
      if (!nextTokenKeys.has(key)) el.style.removeProperty(toVar(key));
    }
    applyTheme(el as HTMLElement, { ...effectiveConfig, colorScheme });
    appliedTokenKeysRef.current = nextTokenKeys;
    persist(storageKey, config);
  }, [config, effectiveConfig, colorScheme, target, storageKey]);

  const value: ThemeValue = React.useMemo(() => {
    const patch = (p: Partial<ThemeConfig>) => setConfig((c) => ({ ...c, ...p }));
    return {
      mode: effectiveConfig.mode,
      resolvedMode,
      colorScheme,
      accent: accentKey,
      accentPalette,
      density: effectiveConfig.density,
      intensity: effectiveConfig.intensity,
      radius: effectiveConfig.radius,
      font: effectiveConfig.font,
      tokens: effectiveConfig.tokens,
      themes: effectiveConfig.themes,
      activeTheme,
      setMode: (m) => setConfig((c) => applyThemePreset(c, m)),
      toggleMode: () =>
        setConfig((c) => ({
          ...c,
          mode: (c.mode === "dark" ? "light" : "dark") as ThemeMode,
        })),
      setAccent: (a) => patch({ accent: a }),
      setDensity: (d) => patch({ density: d }),
      setIntensity: (n) => patch({ intensity: n }),
      setRadius: (n) => patch({ radius: n }),
      setFont: (f) => patch({ font: f }),
      setTokens: (t) => patch({ tokens: t }),
      setThemes: (t) => patch({ themes: t }),
      update: patch,
      reset: () => setConfig(initialConfig),
    };
  }, [effectiveConfig, resolvedMode, colorScheme, accentKey, accentPalette, activeTheme, initialConfig]);

  // onChange callback.
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;
  React.useEffect(() => {
    onChangeRef.current?.(value);
  }, [value]);

  if (target === "scope") {
    const Component = Tag as React.ElementType;
    return (
      <ThemeCtx.Provider value={value}>
        <Component
          ref={scopeRef as React.Ref<never>}
          className={className}
          style={{
            color: "var(--fg)",
            fontFamily: "var(--font-sans)",
            ...style,
          }}
        >
          {children}
        </Component>
      </ThemeCtx.Provider>
    );
  }

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
};
