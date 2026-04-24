import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Tag.css";
import * as React from "react";
import { Icon, type IconName } from "../Icon";

export type TagTone = "neutral" | "accent" | "info" | "success" | "warning" | "danger";

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: TagTone;
  solid?: boolean;
  /** Render a leading colored dot. */
  dot?: boolean;
  /** Leading icon (uses the built-in `Icon` component). */
  icon?: IconName;
  /** Show a close button. */
  removable?: boolean;
  onRemove?: () => void;
  /** Whether to render the tag outline/flat shadow. Defaults to `true`. */
  bordered?: boolean;
  children?: React.ReactNode;
}

/** `Tag` — small label/pill. */
export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(({
  tone = "neutral",
  solid,
  dot,
  icon,
  removable,
  onRemove,
  bordered = true,
  className = "",
  children,
  ...rest
}, ref) => {
  const cls = [
    "tag",
    tone,
    solid && "solid",
    !bordered && !solid && "borderless",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <span ref={ref} className={cls} {...rest}>
      {dot && <span className="dot" />}
      {icon && <Icon name={icon} size={11} className="tag-ico" />}
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
});
Tag.displayName = "Tag";
