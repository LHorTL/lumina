# Button 按钮

> 标记一个操作命令,响应用户点击行为,触发相应业务逻辑。

## 导入

```tsx
import { Button, IconButton } from "@fangxinyan/lumina";
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

icon 在前,trailingIcon 在后,既支持内置 IconName,也支持外部 ReactNode。

```tsx
<Button variant="primary" icon="sparkle">新建</Button>
<Button icon="download">下载</Button>
<Button trailingIcon="arrowRight">下一步</Button>
<Button icon={<img src={iconUrl} alt="" />}>外部图标</Button>
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

IconButton 是 Button 的方形图标专用封装;Button 在只有 icon 时也会自动呈现为同样形态。

```tsx
<Button icon="heart" tip="收藏" />
<IconButton icon="bell" tip="通知" />
<IconButton icon="settings" tip="设置" />
```

## API

**Button**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| variant | `"default" | "primary" | "ghost" | "danger"` | `"default"` | 按钮风格 |
| size | `"sm" | "md" | "lg"` | `"md"` | 按钮尺寸 |
| icon | `IconName | ReactNode` | — | 前置图标,可传内置图标名或自定义节点 |
| trailingIcon | `IconName | ReactNode` | — | 后置图标,可传内置图标名或自定义节点 |
| iconOnly | `boolean` | `自动` | 渲染为纯图标方形按钮 |
| tip | `string` | — | 原生悬浮提示,常用于纯图标按钮 |
| loading | `boolean` | `false` | 加载态 |
| block | `boolean` | `false` | 撑满父容器宽度 |
| disabled | `boolean` | `false` | 禁用 |
| onClick | `(e: MouseEvent) => void` | — | 点击回调 |


**IconButton**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| icon \* | `IconName | ReactNode` | — | 按钮图标,可传内置图标名或自定义节点 |
| tip | `string` | — | 原生悬浮提示,也会作为缺省 aria-label |
| variant | `"default" | "primary" | "ghost" | "danger"` | `"default"` | 按钮风格 |
| size | `"sm" | "md" | "lg"` | `"md"` | 按钮尺寸 |
| loading | `boolean` | `false` | 加载态 |
| disabled | `boolean` | `false` | 禁用 |


---
[← 回到索引](../llms.md)
