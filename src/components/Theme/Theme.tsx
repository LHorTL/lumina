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
 * - Persistence: optional localStorage via `storageKey` prop.
 * - "system" mode respects `prefers-color-scheme` via matchMedia.
 * - Arbitrary token overrides through the `tokens` prop.
 * ========================================================================== */

/* ------------------------------- Types ---------------------------------- */

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedThemeMode = "light" | "dark";
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

export interface ThemeConfig {
  mode?: ThemeMode;
  accent?: AccentKey | CustomAccentInput;
  density?: DensityMode;
  /** Shadow strength, 1..10. Maps to `--d` (0.4..1.6). */
  intensity?: number;
  /** Base radius in px — generates the full `--r-*` scale. */
  radius?: number;
  font?: FontConfig;
  tokens?: ThemeTokens;
}

export interface ThemeValue {
  /** Requested mode ("system" is preserved here). */
  mode: ThemeMode;
  /** Resolved concrete mode ("system" → "light" | "dark" based on OS). */
  resolvedMode: ResolvedThemeMode;
  /** Accent key or "custom" if a palette was supplied. */
  accent: AccentKey | "custom";
  /** Resolved palette currently in effect. */
  accentPalette: AccentPalette;
  density: DensityMode;
  intensity: number;
  radius: number;
  font: FontConfig;
  tokens: ThemeTokens;

  setMode: (m: ThemeMode) => void;
  toggleMode: () => void;
  setAccent: (a: AccentKey | CustomAccentInput) => void;
  setDensity: (d: DensityMode) => void;
  setIntensity: (n: number) => void;
  setRadius: (n: number) => void;
  setFont: (f: FontConfig) => void;
  setTokens: (t: ThemeTokens) => void;
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

const DEFAULT_CONFIG: Required<Omit<ThemeConfig, "tokens">> & { tokens: ThemeTokens } = {
  mode: "light",
  accent: "sky",
  density: "comfortable",
  intensity: 5,
  radius: 20,
  font: "sf",
  tokens: {},
};

/* ------------------------------ Helpers --------------------------------- */

const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

/** Resolve "system" mode against `prefers-color-scheme`. */
export function resolveThemeMode(mode: ThemeMode): ResolvedThemeMode {
  if (mode !== "system") return mode;
  if (!isBrowser) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Fill missing slots of a custom accent via color-mix. */
export function normalizeAccentInput(
  input: AccentKey | CustomAccentInput,
  resolvedMode: ResolvedThemeMode
): { key: AccentKey | "custom"; palette: AccentPalette } {
  // Preset key?
  if (typeof input === "string" && input in ACCENT_PRESETS) {
    const key = input as AccentKey;
    const base = ACCENT_PRESETS[key];
    if (resolvedMode === "dark") {
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
    (resolvedMode === "dark"
      ? `color-mix(in oklch, ${accent} 30%, black)`
      : `color-mix(in oklch, ${accent} 15%, white)`);
  // Dark-mode glow is halved so it doesn't wash into a white halo on dark surfaces.
  const glow =
    raw.glow ??
    (resolvedMode === "dark"
      ? `color-mix(in oklch, ${accent} 18%, transparent)`
      : `color-mix(in oklch, ${accent} 35%, transparent)`);
  return { key: "custom", palette: { accent, ink, soft, glow } };
}

/** Normalize a token key to a CSS custom property name. */
function toVar(key: string): string {
  return key.startsWith("--") ? key : `--${key}`;
}

/** Imperative theme application — writes CSS vars / data-attrs on a target. */
export function applyTheme(target: HTMLElement, config: ThemeConfig): void {
  const cfg: ThemeConfig = { ...DEFAULT_CONFIG, ...config };
  const resolvedMode = resolveThemeMode(cfg.mode!);
  const { key, palette } = normalizeAccentInput(cfg.accent!, resolvedMode);

  // data-* attributes
  target.dataset.theme = resolvedMode;
  target.dataset.density = cfg.density!;
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
  /** If set, theme state is persisted to localStorage under this key. */
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

  // Build the initial config: defaults ← props ← persisted (if any)
  const initialConfig = React.useMemo<ThemeConfig>(() => {
    const fromProps: ThemeConfig = {
      mode: configProps.mode ?? DEFAULT_CONFIG.mode,
      accent: configProps.accent ?? DEFAULT_CONFIG.accent,
      density: configProps.density ?? DEFAULT_CONFIG.density,
      intensity: configProps.intensity ?? DEFAULT_CONFIG.intensity,
      radius: configProps.radius ?? DEFAULT_CONFIG.radius,
      font: configProps.font ?? DEFAULT_CONFIG.font,
      tokens: configProps.tokens ?? {},
    };
    const persisted = loadPersisted(storageKey);
    return persisted ? { ...fromProps, ...persisted } : fromProps;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [config, setConfig] = React.useState<ThemeConfig>(initialConfig);

  // Sync external prop changes into state — so callers can drive the provider
  // "controlled-style" (e.g. <ThemeProvider accent={reactState} />).
  // `setMode`/`setAccent`/etc. still work; they just get overridden if the
  // parent later changes the prop.
  React.useEffect(() => {
    setConfig((c) => {
      const next: ThemeConfig = {
        mode: configProps.mode ?? c.mode,
        accent: configProps.accent ?? c.accent,
        density: configProps.density ?? c.density,
        intensity: configProps.intensity ?? c.intensity,
        radius: configProps.radius ?? c.radius,
        font: configProps.font ?? c.font,
        tokens: configProps.tokens ?? c.tokens,
      };
      if (
        next.mode === c.mode &&
        next.accent === c.accent &&
        next.density === c.density &&
        next.intensity === c.intensity &&
        next.radius === c.radius &&
        next.font === c.font &&
        next.tokens === c.tokens
      ) {
        return c;
      }
      return next;
    });
  }, [
    configProps.mode,
    configProps.accent,
    configProps.density,
    configProps.intensity,
    configProps.radius,
    configProps.font,
    configProps.tokens,
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

  const resolvedMode: ResolvedThemeMode =
    config.mode === "system" ? (systemDark ? "dark" : "light") : (config.mode as ResolvedThemeMode);

  const { key: accentKey, palette: accentPalette } = React.useMemo(
    () => normalizeAccentInput(config.accent!, resolvedMode),
    [config.accent, resolvedMode]
  );

  const scopeRef = React.useRef<HTMLElement | null>(null);

  // Apply theme whenever config/resolvedMode changes.
  React.useEffect(() => {
    if (!isBrowser) return;
    const el = target === "root" ? document.documentElement : scopeRef.current;
    if (!el) return;
    applyTheme(el as HTMLElement, { ...config, mode: resolvedMode });
    persist(storageKey, config);
  }, [config, resolvedMode, target, storageKey]);

  const value: ThemeValue = React.useMemo(() => {
    const patch = (p: Partial<ThemeConfig>) => setConfig((c) => ({ ...c, ...p }));
    return {
      mode: config.mode!,
      resolvedMode,
      accent: accentKey,
      accentPalette,
      density: config.density!,
      intensity: config.intensity!,
      radius: config.radius!,
      font: config.font!,
      tokens: config.tokens ?? {},
      setMode: (m) => patch({ mode: m }),
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
      update: patch,
      reset: () => setConfig(initialConfig),
    };
  }, [config, resolvedMode, accentKey, accentPalette, initialConfig]);

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
          style={style}
        >
          {children}
        </Component>
      </ThemeCtx.Provider>
    );
  }

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
};
