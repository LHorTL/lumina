import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Input.css";
import * as React from "react";
import { Icon, type IconName } from "../Icon";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "onChange"> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  /** Click handler for the leading icon (stops propagation so the input isn't focused). */
  onLeadingIconClick?: (e: React.MouseEvent<SVGSVGElement>) => void;
  /** Click handler for the trailing icon — e.g. password visibility toggle. */
  onTrailingIconClick?: (e: React.MouseEvent<SVGSVGElement>) => void;
  size?: "sm" | "md" | "lg";
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * `Input` — single-line text field with optional leading/trailing icons.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      placeholder,
      leadingIcon,
      trailingIcon,
      onLeadingIconClick,
      onTrailingIconClick,
      size = "md",
      invalid,
      disabled,
      className = "",
      ...rest
    },
    ref
  ) => {
    const wrapCls = [
      "input-wrap",
      size !== "md" && size,
      invalid && "invalid",
      disabled && "disabled",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const handleIconClick = (
      handler: ((e: React.MouseEvent<SVGSVGElement>) => void) | undefined
    ) =>
      handler
        ? (e: React.MouseEvent<SVGSVGElement>) => {
            e.stopPropagation();
            if (!disabled) handler(e);
          }
        : undefined;

    return (
      <div className={wrapCls}>
        {leadingIcon && (
          <Icon
            name={leadingIcon}
            size={14}
            className={`lead${onLeadingIconClick ? " interactive" : ""}`}
            onClick={handleIconClick(onLeadingIconClick)}
          />
        )}
        <input
          ref={ref}
          className="input"
          value={value}
          defaultValue={defaultValue}
          onChange={(e) => onChange?.(e.target.value, e)}
          placeholder={placeholder}
          disabled={disabled}
          {...rest}
        />
        {trailingIcon && (
          <Icon
            name={trailingIcon}
            size={14}
            className={`trail${onTrailingIconClick ? " interactive" : ""}`}
            onClick={handleIconClick(onTrailingIconClick)}
          />
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  invalid?: boolean;
  className?: string;
}

/**
 * `Textarea` — multi-line text input with the same neumorphic groove as `Input`.
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ value, defaultValue, onChange, invalid, className = "", ...rest }, ref) => {
    const cls = ["textarea", invalid && "invalid", className].filter(Boolean).join(" ");
    return (
      <textarea
        ref={ref}
        className={cls}
        value={value}
        defaultValue={defaultValue}
        onChange={(e) => onChange?.(e.target.value, e)}
        {...rest}
      />
    );
  }
);
Textarea.displayName = "Textarea";
