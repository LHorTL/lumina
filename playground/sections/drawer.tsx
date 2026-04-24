import * as React from "react";
import { Button, Drawer, Input, Switch, message } from "lumina";
import { DocPage } from "../docs";
import { Field, Row } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

const SectionDrawer: React.FC<SectionCtx> = () => {
  const [d, setD] = React.useState(false);
  const [placementOpen, setPlacementOpen] = React.useState(false);
  const [placement, setPlacement] = React.useState<"left" | "right" | "top" | "bottom">("right");
  return (
    <DocPage
      whenToUse={<p>从屏幕边缘滑出的抽屉,常用于详情查看、设置面板。</p>}
      demos={[
        {
          id: "basic",
          title: "基础",
          code: `<Drawer open={d} onClose={...} title="标题">...</Drawer>`,
          render: () => (
            <>
              <Button icon="layers" onClick={() => setD(true)}>
                打开抽屉
              </Button>
              <Drawer open={d} onClose={() => setD(false)} title="快速操作">
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <Field label="名称">
                    <Input placeholder="未命名项目" leadingIcon="edit" />
                  </Field>
                  <Field label="标签">
                    <Input placeholder="用逗号分隔" leadingIcon="filter" />
                  </Field>
                  <Switch label="公开访问" />
                  <Row gap={8}>
                    <Button variant="ghost" onClick={() => setD(false)}>
                      取消
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => {
                        setD(false);
                        message.success("已创建");
                      }}
                    >
                      创建
                    </Button>
                  </Row>
                </div>
              </Drawer>
            </>
          ),
        },
        {
          id: "extra",
          title: "标题右侧 extra",
          description: "extra 渲染到标题右边,常用来放刷新 / 更多 / 保存按钮。",
          code: `<Drawer
  title="订单详情"
  extra={<><Button icon="edit" tip="编辑" /><Button variant="primary">保存</Button></>}
/>`,
          render: () => {
            const [open, setOpen] = React.useState(false);
            return (
              <>
                <Button onClick={() => setOpen(true)}>查看订单</Button>
                <Drawer
                  open={open}
                  onClose={() => setOpen(false)}
                  title="订单 #L-24108"
                  extra={
                    <>
                      <Button icon="copy" size="sm" tip="复制订单号" />
                      <Button icon="download" size="sm" tip="导出" />
                      <Button size="sm" variant="primary">
                        保存
                      </Button>
                    </>
                  }
                  footer={
                    <Row gap={8}>
                      <Button variant="ghost" onClick={() => setOpen(false)}>
                        关闭
                      </Button>
                    </Row>
                  }
                >
                  <p>订单金额 · ¥ 1,280</p>
                  <p>下单时间 · 2026-04-19 14:32</p>
                  <p>支付方式 · 微信支付</p>
                </Drawer>
              </>
            );
          },
        },
        {
          id: "placement",
          title: "四个方向",
          description: "placement 控制滑出方向;top / bottom 用 size 控高度。",
          code: `<Drawer placement="left" size={320} />
<Drawer placement="top" size={240} />`,
          render: () => (
            <Row>
              {(["left", "right", "top", "bottom"] as const).map((p) => (
                <Button
                  key={p}
                  onClick={() => {
                    setPlacement(p);
                    setPlacementOpen(true);
                  }}
                >
                  {p}
                </Button>
              ))}
              <Drawer
                open={placementOpen}
                onClose={() => setPlacementOpen(false)}
                placement={placement}
                title={`placement="${placement}"`}
              >
                一个从 {placement} 方向滑出的抽屉。
              </Drawer>
            </Row>
          ),
        },
        {
          id: "no-mask",
          title: "无遮罩 (mask={false})",
          description: "关闭遮罩的抽屉不阻塞页面其他交互,适合辅助面板。",
          code: `<Drawer mask={false} />`,
          render: () => {
            const [open, setOpen] = React.useState(false);
            return (
              <>
                <Button onClick={() => setOpen(true)}>打开无遮罩抽屉</Button>
                <Drawer
                  open={open}
                  onClose={() => setOpen(false)}
                  mask={false}
                  placement="right"
                  title="辅助面板"
                >
                  抽屉出现时页面其他部分仍然可点击。
                </Drawer>
              </>
            );
          },
        },
      ]}
      api={[
        {
          title: "Drawer",
          rows: [
            { prop: "open", description: "可见", type: "boolean", required: true },
            { prop: "onClose", description: "关闭回调", type: "() => void" },
            { prop: "placement", description: "出现位置", type: `"left" | "right" | "top" | "bottom"`, default: `"right"` },
            { prop: "size", description: "宽度(左右)或高度(上下)", type: "number | string", default: "380" },
            { prop: "title / footer / children", description: "头/脚/主体", type: "ReactNode" },
            { prop: "extra", description: "标题右侧的附加操作区", type: "ReactNode" },
            { prop: "mask", description: "是否渲染遮罩", type: "boolean", default: "true" },
            { prop: "maskClosable", description: "点击遮罩关闭", type: "boolean", default: "true" },
            { prop: "keyboard", description: "Esc 关闭", type: "boolean", default: "true" },
            { prop: "closable", description: "右上角 ×", type: "boolean", default: "true" },
            { prop: "closeIcon", description: "自定义关闭图标", type: "ReactNode" },
            { prop: "destroyOnClose", description: "关闭时卸载子树", type: "boolean", default: "false" },
            { prop: "afterOpenChange", description: "动画结束回调", type: "(open: boolean) => void" },
            { prop: "zIndex", description: "覆盖 z-index", type: "number" },
          ],
        },
      ]}
    />
  );
};

export default defineSection({
  id: "drawer",
  group: "反馈",
  order: 20,
  label: "Drawer 抽屉",
  eyebrow: "FEEDBACK",
  title: "Drawer 抽屉",
  desc: "从屏幕边缘滑出的浮层。",
  Component: SectionDrawer,
});
