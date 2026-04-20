import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Empty.css";
import * as React from "react";

export interface EmptyProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  /** `subtle` drops the recessed icon well — good for inline / embedded use. */
  variant?: "default" | "subtle";
  className?: string;
}

/** `Empty` — empty state placeholder. */
export const Empty: React.FC<EmptyProps> = ({
  title = "暂无内容",
  description,
  icon,
  action,
  size = "md",
  variant = "default",
  className = "",
}) => (
  <div className={`empty ${size} ${variant} ${className}`}>
    {icon && <div className="empty-ico">{icon}</div>}
    <div className="empty-title">{title}</div>
    {description && <div className="empty-desc">{description}</div>}
    {action && <div className="empty-action">{action}</div>}
  </div>
);

export interface SpinnerProps {
  size?: number;
  tone?: "accent" | "success" | "warning" | "danger" | "current";
  /** Text rendered next to the spinner. */
  label?: React.ReactNode;
  /** `ring` is the default border spinner; `dots` is a three-dot bounce. */
  variant?: "ring" | "dots";
  className?: string;
}

/** `Spinner` — loading indicator. */
export const Spinner: React.FC<SpinnerProps> = ({
  size = 20,
  tone = "accent",
  label,
  variant = "ring",
  className = "",
}) => {
  const cls = `spinner ${variant} ${tone} ${className}`.trim();
  const spinner =
    variant === "dots" ? (
      <span className={cls} style={{ fontSize: size }} aria-label="Loading">
        <i /><i /><i />
      </span>
    ) : (
      <span
        className={cls}
        style={{ width: size, height: size }}
        aria-label="Loading"
      />
    );
  if (!label) return spinner;
  return (
    <span className="spinner-wrap">
      {spinner}
      <span className="spinner-label">{label}</span>
    </span>
  );
};

export interface SkeletonAvatarConfig {
  shape?: "circle" | "square";
  size?: "sm" | "md" | "lg";
}

export interface SkeletonTitleConfig {
  width?: number | string;
}

export interface SkeletonParagraphConfig {
  rows?: number;
  width?: (number | string)[];
}

export interface SkeletonProps {
  /* -------- primitive mode -------- */
  width?: number | string;
  height?: number | string;
  circle?: boolean;
  /** `wave` is a shimmer sweep; `pulse` fades opacity; `none` disables animation. */
  animation?: "wave" | "pulse" | "none";

  /* -------- composite mode -------- */
  /**
   * Render an avatar skeleton on the left. `true` gives the defaults (circle, md).
   * @example avatar
   * @example avatar={{ shape: "square", size: "lg" }}
   */
  avatar?: boolean | SkeletonAvatarConfig;
  /**
   * Render a title line skeleton. Defaults to `true` whenever the composite layout is active
   * (any of `avatar` / `paragraph` / `title` is set).
   */
  title?: boolean | SkeletonTitleConfig;
  /**
   * Render N paragraph lines. `true` gives 3 rows; passing `width` arrays lets you
   * control per-row widths (last row defaults to 60%).
   */
  paragraph?: boolean | SkeletonParagraphConfig;

  className?: string;
}

const AVATAR_SIZE_PX = { sm: 32, md: 40, lg: 56 } as const;

/**
 * `Skeleton` — content placeholder during loading.
 *
 * Two modes:
 * - **Primitive** (no composite prop set): renders a single block using `width` / `height` / `circle`.
 * - **Composite** (`avatar` / `title` / `paragraph`): renders the Ant-Design-style avatar + title + paragraph layout.
 *
 * @example
 * // primitive
 * <Skeleton height={14} width="60%" />
 * @example
 * // composite
 * <Skeleton avatar title paragraph={{ rows: 4 }} />
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 16,
  circle,
  animation = "wave",
  avatar,
  title,
  paragraph,
  className = "",
}) => {
  const composite = avatar != null || title != null || paragraph != null;

  if (!composite) {
    return (
      <span
        className={`skeleton ${animation} ${circle ? "circle" : ""} ${className}`.trim()}
        style={{ width, height, borderRadius: circle ? "50%" : undefined }}
      />
    );
  }

  // --- composite mode ---
  const avatarCfg: SkeletonAvatarConfig | null =
    avatar === true ? {} : avatar === false || avatar == null ? null : avatar;
  const titleCfg: SkeletonTitleConfig | null =
    title === false ? null : title === true || title == null ? {} : title;
  const paragraphCfg: SkeletonParagraphConfig | null =
    paragraph === false ? null : paragraph === true || paragraph == null ? {} : paragraph;

  const rows = paragraphCfg?.rows ?? 3;
  const rowWidths = paragraphCfg?.width ?? [];
  const resolveRowWidth = (idx: number): number | string => {
    if (idx < rowWidths.length) return rowWidths[idx];
    if (idx === rows - 1) return "60%";
    return "100%";
  };

  const avatarPx =
    avatarCfg != null ? AVATAR_SIZE_PX[avatarCfg.size ?? "md"] : 0;
  const avatarShape = avatarCfg?.shape ?? "circle";

  return (
    <div className={`skeleton-box ${className}`.trim()}>
      {avatarCfg && (
        <span
          className={`skeleton ${animation} ${avatarShape === "circle" ? "circle" : ""} skeleton-avatar`.trim()}
          style={{
            width: avatarPx,
            height: avatarPx,
            borderRadius: avatarShape === "circle" ? "50%" : undefined,
            flexShrink: 0,
          }}
        />
      )}
      <div className="skeleton-content">
        {titleCfg && (
          <span
            className={`skeleton ${animation} skeleton-title`.trim()}
            style={{ width: titleCfg.width ?? "38%", height: 16 }}
          />
        )}
        {paragraphCfg &&
          Array.from({ length: rows }).map((_, i) => (
            <span
              key={i}
              className={`skeleton ${animation} skeleton-row`.trim()}
              style={{ width: resolveRowWidth(i), height: 12 }}
            />
          ))}
      </div>
    </div>
  );
};
