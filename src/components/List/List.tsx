import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./List.css";
import * as React from "react";
import { withComponentTheme, type ComponentThemeProps } from "../Theme/ComponentTheme";

export interface ListItem {
  key: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  avatar?: React.ReactNode;
  actions?: React.ReactNode;
  onClick?: () => void;
}

export interface ListProps
  extends Omit<React.HTMLAttributes<HTMLUListElement>, "children">,
    ComponentThemeProps {
  items: ListItem[];
  /** Show dividers between items. */
  dividers?: boolean;
  className?: string;
}

/** `List` — vertical list of rows. */
const ListBase = React.forwardRef<HTMLUListElement, ListProps>(({ items, dividers = true, className = "", style, ...rest }, ref) => (
  <ul
    ref={ref}
    className={`list ${dividers ? "with-dividers" : ""} ${className}`}
    style={{ listStyle: "none", margin: 0, ...style }}
    {...rest}
  >
    {items.map((it) => {
      const content = (
        <>
          {it.avatar && <span className="list-item-avatar">{it.avatar}</span>}
          <span className="list-item-meta">
            {it.title && <span className="list-item-title">{it.title}</span>}
            {it.description && <span className="list-item-desc">{it.description}</span>}
          </span>
        </>
      );
      return (
        <li key={it.key} className={`list-item ${it.onClick ? "clickable" : ""}`}>
          {it.onClick ? (
            <button type="button" className="list-item-trigger" onClick={it.onClick}>
              {content}
            </button>
          ) : (
            <div className="list-item-trigger">{content}</div>
          )}
          {it.actions && <div className="list-item-actions">{it.actions}</div>}
        </li>
      );
    })}
  </ul>
));
ListBase.displayName = "List";

export const List = withComponentTheme(ListBase, "List", "list");
