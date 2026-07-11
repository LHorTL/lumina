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

### 原生表单

name / value / required 会落到真实 checkbox，可直接参与浏览器表单提交与约束校验。

```tsx
<form onSubmit={(event) => event.preventDefault()}>
  <Checkbox name="agreement" value="accepted" required label="同意条款" />
  <Button type="submit">验证提交</Button>
</form>
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
| name / value | `string` | — | 原生表单字段名与选中时提交的值 |
| required / form | `boolean / string` | — | 原生必填约束与关联 form id |
| disabled | `boolean` | `false` | 禁用 |


---
[← 回到索引](../llms.md)
