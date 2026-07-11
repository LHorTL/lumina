# ColorPicker 颜色选择

> 拟态风格的颜色选择器:HSV 色域、色相、hex 输入、预设调色板。

## 导入

```tsx
import { ColorPicker, type ColorPickerTriggerElement } from "@fangxinyan/lumina";
```

## 示例

### 基础用法

非受控用法,点击色块弹出面板。

```tsx
<ColorPicker defaultValue="#ff6b6b" onChange={setColor} />
```

### 受控

实时同步 value,失焦 / 拖拽结束时再调用 onChangeComplete。

```tsx
<ColorPicker value={color} onChange={setColor} showText />
```

### 尺寸

```tsx
<ColorPicker size="sm" />
<ColorPicker />
<ColorPicker size="lg" />
```

### 禁用

```tsx
<ColorPicker disabled defaultValue="#868e96" />
```

### 自定义预设

presets 传入十六进制数组,面板底部会渲染一排色块。

```tsx
<ColorPicker
  presets={["#ff6b6b", "#ffd43b", "#51cf66", "#339af0", "#845ef7"]}
/>
```

### 自定义触发器

将 children 作为触发器;纯文本或不能接收 ref 的组件会自动获得可访问的包装节点。

```tsx
<ColorPicker value={brand} onChange={setBrand}>
  <Button icon="palette">品牌色 · {brand}</Button>
</ColorPicker>
```

## API

**ColorPicker**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| value / defaultValue | `string` | `"#845ef7"` | 十六进制颜色 |
| onChange | `(hex: string) => void` | — | 每次变化触发(拖拽 / 输入 / 预设点击) |
| onChangeComplete | `(hex: string) => void` | — | 拖拽/输入结束触发 |
| size | `"sm" | "md" | "lg"` | `"md"` | 触发器尺寸 |
| placement | `"top" | "bottom" | "left" | "right"` | `"bottom"` | 面板位置 |
| presets | `string[]` | — | 预设色数组 |
| showText | `boolean` | `false` | 触发器右侧显示 hex |
| disabled | `boolean` | `false` | 禁用 |
| open / defaultOpen / onOpenChange | `—` | — | 受控面板显隐 |
| children | `ReactNode` | — | 自定义触发器;不能接收 ref 的节点会自动包装 |
| ref | `Ref<ColorPickerTriggerElement>` | — | 实际触发节点;自定义内容可能返回包装节点 |


---
[← 回到索引](../llms.md)
