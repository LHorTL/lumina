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
        description: "支持 content / duration / key / destroy,适合需要更新或手动关闭的提示。",
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
    ]}
    api={[
      {
        title: "message.*",
        rows: [
          { prop: "info(message, title?)", description: "信息提示", type: "(msg, title?) => id" },
          { prop: "success(message, title?)", description: "成功", type: "(msg, title?) => id" },
          { prop: "warning(message, title?) / warn(message, title?)", description: "警告", type: "(msg, title?) => id" },
          { prop: "error(message, title?)", description: "错误", type: "(msg, title?) => id" },
          { prop: "open({ type, content, title?, duration?, key? })", description: "对象配置 API", type: "(config) => id" },
          { prop: "dismiss(id)", description: "关闭一条", type: "(id: number) => void" },
          { prop: "destroy(key?) / clear()", description: "关闭指定 key 或清空全部", type: "(key?) => void" },
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
