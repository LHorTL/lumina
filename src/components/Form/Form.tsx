import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Form.css";
import * as React from "react";

/* ============================================================================
 * Form — minimal antd-compatible form with validation + field binding.
 *
 * Scope:
 * - useForm() → [FormInstance]
 * - <Form form={} layout initialValues onFinish onFinishFailed onValuesChange>
 * - <Form.Item name label rules noStyle valuePropName trigger initialValue help>
 * - Rules: required / message / pattern / min / max / len / validator / type
 *
 * Not supported (to keep v1 tight):
 * - nested field names ("user.name" dotted paths)
 * - Form.List
 * - dependencies / shouldUpdate
 * - labelCol / wrapperCol layout grid
 * ========================================================================== */

export type FormLayout = "horizontal" | "vertical" | "inline";

export type Rule = {
  required?: boolean;
  message?: string;
  pattern?: RegExp;
  min?: number;
  max?: number;
  len?: number;
  type?: "string" | "number" | "email" | "url" | "array";
  whitespace?: boolean;
  validator?: (rule: Rule, value: unknown) => Promise<void> | void;
};

export interface ErrorField {
  name: string;
  errors: string[];
}

export interface FormInstance<V extends Record<string, unknown> = Record<string, unknown>> {
  getFieldValue: <T = unknown>(name: string) => T;
  getFieldsValue: (names?: string[]) => V;
  setFieldValue: (name: string, value: unknown) => void;
  setFieldsValue: (values: Partial<V>) => void;
  resetFields: (names?: string[]) => void;
  validateFields: (names?: string[]) => Promise<V>;
  isFieldTouched: (name: string) => boolean;
  getFieldError: (name: string) => string[];
  /** Programmatic submit — runs validate then onFinish/onFinishFailed. */
  submit: () => void;
}

interface FieldEntry {
  rules: Rule[];
  initial?: unknown;
}

interface InternalStore {
  values: Record<string, unknown>;
  errors: Record<string, string[]>;
  touched: Set<string>;
  initial: Record<string, unknown>;
  fields: Map<string, FieldEntry>;
  fieldSubs: Map<string, Set<() => void>>;
  formSubs: Set<() => void>;
  onSubmit?: () => void;
  onValuesChange?: (changed: Record<string, unknown>, all: Record<string, unknown>) => void;
}

function makeStore(): InternalStore {
  return {
    values: {},
    errors: {},
    touched: new Set(),
    initial: {},
    fields: new Map(),
    fieldSubs: new Map(),
    formSubs: new Set(),
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/.+/i;

async function validateSingle(rule: Rule, value: unknown): Promise<string | null> {
  const msg = rule.message;
  const isEmpty = value == null || value === "" || (Array.isArray(value) && value.length === 0);

  if (rule.required && isEmpty) return msg ?? "必填项";
  if (rule.whitespace && typeof value === "string" && value.trim() === "") return msg ?? "不能为空";

  // Only run remaining checks when value is present.
  if (isEmpty) return null;

  if (rule.type === "email" && typeof value === "string" && !EMAIL_RE.test(value)) return msg ?? "邮箱格式不正确";
  if (rule.type === "url" && typeof value === "string" && !URL_RE.test(value)) return msg ?? "链接格式不正确";
  if (rule.type === "number" && typeof value !== "number" && isNaN(Number(value))) return msg ?? "必须是数字";
  if (rule.type === "array" && !Array.isArray(value)) return msg ?? "必须是数组";

  if (rule.pattern && typeof value === "string" && !rule.pattern.test(value)) return msg ?? "格式不正确";

  const strLen = typeof value === "string" ? value.length : Array.isArray(value) ? value.length : undefined;
  if (rule.len != null && strLen != null && strLen !== rule.len) return msg ?? `长度必须是 ${rule.len}`;
  if (rule.min != null && strLen != null && strLen < rule.min) return msg ?? `至少 ${rule.min} 个字符`;
  if (rule.max != null && strLen != null && strLen > rule.max) return msg ?? `最多 ${rule.max} 个字符`;
  if (rule.min != null && typeof value === "number" && value < rule.min) return msg ?? `不能小于 ${rule.min}`;
  if (rule.max != null && typeof value === "number" && value > rule.max) return msg ?? `不能大于 ${rule.max}`;

  if (rule.validator) {
    try {
      await rule.validator(rule, value);
    } catch (err) {
      if (typeof err === "string") return err;
      if (err instanceof Error) return err.message;
      return msg ?? "校验未通过";
    }
  }

  return null;
}

async function validateField(store: InternalStore, name: string): Promise<string[]> {
  const entry = store.fields.get(name);
  if (!entry) return [];
  const value = store.values[name];
  const errs: string[] = [];
  for (const rule of entry.rules) {
    const err = await validateSingle(rule, value);
    if (err) errs.push(err);
  }
  store.errors[name] = errs;
  return errs;
}

function notifyField(store: InternalStore, name: string) {
  store.fieldSubs.get(name)?.forEach((fn) => fn());
}
function notifyAll(store: InternalStore) {
  store.formSubs.forEach((fn) => fn());
}

function buildInstance<V extends Record<string, unknown>>(store: InternalStore): FormInstance<V> {
  return {
    getFieldValue: <T,>(name: string) => store.values[name] as T,
    getFieldsValue: (names) => {
      if (!names) return { ...store.values } as V;
      const out: Record<string, unknown> = {};
      for (const n of names) out[n] = store.values[n];
      return out as V;
    },
    setFieldValue: (name, value) => {
      const prev = store.values[name];
      store.values[name] = value;
      store.touched.add(name);
      if (store.fields.has(name)) {
        void validateField(store, name).then(() => notifyField(store, name));
      }
      notifyField(store, name);
      notifyAll(store);
      if (prev !== value) store.onValuesChange?.({ [name]: value }, { ...store.values });
    },
    setFieldsValue: (values) => {
      const changed: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(values)) {
        if (store.values[k] !== v) changed[k] = v;
        store.values[k] = v;
        store.touched.add(k);
        notifyField(store, k);
      }
      notifyAll(store);
      if (Object.keys(changed).length > 0) store.onValuesChange?.(changed, { ...store.values });
    },
    resetFields: (names) => {
      const keys = names ?? Array.from(store.fields.keys());
      for (const k of keys) {
        store.values[k] = store.initial[k];
        store.errors[k] = [];
        store.touched.delete(k);
        notifyField(store, k);
      }
      notifyAll(store);
    },
    validateFields: async (names) => {
      const keys = names ?? Array.from(store.fields.keys());
      const errorFields: ErrorField[] = [];
      for (const k of keys) {
        const errs = await validateField(store, k);
        notifyField(store, k);
        if (errs.length > 0) errorFields.push({ name: k, errors: errs });
      }
      notifyAll(store);
      if (errorFields.length > 0) {
        const err = new Error("Validation failed") as Error & {
          errorFields: ErrorField[];
          values: Record<string, unknown>;
        };
        err.errorFields = errorFields;
        err.values = { ...store.values };
        throw err;
      }
      const out: Record<string, unknown> = {};
      for (const k of keys) out[k] = store.values[k];
      return out as V;
    },
    isFieldTouched: (name) => store.touched.has(name),
    getFieldError: (name) => store.errors[name] ?? [],
    submit: () => store.onSubmit?.(),
  };
}

const STORE_SYMBOL = Symbol.for("lumina.form.store");

type InstanceWithStore<V extends Record<string, unknown>> = FormInstance<V> & {
  [STORE_SYMBOL]: InternalStore;
};

/** `Form.useForm()` — create a form instance. Same shape as antd's hook. */
export function useForm<V extends Record<string, unknown> = Record<string, unknown>>(): [FormInstance<V>] {
  const ref = React.useRef<InstanceWithStore<V>>();
  if (!ref.current) {
    const store = makeStore();
    const instance = buildInstance<V>(store) as InstanceWithStore<V>;
    (instance as InstanceWithStore<V>)[STORE_SYMBOL] = store;
    ref.current = instance;
  }
  return [ref.current];
}

function getStore<V extends Record<string, unknown>>(instance: FormInstance<V>): InternalStore {
  return (instance as unknown as InstanceWithStore<V>)[STORE_SYMBOL];
}

/* ---------------------------- Context ---------------------------- */

interface FormCtxValue {
  store: InternalStore;
  layout: FormLayout;
  requiredMark: boolean;
  disabled: boolean;
}

const FormCtx = React.createContext<FormCtxValue | null>(null);

/* ---------------------------- Form Root ---------------------------- */

export interface FormProps<V extends Record<string, unknown> = Record<string, unknown>>
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onChange" | "onSubmit"> {
  form?: FormInstance<V>;
  layout?: FormLayout;
  initialValues?: Partial<V>;
  onFinish?: (values: V) => void;
  onFinishFailed?: (info: { values: Partial<V>; errorFields: ErrorField[] }) => void;
  onValuesChange?: (changed: Partial<V>, all: V) => void;
  /** Show the `*` mark before required field labels. Default true. */
  requiredMark?: boolean;
  /** Disable all fields inside. */
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

type FormRootComponent = <V extends Record<string, unknown> = Record<string, unknown>>(
  props: FormProps<V> & React.RefAttributes<HTMLFormElement>
) => React.ReactElement | null;

const FormRootInner = <V extends Record<string, unknown> = Record<string, unknown>>(
  props: FormProps<V>,
  ref: React.ForwardedRef<HTMLFormElement>
) => {
  const {
    form: externalForm,
    layout = "horizontal",
    initialValues,
    onFinish,
    onFinishFailed,
    onValuesChange,
    requiredMark = true,
    disabled = false,
    children,
    className = "",
    ...rest
  } = props;

  const [internalForm] = useForm<V>();
  const form = externalForm ?? internalForm;
  const store = getStore(form);

  // Apply initial values + wire callbacks on first render only.
  const initRef = React.useRef(false);
  if (!initRef.current) {
    if (initialValues) {
      for (const [k, v] of Object.entries(initialValues)) {
        store.initial[k] = v;
        if (store.values[k] === undefined) store.values[k] = v;
      }
    }
    initRef.current = true;
  }

  store.onValuesChange = onValuesChange
    ? (changed, all) => onValuesChange(changed as Partial<V>, all as V)
    : undefined;

  const doSubmit = React.useCallback(() => {
    form
      .validateFields()
      .then((values) => onFinish?.(values))
      .catch((err: Error & { errorFields?: ErrorField[]; values?: Partial<V> }) => {
        if (err?.errorFields) {
          onFinishFailed?.({
            values: (err.values ?? {}) as Partial<V>,
            errorFields: err.errorFields,
          });
        }
      });
  }, [form, onFinish, onFinishFailed]);

  store.onSubmit = doSubmit;

  const ctxValue = React.useMemo<FormCtxValue>(
    () => ({ store, layout, requiredMark, disabled }),
    [store, layout, requiredMark, disabled]
  );

  return (
    <FormCtx.Provider value={ctxValue}>
      <form
        ref={ref}
        className={`lumina-form layout-${layout} ${className}`}
        onSubmit={(e) => {
          e.preventDefault();
          doSubmit();
        }}
        {...rest}
      >
        {children}
      </form>
    </FormCtx.Provider>
  );
};

const FormRoot = React.forwardRef(FormRootInner) as FormRootComponent;
(FormRoot as any).displayName = "Form";

/* ---------------------------- Form.Item ---------------------------- */

export interface FormItemProps {
  /** Field key. Omit for layout-only wrappers (no value binding). */
  name?: string;
  label?: React.ReactNode;
  rules?: Rule[];
  /** Render no wrapper — emit only the (bound) child. */
  noStyle?: boolean;
  /** Inject value into this prop name on the child. Default `"value"`. */
  valuePropName?: string;
  /** Listen for changes on this event name. Default `"onChange"`. */
  trigger?: string;
  /** Event names that trigger validation. Default `["onChange"]`. */
  validateTrigger?: string | string[];
  /** Initial value (used when the form instance has no value yet). */
  initialValue?: unknown;
  /** Extra help text shown under the field. Hidden when an error is shown. */
  help?: React.ReactNode;
  /** Supplementary description below the help line. */
  extra?: React.ReactNode;
  /** Explicitly mark the field as required (cosmetic). */
  required?: boolean;
  /** Hide the entire item (still keeps the field in the form). */
  hidden?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const extractValue = (valuePropName: string, args: unknown[]) => {
  const first = args[0];
  if (first && typeof first === "object") {
    const anyFirst = first as { target?: { value?: unknown; checked?: unknown } };
    if (anyFirst.target && "value" in anyFirst.target) {
      return valuePropName === "checked" ? anyFirst.target.checked : anyFirst.target.value;
    }
  }
  return first;
};

export const FormItem: React.FC<FormItemProps> = ({
  name,
  label,
  rules,
  noStyle,
  valuePropName = "value",
  trigger = "onChange",
  initialValue,
  help,
  extra,
  required,
  hidden,
  children,
  className = "",
  style,
}) => {
  const ctx = React.useContext(FormCtx);
  const [, tick] = React.useReducer((n: number) => n + 1, 0);

  // Register field + subscribe to its changes.
  React.useEffect(() => {
    if (!ctx || !name) return;
    const store = ctx.store;
    if (initialValue !== undefined) {
      if (store.initial[name] === undefined) store.initial[name] = initialValue;
      if (store.values[name] === undefined) store.values[name] = initialValue;
    }
    store.fields.set(name, { rules: rules ?? [], initial: initialValue });
    let subs = store.fieldSubs.get(name);
    if (!subs) {
      subs = new Set();
      store.fieldSubs.set(name, subs);
    }
    subs.add(tick);
    return () => {
      subs!.delete(tick);
      store.fields.delete(name);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx, name]);

  // Keep rules fresh across re-renders.
  React.useEffect(() => {
    if (!ctx || !name) return;
    const entry = ctx.store.fields.get(name);
    if (entry) entry.rules = rules ?? [];
  }, [ctx, name, rules]);

  if (hidden) return null;

  const hasName = !!name;
  const isRequired =
    required === true || (rules?.some((r) => r.required) ?? false);

  // Unbound mode (no name) — render children as-is.
  if (!hasName) {
    const content = children as React.ReactNode;
    if (noStyle) return <>{content}</>;
    return (
      <div className={`form-item ${className}`} style={style}>
        {label && <div className="form-item-label">{label}</div>}
        <div className="form-item-control">{content}</div>
        {help && <div className="form-item-help">{help}</div>}
        {extra && <div className="form-item-extra">{extra}</div>}
      </div>
    );
  }

  const store = ctx?.store;
  const value = store?.values[name!];
  const errors = store?.errors[name!] ?? [];
  const hasError = errors.length > 0;

  const bound = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement, {
        [valuePropName]: value ?? (valuePropName === "checked" ? false : ""),
        [trigger]: (...args: unknown[]) => {
          const next = extractValue(valuePropName, args);
          store?.values && (store.values[name!] = next);
          store?.touched.add(name!);
          if (store) {
            void validateField(store, name!).then(() => notifyField(store, name!));
            notifyField(store, name!);
            notifyAll(store);
            store.onValuesChange?.({ [name!]: next }, { ...store.values });
          }
          const childTrigger = (children as React.ReactElement).props?.[trigger];
          if (typeof childTrigger === "function") childTrigger(...args);
        },
        disabled:
          (children as React.ReactElement).props?.disabled ?? ctx?.disabled,
        ...(hasError ? { invalid: true } : {}),
      })
    : children;

  if (noStyle) return <>{bound}</>;

  return (
    <div className={`form-item ${hasError ? "has-error" : ""} ${className}`} style={style}>
      {label && (
        <div className="form-item-label">
          {isRequired && ctx?.requiredMark !== false && (
            <span className="form-item-required" aria-hidden>*</span>
          )}
          {label}
        </div>
      )}
      <div className="form-item-control">{bound}</div>
      {hasError ? (
        <div className="form-item-error">{errors[0]}</div>
      ) : help ? (
        <div className="form-item-help">{help}</div>
      ) : null}
      {extra && <div className="form-item-extra">{extra}</div>}
    </div>
  );
};

/* ---------------------------- Assembly ---------------------------- */

export const Form = FormRoot as typeof FormRoot & {
  Item: typeof FormItem;
  useForm: typeof useForm;
};
Form.Item = FormItem;
Form.useForm = useForm;
