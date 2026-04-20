# Tabs 选项卡

> 同一层级的内容分组,通过标签切换。

## 导入

```tsx
import { Tabs } from "@fangxinyan/lumina";
```

## 示例

### 基础

```tsx
<Tabs items={[
  { key: "general", label: "通用", content: <>...</> },
  { key: "account", label: "账户", content: <>...</> },
]} />
```

### 下划线变体

```tsx
<Tabs variant="line" items={[...]} />
```

### 居中对齐

centered 让标签条在容器中水平居中。

```tsx
<Tabs centered items={[...]} />
```

## API

**Tabs**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| items \* | `TabItem[]` | — | 标签数据 |
| activeKey / defaultActiveKey | `string` | — | 受控/初始激活 |
| onChange | `(key: string) => void` | — | 切换 |
| variant | `"line" | "pill" | "segmented"` | `"line"` | 样式 |
| centered | `boolean` | `false` | 标签条居中对齐 |


---
[← 回到索引](../llms.md)
