import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Divider.css";
import * as React from "react";
import { withComponentTheme, type ComponentThemeProps } from "../Theme/ComponentTheme";

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement>, ComponentThemeProps {
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
const DividerBase = React.forwardRef<HTMLDivElement, DividerProps>(({
  direction = "horizontal",
  label,
  sunken,
  dashed,
  orientation = "center",
  className = "",
  ...rest
}, ref) => {
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
    <div
      ref={ref}
      className={cls}
      role="separator"
      aria-orientation={direction === "vertical" ? "vertical" : "horizontal"}
      {...rest}
    >
      {label && <span className="divider-label">{label}</span>}
    </div>
  );
});
DividerBase.displayName = "Divider";

export const Divider = withComponentTheme(DividerBase, "Divider", "divider");
