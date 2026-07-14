import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Avatar.css";
import * as React from "react";
import { withComponentTheme, type ComponentThemeProps } from "../Theme/ComponentTheme";

export interface AvatarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    ComponentThemeProps {
  src?: string;
  /** 主图片失败后的备用图片地址。 */
  fallbackSrc?: string;
  alt?: string;
  /** Initials if no image. Auto-derived from `alt` if omitted. */
  initials?: string;
  size?: number | "sm" | "md" | "lg" | "xl";
  /** Shape — circular (default) or rounded-square. */
  shape?: "circle" | "square";
  /** Status dot. */
  status?: "online" | "busy" | "away" | "offline";
  /** 图片最终加载失败时触发。 */
  onImageError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
}

/** 头像状态对应的中文可访问文本。 */
const AVATAR_STATUS_LABELS: Record<NonNullable<AvatarProps["status"]>, string> = {
  online: "在线",
  busy: "忙碌",
  away: "离开",
  offline: "离线",
};

/** `Avatar` — user image or initials chip. */
const AvatarBase = React.forwardRef<HTMLDivElement, AvatarProps>(({
  src,
  fallbackSrc,
  alt = "",
  initials,
  size = "md",
  shape = "circle",
  status,
  onImageError,
  className = "",
  style,
  ...rest
}, ref) => {
  const [useFallback, setUseFallback] = React.useState(false);
  const [imageFailed, setImageFailed] = React.useState(false);
  React.useEffect(() => {
    setUseFallback(false);
    setImageFailed(false);
  }, [fallbackSrc, src]);
  const sizeCls = typeof size === "string" && size !== "md" ? size : "";
  const shapeCls = shape === "square" ? "square" : "";
  const customStyle: React.CSSProperties =
    typeof size === "number" ? { ["--size" as never]: `${size}px`, ...style } : style ?? {};
  const shown = initials ?? alt.slice(0, 2).toUpperCase();
  const activeSrc = imageFailed ? undefined : useFallback ? fallbackSrc : src;
  return (
    <div
      ref={ref}
      className={`avatar ${sizeCls} ${shapeCls} ${className}`.trim().replace(/\s+/g, " ")}
      style={customStyle}
      {...rest}
    >
      {activeSrc ? (
        <img
          src={activeSrc}
          alt={alt}
          onError={(event) => {
            if (!useFallback && fallbackSrc && fallbackSrc !== src) {
              setUseFallback(true);
              return;
            }
            setImageFailed(true);
            onImageError?.(event);
          }}
        />
      ) : <span>{shown}</span>}
      {status && (
        <>
          <span className={`avatar-status ${status}`} aria-hidden="true" />
          <span className="avatar-status-label">{AVATAR_STATUS_LABELS[status]}</span>
        </>
      )}
    </div>
  );
});
AvatarBase.displayName = "Avatar";

export const Avatar = withComponentTheme(AvatarBase, "Avatar", "avatar");
