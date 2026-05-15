# Table Pro

> 带工具栏 / 搜索 / 筛选 / 排序 / 多选 / 分页的全功能表格。

## 导入

```tsx
import { TablePro } from "@fangxinyan/lumina";
```

## 示例

### 全功能

工具栏 + 排序 + 新版 rowSelection + 内置分页。相比旧版,Table 自己切片 data,不必外部 slice。

```tsx
<TablePro
  rowKey="id" data={filtered} columns={...}
  rowSelection={{ selectedRowKeys, onChange }}
  sortKey={sortKey} sortDir={sortDir} onSort={...}
  pagination={{ pageSize: 4 }}
  toolbar={<Input ... /> <Select ... />}
  actions={<Button>新增</Button>}
/>
```

### 卡片行分页

variant='cards' 与内置 pagination 共用 TablePro 容器背景,分页区不会单独变成另一块底色。

```tsx
<TablePro
  variant="cards"
  rowKey="id"
  data={rows}
  pagination={{ pageSize: 4 }}
  columns={[...]}
/>
```

### 带可展开行

TablePro 直接透传 expandable 到 Table。

```tsx
<TablePro
  title="成员详情"
  expandable={{
    expandedRowRender: (row) => <div>...展开内容...</div>,
  }}
  ...
/>
```

## API

**TablePro**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| ... | `TableProps` | — | 继承自 Table 全部 props (包括新的 pagination / scroll / rowSelection / expandable / filters) |
| toolbar | `ReactNode` | — | 工具栏内容 |
| actions | `ReactNode` | — | 工具栏右侧操作 |
| footer | `ReactNode` | — | 底部 (可选,传了会渲染在分页下方) |
| title | `ReactNode` | — | 工具栏标题 |
| className / style / id / data-* / aria-* | `native attrs` | — | 透传到外层 table-card 根节点 |
| tableClassName / tableStyle | `string / CSSProperties` | — | 透传到内部 Table |


---
[← 回到索引](../llms.md)
