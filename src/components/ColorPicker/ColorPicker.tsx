import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./ColorPicker.css";
import * as React from "react";
import { createPortal } from "react-dom";
import { useFloating } from "../../utils/useFloating";

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

export interface ColorPickerProps {
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
  /** Custom trigger; defaults to a swatch chip. */
  children?: React.ReactNode;
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when open state changes. */
  onOpenChange?: (open: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
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

  return (
    <div
      ref={ref}
      className="cp-board"
      style={{ background: `hsl(${hue}, 100%, 50%)` }}
      onPointerDown={handlePointerDown}
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

  return (
    <div ref={ref} className="cp-hue" onPointerDown={handlePointerDown}>
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
export const ColorPicker = React.forwardRef<HTMLButtonElement, ColorPickerProps>(
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
    } = props;

    const isControlled = value != null;
    const [internal, setInternal] = React.useState(
      normalizeHex(defaultValue) ?? "#845ef7"
    );
    const current = normalizeHex((isControlled ? value : internal) ?? "") ?? "#845ef7";

    const isOpenControlled = openProp != null;
    const [openState, setOpenState] = React.useState(defaultOpen);
    const open = isOpenControlled ? !!openProp : openState;
    const setOpen = (next: boolean) => {
      if (!isOpenControlled) setOpenState(next);
      onOpenChange?.(next);
    };

    const [inputText, setInputText] = React.useState(current);
    React.useEffect(() => setInputText(current), [current]);

    const { triggerRef, floatingStyle } = useFloating<HTMLButtonElement>({
      open,
      placement,
      panelWidth: 256,
      panelHeight: 300,
    });
    const panelRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => triggerRef.current as HTMLButtonElement);

    React.useEffect(() => {
      if (!open) return;
      const onDown = (e: MouseEvent) => {
        const t = e.target as Node;
        if (triggerRef.current?.contains(t)) return;
        if (panelRef.current?.contains(t)) return;
        setOpen(false);
      };
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      document.addEventListener("mousedown", onDown);
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("mousedown", onDown);
        document.removeEventListener("keydown", onKey);
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

    return (
      <div
        className={`cp ${placement} ${open ? "open" : ""} ${className}`}
        style={style}
      >
        {children ? (
          <button
            type="button"
            ref={triggerRef}
            className="cp-custom-trigger"
            disabled={disabled}
            onClick={() => !disabled && setOpen(!open)}
          >
            {children}
          </button>
        ) : (
          <button
            type="button"
            ref={triggerRef}
            className={`cp-trigger ${size}`}
            disabled={disabled}
            onClick={() => !disabled && setOpen(!open)}
            aria-label={`选择颜色 (当前 ${current})`}
          >
            <span className="cp-swatch" style={{ background: current }} />
            {showText && <span className="cp-text">{current}</span>}
          </button>
        )}

        {open && !disabled && typeof document !== "undefined" &&
          createPortal(
            <div
              ref={panelRef}
              className="cp-panel"
              role="dialog"
              style={floatingStyle}
            >
              <SaturationBoard hue={h} s={s} v={v} onChange={handleBoard} />
              <HueSlider hue={h} onChange={handleHue} />
              <div className="cp-row">
                <span className="cp-swatch sm" style={{ background: current }} />
                <input
                  className="cp-input"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onBlur={handleInputBlur}
                  onKeyDown={handleInputKey}
                  spellCheck={false}
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
            document.body
          )}
      </div>
    );
  }
);
ColorPicker.displayName = "ColorPicker";
