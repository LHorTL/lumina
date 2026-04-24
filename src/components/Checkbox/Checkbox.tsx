import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Checkbox.css";
import * as React from "react";
import { Icon } from "../Icon";

export interface CheckboxProps
  extends Omit<React.LabelHTMLAttributes<HTMLLabelElement>, "onChange" | "children" | "id"> {
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
export const Checkbox = React.forwardRef<HTMLLabelElement, CheckboxProps>(({
  checked,
  defaultChecked,
  indeterminate,
  onChange,
  disabled,
  label,
  className = "",
  id,
  ...rest
}, ref) => {
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
    <label ref={ref} className={cls} {...rest}>
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
});
Checkbox.displayName = "Checkbox";
