import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Spin.css";
import * as React from "react";

export type SpinSize = "small" | "default" | "large" | number;

export interface SpinProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: SpinSize;
  tone?: "accent" | "success" | "warning" | "danger" | "current";
  /** Text rendered next to the indicator. */
  tip?: React.ReactNode;
  /** Same as `tip`; useful when a `label` prop reads better at call sites. */
  label?: React.ReactNode;
  /** `ring` is the default border spinner; `dots` is a three-dot bounce. */
  variant?: "ring" | "dots";
  /** Hide the indicator while preserving wrapper rendering. */
  spinning?: boolean;
  className?: string;
}

const SIZE_PX: Record<Exclude<SpinSize, number>, number> = {
  small: 14,
  default: 20,
  large: 32,
};

const resolveSize = (size: SpinSize): number =>
  typeof size === "number" ? size : SIZE_PX[size];

type IndicatorProps = React.HTMLAttributes<HTMLSpanElement> & React.RefAttributes<HTMLSpanElement>;

/** `Spin` — loading indicator. */
export const Spin = React.forwardRef<HTMLSpanElement, SpinProps>(({
  size = "default",
  tone = "accent",
  tip,
  label,
  variant = "ring",
  spinning = true,
  className = "",
  style,
  ...rest
}, ref) => {
  const text = label ?? tip;
  const px = resolveSize(size);
  const indicatorClass = `spin ${variant} ${tone}`;
  const rootClass = text ? `spin-wrap ${className}`.trim() : `${indicatorClass} ${className}`.trim();
  const indicatorStyle =
    variant === "dots"
      ? ({ fontSize: px } as React.CSSProperties)
      : ({ width: px, height: px } as React.CSSProperties);

  if (!spinning && !text) return null;

  const renderIndicator = (extraProps: IndicatorProps = {}) => {
    if (!spinning) return null;
    const {
      className: extraClassName,
      style: extraStyle,
      ...indicatorRest
    } = extraProps;
    const finalClassName = extraClassName ?? indicatorClass;
    const finalStyle = { ...indicatorStyle, ...extraStyle };

    if (variant === "dots") {
      return (
        <span className={finalClassName} style={finalStyle} aria-label="Loading" {...indicatorRest}>
          <i /><i /><i />
        </span>
      );
    }
    return (
      <span className={finalClassName} style={finalStyle} aria-label="Loading" {...indicatorRest} />
    );
  };

  if (!text) {
    return renderIndicator({
      ref,
      className: rootClass,
      style: { ...indicatorStyle, ...style },
      ...rest,
    });
  }

  return (
    <span ref={ref} className={rootClass} style={style} {...rest}>
      {renderIndicator()}
      <span className="spin-label">{text}</span>
    </span>
  );
});
Spin.displayName = "Spin";
