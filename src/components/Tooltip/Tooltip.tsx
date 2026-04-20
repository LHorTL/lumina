import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Tooltip.css";
import * as React from "react";
import { createPortal } from "react-dom";
import { useFloating } from "../../utils/useFloating";

export interface TooltipProps {
  content: React.ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  children: React.ReactElement;
  delay?: number;
  disabled?: boolean;
}

/** `Tooltip` — hover/focus text bubble. */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  placement = "top",
  children,
  delay = 250,
  disabled,
}) => {
  const [show, setShow] = React.useState(false);
  const t = React.useRef<number | undefined>();

  const open = () => {
    if (disabled) return;
    window.clearTimeout(t.current);
    t.current = window.setTimeout(() => setShow(true), delay);
  };
  const close = () => {
    window.clearTimeout(t.current);
    setShow(false);
  };

  const { triggerRef, floatingStyle, placement: resolved } = useFloating<HTMLSpanElement>({
    open: show,
    placement,
    panelWidth: 160,
    panelHeight: 32,
    alignCross: "center",
  });

  return (
    <>
      <span
        ref={triggerRef}
        className="tip-anchor"
        onMouseEnter={open}
        onMouseLeave={close}
        onFocus={open}
        onBlur={close}
      >
        {children}
      </span>
      {show && typeof document !== "undefined" &&
        createPortal(
          <span className={`tip ${resolved}`} style={floatingStyle}>
            {content}
          </span>,
          document.body
        )}
    </>
  );
};
