# Radio 单选

> 在多个互斥选项中进行单项选择。

## 导入

```tsx
import { RadioGroup } from "@fangxinyan/lumina";
```

## 示例

### 基础用法

```tsx
<RadioGroup value={v} onChange={setV} options={[
  { value: "daily", label: "每日" },
  { value: "weekly", label: "每周" },
]} />
```

### 水平排列

direction='horizontal'。

```tsx
<RadioGroup direction="horizontal" ... />
```

## API

**RadioGroup**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| options \* | `{ value, label, disabled? }[]` | — | 选项数组 |
| value / defaultValue | `T` | — | 受控/初始 |
| onChange | `(value: T) => void` | — | 变更 |
| direction | `"vertical" | "horizontal"` | `"vertical"` | 方向 |


---
[← 回到索引](../llms.md)
