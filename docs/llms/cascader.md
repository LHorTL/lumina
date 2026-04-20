# Cascader 级联选择

> 层级关联数据集合中的多级选择。

## 导入

```tsx
import { Cascader } from "@fangxinyan/lumina";
```

## 示例

### 基础用法

```tsx
<Cascader options={regions} value={addr} onChange={setAddr} />
```

## API

**Cascader**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| options \* | `CascaderOption[]` | — | 层级选项树 |
| value / defaultValue | `string[]` | — | 受控/初始路径 |
| onChange | `(path: string[]) => void` | — | 选择叶子时触发 |
| placeholder | `string` | — | 占位文案 |
| disabled | `boolean` | `false` | 禁用 |


---
[← 回到索引](../llms.md)
