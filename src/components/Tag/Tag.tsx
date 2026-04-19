import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Tag.css";
import * as React from "react";
import { Icon } from "../Icon";

export type TagTone = "neutral" | "accent" | "info" | "success" | "warning" | "danger";

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: TagTone;
  solid?: boolean;
  /** Render a leading colored dot. */
  dot?: boolean;
  /** Show a close button. */
  removable?: boolean;
  onRemove?: () => void;
  children?: React.ReactNode;
}

/** `Tag` — small label/pill. */
export const Tag: React.FC<TagProps> = ({
  tone = "neutral",
  solid,
  dot,
  removable,
  onRemove,
  className = "",
  children,
  ...rest
}) => {
  const cls = ["tag", tone, solid && "solid", className].filter(Boolean).join(" ");
  return (
    <span className={cls} {...rest}>
      {dot && <span className="dot" />}
      {children}
      {removable && (
        <span
          className="x"
          role="button"
          aria-label="Remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
        >
          <Icon name="x" size={11} />
        </span>
      )}
    </span>
  );
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Numeric count — renders as "99+" if > 99. */
  count?: number;
  /** Show a tiny dot instead of a number. */
  dot?: boolean;
  tone?: TagTone;
  children?: React.ReactNode;
}

/** `Badge` — notification dot / count. Wrap around another element. */
export const Badge: React.FC<BadgeProps> = ({
  count,
  dot,
  tone = "danger",
  children,
  className = "",
  ...rest
}) => {
  const show = dot || (typeof count === "number" && count > 0);
  return (
    <span className={`badge-wrap ${className}`} {...rest}>
      {children}
      {show && (
        <span className={`badge ${tone} ${dot ? "dot" : ""}`}>
          {!dot && (count! > 99 ? "99+" : count)}
        </span>
      )}
    </span>
  );
};
