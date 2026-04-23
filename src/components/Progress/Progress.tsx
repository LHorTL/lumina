import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Progress.css";
import * as React from "react";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0–100 */
  value: number;
  max?: number;
  label?: React.ReactNode;
  showValue?: boolean;
  tone?: "accent" | "success" | "warning" | "danger";
  /** Custom fill color. Overrides `tone`. */
  color?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/** `Progress` — horizontal progress bar with neumorphic track. */
export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(({
  value,
  max = 100,
  label,
  showValue,
  tone = "accent",
  color,
  size = "md",
  className = "",
  style,
  ...rest
}, ref) => {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
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
    <div ref={ref} className={`progress ${size} ${tone} ${className}`} style={rootStyle} {...rest}>
      {(label || showValue) && (
        <div className="progress-label">
          {label ? <span>{label}</span> : <span />}
          {showValue && <span className="v">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className="progress-track">
        <div className="progress-bar" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
});
Progress.displayName = "Progress";
