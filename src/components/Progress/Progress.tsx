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
  size = "md",
  className = "",
  ...rest
}, ref) => {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div ref={ref} className={`progress ${size} ${tone} ${className}`} {...rest}>
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

export interface RingProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: number;
  tone?: "accent" | "success" | "warning" | "danger";
  children?: React.ReactNode;
  className?: string;
}

/** `Ring` — circular progress indicator. */
export const Ring = React.forwardRef<HTMLDivElement, RingProps>(({
  value,
  max = 100,
  size = 72,
  tone = "accent",
  children,
  className = "",
  style,
  ...rest
}, ref) => {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      ref={ref}
      className={`ring ${tone} ${className}`}
      style={{ ["--size" as never]: `${size}px`, ["--val" as never]: pct, ...style }}
      {...rest}
    >
      <span className="ring-label">{children ?? `${Math.round(pct)}%`}</span>
    </div>
  );
});
Ring.displayName = "Ring";
