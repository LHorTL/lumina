import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Slider.css";
import * as React from "react";

export type SliderSingleValue = number;
export type SliderRangeValue = [number, number];
export type SliderValue = SliderSingleValue | SliderRangeValue;

interface SliderBaseProps {
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  showValue?: boolean;
  tone?: "accent" | "success" | "warning" | "danger";
  /** Tick marks with labels. Clicking a mark snaps to it. */
  marks?: Record<number, React.ReactNode>;
  className?: string;
}

export interface SliderSingleProps extends SliderBaseProps {
  range?: false;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
}

export interface SliderRangeProps extends SliderBaseProps {
  range: true;
  value?: SliderRangeValue;
  defaultValue?: SliderRangeValue;
  onChange?: (value: SliderRangeValue) => void;
}

export type SliderProps = SliderSingleProps | SliderRangeProps;

const asArray = (v: SliderValue | undefined, fallback: number): number[] => {
  if (v === undefined) return [fallback];
  return Array.isArray(v) ? [...v] : [v];
};

/** `Slider` — neumorphic range input with grooved track. */
export const Slider: React.FC<SliderProps> = (props) => {
  const {
    min = 0,
    max = 100,
    step = 1,
    disabled,
    showValue,
    tone = "accent",
    marks,
    className = "",
  } = props;

  const range = (props as SliderRangeProps).range === true;
  const value = (props as { value?: SliderValue }).value;
  const defaultValue = (props as { defaultValue?: SliderValue }).defaultValue;
  const onChange = (props as { onChange?: (v: SliderValue) => void }).onChange;

  const initial = React.useMemo<number[]>(() => {
    if (defaultValue !== undefined) return asArray(defaultValue, 0);
    return range ? [min, max] : [0];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [inner, setInner] = React.useState<number[]>(initial);
  const isControlled = value !== undefined;
  const nums = isControlled ? asArray(value, range ? min : 0) : inner;

  const pctOf = (n: number) => ((n - min) / (max - min)) * 100;

  const emit = (arr: number[]) => {
    if (range) {
      onChange?.([arr[0], arr[1]] as SliderRangeValue);
    } else {
      onChange?.(arr[0]);
    }
  };

  const updateAt = (index: number, next: number) => {
    const clamped = Math.max(min, Math.min(max, next));
    const out = [...nums];
    out[index] = clamped;
    if (range && out.length === 2 && out[0] > out[1]) {
      out.sort((a, b) => a - b);
    }
    if (!isControlled) setInner(out);
    emit(out);
  };

  const handleMarkClick = (mark: number) => {
    if (disabled) return;
    if (!range) {
      updateAt(0, mark);
      return;
    }
    const [a, b] = nums;
    const closerIndex = Math.abs(a - mark) <= Math.abs(b - mark) ? 0 : 1;
    updateAt(closerIndex, mark);
  };

  const fillLeft = range ? pctOf(Math.min(nums[0], nums[1])) : 0;
  const fillRight = range
    ? 100 - pctOf(Math.max(nums[0], nums[1]))
    : 100 - pctOf(nums[0]);

  return (
    <div className={`slider ${tone} ${disabled ? "disabled" : ""} ${marks ? "has-marks" : ""} ${className}`}>
      <div className="slider-track">
        <div
          className="slider-fill"
          style={{ left: `${fillLeft}%`, right: `${fillRight}%` }}
        />
      </div>
      {nums.map((n, i) => (
        <React.Fragment key={i}>
          <div className="slider-thumb" style={{ left: `${pctOf(n)}%` }} />
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={n}
            disabled={disabled}
            onChange={(e) => updateAt(i, Number(e.target.value))}
          />
        </React.Fragment>
      ))}
      {showValue && (
        <span className="slider-value">
          {range ? `${nums[0]} – ${nums[1]}` : nums[0]}
        </span>
      )}
      {marks && (
        <div className="slider-marks">
          {Object.entries(marks).map(([k, label]) => {
            const n = Number(k);
            const left = pctOf(n);
            const active = range
              ? n >= Math.min(nums[0], nums[1]) && n <= Math.max(nums[0], nums[1])
              : n <= nums[0];
            return (
              <span
                key={k}
                className={`slider-mark ${active ? "active" : ""}`}
                style={{ left: `${left}%` }}
                onClick={() => handleMarkClick(n)}
              >
                <span className="slider-mark-dot" />
                <span className="slider-mark-label">{label}</span>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};
