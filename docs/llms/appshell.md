# AppShell 应用外壳

> 组合 TitleBar、Sidebar 与主内容区的 Electron 桌面布局容器。

## 导入

```tsx
import { AppShell, TitleBar, Sidebar, StatusBar } from "@fangxinyan/lumina";
```

## 示例

### 完整工作台外壳

```tsx
<AppShell
  titleBar={<TitleBar title="Lumina Mail" platform="mac" />}
  sidebar={<Sidebar items={items} activeKey={active} onSelect={setActive} />}
>
  <main>...</main>
</AppShell>
```

## API

**AppShell**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| titleBar | `ReactNode` | — | 顶部标题栏区域 |
| sidebar | `ReactNode` | — | 左侧导航区域 |
| children | `ReactNode` | — | 主内容区 |


---
[← 回到索引](../llms.md)
