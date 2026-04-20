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
  /** Content rendered inside the track when checked (short text or icon). */
  checkedChildren?: React.ReactNode;
  /** Content rendered inside the track when unchecked. */
  unCheckedChildren?: React.ReactNode;
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
  checkedChildren,
  unCheckedChildren,
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
        {hasChildren && (
          <span className="switch-inner">
            <span className="switch-inner-on">{checkedChildren}</span>
            <span className="switch-inner-off">{unCheckedChildren}</span>
          </span>
        )}
        <span className="switch-thumb" />
      </button>
      {label && <span className="switch-label">{label}</span>}
    </label>
  );
};
