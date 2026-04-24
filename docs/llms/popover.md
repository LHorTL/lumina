# Popover 气泡卡片

> 比 Tooltip 更丰富，可承载交互内容。

## 导入

```tsx
import { Popover } from "@fangxinyan/lumina";
```

## 示例

### 基础用法

点击触发，弹出气泡卡片

```tsx
<Row gap={24}>
  <Popover
    title="确认删除？"
    content={
      <div>
        <div style={{ color: "var(--fg-muted)", fontSize: 13, marginBottom: 12 }}>
          删除后无法恢复。
        </div>
        <Row gap={6}>
          <Button size="sm" variant="ghost">取消</Button>
          <Button size="sm" variant="danger">删除</Button>
        </Row>
      </div>
    }
  >
    <Button variant="danger" icon="trash">删除项目</Button>
  </Popover>

  <Popover
    placement="right"
    content={
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 160 }}>
        <Avatar alt="金" size="sm" />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>金伟</div>
          <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>设计总监</div>
        </div>
      </div>
    }
  >
    <Avatar alt="金" />
  </Popover>
</Row>
```

### 四方向

支持 top / bottom / left / right 四个方向

```tsx
<div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
  <Popover placement="top" arrow content={<div>上方弹出内容</div>}>
    <Button variant="ghost">上方</Button>
  </Popover>
  <Popover placement="bottom" arrow content={<div>下方弹出内容</div>}>
    <Button variant="ghost">下方</Button>
  </Popover>
  <Popover placement="left" arrow content={<div>左侧弹出内容</div>}>
    <Button variant="ghost">左侧</Button>
  </Popover>
  <Popover placement="right" arrow content={<div>右侧弹出内容</div>}>
    <Button variant="ghost">右侧</Button>
  </Popover>
</div>
```

### 细分位置与浮层 class

placement 支持 bottomLeft 等细分方向,overlayClassName 可标记浮层节点。

```tsx
<Popover
  placement="bottomLeft"
  overlayClassName="settings-popover"
  title="快捷设置"
  content={<div>显示在触发器左下方。</div>}
>
  <Button icon="settings">设置</Button>
</Popover>
```

### 箭头

arrow 属性添加指向触发元素的小箭头

```tsx
<Popover
  arrow
  title="系统通知"
  content={<div style={{ color: "var(--fg-muted)", fontSize: 13 }}>你有 3 条未读消息。</div>}
>
  <Button icon="bell">消息</Button>
</Popover>
```

### 可关闭

closable 显示关闭按钮，适合信息提示场景

```tsx
<Popover
  closable
  arrow
  title="注意事项"
  content={<div style={{ color: "var(--fg-muted)", fontSize: 13 }}>此操作需要管理员权限才能执行。</div>}
>
  <Button icon="alert">权限</Button>
</Popover>
```

### Hover 触发

trigger="hover" 鼠标悬停触发

```tsx
<Popover
  trigger="hover"
  arrow
  content={
    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 160 }}>
      <Avatar alt="云" size="sm" />
      <div>
        <div style={{ fontSize: 13, fontWeight: 600 }}>云曦</div>
        <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>前端工程师</div>
      </div>
    </div>
  }
>
  <Avatar alt="云" />
</Popover>
```

### 表单内容

气泡内可放置表单等复杂交互

```tsx
<Popover
  title="快速备注"
  closable
  arrow
  content={
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <Input placeholder="输入备注..." />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
        <Button size="sm">保存</Button>
      </div>
    </div>
  }
>
  <Button icon="edit">备注</Button>
</Popover>
```

## API

**Popover**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| content \* | `ReactNode` | — | 浮层内容 |
| title | `ReactNode` | — | 标题 |
| placement | `"top" | "bottom" | "left" | "right" | ...` | `"bottom"` | 弹出位置,支持 bottomLeft 等细分方向 |
| trigger | `"click" | "hover"` | `"click"` | 触发方式 |
| arrow | `boolean` | `false` | 显示箭头 |
| closable | `boolean` | `false` | 显示关闭按钮 |
| width | `number | "auto"` | — | 面板宽度，"auto" 自适应 |
| open | `boolean` | — | 受控显示状态 |
| defaultOpen | `boolean` | `false` | 非受控初始状态 |
| onOpenChange | `(open: boolean) => void` | — | 显示状态变化回调 |
| visible / onVisibleChange | `boolean / (visible) => void` | — | 受控显示状态别名 |
| overlayClassName / popupClassName | `string` | — | 浮层 className |


---
[← 回到索引](../llms.md)
