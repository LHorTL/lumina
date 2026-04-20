import * as React from "react";
import { Button, Divider, Empty, Icon } from "lumina";
import { DocPage } from "../docs";
import { defineSection, type SectionCtx } from "./_types";

const SectionEmpty: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={<p>用于列表、表格、页面无数据时的占位。</p>}
    demos={[
      {
        id: "basic",
        title: "基础",
        span: 2,
        code: `<Empty title="暂无项目" description="创建一个开始吧" action={<Button>新建</Button>} />`,
        render: () => (
          <Empty
            icon={<Icon name="folder" size={32} />}
            title="暂无项目"
            description="创建一个开始吧"
            action={
              <Button variant="primary" icon="plus">
                新建
              </Button>
            }
          />
        ),
      },
      {
        id: "subtle",
        title: "Subtle 变体",
        description: "去掉凹陷图标框,用于嵌入已有卡片/对话框中。",
        span: 2,
        code: `<Empty variant="subtle" icon={<Icon name="search" size={28} />} title="未找到结果" />`,
        render: () => (
          <Empty
            variant="subtle"
            icon={<Icon name="search" size={28} />}
            title="未找到结果"
            description="换个关键词试试"
          />
        ),
      },
      {
        id: "size",
        title: "尺寸",
        description: "sm 适合列表内嵌,md 是默认,lg 用作整页占位。",
        span: 2,
        code: `<Empty size="sm" title="暂无数据" />
<Empty size="md" title="暂无数据" />
<Empty size="lg" title="暂无数据" />`,
        render: () => (
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", alignItems: "center" }}>
            <Empty size="sm" icon={<Icon name="file" size={20} />} title="sm" description="列表内嵌" />
            <Divider direction="vertical" style={{ height: "70%", alignSelf: "center" }} />
            <Empty size="md" icon={<Icon name="file" size={28} />} title="md" description="默认尺寸" />
            <Divider direction="vertical" style={{ height: "70%", alignSelf: "center" }} />
            <Empty size="lg" icon={<Icon name="file" size={36} />} title="lg" description="整页占位" />
          </div>
        ),
      },
    ]}
    api={[
      {
        title: "Empty",
        rows: [
          { prop: "title", description: "标题", type: "ReactNode", default: `"暂无内容"` },
          { prop: "description", description: "描述", type: "ReactNode" },
          { prop: "icon", description: "图标", type: "ReactNode" },
          { prop: "action", description: "底部操作", type: "ReactNode" },
          { prop: "size", description: "尺寸", type: `"sm" | "md" | "lg"`, default: `"md"` },
          { prop: "variant", description: "样式", type: `"default" | "subtle"`, default: `"default"` },
        ],
      },
    ]}
  />
);

export default defineSection({
  id: "empty",
  group: "反馈",
  order: 70,
  label: "Empty 空状态",
  eyebrow: "FEEDBACK",
  title: "Empty 空状态",
  desc: "列表、页面或容器无数据时的占位。",
  Component: SectionEmpty,
});
