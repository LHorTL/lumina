# Table 表格

> 结构化数据展示。

## 导入

```tsx
import { Table } from "@fangxinyan/lumina";
```

## 示例

### 基础表格

```tsx
<Table rowKey="id" columns={[...]} data={data} />
```

### 样式变体 / hover

覆盖 variant 的四个取值,以及 striped 快捷属性和 hoverable 关闭状态。

```tsx
<Table variant="default" ... />
<Table striped ... />
<Table variant="embossed" hoverable={false} ... />
<Table variant="cards" ... />
```

### 内置分页

传入 pagination 即可自动分页;data 会按当前页切片。传 false 关闭。

```tsx
<Table
  rowKey="id"
  columns={[...]}
  data={data}
  pagination={{ pageSize: 6 }}
/>
```

### 分页配置

覆盖 current / defaultCurrent / pageSize / defaultPageSize / total / onChange / showQuickJumper / showSizeChanger / pageSizeOptions。

```tsx
<Table
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
/>
```

### 固定表头 / 横向滚动

scroll.y 固定表头并限制表体最大高度;scroll.x 设置内容最小宽度。

```tsx
<Table
  scroll={{ y: 220, x: 900 }}
  columns={[...]}
  data={data}
/>
```

### 受控排序 / 行点击

Table 负责渲染排序指示,排序后的 data 由外部状态计算后传入。

```tsx
<Table
  sortKey={sortKey}
  sortDir={sortDir}
  onSort={(key) => {
    setSortKey(key);
    setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
  }}
  onRowClick={(row, index) => setClicked(row.name)}
  columns={[{ key: "salary", sortable: true, align: "right" }]}
/>
```

### 行选择 (rowSelection)

rowSelection 提供表头全选、半选状态、受控选中项、回传选中行与按行禁用能力。

```tsx
<Table
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
/>
```

### 行选择 · 单选

设置 rowSelection.type = 'radio' 变成单选模式,defaultSelectedRowKeys 设置非受控初始值。

```tsx
<Table
  rowSelection={{ type: "radio", defaultSelectedRowKeys: [1] }}
  columns={[...]}
  data={data}
/>
```

### 旧版选择 API

selectable / selected / onSelect 保留向后兼容,新代码优先使用 rowSelection。

```tsx
<Table
  selectable
  selected={selected}
  onSelect={setSelected}
  columns={[...]}
  data={data}
/>
```

### 可展开行

点击左侧箭头按钮展开/收起,defaultExpandedRowKeys 设置非受控初始展开。

```tsx
<Table
  expandable={{
    defaultExpandedRowKeys: [1],
    expandedRowRender: (row) => <div>...详情...</div>,
    rowExpandable: (row) => row.status !== "离线",
  }}
  columns={[...]}
  data={data}
/>
```

### 受控展开

expandedRowKeys 由外部状态控制,onExpand 负责同步展开 key。

```tsx
<Table
  expandable={{
    expandedRowKeys,
    onExpand: (expanded, row) => setExpandedRowKeys(...),
    expandedRowRender: (row) => <div>...</div>,
  }}
/>
```

### 列筛选

filters + onFilter 生成列头筛选菜单;defaultFilteredValue 可设置非受控初始筛选。

```tsx
<Table
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
/>
```

### 受控筛选值

filteredValue 由外部状态控制,适合和工具栏筛选器或 URL 状态同步。

```tsx
<Table
  columns={[
    {
      key: "status",
      filteredValue,
      filters: [...],
      onFilter: (value, row) => row.status === value,
    },
  ]}
/>
```

### 空状态 / 原生属性

empty 自定义空态;className / style / id / data-* / aria-* 透传到表格外层容器;pagination={false} 显式关闭分页。

```tsx
<Table
  id="member-empty-table"
  className="demo-member-table"
  style={{ boxShadow: "var(--neu-in-sm)" }}
  data-demo-table="empty"
  aria-label="成员空表格"
  rowKey={(row) => `member-${row.id}`}
  data={[]}
  empty={<Tag tone="neutral">没有匹配结果</Tag>}
  pagination={false}
/>
```

## API

**Table**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| columns \* | `TableColumn[]` | — | 列定义 |
| data \* | `Row[]` | — | 数据数组 |
| rowKey | `keyof Row | (row) => key` | — | 行键;可传字段名或函数 |
| variant | `"default" | "striped" | "embossed" | "cards"` | `"default"` | 视觉变体 |
| hoverable | `boolean` | `true` | 是否开启行 hover 态 |
| striped | `boolean` | — | 条纹快捷开关,等价于 variant='striped' |
| sortKey | `string` | — | 当前排序列 key |
| sortDir | `"asc" | "desc"` | `"asc"` | 当前排序方向 |
| onSort | `(key) => void` | — | 点击可排序表头时触发 |
| rowSelection | `RowSelectionConfig` | — | 行选择配置 |
| selectable | `boolean` | — | 旧版多选开关,优先使用 rowSelection |
| selected | `(string | number)[]` | — | 旧版受控选中 key |
| onSelect | `(keys) => void` | — | 旧版选中变化回调 |
| expandable | `ExpandableConfig` | — | 可展开行配置 |
| pagination | `false | PaginationConfig` | — | 分页配置;false 关闭 |
| scroll | `TableScrollConfig` | — | 滚动配置 |
| onRowClick | `(row, index) => void` | — | 点击行 |
| empty | `ReactNode` | `"暂无数据"` | 空数据占位内容 |
| className / style / id / data-* / aria-* | `native attrs` | — | 透传到外层 table-wrap 容器 |


**TableColumn**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| key \* | `string` | — | 列唯一键 |
| title \* | `ReactNode` | — | 表头 |
| dataIndex | `keyof Row` | — | 取值字段 |
| render | `(value, row, index) => ReactNode` | — | 单元格渲染 |
| width | `number | string` | — | 列宽 |
| align | `"left" | "center" | "right"` | — | 对齐 |
| sortable | `boolean` | — | 是否可排序 |
| filters | `{ text, value }[]` | — | 筛选项 |
| onFilter | `(value, row) => boolean` | — | 筛选判定函数 |
| defaultFilteredValue | `(string | number)[]` | — | 非受控初始筛选 |
| filteredValue | `(string | number)[]` | — | 受控筛选值 |


**PaginationConfig**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| current | `number` | — | 当前页 (1-indexed),受控 |
| defaultCurrent | `number` | `1` | 非受控初始页 |
| pageSize | `number` | `10` | 每页条数 |
| defaultPageSize | `number` | — | 非受控初始每页条数 |
| total | `number` | — | 数据总量;默认为过滤后的 data.length |
| onChange | `(page, pageSize) => void` | — | 切页或切换 pageSize 回调 |
| showQuickJumper | `boolean` | — | 显示跳页输入 |
| showSizeChanger | `boolean` | — | 显示每页条数下拉选择 |
| pageSizeOptions | `number[]` | — | 每页条数选项 |


**TableScrollConfig**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| x | `number | string` | — | 横向滚动时内部 table 的最小宽度 |
| y | `number | string` | — | 纵向滚动时表体最大高度,并启用 sticky header |


**RowSelectionConfig**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| type | `"checkbox" | "radio"` | `"checkbox"` | 多选或单选 |
| selectedRowKeys | `(string | number)[]` | — | 受控选中 key |
| defaultSelectedRowKeys | `(string | number)[]` | — | 非受控初始选中 |
| onChange | `(keys, rows) => void` | — | 选中变化 |
| getCheckboxProps | `(row) => { disabled? }` | — | 每行勾选框属性 |


**ExpandableConfig**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| expandedRowKeys | `(string | number)[]` | — | 受控已展开 key |
| defaultExpandedRowKeys | `(string | number)[]` | — | 非受控初始展开 |
| onExpand | `(expanded, row) => void` | — | 展开/收起回调 |
| expandedRowRender | `(row, index) => ReactNode` | — | 展开面板渲染 |
| rowExpandable | `(row) => boolean` | — | 该行是否可展开 |


---
[← 回到索引](../llms.md)
