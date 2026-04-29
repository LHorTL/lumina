import type { ThemeBaseMode, ThemePreset, ThemeTokens } from "./Theme";

export type BuiltInLuminaThemePresetKey =
  | "light"
  | "dark"
  | "porcelain"
  | "graphite"
  | "ember"
  | "assistant"
  | "assistantDark";

type BuiltInLuminaThemePreset = ThemePreset & {
  base: ThemeBaseMode;
  tokens: ThemeTokens;
};

type BuiltInLuminaThemePresetMap = Record<BuiltInLuminaThemePresetKey, BuiltInLuminaThemePreset>;

export const LUMINA_THEME_PRESETS: BuiltInLuminaThemePresetMap = {
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
      "shadow-scale": "1",
      "shadow-float-scale": "1",
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
      "shadow-scale": "1",
      "shadow-float-scale": "1",
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
      "shadow-scale": "1",
      "shadow-float-scale": "1",
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
      "shadow-scale": "1",
      "shadow-float-scale": "1",
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
      "shadow-scale": "1",
      "shadow-float-scale": "1",
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
      "shadow-scale": "1",
      "shadow-float-scale": "1",
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
    font: "system",
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
      "shadow-scale": "1",
      "shadow-float-scale": "1",
    },
  },
};

export function cloneLuminaThemePreset<K extends BuiltInLuminaThemePresetKey>(
  key: K
): BuiltInLuminaThemePresetMap[K] {
  const preset = LUMINA_THEME_PRESETS[key];
  return {
    ...preset,
    accent: typeof preset.accent === "object" ? { ...preset.accent } : preset.accent,
    tokens: { ...preset.tokens },
  };
}

export function pickLuminaThemePresets<K extends BuiltInLuminaThemePresetKey>(
  keys: readonly K[]
): Pick<BuiltInLuminaThemePresetMap, K> {
  return Object.fromEntries(keys.map((key) => [key, cloneLuminaThemePreset(key)])) as Pick<
    BuiltInLuminaThemePresetMap,
    K
  >;
}
