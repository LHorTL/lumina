import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Textarea.css";
import * as React from "react";
import { Icon } from "../Icon";

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange" | "value" | "defaultValue"> {
  value?: string;
  defaultValue?: string;
  /** Native textarea change event. */
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  /** Convenience value callback for Lumina-style code. */
  onValueChange?: (value: string, event: React.ChangeEvent<HTMLTextAreaElement>) => void;
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
 * `Textarea` — multi-line text input with a neumorphic groove.
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      onValueChange,
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
      onChange?.(e);
      onValueChange?.(e.target.value, e);
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
      onChange?.(synthetic);
      onValueChange?.("", synthetic);
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
      <div className="textarea-shell">
        {field}
        <div className="textarea-count">
          {maxLength != null ? `${count} / ${maxLength}` : `${count}`}
        </div>
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
export const TextArea = Textarea;
