import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Progress.css";
import * as React from "react";
import { withComponentTheme, type ComponentThemeProps } from "../Theme/ComponentTheme";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement>, ComponentThemeProps {
  /** 0–100 */
  value: number;
  max?: number;
  label?: React.ReactNode;
  showValue?: boolean;
  tone?: "accent" | "success" | "warning" | "danger";
  /** Custom fill color. Overrides `tone`. */
  color?: string;
  size?: "sm" | "md" | "lg";
  /** 不确定进度；隐藏具体数值并显示循环动画。 */
  indeterminate?: boolean;
  className?: string;
}

/** `Progress` — horizontal progress bar with neumorphic track. */
const ProgressBase = React.forwardRef<HTMLDivElement, ProgressProps>(({
  value,
  max = 100,
  label,
  showValue,
  tone = "accent",
  color,
  size = "md",
  indeterminate = false,
  className = "",
  style,
  ...rest
}, ref) => {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
  const safeValue = Number.isFinite(value) ? value : 0;
  const normalizedValue = Math.max(0, Math.min(safeMax, safeValue));
  const pct = (normalizedValue / safeMax) * 100;
  const rootStyle: React.CSSProperties = {
    ...(color
      ? {
          ["--progress-fill" as never]: color,
          ["--progress-fill-glow" as never]: `color-mix(in oklch, ${color} 35%, transparent)`,
        }
      : null),
    ...style,
  };
  return (
    <div
      ref={ref}
      className={`progress ${size} ${tone} ${indeterminate ? "indeterminate" : ""} ${className}`}
      style={rootStyle}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={indeterminate ? undefined : normalizedValue}
      aria-valuetext={indeterminate ? "加载中" : undefined}
      {...rest}
    >
      {(label || showValue) && (
        <div className="progress-label">
          {label ? <span>{label}</span> : <span />}
          {showValue && !indeterminate && <span className="v">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className="progress-track">
        <div className="progress-bar" style={{ width: indeterminate ? "35%" : `${pct}%` }} />
      </div>
    </div>
  );
});
ProgressBase.displayName = "Progress";

export const Progress = withComponentTheme(ProgressBase, "Progress", "progress");
