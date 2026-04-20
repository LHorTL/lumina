import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Avatar.css";
import * as React from "react";

export interface AvatarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  src?: string;
  alt?: string;
  /** Initials if no image. Auto-derived from `alt` if omitted. */
  initials?: string;
  size?: number | "sm" | "md" | "lg" | "xl";
  /** Shape — circular (default) or rounded-square. */
  shape?: "circle" | "square";
  /** Status dot. */
  status?: "online" | "busy" | "away" | "offline";
}

/** `Avatar` — user image or initials chip. */
export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "",
  initials,
  size = "md",
  shape = "circle",
  status,
  className = "",
  style,
  ...rest
}) => {
  const sizeCls = typeof size === "string" && size !== "md" ? size : "";
  const shapeCls = shape === "square" ? "square" : "";
  const customStyle: React.CSSProperties =
    typeof size === "number" ? { ["--size" as never]: `${size}px`, ...style } : style ?? {};
  const shown = initials ?? alt.slice(0, 2).toUpperCase();
  return (
    <div
      className={`avatar ${sizeCls} ${shapeCls} ${className}`.trim().replace(/\s+/g, " ")}
      style={customStyle}
      {...rest}
    >
      {src ? <img src={src} alt={alt} /> : <span>{shown}</span>}
      {status && <span className={`avatar-status ${status}`} />}
    </div>
  );
};
