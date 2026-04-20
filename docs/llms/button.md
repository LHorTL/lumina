# Button 按钮

> 标记一个操作命令,响应用户点击行为,触发相应业务逻辑。

## 导入

```tsx
import { Button, IconButton, Segmented } from "@fangxinyan/lumina";
```

## 示例

### 基础按钮

四种风格:主要、默认、幽灵、危险。

```tsx
<Button variant="primary">主按钮</Button>
<Button>默认按钮</Button>
<Button variant="ghost">幽灵按钮</Button>
<Button variant="danger">删除</Button>
```

### 图标按钮

icon 在前,trailingIcon 在后。

```tsx
<Button variant="primary" icon="sparkle">新建</Button>
<Button icon="download">下载</Button>
<Button trailingIcon="arrowRight">下一步</Button>
```

### 加载与禁用

loading 期间禁用并显示 spinner。

```tsx
<Button loading={loading} variant="primary" onClick={...}>点我加载</Button>
<Button disabled>已禁用</Button>
```

### 尺寸

提供 sm / md / lg 三种高度。

```tsx
<Button size="sm">Small</Button>
<Button>Medium</Button>
<Button size="lg">Large</Button>
```

### 块级按钮

block 让按钮撑满容器宽度,常用于底部主操作或表单提交。

```tsx
<Button block variant="primary" icon="send">提交表单</Button>
<Button block>取消</Button>
```

### 纯图标按钮

IconButton 是只含图标的方形按钮,常配合 tip 使用。

```tsx
<IconButton icon="heart" tip="收藏" />
<IconButton icon="bell" tip="通知" />
<IconButton icon="settings" tip="设置" />
```

### 分段控制器

互斥多选项切换。

```tsx
<Segmented
  options={[
    { value: "grid", label: "网格" },
    { value: "list", label: "列表" },
    { value: "card", label: "卡片" },
  ]}
  defaultValue="grid"
/>
```

## API

**Button**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| variant | `"default" | "primary" | "ghost" | "danger"` | `"default"` | 按钮风格 |
| size | `"sm" | "md" | "lg"` | `"md"` | 按钮尺寸 |
| icon | `IconName` | — | 前置图标 |
| trailingIcon | `IconName` | — | 后置图标 |
| loading | `boolean` | `false` | 加载态 |
| block | `boolean` | `false` | 撑满父容器宽度 |
| disabled | `boolean` | `false` | 禁用 |
| onClick | `(e: MouseEvent) => void` | — | 点击回调 |


**IconButton**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| icon \* | `IconName` | — | 图标名 |
| tip | `string` | — | 悬浮提示 |
| size / variant | `—` | — | 继承自 Button |


**Segmented**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| options \* | `{ value, label, disabled? }[]` | — | 选项数组 |
| value / defaultValue | `T` | — | 受控/初始选中值 |
| onChange | `(value: T) => void` | — | 切换回调 |


---
[← 回到索引](../llms.md)
