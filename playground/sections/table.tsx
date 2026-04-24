import * as React from "react";
import { Avatar, Table, Tag } from "lumina";
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

const SectionTable: React.FC<SectionCtx> = () => {
  const data: MemberRow[] = [
    { id: 1, name: "金伟", role: "设计", status: "在线", joined: "2024-03-12", salary: 18000 },
    { id: 2, name: "陆希", role: "研发", status: "忙碌", joined: "2024-05-28", salary: 25000 },
    { id: 3, name: "马可", role: "产品", status: "离线", joined: "2023-11-04", salary: 22000 },
    { id: 4, name: "周妍", role: "研发", status: "在线", joined: "2025-01-20", salary: 24000 },
  ];

  // Paged demo data (generate 24 rows)
  const pagedData: MemberRow[] = React.useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i + 1,
        name: `成员 ${i + 1}`,
        role: ["设计", "研发", "产品", "运营"][i % 4],
        status: ["在线", "忙碌", "离线"][i % 3],
        joined: `2024-${String((i % 12) + 1).padStart(2, "0")}-15`,
      })),
    []
  );

  // Controlled rowSelection state
  const [selectedKeys, setSelectedKeys] = React.useState<(string | number)[]>([]);

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
                {
                  key: "name",
                  title: "姓名",
                  dataIndex: "name",
                  render: (v) => (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <Avatar alt={String(v)} size="sm" /> {v}
                    </span>
                  ),
                },
                { key: "role", title: "部门", dataIndex: "role", render: (v) => <Tag tone="accent">{v}</Tag> },
                {
                  key: "status",
                  title: "状态",
                  dataIndex: "status",
                  render: (v) => (
                    <Tag tone={v === "在线" ? "success" : v === "忙碌" ? "warning" : "neutral"} dot>
                      {v}
                    </Tag>
                  ),
                },
                { key: "joined", title: "加入时间", dataIndex: "joined" },
              ]}
              data={data}
            />
          ),
        },
        {
          id: "variants",
          title: "样式变体",
          span: 2,
          description: "三种视觉变体:striped (条纹)、embossed (凸起)、cards (卡片行)。",
          code: `<Table variant="striped" ... />
<Table variant="embossed" ... />
<Table variant="cards" ... />`,
          render: () => (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Table
                rowKey="id"
                variant="striped"
                columns={[
                  { key: "name", title: "条纹", dataIndex: "name" },
                  { key: "role", title: "部门", dataIndex: "role" },
                ]}
                data={data}
              />
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
  data={data}               // 24 rows
  pagination={{ pageSize: 6 }}
/>`,
          render: () => (
            <Table
              rowKey="id"
              columns={[
                { key: "id", title: "#", dataIndex: "id", width: 60 },
                { key: "name", title: "姓名", dataIndex: "name" },
                { key: "role", title: "部门", dataIndex: "role" },
                { key: "status", title: "状态", dataIndex: "status" },
                { key: "joined", title: "加入时间", dataIndex: "joined" },
              ]}
              data={pagedData}
              pagination={{ pageSize: 6 }}
            />
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
                { key: "status", title: "状态", dataIndex: "status", width: 180 },
                { key: "joined", title: "加入时间", dataIndex: "joined", width: 240 },
              ]}
              data={pagedData}
              scroll={{ y: 220, x: 900 }}
            />
          ),
        },
        {
          id: "rowSelection",
          title: "行选择 (rowSelection)",
          span: 2,
          description: "rowSelection 提供表头全选、半选状态与按行禁用能力。",
          code: `<Table
  rowSelection={{
    selectedRowKeys,
    onChange: (keys, rows) => setSelectedKeys(keys),
    getCheckboxProps: (row) => ({ disabled: row.status === "离线" }),
  }}
  columns={[...]}
  data={data}
/>`,
          render: () => (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>
                已选 {selectedKeys.length} 项 {selectedKeys.length > 0 && `— ${selectedKeys.join(", ")}`}
              </div>
              <Table
                rowKey="id"
                rowSelection={{
                  selectedRowKeys: selectedKeys,
                  onChange: (keys) => setSelectedKeys(keys),
                  getCheckboxProps: (row) => ({ disabled: row.status === "离线" }),
                }}
                columns={[
                  { key: "name", title: "姓名", dataIndex: "name" },
                  { key: "role", title: "部门", dataIndex: "role" },
                  { key: "status", title: "状态", dataIndex: "status" },
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
          description: "设置 rowSelection.type = 'radio' 变成单选模式。",
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
                { key: "status", title: "状态", dataIndex: "status" },
              ]}
              data={data}
            />
          ),
        },
        {
          id: "expandable",
          title: "可展开行",
          span: 2,
          description: "点击左侧箭头按钮展开/收起,在行下方渲染自定义内容。",
          code: `<Table
  expandable={{
    expandedRowRender: (row) => <div>…详情…</div>,
    rowExpandable: (row) => row.status !== "离线",
  }}
  columns={[...]}
  data={data}
/>`,
          render: () => (
            <Table
              rowKey="id"
              expandable={{
                expandedRowRender: (row) => (
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        备注
                      </div>
                      <div style={{ fontSize: 13 }}>{row.name} 的详细信息在此展开。</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        薪资
                      </div>
                      <div style={{ fontSize: 13, fontFamily: "var(--font-mono)" }}>
                        ¥ {(row.salary ?? 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ),
                rowExpandable: (row) => row.status !== "离线",
              }}
              columns={[
                { key: "name", title: "姓名", dataIndex: "name" },
                { key: "role", title: "部门", dataIndex: "role" },
                { key: "status", title: "状态", dataIndex: "status" },
              ]}
              data={data}
            />
          ),
        },
        {
          id: "filters",
          title: "列筛选",
          span: 2,
          description: "在列上配置 filters 即可在列头显示漏斗图标;点击弹出勾选面板,勾选后过滤数据。",
          code: `<Table
  columns={[
    {
      key: "role", title: "部门", dataIndex: "role",
      filters: [
        { text: "设计", value: "设计" },
        { text: "研发", value: "研发" },
      ],
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
                  render: (v) => (
                    <Tag tone={v === "在线" ? "success" : v === "忙碌" ? "warning" : "neutral"} dot>
                      {v}
                    </Tag>
                  ),
                },
                { key: "joined", title: "加入时间", dataIndex: "joined" },
              ]}
              data={pagedData}
              pagination={{ pageSize: 8 }}
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
            { prop: "rowKey", description: "行键", type: "string | (row) => key" },
            { prop: "variant", description: "视觉变体", type: `"default" | "striped" | "embossed" | "cards"`, default: `"default"` },
            { prop: "pagination", description: "分页配置;false 关闭", type: "false | PaginationConfig" },
            { prop: "scroll", description: "滚动配置:{ x?, y? }", type: "TableScrollConfig" },
            { prop: "rowSelection", description: "行选择配置", type: "RowSelectionConfig" },
            { prop: "expandable", description: "可展开行配置", type: "ExpandableConfig" },
            { prop: "sortKey / sortDir / onSort", description: "受控排序", type: "—" },
            { prop: "onRowClick", description: "点击行", type: "(row, i) => void" },
            { prop: "selectable / selected / onSelect", description: "旧版多选 API,优先使用 rowSelection", type: "—" },
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
            { prop: "total", description: "数据总量;默认为 data.length", type: "number" },
            { prop: "onChange", description: "切页回调", type: "(page, pageSize) => void" },
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
            { prop: "expandedRowRender", description: "展开面板渲染", type: "(row, i) => ReactNode" },
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
