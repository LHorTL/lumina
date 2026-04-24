import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./InputNumber.css";
import * as React from "react";
import { Input } from "../Input";
import { Icon } from "../Icon";

export interface InputNumberProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "defaultValue" | "onChange" | "size" | "prefix" | "suffix" | "type"
  > {
  /** Controlled value. `null` = empty field. */
  value?: number | null;
  /** Uncontrolled initial value. */
  defaultValue?: number;
  /** Fires with the parsed number (or `null` when the input is emptied). */
  onChange?: (value: number | null) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  /** Fires when the Enter key is pressed. */
  onPressEnter?: React.KeyboardEventHandler<HTMLInputElement>;
  min?: number;
  max?: number;
  /** Step for up/down buttons + arrow keys. Default 1. */
  step?: number;
  /** Number of decimal places to round to. Omit for no rounding. */
  precision?: number;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  /** Show the up/down stepper buttons. Default true. */
  controls?: boolean;
  invalid?: boolean;
  className?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

/**
 * `InputNumber` — numeric input with up/down stepper buttons. Arrow-key
 * and mouse-wheel increments; min / max clamping; optional rounding.
 *
 * @example
 * ```tsx
 * <InputNumber min={0} max={100} step={1} defaultValue={10} onChange={...} />
 * ```
 */
export const InputNumber = React.forwardRef<HTMLInputElement, InputNumberProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      onBlur,
      onFocus,
      onPressEnter,
      min = -Infinity,
      max = Infinity,
      step = 1,
      precision,
      size = "md",
      disabled,
      readOnly,
      placeholder,
      controls = true,
      invalid,
      className = "",
      prefix,
      suffix,
      autoFocus,
      id,
      name,
    },
    ref
  ) => {
    const [inner, setInner] = React.useState<number | null>(defaultValue ?? null);
    const isControlled = value !== undefined;
    const current = isControlled ? (value as number | null) : inner;

    const [text, setText] = React.useState<string>(current == null ? "" : String(current));

    React.useEffect(() => {
      if (isControlled) setText(value == null ? "" : String(value));
    }, [value, isControlled]);

    const clamp = React.useCallback(
      (n: number) => Math.max(min, Math.min(max, n)),
      [min, max]
    );
    const round = React.useCallback(
      (n: number) => (precision != null ? Number(n.toFixed(precision)) : n),
      [precision]
    );

    const commit = (next: number | null) => {
      if (!isControlled) setInner(next);
      onChange?.(next);
    };

    const handleInput = (v: string) => {
      setText(v);
      if (v === "" || v === "-") {
        commit(null);
        return;
      }
      const parsed = Number(v);
      if (!Number.isNaN(parsed)) commit(clamp(round(parsed)));
    };

    const handleBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
      // Normalize displayed text to the committed numeric value.
      if (current == null) setText("");
      else setText(String(current));
      onBlur?.(e);
    };

    const increment = (delta: number) => {
      if (disabled || readOnly) return;
      const base = current ?? 0;
      const next = clamp(round(base + delta));
      if (!isControlled) setInner(next);
      setText(String(next));
      onChange?.(next);
    };

    const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
      if (e.key === "ArrowUp")   { e.preventDefault(); increment(step); }
      if (e.key === "ArrowDown") { e.preventDefault(); increment(-step); }
      if (e.key === "Enter")     onPressEnter?.(e);
    };

    const upDisabled = disabled || readOnly || (current != null && current >= max);
    const downDisabled = disabled || readOnly || (current != null && current <= min);

    const stepperSuffix = controls ? (
      <span className="ipn-steppers" aria-hidden>
        <button
          type="button"
          className="ipn-step up"
          tabIndex={-1}
          disabled={upDisabled}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => increment(step)}
        >
          <Icon name="chevUp" size={10} stroke={2.5} />
        </button>
        <button
          type="button"
          className="ipn-step down"
          tabIndex={-1}
          disabled={downDisabled}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => increment(-step)}
        >
          <Icon name="chevDown" size={10} stroke={2.5} />
        </button>
      </span>
    ) : null;

    const finalSuffix =
      stepperSuffix && suffix
        ? (<>{suffix}{stepperSuffix}</>)
        : stepperSuffix ?? suffix;

    return (
      <Input
        ref={ref}
        id={id}
        name={name}
        size={size}
        value={text}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        invalid={invalid}
        autoFocus={autoFocus}
        prefix={prefix}
        suffix={finalSuffix}
        className={`input-number ${className}`}
        inputMode="decimal"
        onValueChange={handleInput}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={onFocus}
      />
    );
  }
);
InputNumber.displayName = "InputNumber";
