import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./List.css";
import * as React from "react";

export interface ListItem {
  key: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  avatar?: React.ReactNode;
  actions?: React.ReactNode;
  onClick?: () => void;
}

export interface ListProps
  extends Omit<React.HTMLAttributes<HTMLUListElement>, "children"> {
  items: ListItem[];
  /** Show dividers between items. */
  dividers?: boolean;
  className?: string;
}

/** `List` — vertical list of rows. */
export const List = React.forwardRef<HTMLUListElement, ListProps>(({ items, dividers = true, className = "", style, ...rest }, ref) => (
  <ul
    ref={ref}
    className={`list ${dividers ? "with-dividers" : ""} ${className}`}
    style={{ listStyle: "none", margin: 0, ...style }}
    {...rest}
  >
    {items.map((it) => (
      <li key={it.key} className={`list-item ${it.onClick ? "clickable" : ""}`} onClick={it.onClick}>
        {it.avatar && <div className="list-item-avatar">{it.avatar}</div>}
        <div className="list-item-meta">
          {it.title && <div className="list-item-title">{it.title}</div>}
          {it.description && <div className="list-item-desc">{it.description}</div>}
        </div>
        {it.actions && <div className="list-item-actions">{it.actions}</div>}
      </li>
    ))}
  </ul>
));
List.displayName = "List";
