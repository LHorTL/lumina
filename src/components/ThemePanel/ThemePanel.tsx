import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./ThemePanel.css";
import * as React from "react";
import { Button } from "../Button";
import { ColorPicker } from "../ColorPicker";
import { Icon } from "../Icon";
import { RadioGroup } from "../Radio";
import { Slider } from "../Slider";
import {
  ACCENT_PRESETS,
  useTheme,
  type AccentKey,
  type FontKey,
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
  /** Show the reset button. */
  showReset?: boolean;
  /** Compact typography and spacing. */
  compact?: boolean;
}

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

/**
 * `ThemePanel` — ready-made controls for quickly editing the nearest Lumina theme.
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
      showReset = true,
      compact,
      className = "",
      ...rest
    },
    ref
  ) => {
    const theme = useTheme();
    const [customAccent, setCustomAccent] = React.useState(defaultCustomAccent);
    const modeValue = String(theme.mode);

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
        label: fallbackPresetLabel(key),
        description: preset.base === "dark" ? "深色" : "浅色",
        preset,
      }));
      return [...builtIns, ...customOptions];
    }, [presetOptions, theme.themes]);

    const applyMode = (mode: string) => {
      if (mode === "light" || mode === "dark" || mode === "system") {
        theme.update({ mode, colorScheme: mode === "system" ? theme.colorScheme : mode, tokens: {} });
        return;
      }
      theme.setMode(mode);
    };

    const applyPreset = (option: ThemePanelPresetOption) => {
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

    const rootClass = ["theme-panel", compact && "compact", className]
      .filter(Boolean)
      .join(" ");

    return (
      <div ref={ref} className={rootClass} {...rest}>
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

        {sections.includes("presets") && resolvedPresetOptions.length > 0 && (
          <div className="theme-panel-row">
            <div className="theme-panel-label">
              <span>主题预设</span>
              <span>{modeValue}</span>
            </div>
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
          <Button type="button" variant="ghost" size="sm" icon="reload" block onClick={theme.reset}>
            重置主题
          </Button>
        )}
      </div>
    );
  }
);
ThemePanel.displayName = "ThemePanel";
