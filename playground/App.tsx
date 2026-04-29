import * as React from "react";
import {
  TitleBar,
  MessageContainer,
  Icon,
  Input,
  Tooltip,
  ThemePanel,
  ThemeProvider,
  useTheme,
  type AccentKey,
  type DensityMode,
  type FontKey,
  type ThemePreset,
  type ThemePresets,
  type ThemeMode,
  type ThemePanelCreateThemePayload,
  type ThemePanelDeleteThemePayload,
} from "lumina";
import { SECTIONS, NAV, DEFAULT_SECTION_ID } from "./sections/_registry";
import { useHashRoute } from "./router";
import { AnchorNav, type AnchorItem } from "./docs";
import "./playground.css";

const BUILT_IN_CUSTOM_THEME_PRESETS = {
  graphite: {
    label: "石墨",
    description: "冷暗",
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
  porcelain: {
    label: "瓷白",
    description: "清亮",
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
      "shadow-scale": "1",
      "shadow-float-scale": "1",
    },
  },
  assistant: {
    label: "助手",
    description: "Soft",
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
      "shadow-scale": "1",
      "shadow-float-scale": "1",
    },
  },
  assistantDark: {
    label: "助手暗",
    description: "Soft",
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
      "shadow-scale": "1",
      "shadow-float-scale": "1",
    },
  },
  ember: {
    label: "余烬",
    description: "暖暗",
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
} satisfies ThemePresets;

const USER_THEME_STORAGE_KEY = "lumina:user-themes";

interface StoredUserTheme {
  label: string;
  tone: string;
  preset: ThemePreset;
  createdAt: number;
}

type StoredUserThemes = Record<string, StoredUserTheme>;

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
  Object.fromEntries(
    Object.entries(loadStoredUserThemes()).map(([key, value]) => [
      key,
      {
        ...value.preset,
        label: value.preset.label ?? value.label,
        description: value.preset.description ?? value.tone,
      },
    ])
  ) as ThemePresets;

const getInitialThemePresets = (): ThemePresets => ({
  ...BUILT_IN_CUSTOM_THEME_PRESETS,
  ...getStoredUserThemePresets(),
});

const persistCreatedTheme = (payload: ThemePanelCreateThemePayload): void => {
  const stored = loadStoredUserThemes();
  const key = String(payload.key);
  persistStoredUserThemes({
    ...stored,
    [key]: {
      label: payload.label,
      tone: payload.description,
      preset: payload.preset,
      createdAt: Date.now(),
    },
  });
};

const deleteStoredUserTheme = (payload: ThemePanelDeleteThemePayload): void => {
  const stored = loadStoredUserThemes();
  const key = String(payload.key);
  if (!(key in stored)) return;
  const { [key]: _removed, ...next } = stored;
  persistStoredUserThemes(next);
};

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
                boxShadow: "var(--neu-shadow-subtle)",
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
/* TweaksPanel — the playground now uses the real ThemePanel component */
/* ------------------------------------------------------------------ */

const TweaksPanel: React.FC = () => (
  <div className="tweaks-panel">
    <ThemePanel
      className="tweaks-theme-panel"
      title="Tweaks"
      description="实时调整设计参数 · 驱动 useTheme()"
      createThemeKeyPrefix="user"
      onCreateTheme={persistCreatedTheme}
      onDeleteTheme={deleteStoredUserTheme}
    />
  </div>
);
