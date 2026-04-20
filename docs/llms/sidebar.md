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

## API

**Sidebar**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| items \* | `SidebarItem[]` | — | 导航项 |
| activeKey | `string` | — | 当前激活项 |
| onSelect | `(key: string) => void` | — | 选择回调 |
| collapsed | `boolean` | `false` | 折叠为图标 |
| header / footer | `ReactNode` | — | 头/尾内容 |


**SidebarItem**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| key \* | `string` | — | 唯一键 |
| label | `ReactNode` | — | 文案 |
| icon | `ReactNode` | — | 前置图标 |
| badge | `ReactNode` | — | 尾部徽标 |


---
[← 回到索引](../llms.md)
