import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Slider.css";
import * as React from "react";

export interface SliderProps {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  showValue?: boolean;
  tone?: "accent" | "success" | "warning" | "danger";
  className?: string;
}

/** `Slider` — neumorphic range input with grooved track. */
export const Slider: React.FC<SliderProps> = ({
  value,
  defaultValue = 0,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  showValue,
  tone = "accent",
  className = "",
}) => {
  const [inner, setInner] = React.useState(defaultValue);
  const isControlled = value !== undefined;
  const v = isControlled ? value! : inner;
  const pct = ((v - min) / (max - min)) * 100;

  return (
    <div className={`slider ${tone} ${disabled ? "disabled" : ""} ${className}`}>
      <div className="slider-track">
        <div className="slider-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="slider-thumb" style={{ left: `${pct}%` }} />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={v}
        disabled={disabled}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (!isControlled) setInner(n);
          onChange?.(n);
        }}
      />
      {showValue && <span className="slider-value">{v}</span>}
    </div>
  );
};
