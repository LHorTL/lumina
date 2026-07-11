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
  /** 提交原生表单时使用的字段名。 */
  name?: string;
  /** 选中时提交给原生表单的字段值，默认为 `"on"`。 */
  value?: string;
  /** 是否要求该复选框必须选中。 */
  required?: boolean;
  /** 关联的原生 form 元素 id。 */
  form?: string;
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
  name,
  value: formValue,
  required,
  form,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-required": ariaRequired,
  ...rest
}, ref) => {
  const [inner, setInner] = React.useState(defaultChecked ?? false);
  const isControlled = checked !== undefined;
  const value = isControlled ? checked : inner;

  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = !!indeterminate;
  }, [indeterminate]);

  const toggle = (next: boolean) => {
    if (disabled) return;
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
      <input
        ref={inputRef}
        type="checkbox"
        className="checkbox-native"
        checked={value}
        disabled={disabled}
        onChange={(event) => toggle(event.target.checked)}
        id={id}
        name={name}
        value={formValue ?? "on"}
        required={required}
        form={form}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        aria-required={ariaRequired}
        aria-checked={indeterminate ? "mixed" : value}
      />
      <span aria-hidden="true" className="checkbox-box">
        {indeterminate ? <Icon name="minus" size={11} /> : value ? <Icon name="check" size={11} /> : null}
      </span>
      {label && <span className="checkbox-label">{label}</span>}
    </label>
  );
});
Checkbox.displayName = "Checkbox";
