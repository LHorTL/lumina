# Checkbox 复选框

> 在一组选项中进行多项选择,或独立切换某个开关项。

## 导入

```tsx
import { Checkbox } from "@fangxinyan/lumina";
```

## 示例

### 基础用法

```tsx
<Checkbox checked={v} onChange={setV} label="同意协议" />
```

### 全选/半选

indeterminate 用来表示部分选中。

```tsx
<Checkbox indeterminate={some} checked={all} onChange={...} label="全选" />
```

## API

**Checkbox**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| checked / defaultChecked | `boolean` | — | 受控/初始 |
| indeterminate | `boolean` | `false` | 半选态 |
| onChange | `(checked: boolean) => void` | — | 变更 |
| label | `ReactNode` | — | 右侧文案 |
| disabled | `boolean` | `false` | 禁用 |


---
[← 回到索引](../llms.md)
