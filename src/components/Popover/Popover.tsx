import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Popover.css";
import * as React from "react";

export interface PopoverProps {
  content: React.ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  trigger?: "click" | "hover";
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactElement;
  className?: string;
}

/** `Popover` — rich content bubble. */
export const Popover: React.FC<PopoverProps> = ({
  content,
  placement = "bottom",
  trigger = "click",
  defaultOpen = false,
  open,
  onOpenChange,
  children,
  className = "",
}) => {
  const [inner, setInner] = React.useState(defaultOpen);
  const isControlled = open !== undefined;
  const show = isControlled ? open! : inner;
  const ref = React.useRef<HTMLSpanElement>(null);

  const set = (v: boolean) => {
    if (!isControlled) setInner(v);
    onOpenChange?.(v);
  };

  React.useEffect(() => {
    if (trigger !== "click" || !show) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) set(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [show, trigger]);

  const interact =
    trigger === "hover"
      ? { onMouseEnter: () => set(true), onMouseLeave: () => set(false) }
      : { onClick: () => set(!show) };

  return (
    <span
      ref={ref}
      className={`popover-anchor ${className}`}
      style={{ position: "relative", display: "inline-flex" }}
      {...interact}
    >
      {children}
      {show && <span className={`popover ${placement}`}>{content}</span>}
    </span>
  );
};
