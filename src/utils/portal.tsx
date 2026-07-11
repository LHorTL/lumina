import * as React from "react";

/** 局部主题为浮层提供的挂载容器上下文。 */
const PortalContainerContext = React.createContext<HTMLElement | null>(null);

/** PortalScopeProvider 的内部属性。 */
export interface PortalScopeProviderProps {
  container: HTMLElement | null;
  children?: React.ReactNode;
}

/** 为后代浮层注入离开当前 DOM 子树后仍可继承主题的挂载容器。 */
export function PortalScopeProvider({ container, children }: PortalScopeProviderProps) {
  return (
    <PortalContainerContext.Provider value={container}>
      {children}
    </PortalContainerContext.Provider>
  );
}

/** 返回最近局部主题的浮层容器；没有局部容器时回退到 document.body。 */
export function usePortalContainer(): HTMLElement | null {
  const scopedContainer = React.useContext(PortalContainerContext);
  if (scopedContainer) return scopedContainer;
  if (typeof document === "undefined") return null;
  return document.body;
}
