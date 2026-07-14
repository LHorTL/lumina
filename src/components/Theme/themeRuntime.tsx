import * as React from "react";
import type {
  ComponentThemeName,
  ComponentThemeOverride,
  ComponentThemeOverrides,
} from "./componentThemeTypes";
import type { ResolvedThemeColors, ThemeBaseMode } from "./themeTypes";

/** 子树和 Portal 之间传递的完整视觉主题快照。 */
export interface VisualThemeSnapshot {
  colorScheme: ThemeBaseMode;
  intensity: number;
  colors: ResolvedThemeColors;
}

/** 当前组件所属 Portal 需要复制的主题属性。 */
export interface OwnerPortalThemeValue {
  component: ComponentThemeName;
  /** 当前组件使用的全部 CSS 前缀，用于隔离共用前缀的业务后代。 */
  cssPrefixes: readonly string[];
  style: React.CSSProperties;
  colorScheme: ThemeBaseMode;
  inheritedColorScheme: ThemeBaseMode;
  /** 当前组件应用局部主题前继承的完整视觉快照。 */
  inheritedSnapshot: VisualThemeSnapshot;
  subtree: boolean;
  styles: Partial<Record<string, React.CSSProperties>>;
}

const EMPTY_COMPONENT_OVERRIDES: ComponentThemeOverrides = Object.freeze({});

const VisualThemeContext = React.createContext<VisualThemeSnapshot | null>(null);
const ComponentOverridesContext = React.createContext<ComponentThemeOverrides>(
  EMPTY_COMPONENT_OVERRIDES
);
const OwnerPortalThemeContext = React.createContext<OwnerPortalThemeValue | null>(null);

/** 命令式主题变更监听函数。 */
type ImperativeThemeChangeListener = (target: HTMLElement) => void;

const imperativeThemeChangeListeners = new Set<ImperativeThemeChangeListener>();

/** 订阅 applyTheme 对 DOM 主题作用域的运行期更新。 */
export function subscribeImperativeThemeChange(
  listener: ImperativeThemeChangeListener
): () => void {
  imperativeThemeChangeListeners.add(listener);
  return () => imperativeThemeChangeListeners.delete(listener);
}

/** 在 applyTheme 完成全部属性写入后通知 React 主题桥接层。 */
export function notifyImperativeThemeChange(target: HTMLElement): void {
  imperativeThemeChangeListeners.forEach((listener) => listener(target));
}

/** 合并单个组件覆盖，固定处理 colors、tokens 和各插槽样式。 */
function mergeComponentOverride(
  parent: ComponentThemeOverride | undefined,
  next: ComponentThemeOverride
): ComponentThemeOverride {
  const styles = { ...(parent?.styles ?? {}) };
  for (const [slot, style] of Object.entries(next.styles ?? {})) {
    styles[slot] = { ...(styles[slot] ?? {}), ...style };
  }
  return {
    ...parent,
    ...next,
    colors: { ...(parent?.colors ?? {}), ...(next.colors ?? {}) },
    tokens: { ...(parent?.tokens ?? {}), ...(next.tokens ?? {}) },
    styles,
  };
}

/** 按组件和插槽逐层合并多个组件主题配置，后项优先。 */
export function mergeComponentThemeOverrides(
  ...sources: Array<ComponentThemeOverrides | undefined>
): ComponentThemeOverrides {
  const result: ComponentThemeOverrides = {};
  for (const source of sources) {
    if (!source) continue;
    for (const [name, override] of Object.entries(source) as Array<
      [ComponentThemeName, ComponentThemeOverride | undefined]
    >) {
      if (!override) continue;
      result[name] = mergeComponentOverride(result[name], override);
    }
  }
  return result;
}

/** 为后代提供完整视觉主题快照。 */
export function VisualThemeProvider({
  value,
  children,
}: {
  value: VisualThemeSnapshot | null;
  children?: React.ReactNode;
}) {
  return <VisualThemeContext.Provider value={value}>{children}</VisualThemeContext.Provider>;
}

/** 合并并提供按组件名称配置的主题覆盖。 */
export function ComponentOverridesProvider({
  value,
  children,
}: {
  value?: ComponentThemeOverrides;
  children?: React.ReactNode;
}) {
  const inherited = React.useContext(ComponentOverridesContext);
  const merged = React.useMemo<ComponentThemeOverrides>(() => {
    if (!value || Object.keys(value).length === 0) return inherited;
    return mergeComponentThemeOverrides(inherited, value);
  }, [inherited, value]);

  return (
    <ComponentOverridesContext.Provider value={merged}>
      {children}
    </ComponentOverridesContext.Provider>
  );
}

/** 为组件自己的 Portal 提供隔离后的主题快照。 */
export function OwnerPortalThemeProvider({
  value,
  children,
}: {
  value: OwnerPortalThemeValue | null;
  children?: React.ReactNode;
}) {
  return <OwnerPortalThemeContext.Provider value={value}>{children}</OwnerPortalThemeContext.Provider>;
}

/** 读取最近的子树视觉主题；组件内部使用。 */
export function useVisualThemeSnapshot(): VisualThemeSnapshot | null {
  return React.useContext(VisualThemeContext);
}

/** 读取当前作用域的组件类型覆盖；组件内部使用。 */
export function useComponentOverrides(): ComponentThemeOverrides {
  return React.useContext(ComponentOverridesContext);
}

/** 读取当前组件实例拥有的 Portal 主题；组件内部使用。 */
export function useOwnerPortalTheme(): OwnerPortalThemeValue | null {
  return React.useContext(OwnerPortalThemeContext);
}
