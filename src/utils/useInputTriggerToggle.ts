import * as React from "react";
import { isRestoringOverlayFocus } from "./overlayStack";

/** 输入框触发浮层时的显隐状态与交互限制。 */
export interface UseInputTriggerToggleOptions {
  open: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  setOpen: (open: boolean) => void;
}

/** 合并输入框的主动聚焦与点击切换，忽略浮层关闭时的焦点归还。 */
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

  /** 保存按下时的显隐状态，避免同一次点击被 focus 和 click 重复切换。 */
  const handlePointerDown = React.useCallback(() => {
    pointerDownOpenRef.current = open;
    focusOpenedRef.current = false;
  }, [open]);

  /** 主动聚焦正常展开；恢复焦点只回到输入框，不重新打开浮层。 */
  const handleFocus = React.useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    if (disabled || readOnly || open || isRestoringOverlayFocus(event.currentTarget)) return;
    focusOpenedRef.current = true;
    setOpen(true);
  }, [disabled, open, readOnly, setOpen]);

  /** 点击已聚焦的输入框仍可切换浮层。 */
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
