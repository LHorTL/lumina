import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Skeleton.css";
import * as React from "react";

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
  width?: number | string;
  height?: number | string;
  circle?: boolean;
  /** `wave` is a shimmer sweep; `pulse` fades opacity; `none` disables animation. */
  animation?: "wave" | "pulse" | "none";
  avatar?: boolean | SkeletonAvatarConfig;
  title?: boolean | SkeletonTitleConfig;
  paragraph?: boolean | SkeletonParagraphConfig;
  className?: string;
}

const AVATAR_SIZE_PX = { sm: 32, md: 40, lg: 56 } as const;

/**
 * `Skeleton` — content placeholder during loading.
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

  const avatarPx = avatarCfg != null ? AVATAR_SIZE_PX[avatarCfg.size ?? "md"] : 0;
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
