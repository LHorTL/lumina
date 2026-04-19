import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Checkbox.css";
import * as React from "react";
import { Icon } from "../Icon";

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  className?: string;
  id?: string;
}

/** `Checkbox` — binary choice, supports indeterminate state. */
export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  defaultChecked,
  indeterminate,
  onChange,
  disabled,
  label,
  className = "",
  id,
}) => {
  const [inner, setInner] = React.useState(defaultChecked ?? false);
  const isControlled = checked !== undefined;
  const value = isControlled ? checked : inner;

  const toggle = () => {
    if (disabled) return;
    const next = !value;
    if (!isControlled) setInner(next);
    onChange?.(next);
  };

  const cls = [
    "checkbox",
    value && "checked",
    indeterminate && "indeterminate",
    disabled && "disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <label className={cls}>
      <button
        type="button"
        role="checkbox"
        aria-checked={indeterminate ? "mixed" : value}
        disabled={disabled}
        onClick={toggle}
        id={id}
        className="checkbox-box"
      >
        {indeterminate ? <Icon name="minus" size={11} /> : value ? <Icon name="check" size={11} /> : null}
      </button>
      {label && <span className="checkbox-label">{label}</span>}
    </label>
  );
};

export interface RadioOption<T extends string | number = string> {
  value: T;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps<T extends string | number = string> {
  options: RadioOption<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  name?: string;
  direction?: "vertical" | "horizontal";
  className?: string;
}

/** `RadioGroup` — mutually exclusive options. */
export function RadioGroup<T extends string | number = string>({
  options,
  value,
  defaultValue,
  onChange,
  direction = "vertical",
  className = "",
}: RadioGroupProps<T>) {
  const [inner, setInner] = React.useState<T | undefined>(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : inner;

  const pick = (v: T) => {
    if (!isControlled) setInner(v);
    onChange?.(v);
  };

  return (
    <div className={`radio-group ${direction} ${className}`}>
      {options.map((opt) => (
        <label
          key={String(opt.value)}
          className={`radio ${current === opt.value ? "checked" : ""} ${opt.disabled ? "disabled" : ""}`}
        >
          <button
            type="button"
            role="radio"
            aria-checked={current === opt.value}
            disabled={opt.disabled}
            onClick={() => pick(opt.value)}
            className="radio-dot"
          />
          <span className="radio-label">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}
