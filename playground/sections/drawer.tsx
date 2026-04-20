import * as React from "react";
import { Button, Drawer, Input, Switch, toast } from "lumina";
import { DocPage } from "../docs";
import { Field, Row } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

const SectionDrawer: React.FC<SectionCtx> = () => {
  const [d, setD] = React.useState(false);
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
                        toast.success("已创建");
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
      ]}
      api={[
        {
          title: "Drawer",
          rows: [
            { prop: "open", description: "可见", type: "boolean", required: true },
            { prop: "onClose", description: "关闭", type: "() => void" },
            { prop: "title", description: "标题", type: "ReactNode" },
            { prop: "placement", description: "出现位置", type: `"left" | "right" | "top" | "bottom"`, default: `"right"` },
            { prop: "size", description: "尺寸", type: "number | string", default: "380" },
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
