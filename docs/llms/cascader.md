# Cascader 级联选择

> 层级关联数据集合中的多级选择。

## 导入

```tsx
import { Cascader } from "@fangxinyan/lumina";
```

## 示例

### 基础用法

option.icon 支持 IconName 或 ReactNode。

```tsx
<Cascader options={regions} value={addr} onChange={setAddr} />
```

### 搜索与清除

showSearch 开启路径搜索,allowClear 提供一键清空,popupClassName 可标记浮层。

```tsx
<Cascader
  showSearch={{ limit: 8 }}
  allowClear
  popupClassName="my-cascader-popup"
  options={regions}
  value={addr}
  onChange={setAddr}
/>
```

## API

**Cascader**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| options \* | `CascaderOption[]` | — | 层级选项树 |
| options[].icon | `IconName | ReactNode` | — | 选项前置图标,可传内置图标名或自定义节点 |
| value / defaultValue | `string[]` | — | 受控/初始路径 |
| onChange | `(path: string[]) => void` | — | 选择叶子时触发 |
| placeholder | `string` | — | 占位文案 |
| disabled | `boolean` | `false` | 禁用 |
| allowClear | `boolean` | `false` | 显示清除按钮 |
| showSearch | `boolean | { filter?, render?, limit? }` | — | 搜索路径,支持 boolean / 对象配置 |
| popupClassName / dropdownClassName | `string` | — | 浮层面板 className |
| changeOnSelect | `boolean` | `false` | 允许选中非叶子节点 |


---
[← 回到索引](../llms.md)
