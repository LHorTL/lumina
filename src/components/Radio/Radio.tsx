import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Radio.css";
import * as React from "react";

export interface RadioProps
  extends Omit<React.LabelHTMLAttributes<HTMLLabelElement>, "onChange" | "children" | "id"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  className?: string;
  id?: string;
}

const RadioRoot = React.forwardRef<HTMLLabelElement, RadioProps>(({
  checked,
  defaultChecked,
  onChange,
  disabled,
  label,
  className = "",
  id,
  ...rest
}, ref) => {
  const [inner, setInner] = React.useState(defaultChecked ?? false);
  const isControlled = checked !== undefined;
  const value = isControlled ? checked : inner;

  const pick = () => {
    if (disabled) return;
    if (!isControlled) setInner(true);
    onChange?.(true);
  };

  return (
    <label
      ref={ref}
      className={`radio ${value ? "checked" : ""} ${disabled ? "disabled" : ""} ${className}`}
      onClick={pick}
      {...rest}
    >
      <button
        type="button"
        role="radio"
        aria-checked={value}
        disabled={disabled}
        onClick={(event) => {
          event.stopPropagation();
          pick();
        }}
        id={id}
        className="radio-dot"
      />
      {label && <span className="radio-label">{label}</span>}
    </label>
  );
});
RadioRoot.displayName = "Radio";

export interface RadioOption<T extends string | number = string> {
  value: T;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps<T extends string | number = string>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  options: RadioOption<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  name?: string;
  direction?: "vertical" | "horizontal";
  variant?: "default" | "segmented";
  size?: "sm" | "md" | "lg";
  className?: string;
}

type RadioGroupComponent = <T extends string | number = string>(
  props: RadioGroupProps<T> & React.RefAttributes<HTMLDivElement>
) => React.ReactElement | null;

const RadioGroupInner = <T extends string | number = string>({
  options,
  value,
  defaultValue,
  onChange,
  direction,
  variant = "default",
  size = "md",
  className = "",
  ...rest
}: RadioGroupProps<T>, ref: React.ForwardedRef<HTMLDivElement>) => {
  const [inner, setInner] = React.useState<T | undefined>(defaultValue);
  const groupRef = React.useRef<HTMLDivElement | null>(null);
  const [thumb, setThumb] = React.useState({ left: 0, width: 0, ready: false });
  const isControlled = value !== undefined;
  const current = isControlled ? value : inner;

  const setGroupRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      groupRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );

  const pick = (v: T) => {
    if (!isControlled) setInner(v);
    onChange?.(v);
  };

  const resolvedDirection = direction ?? (variant === "segmented" ? "horizontal" : "vertical");

  React.useLayoutEffect(() => {
    if (variant !== "segmented") return;
    const group = groupRef.current;
    if (!group) return;

    const updateThumb = () => {
      const active = group.querySelector<HTMLElement>(".radio.checked");
      if (!active) {
        setThumb((prev) => (prev.ready ? { left: prev.left, width: prev.width, ready: false } : prev));
        return;
      }
      const next = {
        left: active.offsetLeft,
        width: active.offsetWidth,
        ready: true,
      };
      setThumb((prev) =>
        prev.left === next.left && prev.width === next.width && prev.ready === next.ready
          ? prev
          : next
      );
    };

    updateThumb();
    const frame = requestAnimationFrame(updateThumb);
    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateThumb) : null;
    if (observer) {
      observer.observe(group);
      group.querySelectorAll<HTMLElement>(".radio").forEach((item) => observer.observe(item));
    }
    window.addEventListener("resize", updateThumb);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", updateThumb);
    };
  }, [current, options, size, variant]);

  return (
    <div ref={setGroupRef} className={`radio-group ${resolvedDirection} ${variant} ${size} ${className}`} {...rest}>
      {variant === "segmented" && (
        <span
          aria-hidden
          className="radio-segment-thumb"
          style={{
            width: thumb.width,
            transform: `translateX(${thumb.left}px)`,
            opacity: thumb.ready ? 1 : 0,
          }}
        />
      )}
      {options.map((opt) => (
        <RadioRoot
          key={String(opt.value)}
          label={opt.label}
          checked={current === opt.value}
          disabled={opt.disabled}
          onChange={() => pick(opt.value)}
        />
      ))}
    </div>
  );
};

/** `RadioGroup` — mutually exclusive options. */
export const RadioGroup = React.forwardRef(RadioGroupInner) as RadioGroupComponent;
(RadioGroup as any).displayName = "RadioGroup";

export const Radio = RadioRoot as typeof RadioRoot & { Group: typeof RadioGroup };
Radio.Group = RadioGroup;
