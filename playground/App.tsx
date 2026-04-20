import * as React from "react";
import {
  TitleBar,
  ToastContainer,
  Icon,
  Slider,
  Tooltip,
  ThemeProvider,
  useTheme,
  ACCENT_PRESETS,
  type AccentKey,
  type DensityMode,
  type FontKey,
  type ThemeMode,
} from "lumina";
import { SECTIONS, NAV, DEFAULT_SECTION_ID } from "./sections/_registry";
import { useHashRoute } from "./router";
import { AnchorNav, type AnchorItem } from "./docs";
import "./playground.css";

/* ------------------------------------------------------------------ */
/* App — wraps everything in <ThemeProvider>                           */
/* ------------------------------------------------------------------ */

export const App: React.FC = () => (
  <ThemeProvider
    mode="light"
    accent="rose"
    density="comfortable"
    intensity={5}
    radius={22}
    font="sf"
    storageKey="lumina:theme"
  >
    <AppInner />
  </ThemeProvider>
);

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
            <Tooltip content={`切换 ${theme.resolvedMode === "light" ? "深色" : "浅色"} 模式`}>
              <button className="pg-chip" onClick={theme.toggleMode}>
                <Icon name={theme.resolvedMode === "light" ? "moon" : "sun"} size={14} />
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
            <span className="search-icon">
              <Icon name="search" size={14} />
            </span>
            <input
              placeholder="搜索组件..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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

      <ToastContainer />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* TweaksPanel — fully driven by useTheme                              */
/* ------------------------------------------------------------------ */

const TweaksPanel: React.FC = () => {
  const t = useTheme();

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
          <button className={`pill ${t.mode === "light" ? "active" : ""}`} onClick={() => t.setMode("light")}>
            <Icon name="sun" size={12} /> 浅色
          </button>
          <button className={`pill ${t.mode === "dark" ? "active" : ""}`} onClick={() => t.setMode("dark")}>
            <Icon name="moon" size={12} /> 深色
          </button>
          <button className={`pill ${t.mode === "system" ? "active" : ""}`} onClick={() => t.setMode("system")}>
            跟随系统
          </button>
        </div>
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
