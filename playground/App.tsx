import * as React from "react";
import {
  Button,
  TitleBar,
  MessageContainer,
  Icon,
  Input,
  Slider,
  Switch,
  Tooltip,
  ColorPicker,
  ThemeProvider,
  useTheme,
  ACCENT_PRESETS,
  type AccentPalette,
  type AccentKey,
  type DensityMode,
  type FontKey,
  type ThemeBaseMode,
  type ThemeConfig,
  type ThemePreset,
  type ThemePresets,
  type ThemeMode,
} from "lumina";
import { SECTIONS, NAV, DEFAULT_SECTION_ID } from "./sections/_registry";
import { useHashRoute } from "./router";
import { AnchorNav, type AnchorItem } from "./docs";
import "./playground.css";

const BUILT_IN_CUSTOM_THEME_PRESETS = {
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
    font: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
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
  assistantDark: {
    base: "dark",
    accent: {
      accent: "#818cf8",
      ink: "#c4c9ff",
      soft: "rgba(129, 140, 248, 0.17)",
      glow: "rgba(129, 140, 248, 0.18)",
    },
    density: "comfortable",
    intensity: 4,
    radius: 16,
    font: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
    tokens: {
      bg: "#2a2a36",
      "bg-raised": "#33333f",
      "bg-sunken": "#20202b",
      fg: "#d4d7e0",
      "fg-muted": "#9ca1b0",
      "fg-subtle": "#6f7484",
      border: "#3e4455",
      divider: "rgba(255, 255, 255, 0.08)",
      "shadow-dark": "#1a1a24",
      "shadow-light": "#3a3a46",
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
} satisfies ThemePresets;

const USER_THEME_STORAGE_KEY = "lumina:user-themes";
const DRAFT_THEME_MODE = "__draft_theme__";
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
type SurfaceTokenKey = (typeof SURFACE_TOKEN_KEYS)[number];
type AccentPaletteKey = keyof AccentPalette;
type ThemeCreateMode = "simple" | "advanced";
type AdvancedFontMode = "preset" | "custom";

const FONT_OPTIONS: { k: FontKey; l: string }[] = [
  { k: "system", l: "系统" },
  { k: "sf", l: "SF Pro" },
  { k: "serif", l: "衬线" },
  { k: "mono", l: "等宽" },
];
const DENSITY_OPTIONS: { k: DensityMode; l: string }[] = [
  { k: "compact", l: "紧凑" },
  { k: "comfortable", l: "舒适" },
  { k: "spacious", l: "宽松" },
];
const THEME_CREATE_MODE_OPTIONS: { k: ThemeCreateMode; l: string }[] = [
  { k: "simple", l: "简洁" },
  { k: "advanced", l: "深度" },
];
const ADVANCED_FONT_MODE_OPTIONS: { k: AdvancedFontMode; l: string }[] = [
  { k: "preset", l: "预设字体" },
  { k: "custom", l: "自定义栈" },
];
const SURFACE_TOKEN_FIELDS: { key: SurfaceTokenKey; label: string }[] = [
  { key: "bg", label: "背景" },
  { key: "bg-raised", label: "凸起面" },
  { key: "bg-sunken", label: "凹陷面" },
  { key: "fg", label: "正文" },
  { key: "fg-muted", label: "次级文字" },
  { key: "fg-subtle", label: "弱文字" },
  { key: "border", label: "描边" },
  { key: "divider", label: "分割线" },
  { key: "shadow-dark", label: "暗阴影" },
  { key: "shadow-light", label: "亮阴影" },
];
const ACCENT_PALETTE_FIELDS: { key: AccentPaletteKey; label: string }[] = [
  { key: "accent", label: "主色" },
  { key: "ink", label: "文字色" },
  { key: "soft", label: "柔和底" },
  { key: "glow", label: "光晕" },
];

interface ThemePreviewColors {
  surface: string;
  fg: string;
  accent: string;
  radius: number;
  base: ThemeBaseMode;
}

interface StoredUserTheme {
  label: string;
  tone: string;
  preset: ThemePreset;
  createdAt: number;
}

type StoredUserThemes = Record<string, StoredUserTheme>;

const BUILT_IN_CUSTOM_THEME_KEYS = new Set(Object.keys(BUILT_IN_CUSTOM_THEME_PRESETS));

const CUSTOM_THEME_OPTIONS: { key: string; label: string; tone: string }[] = [
  { key: "graphite", label: "石墨", tone: "冷暗" },
  { key: "porcelain", label: "瓷白", tone: "清亮" },
  { key: "assistant", label: "助手", tone: "Soft" },
  { key: "assistantDark", label: "助手暗", tone: "Soft" },
  { key: "ember", label: "余烬", tone: "暖暗" },
];

const loadStoredUserThemes = (): StoredUserThemes => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(USER_THEME_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as StoredUserThemes;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const persistStoredUserThemes = (themes: StoredUserThemes): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(USER_THEME_STORAGE_KEY, JSON.stringify(themes));
  } catch {
    /* localStorage may be disabled in some embedded previews. */
  }
};

const getStoredUserThemePresets = (): ThemePresets =>
  Object.fromEntries(Object.entries(loadStoredUserThemes()).map(([key, value]) => [key, value.preset])) as ThemePresets;

const getInitialThemePresets = (): ThemePresets => ({
  ...BUILT_IN_CUSTOM_THEME_PRESETS,
  ...getStoredUserThemePresets(),
});

const themePresetAccent = (preset: ThemePreset): string => {
  const accent = preset.accent ?? "sky";
  if (typeof accent === "string") {
    return accent in ACCENT_PRESETS ? ACCENT_PRESETS[accent as AccentKey].accent : accent;
  }
  return accent.accent;
};

const createThemeKey = (label: string, themes: ThemePresets): string => {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const base = `user-${slug || "custom-theme"}`;
  let key = base;
  let i = 2;
  while (key in themes || BUILT_IN_CUSTOM_THEME_KEYS.has(key)) {
    key = `${base}-${i}`;
    i += 1;
  }
  return key;
};

const createAccentPalette = (accent: string, base: ThemeBaseMode): NonNullable<ThemePreset["accent"]> => ({
  accent,
  ink: base === "dark" ? `color-mix(in oklch, ${accent} 68%, white)` : `color-mix(in oklch, ${accent} 65%, black)`,
  soft: base === "dark" ? `color-mix(in oklch, ${accent} 28%, black)` : `color-mix(in oklch, ${accent} 15%, white)`,
  glow: base === "dark" ? `color-mix(in oklch, ${accent} 18%, transparent)` : `color-mix(in oklch, ${accent} 35%, transparent)`,
});

const createSurfaceTokens = (surface: string, base: ThemeBaseMode): NonNullable<ThemePreset["tokens"]> =>
  base === "dark"
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

const clampColor = (value: number): number => Math.min(1, Math.max(0, value));

const normalizeHexColor = (input: string): string | null => {
  const value = input.trim().replace(/^#/, "");
  if (!/^([\da-f]{3}|[\da-f]{6})$/i.test(value)) return null;
  const hex = value.length === 3 ? value.split("").map((part) => part + part).join("") : value;
  return `#${hex.toLowerCase()}`;
};

const hexToRgbColor = (hex: string): [number, number, number] | null => {
  const normalized = normalizeHexColor(hex);
  if (!normalized) return null;
  const value = Number.parseInt(normalized.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
};

const rgbToHexColor = (red: number, green: number, blue: number): string => {
  const toHex = (value: number) => Math.round(Math.min(255, Math.max(0, value))).toString(16).padStart(2, "0");
  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
};

const parseRgbColor = (value: string): string | null => {
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
};

const parseOklchColor = (value: string): string | null => {
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
};

const resolveCssColorToHex = (value: string): string | null => {
  if (typeof document === "undefined") return null;
  const probe = document.createElement("span");
  probe.style.color = value;
  if (!probe.style.color) return null;
  probe.style.position = "fixed";
  probe.style.pointerEvents = "none";
  probe.style.opacity = "0";
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  return normalizeHexColor(resolved) ?? parseRgbColor(resolved) ?? parseOklchColor(resolved);
};

const cssColorToHex = (value: string, fallback: string): string =>
  normalizeHexColor(value) ??
  parseRgbColor(value) ??
  parseOklchColor(value) ??
  resolveCssColorToHex(value) ??
  fallback;

const sameHexColor = (a: string, b: string): boolean => {
  const left = normalizeHexColor(a);
  const right = normalizeHexColor(b);
  return !!left && left === right;
};

const shiftHexColor = (value: string | undefined, delta: [number, number, number]): string | undefined => {
  if (!value) return undefined;
  const rgb = hexToRgbColor(value);
  if (!rgb) return value;
  return rgbToHexColor(rgb[0] + delta[0], rgb[1] + delta[1], rgb[2] + delta[2]);
};

const createDraftSurfaceTokens = (
  surface: string,
  base: ThemeBaseMode,
  sourceSurface: string,
  sourceTokens: NonNullable<ThemePreset["tokens"]>
): NonNullable<ThemePreset["tokens"]> => {
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
};

const createDraftAccentPalette = (
  accent: string,
  base: ThemeBaseMode,
  sourceAccent: string,
  sourcePalette: AccentPalette
): AccentPalette =>
  sameHexColor(accent, sourceAccent) ? { ...sourcePalette } : (createAccentPalette(accent, base) as AccentPalette);

const readRootCssVar = (name: string, fallback: string): string => {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
};

const readCurrentSurfaceTokens = (base: ThemeBaseMode): NonNullable<ThemePreset["tokens"]> => {
  const fallbackTokens = createSurfaceTokens(DEFAULT_SURFACE_BY_BASE[base], base);
  return Object.fromEntries(
    SURFACE_TOKEN_KEYS.map((key) => [key, readRootCssVar(`--${key}`, fallbackTokens[key] ?? DEFAULT_SURFACE_BY_BASE[base])])
  );
};

const readCurrentAccentPalette = (fallback: AccentPalette): AccentPalette => ({
  accent: readRootCssVar("--accent", fallback.accent),
  ink: readRootCssVar("--accent-ink", fallback.ink),
  soft: readRootCssVar("--accent-soft", fallback.soft),
  glow: readRootCssVar("--accent-glow", fallback.glow),
});

const readPreviewColors = (base: ThemeBaseMode, radius: number, fallbackAccent: string): ThemePreviewColors => {
  const surface = cssColorToHex(readRootCssVar("--bg", DEFAULT_SURFACE_BY_BASE[base]), DEFAULT_SURFACE_BY_BASE[base]);
  const fg = readRootCssVar("--fg", base === "dark" ? "#d8deeb" : "#3a4558");
  const accent = cssColorToHex(readRootCssVar("--accent", fallbackAccent), fallbackAccent);
  return { surface, fg, accent, radius, base };
};

const toFontKey = (font: ThemeConfig["font"]): FontKey =>
  typeof font === "string" && FONT_OPTIONS.some((option) => option.k === font)
    ? (font as FontKey)
    : "system";

const fontConfigToText = (font: NonNullable<ThemeConfig["font"]>): string =>
  typeof font === "string" ? font : JSON.stringify(font);

const tokenPickerValue = (value: string | undefined, fallback: string): string =>
  cssColorToHex(value ?? fallback, fallback);

const snapshotTheme = (theme: ReturnType<typeof useTheme>): ThemeConfig => ({
  mode: theme.mode,
  colorScheme: theme.colorScheme,
  accent: theme.accent === "custom" ? theme.accentPalette : theme.accent,
  density: theme.density,
  intensity: theme.intensity,
  radius: theme.radius,
  font: theme.font,
  tokens: theme.tokens,
  themes: theme.themes,
});

/* ------------------------------------------------------------------ */
/* App — wraps everything in <ThemeProvider>                           */
/* ------------------------------------------------------------------ */

export const App: React.FC = () => {
  const initialThemesRef = React.useRef<ThemePresets | null>(null);
  if (!initialThemesRef.current) initialThemesRef.current = getInitialThemePresets();

  return (
    <ThemeProvider
      mode="light"
      accent="rose"
      density="comfortable"
      intensity={5}
      radius={22}
      font="sf"
      themes={initialThemesRef.current}
      storageKey="lumina:theme"
    >
      <AppInner />
    </ThemeProvider>
  );
};

/* ------------------------------------------------------------------ */
/* AppInner — consumes useTheme                                        */
/* ------------------------------------------------------------------ */

const AppInner: React.FC = () => {
  const theme = useTheme();

  const [active, go] = useHashRoute(DEFAULT_SECTION_ID, (id) => id in SECTIONS);
  const [search, setSearch] = React.useState("");
  const [tweaksOpen, setTweaksOpen] = React.useState(false);
  const previewRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (previewRef.current) previewRef.current.scrollTop = 0;
  }, [active]);

  // Section-level tweak bridge — sections still call `setTweak(key, value)`
  // (legacy API) but the actual state now lives in ThemeProvider.
  const setTweak = React.useCallback(
    (key: string, value: unknown) => {
      switch (key) {
        case "theme":
        case "mode":
          theme.setMode(value as ThemeMode);
          break;
        case "accent":
          theme.setAccent(value as AccentKey);
          break;
        case "density":
          theme.setDensity(value as DensityMode);
          break;
        case "intensity":
          theme.setIntensity(value as number);
          break;
        case "radius":
          theme.setRadius(value as number);
          break;
        case "font":
          theme.setFont(value as FontKey);
          break;
      }
    },
    [theme]
  );

  // Collect anchors from rendered .doc-block / .doc-demo elements after each section render.
  const [anchors, setAnchors] = React.useState<AnchorItem[]>([]);
  React.useEffect(() => {
    const root = previewRef.current;
    if (!root) {
      setAnchors([]);
      return;
    }
    const collect = () => {
      const items: AnchorItem[] = [];
      root.querySelectorAll<HTMLElement>(".doc-block").forEach((el) => {
        const id = el.id;
        const titleEl = el.querySelector(".doc-block-title");
        const title = (titleEl?.textContent ?? id).replace(/^#\s*/, "").trim() || id;
        if (id) items.push({ href: `#${id}`, label: title, level: 0 });
        el.querySelectorAll<HTMLElement>(".doc-demo").forEach((demo) => {
          const did = demo.id;
          const dt = demo.dataset.demoTitle ?? did;
          if (did) items.push({ href: `#${did}`, label: dt, level: 1 });
        });
      });
      setAnchors(items);
    };
    const raf = requestAnimationFrame(collect);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  const filteredNav = search
    ? NAV.map((g) => ({
        ...g,
        items: g.items.filter((i) => i.label.toLowerCase().includes(search.toLowerCase())),
      })).filter((g) => g.items.length)
    : NAV;

  const section = SECTIONS[active] ?? SECTIONS[DEFAULT_SECTION_ID];
  const Component = section.Component;

  return (
    <div className="window">
      <TitleBar
        platform="mac"
        title={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontWeight: 600 }}>
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: 7,
                background: "var(--bg)",
                boxShadow: "var(--neu-flat)",
                display: "inline-grid",
                placeItems: "center",
                color: "var(--accent)",
                fontWeight: 700,
                fontSize: 11,
              }}
            >
              L
            </span>
            <span>Lumina</span>
            <span style={{ color: "var(--fg-subtle)", fontSize: 12, fontWeight: 400 }}>· {section.eyebrow}</span>
          </span>
        }
        actions={
          <div className="pg-title-actions">
            <Tooltip content={`切换 ${theme.colorScheme === "light" ? "深色" : "浅色"} 模式`}>
              <button
                className="pg-chip"
                onClick={() =>
                  theme.update({
                    mode: theme.colorScheme === "light" ? "dark" : "light",
                    colorScheme: undefined,
                    tokens: {},
                  })
                }
              >
                <Icon name={theme.colorScheme === "light" ? "moon" : "sun"} size={14} />
              </button>
            </Tooltip>
            <Tooltip content="Tweaks 面板">
              <button
                className={`pg-chip ${tweaksOpen ? "on" : ""}`}
                onClick={() => setTweaksOpen((o) => !o)}
              >
                <Icon name="sliders" size={14} />
              </button>
            </Tooltip>
          </div>
        }
      />

      <div className="main">
        <aside className="sidebar">
          <div className="search">
            <Input
              size="sm"
              leadingIcon="search"
              placeholder="搜索组件..."
              value={search}
              onValueChange={setSearch}
            />
          </div>

          {filteredNav.map((g) => (
            <React.Fragment key={g.group}>
              <div className="group-label">{g.group}</div>
              {g.items.map((it) => (
                <button
                  key={it.id}
                  className={`nav-item ${active === it.id ? "active" : ""}`}
                  onClick={() => go(it.id)}
                >
                  <span className="dot" />
                  <span>{it.label}</span>
                </button>
              ))}
            </React.Fragment>
          ))}

          <div className="sb-foot">v0.1 · Neumorphic</div>
        </aside>

        <main className="preview" ref={previewRef}>
          <div className="preview-header">
            <div>
              <div className="eyebrow">{section.eyebrow}</div>
              <h1>{section.title}</h1>
              <p>{section.desc}</p>
            </div>
            <div className="meta">
              <span>React · 18</span>
              <span>
                {new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>
          </div>
          <div className={anchors.length > 1 ? "doc-with-anchor" : ""}>
            <div>
              <Component
                go={go}
                setTweak={setTweak}
                openTweaks={() => setTweaksOpen(true)}
                scrollRoot={previewRef}
              />
            </div>
            {anchors.length > 1 && <AnchorNav items={anchors} rootRef={previewRef} />}
          </div>
        </main>
      </div>

      <button
        className={`tweaks-fab ${tweaksOpen ? "active" : ""}`}
        onClick={() => setTweaksOpen((o) => !o)}
        aria-label="Tweaks"
      >
        <Icon name="sliders" size={20} />
      </button>
      {tweaksOpen && <TweaksPanel />}

      <MessageContainer />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* TweaksPanel — fully driven by useTheme                              */
/* ------------------------------------------------------------------ */

const TweaksPanel: React.FC = () => {
  const t = useTheme();
  const [customAccent, setCustomAccent] = React.useState("#845ef7");
  const [storedUserThemes, setStoredUserThemes] = React.useState<StoredUserThemes>(() => loadStoredUserThemes());
  const [isCreatingTheme, setIsCreatingTheme] = React.useState(false);
  const [previewDraft, setPreviewDraft] = React.useState(true);
  const [createMode, setCreateMode] = React.useState<ThemeCreateMode>("simple");
  const [draftName, setDraftName] = React.useState("我的主题");
  const [draftBase, setDraftBase] = React.useState<ThemeBaseMode>("dark");
  const [draftSurface, setDraftSurface] = React.useState("#20242d");
  const [draftAccent, setDraftAccent] = React.useState("#6ee7d8");
  const [draftAccentPalette, setDraftAccentPalette] = React.useState<AccentPalette>(() =>
    createAccentPalette("#6ee7d8", "dark") as AccentPalette
  );
  const [draftSourceAccent, setDraftSourceAccent] = React.useState("#6ee7d8");
  const [draftSourceAccentPalette, setDraftSourceAccentPalette] = React.useState<AccentPalette>(() =>
    createAccentPalette("#6ee7d8", "dark") as AccentPalette
  );
  const [draftTokens, setDraftTokens] = React.useState<NonNullable<ThemePreset["tokens"]>>(() =>
    createSurfaceTokens("#20242d", "dark")
  );
  const [draftSourceSurface, setDraftSourceSurface] = React.useState("#20242d");
  const [draftSourceTokens, setDraftSourceTokens] = React.useState<NonNullable<ThemePreset["tokens"]>>(() =>
    createSurfaceTokens("#20242d", "dark")
  );
  const [draftIntensity, setDraftIntensity] = React.useState(5);
  const [draftRadius, setDraftRadius] = React.useState(22);
  const [draftDensity, setDraftDensity] = React.useState<DensityMode>("comfortable");
  const [draftFont, setDraftFont] = React.useState<NonNullable<ThemeConfig["font"]>>("sf");
  const [advancedFontMode, setAdvancedFontMode] = React.useState<AdvancedFontMode>("preset");
  const [snapshotPreviewColors, setSnapshotPreviewColors] = React.useState<ThemePreviewColors | null>(null);
  const previewSnapshotRef = React.useRef<ThemeConfig | null>(null);
  const updateThemeRef = React.useRef(t.update);
  updateThemeRef.current = t.update;
  const modeName = String(t.mode);

  const userThemeOptions = React.useMemo(
    () =>
      Object.keys(t.themes)
        .filter((key) => !BUILT_IN_CUSTOM_THEME_KEYS.has(key))
        .map((key) => ({
          key,
          label: storedUserThemes[key]?.label ?? key,
          tone: storedUserThemes[key]?.tone ?? "自建",
        })),
    [storedUserThemes, t.themes]
  );
  const themeOptions = React.useMemo(
    () => [...CUSTOM_THEME_OPTIONS, ...userThemeOptions],
    [userThemeOptions]
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
  const previewCardColors = previewDraft
    ? {
        surface: draftTokens.bg ?? draftSurface,
        fg: draftTokens.fg ?? (draftBase === "dark" ? "#d8deeb" : "#3a4558"),
        accent: draftAccentPalette.accent,
        radius: draftRadius,
        base: draftBase,
      }
    : snapshotPreviewColors ?? {
        surface: draftSurface,
        fg: draftTokens.fg ?? (draftBase === "dark" ? "#d8deeb" : "#3a4558"),
        accent: draftAccent,
        radius: draftRadius,
        base: draftBase,
      };

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

  const restorePreviewSnapshot = () => {
    const snapshot = previewSnapshotRef.current;
    if (!snapshot) return;
    t.update({
      ...snapshot,
      mode: snapshot.mode === DRAFT_THEME_MODE ? snapshot.colorScheme ?? "light" : snapshot.mode,
    });
  };

  const beginCreateTheme = () => {
    const snapshot = snapshotTheme(t);
    const snapshotColors = readPreviewColors(t.colorScheme, t.radius, t.accentPalette.accent);
    const surface = snapshotColors.surface;
    const surfaceTokens = readCurrentSurfaceTokens(t.colorScheme);
    const accentPalette = readCurrentAccentPalette(t.accentPalette);
    const accent = cssColorToHex(accentPalette.accent, snapshotColors.accent);
    previewSnapshotRef.current = snapshot;
    setSnapshotPreviewColors(snapshotColors);
    setDraftBase(t.colorScheme);
    setDraftSurface(surface);
    setDraftTokens(surfaceTokens);
    setDraftSourceSurface(surface);
    setDraftSourceTokens(surfaceTokens);
    setDraftAccent(accent);
    setDraftAccentPalette(accentPalette);
    setDraftSourceAccent(accent);
    setDraftSourceAccentPalette(accentPalette);
    setCustomAccent(accent);
    setDraftDensity(t.density);
    setDraftIntensity(t.intensity);
    setDraftRadius(t.radius);
    setDraftFont(t.font ?? "sf");
    setAdvancedFontMode(toFontKey(t.font) === t.font ? "preset" : "custom");
    setDraftName("我的主题");
    setCreateMode("simple");
    setPreviewDraft(true);
    setIsCreatingTheme(true);
  };

  const cancelCreateTheme = () => {
    restorePreviewSnapshot();
    previewSnapshotRef.current = null;
    setSnapshotPreviewColors(null);
    setPreviewDraft(true);
    setIsCreatingTheme(false);
  };

  const toggleDraftPreview = (checked: boolean) => {
    setPreviewDraft(checked);
    if (!checked) restorePreviewSnapshot();
  };
  const updateDraftBase = (base: ThemeBaseMode) => {
    const surface = DEFAULT_SURFACE_BY_BASE[base];
    const tokens = createSurfaceTokens(surface, base);
    setDraftBase(base);
    setDraftSurface(surface);
    setDraftTokens(tokens);
    setDraftSourceSurface(surface);
    setDraftSourceTokens(tokens);
    const accentPalette = createAccentPalette(draftAccent, base) as AccentPalette;
    setDraftAccentPalette(accentPalette);
    setDraftSourceAccent(draftAccent);
    setDraftSourceAccentPalette(accentPalette);
  };
  const updateDraftSurface = (surface: string) => {
    setDraftSurface(surface);
    setDraftTokens(createDraftSurfaceTokens(surface, draftBase, draftSourceSurface, draftSourceTokens));
  };
  const updateDraftToken = (key: SurfaceTokenKey, value: string) => {
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

  const setBuiltInMode = (mode: "light" | "dark" | "system") => {
    previewSnapshotRef.current = null;
    setSnapshotPreviewColors(null);
    setIsCreatingTheme(false);
    t.update({ mode, colorScheme: undefined, tokens: {} });
  };
  const setCustomMode = (key: string) => {
    const preset = t.themes[key];
    if (!preset) return;
    previewSnapshotRef.current = null;
    setSnapshotPreviewColors(null);
    setIsCreatingTheme(false);
    const accent = themePresetAccent(preset);
    setCustomAccent(accent);
    t.update({
      mode: key,
      colorScheme: preset.base,
      accent: preset.accent,
      density: preset.density ?? t.density,
      intensity: preset.intensity ?? t.intensity,
      radius: preset.radius ?? t.radius,
      font: preset.font ?? t.font,
      tokens: preset.tokens ?? {},
    });
  };
  const saveCustomTheme = () => {
    const label = draftName.trim() || "自定义主题";
    const key = createThemeKey(label, t.themes);
    const nextThemes = { ...t.themes, [key]: draftPreset };
    const nextStoredThemes: StoredUserThemes = {
      ...storedUserThemes,
      [key]: {
        label,
        tone: draftBase === "dark" ? "自建暗" : "自建亮",
        preset: draftPreset,
        createdAt: Date.now(),
      },
    };

    setStoredUserThemes(nextStoredThemes);
    persistStoredUserThemes(nextStoredThemes);
    t.update({
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
    previewSnapshotRef.current = null;
    setSnapshotPreviewColors(null);
    setCustomAccent(draftAccent);
    setDraftName("");
    setPreviewDraft(true);
    setIsCreatingTheme(false);
  };

  return (
    <div className="tweaks-panel">
      <h3>
        <Icon name="sliders" size={14} style={{ color: "var(--accent)" }} /> Tweaks
      </h3>
      <div className="tp-sub">实时调整设计参数 · 驱动 useTheme()</div>

      <div className="tweak-row">
        <div className="label">
          <span>主题</span>
        </div>
        <div className="tweak-pills">
          <button className={`pill ${t.mode === "light" ? "active" : ""}`} onClick={() => setBuiltInMode("light")}>
            <Icon name="sun" size={12} /> 浅色
          </button>
          <button className={`pill ${t.mode === "dark" ? "active" : ""}`} onClick={() => setBuiltInMode("dark")}>
            <Icon name="moon" size={12} /> 深色
          </button>
          <button className={`pill ${t.mode === "system" ? "active" : ""}`} onClick={() => setBuiltInMode("system")}>
            跟随系统
          </button>
        </div>
      </div>

      <div className="tweak-row">
        <div className="label">
          <span>自定义模式</span>
          <span className="value">{t.colorScheme}</span>
        </div>
        <div className="theme-preset-grid">
          {themeOptions.map((option) => {
            const preset = t.themes[option.key];
            if (!preset) return null;
            const active = modeName === option.key;
            const accent = themePresetAccent(preset);
            return (
              <button
                key={option.key}
                className={`theme-preset ${active ? "active" : ""}`}
                onClick={() => setCustomMode(option.key)}
              >
                <span className="preset-ink">
                  <span style={{ background: preset.tokens?.bg }} />
                  <span style={{ background: preset.tokens?.["bg-raised"] }} />
                  <span style={{ background: accent }} />
                </span>
                <span className="preset-copy">
                  <span>{option.label}</span>
                  <small>{option.tone}</small>
                </span>
              </button>
            );
          })}
        </div>
        {!isCreatingTheme ? (
          <Button size="sm" variant="primary" icon="plus" onClick={beginCreateTheme} block>
            新建主题
          </Button>
        ) : (
          <div className="theme-create editing">
            <div className="theme-create-head">
              <div>
                <span>新建主题</span>
                <small>{previewDraft ? "实时预览中" : "预览已暂停"}</small>
              </div>
              <Switch size="sm" checked={previewDraft} onChange={toggleDraftPreview} checkedChildren="预览" unCheckedChildren="停" />
            </div>
            <Input
              size="sm"
              value={draftName}
              onValueChange={setDraftName}
              placeholder="输入主题名称"
              leadingIcon="palette"
            />
            <div className="theme-create-mode">
              {THEME_CREATE_MODE_OPTIONS.map((option) => (
                <button
                  key={option.k}
                  className={createMode === option.k ? "active" : ""}
                  onClick={() => setCreateMode(option.k)}
                >
                  {option.l}
                </button>
              ))}
            </div>

            <div className={`theme-create-grid ${createMode === "advanced" ? "base-only" : ""}`}>
              <div className="theme-create-field wide">
                <span>基底</span>
                <div className="theme-base-pills">
                  <button className={draftBase === "light" ? "active" : ""} onClick={() => updateDraftBase("light")}>
                    浅
                  </button>
                  <button className={draftBase === "dark" ? "active" : ""} onClick={() => updateDraftBase("dark")}>
                    深
                  </button>
                </div>
              </div>
              {createMode === "simple" && (
                <>
                  <div className="theme-create-field">
                    <span>表面</span>
                    <ColorPicker size="sm" value={draftSurface} onChange={updateDraftSurface} />
                  </div>
                  <div className="theme-create-field">
                    <span>强调</span>
                    <ColorPicker size="sm" value={draftAccent} onChange={updateDraftAccent} />
                  </div>
                </>
              )}
            </div>

            <div className="theme-create-sliders">
              <div className="label">
                <span>阴影强度</span>
                <span className="value">{draftIntensity}</span>
              </div>
              <Slider value={draftIntensity} onChange={setDraftIntensity} min={1} max={10} step={1} />
              <div className="label">
                <span>圆角</span>
                <span className="value">{draftRadius}px</span>
              </div>
              <Slider value={draftRadius} onChange={setDraftRadius} min={8} max={36} step={2} />
            </div>

            <div className="theme-create-field">
              <span>密度</span>
              <div className="tweak-pills compact">
                {DENSITY_OPTIONS.map((option) => (
                  <button
                    key={option.k}
                    className={`pill ${draftDensity === option.k ? "active" : ""}`}
                    onClick={() => setDraftDensity(option.k)}
                  >
                    {option.l}
                  </button>
                ))}
              </div>
            </div>
            <div className="theme-create-field">
              <span>字体</span>
              <div className="tweak-pills compact">
                {FONT_OPTIONS.map((option) => (
                  <button
                    key={option.k}
                    className={`pill ${draftFont === option.k ? "active" : ""}`}
                    onClick={() => setDraftFont(option.k)}
                  >
                    {option.l}
                  </button>
                ))}
              </div>
            </div>
            {createMode === "advanced" && (
              <div className="theme-advanced">
                <div className="theme-advanced-section compact">
                  <div className="theme-advanced-title">
                    <span>字体</span>
                    <small>{advancedFontMode === "preset" ? "选择内置字体" : "填写 CSS font-family"}</small>
                  </div>
                  <div className="theme-create-mode">
                    {ADVANCED_FONT_MODE_OPTIONS.map((option) => (
                      <button
                        key={option.k}
                        className={advancedFontMode === option.k ? "active" : ""}
                        onClick={() => {
                          setAdvancedFontMode(option.k);
                          if (option.k === "preset") setDraftFont(toFontKey(draftFont));
                        }}
                      >
                        {option.l}
                      </button>
                    ))}
                  </div>
                  {advancedFontMode === "custom" && (
                    <div className="theme-create-field">
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

                <div className="theme-advanced-section">
                  <div className="theme-advanced-title">
                    <span>表面 tokens</span>
                    <small>完整覆写 --bg / --fg / shadow</small>
                  </div>
                  <div className="theme-token-grid">
                    {SURFACE_TOKEN_FIELDS.map((field) => (
                      <div className="theme-token-field" key={field.key}>
                        <span className="theme-token-label">
                          <span>{field.label}</span>
                          <code>--{field.key}</code>
                        </span>
                        <span className="theme-token-input">
                          <ColorPicker
                            className="theme-token-picker"
                            value={tokenPickerValue(draftTokens[field.key], draftSurface)}
                            onChange={(value) => updateDraftToken(field.key, value)}
                            placement="left"
                            aria-label={`选择 ${field.label}`}
                          >
                            <span className="theme-token-swatch" style={{ background: draftTokens[field.key] }} />
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

                <div className="theme-advanced-section">
                  <div className="theme-advanced-title">
                    <span>强调 palette</span>
                    <small>完整覆写 accent / ink / soft / glow</small>
                  </div>
                  <div className="theme-token-grid">
                    {ACCENT_PALETTE_FIELDS.map((field) => (
                      <div className="theme-token-field" key={field.key}>
                        <span className="theme-token-label">
                          <span>{field.label}</span>
                          <code>accent.{field.key}</code>
                        </span>
                        <span className="theme-token-input">
                          <ColorPicker
                            className="theme-token-picker"
                            value={tokenPickerValue(draftAccentPalette[field.key], draftAccent)}
                            onChange={(value) => updateDraftAccentSlot(field.key, value)}
                            placement="left"
                            aria-label={`选择 ${field.label}`}
                          >
                            <span className="theme-token-swatch" style={{ background: draftAccentPalette[field.key] }} />
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
              className="theme-create-preview"
              style={{
                "--preview-bg": previewCardColors.surface,
                "--preview-fg": previewCardColors.fg,
                "--preview-accent": previewCardColors.accent,
                "--preview-radius": `${previewCardColors.radius}px`,
                "--preview-shadow-dark": draftTokens["shadow-dark"] ?? "var(--shadow-dark)",
                "--preview-shadow-light": draftTokens["shadow-light"] ?? "var(--shadow-light)",
                "--preview-accent-glow": draftAccentPalette.glow,
              } as React.CSSProperties}
            >
              <span className="theme-create-preview-label">
                <Icon name="palette" size={13} />
                <span>{draftName.trim() || "自定义主题"}</span>
              </span>
              <i />
            </div>
            <div className="theme-create-actions">
              <Button size="sm" variant="ghost" icon="x" onClick={cancelCreateTheme}>
                取消
              </Button>
              <Button size="sm" variant="primary" icon="check" onClick={saveCustomTheme} disabled={!draftName.trim()}>
                保存主题
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="tweak-row">
        <div className="label">
          <span>阴影强度</span>
          <span className="value">{t.intensity}</span>
        </div>
        <Slider value={t.intensity} onChange={t.setIntensity} min={1} max={10} step={1} />
      </div>

      <div className="tweak-row">
        <div className="label">
          <span>强调色</span>
          {t.accent === "custom" && (
            <span className="value" style={{ fontFamily: "var(--font-mono)" }}>
              {customAccent}
            </span>
          )}
        </div>
        <div className="swatch-row">
          {(Object.keys(ACCENT_PRESETS) as AccentKey[]).map((k) => (
            <button
              key={k}
              className={`swatch ${t.accent === k ? "active" : ""}`}
              style={{ background: ACCENT_PRESETS[k].accent }}
              onClick={() => t.setAccent(k)}
              aria-label={k}
            />
          ))}
          <ColorPicker
            size="sm"
            value={customAccent}
            onChange={(hex) => {
              setCustomAccent(hex);
              t.setAccent(hex);
            }}
          />
        </div>
      </div>

      <div className="tweak-row">
        <div className="label">
          <span>圆角</span>
          <span className="value">{t.radius}px</span>
        </div>
        <Slider value={t.radius} onChange={t.setRadius} min={8} max={36} step={2} />
      </div>

      <div className="tweak-row">
        <div className="label">
          <span>字体</span>
        </div>
        <div className="tweak-pills">
          {([
            { k: "system", l: "系统" },
            { k: "sf", l: "SF Pro" },
            { k: "serif", l: "衬线" },
            { k: "mono", l: "等宽" },
          ] as { k: FontKey; l: string }[]).map((o) => (
            <button
              key={o.k}
              className={`pill ${t.font === o.k ? "active" : ""}`}
              onClick={() => t.setFont(o.k)}
            >
              {o.l}
            </button>
          ))}
        </div>
      </div>

      <div className="tweak-row">
        <div className="label">
          <span>密度</span>
        </div>
        <div className="tweak-pills">
          {([
            { k: "compact", l: "紧凑" },
            { k: "comfortable", l: "舒适" },
            { k: "spacious", l: "宽松" },
          ] as { k: DensityMode; l: string }[]).map((o) => (
            <button
              key={o.k}
              className={`pill ${t.density === o.k ? "active" : ""}`}
              onClick={() => t.setDensity(o.k)}
            >
              {o.l}
            </button>
          ))}
        </div>
      </div>

      <div className="tweak-row" style={{ marginTop: 12 }}>
        <button
          className="pill"
          style={{ width: "100%", justifyContent: "center" }}
          onClick={t.reset}
        >
          重置
        </button>
      </div>
    </div>
  );
};
