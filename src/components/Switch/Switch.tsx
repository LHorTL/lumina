import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Switch.css";
import * as React from "react";

export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  size?: "sm" | "md";
  className?: string;
  id?: string;
}

/**
 * `Switch` — on/off toggle. Controlled or uncontrolled.
 */
export const Switch: React.FC<SwitchProps> = ({
  checked,
  defaultChecked,
  onChange,
  disabled,
  label,
  size = "md",
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

  const cls = ["switch", value && "on", size !== "md" && size, disabled && "disabled", className]
    .filter(Boolean)
    .join(" ");

  return (
    <label className={cls}>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        disabled={disabled}
        onClick={toggle}
        id={id}
        className="switch-track"
      >
        <span className="switch-thumb" />
      </button>
      {label && <span className="switch-label">{label}</span>}
    </label>
  );
};
