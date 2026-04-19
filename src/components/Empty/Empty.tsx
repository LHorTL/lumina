import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Empty.css";
import * as React from "react";

export interface EmptyProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  /** `subtle` drops the recessed icon well — good for inline / embedded use. */
  variant?: "default" | "subtle";
  className?: string;
}

/** `Empty` — empty state placeholder. */
export const Empty: React.FC<EmptyProps> = ({
  title = "暂无内容",
  description,
  icon,
  action,
  size = "md",
  variant = "default",
  className = "",
}) => (
  <div className={`empty ${size} ${variant} ${className}`}>
    {icon && <div className="empty-ico">{icon}</div>}
    <div className="empty-title">{title}</div>
    {description && <div className="empty-desc">{description}</div>}
    {action && <div className="empty-action">{action}</div>}
  </div>
);

export interface SpinnerProps {
  size?: number;
  tone?: "accent" | "success" | "warning" | "danger" | "current";
  /** Text rendered next to the spinner. */
  label?: React.ReactNode;
  /** `ring` is the default border spinner; `dots` is a three-dot bounce. */
  variant?: "ring" | "dots";
  className?: string;
}

/** `Spinner` — loading indicator. */
export const Spinner: React.FC<SpinnerProps> = ({
  size = 20,
  tone = "accent",
  label,
  variant = "ring",
  className = "",
}) => {
  const cls = `spinner ${variant} ${tone} ${className}`.trim();
  const spinner =
    variant === "dots" ? (
      <span className={cls} style={{ fontSize: size }} aria-label="Loading">
        <i /><i /><i />
      </span>
    ) : (
      <span
        className={cls}
        style={{ width: size, height: size }}
        aria-label="Loading"
      />
    );
  if (!label) return spinner;
  return (
    <span className="spinner-wrap">
      {spinner}
      <span className="spinner-label">{label}</span>
    </span>
  );
};

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  circle?: boolean;
  /** `wave` is a shimmer sweep; `pulse` fades opacity; `none` disables animation. */
  animation?: "wave" | "pulse" | "none";
  className?: string;
}

/** `Skeleton` — content placeholder during loading. */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 16,
  circle,
  animation = "wave",
  className = "",
}) => (
  <span
    className={`skeleton ${animation} ${circle ? "circle" : ""} ${className}`.trim()}
    style={{ width, height, borderRadius: circle ? "50%" : undefined }}
  />
);
