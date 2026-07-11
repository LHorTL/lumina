import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./AutoComplete.css";
import * as React from "react";
import { createPortal } from "react-dom";
import { Input } from "../Input";
import { useFloating } from "../../utils/useFloating";
import { usePortalContainer } from "../../utils/portal";
import { useOverlayLayer } from "../../utils/overlayStack";

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
      onBlur,
      onKeyDown,
      ...rest
    },
    ref
  ) => {
    const [inner, setInner] = React.useState(typeof defaultValue === "string" ? defaultValue : "");
    const isControlled = value !== undefined;
    const text = isControlled ? (typeof value === "string" ? value : "") : inner;

    const [innerOpen, setInnerOpen] = React.useState(false);
    const open = innerOpen && !disabled;
    const [active, setActive] = React.useState(0);
    const portalContainer = usePortalContainer();
    const listboxId = React.useId();

    const filtered = React.useMemo(() => {
      const nonEmptyOptions = options.filter((option) => option.value !== "");
      if (filterOption === false) return nonEmptyOptions;
      const fn = typeof filterOption === "function" ? filterOption : DEFAULT_FILTER;
      return nonEmptyOptions.filter((o) => fn(text, o));
    }, [options, text, filterOption]);

    const { triggerRef, floatingRef: panelRef, floatingStyle, zIndex: panelZIndex } = useFloating<HTMLDivElement, HTMLDivElement>({
      open,
      placement: "bottom",
      matchTriggerWidth,
      panelHeight: Math.min(filtered.length * 36 + 12, 280),
    });

    useOverlayLayer({
      open: open && portalContainer != null,
      containerRef: panelRef,
      ownerRef: triggerRef,
      zIndex: panelZIndex,
      onEscape: () => setInnerOpen(false),
    });

    React.useEffect(() => {
      if (disabled) setInnerOpen(false);
    }, [disabled]);

    React.useEffect(() => {
      const firstEnabled = filtered.findIndex((option) => !option.disabled);
      setActive(firstEnabled >= 0 ? firstEnabled : 0);
    }, [filtered.length, open]);

    // Close on outside click.
    React.useEffect(() => {
      if (!open) return;
      const onDown = (e: MouseEvent) => {
        if (
          !triggerRef.current?.contains(e.target as Node) &&
          !panelRef.current?.contains(e.target as Node)
        ) {
          setInnerOpen(false);
        }
      };
      window.addEventListener("mousedown", onDown);
      return () => window.removeEventListener("mousedown", onDown);
    }, [open, triggerRef]);

    const commit = (next: string, option?: AutoCompleteOption) => {
      if (disabled) return;
      if (!isControlled) setInner(next);
      onChange?.(next, option);
    };

    const handleInput = (v: string) => {
      if (disabled) return;
      commit(v);
      onSearch?.(v);
      setInnerOpen(true);
    };

    const pick = (o: AutoCompleteOption) => {
      if (disabled || o.disabled) return;
      commit(o.value, o);
      onSelect?.(o.value, o);
      setInnerOpen(false);
    };

    const onKey: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!open) { setInnerOpen(true); return; }
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
        if (open) { e.preventDefault(); setInnerOpen(false); }
      } else if (e.key === "Tab") {
        setInnerOpen(false);
      }
    };

    const panel = open && portalContainer
      ? createPortal(
          <div
            ref={panelRef}
            id={listboxId}
            role="listbox"
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
                  id={`${listboxId}-option-${i}`}
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
          portalContainer
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
            if (!disabled) setInnerOpen(true);
          }}
          onBlur={(event) => {
            onBlur?.(event);
            const ownerDocument = event.currentTarget.ownerDocument;
            requestAnimationFrame(() => {
              const activeElement = ownerDocument.activeElement;
              if (!triggerRef.current?.contains(activeElement) && !panelRef.current?.contains(activeElement)) {
                setInnerOpen(false);
              }
            });
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (!event.defaultPrevented) onKey(event);
          }}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-activedescendant={open && filtered[active] ? `${listboxId}-option-${active}` : undefined}
        />
        {panel}
      </div>
    );
  }
);
AutoComplete.displayName = "AutoComplete";
