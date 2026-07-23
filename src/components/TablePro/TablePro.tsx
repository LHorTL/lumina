import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./TablePro.css";
import * as React from "react";
import { Table, type TableProps } from "../Table";
import { InternalComponentThemePart, withComponentTheme } from "../Theme/ComponentTheme";

export interface TableProProps<Row = any>
  extends Omit<TableProps<Row>, "title" | "className" | "style"> {
  /** Toolbar slot — search input, filter, etc. */
  toolbar?: React.ReactNode;
  /** Right-aligned actions slot in toolbar. */
  actions?: React.ReactNode;
  /** Footer slot — usually <Pagination />. Optional now that `pagination` is built-in. */
  footer?: React.ReactNode;
  /** Title shown above the toolbar. */
  title?: React.ReactNode;
  /** Extra class names on the outer table card. */
  className?: string;
  /** Inline style on the outer table card. */
  style?: React.CSSProperties;
  /** Extra class names forwarded to the inner `Table`. */
  tableClassName?: string;
  /** Inline style forwarded to the inner `Table`. */
  tableStyle?: React.CSSProperties;
}

type TableProComponent = <Row extends Record<string, any> = any>(
  props: TableProProps<Row> & React.RefAttributes<HTMLDivElement>
) => React.ReactElement | null;

/**
 * `TablePro` — full-featured table card with toolbar, sortable/selectable rows,
 * variants, and a footer slot for pagination.
 */
const TableProInner = <Row extends Record<string, any> = any>({
  toolbar,
  actions,
  footer,
  title,
  className = "",
  style,
  tableClassName = "",
  tableStyle,
  columns,
  data,
  rowKey,
  variant,
  hoverable,
  striped,
  sortKey,
  sortDir,
  onSort,
  onChange,
  rowSelection,
  selectable,
  selected,
  onSelect,
  expandable,
  pagination,
  scroll,
  tableProps,
  caption,
  onRowClick,
  activeRowKey,
  rowClassName,
  empty,
  ...rootProps
}: TableProProps<Row>, ref: React.ForwardedRef<HTMLDivElement>) => {
  const innerTableClassName = ["joined", tableClassName].filter(Boolean).join(" ");

  return (
    <div
      ref={ref}
      className={`table-card ${className}`}
      style={style}
      {...rootProps}
    >
      {(title || toolbar || actions) && (
        <div className="table-toolbar">
          {title && <div className="table-title">{title}</div>}
          <div className="table-toolbar-main">{toolbar}</div>
          {actions && <div className="table-toolbar-actions">{actions}</div>}
        </div>
      )}
      <InternalComponentThemePart components="Table">
        <Table
          columns={columns}
          data={data}
          rowKey={rowKey}
          variant={variant}
          hoverable={hoverable}
          striped={striped}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={onSort}
          onChange={onChange}
          rowSelection={rowSelection}
          selectable={selectable}
          selected={selected}
          onSelect={onSelect}
          expandable={expandable}
          pagination={pagination}
          scroll={scroll}
          tableProps={tableProps}
          caption={caption}
          onRowClick={onRowClick}
          activeRowKey={activeRowKey}
          rowClassName={rowClassName}
          empty={empty}
          className={innerTableClassName}
          style={tableStyle}
        />
      </InternalComponentThemePart>
      {footer && <div className="table-footer">{footer}</div>}
    </div>
  );
};

const TableProBase = React.forwardRef(TableProInner) as TableProComponent;
(TableProBase as any).displayName = "TablePro";
export const TablePro = withComponentTheme(
  TableProBase as React.ForwardRefExoticComponent<
    TableProProps & React.RefAttributes<HTMLDivElement>
  >,
  "TablePro",
  ["table-pro", "table", "button", "checkbox", "pagination", "select", "input"]
) as TableProComponent;
