import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Switch.css";
import * as React from "react";

export interface SwitchProps
  extends Omit<React.LabelHTMLAttributes<HTMLLabelElement>, "onChange" | "children" | "id"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  size?: "sm" | "md";
  /** Content rendered inside the track when checked (short text or icon). */
  checkedChildren?: React.ReactNode;
  /** Content rendered inside the track when unchecked. */
  unCheckedChildren?: React.ReactNode;
  className?: string;
  id?: string;
  /** 提交原生表单时使用的字段名。 */
  name?: string;
  /** 开启时提交给原生表单的字段值，默认为 `"on"`。 */
  value?: string;
  /** 是否要求开关必须开启。 */
  required?: boolean;
  /** 关联的原生 form 元素 id。 */
  form?: string;
}

/**
 * `Switch` — on/off toggle. Controlled or uncontrolled.
 */
export const Switch = React.forwardRef<HTMLLabelElement, SwitchProps>(({
  checked,
  defaultChecked,
  onChange,
  disabled,
  label,
  size = "md",
  checkedChildren,
  unCheckedChildren,
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

  const toggle = (next: boolean) => {
    if (disabled) return;
    if (!isControlled) setInner(next);
    onChange?.(next);
  };

  const hasChildren = checkedChildren != null || unCheckedChildren != null;
  const cls = [
    "switch",
    value && "on",
    size !== "md" && size,
    disabled && "disabled",
    hasChildren && "with-children",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <label ref={ref} className={cls} {...rest}>
      <input
        type="checkbox"
        className="switch-native"
        checked={value}
        disabled={disabled}
        onChange={(event) => toggle(event.target.checked)}
        id={id}
        name={name}
        value={formValue ?? "on"}
        required={required}
        form={form}
        role="switch"
        aria-checked={value}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        aria-required={ariaRequired}
      />
      <span aria-hidden="true" className="switch-track">
        {hasChildren && (
          <span className="switch-inner">
            <span className="switch-inner-on">{checkedChildren}</span>
            <span className="switch-inner-off">{unCheckedChildren}</span>
          </span>
        )}
        <span className="switch-thumb" />
      </span>
      {label && <span className="switch-label">{label}</span>}
    </label>
  );
});
Switch.displayName = "Switch";
