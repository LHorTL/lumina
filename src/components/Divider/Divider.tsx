import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Divider.css";
import * as React from "react";

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "horizontal" | "vertical";
  label?: React.ReactNode;
  /** Use recessed groove styling. */
  sunken?: boolean;
}

/** `Divider` — visual separator, horizontal or vertical. */
export const Divider: React.FC<DividerProps> = ({
  direction = "horizontal",
  label,
  sunken,
  className = "",
  ...rest
}) => {
  const cls = ["divider", direction, sunken && "sunken", className].filter(Boolean).join(" ");
  return (
    <div className={cls} role="separator" {...rest}>
      {label && <span className="divider-label">{label}</span>}
    </div>
  );
};
