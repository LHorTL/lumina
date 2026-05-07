# Timeline 时间线

> 垂直时间线，支持等待状态、自定义圆点、交替布局

## 导入

```tsx
import { Timeline } from "@fangxinyan/lumina";
```

## 示例

### 基础用法

最简单的时间线

```tsx
<Timeline
  items={[
    { children: "创建项目 2024-01-01" },
    { children: "初始化仓库 2024-01-05" },
    { children: "发布 v0.1.0 2024-02-01" },
    { children: "里程碑达成 2024-03-15" },
  ]}
/>
```

### 彩色节点

通过 color 区分不同状态

```tsx
<Timeline
  items={[
    { children: "成功部署", color: "success" },
    { children: "告警通知", color: "warning" },
    { children: "构建失败", color: "danger" },
    { children: "信息更新", color: "info" },
  ]}
/>
```

### 等待状态

pending 属性展示加载中的末尾节点，适合表示流程尚未结束

```tsx
<Timeline
  pending
  pendingContent="部署中..."
  items={[
    { children: "提交代码 10:21", color: "success" },
    { children: "代码审查通过 10:45", color: "success" },
    { children: "CI 构建完成 11:02", color: "success" },
  ]}
/>
```

### 自定义等待图标

pending 传入 ReactNode 自定义等待指示器

```tsx
<Timeline
  pending={<Icon name="clock" size={14} />}
  pendingContent="等待审批..."
  items={[
    { children: "提交申请" },
    { children: "部门审核通过" },
  ]}
/>
```

### 自定义圆点

通过 dot 字段自定义每个节点的图标

```tsx
<Timeline
  items={[
    { children: "项目创建", dot: <Icon name="folder" size={14} /> },
    { children: "代码提交", dot: <Icon name="code" size={14} /> },
    { children: "发布上线", dot: <Icon name="zap" size={14} /> },
  ]}
/>
```

### 交替模式

mode="alternate" 让内容交替出现在两侧

```tsx
<Timeline
  mode="alternate"
  items={[
    { children: "创建项目", label: "2024-01" },
    { children: "完成设计稿", label: "2024-02" },
    { children: "开发完成", label: "2024-03" },
    { children: "发布上线", label: "2024-04" },
  ]}
/>
```

### 倒序

reverse 属性将时间线反转，最新的事件在最上面

```tsx
<Timeline
  reverse
  pending
  pendingContent="进行中..."
  items={[
    { children: "第一步：需求确认", color: "success" },
    { children: "第二步：开发中", color: "success" },
    { children: "第三步：测试", color: "warning" },
  ]}
/>
```

### 槽位样式

item / content / dot / label 都可以拿到样式入口；content 默认 min-width: 0，长内容能在弹性容器里正确收缩。

```tsx
<Timeline
  contentMinWidth={0}
  dotOffset={4}
  items={[
    {
      children: "很长的任务标题...",
      contentStyle: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
      dotStyle: { boxShadow: "var(--neu-shadow-lift)" },
    },
  ]}
/>
```

## API

**Timeline**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| items \* | `TimelineItemConfig[]` | — | 时间线节点数组 |
| pending | `boolean | ReactNode` | `false` | 显示末尾等待节点；true 显示默认 spinner，传 ReactNode 自定义 |
| pendingContent | `ReactNode` | `"加载中..."` | 等待节点的文字内容 |
| mode | `"left" | "right" | "alternate"` | `"left"` | 布局模式 |
| reverse | `boolean` | `false` | 反转节点顺序 |
| itemClassName / itemStyle | `string / CSSProperties` | — | 透传到每个节点外层 |
| contentClassName / contentStyle | `string / CSSProperties` | — | 透传到每个内容槽 |
| contentMinWidth | `CSSProperties['minWidth']` | `0` | 内容槽最小宽度，默认允许在 flex/grid 中收缩 |
| dotClassName / dotStyle | `string / CSSProperties` | — | 透传到每个圆点槽 |
| dotOffset | `CSSProperties['marginTop']` | `4` | 圆点垂直偏移 |
| dotAlign | `"start" | "center" | "end"` | `"center"` | 圆点在 head 列中的横向对齐 |
| labelClassName / labelStyle | `string / CSSProperties` | — | 透传到每个标签槽 |


**TimelineItemConfig**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| key | `string` | — | 唯一标识 |
| children | `ReactNode` | — | 节点内容 |
| label | `ReactNode` | — | 对侧标签（alternate 模式下使用） |
| color | `"accent" | "success" | "warning" | "danger" | "info" | "muted"` | `"accent"` | 圆点颜色 |
| dot | `ReactNode` | — | 自定义圆点内容 |
| className / style | `string / CSSProperties` | — | 节点外层样式槽 |
| contentClassName / contentStyle | `string / CSSProperties` | — | 内容槽样式 |
| dotClassName / dotStyle | `string / CSSProperties` | — | 圆点槽样式 |
| labelClassName / labelStyle | `string / CSSProperties` | — | 标签槽样式 |


---
[← 回到索引](../llms.md)
