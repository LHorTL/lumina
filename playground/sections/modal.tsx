import * as React from "react";
import { Button, Modal, toast } from "lumina";
import { DocPage } from "../docs";
import { defineSection, type SectionCtx } from "./_types";

const SectionModal: React.FC<SectionCtx> = () => {
  const [m, setM] = React.useState(false);
  const [confirm, setConfirm] = React.useState(false);
  return (
    <DocPage
      whenToUse={<p>需要用户处理事务,又不希望跳转页面以致打断工作流时,使用 Modal 在当前页面弹出。</p>}
      demos={[
        {
          id: "basic",
          title: "基础",
          code: `<Modal open={m} onClose={...} title="标题">...</Modal>`,
          render: () => (
            <>
              <Button onClick={() => setM(true)}>打开</Button>
              <Modal open={m} onClose={() => setM(false)} title="基础对话框" description="这是一个简单的弹窗示例">
                Modal 会渲染到 document.body,自动处理 Esc 关闭和点击遮罩关闭。
              </Modal>
            </>
          ),
        },
        {
          id: "confirm",
          title: "确认操作",
          description: "用 footer 自定义底部按钮。",
          code: `<Modal footer={<><Button>取消</Button><Button danger>删除</Button></>}>...`,
          render: () => (
            <>
              <Button variant="danger" icon="trash" onClick={() => setConfirm(true)}>
                删除项目
              </Button>
              <Modal
                open={confirm}
                onClose={() => setConfirm(false)}
                title="确认删除项目?"
                description="此操作不可恢复"
                footer={
                  <>
                    <Button variant="ghost" onClick={() => setConfirm(false)}>
                      取消
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        setConfirm(false);
                        toast.error("项目已删除");
                      }}
                    >
                      删除
                    </Button>
                  </>
                }
              >
                将永久删除该项目及其下属的所有资源。
              </Modal>
            </>
          ),
        },
      ]}
      api={[
        {
          title: "Modal",
          rows: [
            { prop: "open", description: "是否可见", type: "boolean", required: true },
            { prop: "onClose", description: "关闭回调", type: "() => void" },
            { prop: "title / description", description: "标题/说明", type: "ReactNode" },
            { prop: "footer", description: "底部内容", type: "ReactNode" },
            { prop: "width", description: "宽度", type: "number | string", default: "440" },
            { prop: "maskClosable", description: "点击遮罩关闭", type: "boolean", default: "true" },
            { prop: "escClosable", description: "Esc 键关闭", type: "boolean", default: "true" },
          ],
        },
      ]}
    />
  );
};

export default defineSection({
  id: "modal",
  group: "反馈",
  order: 10,
  label: "Modal 对话框",
  eyebrow: "FEEDBACK",
  title: "Modal 对话框",
  desc: "在不离开当前页面的前提下处理事务。",
  Component: SectionModal,
});
