import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Empty.css";
import * as React from "react";

export interface EmptyProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "children"> {
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
export const Empty = React.forwardRef<HTMLDivElement, EmptyProps>(({
  title = "暂无内容",
  description,
  icon,
  action,
  size = "md",
  variant = "default",
  className = "",
  ...rest
}, ref) => (
  <div ref={ref} className={`empty ${size} ${variant} ${className}`} {...rest}>
    {icon && <div className="empty-ico">{icon}</div>}
    <div className="empty-title">{title}</div>
    {description && <div className="empty-desc">{description}</div>}
    {action && <div className="empty-action">{action}</div>}
  </div>
));
Empty.displayName = "Empty";

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: number;
  tone?: "accent" | "success" | "warning" | "danger" | "current";
  /** Text rendered next to the spinner. */
  label?: React.ReactNode;
  /** `ring` is the default border spinner; `dots` is a three-dot bounce. */
  variant?: "ring" | "dots";
  className?: string;
}

/** `Spinner` — loading indicator. */
export const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(({
  size = 20,
  tone = "accent",
  label,
  variant = "ring",
  className = "",
  style,
  ...rest
}, ref) => {
  const cls = `spinner ${variant} ${tone} ${className}`.trim();
  const spinnerStyle =
    variant === "dots"
      ? ({ fontSize: size, ...style } as React.CSSProperties)
      : ({ width: size, height: size, ...style } as React.CSSProperties);
  const spinner =
    variant === "dots" ? (
      <span className={cls} style={spinnerStyle} aria-label="Loading">
        <i /><i /><i />
      </span>
    ) : (
      <span
        className={cls}
        style={spinnerStyle}
        aria-label="Loading"
      />
    );
  if (!label) {
    return React.cloneElement(spinner, {
      ref,
      ...rest,
    });
  }
  return (
    <span ref={ref} className="spinner-wrap" style={style} {...rest}>
      {spinner}
      <span className="spinner-label">{label}</span>
    </span>
  );
});
Spinner.displayName = "Spinner";

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

export interface SkeletonProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
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
export const Skeleton = React.forwardRef<HTMLElement, SkeletonProps>(({
  width = "100%",
  height = 16,
  circle,
  animation = "wave",
  avatar,
  title,
  paragraph,
  className = "",
  style,
  ...rest
}, ref) => {
  const composite = avatar != null || title != null || paragraph != null;

  if (!composite) {
    return (
      <span
        ref={ref as React.ForwardedRef<HTMLSpanElement>}
        className={`skeleton ${animation} ${circle ? "circle" : ""} ${className}`.trim()}
        style={{ width, height, borderRadius: circle ? "50%" : undefined, ...style }}
        {...rest}
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
    <div
      ref={ref as React.ForwardedRef<HTMLDivElement>}
      className={`skeleton-box ${className}`.trim()}
      style={style as React.CSSProperties | undefined}
      {...rest}
    >
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
});
Skeleton.displayName = "Skeleton";
