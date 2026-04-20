import * as React from "react";
import { Button, Modal, toast } from "lumina";
import { DocPage } from "../docs";
import { defineSection, type SectionCtx } from "./_types";

const SectionModal: React.FC<SectionCtx> = () => {
  const [m, setM] = React.useState(false);
  const [confirm, setConfirm] = React.useState(false);
  const [asyncOpen, setAsyncOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
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
          title: "确认操作 (footer 自定义)",
          description: "用 footer 自定义底部按钮。传 null 可以去掉 footer。",
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
        {
          id: "ok-cancel",
          title: "onOk / onCancel + 按钮定制",
          description: "用默认 footer 的 onOk / onCancel 区分动作,okText / cancelText 改文案,okButtonProps 透传样式。",
          code: `<Modal
  onOk={handleSave}
  onCancel={() => setOpen(false)}
  okText="发布"
  cancelText="不发了"
  okButtonProps={{ icon: "send" }}
/>`,
          render: () => {
            const [open, setOpen] = React.useState(false);
            return (
              <>
                <Button onClick={() => setOpen(true)}>带按钮回调</Button>
                <Modal
                  open={open}
                  onClose={() => setOpen(false)}
                  title="发布文章"
                  description="确认要发布这篇文章到主页吗?"
                  okText="发布"
                  cancelText="再想想"
                  okButtonProps={{ icon: "send" }}
                  onOk={() => {
                    setOpen(false);
                    toast.success("已发布");
                  }}
                  onCancel={() => setOpen(false)}
                >
                  发布后将立刻推送给所有订阅者。
                </Modal>
              </>
            );
          },
        },
        {
          id: "async",
          title: "异步 confirmLoading",
          description: "提交过程中 confirmLoading 显示按钮 spinner 并自动禁用;完成后外层再 setOpen(false)。",
          code: `<Modal confirmLoading={submitting} onOk={async () => {
  setSubmitting(true);
  await api.save();
  setSubmitting(false);
  setOpen(false);
}} />`,
          render: () => (
            <>
              <Button onClick={() => setAsyncOpen(true)}>异步提交</Button>
              <Modal
                open={asyncOpen}
                onClose={() => !submitting && setAsyncOpen(false)}
                title="保存更改"
                description="点击确定会模拟 1.2 秒的网络请求。"
                confirmLoading={submitting}
                maskClosable={!submitting}
                escClosable={!submitting}
                okText="保存"
                onOk={() => {
                  setSubmitting(true);
                  setTimeout(() => {
                    setSubmitting(false);
                    setAsyncOpen(false);
                    toast.success("已保存");
                  }, 1200);
                }}
                onCancel={() => setAsyncOpen(false)}
              >
                提交期间关闭按钮和遮罩点击都会被禁用。
              </Modal>
            </>
          ),
        },
        {
          id: "closable",
          title: "隐藏关闭按钮",
          description: "closable={false} 隐藏右上角 ×,closeIcon 可自定义。",
          code: `<Modal closable={false} />
<Modal closeIcon={<Icon name="chevDown" />} />`,
          render: () => {
            const [open, setOpen] = React.useState(false);
            return (
              <>
                <Button onClick={() => setOpen(true)}>无关闭按钮</Button>
                <Modal
                  open={open}
                  onClose={() => setOpen(false)}
                  closable={false}
                  title="强制阅读"
                  description="只能通过底部按钮关闭"
                >
                  这种模式常用在必须接受条款的场景。
                </Modal>
              </>
            );
          },
        },
      ]}
      api={[
        {
          title: "Modal",
          rows: [
            { prop: "open", description: "是否可见", type: "boolean", required: true },
            { prop: "onClose", description: "关闭回调(遮罩/Esc/关闭按钮)", type: "() => void" },
            { prop: "onOk", description: "默认 OK 按钮点击", type: "() => void" },
            { prop: "onCancel", description: "默认 Cancel 按钮 / Esc / 关闭 / 遮罩触发,缺省则用 onClose", type: "() => void" },
            { prop: "title / description", description: "标题/说明", type: "ReactNode" },
            { prop: "footer", description: "自定义底部(null 去除)", type: "ReactNode" },
            { prop: "okText / cancelText", description: "默认按钮文案", type: "ReactNode", default: `"确定" / "取消"` },
            { prop: "okButtonProps / cancelButtonProps", description: "透传给默认按钮", type: "Partial<ButtonProps>" },
            { prop: "confirmLoading", description: "OK 按钮显示 spinner 并禁用", type: "boolean", default: "false" },
            { prop: "closable", description: "显示右上角 ×", type: "boolean", default: "true" },
            { prop: "closeIcon", description: "自定义关闭图标", type: "ReactNode" },
            { prop: "maskClosable", description: "点击遮罩关闭", type: "boolean", default: "true" },
            { prop: "escClosable", description: "Esc 关闭", type: "boolean", default: "true" },
            { prop: "width", description: "宽度", type: "number | string", default: "440" },
            { prop: "destroyOnClose", description: "关闭时卸载子树", type: "boolean", default: "false" },
            { prop: "afterOpenChange", description: "动画结束后回调", type: "(open: boolean) => void" },
            { prop: "zIndex", description: "覆盖遮罩 z-index", type: "number" },
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
