# Message 全局消息

> 全局轻量提示,支持函数调用与对象配置。

## 导入

```tsx
import { message, MessageContainer } from "@fangxinyan/lumina";
```

## 示例

### 四种语义

```tsx
message.info("已保存到草稿");
message.success("操作完成");
message.warning("请注意");
message.error("发生错误");
```

### 带标题

```tsx
message.success("已上传 5 个文件", "上传完成");
```

### 对象调用

支持 content / duration / key / destroy,适合需要更新或手动关闭的提示。

```tsx
message.open({ key: "sync", type: "info", content: "同步中...", duration: 0 });
setTimeout(() => {
  message.success({ key: "sync", content: "同步完成", duration: 1800 });
}, 900);
message.destroy("sync");
```

## API

**message.***

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| info(message, title?) | `(msg, title?) => id` | — | 信息提示 |
| success(message, title?) | `(msg, title?) => id` | — | 成功 |
| warning(message, title?) / warn(message, title?) | `(msg, title?) => id` | — | 警告 |
| error(message, title?) | `(msg, title?) => id` | — | 错误 |
| open({ type, content, title?, duration?, key? }) | `(config) => id` | — | 对象配置 API |
| dismiss(id) | `(id: number) => void` | — | 关闭一条 |
| destroy(key?) / clear() | `(key?) => void` | — | 关闭指定 key 或清空全部 |


**MessageContainer**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| placement | `"top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center"` | `"top-right"` | 位置 |


---
[← 回到索引](../llms.md)
