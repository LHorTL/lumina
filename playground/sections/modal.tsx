import * as React from "react";
import { Button, Modal, message } from "lumina";
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
          id: "static-api",
          title: "静态确认框",
          description: "通过 Modal.confirm / warning / error / success / info 直接创建一次性对话框。",
          code: `Modal.confirm({
  title: "覆盖当前配置?",
  content: "保存后会立即生效。",
  okText: "覆盖",
  onOk: async () => {
    await save();
    message.success("已覆盖");
  },
});

Modal.warning({ title: "容量不足", content: "请先清理缓存。" });`,
          render: () => (
            <>
              <Button
                icon="alert"
                onClick={() => {
                  Modal.confirm({
                    title: "覆盖当前配置?",
                    content: "保存后会立即生效。",
                    okText: "覆盖",
                    onOk: () =>
                      new Promise<void>((resolve) => {
                        window.setTimeout(() => {
                          message.success("已覆盖");
                          resolve();
                        }, 900);
                      }),
                  });
                }}
              >
                Modal.confirm
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  Modal.warning({
                    title: "容量不足",
                    content: "请先清理缓存后再继续。",
                  });
                }}
              >
                Modal.warning
              </Button>
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
                        message.error("项目已删除");
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
                    message.success("已发布");
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
                    message.success("已保存");
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
        {
          id: "body-control",
          title: "正文容器控制",
          description: "bodyClassName / bodyStyle / bodyProps 可直接作用到正文容器；bodyOverflow 用于切换滚动或允许拟态阴影外溢。",
          code: `<Modal
  bodyClassName="settings-modal-body"
  bodyStyle={{ maxHeight: 260, padding: 12 }}
  bodyOverflow="visible"
  bodyProps={{ "data-panel": "settings" }}
>
  ...
</Modal>`,
          render: () => {
            const [open, setOpen] = React.useState(false);
            return (
              <>
                <Button onClick={() => setOpen(true)}>正文容器控制</Button>
                <Modal
                  open={open}
                  onClose={() => setOpen(false)}
                  title="拟态内容不被裁切"
                  description="正文容器可按业务场景单独控制 class、style 与 overflow。"
                  bodyStyle={{
                    overflow: "visible",
                    padding: "var(--gap-4)",
                    borderRadius: "var(--r-md)",
                    boxShadow: "var(--neu-shadow-inset)",
                  }}
                  bodyProps={{ "data-panel": "settings" }}
                >
                  <div
                    style={{
                      padding: "var(--gap-4)",
                      borderRadius: "var(--r-md)",
                      boxShadow: "var(--neu-shadow-control)",
                      background: "var(--bg)",
                    }}
                  >
                    内容块自身带阴影时，不必再从业务侧覆盖 .modal-body。
                  </div>
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
            { prop: "bodyClassName", description: "正文容器 className", type: "string" },
            { prop: "bodyStyle", description: "正文容器内联样式", type: "CSSProperties" },
            { prop: "bodyProps", description: "透传给正文容器的 DOM props", type: "HTMLAttributes<HTMLDivElement>" },
            { prop: "bodyOverflow", description: "正文容器 overflow 快捷控制", type: "CSSProperties['overflow']" },
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
        {
          title: "Modal 静态 API",
          rows: [
            { prop: "Modal.confirm(config)", description: "确认框,默认显示取消/确定", type: "(config) => { destroy, update }" },
            { prop: "Modal.info / success / warning / error(config)", description: "单按钮提示框", type: "(config) => { destroy, update }" },
            { prop: "Modal.destroyAll()", description: "关闭全部静态弹窗", type: "() => void" },
            { prop: "config.content", description: "正文内容", type: "ReactNode" },
            { prop: "config.okCancel", description: "是否显示取消按钮", type: "boolean" },
            { prop: "config.onOk", description: "确定回调,返回 Promise 时自动显示 loading", type: "() => void | Promise<void>" },
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
