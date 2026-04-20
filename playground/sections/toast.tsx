import * as React from "react";
import { Button, toast } from "lumina";
import { DocPage } from "../docs";
import { Row } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

const SectionToast: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={
      <>
        <p>非阻塞式的轻量反馈,用于操作完成后的提示。</p>
        <p>需要在应用根节点渲染 <code>&lt;ToastContainer /&gt;</code> 一次,然后通过 <code>toast.*</code> 调用。</p>
      </>
    }
    demos={[
      {
        id: "basic",
        title: "四种语义",
        code: `toast.info("已保存到草稿");
toast.success("操作完成");
toast.warn("请注意");
toast.error("发生错误");`,
        render: () => (
          <Row>
            <Button onClick={() => toast.info("已保存到草稿")}>Info</Button>
            <Button variant="primary" onClick={() => toast.success("上传成功 3 个文件")}>
              Success
            </Button>
            <Button onClick={() => toast.warn("连接不稳定")}>Warn</Button>
            <Button variant="danger" onClick={() => toast.error("同步失败")}>
              Error
            </Button>
          </Row>
        ),
      },
      {
        id: "title",
        title: "带标题",
        code: `toast.success("已上传 5 个文件", "上传完成");`,
        render: () => (
          <Button onClick={() => toast.success("已上传 5 个文件", "上传完成")}>
            带标题的提示
          </Button>
        ),
      },
    ]}
    api={[
      {
        title: "toast.*",
        rows: [
          { prop: "info(message, title?)", description: "信息提示", type: "(msg, title?) => id" },
          { prop: "success(message, title?)", description: "成功", type: "(msg, title?) => id" },
          { prop: "warn(message, title?)", description: "警告", type: "(msg, title?) => id" },
          { prop: "error(message, title?)", description: "错误", type: "(msg, title?) => id" },
          { prop: "show({ type, message, title?, duration? })", description: "完整 API", type: "(item) => id" },
          { prop: "dismiss(id)", description: "关闭一条", type: "(id: number) => void" },
          { prop: "clear()", description: "清空全部", type: "() => void" },
        ],
      },
      {
        title: "ToastContainer",
        rows: [
          { prop: "placement", description: "位置", type: `"top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center"`, default: `"top-right"` },
        ],
      },
    ]}
  />
);

export default defineSection({
  id: "toast",
  group: "反馈",
  order: 30,
  label: "Toast 通知",
  eyebrow: "FEEDBACK",
  title: "Toast 通知",
  desc: "全局轻量提示,4 种语义。",
  Component: SectionToast,
});
