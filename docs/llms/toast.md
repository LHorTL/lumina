# Toast 通知

> 全局轻量提示,4 种语义。

## 导入

```tsx
import { toast, ToastContainer } from "@fangxinyan/lumina";
```

## 示例

### 四种语义

```tsx
toast.info("已保存到草稿");
toast.success("操作完成");
toast.warn("请注意");
toast.error("发生错误");
```

### 带标题

```tsx
toast.success("已上传 5 个文件", "上传完成");
```

## API

**toast.***

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| info(message, title?) | `(msg, title?) => id` | — | 信息提示 |
| success(message, title?) | `(msg, title?) => id` | — | 成功 |
| warn(message, title?) | `(msg, title?) => id` | — | 警告 |
| error(message, title?) | `(msg, title?) => id` | — | 错误 |
| show({ type, message, title?, duration? }) | `(item) => id` | — | 完整 API |
| dismiss(id) | `(id: number) => void` | — | 关闭一条 |
| clear() | `() => void` | — | 清空全部 |


**ToastContainer**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| placement | `"top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center"` | `"top-right"` | 位置 |


---
[← 回到索引](../llms.md)
