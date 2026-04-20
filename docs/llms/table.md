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

### 样式变体

三种视觉变体:striped (条纹)、embossed (凸起)、cards (卡片行)。

```tsx
<Table variant="striped" ... />
<Table variant="embossed" ... />
<Table variant="cards" ... />
```

### 内置分页

传入 pagination 即可自动分页;data 会按当前页切片。传 false 关闭。

```tsx
<Table
  rowKey="id"
  columns={[...]}
  data={data}               // 24 rows
  pagination={{ pageSize: 6 }}
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

### 行选择 (rowSelection)

antd 风格的 rowSelection。表头多选框支持 indeterminate;可通过 getCheckboxProps 禁用指定行。

```tsx
<Table
  rowSelection={{
    selectedRowKeys,
    onChange: (keys, rows) => setSelectedKeys(keys),
    getCheckboxProps: (row) => ({ disabled: row.status === "离线" }),
  }}
  columns={[...]}
  data={data}
/>
```

### 行选择 · 单选

设置 rowSelection.type = 'radio' 变成单选模式。

```tsx
<Table
  rowSelection={{ type: "radio", defaultSelectedRowKeys: [1] }}
  columns={[...]}
  data={data}
/>
```

### 可展开行

点击左侧箭头按钮展开/收起,在行下方渲染自定义内容。

```tsx
<Table
  expandable={{
    expandedRowRender: (row) => <div>…详情…</div>,
    rowExpandable: (row) => row.status !== "离线",
  }}
  columns={[...]}
  data={data}
/>
```

### 列筛选

在列上配置 filters 即可在列头显示漏斗图标;点击弹出勾选面板,勾选后过滤数据。

```tsx
<Table
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
/>
```

## API

**Table**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| columns \* | `TableColumn[]` | — | 列定义 |
| data \* | `Row[]` | — | 数据数组 |
| rowKey | `string | (row) => key` | — | 行键 |
| variant | `"default" | "striped" | "embossed" | "cards"` | `"default"` | 视觉变体 |
| pagination | `false | PaginationConfig` | — | 分页配置;false 关闭 |
| scroll | `TableScrollConfig` | — | 滚动配置:{ x?, y? } |
| rowSelection | `RowSelectionConfig` | — | 行选择配置 (antd 风格) |
| expandable | `ExpandableConfig` | — | 可展开行配置 |
| sortKey / sortDir / onSort | `—` | — | 受控排序 |
| onRowClick | `(row, i) => void` | — | 点击行 |
| selectable / selected / onSelect | `—` | — | 旧版多选 API (保留兼容,优先使用 rowSelection) |


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
| total | `number` | — | 数据总量;默认为 data.length |
| onChange | `(page, pageSize) => void` | — | 切页回调 |


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
| expandedRowRender | `(row, i) => ReactNode` | — | 展开面板渲染 |
| rowExpandable | `(row) => boolean` | — | 该行是否可展开 |


---
[← 回到索引](../llms.md)
