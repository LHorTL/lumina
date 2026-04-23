import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./AppShell.css";
import * as React from "react";
import { Icon } from "../Icon";

export interface WindowControlsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** macOS traffic lights or Windows-style buttons. */
  platform?: "mac" | "windows";
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  className?: string;
}

/**
 * `WindowControls` — standalone window control buttons.
 * Mac: traffic lights (close/min/max). Windows: rectangular controls.
 */
export const WindowControls = React.forwardRef<HTMLDivElement, WindowControlsProps>(({
  platform = "mac",
  onMinimize,
  onMaximize,
  onClose,
  className = "",
  ...rest
}, ref) => {
  const noDragStyle = { WebkitAppRegion: "no-drag" } as React.CSSProperties;
  if (platform === "windows") {
    return (
      <div ref={ref} className={`win-controls windows ${className}`} style={noDragStyle} {...rest}>
        <button type="button" className="win-btn minimize" onClick={onMinimize} aria-label="Minimize">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
            <path d="M1 5h8" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>
        <button type="button" className="win-btn maximize" onClick={onMaximize} aria-label="Maximize">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
            <rect x="1" y="1" width="8" height="8" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>
        <button type="button" className="win-btn close" onClick={onClose} aria-label="Close">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
            <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>
      </div>
    );
  }
  return (
    <div ref={ref} className={`win-controls mac ${className}`} style={noDragStyle} {...rest}>
      <button type="button" className="win-btn close" onClick={onClose} aria-label="Close" />
      <button type="button" className="win-btn minimize" onClick={onMinimize} aria-label="Minimize" />
      <button type="button" className="win-btn maximize" onClick={onMaximize} aria-label="Maximize" />
    </div>
  );
});
WindowControls.displayName = "WindowControls";

export interface TitleBarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  /** Platform appearance — affects button placement. Default "mac". */
  platform?: "mac" | "windows";
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
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
export const TitleBar = React.forwardRef<HTMLDivElement, TitleBarProps>(({
  title,
  platform = "mac",
  onMinimize,
  onMaximize,
  onClose,
  center,
  actions,
  draggable = true,
  className = "",
  ...rest
}, ref) => {
  const dragStyle = draggable ? ({ WebkitAppRegion: "drag" } as React.CSSProperties) : undefined;
  const noDragStyle = { WebkitAppRegion: "no-drag" } as React.CSSProperties;

  return (
    <div ref={ref} className={`titlebar ${platform} ${className}`} style={dragStyle} {...rest}>
      {platform === "mac" && (
        <WindowControls platform="mac" onMinimize={onMinimize} onMaximize={onMaximize} onClose={onClose} />
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
        <WindowControls platform="windows" onMinimize={onMinimize} onMaximize={onMaximize} onClose={onClose} />
      )}
    </div>
  );
});
TitleBar.displayName = "TitleBar";

export interface SidebarItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  children?: SidebarItem[];
}

export interface SidebarProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "onSelect" | "children"> {
  items: SidebarItem[];
  activeKey?: string;
  onSelect?: (key: string) => void;
  /** Collapsed: icons only. */
  collapsed?: boolean;
  /** Header slot (e.g. workspace switcher). */
  header?: React.ReactNode;
  /** Footer slot (e.g. user card). */
  footer?: React.ReactNode;
  className?: string;
}

/** `Sidebar` — navigation rail. Pair with `AppShell`. */
export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(({
  items,
  activeKey,
  onSelect,
  collapsed,
  header,
  footer,
  className = "",
  ...rest
}, ref) => (
  <aside ref={ref} className={`sidebar ${collapsed ? "collapsed" : ""} ${className}`} {...rest}>
    {header && <div className="sidebar-header">{header}</div>}
    <nav className="sidebar-nav">
      {items.map((it) => (
        <button
          type="button"
          key={it.key}
          className={`sidebar-item ${activeKey === it.key ? "active" : ""}`}
          onClick={() => onSelect?.(it.key)}
        >
          {it.icon && <span className="sidebar-icon">{it.icon}</span>}
          {!collapsed && <span className="sidebar-label">{it.label}</span>}
          {!collapsed && it.badge && <span className="sidebar-badge">{it.badge}</span>}
        </button>
      ))}
    </nav>
    {footer && <div className="sidebar-footer">{footer}</div>}
  </aside>
));
Sidebar.displayName = "Sidebar";

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  sidebar?: React.ReactNode;
  titleBar?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/**
 * `AppShell` — 3-zone Electron layout: title bar across top, sidebar on left, content fills rest.
 */
export const AppShell = React.forwardRef<HTMLDivElement, AppShellProps>(({ sidebar, titleBar, children, className = "", ...rest }, ref) => (
  <div ref={ref} className={`app-shell ${className}`} {...rest}>
    {titleBar}
    <div className="app-shell-body">
      {sidebar}
      <main className="app-shell-main">{children}</main>
    </div>
  </div>
));
AppShell.displayName = "AppShell";
