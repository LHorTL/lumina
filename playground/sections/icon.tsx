import * as React from "react";
import { Icon, message } from "lumina";
import { DocPage } from "../docs";
import { Row } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

const ICON_NAMES = [
  "search", "plus", "minus", "check", "x", "chevDown", "chevRight", "chevLeft", "chevUp",
  "arrowRight", "settings", "user", "bell", "mail", "heart", "star", "home", "folder",
  "file", "image", "play", "pause", "volume", "trash", "edit", "copy", "download", "upload",
  "info", "alert", "check2", "eye", "eyeOff", "sparkle", "moon", "sun", "palette", "layers",
  "grid", "list", "zap", "filter", "mic", "send", "calendar", "clock", "menu", "more", "sliders",
] as const;

const SectionIcon: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={
      <>
        <p>统一的图标集,所有图标继承当前文字颜色。共 {ICON_NAMES.length} 枚。</p>
      </>
    }
    demos={[
      {
        id: "basic",
        title: "基础用法",
        description: "通过 name 指定图标,size 控制尺寸,stroke 控制描边粗细。",
        code: `<Icon name="search" size={16} />
<Icon name="heart" size={20} stroke={1.5} />`,
        render: () => (
          <Row>
            <Icon name="search" size={16} />
            <Icon name="heart" size={20} stroke={1.5} />
            <Icon name="star" size={24} />
            <Icon name="bell" size={28} stroke={2.5} />
          </Row>
        ),
      },
      {
        id: "all",
        title: "全部图标",
        span: 2,
        description: "点击图标可复制名称。",
        render: () => (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
              gap: 6,
            }}
          >
            {ICON_NAMES.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(n);
                  message.success(`已复制 "${n}"`);
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  padding: 10,
                  border: "none",
                  background: "transparent",
                  borderRadius: 10,
                  cursor: "pointer",
                  color: "var(--fg-muted)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--bg)";
                  e.currentTarget.style.boxShadow = "var(--neu-shadow-subtle)";
                  e.currentTarget.style.color = "var(--accent-ink)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.color = "var(--fg-muted)";
                }}
              >
                <Icon name={n} size={18} />
                <span>{n}</span>
              </button>
            ))}
          </div>
        ),
      },
    ]}
    api={[
      {
        title: "Icon",
        rows: [
          { prop: "name", description: "图标名", type: "IconName", required: true },
          { prop: "size", description: "尺寸 (px)", type: "number", default: "16" },
          { prop: "stroke", description: "描边粗细", type: "number", default: "2" },
        ],
      },
    ]}
  />
);

export default defineSection({
  id: "icon",
  group: "通用",
  order: 20,
  label: "Icon 图标",
  eyebrow: "GENERAL",
  title: "Icon 图标",
  desc: "线性图标集,继承当前文字颜色,可调整尺寸与描边。",
  Component: SectionIcon,
});
