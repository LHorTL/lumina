import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Tooltip.css";
import * as React from "react";
import { createPortal } from "react-dom";
import { useFloating } from "../../utils/useFloating";

export interface TooltipProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children" | "content"> {
  content: React.ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  children: React.ReactElement;
  delay?: number;
  disabled?: boolean;
}

/** `Tooltip` — hover/focus text bubble. */
export const Tooltip = React.forwardRef<HTMLSpanElement, TooltipProps>(({
  content,
  placement = "top",
  children,
  delay = 250,
  disabled,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  ...rest
}, ref) => {
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

  const setTriggerRef = React.useCallback(
    (node: HTMLSpanElement | null) => {
      (triggerRef as React.MutableRefObject<HTMLSpanElement | null>).current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref, triggerRef]
  );

  return (
    <>
      <span
        ref={setTriggerRef}
        className="tip-anchor"
        onMouseEnter={(e) => {
          onMouseEnter?.(e);
          open();
        }}
        onMouseLeave={(e) => {
          onMouseLeave?.(e);
          close();
        }}
        onFocus={(e) => {
          onFocus?.(e);
          open();
        }}
        onBlur={(e) => {
          onBlur?.(e);
          close();
        }}
        {...rest}
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
});
Tooltip.displayName = "Tooltip";
