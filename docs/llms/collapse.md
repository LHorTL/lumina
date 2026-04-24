# Collapse 折叠面板

> 纵向折叠面板。

## 导入

```tsx
import { Collapse } from "@fangxinyan/lumina";
```

## 示例

### 基础

```tsx
<Collapse items={[{ key, label, children }]} />
```

### 多项展开

multiple 允许同时展开多个面板。

```tsx
<Collapse defaultActiveKey={["1", "2"]} ... />
```

### 手风琴模式

accordion={true} 同一时刻最多只展开一项;与 multiple 同时传入时 accordion 优先。

```tsx
<Collapse accordion defaultActiveKey="1" ... />
```

### 仅图标可点

collapsible="icon" 将展开触发限制在右侧箭头图标上,标题区域不再响应。

```tsx
<Collapse collapsible="icon" ... />
```

### 禁用展开

collapsible="disabled" 会禁用所有项的展开交互。

```tsx
<Collapse collapsible="disabled" defaultActiveKey="1" ... />
```

## API

**Collapse**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| items \* | `CollapseItem[]` | — | 面板数据 |
| accordion | `boolean` | `false` | 手风琴模式(同一时刻最多一项) |
| multiple | `boolean` | `true` | 可同时展开多个 |
| collapsible | `"header" | "icon" | "disabled"` | `"header"` | 展开触发区域 |
| activeKey / defaultActiveKey | `string | string[]` | — | 受控/初始展开 |
| ghost | `boolean` | `false` | 无外框/阴影的轻量样式 |
| size | `"small" | "middle" | "large"` | `"middle"` | 尺寸 |
| onChange | `(keys: string[]) => void` | — | 展开变更 |


---
[← 回到索引](../llms.md)
