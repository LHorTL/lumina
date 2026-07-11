import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Radio.css";
import * as React from "react";

/** 同一文档和 name 下，非受控 Radio 用于同步原生互斥状态的监听器。 */
type RadioGroupSyncListener = (selected: HTMLInputElement) => void;
const uncontrolledRadioGroups = new WeakMap<Document, Map<string, Set<RadioGroupSyncListener>>>();

/** 注册一个非受控 Radio 到原生 name 分组。 */
function registerUncontrolledRadio(input: HTMLInputElement, name: string, listener: RadioGroupSyncListener): () => void {
  let documentGroups = uncontrolledRadioGroups.get(input.ownerDocument);
  if (!documentGroups) {
    documentGroups = new Map();
    uncontrolledRadioGroups.set(input.ownerDocument, documentGroups);
  }
  let group = documentGroups.get(name);
  if (!group) {
    group = new Set();
    documentGroups.set(name, group);
  }
  group.add(listener);
  return () => {
    group!.delete(listener);
    if (group!.size === 0) documentGroups!.delete(name);
  };
}

/** 通知同名 Lumina Radio 只保留当前输入为选中状态。 */
function notifyUncontrolledRadioGroup(input: HTMLInputElement, name: string): void {
  uncontrolledRadioGroups.get(input.ownerDocument)?.get(name)?.forEach((listener) => listener(input));
}

export interface RadioProps
  extends Omit<React.LabelHTMLAttributes<HTMLLabelElement>, "onChange" | "children" | "id"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  className?: string;
  id?: string;
  /** 原生单选分组名；同一文档中同名非受控 Radio 会保持互斥。 */
  name?: string;
  /** 提交原生表单时使用的字段值。 */
  value?: string | number;
  /** 是否要求该单选分组至少选中一项。 */
  required?: boolean;
  /** 关联的原生 form 元素 id。 */
  form?: string;
}

const RadioRoot = React.forwardRef<HTMLLabelElement, RadioProps>(({
  checked,
  defaultChecked,
  onChange,
  disabled,
  label,
  className = "",
  id,
  name,
  value: formValue,
  required,
  form,
  tabIndex,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-required": ariaRequired,
  ...rest
}, ref) => {
  const [inner, setInner] = React.useState(defaultChecked ?? false);
  const isControlled = checked !== undefined;
  const value = isControlled ? checked : inner;
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useLayoutEffect(() => {
    if (!isControlled && inputRef.current && inputRef.current.checked !== inner) {
      setInner(inputRef.current.checked);
    }
  }, [inner, isControlled]);

  React.useEffect(() => {
    const input = inputRef.current;
    if (isControlled || !input || !name) return;
    return registerUncontrolledRadio(input, name, (selected) => setInner(selected === input));
  }, [isControlled, name]);

  const pick = () => {
    if (disabled) return;
    if (!isControlled) {
      setInner(true);
      if (name && inputRef.current) notifyUncontrolledRadioGroup(inputRef.current, name);
    }
    onChange?.(true);
  };

  return (
    <label
      ref={ref}
      className={`radio ${value ? "checked" : ""} ${disabled ? "disabled" : ""} ${className}`}
      {...rest}
    >
      <input
        ref={inputRef}
        type="radio"
        className="radio-native"
        checked={value}
        disabled={disabled}
        onChange={pick}
        id={id}
        name={name}
        value={formValue}
        required={required}
        form={form}
        tabIndex={tabIndex}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        aria-required={ariaRequired}
      />
      <span aria-hidden="true" className="radio-dot" />
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
  /** 原生单选分组名；省略时自动生成稳定名称。 */
  name?: string;
  /** 是否要求该组选中一项。 */
  required?: boolean;
  /** 关联的原生 form 元素 id。 */
  form?: string;
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
  name,
  required,
  form,
  direction,
  variant = "default",
  size = "md",
  className = "",
  onKeyDown,
  ...rest
}: RadioGroupProps<T>, ref: React.ForwardedRef<HTMLDivElement>) => {
  const [inner, setInner] = React.useState<T | undefined>(defaultValue);
  const generatedName = React.useId();
  const groupRef = React.useRef<HTMLDivElement | null>(null);
  const [thumb, setThumb] = React.useState({ left: 0, width: 0, ready: false });
  const isControlled = value !== undefined;
  const current = isControlled ? value : inner;
  const currentOption = options.find((option) => option.value === current);
  const rovingValue = currentOption && !currentOption.disabled
    ? currentOption.value
    : options.find((option) => !option.disabled)?.value;

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
  const groupName = name ?? `lumina-radio-${generatedName.replace(/:/g, "")}`;

  /** 使用方向键在可用单选项之间循环移动并选择。 */
  const handleGroupKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key)) return;
    const inputs = Array.from(
      groupRef.current?.querySelectorAll<HTMLInputElement>('input[type="radio"]:not(:disabled)') ?? []
    );
    if (!inputs.length) return;
    const activeIndex = Math.max(0, inputs.indexOf(document.activeElement as HTMLInputElement));
    const delta = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
    const next = inputs[(activeIndex + delta + inputs.length) % inputs.length];
    event.preventDefault();
    next.focus();
    next.click();
  };

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
    <div ref={setGroupRef} {...rest} role="radiogroup" onKeyDown={handleGroupKeyDown} className={`radio-group ${resolvedDirection} ${variant} ${size} ${className}`}>
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
          name={groupName}
          required={required}
          form={form}
          value={opt.value}
          tabIndex={rovingValue === opt.value ? 0 : -1}
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
