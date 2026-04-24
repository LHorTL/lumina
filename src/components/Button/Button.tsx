import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Button.css";
import * as React from "react";
import type { IconName } from "../Icon";
import { Icon } from "../Icon";

export type ButtonVariant = "default" | "primary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  /** Visual variant. `primary` uses the accent color; `ghost` is borderless; `danger` is red. */
  variant?: ButtonVariant;
  /** Control height preset. */
  size?: ButtonSize;
  /** Leading icon. */
  icon?: IconName;
  /** Trailing icon. */
  trailingIcon?: IconName;
  /** Render as a square icon-only button. Automatically enabled when `icon` is set and no children are provided. */
  iconOnly?: boolean;
  /** Native tooltip/title for compact icon-only buttons. */
  tip?: string;
  /** Show spinner + disable interaction. */
  loading?: boolean;
  /** Make the button fill the container's width. */
  block?: boolean;
  /** Button type attribute. Defaults to "button" to avoid accidental form submits. */
  type?: "button" | "submit" | "reset";
  /** Extra class names. */
  className?: string;
  children?: React.ReactNode;
}

/**
 * `Button` — the primary action surface.
 *
 * @example
 * <Button variant="primary" icon="plus">新建</Button>
 * <Button variant="ghost" loading>保存</Button>
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "default",
      size = "md",
      icon,
      trailingIcon,
      iconOnly,
      tip,
      loading,
      block,
      disabled,
      className = "",
      type = "button",
      "aria-label": ariaLabel,
      ...rest
    },
    ref
  ) => {
    const onlyIcon = iconOnly || (!!icon && children == null);
    const content = onlyIcon ? null : children;
    const cls = [
      "btn",
      variant,
      size !== "md" && size,
      onlyIcon && "icon",
      loading && "loading",
      block && "block",
      disabled && "disabled",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        type={type}
        className={cls}
        disabled={disabled || loading}
        title={tip}
        aria-label={ariaLabel ?? (onlyIcon ? tip ?? icon : undefined)}
        {...rest}
      >
        {loading ? (
          <span className="spinner" aria-hidden />
        ) : icon ? (
          <Icon name={icon} size={15} />
        ) : null}
        {content}
        {trailingIcon && <Icon name={trailingIcon} size={15} />}
      </button>
    );
  }
);
Button.displayName = "Button";
