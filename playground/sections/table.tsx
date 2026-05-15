import * as React from "react";
import { Avatar, Button, Table, Tag } from "lumina";
import { DocPage } from "../docs";
import { defineSection, type SectionCtx } from "./_types";

interface MemberRow {
  id: number;
  name: string;
  role: string;
  status: string;
  joined: string;
  salary?: number;
}

const statusTone = (status: string) => {
  if (status === "在线") return "success";
  if (status === "忙碌") return "warning";
  return "neutral";
};

const renderStatusTag = (value: unknown) => {
  const status = String(value);
  return (
    <Tag tone={statusTone(status)} dot>
      {status}
    </Tag>
  );
};

const renderName = (value: unknown) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
    <Avatar alt={String(value)} size="sm" /> {String(value)}
  </span>
);

const formatSalary = (value: unknown) =>
  typeof value === "number" ? `¥ ${value.toLocaleString()}` : "-";

interface VariantPreviewProps {
  title: string;
  meta: string;
  tone?: "neutral" | "accent" | "info" | "success" | "warning" | "danger";
  children: React.ReactNode;
}

const VariantPreview: React.FC<VariantPreviewProps> = ({
  title,
  meta,
  tone = "neutral",
  children,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        flexWrap: "wrap",
        padding: "0 4px",
      }}
    >
      <Tag tone={tone}>{title}</Tag>
      <span style={{ color: "var(--fg-muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
        {meta}
      </span>
    </div>
    {children}
  </div>
);

const SectionTable: React.FC<SectionCtx> = () => {
  const data: MemberRow[] = React.useMemo(
    () => [
      { id: 1, name: "金伟", role: "设计", status: "在线", joined: "2024-03-12", salary: 18000 },
      { id: 2, name: "陆希", role: "研发", status: "忙碌", joined: "2024-05-28", salary: 25000 },
      { id: 3, name: "马可", role: "产品", status: "离线", joined: "2023-11-04", salary: 22000 },
      { id: 4, name: "周妍", role: "研发", status: "在线", joined: "2025-01-20", salary: 24000 },
    ],
    []
  );

  const pagedData: MemberRow[] = React.useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i + 1,
        name: `成员 ${i + 1}`,
        role: ["设计", "研发", "产品", "运营"][i % 4],
        status: ["在线", "忙碌", "离线"][i % 3],
        joined: `2024-${String((i % 12) + 1).padStart(2, "0")}-15`,
        salary: 16000 + (i % 8) * 1200,
      })),
    []
  );

  const [selectedKeys, setSelectedKeys] = React.useState<(string | number)[]>([]);
  const [selectedRowsLabel, setSelectedRowsLabel] = React.useState("暂无");
  const [legacySelected, setLegacySelected] = React.useState<(string | number)[]>([2]);
  const [sortKey, setSortKey] = React.useState("salary");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = React.useState<(string | number)[]>(["在线"]);
  const [expandedKeys, setExpandedKeys] = React.useState<(string | number)[]>([1]);
  const [expandMessage, setExpandMessage] = React.useState("金伟 默认展开");
  const [currentPage, setCurrentPage] = React.useState(2);
  const [pageSize, setPageSize] = React.useState(5);
  const [pageMessage, setPageMessage] = React.useState("第 2 页 / 5 条");
  const [clickedRow, setClickedRow] = React.useState("尚未点击行");

  const sortedData = React.useMemo(() => {
    const factor = sortDir === "asc" ? 1 : -1;
    return [...data].sort((a, b) => {
      const left = a[sortKey as keyof MemberRow] ?? "";
      const right = b[sortKey as keyof MemberRow] ?? "";
      if (typeof left === "number" && typeof right === "number") {
        return (left - right) * factor;
      }
      return String(left).localeCompare(String(right), "zh-Hans-CN") * factor;
    });
  }, [data, sortDir, sortKey]);

  const serverPageData = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return pagedData.slice(start, start + pageSize);
  }, [currentPage, pageSize, pagedData]);

  const simpleColumns = [
    { key: "name", title: "姓名", dataIndex: "name" as const },
    { key: "role", title: "部门", dataIndex: "role" as const },
    { key: "status", title: "状态", dataIndex: "status" as const, render: renderStatusTag },
  ];

  return (
    <DocPage
      whenToUse={<p>用于结构化的数据展示。需要复杂功能时请使用 Table Pro。</p>}
      demos={[
        {
          id: "basic",
          title: "基础表格",
          span: 2,
          code: `<Table rowKey="id" columns={[...]} data={data} />`,
          render: () => (
            <Table
              rowKey="id"
              columns={[
                { key: "name", title: "姓名", dataIndex: "name", render: renderName },
                { key: "role", title: "部门", dataIndex: "role", render: (v) => <Tag tone="accent">{v}</Tag> },
                { key: "status", title: "状态", dataIndex: "status", render: renderStatusTag },
                { key: "joined", title: "加入时间", dataIndex: "joined" },
              ]}
              data={data}
            />
          ),
        },
        {
          id: "variants",
          title: "样式变体 / hover",
          span: 2,
          description: "覆盖 variant 的四个取值,以及 striped 快捷属性和 hoverable 关闭状态。",
          code: `<Table variant="default" ... />
<Table striped ... />
<Table variant="embossed" hoverable={false} ... />
<Table variant="cards" ... />`,
          render: () => (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
              <VariantPreview title='variant="default"' meta="默认凹陷表格" tone="neutral">
                <Table rowKey="id" variant="default" columns={simpleColumns} data={data.slice(0, 2)} />
              </VariantPreview>
              <VariantPreview title="striped" meta="striped 快捷属性" tone="info">
                <Table rowKey="id" striped columns={simpleColumns} data={data.slice(0, 2)} />
              </VariantPreview>
              <VariantPreview title='variant="embossed"' meta="hoverable={false}" tone="warning">
                <Table rowKey="id" variant="embossed" hoverable={false} columns={simpleColumns} data={data.slice(0, 2)} />
              </VariantPreview>
              <VariantPreview title='variant="cards"' meta="卡片行样式" tone="accent">
                <Table rowKey="id" variant="cards" columns={simpleColumns} data={data.slice(0, 2)} />
              </VariantPreview>
            </div>
          ),
        },
        {
          id: "pagination",
          title: "内置分页",
          span: 2,
          description: "传入 pagination 即可自动分页;data 会按当前页切片。传 false 关闭。",
          code: `<Table
  rowKey="id"
  columns={[...]}
  data={data}
  pagination={{ pageSize: 6 }}
/>`,
          render: () => (
            <Table
              rowKey="id"
              columns={[
                { key: "id", title: "#", dataIndex: "id", width: 60 },
                { key: "name", title: "姓名", dataIndex: "name" },
                { key: "role", title: "部门", dataIndex: "role" },
                { key: "status", title: "状态", dataIndex: "status", render: renderStatusTag },
                { key: "joined", title: "加入时间", dataIndex: "joined" },
              ]}
              data={pagedData}
              pagination={{ pageSize: 6 }}
            />
          ),
        },
        {
          id: "paginationConfig",
          title: "分页配置",
          span: 2,
          description: "覆盖 current / defaultCurrent / pageSize / defaultPageSize / total / onChange / showQuickJumper / showSizeChanger / pageSizeOptions。",
          code: `<Table
  data={serverPageData}
  pagination={{
    current,
    pageSize,
    total: allRows.length,
    showQuickJumper: true,
    showSizeChanger: true,
    pageSizeOptions: [4, 5, 8],
    onChange: (page, nextPageSize) => {
      setCurrent(page);
      setPageSize(nextPageSize);
    },
  }}
/>

<Table
  data={allRows}
  pagination={{ defaultCurrent: 2, defaultPageSize: 4 }}
/>`,
          render: () => (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Tag tone="info">{pageMessage}</Tag>
              <Table
                rowKey="id"
                columns={[
                  { key: "id", title: "#", dataIndex: "id", width: 60 },
                  { key: "name", title: "姓名", dataIndex: "name" },
                  { key: "role", title: "部门", dataIndex: "role" },
                  { key: "status", title: "状态", dataIndex: "status", render: renderStatusTag },
                ]}
                data={serverPageData}
                pagination={{
                  current: currentPage,
                  pageSize,
                  total: pagedData.length,
                  showQuickJumper: true,
                  showSizeChanger: true,
                  pageSizeOptions: [4, 5, 8],
                  onChange: (page, nextPageSize) => {
                    setCurrentPage(page);
                    setPageSize(nextPageSize);
                    setPageMessage(`第 ${page} 页 / ${nextPageSize} 条`);
                  },
                }}
              />
              <Table
                rowKey="id"
                columns={[
                  { key: "id", title: "#", dataIndex: "id", width: 60 },
                  { key: "name", title: "默认初始页", dataIndex: "name" },
                  { key: "role", title: "部门", dataIndex: "role" },
                ]}
                data={pagedData}
                pagination={{ defaultCurrent: 2, defaultPageSize: 4 }}
              />
            </div>
          ),
        },
        {
          id: "scroll",
          title: "固定表头 / 横向滚动",
          span: 2,
          description: "scroll.y 固定表头并限制表体最大高度;scroll.x 设置内容最小宽度。",
          code: `<Table
  scroll={{ y: 220, x: 900 }}
  columns={[...]}
  data={data}
/>`,
          render: () => (
            <Table
              rowKey="id"
              columns={[
                { key: "id", title: "#", dataIndex: "id", width: 60 },
                { key: "name", title: "姓名", dataIndex: "name", width: 200 },
                { key: "role", title: "部门", dataIndex: "role", width: 180 },
                { key: "status", title: "状态", dataIndex: "status", width: 180, render: renderStatusTag },
                { key: "joined", title: "加入时间", dataIndex: "joined", width: 240 },
                { key: "salary", title: "薪资", dataIndex: "salary", width: 160, align: "right", render: formatSalary },
              ]}
              data={pagedData}
              scroll={{ y: 220, x: 900 }}
            />
          ),
        },
        {
          id: "sortingAndRowClick",
          title: "受控排序 / 行点击",
          span: 2,
          description: "Table 负责渲染排序指示,排序后的 data 由外部状态计算后传入。",
          code: `<Table
  sortKey={sortKey}
  sortDir={sortDir}
  onSort={(key) => {
    setSortKey(key);
    setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
  }}
  onRowClick={(row, index) => setClicked(row.name)}
  columns={[{ key: "salary", sortable: true, align: "right" }]}
/>`,
          render: () => (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Tag tone="accent">{clickedRow}</Tag>
              <Table
                rowKey="id"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={(key) => {
                  if (sortKey === key) {
                    setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
                  } else {
                    setSortKey(key);
                    setSortDir("asc");
                  }
                }}
                onRowClick={(row, index) => setClickedRow(`点击了第 ${index + 1} 行: ${row.name}`)}
                columns={[
                  { key: "name", title: "姓名", dataIndex: "name", sortable: true, render: renderName },
                  { key: "role", title: "部门", dataIndex: "role", sortable: true, render: (v) => <Tag tone="accent">{v}</Tag> },
                  { key: "joined", title: "加入时间", dataIndex: "joined", sortable: true },
                  { key: "salary", title: "薪资", dataIndex: "salary", sortable: true, align: "right", render: formatSalary },
                ]}
                data={sortedData}
              />
            </div>
          ),
        },
        {
          id: "rowSelection",
          title: "行选择 (rowSelection)",
          span: 2,
          description: "rowSelection 提供表头全选、半选状态、受控选中项、回传选中行与按行禁用能力。",
          code: `<Table
  rowSelection={{
    selectedRowKeys,
    onChange: (keys, rows) => {
      setSelectedKeys(keys);
      setSelectedRows(rows);
    },
    getCheckboxProps: (row) => ({ disabled: row.status === "离线" }),
  }}
  columns={[...]}
  data={data}
/>`,
          render: () => (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Tag tone="accent">已选 {selectedKeys.length} 项</Tag>
                <Tag tone="neutral">{selectedRowsLabel}</Tag>
              </div>
              <Table
                rowKey="id"
                rowSelection={{
                  selectedRowKeys: selectedKeys,
                  onChange: (keys, rows) => {
                    setSelectedKeys(keys);
                    setSelectedRowsLabel(rows.length ? rows.map((row) => row.name).join(", ") : "暂无");
                  },
                  getCheckboxProps: (row) => ({ disabled: row.status === "离线" }),
                }}
                columns={[
                  { key: "name", title: "姓名", dataIndex: "name" },
                  { key: "role", title: "部门", dataIndex: "role" },
                  { key: "status", title: "状态", dataIndex: "status", render: renderStatusTag },
                  { key: "joined", title: "加入时间", dataIndex: "joined" },
                ]}
                data={data}
              />
            </div>
          ),
        },
        {
          id: "rowSelectionRadio",
          title: "行选择 · 单选",
          span: 2,
          description: "设置 rowSelection.type = 'radio' 变成单选模式,defaultSelectedRowKeys 设置非受控初始值。",
          code: `<Table
  rowSelection={{ type: "radio", defaultSelectedRowKeys: [1] }}
  columns={[...]}
  data={data}
/>`,
          render: () => (
            <Table
              rowKey="id"
              rowSelection={{ type: "radio", defaultSelectedRowKeys: [1] }}
              columns={[
                { key: "name", title: "姓名", dataIndex: "name" },
                { key: "role", title: "部门", dataIndex: "role" },
                { key: "status", title: "状态", dataIndex: "status", render: renderStatusTag },
              ]}
              data={data}
            />
          ),
        },
        {
          id: "legacySelection",
          title: "旧版选择 API",
          span: 2,
          description: "selectable / selected / onSelect 保留向后兼容,新代码优先使用 rowSelection。",
          code: `<Table
  selectable
  selected={selected}
  onSelect={setSelected}
  columns={[...]}
  data={data}
/>`,
          render: () => (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Tag tone="warning">旧版已选: {legacySelected.join(", ") || "无"}</Tag>
              <Table
                rowKey="id"
                selectable
                selected={legacySelected}
                onSelect={setLegacySelected}
                columns={simpleColumns}
                data={data}
              />
            </div>
          ),
        },
        {
          id: "expandable",
          title: "可展开行",
          span: 2,
          description: "点击左侧箭头按钮展开/收起,defaultExpandedRowKeys 设置非受控初始展开。",
          code: `<Table
  expandable={{
    defaultExpandedRowKeys: [1],
    expandedRowRender: (row) => <div>...详情...</div>,
    rowExpandable: (row) => row.status !== "离线",
  }}
  columns={[...]}
  data={data}
/>`,
          render: () => (
            <Table
              rowKey="id"
              expandable={{
                defaultExpandedRowKeys: [1],
                expandedRowRender: (row) => (
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <div>
                      <Tag tone="accent">备注</Tag>
                      <div style={{ marginTop: 6, fontSize: 13 }}>{row.name} 的详细信息在此展开。</div>
                    </div>
                    <div>
                      <Tag tone="neutral">薪资</Tag>
                      <div style={{ marginTop: 6, fontSize: 13, fontFamily: "var(--font-mono)" }}>
                        {formatSalary(row.salary)}
                      </div>
                    </div>
                  </div>
                ),
                rowExpandable: (row) => row.status !== "离线",
              }}
              columns={simpleColumns}
              data={data}
            />
          ),
        },
        {
          id: "expandableControlled",
          title: "受控展开",
          span: 2,
          description: "expandedRowKeys 由外部状态控制,onExpand 负责同步展开 key。",
          code: `<Table
  expandable={{
    expandedRowKeys,
    onExpand: (expanded, row) => setExpandedRowKeys(...),
    expandedRowRender: (row) => <div>...</div>,
  }}
/>`,
          render: () => (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Tag tone="info">{expandMessage}</Tag>
              <Table
                rowKey="id"
                expandable={{
                  expandedRowKeys: expandedKeys,
                  onExpand: (expanded, row) => {
                    setExpandedKeys((keys) =>
                      expanded ? [...keys, row.id] : keys.filter((key) => key !== row.id)
                    );
                    setExpandMessage(`${row.name} ${expanded ? "已展开" : "已收起"}`);
                  },
                  expandedRowRender: (row, index) => (
                    <div style={{ fontSize: 13 }}>
                      #{index + 1} {row.name} · {row.role} · {row.joined}
                    </div>
                  ),
                  rowExpandable: (row) => row.status !== "离线",
                }}
                columns={simpleColumns}
                data={data}
              />
            </div>
          ),
        },
        {
          id: "filters",
          title: "列筛选",
          span: 2,
          description: "filters + onFilter 生成列头筛选菜单;defaultFilteredValue 可设置非受控初始筛选。",
          code: `<Table
  columns={[
    {
      key: "role",
      title: "部门",
      dataIndex: "role",
      filters: [
        { text: "设计", value: "设计" },
        { text: "研发", value: "研发" },
      ],
      defaultFilteredValue: ["研发"],
      onFilter: (value, row) => row.role === value,
    },
  ]}
  data={data}
/>`,
          render: () => (
            <Table
              rowKey="id"
              columns={[
                { key: "name", title: "姓名", dataIndex: "name" },
                {
                  key: "role",
                  title: "部门",
                  dataIndex: "role",
                  filters: [
                    { text: "设计", value: "设计" },
                    { text: "研发", value: "研发" },
                    { text: "产品", value: "产品" },
                    { text: "运营", value: "运营" },
                  ],
                  defaultFilteredValue: ["研发"],
                  onFilter: (value, row) => row.role === value,
                  render: (v) => <Tag tone="accent">{v}</Tag>,
                },
                {
                  key: "status",
                  title: "状态",
                  dataIndex: "status",
                  filters: [
                    { text: "在线", value: "在线" },
                    { text: "忙碌", value: "忙碌" },
                    { text: "离线", value: "离线" },
                  ],
                  render: renderStatusTag,
                },
                { key: "joined", title: "加入时间", dataIndex: "joined" },
              ]}
              data={pagedData}
              pagination={{ pageSize: 8 }}
            />
          ),
        },
        {
          id: "filtersControlled",
          title: "受控筛选值",
          span: 2,
          description: "filteredValue 由外部状态控制,适合和工具栏筛选器或 URL 状态同步。",
          code: `<Table
  columns={[
    {
      key: "status",
      filteredValue,
      filters: [...],
      onFilter: (value, row) => row.status === value,
    },
  ]}
/>`,
          render: () => (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Button
                  size="sm"
                  variant={filterStatus.includes("在线") ? "primary" : "ghost"}
                  onClick={() => setFilterStatus(["在线"])}
                >
                  在线
                </Button>
                <Button
                  size="sm"
                  variant={filterStatus.includes("忙碌") ? "primary" : "ghost"}
                  onClick={() => setFilterStatus(["忙碌"])}
                >
                  忙碌
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setFilterStatus([])}>
                  清空
                </Button>
              </div>
              <Table
                rowKey="id"
                columns={[
                  { key: "name", title: "姓名", dataIndex: "name" },
                  { key: "role", title: "部门", dataIndex: "role", render: (v) => <Tag tone="accent">{v}</Tag> },
                  {
                    key: "status",
                    title: "状态",
                    dataIndex: "status",
                    filteredValue: filterStatus,
                    filters: [
                      { text: "在线", value: "在线" },
                      { text: "忙碌", value: "忙碌" },
                      { text: "离线", value: "离线" },
                    ],
                    onFilter: (value, row) => row.status === value,
                    render: renderStatusTag,
                  },
                ]}
                data={data}
              />
            </div>
          ),
        },
        {
          id: "emptyAndNativeAttrs",
          title: "空状态 / 原生属性",
          span: 2,
          description: "empty 自定义空态;className / style / id / data-* / aria-* 透传到表格外层容器;pagination={false} 显式关闭分页。",
          code: `<Table
  id="member-empty-table"
  className="demo-member-table"
  style={{ boxShadow: "var(--neu-in-sm)" }}
  data-demo-table="empty"
  aria-label="成员空表格"
  rowKey={(row) => \`member-\${row.id}\`}
  data={[]}
  empty={<Tag tone="neutral">没有匹配结果</Tag>}
  pagination={false}
/>`,
          render: () => (
            <Table
              id="member-empty-table"
              className="demo-member-table"
              style={{ boxShadow: "var(--neu-in-sm)", borderRadius: "var(--r-md)" }}
              data-demo-table="empty"
              aria-label="成员空表格"
              rowKey={(row: MemberRow) => `member-${row.id}`}
              columns={[
                { key: "name", title: "姓名", dataIndex: "name" },
                { key: "role", title: "部门", dataIndex: "role" },
                { key: "status", title: "状态", dataIndex: "status" },
              ]}
              data={[] as MemberRow[]}
              empty={<Tag tone="neutral">没有匹配结果</Tag>}
              pagination={false}
            />
          ),
        },
      ]}
      api={[
        {
          title: "Table",
          rows: [
            { prop: "columns", description: "列定义", type: "TableColumn[]", required: true },
            { prop: "data", description: "数据数组", type: "Row[]", required: true },
            { prop: "rowKey", description: "行键;可传字段名或函数", type: "keyof Row | (row) => key" },
            { prop: "variant", description: "视觉变体", type: `"default" | "striped" | "embossed" | "cards"`, default: `"default"` },
            { prop: "hoverable", description: "是否开启行 hover 态", type: "boolean", default: "true" },
            { prop: "striped", description: "条纹快捷开关,等价于 variant='striped'", type: "boolean" },
            { prop: "sortKey", description: "当前排序列 key", type: "string" },
            { prop: "sortDir", description: "当前排序方向", type: `"asc" | "desc"`, default: `"asc"` },
            { prop: "onSort", description: "点击可排序表头时触发", type: "(key) => void" },
            { prop: "rowSelection", description: "行选择配置", type: "RowSelectionConfig" },
            { prop: "selectable", description: "旧版多选开关,优先使用 rowSelection", type: "boolean" },
            { prop: "selected", description: "旧版受控选中 key", type: "(string | number)[]" },
            { prop: "onSelect", description: "旧版选中变化回调", type: "(keys) => void" },
            { prop: "expandable", description: "可展开行配置", type: "ExpandableConfig" },
            { prop: "pagination", description: "分页配置;false 关闭", type: "false | PaginationConfig" },
            { prop: "scroll", description: "滚动配置", type: "TableScrollConfig" },
            { prop: "onRowClick", description: "点击行", type: "(row, index) => void" },
            { prop: "empty", description: "空数据占位内容", type: "ReactNode", default: `"暂无数据"` },
            { prop: "className / style / id / data-* / aria-*", description: "透传到外层 table-wrap 容器", type: "native attrs" },
          ],
        },
        {
          title: "TableColumn",
          rows: [
            { prop: "key", description: "列唯一键", type: "string", required: true },
            { prop: "title", description: "表头", type: "ReactNode", required: true },
            { prop: "dataIndex", description: "取值字段", type: "keyof Row" },
            { prop: "render", description: "单元格渲染", type: "(value, row, index) => ReactNode" },
            { prop: "width", description: "列宽", type: "number | string" },
            { prop: "align", description: "对齐", type: `"left" | "center" | "right"` },
            { prop: "sortable", description: "是否可排序", type: "boolean" },
            { prop: "filters", description: "筛选项", type: "{ text, value }[]" },
            { prop: "onFilter", description: "筛选判定函数", type: "(value, row) => boolean" },
            { prop: "defaultFilteredValue", description: "非受控初始筛选", type: "(string | number)[]" },
            { prop: "filteredValue", description: "受控筛选值", type: "(string | number)[]" },
          ],
        },
        {
          title: "PaginationConfig",
          rows: [
            { prop: "current", description: "当前页 (1-indexed),受控", type: "number" },
            { prop: "defaultCurrent", description: "非受控初始页", type: "number", default: "1" },
            { prop: "pageSize", description: "每页条数", type: "number", default: "10" },
            { prop: "defaultPageSize", description: "非受控初始每页条数", type: "number" },
            { prop: "total", description: "数据总量;默认为过滤后的 data.length", type: "number" },
            { prop: "onChange", description: "切页或切换 pageSize 回调", type: "(page, pageSize) => void" },
            { prop: "showQuickJumper", description: "显示跳页输入", type: "boolean" },
            { prop: "showSizeChanger", description: "显示每页条数下拉选择", type: "boolean" },
            { prop: "pageSizeOptions", description: "每页条数选项", type: "number[]" },
          ],
        },
        {
          title: "TableScrollConfig",
          rows: [
            { prop: "x", description: "横向滚动时内部 table 的最小宽度", type: "number | string" },
            { prop: "y", description: "纵向滚动时表体最大高度,并启用 sticky header", type: "number | string" },
          ],
        },
        {
          title: "RowSelectionConfig",
          rows: [
            { prop: "type", description: `多选或单选`, type: `"checkbox" | "radio"`, default: `"checkbox"` },
            { prop: "selectedRowKeys", description: "受控选中 key", type: "(string | number)[]" },
            { prop: "defaultSelectedRowKeys", description: "非受控初始选中", type: "(string | number)[]" },
            { prop: "onChange", description: "选中变化", type: "(keys, rows) => void" },
            { prop: "getCheckboxProps", description: "每行勾选框属性", type: "(row) => { disabled? }" },
          ],
        },
        {
          title: "ExpandableConfig",
          rows: [
            { prop: "expandedRowKeys", description: "受控已展开 key", type: "(string | number)[]" },
            { prop: "defaultExpandedRowKeys", description: "非受控初始展开", type: "(string | number)[]" },
            { prop: "onExpand", description: "展开/收起回调", type: "(expanded, row) => void" },
            { prop: "expandedRowRender", description: "展开面板渲染", type: "(row, index) => ReactNode" },
            { prop: "rowExpandable", description: "该行是否可展开", type: "(row) => boolean" },
          ],
        },
      ]}
    />
  );
};

export default defineSection({
  id: "table",
  group: "数据展示",
  order: 90,
  label: "Table 表格",
  eyebrow: "DATA DISPLAY",
  title: "Table 表格",
  desc: "结构化数据展示。",
  Component: SectionTable,
});
