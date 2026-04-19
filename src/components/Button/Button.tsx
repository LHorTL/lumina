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
  /** Show spinner + disable interaction. */
  loading?: boolean;
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
      loading,
      disabled,
      className = "",
      type = "button",
      ...rest
    },
    ref
  ) => {
    const cls = [
      "btn",
      variant,
      size !== "md" && size,
      loading && "loading",
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
        {...rest}
      >
        {loading ? (
          <span className="spinner" aria-hidden />
        ) : icon ? (
          <Icon name={icon} size={15} />
        ) : null}
        {children}
        {trailingIcon && <Icon name={trailingIcon} size={15} />}
      </button>
    );
  }
);
Button.displayName = "Button";

export interface IconButtonProps
  extends Omit<ButtonProps, "icon" | "children"> {
  icon: IconName;
  tip?: string;
  "aria-label"?: string;
}

/**
 * `IconButton` — square button containing just an icon. Pair with a tooltip.
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, tip, className = "", ...rest }, ref) => (
    <Button
      ref={ref}
      className={`icon ${className}`}
      aria-label={tip || rest["aria-label"] || icon}
      title={tip}
      {...rest}
    >
      <Icon name={icon} size={16} />
    </Button>
  )
);
IconButton.displayName = "IconButton";
