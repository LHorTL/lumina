import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Textarea.css";
import * as React from "react";
import { Icon } from "../Icon";
import { createValueOverrideTarget } from "../../utils/inputEvents";
import {
  ComponentThemeBoundary,
  mergeComponentRootStyleWithInstanceStyle,
  useComponentThemeRootRef,
  type ComponentThemeProps,
} from "../Theme/ComponentTheme";

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange" | "value" | "defaultValue">,
    ComponentThemeProps {
  value?: string;
  defaultValue?: string;
  /** Native textarea change event. */
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  /** Convenience value callback for Lumina-style code. */
  onValueChange?: (value: string, event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  invalid?: boolean;
  /** Show a × button in the top-right corner to clear the value. */
  allowClear?: boolean;
  /** Max length — forwarded to the native textarea. */
  maxLength?: number;
  /** Render a "N / max" counter beneath the textarea. */
  showCount?: boolean;
  className?: string;
}

/**
 * `Textarea` — multi-line text input with a neumorphic groove.
 */
const TextareaBase = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      onValueChange,
      invalid,
      allowClear,
      maxLength,
      showCount,
      className = "",
      theme,
      style,
      ...rest
    },
    ref
  ) => {
    const [inner, setInner] = React.useState(defaultValue ?? "");
    const [themeRootElement, themeRootRef] = useComponentThemeRootRef<HTMLDivElement>(
      undefined,
      { component: "Textarea", theme }
    );
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : inner;
    const disabled = rest.disabled;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!isControlled) setInner(e.target.value);
      onChange?.(e);
      onValueChange?.(e.target.value, e);
    };

    /** 合并内部节点引用与对外 ref。 */
    const setTextareaRef = React.useCallback((node: HTMLTextAreaElement | null) => {
      textareaRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    }, [ref]);

    const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (disabled) return;
      if (!isControlled) setInner("");
      if (!isControlled && textareaRef.current) textareaRef.current.value = "";
      const clearedTarget = createValueOverrideTarget(textareaRef.current, "");
      const synthetic = {
        ...e,
        type: "change",
        target: clearedTarget,
        currentTarget: clearedTarget,
      } as unknown as React.ChangeEvent<HTMLTextAreaElement>;
      onChange?.(synthetic);
      onValueChange?.("", synthetic);
    };

    const cls = ["textarea", invalid && "invalid", className].filter(Boolean).join(" ");
    const showClear = !!allowClear && !!currentValue && !disabled;
    const count = currentValue ? currentValue.length : 0;

    return (
      <ComponentThemeBoundary
        component="Textarea"
        cssPrefix="textarea"
        theme={theme}
        rootElement={themeRootElement}
      >
        {(themeState) => {
          const mergedRootStyle = mergeComponentRootStyleWithInstanceStyle(
            themeState.rootStyle,
            style
          );
          const field = (
            <div
              ref={showCount ? undefined : themeRootRef}
              className="textarea-wrap"
              {...(!showCount ? themeState.rootDataAttributes : null)}
              style={showCount ? themeState.styles.control : mergedRootStyle}
            >
              <textarea
                ref={setTextareaRef}
                className={cls}
                value={isControlled ? value : undefined}
                defaultValue={isControlled ? undefined : defaultValue}
                onChange={handleChange}
                maxLength={maxLength}
                {...rest}
                style={{ ...themeState.styles.input, ...style }}
              />
              {showClear && (
                <button
                  type="button"
                  className="textarea-clear"
                  role="button"
                  aria-label="Clear"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleClear}
                >
                  <Icon name="x" size={12} />
                </button>
              )}
            </div>
          );

          if (!showCount) return field;
          return (
            <div
              ref={themeRootRef}
              className="textarea-shell"
              {...themeState.rootDataAttributes}
              style={mergedRootStyle}
            >
              {field}
              <div className="textarea-count" style={themeState.styles.count}>
                {maxLength != null ? `${count} / ${maxLength}` : `${count}`}
              </div>
            </div>
          );
        }}
      </ComponentThemeBoundary>
    );
  }
);
TextareaBase.displayName = "Textarea";
export const Textarea = TextareaBase;
export const TextArea = Textarea;
