import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Divider.css";
import * as React from "react";

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "horizontal" | "vertical";
  label?: React.ReactNode;
  /** Use recessed groove styling. */
  sunken?: boolean;
  /** Render as dashed lines instead of solid. */
  dashed?: boolean;
  /**
   * Label position for horizontal dividers. Defaults to `"center"`.
   * Ignored when there is no `label`.
   */
  orientation?: "left" | "center" | "right";
}

/** `Divider` — visual separator, horizontal or vertical. */
export const Divider: React.FC<DividerProps> = ({
  direction = "horizontal",
  label,
  sunken,
  dashed,
  orientation = "center",
  className = "",
  ...rest
}) => {
  const cls = [
    "divider",
    direction,
    sunken && "sunken",
    dashed && "dashed",
    label && direction === "horizontal" && `orient-${orientation}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={cls} role="separator" {...rest}>
      {label && <span className="divider-label">{label}</span>}
    </div>
  );
};
