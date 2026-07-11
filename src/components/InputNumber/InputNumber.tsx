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

/** 按范围与精度归一化数字。 */
const normalizeNumber = (value: number, min: number, max: number, precision?: number): number => {
  const clamped = Math.max(min, Math.min(max, value));
  return precision != null ? Number(clamped.toFixed(precision)) : clamped;
};

/** 把精度限制到 Number.toFixed 支持的整数范围。 */
const normalizePrecision = (precision: number | undefined): number | undefined =>
  precision != null && Number.isFinite(precision)
    ? Math.max(0, Math.min(100, Math.trunc(precision)))
    : undefined;

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
      onWheel,
      onKeyDown,
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
      ...rest
    },
    ref
  ) => {
    const normalizedMin = Number.isFinite(min) ? min : -Infinity;
    const normalizedMaxCandidate = Number.isFinite(max) ? max : Infinity;
    const normalizedMax = Math.max(normalizedMin, normalizedMaxCandidate);
    const normalizedStep = Number.isFinite(step) && step > 0 ? step : 1;
    const normalizedPrecision = normalizePrecision(precision);
    const [inner, setInner] = React.useState<number | null>(() =>
      defaultValue == null || !Number.isFinite(defaultValue)
        ? null
        : normalizeNumber(defaultValue, normalizedMin, normalizedMax, normalizedPrecision)
    );
    const isControlled = value !== undefined;
    const current = isControlled
      ? typeof value === "number" && Number.isFinite(value)
        ? normalizeNumber(value, normalizedMin, normalizedMax, normalizedPrecision)
        : null
      : inner;

    const [text, setText] = React.useState<string>(current == null ? "" : String(current));

    React.useEffect(() => {
      if (isControlled) setText(current == null ? "" : String(current));
    }, [current, isControlled]);

    const clamp = React.useCallback(
      (n: number) => Math.max(normalizedMin, Math.min(normalizedMax, n)),
      [normalizedMax, normalizedMin]
    );
    const round = React.useCallback(
      (n: number) => (normalizedPrecision != null ? Number(n.toFixed(normalizedPrecision)) : n),
      [normalizedPrecision]
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
      if (Number.isFinite(parsed)) commit(clamp(round(parsed)));
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
      onKeyDown?.(e);
      if (e.defaultPrevented) return;
      if (e.key === "ArrowUp")   { e.preventDefault(); increment(normalizedStep); }
      if (e.key === "ArrowDown") { e.preventDefault(); increment(-normalizedStep); }
      if (e.key === "Enter")     onPressEnter?.(e);
    };

    /** 输入框聚焦时用滚轮按 step 调整数值。 */
    const handleWheel: React.WheelEventHandler<HTMLInputElement> = (event) => {
      onWheel?.(event);
      if (event.defaultPrevented || document.activeElement !== event.currentTarget || disabled || readOnly) return;
      event.preventDefault();
      increment(event.deltaY < 0 ? normalizedStep : -normalizedStep);
    };

    const upDisabled = disabled || readOnly || (current != null && current >= normalizedMax);
    const downDisabled = disabled || readOnly || (current != null && current <= normalizedMin);

    const stepperSuffix = controls ? (
      <span className="ipn-steppers">
        <button
          type="button"
          className="ipn-step up"
          tabIndex={-1}
          disabled={upDisabled}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => increment(normalizedStep)}
          aria-label="增加数值"
        >
          <Icon name="chevUp" size={10} stroke={2.5} />
        </button>
        <button
          type="button"
          className="ipn-step down"
          tabIndex={-1}
          disabled={downDisabled}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => increment(-normalizedStep)}
          aria-label="减少数值"
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
        {...rest}
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
        role="spinbutton"
        aria-valuemin={Number.isFinite(normalizedMin) ? normalizedMin : undefined}
        aria-valuemax={Number.isFinite(normalizedMax) ? normalizedMax : undefined}
        aria-valuenow={current ?? undefined}
        onValueChange={handleInput}
        onKeyDown={handleKeyDown}
        onWheel={handleWheel}
        onBlur={handleBlur}
        onFocus={onFocus}
      />
    );
  }
);
InputNumber.displayName = "InputNumber";
