import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Input.css";
import * as React from "react";
import { Icon, isIconName, renderIconSlot, type IconSlot } from "../Icon";
import { Textarea, type TextareaProps } from "../Textarea";

export interface InputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "size" | "onChange" | "prefix" | "value" | "defaultValue"
  > {
  value?: string;
  defaultValue?: string;
  /** Native input change event. */
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  /** Convenience value callback for Lumina-style code. */
  onValueChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  leadingIcon?: IconSlot;
  trailingIcon?: IconSlot;
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

export interface InputPasswordProps
  extends Omit<InputProps, "type" | "trailingIcon" | "onTrailingIconClick"> {
  /** Show the eye toggle. Default true. */
  visibilityToggle?: boolean;
  /** Customize the visibility icon. */
  iconRender?: (visible: boolean) => React.ReactNode;
}

export type InputComponent =
  React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>> & {
    Password: React.ForwardRefExoticComponent<InputPasswordProps & React.RefAttributes<HTMLInputElement>>;
    TextArea: typeof Textarea;
  };

/**
 * `Input` — single-line text field with optional leading/trailing icons.
 */
const InputBase = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      onValueChange,
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
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : inner;

    const setInputRef = React.useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref]
    );

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

    const renderAffixIcon = (
      icon: IconSlot,
      side: "lead" | "trail",
      handler: ((e: React.MouseEvent<SVGSVGElement>) => void) | undefined
    ) => {
      if (icon == null || icon === false) return null;
      const className = `${side}${handler ? " interactive" : ""}`;
      if (isIconName(icon)) {
        return (
          <Icon
            name={icon}
            size={14}
            className={className}
            onClick={handleIconClick(handler)}
          />
        );
      }
      return (
        <span
          className={className}
          onClick={
            handler
              ? (e) => {
                  e.stopPropagation();
                  if (!disabled) handler(e as unknown as React.MouseEvent<SVGSVGElement>);
                }
              : undefined
          }
        >
          {renderIconSlot(icon)}
        </span>
      );
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setInner(e.target.value);
      onChange?.(e);
      onValueChange?.(e.target.value, e);
    };

    const handleClear = (e: React.MouseEvent<HTMLSpanElement>) => {
      e.stopPropagation();
      if (disabled) return;
      if (!isControlled) setInner("");
      if (inputRef.current) inputRef.current.value = "";
      const synthetic = {
        ...e,
        target: inputRef.current ?? { value: "" },
        currentTarget: inputRef.current ?? { value: "" },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      onChange?.(synthetic);
      onValueChange?.("", synthetic);
    };

    const showClear = !!allowClear && !!currentValue && !disabled;
    const count = currentValue ? currentValue.length : 0;

    const inputElement = (
      <div className={wrapCls}>
        {renderAffixIcon(leadingIcon, "lead", onLeadingIconClick)}
        {prefix && <span className="input-affix prefix">{prefix}</span>}
        <input
          ref={setInputRef}
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
        {renderAffixIcon(trailingIcon, "trail", onTrailingIconClick)}
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
InputBase.displayName = "Input";

export const InputPassword = React.forwardRef<HTMLInputElement, InputPasswordProps>(
  (
    {
      visibilityToggle = true,
      iconRender,
      suffix,
      onValueChange,
      ...rest
    },
    ref
  ) => {
    const [visible, setVisible] = React.useState(false);
    const renderedIcon = iconRender?.(visible);
    const useCustomToggle = visibilityToggle !== false && !!renderedIcon;
    const useDefaultToggle = visibilityToggle !== false && !renderedIcon;

    const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setVisible((v) => !v);
    };

    const toggleNode = useCustomToggle ? (
        <button
          type="button"
          className="input-password-toggle"
          tabIndex={-1}
          onMouseDown={(e) => e.preventDefault()}
          onClick={toggle}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {renderedIcon}
        </button>
      ) : null;

    return (
      <InputBase
        ref={ref}
        {...rest}
        type={visible ? "text" : "password"}
        suffix={toggleNode ? <>{suffix}{toggleNode}</> : suffix}
        trailingIcon={useDefaultToggle ? (visible ? "eyeOff" : "eye") : undefined}
        onTrailingIconClick={useDefaultToggle ? () => setVisible((v) => !v) : undefined}
        onValueChange={onValueChange}
      />
    );
  }
);
InputPassword.displayName = "Input.Password";

export const Input = InputBase as InputComponent;
Input.Password = InputPassword;
Input.TextArea = Textarea;

export type InputTextAreaProps = TextareaProps;
