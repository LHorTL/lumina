import * as React from "react";
import { Button, Card, Input, Modal, Select, message } from "lumina";
import { DocPage } from "../docs";
import { defineSection, type SectionCtx } from "./_types";

/** Modal 长内容结构演示使用的稳定示例项。 */
const MODAL_LAYOUT_ITEMS = Array.from(
  { length: 14 },
  (_, index) => `配置项 ${String(index + 1).padStart(2, "0")}`
);

/** Modal 长内容结构演示的当前场景。 */
type ModalLayoutDemo = "no-footer" | "footer" | "hidden" | null;

const SectionModal: React.FC<SectionCtx> = () => {
  const [m, setM] = React.useState(false);
  const [confirm, setConfirm] = React.useState(false);
  const [asyncOpen, setAsyncOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [stackOpen, setStackOpen] = React.useState(false);
  const [layoutDemo, setLayoutDemo] = React.useState<ModalLayoutDemo>(null);
  return (
    <DocPage
      whenToUse={<p>需要用户处理事务,又不希望跳转页面以致打断工作流时,使用 Modal 在当前页面弹出。</p>}
      demos={[
        {
          id: "basic",
          title: "基础",
          description: "打开后自动聚焦并限制焦点，锁定页面滚动；关闭后把焦点归还给触发控件。",
          code: `<Modal open={m} onClose={...} title="标题">...</Modal>`,
          render: () => (
            <>
              <Button onClick={() => setM(true)}>打开</Button>
              <Modal open={m} onClose={() => setM(false)} title="基础对话框" description="这是一个简单的弹窗示例">
                Modal 会渲染到当前主题的 Portal 容器，并自动处理 Esc、遮罩关闭、焦点循环与滚动锁定。
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
          id: "mask-style",
          title: "遮罩定制",
          description: "默认遮罩使用中性 --mask-bg,不跟随 --bg-sunken 的色相;maskClassName / maskStyle 可定制遮罩层。",
          code: `<Modal
  maskClassName="settings-mask"
  maskStyle={{ background: "var(--mask-bg)", backdropFilter: "none" }}
/>`,
          render: () => {
            const [open, setOpen] = React.useState(false);
            return (
              <>
                <Button onClick={() => setOpen(true)}>中性遮罩</Button>
                <Modal
                  open={open}
                  onClose={() => setOpen(false)}
                  title="遮罩不跟随凹陷背景"
                  description="适合自定义主题里 --bg-sunken 带明显色相的场景。"
                  maskClassName="demo-modal-mask"
                  maskStyle={{ background: "var(--mask-bg)", backdropFilter: "none" }}
                >
                  遮罩层可用 maskStyle 单独控制,不用在业务侧覆盖 .modal-overlay。
                </Modal>
              </>
            );
          },
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
          title: "拟态阴影安全区",
          description: "正文默认根据当前阴影强度预留安全区，Card 等凸起组件贴近边缘时不会再被滚动容器裁切；全宽图片或表格可用 bodyInset=\"none\" 取消留白。",
          code: `<Modal
  bodyStyle={{ maxHeight: 260 }}
  bodyProps={{ "data-panel": "settings" }}
>
  <Card title="同步设置">拟态阴影由 Modal 自动保护。</Card>
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
                  description="滚动仍然可用，阴影安全间距由组件库自动计算。"
                  bodyStyle={{ maxHeight: 260 }}
                  bodyProps={{ "data-panel": "settings" }}
                >
                  <Card
                    title="同步设置"
                    description="Card 直接放进 Modal，无需覆盖 overflow 或手工补 padding。"
                  >
                    内容区保持正常滚动，卡片四周的拟态阴影也能完整显示。
                  </Card>
                </Modal>
              </>
            );
          },
        },
        {
          id: "long-content-layout",
          title: "长内容与独立 footer",
          description: "默认正文只纵向滚动并保留底部安全区；直接子控件不会被纵向压缩。footer 独立于滚动区，bodyOverflow=\"hidden\" 仍可交给内层容器滚动。",
          code: `<Modal
  footer={null}
  bodyStyle={{ maxHeight: 360, display: "flex", flexDirection: "column" }}
>
  <Input placeholder="固定高度的搜索框" />
  <LongList />
</Modal>

<Modal bodyStyle={{ maxHeight: 360 }}>
  <LongForm />
</Modal>

<Modal bodyOverflow="hidden">
  <InnerScrollableLayout />
</Modal>`,
          render: () => (
            <>
              <Button onClick={() => setLayoutDemo("no-footer")}>无 footer 长列表</Button>
              <Button variant="ghost" onClick={() => setLayoutDemo("footer")}>带 footer 长表单</Button>
              <Button variant="ghost" onClick={() => setLayoutDemo("hidden")}>内层接管滚动</Button>

              <Modal
                open={layoutDemo === "no-footer"}
                onClose={() => setLayoutDemo(null)}
                title="无 footer 长列表"
                footer={null}
                width={620}
                bodyStyle={{
                  maxHeight: 360,
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--gap-3)",
                }}
              >
                <Input aria-label="筛选配置项" placeholder="搜索配置项…" allowClear />
                <div style={{ display: "grid", gap: "var(--gap-3)" }}>
                  {MODAL_LAYOUT_ITEMS.map((item) => (
                    <Card key={item} title={item}>滚动到底部仍保留完整留白。</Card>
                  ))}
                </div>
              </Modal>

              <Modal
                open={layoutDemo === "footer"}
                onClose={() => setLayoutDemo(null)}
                onCancel={() => setLayoutDemo(null)}
                onOk={() => setLayoutDemo(null)}
                title="带 footer 长表单"
                width={560}
                bodyStyle={{ maxHeight: 360 }}
              >
                <div style={{ display: "grid", gap: "var(--gap-4)" }}>
                  {MODAL_LAYOUT_ITEMS.slice(0, 10).map((item) => (
                    <Input key={item} aria-label={item} placeholder={`填写${item}`} />
                  ))}
                </div>
              </Modal>

              <Modal
                open={layoutDemo === "hidden"}
                onClose={() => setLayoutDemo(null)}
                title="内层接管滚动"
                footer={null}
                width={620}
                bodyOverflow="hidden"
                bodyStyle={{ height: "min(52vh, 360px)" }}
              >
                <div
                  style={{
                    height: "100%",
                    minHeight: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--gap-3)",
                  }}
                >
                  <div style={{ flexShrink: 0 }}>
                    <Input
                      aria-label="内层筛选"
                      placeholder="固定在内层滚动区上方"
                    />
                  </div>
                  <div
                    style={{
                      flex: "1 1 auto",
                      minHeight: 0,
                      overflowY: "auto",
                      overflowX: "hidden",
                      display: "grid",
                      gap: "var(--gap-3)",
                      padding: "var(--gap-3)",
                    }}
                  >
                    {MODAL_LAYOUT_ITEMS.map((item) => (
                      <Card key={item} title={item}>由内层容器负责滚动。</Card>
                    ))}
                  </div>
                </div>
              </Modal>
            </>
          ),
        },
        {
          id: "nested-overlay",
          title: "嵌套浮层与 Esc 顺序",
          description: "子 Select 即使 Portal 到对话框之外，也会保持在 Modal 上方并参与同一焦点范围；连续按 Esc 会先关 Select，再关 Modal。",
          code: `<Modal open={open} onClose={() => setOpen(false)} destroyOnClose>
  <Select defaultOpen options={[...]} />
</Modal>`,
          render: () => (
            <>
              <Button onClick={() => setStackOpen(true)}>打开嵌套浮层</Button>
              <Modal
                open={stackOpen}
                onClose={() => setStackOpen(false)}
                title="层级与焦点范围"
                description="先关闭 Select，再关闭 Modal。"
                destroyOnClose
              >
                <Select
                  defaultOpen
                  aria-label="选择工作区"
                  options={[
                    { value: "design", label: "设计工作区" },
                    { value: "develop", label: "开发工作区" },
                  ]}
                  placeholder="请选择工作区"
                />
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
            { prop: "onClose", description: "关闭回调(遮罩/Esc/关闭按钮)；Esc 仅由当前最上层浮层响应", type: "() => void" },
            { prop: "onOk", description: "默认 OK 按钮点击", type: "() => void" },
            { prop: "onCancel", description: "默认 Cancel 按钮 / Esc / 关闭 / 遮罩触发,缺省则用 onClose", type: "() => void" },
            { prop: "title / description", description: "标题/说明", type: "ReactNode" },
            { prop: "footer", description: "独立于正文滚动区的底部区域；自定义内容，null 去除", type: "ReactNode" },
            { prop: "okText / cancelText", description: "默认按钮文案", type: "ReactNode", default: `"确定" / "取消"` },
            { prop: "okButtonProps / cancelButtonProps", description: "透传给默认按钮", type: "Partial<ButtonProps>" },
            { prop: "confirmLoading", description: "OK 按钮显示 spinner 并禁用", type: "boolean", default: "false" },
            { prop: "bodyClassName", description: "正文容器 className", type: "string" },
            { prop: "bodyStyle", description: "正文容器内联样式", type: "CSSProperties" },
            { prop: "bodyProps", description: "透传给正文容器的 DOM props", type: "HTMLAttributes<HTMLDivElement>" },
            { prop: "bodyOverflow", description: "正文容器 overflow 快捷控制；hidden 可让复杂内层布局接管滚动", type: "CSSProperties['overflow']" },
            { prop: "bodyInset", description: "正文边缘留白；safe 自动保护拟态阴影，none 用于贴边内容", type: `"safe" | "none"`, default: `"safe"` },
            { prop: "closable", description: "显示右上角 ×", type: "boolean", default: "true" },
            { prop: "closeIcon", description: "自定义关闭图标", type: "ReactNode" },
            { prop: "maskClosable", description: "点击遮罩关闭", type: "boolean", default: "true" },
            { prop: "maskClassName", description: "遮罩层 className", type: "string" },
            { prop: "maskStyle", description: "遮罩层内联样式", type: "CSSProperties" },
            { prop: "className", description: "对话框面板 className；ref 同样指向面板", type: "string" },
            { prop: "escClosable", description: "Esc 关闭", type: "boolean", default: "true" },
            { prop: "width", description: "宽度", type: "number | string", default: "440" },
            { prop: "destroyOnClose", description: "关闭时卸载子树", type: "boolean", default: "false" },
            { prop: "afterOpenChange", description: "动画结束后回调", type: "(open: boolean) => void" },
            { prop: "zIndex", description: "覆盖对话框起始层级；所属子浮层会自动排在其上", type: "number" },
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
