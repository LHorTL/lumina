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

### 满高布局 / 正文独立滚动

fill 让 Tabs 占满父容器，标签条保持固定，只有 tabs-content 滚动；两个 className 可定向接入业务布局。

```tsx
<div style={{ height: 260 }}>
  <Tabs
    fill
    tabBarClassName="workspace-tabs-bar"
    contentClassName="workspace-tabs-content"
    items={[
      { key: "general", label: "通用", content: <LongSettings /> },
      { key: "advanced", label: "高级", content: <LongSettings /> },
    ]}
  />
</div>
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
| tabBarClassName | `string` | — | 标签条容器的附加类名 |
| contentClassName | `string` | — | 正文容器的附加类名 |
| fill | `boolean` | `false` | 占满父容器，并让正文区域独立滚动 |


---
[← 回到索引](../llms.md)
