import * as React from "react";
import type { AccentKey, ResolvedThemeColors, ThemeBaseMode } from "./themeTypes";
import type {
  ComponentTheme,
  ComponentThemeName,
  ComponentThemeOptions,
  ComponentThemeOverride,
  ComponentThemeOverrides,
  ComponentThemeProps,
  ComponentThemeScope,
} from "./componentThemeTypes";
export type {
  ComponentTheme,
  ComponentThemeName,
  ComponentThemeOptions,
  ComponentThemeOverride,
  ComponentThemeOverrides,
  ComponentThemeProps,
  ComponentThemeScope,
} from "./componentThemeTypes";
import {
  componentTokensToStyle,
  DEFAULT_THEME_COLORS,
  resolveVisualThemeSnapshot,
  visualThemeToStyle,
} from "./Theme";
import {
  ComponentOverridesProvider,
  OwnerPortalThemeProvider,
  VisualThemeProvider,
  subscribeImperativeThemeChange,
  useComponentOverrides,
  useOwnerPortalTheme,
  useVisualThemeSnapshot,
  type VisualThemeSnapshot,
} from "./themeRuntime";

/** 浏览器中同步读取主题 DOM，服务端回退为普通副作用以避免 SSR 警告。 */
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

/** 组件主题边界交给真实 DOM 根节点和 Portal 的解析结果。 */
export interface ComponentThemeRenderState {
  active: boolean;
  scope: ComponentThemeScope;
  snapshot: VisualThemeSnapshot;
  rootStyle: React.CSSProperties;
  rootDataAttributes: Record<string, string | undefined>;
  portalStyle: React.CSSProperties;
  portalDataAttributes: Record<string, string | undefined>;
  styles: Partial<Record<string, React.CSSProperties>>;
}

const ACCENT_KEYS = new Set<AccentKey>([
  "sky",
  "coral",
  "mint",
  "violet",
  "amber",
  "rose",
]);

const InternalComponentThemePartContext = React.createContext<
  readonly ComponentThemeName[]
>([]);

/** 复合组件内部明确拥有的 Lumina 子控件主题范围属性。 */
export interface InternalComponentThemePartProps {
  components: ComponentThemeName | readonly ComponentThemeName[];
  children?: React.ReactNode;
}

/**
 * 标记复合组件自己渲染的子控件，使其继续继承 owner 的 self 主题。
 * 该组件不创建 DOM，业务 children 不应包在此范围内。
 */
export function InternalComponentThemePart({
  components,
  children,
}: InternalComponentThemePartProps) {
  const inherited = React.useContext(InternalComponentThemePartContext);
  const value = React.useMemo<readonly ComponentThemeName[]>(() => {
    const next = Array.isArray(components) ? components : [components];
    return [...inherited, ...next];
  }, [components, inherited]);
  return (
    <InternalComponentThemePartContext.Provider value={value}>
      {children}
    </InternalComponentThemePartContext.Provider>
  );
}

/** 解析后颜色字段与全局 CSS 变量的稳定映射。 */
const THEME_COLOR_VARIABLES: Record<keyof ResolvedThemeColors, string> = {
  bg: "--bg",
  bgRaised: "--bg-raised",
  bgSunken: "--bg-sunken",
  fg: "--fg",
  fgMuted: "--fg-muted",
  fgSubtle: "--fg-subtle",
  border: "--border",
  divider: "--divider",
  shadowDark: "--shadow-dark",
  shadowLight: "--shadow-light",
  accent: "--accent",
  accentInk: "--accent-ink",
  accentSoft: "--accent-soft",
  accentGlow: "--accent-glow",
  info: "--info",
  success: "--success",
  warning: "--warning",
  danger: "--danger",
};

/** 把字符串简写和对象统一为组件主题配置。 */
export function normalizeComponentThemeInput(
  theme: ComponentTheme | undefined
): ComponentThemeOptions | undefined {
  if (theme === undefined) return undefined;
  if (typeof theme === "string") {
    return ACCENT_KEYS.has(theme as AccentKey)
      ? { accent: theme as AccentKey }
      : { baseColor: theme };
  }
  return theme;
}

/** 合并组件类型覆盖和组件自身 theme，自身字段优先。 */
function mergeComponentTheme(
  inherited: ComponentThemeOverride | undefined,
  own: ComponentThemeOptions | undefined
): ComponentThemeOptions | undefined {
  if (!inherited && !own) return undefined;
  return {
    ...inherited,
    ...own,
    colors: { ...(inherited?.colors ?? {}), ...(own?.colors ?? {}) },
    tokens: { ...(inherited?.tokens ?? {}), ...(own?.tokens ?? {}) },
    components: own?.components,
  };
}

/** 判断 Icon 是否明确配置了会改变前景色的局部主题字段。 */
function hasExplicitIconForeground(
  config: ComponentThemeOptions | undefined
): boolean {
  if (!config) return false;
  return (
    config.baseColor !== undefined ||
    config.colorScheme !== undefined ||
    config.colors?.fg !== undefined ||
    config.tokens?.fg !== undefined ||
    config.tokens?.["--fg"] !== undefined ||
    config.tokens?.["--lmn-icon-fg"] !== undefined
  );
}

/** 读取最近静态主题作用域的明暗模式。 */
function getStaticColorScheme(rootElement?: Element | null): ThemeBaseMode {
  if (typeof document === "undefined") return "light";
  const inheritedElement = rootElement?.parentElement ?? document.documentElement;
  const themeScope = inheritedElement.closest<HTMLElement>("[data-theme]");
  return themeScope?.dataset.theme === "dark" ? "dark" : "light";
}

/** 判断组件是否位于 document 根节点之外的静态局部主题作用域。 */
function hasLocalStaticThemeScope(rootElement?: Element | null): boolean {
  if (!rootElement || typeof document === "undefined") return false;
  const themeScope = rootElement.parentElement?.closest<HTMLElement>("[data-theme]");
  return (
    themeScope != null &&
    themeScope !== document.documentElement &&
    themeScope !== document.body
  );
}

/** 返回无需读取计算样式的默认视觉快照。 */
function getFallbackSnapshot(rootElement?: Element | null): VisualThemeSnapshot {
  const colorScheme = getStaticColorScheme(rootElement);
  return {
    colorScheme,
    intensity: 5,
    colors: { ...DEFAULT_THEME_COLORS[colorScheme] },
  };
}

/** 返回未处于 ThemeProvider 时最近静态作用域真实生效的视觉快照。 */
function getDefaultSnapshot(rootElement?: Element | null): VisualThemeSnapshot {
  const fallback = getFallbackSnapshot(rootElement);
  if (typeof window === "undefined" || typeof document === "undefined") {
    return fallback;
  }

  const inheritedElement = rootElement?.parentElement ?? document.documentElement;
  const computed = window.getComputedStyle(inheritedElement);
  const colors = { ...fallback.colors };
  for (const key of Object.keys(THEME_COLOR_VARIABLES) as Array<keyof ResolvedThemeColors>) {
    const value = computed.getPropertyValue(THEME_COLOR_VARIABLES[key]).trim();
    if (value) colors[key] = value;
  }
  const shadowDepth = Number.parseFloat(computed.getPropertyValue("--d"));
  const intensity = Number.isFinite(shadowDepth)
    ? (shadowDepth - 0.4) / 0.12
    : fallback.intensity;
  return { ...fallback, intensity, colors };
}

/** 用 guaranteed-invalid 值阻断外层同组件实例的自定义短 token 继续继承。 */
function createInheritedTokenResetStyle(
  ownerStyle: React.CSSProperties,
  cssPrefixes: string[]
): React.CSSProperties {
  const variablePrefixes = cssPrefixes.map((prefix) => `--lmn-${prefix}-`);
  const style: Record<string, string> = {};
  for (const property of Object.keys(ownerStyle)) {
    if (variablePrefixes.some((prefix) => property.startsWith(prefix))) {
      style[property] = "initial";
    }
  }
  return style as React.CSSProperties;
}

/** 组件主题边界属性。 */
export interface ComponentThemeBoundaryProps {
  component: ComponentThemeName;
  cssPrefix: string | string[];
  theme?: ComponentTheme;
  /** 当前组件的真实 DOM 根节点，用于读取最近的静态主题作用域。 */
  rootElement?: Element | null;
  children: (state: ComponentThemeRenderState) => React.ReactNode;
}

/** 根节点跟踪选项，仅在需要读取静态主题时保存 DOM。 */
export interface ComponentThemeRootRefOptions {
  component: ComponentThemeName;
  theme?: ComponentTheme;
}

/** 按需保存主题根节点并继续透传公共组件 ref。 */
export function useComponentThemeRootRef<T extends Element>(
  forwardedRef: React.ForwardedRef<T> | undefined,
  { component, theme }: ComponentThemeRootRefOptions
): readonly [T | null, React.RefCallback<T>] {
  const inheritedVisualTheme = useVisualThemeSnapshot();
  const inheritedOverrides = useComponentOverrides();
  const [rootState, setRootState] = React.useState<{ element: T | null; revision: number }>({
    element: null,
    revision: 0,
  });
  const mountedRootRef = React.useRef<T | null>(null);
  const tracksRootElement = React.useRef(false);
  const shouldTrackConfiguredTheme =
    inheritedVisualTheme === null &&
    (theme !== undefined || inheritedOverrides[component] !== undefined);
  const shouldDetectLocalStaticTheme = inheritedVisualTheme === null;
  const rootRef = React.useCallback((node: T | null) => {
    mountedRootRef.current = node;
    const shouldTrackNode =
      node !== null &&
      (shouldTrackConfiguredTheme ||
        (shouldDetectLocalStaticTheme && hasLocalStaticThemeScope(node)));
    if (shouldTrackNode) {
      tracksRootElement.current = true;
      setRootState((current) => current.element === node
        ? current
        : { element: node, revision: current.revision + 1 });
    } else if (node !== null) {
      tracksRootElement.current = false;
      setRootState((current) => current.element === null
        ? current
        : { element: null, revision: current.revision + 1 });
    } else {
      tracksRootElement.current = false;
    }
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  }, [forwardedRef, shouldDetectLocalStaticTheme, shouldTrackConfiguredTheme]);

  useIsomorphicLayoutEffect(() => {
    if (!shouldDetectLocalStaticTheme) return;
    return subscribeImperativeThemeChange((target) => {
      const node = mountedRootRef.current;
      if (!node || !target.contains(node)) return;
      const shouldTrackNode =
        shouldTrackConfiguredTheme || hasLocalStaticThemeScope(node);
      if (!shouldTrackNode && !tracksRootElement.current) return;
      tracksRootElement.current = shouldTrackNode;
      setRootState((current) => ({
        element: shouldTrackNode ? node : null,
        revision: current.revision + 1,
      }));
    });
  }, [shouldDetectLocalStaticTheme, shouldTrackConfiguredTheme]);

  return [rootState.element, rootRef] as const;
}

/**
 * 解析组件自身、祖先组件覆盖和子树主题，不创建额外 DOM。
 *
 * @example
 * ```tsx
 * <ComponentThemeBoundary component="Button" cssPrefix="button" theme={theme}>
 *   {(state) => <button style={state.rootStyle} />}
 * </ComponentThemeBoundary>
 * ```
 */
export function ComponentThemeBoundary({
  component,
  cssPrefix,
  theme,
  rootElement,
  children,
}: ComponentThemeBoundaryProps) {
  const inheritedVisualTheme = useVisualThemeSnapshot();
  const inheritedOwner = useOwnerPortalTheme();
  const inheritedOverrides = useComponentOverrides();
  const internalComponents = React.useContext(InternalComponentThemePartContext);
  const own = normalizeComponentThemeInput(theme);
  const override = inheritedOverrides[component];
  const config = mergeComponentTheme(override, own);
  const active = config !== undefined;
  const scope = own?.scope ?? "self";
  const cssPrefixes = Array.isArray(cssPrefix) ? cssPrefix : [cssPrefix];
  const isOwnedInternalPart = internalComponents.includes(component);
  const matchesInheritedCssPrefix = cssPrefixes.some((prefix) =>
    inheritedOwner?.cssPrefixes.includes(prefix)
  );
  const shouldResetSelfTheme =
    !active &&
    inheritedOwner !== null &&
    !isOwnedInternalPart &&
    (inheritedOwner?.component === component || matchesInheritedCssPrefix) &&
    !inheritedOwner.subtree;
  const hasLocalStaticTheme =
    inheritedVisualTheme === null && hasLocalStaticThemeScope(rootElement);
  const inheritedSnapshot =
    inheritedVisualTheme ??
    (shouldResetSelfTheme && inheritedOwner
      ? inheritedOwner.inheritedSnapshot
      : active || hasLocalStaticTheme
        ? getDefaultSnapshot(rootElement)
        : getFallbackSnapshot(rootElement));
  const snapshot = active
    ? resolveVisualThemeSnapshot(config, inheritedSnapshot)
    : inheritedSnapshot;
  const inheritedTokenResetStyle =
    shouldResetSelfTheme && inheritedOwner
      ? createInheritedTokenResetStyle(inheritedOwner.style, cssPrefixes)
      : {};
  const prefixedStyle = active || shouldResetSelfTheme
    ? cssPrefixes.reduce<React.CSSProperties>((result, currentPrefix) => {
        const prefix = `lmn-${currentPrefix}-`;
        return {
          ...result,
          ...visualThemeToStyle(snapshot, prefix),
          ...(active ? componentTokensToStyle(config.tokens, prefix) : null),
        };
      }, inheritedTokenResetStyle)
    : {};
  const subtreeStyle = active && scope === "subtree" ? visualThemeToStyle(snapshot) : {};
  const styles = override?.styles ?? {};
  const rootStyle = {
    ...(styles.root ?? {}),
    ...prefixedStyle,
    ...subtreeStyle,
  };
  const rootDataAttributes: Record<string, string | undefined> =
    active || shouldResetSelfTheme
      ? active && scope === "subtree"
        ? {
            "data-theme": snapshot.colorScheme,
            "data-lumina-color-scheme": snapshot.colorScheme,
          }
        : { "data-lumina-color-scheme": snapshot.colorScheme }
      : {};
  if (component === "Icon" && active && hasExplicitIconForeground(config)) {
    rootDataAttributes["data-lumina-icon-color"] = "";
  }
  const shouldApplyPortalTheme =
    active || inheritedVisualTheme !== null || hasLocalStaticTheme;
  const portalStyle = shouldApplyPortalTheme
    ? {
        ...visualThemeToStyle(inheritedSnapshot),
        ...prefixedStyle,
        ...(scope === "subtree" ? subtreeStyle : {}),
      }
    : {};
  const portalDataAttributes = shouldApplyPortalTheme
    ? {
        "data-theme": scope === "subtree" ? snapshot.colorScheme : inheritedSnapshot.colorScheme,
        "data-lumina-color-scheme": snapshot.colorScheme,
      }
    : {};

  const state: ComponentThemeRenderState = {
    active,
    scope,
    snapshot,
    rootStyle,
    rootDataAttributes,
    portalStyle,
    portalDataAttributes,
    styles,
  };

  const consumedIndex = internalComponents.indexOf(component);
  const remainingInternalComponents = isOwnedInternalPart
    ? [
        ...internalComponents.slice(0, consumedIndex),
        ...internalComponents.slice(consumedIndex + 1),
      ]
    : internalComponents;
  const ownerPortalTheme = active
    ? {
        component,
        cssPrefixes,
        style: portalStyle,
        colorScheme: snapshot.colorScheme,
        inheritedColorScheme: inheritedSnapshot.colorScheme,
        inheritedSnapshot,
        subtree: scope === "subtree",
        styles,
      }
    : shouldResetSelfTheme
      ? null
      : inheritedOwner;
  const providedVisualTheme =
    active && scope === "subtree"
      ? snapshot
      : !active && hasLocalStaticTheme
        ? inheritedSnapshot
        : null;
  return (
    <VisualThemeProvider value={providedVisualTheme ?? inheritedVisualTheme}>
      <ComponentOverridesProvider value={own?.components}>
        <OwnerPortalThemeProvider value={ownerPortalTheme}>
          <InternalComponentThemePartContext.Provider value={remainingInternalComponents}>
            {children(state)}
          </InternalComponentThemePartContext.Provider>
        </OwnerPortalThemeProvider>
      </ComponentOverridesProvider>
    </VisualThemeProvider>
  );
}

/**
 * 仅把实例 style 中与根插槽冲突的属性提升到包装根节点。
 * 输入本体仍接收完整 style，避免改变既有原生输入样式语义。
 */
export function mergeComponentRootStyleWithInstanceStyle(
  rootStyle: React.CSSProperties,
  instanceStyle: React.CSSProperties | undefined
): React.CSSProperties {
  if (!instanceStyle) return rootStyle;
  const overrides: Record<string, unknown> = {};
  const instanceRecord = instanceStyle as Record<string, unknown>;
  for (const property of Object.keys(rootStyle)) {
    if (Object.prototype.hasOwnProperty.call(instanceRecord, property)) {
      overrides[property] = instanceRecord[property];
    }
  }
  return { ...rootStyle, ...overrides } as React.CSSProperties;
}

/**
 * 为复合组件内部固定使用的公共子控件自动添加 owner 标记并透传 ref。
 * 仅供组件库内部使用，不从公共入口导出。
 */
export function withInternalComponentThemePart<C extends React.ElementType>(
  Component: C,
  components: ComponentThemeName | readonly ComponentThemeName[]
): C {
  const Wrapped = React.forwardRef<Element, React.ComponentPropsWithoutRef<C>>(
    (props, ref) => (
      <InternalComponentThemePart components={components}>
        {React.createElement(Component, { ...props, ref })}
      </InternalComponentThemePart>
    )
  );
  Wrapped.displayName = `InternalThemePart(${
    typeof Component === "string"
      ? Component
      : Component.displayName ?? Component.name ?? "Component"
  })`;
  return Wrapped as unknown as C;
}

/** Portal 组件读取当前 owner 的主题样式和属性。 */
export function useComponentPortalTheme(component: ComponentThemeName | ComponentThemeName[]): {
  style: React.CSSProperties;
  dataAttributes: Record<string, string | undefined>;
  styles: Partial<Record<string, React.CSSProperties>>;
} {
  const owner = useOwnerPortalTheme();
  const inherited = useVisualThemeSnapshot();
  const matchesOwner = owner && (
    Array.isArray(component)
      ? component.includes(owner.component)
      : owner.component === component
  );
  if (matchesOwner && owner) {
    return {
      style: owner.style,
      dataAttributes: {
        "data-theme": owner.subtree ? owner.colorScheme : owner.inheritedColorScheme,
        "data-lumina-color-scheme": owner.colorScheme,
      },
      styles: owner.styles,
    };
  }
  if (!inherited) {
    return { style: {}, dataAttributes: {}, styles: {} };
  }
  return {
    style: visualThemeToStyle(inherited),
    dataAttributes: {
      "data-theme": inherited.colorScheme,
      "data-lumina-color-scheme": inherited.colorScheme,
    },
    styles: {},
  };
}

/** 可以接受 style、原生 data 属性和 ref 的公共组件类型。 */
interface ThemedComponentProps extends ComponentThemeProps {
  style?: React.CSSProperties;
  [key: string]: unknown;
}

/** 组件主题 HOC 的内部接入选项。 */
interface WithComponentThemeOptions {
  /** 真实根节点完全位于 Portal 时，在逻辑渲染位置保留主题作用域锚点。 */
  portalOnly?: boolean;
}

/**
 * 为 forwardRef 公共组件接入 theme，同时保证 ref 仍落到原真实 DOM。
 * 主题样式先合并，调用方原 style 保持最高优先级。
 */
export function withComponentTheme<
  C extends React.ForwardRefExoticComponent<any>
>(
  Component: C,
  component: ComponentThemeName,
  cssPrefix: string | string[] = component.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(),
  options: WithComponentThemeOptions = {}
): C {
  const Wrapped = React.forwardRef<Element, ThemedComponentProps>((props, ref) => {
    const { theme, style, ...rest } = props as ThemedComponentProps;
    const [rootElement, rootRef] = useComponentThemeRootRef(
      options.portalOnly ? undefined : ref,
      { component, theme }
    );
    const themedNode = (
      <ComponentThemeBoundary
        component={component}
        cssPrefix={cssPrefix}
        theme={theme}
        rootElement={rootElement}
      >
        {(state) =>
          React.createElement(Component as React.ElementType, {
            ...rest,
            ...state.rootDataAttributes,
            ref: options.portalOnly ? ref : rootRef,
            style: { ...state.rootStyle, ...style },
          })
        }
      </ComponentThemeBoundary>
    );
    if (!options.portalOnly) return themedNode;
    return (
      <>
        <template
          ref={rootRef as React.Ref<HTMLTemplateElement>}
          data-lumina-theme-anchor={component}
        />
        {themedNode}
      </>
    );
  });
  Wrapped.displayName = Component.displayName ?? component;
  return Wrapped as unknown as C;
}
