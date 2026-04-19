import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Progress.css";
import * as React from "react";

export interface ProgressProps {
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
export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  label,
  showValue,
  tone = "accent",
  size = "md",
  className = "",
}) => {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={`progress ${size} ${tone} ${className}`}>
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
};

export interface RingProps {
  value: number;
  max?: number;
  size?: number;
  tone?: "accent" | "success" | "warning" | "danger";
  children?: React.ReactNode;
  className?: string;
}

/** `Ring` — circular progress indicator. */
export const Ring: React.FC<RingProps> = ({
  value,
  max = 100,
  size = 72,
  tone = "accent",
  children,
  className = "",
}) => {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      className={`ring ${tone} ${className}`}
      style={{ ["--size" as never]: `${size}px`, ["--val" as never]: pct }}
    >
      <span className="ring-label">{children ?? `${Math.round(pct)}%`}</span>
    </div>
  );
};
