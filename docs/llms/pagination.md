# Pagination 分页

> 分页控件,支持快速跳转与每页条数切换。

## 导入

```tsx
import { Pagination } from "@fangxinyan/lumina";
```

## 示例

### 基础用法

```tsx
<Pagination total={85} page={page} onChange={setPage} />
```

### 快速跳转

启用 showQuickJumper,输入页码按 Enter 跳转,超出范围会被夹紧。

```tsx
<Pagination
  total={250}
  page={jumpPage}
  onChange={setJumpPage}
  showQuickJumper
/>
```

### 每页条数

启用 showSizeChanger,切换条数会回到第 1 页并触发 onShowSizeChange + onChange(1)。

```tsx
<Pagination
  total={320}
  page={sizePage}
  pageSize={pageSize}
  onChange={setSizePage}
  showSizeChanger
  onShowSizeChange={(_cur, size) => setPageSize(size)}
/>
```

### 跳转 + 条数 + 自定义选项

同时启用两项,并通过 pageSizeOptions 自定义候选条数。

```tsx
<Pagination
  total={999}
  page={fullPage}
  pageSize={fullPageSize}
  onChange={setFullPage}
  showQuickJumper
  showSizeChanger
  pageSizeOptions={[20, 50, 100, 200]}
  onShowSizeChange={(_cur, size) => setFullPageSize(size)}
/>
```

## API

**Pagination**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| total \* | `number` | — | 数据总条数 |
| pageSize | `number` | `10` | 每页条数 |
| page / defaultPage | `number` | `1` | 受控/初始页码 |
| onChange | `(page: number) => void` | — | 页码变化回调 |
| siblings | `number` | `1` | 当前页两侧可见的页码数 |
| showQuickJumper | `boolean` | `false` | 显示跳转输入框,按 Enter 跳转 |
| showSizeChanger | `boolean` | `false` | 显示每页条数选择器,切换后回到第 1 页 |
| pageSizeOptions | `number[]` | `[10, 20, 50, 100]` | 每页条数候选项 |
| onShowSizeChange | `(current: number, size: number) => void` | — | 每页条数变更回调 |


---
[← 回到索引](../llms.md)
