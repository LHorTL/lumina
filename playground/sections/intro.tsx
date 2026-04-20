import * as React from "react";
import { Button, Card } from "lumina";
import { defineSection, type SectionCtx } from "./_types";

const SectionIntro: React.FC<SectionCtx> = ({ go, setTweak, openTweaks }) => {
  const palette = ["sky", "coral", "mint", "violet", "amber", "rose"];
  return (
    <div>
      <div className="intro-grid">
        <div className="intro-card">
          <div className="showcase-label">拟态 · NEUMORPHIC UI</div>
          <h1>
            为 Electron 应用<br />定制的触感视觉系统
          </h1>
          <p>
            用凸起关系替代边框,用柔和阴影替代分隔线。30+ 组件 · 6 种强调色 · 三档密度 ·
            全部由 CSS 变量驱动,运行时可改。
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <Button variant="primary" trailingIcon="arrowRight" onClick={() => go("button")}>
              浏览组件
            </Button>
            <Button icon="sliders" onClick={openTweaks}>
              打开 Tweaks
            </Button>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>强调色</div>
            <div className="swatch-row">
              {palette.map((p) => (
                <button
                  key={p}
                  className="swatch"
                  style={{
                    background: {
                      sky: "oklch(68% 0.14 235)",
                      coral: "oklch(72% 0.16 35)",
                      mint: "oklch(72% 0.13 165)",
                      violet: "oklch(66% 0.16 290)",
                      amber: "oklch(76% 0.14 75)",
                      rose: "oklch(68% 0.17 10)",
                    }[p],
                  }}
                  onClick={() => setTweak("accent", p)}
                  aria-label={p}
                />
              ))}
            </div>
          </Card>
          <div className="stat-grid">
            <div className="stat">
              <div className="v">30+</div>
              <div className="l">组件</div>
            </div>
            <div className="stat">
              <div className="v">6</div>
              <div className="l">强调色</div>
            </div>
            <div className="stat">
              <div className="v">3</div>
              <div className="l">密度</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default defineSection({
  id: "intro",
  group: "起步",
  order: 10,
  label: "开始",
  eyebrow: "OVERVIEW",
  title: "Lumina",
  desc: "为 Electron 应用定制的拟态风格 React 组件库。",
  Component: SectionIntro,
});
