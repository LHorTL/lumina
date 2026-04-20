import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Input.css";
import * as React from "react";
import { Icon, type IconName } from "../Icon";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "onChange" | "prefix"> {
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
  /** Show a × button inside the input to clear the value when non-empty. */
  allowClear?: boolean;
  /** Max length — forwarded to the native input. */
  maxLength?: number;
  /** Render a "N / max" counter beneath the input (or just "N" if no maxLength). */
  showCount?: boolean;
  /** Inline content rendered inside the input on the left (after leadingIcon if both present). */
  prefix?: React.ReactNode;
  /** Inline content rendered inside the input on the right (before trailingIcon if both present). */
  suffix?: React.ReactNode;
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
      allowClear,
      maxLength,
      showCount,
      prefix,
      suffix,
      className = "",
      ...rest
    },
    ref
  ) => {
    const [inner, setInner] = React.useState(defaultValue ?? "");
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : inner;

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setInner(e.target.value);
      onChange?.(e.target.value, e);
    };

    const handleClear = (e: React.MouseEvent<HTMLSpanElement>) => {
      e.stopPropagation();
      if (disabled) return;
      if (!isControlled) setInner("");
      const synthetic = {
        ...e,
        target: { ...(e.target as unknown as HTMLInputElement), value: "" },
        currentTarget: { ...(e.currentTarget as unknown as HTMLInputElement), value: "" },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      onChange?.("", synthetic);
    };

    const showClear = !!allowClear && !!currentValue && !disabled;
    const count = currentValue ? currentValue.length : 0;

    const inputElement = (
      <div className={wrapCls}>
        {leadingIcon && (
          <Icon
            name={leadingIcon}
            size={14}
            className={`lead${onLeadingIconClick ? " interactive" : ""}`}
            onClick={handleIconClick(onLeadingIconClick)}
          />
        )}
        {prefix && <span className="input-affix prefix">{prefix}</span>}
        <input
          ref={ref}
          className="input"
          value={isControlled ? value : undefined}
          defaultValue={isControlled ? undefined : defaultValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          {...rest}
        />
        {suffix && <span className="input-affix suffix">{suffix}</span>}
        {showClear && (
          <span
            className="input-clear"
            role="button"
            aria-label="Clear"
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleClear}
          >
            <Icon name="x" size={12} />
          </span>
        )}
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

    if (!showCount) return inputElement;

    return (
      <div className="input-shell">
        {inputElement}
        <div className="input-count">
          {maxLength != null ? `${count} / ${maxLength}` : `${count}`}
        </div>
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
  /** Show a × button in the top-right corner to clear the value. */
  allowClear?: boolean;
  /** Max length — forwarded to the native textarea. */
  maxLength?: number;
  /** Render a "N / max" counter beneath the textarea. */
  showCount?: boolean;
  className?: string;
}

/**
 * `Textarea` — multi-line text input with the same neumorphic groove as `Input`.
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      invalid,
      allowClear,
      maxLength,
      showCount,
      className = "",
      ...rest
    },
    ref
  ) => {
    const [inner, setInner] = React.useState(defaultValue ?? "");
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : inner;
    const disabled = rest.disabled;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!isControlled) setInner(e.target.value);
      onChange?.(e.target.value, e);
    };

    const handleClear = (e: React.MouseEvent<HTMLSpanElement>) => {
      e.stopPropagation();
      if (disabled) return;
      if (!isControlled) setInner("");
      const synthetic = {
        ...e,
        target: { ...(e.target as unknown as HTMLTextAreaElement), value: "" },
        currentTarget: { ...(e.currentTarget as unknown as HTMLTextAreaElement), value: "" },
      } as unknown as React.ChangeEvent<HTMLTextAreaElement>;
      onChange?.("", synthetic);
    };

    const cls = ["textarea", invalid && "invalid", className].filter(Boolean).join(" ");
    const showClear = !!allowClear && !!currentValue && !disabled;
    const count = currentValue ? currentValue.length : 0;

    const field = (
      <div className="textarea-wrap">
        <textarea
          ref={ref}
          className={cls}
          value={isControlled ? value : undefined}
          defaultValue={isControlled ? undefined : defaultValue}
          onChange={handleChange}
          maxLength={maxLength}
          {...rest}
        />
        {showClear && (
          <span
            className="textarea-clear"
            role="button"
            aria-label="Clear"
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleClear}
          >
            <Icon name="x" size={12} />
          </span>
        )}
      </div>
    );

    if (!showCount) return field;

    return (
      <div className="input-shell">
        {field}
        <div className="input-count">
          {maxLength != null ? `${count} / ${maxLength}` : `${count}`}
        </div>
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
