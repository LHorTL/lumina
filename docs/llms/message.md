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

支持 content / message / duration / key / onClose；相同 key 会原位更新并重新计算自动关闭时间。

```tsx
message.open({ key: "sync", type: "info", content: "同步中...", duration: 0 });
setTimeout(() => {
  message.success({ key: "sync", content: "同步完成", duration: 1800 });
}, 900);
message.destroy("sync");
```

### 调用重载与精确关闭

第二参数为 number 时表示毫秒时长，否则表示标题；数字 key 请用 dismissByKey，内部 id 请用 dismissById，避免语义冲突。

```tsx
const id = message.info("2 秒后关闭", 2000, onClose);
message.dismissById(id);

message.open({ key: 7, content: "数字 key", duration: 0 });
message.dismissByKey(7);
```

## API

**message.***

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| info / success / warning / warn / error | `(content | config, duration | title?, onClose?) => id` | — | 语义消息；第二参数为数字时表示时长，否则表示标题；第三参数为关闭回调 |
| open(config) / show(config) | `(config: MessageConfig) => id` | — | 完整配置 API；相同 key 更新原消息 |
| dismissById(id) | `(id: number) => void` | — | 按内部返回 id 精确关闭 |
| dismissByKey(key) | `(key: React.Key) => void` | — | 按业务 key 精确关闭，数字 key 也不会被当成 id |
| dismiss(idOrKey) | `(idOrKey: number | React.Key) => void` | — | 兼容 API：优先匹配现有 key，没有同值 key 时数字才按 id 处理 |
| destroy(idOrKey?) / clear() | `(idOrKey?) => void` | — | destroy 兼容 dismiss；不传参数或 clear() 会清空全部 |


**MessageConfig**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| content / message | `ReactNode` | — | 消息正文；message 是 content 的别名 |
| title | `ReactNode` | — | 正文上方的可选标题 |
| type | `"info" | "success" | "warning" | "error"` | `"info"` | 语义类型 |
| duration | `number` | `3200` | 自动关闭时间(ms)，0 表示常驻 |
| key | `React.Key` | — | 稳定业务键；同 key 调用会更新并重置计时器 |
| onClose | `() => void` | — | 自动关闭、手动关闭或 clear 时执行一次 |


**MessageContainer**

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| placement | `"top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center"` | `"top-right"` | 位置 |


---
[← 回到索引](../llms.md)
