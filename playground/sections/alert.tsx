import * as React from "react";
import { Alert } from "lumina";
import { DocPage } from "../docs";
import { defineSection, type SectionCtx } from "./_types";

const SectionAlert: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={<p>页面中嵌入的警告/提示,与 Toast 不同的是它常驻于页面上,需要用户感知。</p>}
    demos={[
      {
        id: "tones",
        title: "四种语义",
        span: 2,
        code: `<Alert tone="info" title="标题">内容</Alert>`,
        render: () => (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Alert tone="info" title="系统更新可用">
              新版本 v1.2.0 已发布,包含性能改进与 15 个修复。
            </Alert>
            <Alert tone="success" title="备份完成">
              所有文件已成功备份到云端。
            </Alert>
            <Alert tone="warning" title="存储空间不足" closable>
              剩余空间不足 10%。
            </Alert>
            <Alert tone="danger" title="连接失败">
              无法连接到服务器。
            </Alert>
          </div>
        ),
      },
      {
        id: "no-title",
        title: "无标题 / 可关闭",
        span: 2,
        code: `<Alert tone="info" closable>仅一行的简短提示</Alert>`,
        render: () => (
          <Alert tone="info" closable>
            仅一行的简短提示,默认垂直居中显示。
          </Alert>
        ),
      },
    ]}
    api={[
      {
        title: "Alert",
        rows: [
          { prop: "tone", description: "语气", type: `"info" | "success" | "warning" | "danger"`, default: `"info"` },
          { prop: "title", description: "标题", type: "ReactNode" },
          { prop: "icon", description: "自定义图标", type: "IconName" },
          { prop: "closable", description: "可关闭", type: "boolean", default: "false" },
          { prop: "onClose", description: "关闭回调", type: "() => void" },
        ],
      },
    ]}
  />
);

export default defineSection({
  id: "alert",
  group: "反馈",
  order: 60,
  label: "Alert 警告",
  eyebrow: "FEEDBACK",
  title: "Alert 警告提示",
  desc: "页面中嵌入的警告/提示。",
  Component: SectionAlert,
});
