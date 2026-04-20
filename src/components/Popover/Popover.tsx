import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Popover.css";
import * as React from "react";
import { createPortal } from "react-dom";
import { useFloating } from "../../utils/useFloating";

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
  const panelRef = React.useRef<HTMLSpanElement>(null);

  const { triggerRef, floatingStyle, placement: resolved } = useFloating<HTMLSpanElement>({
    open: show,
    placement,
    panelWidth: 240,
    panelHeight: 160,
    alignCross: "center",
  });

  const set = (v: boolean) => {
    if (!isControlled) setInner(v);
    onOpenChange?.(v);
  };

  React.useEffect(() => {
    if (trigger !== "click" || !show) return;
    const h = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      set(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, trigger]);

  const interact =
    trigger === "hover"
      ? { onMouseEnter: () => set(true), onMouseLeave: () => set(false) }
      : { onClick: () => set(!show) };

  return (
    <>
      <span
        ref={triggerRef}
        className={`popover-anchor ${className}`}
        style={{ display: "inline-flex" }}
        {...interact}
      >
        {children}
      </span>
      {show && typeof document !== "undefined" &&
        createPortal(
          <span ref={panelRef} className={`popover ${resolved}`} style={floatingStyle}>
            {content}
          </span>,
          document.body
        )}
    </>
  );
};
