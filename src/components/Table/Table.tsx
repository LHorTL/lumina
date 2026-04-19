import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Table.css";
import * as React from "react";
import { Icon } from "../Icon";
import { Checkbox } from "../Checkbox";

export interface TableColumn<Row = any> {
  key: string;
  title: React.ReactNode;
  /** Data key to read from row, or custom render. */
  dataIndex?: keyof Row;
  render?: (value: any, row: Row, index: number) => React.ReactNode;
  width?: number | string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
}

export type TableVariant = "default" | "striped" | "embossed" | "cards";

export interface TableProps<Row = any> {
  columns: TableColumn<Row>[];
  data: Row[];
  rowKey?: keyof Row | ((row: Row) => string | number);
  /** Visual variant. */
  variant?: TableVariant;
  /** Hoverable rows. */
  hoverable?: boolean;
  /** Striped rows (shortcut for variant="striped"). */
  striped?: boolean;

  /** Sort state — controlled. */
  sortKey?: string;
  sortDir?: "asc" | "desc";
  onSort?: (key: string) => void;

  /** Row selection — controlled list of selected row keys. */
  selectable?: boolean;
  selected?: (string | number)[];
  onSelect?: (keys: (string | number)[]) => void;

  /** Called when user clicks a row. */
  onRowClick?: (row: Row, index: number) => void;
  /** Empty state. */
  empty?: React.ReactNode;
  className?: string;
}

/** `Table` — neumorphic data table with sorting, selection and visual variants. */
export function Table<Row extends Record<string, any> = any>({
  columns,
  data,
  rowKey,
  variant,
  hoverable = true,
  striped,
  sortKey,
  sortDir = "asc",
  onSort,
  selectable,
  selected = [],
  onSelect,
  onRowClick,
  empty = "暂无数据",
  className = "",
}: TableProps<Row>) {
  const keyOf = (row: Row, i: number): string | number => {
    if (typeof rowKey === "function") return rowKey(row);
    if (rowKey) return row[rowKey] as any;
    return i;
  };

  const v: TableVariant = variant ?? (striped ? "striped" : "default");
  const allSelected =
    selectable && data.length > 0 && data.every((r, i) => selected.includes(keyOf(r, i)));

  const toggleRow = (k: string | number) => {
    if (!onSelect) return;
    onSelect(selected.includes(k) ? selected.filter((x) => x !== k) : [...selected, k]);
  };
  const toggleAll = () => {
    if (!onSelect) return;
    onSelect(allSelected ? [] : data.map((r, i) => keyOf(r, i)));
  };

  return (
    <div className={`table-wrap ${className}`}>
      <table className={`table ${v} ${hoverable ? "hoverable" : ""}`}>
        <thead>
          <tr>
            {selectable && (
              <th className="row-check" style={{ width: 36 }}>
                <Checkbox checked={allSelected} onChange={toggleAll} />
              </th>
            )}
            {columns.map((c) => {
              const sorted = sortKey === c.key;
              return (
                <th
                  key={c.key}
                  className={`${c.sortable ? "sortable" : ""} ${sorted ? "sorted" : ""}`}
                  style={{ width: c.width, textAlign: c.align ?? "left" }}
                  onClick={() => c.sortable && onSort?.(c.key)}
                >
                  {c.title}
                  {c.sortable && (
                    <span className="sort-ind">
                      <Icon
                        name={sorted ? (sortDir === "asc" ? "chevUp" : "chevDown") : "chevDown"}
                        size={10}
                      />
                    </span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className="table-empty">
                {empty}
              </td>
            </tr>
          ) : (
            data.map((row, i) => {
              const k = keyOf(row, i);
              const isSel = selected.includes(k);
              return (
                <tr
                  key={k}
                  className={`${onRowClick ? "clickable" : ""} ${isSel ? "selected" : ""}`}
                  onClick={onRowClick ? () => onRowClick(row, i) : undefined}
                >
                  {selectable && (
                    <td
                      className="row-check"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRow(k);
                      }}
                    >
                      <Checkbox checked={isSel} onChange={() => toggleRow(k)} />
                    </td>
                  )}
                  {columns.map((c) => {
                    const val = c.dataIndex ? row[c.dataIndex] : undefined;
                    return (
                      <td key={c.key} style={{ textAlign: c.align ?? "left" }}>
                        {c.render ? c.render(val, row, i) : (val as React.ReactNode)}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export interface TableProProps<Row = any> extends TableProps<Row> {
  /** Toolbar slot — search input, filter, etc. */
  toolbar?: React.ReactNode;
  /** Right-aligned actions slot in toolbar. */
  actions?: React.ReactNode;
  /** Footer slot — usually <Pagination />. */
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
