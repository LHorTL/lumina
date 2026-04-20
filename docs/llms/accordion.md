# Accordion 折叠面板

> 纵向折叠面板。

## 导入

```tsx
import { Accordion } from "@fangxinyan/lumina";
```

## 示例

### 基础

```tsx
<Accordion items={[{ key, title, content }]} />
```

### 多项展开

multiple 允许同时展开多个面板。

```tsx
<Accordion multiple defaultActiveKeys={["1", "2"]} ... />
```

### 手风琴模式

accordion={true} 同一时刻最多只展开一项;与 multiple 同时传入时 accordion 优先。

```tsx
<Accordion accordion defaultActiveKeys={["1"]} ... />
```

### 仅图标可点

collapsible="icon" 将展开触发限制在右侧箭头图标上,标题区域不再响应。

```tsx
<Accordion collapsible="icon" ... />
```

### 禁用展开

collapsible="disabled" 会禁用所有项的展开交互。

```tsx
<Accordion collapsible="disabled" defaultActiveKeys={["1"]} ... />
```

## API

**Accordion**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| items \* | `AccordionItem[]` | — | 面板数据 |
| multiple | `boolean` | `false` | 可同时展开多个 |
| accordion | `boolean` | `false` | 手风琴模式(同一时刻最多一项) |
| collapsible | `"header" | "icon" | "disabled"` | `"header"` | 展开触发区域 |
| activeKeys / defaultActiveKeys | `string[]` | — | 受控/初始展开 |
| onChange | `(keys: string[]) => void` | — | 展开变更 |


---
[← 回到索引](../llms.md)
