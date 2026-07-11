import * as React from "react";
import { Button, message } from "lumina";
import { DocPage } from "../docs";
import { Row } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

const SectionMessage: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={
      <>
        <p>非阻塞式的轻量反馈,用于操作完成后的提示。</p>
        <p>可直接通过 <code>message.*</code> 调用;也可以在应用根节点挂载 <code>&lt;MessageContainer /&gt;</code> 统一承载。</p>
      </>
    }
    demos={[
      {
        id: "basic",
        title: "四种语义",
        code: `message.info("已保存到草稿");
message.success("操作完成");
message.warning("请注意");
message.error("发生错误");`,
        render: () => (
          <Row>
            <Button onClick={() => message.info("已保存到草稿")}>Info</Button>
            <Button variant="primary" onClick={() => message.success("上传成功 3 个文件")}>
              Success
            </Button>
            <Button onClick={() => message.warning("连接不稳定")}>Warning</Button>
            <Button variant="danger" onClick={() => message.error("同步失败")}>
              Error
            </Button>
          </Row>
        ),
      },
      {
        id: "title",
        title: "带标题",
        code: `message.success("已上传 5 个文件", "上传完成");`,
        render: () => (
          <Button onClick={() => message.success("已上传 5 个文件", "上传完成")}>
            带标题的提示
          </Button>
        ),
      },
      {
        id: "object-api",
        title: "对象调用",
        description: "支持 content / message / duration / key / onClose；相同 key 会原位更新并重新计算自动关闭时间。",
        code: `message.open({ key: "sync", type: "info", content: "同步中...", duration: 0 });
setTimeout(() => {
  message.success({ key: "sync", content: "同步完成", duration: 1800 });
}, 900);
message.destroy("sync");`,
        render: () => (
          <Row>
            <Button
              onClick={() => {
                message.open({ key: "sync", type: "info", content: "同步中...", duration: 0 });
                window.setTimeout(() => {
                  message.success({ key: "sync", content: "同步完成", duration: 1800 });
                }, 900);
              }}
            >
              key 更新
            </Button>
            <Button variant="ghost" onClick={() => message.destroy("sync")}>
              destroy(key)
            </Button>
          </Row>
        ),
      },
      {
        id: "overloads-dismiss",
        title: "调用重载与精确关闭",
        description: "第二参数为 number 时表示毫秒时长，否则表示标题；数字 key 请用 dismissByKey，内部 id 请用 dismissById，避免语义冲突。",
        code: `const id = message.info("2 秒后关闭", 2000, onClose);
message.dismissById(id);

message.open({ key: 7, content: "数字 key", duration: 0 });
message.dismissByKey(7);`,
        render: () => (
          <Row>
            <Button
              onClick={() => {
                const id = message.info("原本 2 秒后自动关闭，将按 id 提前关闭", 2000);
                window.setTimeout(() => message.dismissById(id), 900);
              }}
            >
              按内部 id 关闭
            </Button>
            <Button
              onClick={() => message.open({ key: 7, content: "key = 7 的常驻消息", duration: 0 })}
            >
              创建数字 key
            </Button>
            <Button variant="ghost" onClick={() => message.dismissByKey(7)}>
              dismissByKey(7)
            </Button>
          </Row>
        ),
      },
    ]}
    api={[
      {
        title: "message.*",
        rows: [
          { prop: "info / success / warning / warn / error", description: "语义消息；第二参数为数字时表示时长，否则表示标题；第三参数为关闭回调", type: "(content | config, duration | title?, onClose?) => id" },
          { prop: "open(config) / show(config)", description: "完整配置 API；相同 key 更新原消息", type: "(config: MessageConfig) => id" },
          { prop: "dismissById(id)", description: "按内部返回 id 精确关闭", type: "(id: number) => void" },
          { prop: "dismissByKey(key)", description: "按业务 key 精确关闭，数字 key 也不会被当成 id", type: "(key: React.Key) => void" },
          { prop: "dismiss(idOrKey)", description: "兼容 API：优先匹配现有 key，没有同值 key 时数字才按 id 处理", type: "(idOrKey: number | React.Key) => void" },
          { prop: "destroy(idOrKey?) / clear()", description: "destroy 兼容 dismiss；不传参数或 clear() 会清空全部", type: "(idOrKey?) => void" },
        ],
      },
      {
        title: "MessageConfig",
        rows: [
          { prop: "content / message", description: "消息正文；message 是 content 的别名", type: "ReactNode" },
          { prop: "title", description: "正文上方的可选标题", type: "ReactNode" },
          { prop: "type", description: "语义类型", type: `"info" | "success" | "warning" | "error"`, default: `"info"` },
          { prop: "duration", description: "自动关闭时间(ms)，0 表示常驻", type: "number", default: "3200" },
          { prop: "key", description: "稳定业务键；同 key 调用会更新并重置计时器", type: "React.Key" },
          { prop: "onClose", description: "自动关闭、手动关闭或 clear 时执行一次", type: "() => void" },
        ],
      },
      {
        title: "MessageContainer",
        rows: [
          { prop: "placement", description: "位置", type: `"top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center"`, default: `"top-right"` },
        ],
      },
    ]}
  />
);

export default defineSection({
  id: "message",
  group: "反馈",
  order: 30,
  label: "Message 消息",
  eyebrow: "FEEDBACK",
  title: "Message 全局消息",
  desc: "全局轻量提示,支持函数调用与对象配置。",
  Component: SectionMessage,
});
