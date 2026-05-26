import * as React from "react";

export interface UseInputTriggerToggleOptions {
  open: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  setOpen: (open: boolean) => void;
}

export function useInputTriggerToggle({
  open,
  disabled,
  readOnly,
  setOpen,
}: UseInputTriggerToggleOptions): Pick<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onPointerDown" | "onMouseDown" | "onFocus" | "onClick"
> {
  const pointerDownOpenRef = React.useRef(false);
  const focusOpenedRef = React.useRef(false);

  const handlePointerDown = React.useCallback(() => {
    pointerDownOpenRef.current = open;
    focusOpenedRef.current = false;
  }, [open]);

  const handleFocus = React.useCallback(() => {
    if (disabled || readOnly || open) return;
    focusOpenedRef.current = true;
    setOpen(true);
  }, [disabled, open, readOnly, setOpen]);

  const handleClick = React.useCallback(() => {
    if (disabled || readOnly) return;
    if (focusOpenedRef.current) {
      focusOpenedRef.current = false;
      pointerDownOpenRef.current = false;
      return;
    }

    const nextOpen = !(pointerDownOpenRef.current || open);
    pointerDownOpenRef.current = false;
    setOpen(nextOpen);
  }, [disabled, open, readOnly, setOpen]);

  return {
    onPointerDown: handlePointerDown,
    onMouseDown: handlePointerDown,
    onFocus: handleFocus,
    onClick: handleClick,
  };
}
