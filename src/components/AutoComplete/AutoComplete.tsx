import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./AutoComplete.css";
import * as React from "react";
import { createPortal } from "react-dom";
import { Input } from "../Input";
import { useFloating } from "../../utils/useFloating";

export interface AutoCompleteOption {
  value: string;
  /** Display label. Defaults to `value`. */
  label?: React.ReactNode;
  disabled?: boolean;
}

export interface AutoCompleteProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "defaultValue" | "onChange" | "onSelect" | "size"
  > {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, option?: AutoCompleteOption) => void;
  /** Fires when a suggestion is selected (click or Enter). */
  onSelect?: (value: string, option: AutoCompleteOption) => void;
  /** Fires on every keystroke — typically used to fetch fresh suggestions. */
  onSearch?: (text: string) => void;
  /** Suggestion list. Empty-string value is filtered out. */
  options: AutoCompleteOption[];
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
  /** Override the default substring filter. `false` keeps every option. */
  filterOption?: boolean | ((input: string, option: AutoCompleteOption) => boolean);
  /** Content shown when no option matches. */
  notFoundContent?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Class on the popped-out panel. */
  dropdownClassName?: string;
  /** Force the panel to be as wide as the input. Default true. */
  matchTriggerWidth?: boolean;
}

const DEFAULT_FILTER = (input: string, option: AutoCompleteOption) => {
  if (!input) return true;
  const hay = `${option.value} ${typeof option.label === "string" ? option.label : ""}`.toLowerCase();
  return hay.includes(input.toLowerCase());
};

/**
 * `AutoComplete` — text input with a filtered suggestion dropdown.
 * Uses value / onChange / onSelect / options / filterOption for predictable field binding.
 *
 * @example
 * ```tsx
 * <AutoComplete
 *   options={[{ value: "light" }, { value: "dark" }]}
 *   onSelect={(v) => console.log(v)}
 *   placeholder="主题"
 * />
 * ```
 */
export const AutoComplete = React.forwardRef<HTMLInputElement, AutoCompleteProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      onSelect,
      onSearch,
      options,
      placeholder,
      disabled,
      allowClear,
      filterOption = true,
      notFoundContent = "暂无匹配结果",
      size = "md",
      autoFocus,
      className = "",
      dropdownClassName = "",
      matchTriggerWidth = true,
      id,
      name,
      onFocus,
      onKeyDown,
      ...rest
    },
    ref
  ) => {
    const [inner, setInner] = React.useState(defaultValue ?? "");
    const isControlled = value !== undefined;
    const text = isControlled ? (value as string) : inner;

    const [open, setOpen] = React.useState(false);
    const [active, setActive] = React.useState(0);
    const panelRef = React.useRef<HTMLDivElement>(null);

    const filtered = React.useMemo(() => {
      if (filterOption === false) return options;
      const fn = typeof filterOption === "function" ? filterOption : DEFAULT_FILTER;
      return options.filter((o) => fn(text, o));
    }, [options, text, filterOption]);

    const { triggerRef, floatingStyle } = useFloating<HTMLDivElement>({
      open,
      placement: "bottom",
      matchTriggerWidth,
      panelHeight: Math.min(filtered.length * 36 + 12, 280),
    });

    React.useEffect(() => {
      setActive(0);
    }, [filtered.length, open]);

    // Close on outside click.
    React.useEffect(() => {
      if (!open) return;
      const onDown = (e: MouseEvent) => {
        if (
          !triggerRef.current?.contains(e.target as Node) &&
          !panelRef.current?.contains(e.target as Node)
        ) {
          setOpen(false);
        }
      };
      window.addEventListener("mousedown", onDown);
      return () => window.removeEventListener("mousedown", onDown);
    }, [open, triggerRef]);

    const commit = (next: string, option?: AutoCompleteOption) => {
      if (!isControlled) setInner(next);
      onChange?.(next, option);
    };

    const handleInput = (v: string) => {
      commit(v);
      onSearch?.(v);
      setOpen(true);
    };

    const pick = (o: AutoCompleteOption) => {
      if (o.disabled) return;
      commit(o.value, o);
      onSelect?.(o.value, o);
      setOpen(false);
    };

    const onKey: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!open) { setOpen(true); return; }
        setActive((a) => {
          if (filtered.length === 0) return 0;
          for (let n = 1; n <= filtered.length; n++) {
            const i = (a + n) % filtered.length;
            if (!filtered[i].disabled) return i;
          }
          return a;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => {
          if (filtered.length === 0) return 0;
          for (let n = 1; n <= filtered.length; n++) {
            const i = (a - n + filtered.length) % filtered.length;
            if (!filtered[i].disabled) return i;
          }
          return a;
        });
      } else if (e.key === "Enter") {
        if (open && filtered[active]) {
          e.preventDefault();
          pick(filtered[active]);
        }
      } else if (e.key === "Escape") {
        if (open) { e.preventDefault(); setOpen(false); }
      }
    };

    const panel = open && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={panelRef}
            className={`autocomplete-panel ${dropdownClassName}`}
            style={floatingStyle}
            onMouseDown={(e) => e.preventDefault()}
          >
            {filtered.length === 0 ? (
              <div className="autocomplete-empty">{notFoundContent}</div>
            ) : (
              filtered.map((o, i) => (
                <button
                  key={o.value}
                  type="button"
                  role="option"
                  aria-selected={i === active}
                  disabled={o.disabled}
                  className={`autocomplete-item ${i === active ? "active" : ""}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(o)}
                >
                  {o.label ?? o.value}
                </button>
              ))
            )}
          </div>,
          document.body
        )
      : null;

    return (
      <div ref={triggerRef} className={`autocomplete ${className}`}>
        <Input
          ref={ref}
          {...rest}
          id={id}
          name={name}
          size={size}
          value={text}
          placeholder={placeholder}
          disabled={disabled}
          allowClear={allowClear}
          autoFocus={autoFocus}
          onValueChange={handleInput}
          onFocus={(event) => {
            onFocus?.(event);
            if (!disabled) setOpen(true);
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            onKey(event);
          }}
        />
        {panel}
      </div>
    );
  }
);
AutoComplete.displayName = "AutoComplete";
