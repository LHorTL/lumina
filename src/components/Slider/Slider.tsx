import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Slider.css";
import * as React from "react";

export type SliderRangeValue = [number, number];
export type SliderValue = number | SliderRangeValue;

interface SliderBaseProps {
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  showValue?: boolean;
  tone?: "accent" | "success" | "warning" | "danger";
  /** Custom gradient colors mapped from min→max. Overrides `tone` for fill & thumb. */
  colors?: string[];
  /** Tick marks with labels. Clicking a mark snaps to it. */
  marks?: Record<number, React.ReactNode>;
  className?: string;
}

export interface SliderSingleProps extends SliderBaseProps {
  range?: false;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
}

export interface SliderRangeProps extends SliderBaseProps {
  range: true;
  value?: SliderRangeValue;
  defaultValue?: SliderRangeValue;
  onChange?: (value: SliderRangeValue) => void;
}

export type SliderProps = SliderSingleProps | SliderRangeProps;

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function snap(raw: number, step: number, min: number) {
  return Math.round((raw - min) / step) * step + min;
}

function lerpColor(colors: string[], t: number): string {
  const pos = Math.max(0, Math.min(1, t)) * (colors.length - 1);
  const i = Math.min(Math.floor(pos), colors.length - 2);
  const frac = pos - i;
  if (frac === 0) return colors[i];
  return `color-mix(in oklch, ${colors[i + 1]} ${Math.round(frac * 100)}%, ${colors[i]})`;
}

/** `Slider` — neumorphic range input with grooved track.
 * @example <Slider defaultValue={40} showValue />
 */
export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  (props, ref) => {
    const {
      min = 0,
      max = 100,
      step = 1,
      disabled,
      showValue,
      tone = "accent",
      colors,
      marks,
      className = "",
    } = props;

    const range = (props as SliderRangeProps).range === true;
    const controlled = (props as { value?: SliderValue }).value;
    const defaultVal = (props as { defaultValue?: SliderValue }).defaultValue;
    const onChange = (props as { onChange?: (v: any) => void }).onChange;

    const initRef = React.useRef<number[]>(
      defaultVal !== undefined
        ? Array.isArray(defaultVal)
          ? [...defaultVal]
          : [defaultVal]
        : range
          ? [min, max]
          : [min]
    );
    const [inner, setInner] = React.useState<number[]>(initRef.current);

    const isControlled = controlled !== undefined;
    const vals = isControlled
      ? Array.isArray(controlled)
        ? controlled
        : [controlled]
      : inner;

    const valsRef = React.useRef(vals);
    valsRef.current = vals;

    const trackRef = React.useRef<HTMLDivElement>(null);
    const thumbEls = React.useRef<(HTMLDivElement | null)[]>([]);
    const dragging = React.useRef<number | null>(null);

    const pct = (n: number) => ((n - min) / (max - min)) * 100;

    const commit = React.useCallback(
      (next: number[]) => {
        if (!isControlled) setInner(next);
        if (range) {
          onChange?.([next[0], next[1]] as SliderRangeValue);
        } else {
          onChange?.(next[0]);
        }
      },
      [isControlled, range, onChange]
    );

    const setAt = React.useCallback(
      (index: number, raw: number) => {
        const snapped = snap(clamp(raw, min, max), step, min);
        const clamped = clamp(snapped, min, max);
        const out = [...valsRef.current];
        out[index] = clamped;
        if (range && out.length === 2 && out[0] > out[1]) out.sort((a, b) => a - b);
        commit(out);
      },
      [min, max, step, range, commit]
    );

    const valFromX = React.useCallback(
      (clientX: number) => {
        const rect = trackRef.current?.getBoundingClientRect();
        if (!rect) return min;
        const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
        return min + ratio * (max - min);
      },
      [min, max]
    );

    const closerIndex = React.useCallback(
      (target: number) => {
        const v = valsRef.current;
        if (!range || v.length < 2) return 0;
        const d0 = Math.abs(v[0] - target);
        const d1 = Math.abs(v[1] - target);
        if (d0 === d1) return target < v[0] ? 0 : 1;
        return d0 < d1 ? 0 : 1;
      },
      [range]
    );

    const onPointerDown = React.useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (disabled) return;
        e.preventDefault();
        const val = valFromX(e.clientX);
        const idx = closerIndex(val);
        dragging.current = idx;
        setAt(idx, val);
        trackRef.current?.setPointerCapture(e.pointerId);
        thumbEls.current[idx]?.focus();
      },
      [disabled, valFromX, closerIndex, setAt]
    );

    const onPointerMove = React.useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (dragging.current === null) return;
        setAt(dragging.current, valFromX(e.clientX));
      },
      [valFromX, setAt]
    );

    const onPointerUp = React.useCallback(() => {
      dragging.current = null;
    }, []);

    const handleKey = React.useCallback(
      (index: number, e: React.KeyboardEvent) => {
        if (disabled) return;
        let delta = 0;
        if (e.key === "ArrowRight" || e.key === "ArrowUp") delta = step;
        else if (e.key === "ArrowLeft" || e.key === "ArrowDown") delta = -step;
        else if (e.key === "Home") { setAt(index, min); return; }
        else if (e.key === "End") { setAt(index, max); return; }
        else return;
        e.preventDefault();
        setAt(index, valsRef.current[index] + delta);
      },
      [disabled, step, min, max, setAt]
    );

    const handleMarkClick = React.useCallback(
      (mark: number) => {
        if (disabled) return;
        setAt(closerIndex(mark), mark);
      },
      [disabled, closerIndex, setAt]
    );

    const fillLeft = range ? pct(Math.min(vals[0], vals[1])) : 0;
    const fillRight = range
      ? 100 - pct(Math.max(vals[0], vals[1]))
      : 100 - pct(vals[0]);

    const hasGradient = colors && colors.length >= 2;

    const fillStyle: React.CSSProperties = {
      left: `${fillLeft}%`,
      right: `${fillRight}%`,
    };
    if (hasGradient) {
      const w = 100 - fillLeft - fillRight;
      if (w > 0) {
        const stops = colors.map((c, i) => {
          const orig = (i / (colors.length - 1)) * 100;
          return `${c} ${((orig - fillLeft) / w * 100).toFixed(2)}%`;
        }).join(", ");
        fillStyle.background = `linear-gradient(to right, ${stops})`;
        fillStyle.boxShadow = "none";
      }
    }

    return (
      <div
        ref={ref}
        className={`slider ${range ? "range" : ""} ${hasGradient ? "gradient" : tone} ${disabled ? "disabled" : ""} ${marks ? "has-marks" : ""} ${className}`}
      >
        <div className="slider-rail">
          <div
            className="slider-track"
            ref={trackRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            <div className="slider-fill" style={fillStyle} />
          </div>

          {vals.map((n, i) => {
            const thumbStyle: React.CSSProperties = { left: `${pct(n)}%` };
            if (hasGradient) {
              (thumbStyle as any)["--slider-thumb-color"] = lerpColor(colors, (n - min) / (max - min));
            }
            return (
              <div
                key={i}
                ref={(el) => { thumbEls.current[i] = el; }}
                className="slider-thumb"
                style={thumbStyle}
                role="slider"
                tabIndex={disabled ? -1 : 0}
                aria-valuemin={min}
                aria-valuemax={max}
                aria-valuenow={n}
                aria-disabled={disabled || undefined}
                onKeyDown={(e) => handleKey(i, e)}
                onPointerDown={(e) => {
                  if (disabled) return;
                  e.preventDefault();
                  e.stopPropagation();
                  dragging.current = i;
                  trackRef.current?.setPointerCapture(e.pointerId);
                  e.currentTarget.focus();
                }}
              />
            );
          })}

          {marks && (
            <div className="slider-marks">
              {Object.entries(marks).map(([k, label]) => {
                const n = Number(k);
                const active = range
                  ? n >= Math.min(vals[0], vals[1]) && n <= Math.max(vals[0], vals[1])
                  : n <= vals[0];
                return (
                  <span
                    key={k}
                    className={`slider-mark ${active ? "active" : ""}`}
                    style={{ left: `${pct(n)}%` }}
                    onClick={() => handleMarkClick(n)}
                  >
                    <span className="slider-mark-dot" />
                    <span className="slider-mark-label">{label}</span>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {showValue && (
          <span className="slider-value">
            {range ? `${vals[0]} – ${vals[1]}` : vals[0]}
          </span>
        )}
      </div>
    );
  }
);
