import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./AppShell.css";
import * as React from "react";
import { Icon } from "../Icon";
import {
  withComponentTheme,
  withInternalComponentThemePart,
  type ComponentThemeProps,
} from "../Theme/ComponentTheme";

export interface WindowControlsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    ComponentThemeProps {
  /** macOS traffic lights or Windows-style buttons. */
  platform?: "mac" | "windows";
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  /** 当前是否已经最大化；用于切换还原图标和可访问名称。 */
  maximized?: boolean;
  className?: string;
}

/**
 * `WindowControls` — standalone window control buttons.
 * Mac: traffic lights (close/min/max). Windows: rectangular controls.
 */
const WindowControlsBase = React.forwardRef<HTMLDivElement, WindowControlsProps>(({
  platform = "mac",
  onMinimize,
  onMaximize,
  onClose,
  maximized = false,
  className = "",
  style,
  ...rest
}, ref) => {
  const noDragStyle = { WebkitAppRegion: "no-drag" } as React.CSSProperties;
  if (platform === "windows") {
    return (
      <div ref={ref} className={`win-controls windows ${className}`} {...rest} style={{ ...noDragStyle, ...style }}>
        <button type="button" className="win-btn minimize" onClick={onMinimize} disabled={!onMinimize} aria-label="最小化">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
            <path d="M1 5h8" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>
        <button
          type="button"
          className="win-btn maximize"
          onClick={onMaximize}
          disabled={!onMaximize}
          aria-label={maximized ? "还原窗口" : "最大化"}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
            {maximized ? (
              <>
                <rect x="1" y="3" width="6" height="6" stroke="currentColor" strokeWidth="1" />
                <path d="M3 3V1h6v6H7" stroke="currentColor" strokeWidth="1" />
              </>
            ) : (
              <rect x="1" y="1" width="8" height="8" stroke="currentColor" strokeWidth="1" />
            )}
          </svg>
        </button>
        <button type="button" className="win-btn close" onClick={onClose} disabled={!onClose} aria-label="关闭窗口">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
            <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>
      </div>
    );
  }
  return (
    <div ref={ref} className={`win-controls mac ${className}`} {...rest} style={{ ...noDragStyle, ...style }}>
      <button type="button" className="win-btn close" onClick={onClose} disabled={!onClose} aria-label="关闭窗口" />
      <button type="button" className="win-btn minimize" onClick={onMinimize} disabled={!onMinimize} aria-label="最小化" />
      <button type="button" className="win-btn maximize" onClick={onMaximize} disabled={!onMaximize} aria-label={maximized ? "还原窗口" : "最大化"} />
    </div>
  );
});
WindowControlsBase.displayName = "WindowControls";

export const WindowControls = withComponentTheme(
  WindowControlsBase,
  "WindowControls",
  "app-shell"
);

/** TitleBar 内部窗口控制按钮继续使用标题栏自身主题。 */
const InternalWindowControls = withInternalComponentThemePart(
  WindowControls,
  "WindowControls"
);

export interface TitleBarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    ComponentThemeProps {
  title?: React.ReactNode;
  /** Platform appearance — affects button placement. Default "mac". */
  platform?: "mac" | "windows";
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  /** 当前是否已最大化。 */
  maximized?: boolean;
  /** Extra content in the center. */
  center?: React.ReactNode;
  /** Extra content on the trailing side. */
  actions?: React.ReactNode;
  /** Make the whole bar draggable (Electron `-webkit-app-region: drag`). */
  draggable?: boolean;
  className?: string;
}

/**
 * `TitleBar` — Electron-style window chrome. Attach at the top of your app.
 * Buttons are non-draggable regions so clicks register correctly.
 */
const TitleBarBase = React.forwardRef<HTMLDivElement, TitleBarProps>(({
  title,
  platform = "mac",
  onMinimize,
  onMaximize,
  onClose,
  maximized = false,
  center,
  actions,
  draggable = true,
  className = "",
  style,
  ...rest
}, ref) => {
  const dragStyle = {
    WebkitAppRegion: draggable ? "drag" : "no-drag",
    ...style,
  } as React.CSSProperties;
  const noDragStyle = { WebkitAppRegion: "no-drag" } as React.CSSProperties;

  return (
    <div ref={ref} className={`titlebar ${platform} ${draggable ? "draggable" : "no-drag"} ${className}`} {...rest} style={dragStyle}>
      {platform === "mac" && (
        <InternalWindowControls platform="mac" onMinimize={onMinimize} onMaximize={onMaximize} onClose={onClose} maximized={maximized} />
      )}
      <div className="titlebar-title">{title}</div>
      {center && (
        <div className="titlebar-center" style={noDragStyle}>
          {center}
        </div>
      )}
      {actions && (
        <div className="titlebar-actions" style={noDragStyle}>
          {actions}
        </div>
      )}
      {platform === "windows" && (
        <InternalWindowControls platform="windows" onMinimize={onMinimize} onMaximize={onMaximize} onClose={onClose} maximized={maximized} />
      )}
    </div>
  );
});
TitleBarBase.displayName = "TitleBar";

export const TitleBar = withComponentTheme(TitleBarBase, "TitleBar", "app-shell");

export interface SidebarItem {
  key: string;
  label: React.ReactNode;
  /** 折叠侧栏与复杂标签使用的可访问名称。 */
  ariaLabel?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  children?: SidebarItem[];
}

export interface SidebarProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "onSelect" | "children">,
    ComponentThemeProps {
  items: SidebarItem[];
  activeKey?: string;
  onSelect?: (key: string) => void;
  /** 受控展开的分组键。 */
  expandedKeys?: string[];
  /** 非受控模式下的初始展开分组；省略时为兼容旧行为而默认全部展开。 */
  defaultExpandedKeys?: string[];
  /** 分组展开状态变化时触发。 */
  onExpandedKeysChange?: (keys: string[]) => void;
  /** Collapsed: icons only. */
  collapsed?: boolean;
  /** Header slot (e.g. workspace switcher). */
  header?: React.ReactNode;
  /** Footer slot (e.g. user card). */
  footer?: React.ReactNode;
  /** 导航区域的可访问名称。 */
  navigationLabel?: string;
  className?: string;
}

/** 收集所有包含子项的导航键，作为兼容旧版的默认展开值。 */
const collectExpandableSidebarKeys = (items: SidebarItem[]): string[] =>
  items.flatMap((item) => [
    ...(item.children?.length ? [item.key] : []),
    ...(item.children ? collectExpandableSidebarKeys(item.children) : []),
  ]);

/** `Sidebar` — navigation rail. Pair with `AppShell`. */
const SidebarBase = React.forwardRef<HTMLElement, SidebarProps>(({
  items,
  activeKey,
  onSelect,
  expandedKeys,
  defaultExpandedKeys,
  onExpandedKeysChange,
  collapsed,
  header,
  footer,
  navigationLabel = "主导航",
  className = "",
  ...rest
}, ref) => {
  const [innerExpandedKeys, setInnerExpandedKeys] = React.useState<string[]>(() =>
    defaultExpandedKeys ?? collectExpandableSidebarKeys(items)
  );
  const expandedControlled = expandedKeys !== undefined;
  const currentExpandedKeys = expandedControlled ? expandedKeys : innerExpandedKeys;

  /** 切换指定导航分组，并同步受控回调。 */
  const toggleExpanded = (key: string): void => {
    const next = currentExpandedKeys.includes(key)
      ? currentExpandedKeys.filter((itemKey) => itemKey !== key)
      : [...currentExpandedKeys, key];
    if (!expandedControlled) setInnerExpandedKeys(next);
    onExpandedKeysChange?.(next);
  };

  /** 递归渲染多级导航项。 */
  const renderItems = (entries: SidebarItem[], level = 1): React.ReactNode =>
    entries.map((item) => {
      const active = activeKey === item.key;
      const hasChildren = !!item.children?.length;
      const expanded = hasChildren && currentExpandedKeys.includes(item.key);
      const showChildren = !collapsed && expanded;
      const textLabel = item.ariaLabel ?? (typeof item.label === "string" ? item.label : undefined);
      return (
        <React.Fragment key={item.key}>
          <button
            type="button"
            className={`sidebar-item ${active ? "active" : ""}`}
            style={{ ["--sidebar-indent" as never]: `${(level - 1) * 16}px` }}
            aria-current={active ? "page" : undefined}
            aria-label={collapsed ? textLabel : undefined}
            title={collapsed ? textLabel : undefined}
            aria-expanded={hasChildren ? showChildren : undefined}
            onClick={() => {
              onSelect?.(item.key);
              if (hasChildren) toggleExpanded(item.key);
            }}
          >
            {item.icon && <span className="sidebar-icon" aria-hidden={collapsed && !!textLabel}>{item.icon}</span>}
            {!collapsed && <span className="sidebar-label">{item.label}</span>}
            {!collapsed && item.badge != null && <span className="sidebar-badge">{item.badge}</span>}
            {!collapsed && hasChildren && (
              <span className={`sidebar-expand ${expanded ? "open" : ""}`} aria-hidden>
                <Icon name="chevDown" size={13} />
              </span>
            )}
          </button>
          {showChildren && (
            <div className="sidebar-children" role="group" aria-label={textLabel}>
              {renderItems(item.children!, level + 1)}
            </div>
          )}
        </React.Fragment>
      );
    });

  return (
    <aside ref={ref} className={`sidebar ${collapsed ? "collapsed" : ""} ${className}`} {...rest}>
      {header != null && <div className="sidebar-header">{header}</div>}
      <nav className="sidebar-nav" aria-label={navigationLabel}>
        {renderItems(items)}
      </nav>
      {footer != null && <div className="sidebar-footer">{footer}</div>}
    </aside>
  );
});
SidebarBase.displayName = "Sidebar";

export const Sidebar = withComponentTheme(SidebarBase, "Sidebar", "app-shell");

export interface AppShellProps
  extends React.HTMLAttributes<HTMLDivElement>,
    ComponentThemeProps {
  sidebar?: React.ReactNode;
  titleBar?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/**
 * `AppShell` — 3-zone Electron layout: title bar across top, sidebar on left, content fills rest.
 */
const AppShellBase = React.forwardRef<HTMLDivElement, AppShellProps>(({ sidebar, titleBar, children, className = "", ...rest }, ref) => (
  <div ref={ref} className={`app-shell ${className}`} {...rest}>
    {titleBar}
    <div className="app-shell-body">
      {sidebar}
      <main className="app-shell-main">{children}</main>
    </div>
  </div>
));
AppShellBase.displayName = "AppShell";

export const AppShell = withComponentTheme(AppShellBase, "AppShell", "app-shell");
