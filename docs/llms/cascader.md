# Cascader 级联选择

> 层级关联数据集合中的多级选择。

## 导入

```tsx
import { Cascader } from "@fangxinyan/lumina";
```

## 示例

### 基础用法

option.icon 支持 IconName 或 ReactNode；禁用节点不可通过列选择或搜索结果绕过选中。

```tsx
<Cascader options={regions} value={addr} onChange={setAddr} />
```

### 复杂节点与独立选中渲染

optionRender 可为每一级节点添加多行信息；selectedRender 只在触发器中显示紧凑摘要。listHeight 与 popupStyle 控制列高和面板宽度。

```tsx
<Cascader
  options={assetOptions}
  value={assetPath}
  onChange={setAssetPath}
  optionRender={(option, info) => <AssetNode option={option} selected={info.selected} />}
  selectedRender={(selectedOptions) => <AssetPath options={selectedOptions} />}
  listHeight={380}
  popupStyle={{ minWidth: "min(680px, calc(100vw - 16px))" }}
/>
```

### 搜索与清除

showSearch 开启路径搜索,allowClear 提供一键清空；搜索框打开后自动聚焦，禁用任一节点的路径不会进入搜索结果。

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
| options[].text | `string` | — | 复杂 label 的独立默认搜索文本 |
| options[].ariaLabel | `string` | — | 复杂节点或 optionRender 的独立可访问名称 |
| value / defaultValue | `string[]` | — | 受控/初始路径 |
| onChange | `(path: string[], selectedOptions?: CascaderOption[]) => void` | — | 提交路径时触发，同时返回对应选项对象 |
| placeholder | `string` | — | 占位文案 |
| disabled | `boolean` | `false` | 禁用触发器并立即关闭已打开的面板 |
| allowClear | `boolean` | `false` | 显示清除按钮 |
| showSearch | `boolean | { filter?, render?, limit? }` | — | 搜索路径,支持 boolean / 对象配置 |
| optionRender | `(option, info) => ReactNode` | — | 自定义每一级菜单节点内容，并获得 depth / selected / hasChildren 状态 |
| selectedRender | `(selectedOptions, values) => ReactNode` | — | 自定义触发器中的紧凑已选路径内容 |
| listHeight | `number` | `280` | 每列和搜索结果滚动区域的最大高度 |
| popupStyle | `CSSProperties` | — | Portal 浮层内联样式，可覆盖宽度或高度 |
| popupClassName / dropdownClassName | `string` | — | Portal 浮层面板 className；会自动跟随所属 Modal / Drawer 的层级 |
| changeOnSelect | `boolean` | `false` | 允许选中非叶子节点 |


---
[← 回到索引](../llms.md)
