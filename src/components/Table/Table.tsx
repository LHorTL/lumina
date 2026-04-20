import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Table.css";
import * as React from "react";
import { createPortal } from "react-dom";
import { Icon } from "../Icon";
import { Checkbox } from "../Checkbox";
import { Pagination } from "../Pagination";
import { useFloating } from "../../utils/useFloating";

export type RowKey = string | number;

export interface TableColumnFilterItem {
  text: React.ReactNode;
  value: string | number;
}

export interface TableColumn<Row = any> {
  key: string;
  title: React.ReactNode;
  /** Data key to read from row, or custom render. */
  dataIndex?: keyof Row;
  render?: (value: any, row: Row, index: number) => React.ReactNode;
  width?: number | string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  /** Filter options shown in header dropdown. Requires `onFilter` (or data index match). */
  filters?: TableColumnFilterItem[];
  /**
   * Predicate to decide whether a row matches a given filter value.
   * If omitted, falls back to strict equality on `row[dataIndex]`.
   */
  onFilter?: (value: string | number, row: Row) => boolean;
  /**
   * Default active filter values. When `filteredValue` is controlled externally via
   * `Table.filteredValue`, prefer managing it at the table level.
   */
  defaultFilteredValue?: (string | number)[];
  /** Controlled filter selection — when provided, makes the column's filter controlled. */
  filteredValue?: (string | number)[];
}

export type TableVariant = "default" | "striped" | "embossed" | "cards";

export interface PaginationConfig {
  /** Current page (1-indexed). Makes pagination controlled. */
  current?: number;
  /** Uncontrolled initial page. */
  defaultCurrent?: number;
  /** Items per page. */
  pageSize?: number;
  /** Default items per page (uncontrolled). */
  defaultPageSize?: number;
  /** Total item count. Defaults to `data.length` when omitted. */
  total?: number;
  /** Fired when user picks a page or changes page size. */
  onChange?: (page: number, pageSize: number) => void;
  /** Reserved for future: jump-to-page input. */
  showQuickJumper?: boolean;
  /** Reserved for future: page size dropdown. */
  showSizeChanger?: boolean;
  /** Reserved for future: selectable page sizes. */
  pageSizeOptions?: number[];
}

export interface RowSelectionConfig<Row = any> {
  /** "checkbox" (default) allows multi-select; "radio" allows only one row at a time. */
  type?: "checkbox" | "radio";
  /** Controlled list of selected row keys. */
  selectedRowKeys?: RowKey[];
  /** Uncontrolled initial selection. */
  defaultSelectedRowKeys?: RowKey[];
  /** Fired on selection change; receives the new keys and matching rows. */
  onChange?: (selectedRowKeys: RowKey[], selectedRows: Row[]) => void;
  /** Per-row switch toggling checkbox disabled state. */
  getCheckboxProps?: (row: Row) => { disabled?: boolean };
}

export interface ExpandableConfig<Row = any> {
  /** Controlled expanded row keys. */
  expandedRowKeys?: RowKey[];
  /** Uncontrolled initial expanded row keys. */
  defaultExpandedRowKeys?: RowKey[];
  /** Fired when a row expands / collapses. */
  onExpand?: (expanded: boolean, row: Row) => void;
  /** Render function for the expanded panel. When omitted, no expand UI renders. */
  expandedRowRender?: (row: Row, index: number) => React.ReactNode;
  /** Decide whether a given row can be expanded. */
  rowExpandable?: (row: Row) => boolean;
}

export interface TableScrollConfig {
  /** Horizontal scroll: min-width of the inner table. */
  x?: number | string;
  /** Vertical scroll: max body height (with sticky header). */
  y?: number | string;
}

export interface TableProps<Row = any> {
  columns: TableColumn<Row>[];
  data: Row[];
  rowKey?: keyof Row | ((row: Row) => RowKey);
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

  /**
   * Row selection config — preferred API (antd-style).
   * When provided, takes precedence over `selectable` / `selected` / `onSelect`.
   */
  rowSelection?: RowSelectionConfig<Row>;

  /**
   * @deprecated Use `rowSelection` instead. Kept for backwards compatibility.
   */
  selectable?: boolean;
  /**
   * @deprecated Use `rowSelection.selectedRowKeys` instead.
   */
  selected?: RowKey[];
  /**
   * @deprecated Use `rowSelection.onChange` instead.
   */
  onSelect?: (keys: RowKey[]) => void;

  /** Expandable row config. */
  expandable?: ExpandableConfig<Row>;

  /**
   * Pagination config — `false` disables pagination; otherwise renders a bottom
   * pagination bar and slices the data accordingly.
   */
  pagination?: false | PaginationConfig;

  /** Horizontal / vertical scroll config. */
  scroll?: TableScrollConfig;

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
  rowSelection,
  selectable,
  selected = [],
  onSelect,
  expandable,
  pagination,
  scroll,
  onRowClick,
  empty = "暂无数据",
  className = "",
}: TableProps<Row>) {
  const keyOf = React.useCallback(
    (row: Row, i: number): RowKey => {
      if (typeof rowKey === "function") return rowKey(row);
      if (rowKey) return row[rowKey] as any;
      return i;
    },
    [rowKey]
  );

  // ---------- Selection (rowSelection OR legacy selectable) ----------
  const selectionMode = rowSelection ? "new" : selectable ? "legacy" : "off";
  const selectionType = rowSelection?.type ?? "checkbox";

  const [innerSel, setInnerSel] = React.useState<RowKey[]>(
    rowSelection?.defaultSelectedRowKeys ?? []
  );
  const selControlledNew = rowSelection?.selectedRowKeys !== undefined;
  const selectedKeys: RowKey[] =
    selectionMode === "new"
      ? selControlledNew
        ? rowSelection!.selectedRowKeys!
        : innerSel
      : selectionMode === "legacy"
      ? selected
      : [];

  const commitSelected = (next: RowKey[], rows: Row[]) => {
    if (selectionMode === "new") {
      if (!selControlledNew) setInnerSel(next);
      rowSelection!.onChange?.(next, rows);
    } else if (selectionMode === "legacy") {
      onSelect?.(next);
    }
  };

  // ---------- Filters ----------
  // Per-column active filter values (internal state for uncontrolled columns).
  const [innerFilters, setInnerFilters] = React.useState<Record<string, (string | number)[]>>(
    () => {
      const out: Record<string, (string | number)[]> = {};
      for (const c of columns) {
        if (c.defaultFilteredValue && c.defaultFilteredValue.length) {
          out[c.key] = c.defaultFilteredValue;
        }
      }
      return out;
    }
  );
  const activeFilters: Record<string, (string | number)[]> = React.useMemo(() => {
    const out: Record<string, (string | number)[]> = {};
    for (const c of columns) {
      if (!c.filters?.length) continue;
      if (c.filteredValue !== undefined) {
        if (c.filteredValue.length) out[c.key] = c.filteredValue;
      } else if (innerFilters[c.key]?.length) {
        out[c.key] = innerFilters[c.key];
      }
    }
    return out;
  }, [columns, innerFilters]);

  const setColumnFilter = (col: TableColumn<Row>, values: (string | number)[]) => {
    if (col.filteredValue !== undefined) return; // controlled — parent must handle
    setInnerFilters((prev) => {
      const next = { ...prev };
      if (values.length === 0) delete next[col.key];
      else next[col.key] = values;
      return next;
    });
  };

  const filteredData = React.useMemo(() => {
    const entries = Object.entries(activeFilters);
    if (entries.length === 0) return data;
    return data.filter((row) => {
      for (const [colKey, vals] of entries) {
        const col = columns.find((c) => c.key === colKey);
        if (!col) continue;
        const match = vals.some((v) => {
          if (col.onFilter) return col.onFilter(v, row);
          if (col.dataIndex != null) {
            const cell = (row as any)[col.dataIndex];
            return cell === v || String(cell) === String(v);
          }
          return false;
        });
        if (!match) return false;
      }
      return true;
    });
  }, [data, columns, activeFilters]);

  // ---------- Pagination ----------
  const pagEnabled = pagination !== false && pagination !== undefined;
  const pagCfg: PaginationConfig = pagEnabled ? pagination! : {};
  const [innerPage, setInnerPage] = React.useState<number>(
    pagCfg.defaultCurrent ?? 1
  );
  const [innerPageSize, setInnerPageSize] = React.useState<number>(
    pagCfg.defaultPageSize ?? pagCfg.pageSize ?? 10
  );
  const pageControlled = pagCfg.current !== undefined;
  const curPage = pageControlled ? pagCfg.current! : innerPage;
  const curPageSize = pagCfg.pageSize ?? innerPageSize;
  const totalCount = pagCfg.total ?? filteredData.length;
  // Keep internal state in sync when caller changes pageSize uncontrolled->new.
  React.useEffect(() => {
    if (pagCfg.pageSize !== undefined && pagCfg.pageSize !== innerPageSize) {
      setInnerPageSize(pagCfg.pageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagCfg.pageSize]);

  // Reset to page 1 if filters pushed us past the last page
  React.useEffect(() => {
    if (!pagEnabled) return;
    const pages = Math.max(1, Math.ceil(filteredData.length / curPageSize));
    if (!pageControlled && curPage > pages) setInnerPage(pages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredData.length, curPageSize, pagEnabled]);

  const pagedData = React.useMemo(() => {
    if (!pagEnabled) return filteredData;
    // If caller passes a pre-sliced page (total != data length and current is
    // controlled), trust them and don't re-slice.
    if (pagCfg.total !== undefined && pageControlled) {
      return filteredData;
    }
    const start = (curPage - 1) * curPageSize;
    return filteredData.slice(start, start + curPageSize);
  }, [pagEnabled, filteredData, curPage, curPageSize, pagCfg.total, pageControlled]);

  const onPageChange = (p: number) => {
    if (!pageControlled) setInnerPage(p);
    pagCfg.onChange?.(p, curPageSize);
  };

  // ---------- Expandable ----------
  const [innerExpanded, setInnerExpanded] = React.useState<RowKey[]>(
    expandable?.defaultExpandedRowKeys ?? []
  );
  const expandControlled = expandable?.expandedRowKeys !== undefined;
  const expandedKeys: RowKey[] = expandControlled
    ? expandable!.expandedRowKeys!
    : innerExpanded;
  const hasExpandable = !!expandable?.expandedRowRender;

  const toggleExpand = (row: Row, k: RowKey) => {
    const isOpen = expandedKeys.includes(k);
    const next = isOpen ? expandedKeys.filter((x) => x !== k) : [...expandedKeys, k];
    if (!expandControlled) setInnerExpanded(next);
    expandable?.onExpand?.(!isOpen, row);
  };

  // ---------- Derived bits ----------
  const v: TableVariant = variant ?? (striped ? "striped" : "default");
  const rowsToRender = pagedData;

  const selectableKeysOnPage = rowsToRender
    .map((r, i) => ({ row: r, k: keyOf(r, i) }))
    .filter(({ row }) => {
      if (selectionMode !== "new") return true;
      const props = rowSelection?.getCheckboxProps?.(row);
      return !props?.disabled;
    });

  const allSelectedOnPage =
    selectionMode !== "off" &&
    selectableKeysOnPage.length > 0 &&
    selectableKeysOnPage.every(({ k }) => selectedKeys.includes(k));
  const someSelectedOnPage =
    selectionMode !== "off" &&
    selectableKeysOnPage.some(({ k }) => selectedKeys.includes(k)) &&
    !allSelectedOnPage;

  const toggleRow = (row: Row, k: RowKey) => {
    if (selectionMode === "new") {
      const props = rowSelection?.getCheckboxProps?.(row);
      if (props?.disabled) return;
      let next: RowKey[];
      if (selectionType === "radio") {
        next = [k];
      } else {
        next = selectedKeys.includes(k)
          ? selectedKeys.filter((x) => x !== k)
          : [...selectedKeys, k];
      }
      const nextRows = data.filter((r, i) => next.includes(keyOf(r, i)));
      commitSelected(next, nextRows);
    } else if (selectionMode === "legacy") {
      const next = selectedKeys.includes(k)
        ? selectedKeys.filter((x) => x !== k)
        : [...selectedKeys, k];
      commitSelected(next, []);
    }
  };
  const toggleAll = () => {
    if (selectionMode === "off") return;
    if (selectionType === "radio") return; // radio doesn't support bulk toggle
    if (allSelectedOnPage) {
      // Deselect keys that appear on the current page
      const pageKeys = new Set(selectableKeysOnPage.map(({ k }) => k));
      const next = selectedKeys.filter((k) => !pageKeys.has(k));
      const nextRows = data.filter((r, i) => next.includes(keyOf(r, i)));
      commitSelected(next, nextRows);
    } else {
      // Select union of existing selection + page's selectable keys
      const set = new Set(selectedKeys);
      selectableKeysOnPage.forEach(({ k }) => set.add(k));
      const next = Array.from(set);
      const nextRows = data.filter((r, i) => next.includes(keyOf(r, i)));
      commitSelected(next, nextRows);
    }
  };

  const showSelCol = selectionMode !== "off";
  const showExpandCol = hasExpandable;
  const extraColCount = (showSelCol ? 1 : 0) + (showExpandCol ? 1 : 0);
  const totalColCount = columns.length + extraColCount;

  // ---------- Wrapper styling for scroll ----------
  const wrapStyle: React.CSSProperties = {};
  const innerTableStyle: React.CSSProperties = {};
  let wrapClass = "table-wrap";
  if (scroll?.y != null) {
    wrapStyle.maxHeight = scroll.y;
    wrapStyle.overflowY = "auto";
    wrapClass += " scroll-y";
  }
  if (scroll?.x != null) {
    wrapStyle.overflowX = "auto";
    innerTableStyle.minWidth = scroll.x;
    wrapClass += " scroll-x";
  }

  // ---------- Render ----------
  return (
    <>
      <div className={`${wrapClass} ${className}`} style={wrapStyle}>
        <table
          className={`table ${v} ${hoverable ? "hoverable" : ""} ${scroll?.y != null ? "sticky-head" : ""}`}
          style={innerTableStyle}
        >
          <thead>
            <tr>
              {showExpandCol && <th className="row-expand" style={{ width: 40 }} />}
              {showSelCol && (
                <th className="row-check" style={{ width: 44 }}>
                  {selectionType === "checkbox" && (
                    <Checkbox
                      checked={allSelectedOnPage}
                      indeterminate={someSelectedOnPage}
                      onChange={toggleAll}
                    />
                  )}
                </th>
              )}
              {columns.map((c) => {
                const sorted = sortKey === c.key;
                const hasFilters = !!c.filters?.length;
                const filterActive = !!activeFilters[c.key]?.length;
                return (
                  <th
                    key={c.key}
                    className={`${c.sortable ? "sortable" : ""} ${sorted ? "sorted" : ""} ${hasFilters ? "filterable" : ""}`}
                    style={{ width: c.width, textAlign: c.align ?? "left" }}
                    onClick={() => c.sortable && onSort?.(c.key)}
                  >
                    <span className="th-label">{c.title}</span>
                    {c.sortable && (
                      <span className="sort-ind">
                        <Icon
                          name={sorted ? (sortDir === "asc" ? "chevUp" : "chevDown") : "chevDown"}
                          size={10}
                        />
                      </span>
                    )}
                    {hasFilters && (
                      <ColumnFilterButton
                        column={c}
                        activeValues={activeFilters[c.key] ?? []}
                        onApply={(values) => setColumnFilter(c, values)}
                        active={filterActive}
                      />
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rowsToRender.length === 0 ? (
              <tr>
                <td colSpan={totalColCount} className="table-empty">
                  {empty}
                </td>
              </tr>
            ) : (
              rowsToRender.map((row, i) => {
                const k = keyOf(row, i);
                const isSel = selectedKeys.includes(k);
                const selProps = rowSelection?.getCheckboxProps?.(row);
                const canExpand =
                  hasExpandable && (expandable?.rowExpandable?.(row) ?? true);
                const isExpanded = canExpand && expandedKeys.includes(k);
                return (
                  <React.Fragment key={k}>
                    <tr
                      className={`${onRowClick ? "clickable" : ""} ${isSel ? "selected" : ""}`}
                      onClick={onRowClick ? () => onRowClick(row, i) : undefined}
                    >
                      {showExpandCol && (
                        <td
                          className="row-expand"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (canExpand) toggleExpand(row, k);
                          }}
                        >
                          {canExpand && (
                            <button
                              type="button"
                              className={`expand-btn ${isExpanded ? "open" : ""}`}
                              aria-expanded={isExpanded}
                              aria-label={isExpanded ? "Collapse row" : "Expand row"}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(row, k);
                              }}
                            >
                              <Icon name="chevRight" size={12} />
                            </button>
                          )}
                        </td>
                      )}
                      {showSelCol && (
                        <td
                          className="row-check"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRow(row, k);
                          }}
                        >
                          {selectionType === "radio" ? (
                            <button
                              type="button"
                              role="radio"
                              aria-checked={isSel}
                              disabled={selProps?.disabled}
                              className={`radio-dot ${isSel ? "checked" : ""}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRow(row, k);
                              }}
                            />
                          ) : (
                            <Checkbox
                              checked={isSel}
                              disabled={selProps?.disabled}
                              onChange={() => toggleRow(row, k)}
                            />
                          )}
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
                    {isExpanded && expandable?.expandedRowRender && (
                      <tr className="expanded-row">
                        <td colSpan={totalColCount}>
                          <div className="expanded-panel">
                            {expandable.expandedRowRender(row, i)}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {pagEnabled && (
        <div className="table-pagination">
          <Pagination
            total={totalCount}
            pageSize={curPageSize}
            page={curPage}
            onChange={onPageChange}
          />
        </div>
      )}
    </>
  );
}

/* ============ Column filter button (header popover) ============ */

interface ColumnFilterButtonProps<Row> {
  column: TableColumn<Row>;
  activeValues: (string | number)[];
  onApply: (values: (string | number)[]) => void;
  active: boolean;
}

function ColumnFilterButton<Row>({
  column,
  activeValues,
  onApply,
  active,
}: ColumnFilterButtonProps<Row>) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<(string | number)[]>(activeValues);
  const panelRef = React.useRef<HTMLDivElement>(null);

  const { triggerRef, floatingStyle } = useFloating<HTMLButtonElement>({
    open,
    placement: "bottom",
    panelWidth: 200,
    panelHeight: Math.min(260, (column.filters?.length ?? 0) * 32 + 80),
    alignCross: "end",
  });

  React.useEffect(() => {
    if (open) setDraft(activeValues);
  }, [open, activeValues]);

  React.useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const toggle = (v: string | number) =>
    setDraft((d) => (d.includes(v) ? d.filter((x) => x !== v) : [...d, v]));

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`filter-ind ${active ? "active" : ""}`}
        aria-label="Filter column"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        <Icon name="filter" size={10} />
      </button>
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={panelRef}
            className="table-filter-panel"
            style={floatingStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="table-filter-options">
              {(column.filters ?? []).map((f) => (
                <label key={String(f.value)} className="table-filter-item">
                  <Checkbox
                    checked={draft.includes(f.value)}
                    onChange={() => toggle(f.value)}
                  />
                  <span>{f.text}</span>
                </label>
              ))}
            </div>
            <div className="table-filter-actions">
              <button
                type="button"
                className="tf-btn ghost"
                onClick={() => {
                  setDraft([]);
                  onApply([]);
                  setOpen(false);
                }}
              >
                重置
              </button>
              <button
                type="button"
                className="tf-btn primary"
                onClick={() => {
                  onApply(draft);
                  setOpen(false);
                }}
              >
                确定
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

/* ============ TablePro ============ */

export interface TableProProps<Row = any> extends TableProps<Row> {
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
 *
 * Prefer the built-in `pagination` prop over rendering a `<Pagination />` in the
 * `footer` slot; `footer` still works for custom footers.
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
