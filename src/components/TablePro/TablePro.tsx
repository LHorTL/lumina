import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./TablePro.css";
import * as React from "react";
import { Table, type TableProps } from "../Table";

export interface TableProProps<Row = any> extends Omit<TableProps<Row>, "title"> {
  /** Toolbar slot — search input, filter, etc. */
  toolbar?: React.ReactNode;
  /** Right-aligned actions slot in toolbar. */
  actions?: React.ReactNode;
  /** Footer slot — usually <Pagination />. Optional now that `pagination` is built-in. */
  footer?: React.ReactNode;
  /** Title shown above the toolbar. */
  title?: React.ReactNode;
}

/**
 * `TablePro` — full-featured table card with toolbar, sortable/selectable rows,
 * variants, and a footer slot for pagination.
 */
export function TablePro<Row extends Record<string, any> = any>({
  toolbar,
  actions,
  footer,
  title,
  className = "",
  ...tableProps
}: TableProProps<Row>) {
  return (
    <div className={`table-card ${className}`}>
      {(title || toolbar || actions) && (
        <div className="table-toolbar">
          {title && <div className="table-title">{title}</div>}
          <div className="table-toolbar-main">{toolbar}</div>
          {actions && <div className="table-toolbar-actions">{actions}</div>}
        </div>
      )}
      <Table {...tableProps} className="joined" />
      {footer && <div className="table-footer">{footer}</div>}
    </div>
  );
}
