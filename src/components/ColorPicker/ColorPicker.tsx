import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./ColorPicker.css";
import * as React from "react";
import { createPortal } from "react-dom";
import { useFloating } from "../../utils/useFloating";
import { usePortalContainer } from "../../utils/portal";
import { useOverlayLayer } from "../../utils/overlayStack";
import { Input } from "../Input";

/* ============================================================================
 * Color conversion helpers
 * ========================================================================== */

type RGB = [number, number, number];
type HSV = [number, number, number];

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);

function normalizeHex(input: string): string | null {
  const s = input.trim().replace(/^#/, "");
  if (!/^([\da-f]{3}|[\da-f]{6})$/i.test(s)) return null;
  const full = s.length === 3 ? s.split("").map((c) => c + c).join("") : s;
  return "#" + full.toLowerCase();
}

function hexToRgb(hex: string): RGB | null {
  const n = normalizeHex(hex);
  if (!n) return null;
  const int = parseInt(n.slice(1), 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const to = (x: number) => {
    const h = clamp(Math.round(x), 0, 255).toString(16);
    return h.length === 1 ? "0" + h : h;
  };
  return "#" + to(r) + to(g) + to(b);
}

function rgbToHsv(r: number, g: number, b: number): HSV {
  const R = r / 255;
  const G = g / 255;
  const B = b / 255;
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === R) h = ((G - B) / d) % 6;
    else if (max === G) h = (B - R) / d + 2;
    else h = (R - G) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : (d / max) * 100;
  const v = max * 100;
  return [h, s, v];
}

function hsvToRgb(h: number, s: number, v: number): RGB {
  const S = s / 100;
  const V = v / 100;
  const c = V * S;
  const hh = (h % 360) / 60;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  const m = V - c;
  let r = 0;
  let g = 0;
  let b = 0;
  if (hh < 1) [r, g, b] = [c, x, 0];
  else if (hh < 2) [r, g, b] = [x, c, 0];
  else if (hh < 3) [r, g, b] = [0, c, x];
  else if (hh < 4) [r, g, b] = [0, x, c];
  else if (hh < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

const hexToHsv = (hex: string): HSV | null => {
  const rgb = hexToRgb(hex);
  return rgb ? rgbToHsv(...rgb) : null;
};

const hsvToHex = (h: number, s: number, v: number): string => rgbToHex(...hsvToRgb(h, s, v));

/* ============================================================================
 * Public API
 * ========================================================================== */

export interface ColorPickerProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "value" | "defaultValue" | "onChange" | "children" | "color"
  > {
  /** Controlled hex color (e.g. "#ff6b6b"). */
  value?: string;
  /** Initial hex when uncontrolled. */
  defaultValue?: string;
  /** Fires on every pixel of drag / input edit. */
  onChange?: (hex: string) => void;
  /** Fires once when a drag / input / preset commit finishes. */
  onChangeComplete?: (hex: string) => void;
  /** Disable the trigger. */
  disabled?: boolean;
  /** Size of the swatch trigger. */
  size?: "sm" | "md" | "lg";
  /** Where the panel appears relative to the trigger. */
  placement?: "top" | "bottom" | "left" | "right";
  /** Hex preset chips below the panel. */
  presets?: string[];
  /** Show the current hex next to the swatch. */
  showText?: boolean;
  /** 自定义触发内容；不能接收 ref 的节点或纯文本会自动包装为可访问的触发器。 */
  children?: React.ReactNode;
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when open state changes. */
  onOpenChange?: (open: boolean) => void;
}

/** ColorPicker 对外暴露的真实触发节点类型；自定义内容可能由包装节点承载。 */
export type ColorPickerTriggerElement = HTMLElement;

/** ColorPicker 自定义触发元素可接收的交互属性。 */
interface ColorPickerCustomTriggerProps {
  onClick?: React.MouseEventHandler<HTMLElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
  disabled?: boolean;
  href?: string;
  role?: React.AriaRole;
  tabIndex?: number;
  [key: `aria-${string}`]: unknown;
}

/** 判断 React 元素类型能否把 ref 直接落到真实 DOM。 */
function supportsDomRef(type: React.ReactElement["type"]): boolean {
  if (typeof type === "string") return type !== "svg";
  if (typeof type !== "object" || type == null) return false;
  const marker = (type as { $$typeof?: symbol }).$$typeof;
  if (marker === Symbol.for("react.memo")) {
    return supportsDomRef((type as { type: React.ReactElement["type"] }).type);
  }
  const displayName = (type as { displayName?: string }).displayName;
  return marker === Symbol.for("react.forward_ref") &&
    (displayName === "Button" || displayName === "IconButton");
}

/* ============================================================================
 * Internals
 * ========================================================================== */

const DEFAULT_PRESETS = [
  "#ff6b6b",
  "#ffa94d",
  "#ffd43b",
  "#51cf66",
  "#22b8cf",
  "#339af0",
  "#845ef7",
  "#f06595",
  "#868e96",
  "#212529",
];

interface BoardProps {
  hue: number;
  s: number;
  v: number;
  onChange: (s: number, v: number, done: boolean) => void;
}

const SaturationBoard: React.FC<BoardProps> = ({ hue, s, v, onChange }) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const compute = (clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return { s, v };
    const rect = el.getBoundingClientRect();
    const ns = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
    const nv = clamp(100 - ((clientY - rect.top) / rect.height) * 100, 0, 100);
    return { s: ns, v: nv };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    const first = compute(e.clientX, e.clientY);
    onChange(first.s, first.v, false);

    const move = (ev: PointerEvent) => {
      const c = compute(ev.clientX, ev.clientY);
      onChange(c.s, c.v, false);
    };
    const up = (ev: PointerEvent) => {
      const c = compute(ev.clientX, ev.clientY);
      onChange(c.s, c.v, true);
      el.releasePointerCapture(e.pointerId);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  };

  /** 用方向键调整饱和度与明度。 */
  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    let nextS = s;
    let nextV = v;
    if (event.key === "ArrowLeft") nextS -= 1;
    else if (event.key === "ArrowRight") nextS += 1;
    else if (event.key === "ArrowDown") nextV -= 1;
    else if (event.key === "ArrowUp") nextV += 1;
    else return;
    event.preventDefault();
    onChange(clamp(nextS, 0, 100), clamp(nextV, 0, 100), true);
  };

  return (
    <div
      ref={ref}
      className="cp-board"
      style={{ background: `hsl(${hue}, 100%, 50%)` }}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="slider"
      aria-label="颜色饱和度与明度"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(s)}
      aria-valuetext={`饱和度 ${Math.round(s)}%，明度 ${Math.round(v)}%`}
    >
      <div className="cp-board-white" />
      <div className="cp-board-black" />
      <div
        className="cp-board-thumb"
        style={{ left: `${s}%`, top: `${100 - v}%` }}
      />
    </div>
  );
};

interface HueProps {
  hue: number;
  onChange: (h: number, done: boolean) => void;
}

const HueSlider: React.FC<HueProps> = ({ hue, onChange }) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const compute = (clientX: number) => {
    const el = ref.current;
    if (!el) return hue;
    const rect = el.getBoundingClientRect();
    return clamp(((clientX - rect.left) / rect.width) * 360, 0, 360);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    onChange(compute(e.clientX), false);
    const move = (ev: PointerEvent) => onChange(compute(ev.clientX), false);
    const up = (ev: PointerEvent) => {
      onChange(compute(ev.clientX), true);
      el.releasePointerCapture(e.pointerId);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  };

  /** 用方向键调整色相。 */
  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    let next = hue;
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") next -= 1;
    else if (event.key === "ArrowRight" || event.key === "ArrowUp") next += 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = 360;
    else return;
    event.preventDefault();
    onChange(clamp(next, 0, 360), true);
  };

  return (
    <div
      ref={ref}
      className="cp-hue"
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="slider"
      aria-label="色相"
      aria-valuemin={0}
      aria-valuemax={360}
      aria-valuenow={Math.round(hue)}
    >
      <div
        className="cp-hue-thumb"
        style={{ left: `${(hue / 360) * 100}%` }}
      />
    </div>
  );
};

/* ============================================================================
 * Main component
 * ========================================================================== */

/**
 * `ColorPicker` — neumorphic color picker with HSV panel, hue slider,
 * hex input and optional preset palette.
 *
 * @example
 * <ColorPicker defaultValue="#845ef7" onChange={setColor} />
 */
export const ColorPicker = React.forwardRef<ColorPickerTriggerElement, ColorPickerProps>(
  (props, ref) => {
    const {
      value,
      defaultValue = "#845ef7",
      onChange,
      onChangeComplete,
      disabled,
      size = "md",
      placement = "bottom",
      presets = DEFAULT_PRESETS,
      showText = false,
      children,
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      className = "",
      style,
      onClick,
      onKeyDown,
      tabIndex,
      ...rest
    } = props;

    const isControlled = value != null;
    const [internal, setInternal] = React.useState(
      normalizeHex(defaultValue) ?? "#845ef7"
    );
    const current = normalizeHex((isControlled ? value : internal) ?? "") ?? "#845ef7";

    const isOpenControlled = openProp != null;
    const [openState, setOpenState] = React.useState(defaultOpen);
    const open = !disabled && (isOpenControlled ? !!openProp : openState);
    const setOpen = (next: boolean) => {
      if (!isOpenControlled) setOpenState(next);
      onOpenChange?.(next);
    };

    React.useEffect(() => {
      if (!disabled || isOpenControlled || !openState) return;
      setOpenState(false);
      onOpenChange?.(false);
    }, [disabled, isOpenControlled, onOpenChange, openState]);

    const [inputText, setInputText] = React.useState(current);
    const [wrappedHasInteractiveChild, setWrappedHasInteractiveChild] = React.useState(false);
    React.useEffect(() => setInputText(current), [current]);

    const { triggerRef, floatingRef: panelRef, floatingStyle, zIndex: panelZIndex } = useFloating<ColorPickerTriggerElement, HTMLDivElement>({
      open,
      placement,
      panelWidth: 256,
      panelHeight: 300,
    });
    const portalContainer = usePortalContainer();
    const panelId = React.useId();

    useOverlayLayer({
      open: open && !disabled && portalContainer != null,
      containerRef: panelRef,
      ownerRef: triggerRef,
      zIndex: panelZIndex,
      onEscape: () => setOpen(false),
      restoreFocus: true,
    });

    /** 合并定位引用与组件公开 ref。 */
    const setTriggerRef = React.useCallback((node: ColorPickerTriggerElement | null) => {
      (triggerRef as React.MutableRefObject<ColorPickerTriggerElement | null>).current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    }, [ref, triggerRef]);

    /** 记录包装内容是否自带交互语义，避免产生嵌套按钮角色。 */
    const setWrappedTriggerRef = React.useCallback((node: HTMLSpanElement | null) => {
      setTriggerRef(node);
      if (!node) return;
      const hasInteractiveChild = !!node?.querySelector(
        "button,input,select,textarea,a[href],[role='button'],[role='link']"
      );
      setWrappedHasInteractiveChild(hasInteractiveChild);
    }, [setTriggerRef]);

    React.useEffect(() => {
      if (!open) return;
      const onDown = (e: MouseEvent) => {
        const t = e.target as Node;
        if (triggerRef.current?.contains(t)) return;
        if (panelRef.current?.contains(t)) return;
        setOpen(false);
      };
      document.addEventListener("mousedown", onDown);
      return () => {
        document.removeEventListener("mousedown", onDown);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const commit = (hex: string, done: boolean) => {
      const n = normalizeHex(hex);
      if (!n) return;
      if (!isControlled) setInternal(n);
      onChange?.(n);
      if (done) onChangeComplete?.(n);
    };

    const hsv = hexToHsv(current) ?? [0, 100, 100];
    const [h, s, v] = hsv;

    const handleBoard = (ns: number, nv: number, done: boolean) => {
      commit(hsvToHex(h, ns, nv), done);
    };
    const handleHue = (nh: number, done: boolean) => {
      commit(hsvToHex(nh, s, v), done);
    };

    const handleInputBlur = () => {
      const n = normalizeHex(inputText);
      if (n) commit(n, true);
      else setInputText(current);
    };

    const handleInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        (e.target as HTMLInputElement).blur();
      }
    };

    /** 六位 hex 实时提交；三位简写保留草稿并在失焦时提交。 */
    const handleInputChange = (next: string) => {
      setInputText(next);
      const digits = next.trim().replace(/^#/, "");
      if (digits.length === 6 && normalizeHex(next)) commit(next, false);
    };

    const childElement = React.isValidElement(children)
      ? (children as React.ReactElement<ColorPickerCustomTriggerProps>)
      : null;
    const childSupportsRef = childElement ? supportsDomRef(childElement.type) : false;
    const childType = childElement && typeof childElement.type === "string"
      ? childElement.type
      : undefined;
    const nativeInteractive =
      childType === "button" ||
      childType === "input" ||
      childType === "select" ||
      childType === "textarea" ||
      (childType === "a" && childElement?.props.href != null);

    /** 合并自定义触发器的点击行为，同时尊重调用方阻止默认行为的结果。 */
    const handleCustomClick = (event: React.MouseEvent<HTMLElement>) => {
      if (disabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      childElement?.props.onClick?.(event);
      onClick?.(event as unknown as React.MouseEvent<HTMLButtonElement>);
      if (!event.defaultPrevented) setOpen(!open);
    };

    /** 包装触发器只处理冒泡事件，避免再次调用子组件已经执行过的处理器。 */
    const handleWrappedClick = (event: React.MouseEvent<HTMLSpanElement>) => {
      if (disabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      onClick?.(event as unknown as React.MouseEvent<HTMLButtonElement>);
      if (!event.defaultPrevented) setOpen(!open);
    };

    /** 为非原生交互节点补充 Enter 与空格键触发行为。 */
    const handleCustomKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
      childElement?.props.onKeyDown?.(event);
      onKeyDown?.(event as unknown as React.KeyboardEvent<HTMLButtonElement>);
      if (event.defaultPrevented || disabled) return;
      const current = event.currentTarget;
      const handlesKeyboardNatively =
        current.matches("button,input,select,textarea") ||
        (current.matches("a") && current.hasAttribute("href"));
      if (!handlesKeyboardNatively && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        setOpen(!open);
      }
    };

    /** 为包装触发器补充键盘行为，并避免重复调用子组件处理器。 */
    const handleWrappedKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
      onKeyDown?.(event as unknown as React.KeyboardEvent<HTMLButtonElement>);
      if (event.defaultPrevented || disabled) return;
      const target = event.target as HTMLElement;
      const handlesKeyboardNatively =
        target.matches("button,input,select,textarea") ||
        (target.matches("a") && target.hasAttribute("href"));
      if (!handlesKeyboardNatively && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        setOpen(!open);
      }
    };

    const customTrigger = childElement && childSupportsRef
      ? React.cloneElement(childElement, {
          ...rest,
          ref: setTriggerRef,
          role: childElement.props.role ?? (nativeInteractive ? undefined : "button"),
          tabIndex: disabled ? -1 : childElement.props.tabIndex ?? tabIndex ?? (nativeInteractive ? undefined : 0),
          ...(childType === "button" || typeof childElement.type !== "string"
            ? { disabled: childElement.props.disabled ?? disabled }
            : {}),
          "aria-disabled": disabled || undefined,
          "aria-haspopup": "dialog",
          "aria-expanded": open,
          "aria-controls": open ? panelId : undefined,
          onClick: handleCustomClick,
          onKeyDown: handleCustomKeyDown,
        } as ColorPickerCustomTriggerProps & React.RefAttributes<ColorPickerTriggerElement>)
      : null;

    /** 让纯文本或无法接收 ref 的自定义内容拥有稳定定位节点与键盘行为。 */
    const wrappedCustomTrigger = children != null && !customTrigger ? (
      <span
        {...(rest as React.HTMLAttributes<HTMLSpanElement>)}
        ref={setWrappedTriggerRef}
        className="cp-custom-trigger"
        role={wrappedHasInteractiveChild ? undefined : "button"}
        tabIndex={wrappedHasInteractiveChild ? undefined : disabled ? -1 : tabIndex ?? 0}
        aria-disabled={disabled || undefined}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={
          (rest as React.AriaAttributes)["aria-label"] ??
          (typeof children === "string" ? `选择颜色：${children}` : undefined)
        }
        onClickCapture={disabled
          ? (event) => {
              event.preventDefault();
              event.stopPropagation();
            }
          : (rest as React.HTMLAttributes<HTMLSpanElement>).onClickCapture}
        onKeyDownCapture={disabled
          ? (event) => {
              event.preventDefault();
              event.stopPropagation();
            }
          : (rest as React.HTMLAttributes<HTMLSpanElement>).onKeyDownCapture}
        onClick={handleWrappedClick}
        onKeyDown={handleWrappedKeyDown}
      >
        {childElement
          ? React.cloneElement(childElement, {
              "aria-haspopup": "dialog",
              "aria-expanded": open,
              "aria-controls": open ? panelId : undefined,
            } as ColorPickerCustomTriggerProps)
          : children}
      </span>
    ) : null;

    return (
      <div
        className={`cp ${placement} ${open ? "open" : ""} ${className}`}
        style={style}
      >
        {customTrigger ? (
          customTrigger
        ) : wrappedCustomTrigger ? (
          wrappedCustomTrigger
        ) : (
          <button
            type="button"
            ref={setTriggerRef}
            className={`cp-trigger ${size}`}
            disabled={disabled}
            tabIndex={tabIndex}
            onClick={(e) => {
              onClick?.(e);
              if (!disabled) setOpen(!open);
            }}
            onKeyDown={onKeyDown}
            aria-label={`选择颜色 (当前 ${current})`}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={open ? panelId : undefined}
            style={style}
            {...rest}
          >
            <span className="cp-swatch" style={{ background: current }} />
            {showText && <span className="cp-text">{current}</span>}
          </button>
        )}

        {open && !disabled && portalContainer &&
          createPortal(
            <div
              ref={panelRef}
              id={panelId}
              className="cp-panel"
              role="dialog"
              aria-label="选择颜色"
              style={floatingStyle}
            >
              <SaturationBoard hue={h} s={s} v={v} onChange={handleBoard} />
              <HueSlider hue={h} onChange={handleHue} />
              <div className="cp-row">
                <span className="cp-swatch sm" style={{ background: current }} />
                <Input
                  className="cp-input"
                  size="sm"
                  value={inputText}
                  onValueChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onKeyDown={handleInputKey}
                  spellCheck={false}
                  aria-label="十六进制颜色"
                />
              </div>
              {presets.length > 0 && (
                <div className="cp-presets">
                  {presets.map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`cp-preset ${current === normalizeHex(p) ? "active" : ""}`}
                      style={{ background: p }}
                      onClick={() => commit(p, true)}
                      aria-label={p}
                    />
                  ))}
                </div>
              )}
            </div>,
            portalContainer
          )}
      </div>
    );
  }
);
ColorPicker.displayName = "ColorPicker";
