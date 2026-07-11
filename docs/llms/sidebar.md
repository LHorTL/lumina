# Sidebar 侧边栏

> 应用主导航,沿屏幕左侧垂直排列。

## 导入

```tsx
import { Sidebar } from "@fangxinyan/lumina";
```

## 示例

### 基础

```tsx
<Sidebar items={[{ key, label, icon, badge }]} activeKey={active} onSelect={setActive} />
```

### 折叠与多级导航

切换 collapsed 比较完整侧栏与图标轨道；点击含 children 的分组可独立展开或收起。

```tsx
<Sidebar
  collapsed={collapsed}
  expandedKeys={expandedKeys}
  onExpandedKeysChange={setExpandedKeys}
  items={[{
    key: "workspace",
    label: <span>工作区 <Tag tone="info">团队</Tag></span>,
    ariaLabel: "工作区",
    icon: <Icon name="folder" />,
    children: [{ key: "design", label: "设计系统" }],
  }]}
/>
```

## API

**Sidebar**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| items \* | `SidebarItem[]` | — | 导航项 |
| activeKey | `string` | — | 当前激活项 |
| onSelect | `(key: string) => void` | — | 选择回调 |
| expandedKeys / defaultExpandedKeys | `string[]` | — | 受控/初始展开的分组键；省略初始值时默认全部展开 |
| onExpandedKeysChange | `(keys: string[]) => void` | — | 点击含 children 的分组后返回新的展开键 |
| collapsed | `boolean` | `false` | 折叠为图标 |
| header / footer | `ReactNode` | — | 头/尾内容 |
| navigationLabel | `string` | `"主导航"` | 导航区域可访问名称 |


**SidebarItem**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| key \* | `string` | — | 唯一键 |
| label | `ReactNode` | — | 文案 |
| ariaLabel | `string` | — | 复杂标签在折叠状态下使用的可访问名称与 title |
| icon | `ReactNode` | — | 前置图标 |
| badge | `ReactNode` | — | 尾部徽标 |
| children | `SidebarItem[]` | — | 递归子导航项 |


---
[← 回到索引](../llms.md)
