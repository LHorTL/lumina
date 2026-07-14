import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Table.css";
import * as React from "react";
import { createPortal } from "react-dom";
import { Icon } from "../Icon";
import { Button, IconButton } from "../Button";
import { Checkbox } from "../Checkbox";
import { Pagination } from "../Pagination";
import { useFloating } from "../../utils/useFloating";
import { usePortalContainer } from "../../utils/portal";
import { useOverlayLayer } from "../../utils/overlayStack";
import {
  InternalComponentThemePart,
  useComponentPortalTheme,
  withComponentTheme,
  type ComponentThemeProps,
} from "../Theme/ComponentTheme";

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
  /** Show a jump-to-page input. */
  showQuickJumper?: boolean;
  /** Show a page size dropdown. */
  showSizeChanger?: boolean;
  /** Selectable page sizes for the size dropdown. */
  pageSizeOptions?: number[];
  /** 数据分页方式。`local` 由 Table 切片，`remote` 直接渲染传入数据。 */
  mode?: "local" | "remote";
}

/** Table 统一变更事件的触发来源。 */
export type TableChangeAction = "paginate" | "filter" | "sort";

/** Table 当前分页快照。 */
export interface TablePaginationState {
  current: number;
  pageSize: number;
  total: number;
}

/** Table 当前排序快照。 */
export interface TableSorterState {
  key?: string;
  direction?: "asc" | "desc";
}

/** Table 排序、筛选和分页的统一变更信息。 */
export interface TableChangeInfo<Row = any> {
  action: TableChangeAction;
  pagination?: TablePaginationState;
  filters: Record<string, (string | number)[]>;
  sorter: TableSorterState;
  currentData: Row[];
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

export interface TableProps<Row = any>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect" | "onChange">,
    ComponentThemeProps {
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
  /** 排序、筛选或分页变化时触发，适合统一同步 URL 或远程请求参数。 */
  onChange?: (info: TableChangeInfo<Row>) => void;

  /**
   * Row selection config — preferred API.
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
  /** 原生 table 元素属性，例如 aria-label。 */
  tableProps?: Omit<React.TableHTMLAttributes<HTMLTableElement>, "children">;
  /** 原生表格标题；可用 className 自行做视觉隐藏。 */
  caption?: React.ReactNode;

  /** Called when user clicks a row. */
  onRowClick?: (row: Row, index: number) => void;
  /** Empty state. */
  empty?: React.ReactNode;
  className?: string;
}

/** Table 内部保留的稳定行身份与原始索引。 */
interface TableRowEntry<Row> {
  row: Row;
  key: RowKey;
  sourceIndex: number;
}

/** 按当前列筛选条件过滤行，同时保留稳定行键。 */
function filterTableEntries<Row>(
  entries: TableRowEntry<Row>[],
  filters: Record<string, (string | number)[]>,
  columnMap: Map<string, TableColumn<Row>>
): TableRowEntry<Row>[] {
  const activeEntries = Object.entries(filters);
  if (activeEntries.length === 0) return entries;
  return entries.filter(({ row }) => {
    for (const [columnKey, values] of activeEntries) {
      const column = columnMap.get(columnKey);
      if (!column) continue;
      const matches = values.some((value) => {
        if (column.onFilter) return column.onFilter(value, row);
        if (column.dataIndex == null) return false;
        const cell = row[column.dataIndex];
        return cell === value || String(cell) === String(value);
      });
      if (!matches) return false;
    }
    return true;
  });
}

type TableComponent = <Row extends Record<string, any> = any>(
  props: TableProps<Row> & React.RefAttributes<HTMLDivElement>
) => React.ReactElement | null;

const TableInner = <Row extends Record<string, any> = any>({
  columns,
  data,
  rowKey,
  variant,
  hoverable = true,
  striped,
  sortKey,
  sortDir = "asc",
  onSort,
  onChange,
  rowSelection,
  selectable,
  selected = [],
  onSelect,
  expandable,
  pagination,
  scroll,
  tableProps,
  caption,
  onRowClick,
  empty = "暂无数据",
  className = "",
  style,
  ...rest
}: TableProps<Row>, ref: React.ForwardedRef<HTMLDivElement>) => {
  const sourceEntries = React.useMemo<TableRowEntry<Row>[]>(
    () => data.map((row, sourceIndex) => {
      let key: RowKey;
      if (typeof rowKey === "function") key = rowKey(row);
      else if (rowKey) key = row[rowKey] as RowKey;
      else key = sourceIndex;
      return { row, key, sourceIndex };
    }),
    [data, rowKey]
  );
  const columnMap = React.useMemo(
    () => new Map(columns.map((column) => [column.key, column] as const)),
    [columns]
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

  const filteredEntries = React.useMemo(
    () => filterTableEntries(sourceEntries, activeFilters, columnMap),
    [activeFilters, columnMap, sourceEntries]
  );
  const filteredData = React.useMemo(
    () => filteredEntries.map(({ row }) => row),
    [filteredEntries]
  );

  // ---------- Pagination ----------
  const pagEnabled = pagination !== false && pagination !== undefined;
  const pagCfg: PaginationConfig = pagEnabled ? pagination! : {};
  const [innerPage, setInnerPage] = React.useState<number>(
    Number.isFinite(pagCfg.defaultCurrent) ? Math.max(1, Math.trunc(pagCfg.defaultCurrent!)) : 1
  );
  const [innerPageSize, setInnerPageSize] = React.useState<number>(
    (() => {
      const initial = pagCfg.defaultPageSize ?? pagCfg.pageSize ?? 10;
      return Number.isFinite(initial) && initial > 0 ? Math.max(1, Math.trunc(initial)) : 10;
    })()
  );
  const pageControlled = pagCfg.current !== undefined;
  const requestedPage = pageControlled ? pagCfg.current! : innerPage;
  const curPage = Number.isFinite(requestedPage) ? Math.max(1, Math.trunc(requestedPage)) : 1;
  const requestedPageSize = pagCfg.pageSize ?? innerPageSize;
  const curPageSize = Number.isFinite(requestedPageSize) && requestedPageSize > 0
    ? Math.max(1, Math.trunc(requestedPageSize))
    : 10;
  const requestedTotal = pagCfg.total ?? filteredData.length;
  const totalCount = Number.isFinite(requestedTotal) ? Math.max(0, Math.trunc(requestedTotal)) : filteredData.length;
  const remotePagination =
    pagCfg.mode === "remote" ||
    (pagCfg.mode === undefined && pagCfg.total !== undefined && pageControlled);
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
    const pages = Math.max(1, Math.ceil(totalCount / curPageSize));
    if (!pageControlled && curPage > pages) setInnerPage(pages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curPage, curPageSize, pagEnabled, pageControlled, totalCount]);

  const pagedEntries = React.useMemo(() => {
    if (!pagEnabled || remotePagination) return filteredEntries;
    const start = (curPage - 1) * curPageSize;
    return filteredEntries.slice(start, start + curPageSize);
  }, [curPage, curPageSize, filteredEntries, pagEnabled, remotePagination]);

  /** 向消费者发送统一的表格状态快照。 */
  const emitChange = React.useCallback((
    action: TableChangeAction,
    overrides: {
      current?: number;
      pageSize?: number;
      filters?: Record<string, (string | number)[]>;
      sorter?: TableSorterState;
      currentData?: Row[];
    } = {}
  ) => {
    const nextCurrent = overrides.current ?? curPage;
    const nextPageSize = overrides.pageSize ?? curPageSize;
    onChange?.({
      action,
      pagination: pagEnabled
        ? { current: nextCurrent, pageSize: nextPageSize, total: totalCount }
        : undefined,
      filters: overrides.filters ?? activeFilters,
      sorter: overrides.sorter ?? { key: sortKey, direction: sortKey ? sortDir : undefined },
      currentData: overrides.currentData ?? filteredData,
    });
  }, [activeFilters, curPage, curPageSize, filteredData, onChange, pagEnabled, sortDir, sortKey, totalCount]);

  /** 提交单列筛选并联动分页回到第一页。 */
  const setColumnFilter = React.useCallback((column: TableColumn<Row>, values: (string | number)[]) => {
    const nextFilters = { ...activeFilters };
    if (values.length === 0) delete nextFilters[column.key];
    else nextFilters[column.key] = values;
    if (column.filteredValue === undefined) {
      setInnerFilters((previous) => {
        const next = { ...previous };
        if (values.length === 0) delete next[column.key];
        else next[column.key] = values;
        return next;
      });
    }
    if (pagEnabled) {
      if (!pageControlled) setInnerPage(1);
      pagCfg.onChange?.(1, curPageSize);
    }
    const nextData = filterTableEntries(sourceEntries, nextFilters, columnMap).map(({ row }) => row);
    emitChange("filter", { current: 1, filters: nextFilters, currentData: nextData });
  }, [activeFilters, columnMap, curPageSize, emitChange, pagCfg, pagEnabled, pageControlled, sourceEntries]);

  const skipNextPaginationChangeRef = React.useRef(false);

  const onPageChange = (p: number) => {
    if (skipNextPaginationChangeRef.current) {
      skipNextPaginationChangeRef.current = false;
      return;
    }
    if (!pageControlled) setInnerPage(p);
    pagCfg.onChange?.(p, curPageSize);
    emitChange("paginate", { current: p });
  };

  const onPageSizeChange = (_current: number, size: number) => {
    skipNextPaginationChangeRef.current = true;
    if (!pageControlled) setInnerPage(1);
    if (pagCfg.pageSize === undefined) setInnerPageSize(size);
    pagCfg.onChange?.(1, size);
    emitChange("paginate", { current: 1, pageSize: size });
  };

  // ---------- Expandable ----------
  const [innerExpanded, setInnerExpanded] = React.useState<RowKey[]>(
    expandable?.defaultExpandedRowKeys ?? []
  );
  const expandControlled = expandable?.expandedRowKeys !== undefined;
  const expandedKeys: RowKey[] = expandControlled
    ? expandable!.expandedRowKeys!
    : innerExpanded;
  const expandedKeySet = React.useMemo(() => new Set(expandedKeys), [expandedKeys]);
  const selectedKeySet = React.useMemo(() => new Set(selectedKeys), [selectedKeys]);
  const hasExpandable = !!expandable?.expandedRowRender;

  const toggleExpand = (row: Row, k: RowKey) => {
    const isOpen = expandedKeySet.has(k);
    const next = isOpen ? expandedKeys.filter((x) => x !== k) : [...expandedKeys, k];
    if (!expandControlled) setInnerExpanded(next);
    expandable?.onExpand?.(!isOpen, row);
  };

  // ---------- Derived bits ----------
  const v: TableVariant = variant ?? (striped ? "striped" : "default");
  const rowsToRender = pagedEntries;

  const selectableKeysOnPage = rowsToRender
    .map(({ row, key }) => ({ row, k: key }))
    .filter(({ row }) => {
      if (selectionMode !== "new") return true;
      const props = rowSelection?.getCheckboxProps?.(row);
      return !props?.disabled;
    });

  const allSelectedOnPage =
    selectionMode !== "off" &&
    selectableKeysOnPage.length > 0 &&
    selectableKeysOnPage.every(({ k }) => selectedKeySet.has(k));
  const someSelectedOnPage =
    selectionMode !== "off" &&
    selectableKeysOnPage.some(({ k }) => selectedKeySet.has(k)) &&
    !allSelectedOnPage;

  const toggleRow = (row: Row, k: RowKey) => {
    if (selectionMode === "new") {
      const props = rowSelection?.getCheckboxProps?.(row);
      if (props?.disabled) return;
      let next: RowKey[];
      if (selectionType === "radio") {
        next = [k];
      } else {
        next = selectedKeySet.has(k)
          ? selectedKeys.filter((x) => x !== k)
          : [...selectedKeys, k];
      }
      const nextSet = new Set(next);
      const nextRows = sourceEntries.filter(({ key }) => nextSet.has(key)).map(({ row: item }) => item);
      commitSelected(next, nextRows);
    } else if (selectionMode === "legacy") {
      const next = selectedKeySet.has(k)
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
      const nextSet = new Set(next);
      const nextRows = sourceEntries.filter(({ key }) => nextSet.has(key)).map(({ row }) => row);
      commitSelected(next, nextRows);
    } else {
      // Select union of existing selection + page's selectable keys
      const set = new Set(selectedKeys);
      selectableKeysOnPage.forEach(({ k }) => set.add(k));
      const next = Array.from(set);
      const nextSet = new Set(next);
      const nextRows = sourceEntries.filter(({ key }) => nextSet.has(key)).map(({ row }) => row);
      commitSelected(next, nextRows);
    }
  };

  const showSelCol = selectionMode !== "off";
  const showExpandCol = hasExpandable;
  const extraColCount = (showSelCol ? 1 : 0) + (showExpandCol ? 1 : 0);
  const totalColCount = columns.length + extraColCount;

  /** 触发受控排序并把分页复位到第一页。 */
  const handleSort = React.useCallback((columnKey: string) => {
    const nextDirection = sortKey === columnKey && sortDir === "asc" ? "desc" : "asc";
    onSort?.(columnKey);
    if (pagEnabled) {
      if (!pageControlled) setInnerPage(1);
      pagCfg.onChange?.(1, curPageSize);
    }
    emitChange("sort", {
      current: 1,
      sorter: { key: columnKey, direction: nextDirection },
    });
  }, [curPageSize, emitChange, onSort, pagCfg, pagEnabled, pageControlled, sortDir, sortKey]);

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
  const {
    className: nativeTableClassName = "",
    style: nativeTableStyle,
    ...nativeTableProps
  } = tableProps ?? {};

  // ---------- Render ----------
  return (
    <>
      <div
        ref={ref}
        className={`${wrapClass} ${className}`}
        style={{ ...wrapStyle, ...style }}
        {...rest}
      >
        <table
          {...nativeTableProps}
          className={`table ${v} ${hoverable ? "hoverable" : ""} ${scroll?.y != null ? "sticky-head" : ""} ${nativeTableClassName}`}
          style={{ ...innerTableStyle, ...nativeTableStyle }}
        >
          {caption != null && <caption>{caption}</caption>}
          <thead>
            <tr>
              {showExpandCol && <th scope="col" className="row-expand" style={{ width: 40 }} />}
              {showSelCol && (
                <th scope="col" className="row-check" style={{ width: 44 }}>
                  {selectionType === "checkbox" && (
                    <InternalComponentThemePart components="Checkbox">
                      <Checkbox
                        checked={allSelectedOnPage}
                        indeterminate={someSelectedOnPage}
                        onChange={toggleAll}
                        label={<span className="table-sr-only">选择当前页</span>}
                      />
                    </InternalComponentThemePart>
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
                    scope="col"
                    aria-sort={c.sortable ? (sorted ? (sortDir === "asc" ? "ascending" : "descending") : "none") : undefined}
                  >
                    {c.sortable ? (
                      <InternalComponentThemePart components="Button">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="table-sort-trigger"
                          onClick={() => handleSort(c.key)}
                        >
                          <span className="th-label">{c.title}</span>
                          <span className="sort-ind" aria-hidden="true">
                            <Icon
                              name={sorted ? (sortDir === "asc" ? "chevUp" : "chevDown") : "chevDown"}
                              size={10}
                            />
                          </span>
                        </Button>
                      </InternalComponentThemePart>
                    ) : (
                      <span className="th-label">{c.title}</span>
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
              rowsToRender.map(({ row, key: k }, i) => {
                const isSel = selectedKeySet.has(k);
                const selProps = rowSelection?.getCheckboxProps?.(row);
                const canExpand =
                  hasExpandable && (expandable?.rowExpandable?.(row) ?? true);
                const isExpanded = canExpand && expandedKeySet.has(k);
                const cardSurfaceTarget = showExpandCol
                  ? "__expand"
                  : showSelCol
                    ? "__select"
                    : columns[0]?.key;
                const cardRowSurface =
                  v === "cards" ? (
                    <span className="card-row-surface" aria-hidden="true" />
                  ) : null;
                return (
                  <React.Fragment key={k}>
                    <tr
                      className={`${onRowClick ? "clickable" : ""} ${isSel ? "selected" : ""}`}
                      onClick={onRowClick ? () => onRowClick(row, i) : undefined}
                      tabIndex={onRowClick ? 0 : undefined}
                      aria-selected={selectionMode !== "off" ? isSel : undefined}
                      onKeyDown={onRowClick ? (event) => {
                        if (event.currentTarget !== event.target) return;
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onRowClick(row, i);
                        }
                      } : undefined}
                    >
                      {showExpandCol && (
                        <td
                          className="row-expand"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (canExpand) toggleExpand(row, k);
                          }}
                        >
                          {cardSurfaceTarget === "__expand" && cardRowSurface}
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
                          onClick={(event) => event.stopPropagation()}
                        >
                          {cardSurfaceTarget === "__select" && cardRowSurface}
                          {selectionType === "radio" ? (
                            <button
                              type="button"
                              role="radio"
                              aria-checked={isSel}
                              aria-label={`选择第 ${i + 1} 行`}
                              disabled={selProps?.disabled}
                              className={`radio-dot ${isSel ? "checked" : ""}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRow(row, k);
                              }}
                            />
                          ) : (
                            <InternalComponentThemePart components="Checkbox">
                              <Checkbox
                                checked={isSel}
                                disabled={selProps?.disabled}
                                onChange={() => toggleRow(row, k)}
                                label={<span className="table-sr-only">选择第 {i + 1} 行</span>}
                              />
                            </InternalComponentThemePart>
                          )}
                        </td>
                      )}
                      {columns.map((c) => {
                        const val = c.dataIndex ? row[c.dataIndex] : undefined;
                        return (
                          <td key={c.key} style={{ textAlign: c.align ?? "left" }}>
                            {cardSurfaceTarget === c.key && cardRowSurface}
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
          <InternalComponentThemePart components="Pagination">
            <Pagination
              total={totalCount}
              pageSize={curPageSize}
              page={curPage}
              onChange={onPageChange}
              showQuickJumper={pagCfg.showQuickJumper}
              showSizeChanger={pagCfg.showSizeChanger}
              pageSizeOptions={pagCfg.pageSizeOptions}
              onShowSizeChange={onPageSizeChange}
            />
          </InternalComponentThemePart>
        </div>
      )}
    </>
  );
};

/** `Table` — neumorphic data table with sorting, selection and visual variants. */
const TableBase = React.forwardRef(TableInner) as TableComponent;
(TableBase as any).displayName = "Table";
export const Table = withComponentTheme(
  TableBase as React.ForwardRefExoticComponent<
    TableProps & React.RefAttributes<HTMLDivElement>
  >,
  "Table",
  ["table", "button", "checkbox", "pagination", "select", "input"]
) as TableComponent;

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
  const portalContainer = usePortalContainer();
  const portalTheme = useComponentPortalTheme(["Table", "TablePro"]);
  const panelId = React.useId();

  const { triggerRef, floatingRef: panelRef, floatingStyle, zIndex: panelZIndex } = useFloating<HTMLButtonElement, HTMLDivElement>({
    open,
    placement: "bottom",
    panelWidth: 200,
    panelHeight: Math.min(260, (column.filters?.length ?? 0) * 32 + 80),
    alignCross: "end",
  });

  /** 只关闭当前筛选浮层，并把焦点还给筛选按钮。 */
  const closeFromEscape = React.useCallback(() => {
    setOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, [triggerRef]);

  useOverlayLayer({
    open: open && portalContainer != null,
    containerRef: panelRef,
    ownerRef: triggerRef,
    zIndex: panelZIndex,
    onEscape: closeFromEscape,
  });

  React.useEffect(() => {
    if (open) {
      setDraft(activeValues);
      window.requestAnimationFrame(() => panelRef.current?.focus());
    }
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
      <InternalComponentThemePart components="IconButton">
        <IconButton
          ref={triggerRef}
          icon="filter"
          size="sm"
          variant="ghost"
          className={`filter-ind ${active ? "active" : ""}`}
          tip="筛选列"
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          aria-haspopup="dialog"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((o) => !o);
          }}
        />
      </InternalComponentThemePart>
      {open &&
        portalContainer &&
        createPortal(
          <div
            id={panelId}
            ref={panelRef}
            className="table-filter-panel"
            {...portalTheme.dataAttributes}
            style={{ ...floatingStyle, ...portalTheme.style, ...portalTheme.styles.popup }}
            role="dialog"
            aria-label="列筛选"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="table-filter-options">
              {(column.filters ?? []).map((f) => (
                <InternalComponentThemePart key={String(f.value)} components="Checkbox">
                  <Checkbox
                    className="table-filter-item"
                    label={f.text}
                    checked={draft.includes(f.value)}
                    onChange={() => toggle(f.value)}
                  />
                </InternalComponentThemePart>
              ))}
            </div>
            <div className="table-filter-actions">
              <InternalComponentThemePart components="Button">
                <Button
                  size="sm"
                  variant="ghost"
                  className="tf-btn"
                  onClick={() => {
                    setDraft([]);
                    onApply([]);
                    setOpen(false);
                  }}
                >
                  重置
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  className="tf-btn"
                  onClick={() => {
                    onApply(draft);
                    setOpen(false);
                  }}
                >
                  确定
                </Button>
              </InternalComponentThemePart>
            </div>
          </div>,
          portalContainer
        )}
    </>
  );
}
