import * as React from "react";
import { Button, Icon, List } from "lumina";
import { DocPage } from "../docs";
import { defineSection, type SectionCtx } from "./_types";

const SectionList: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={<p>承载一组结构化的同质化数据。</p>}
    demos={[
      {
        id: "basic",
        title: "基础列表",
        span: 2,
        code: `<List items={[{ key, title, description, avatar, actions }]} />`,
        render: () => (
          <List
            items={[
              {
                key: "1",
                avatar: <Icon name="folder" size={18} />,
                title: "设计系统",
                description: "42 个文件 · 更新于 2 小时前",
                actions: (
                  <Button size="sm" variant="ghost">
                    打开
                  </Button>
                ),
              },
              {
                key: "2",
                avatar: <Icon name="folder" size={18} />,
                title: "客户项目",
                description: "128 个文件 · 昨天",
              },
              {
                key: "3",
                avatar: <Icon name="file" size={18} />,
                title: "周报.md",
                description: "草稿 · 未发布",
              },
            ]}
          />
        ),
      },
    ]}
    api={[
      {
        title: "List",
        rows: [
          { prop: "items", description: "数据列表", type: "ListItem[]", required: true },
          { prop: "dividers", description: "项之间显示分隔线", type: "boolean", default: "true" },
        ],
      },
      {
        title: "ListItem",
        rows: [
          { prop: "key", description: "唯一键", type: "string", required: true },
          { prop: "title / description", description: "标题/描述", type: "ReactNode" },
          { prop: "avatar", description: "前置图标或头像", type: "ReactNode" },
          { prop: "actions", description: "右侧操作区", type: "ReactNode" },
          { prop: "onClick", description: "点击回调", type: "() => void" },
        ],
      },
    ]}
  />
);

export default defineSection({
  id: "list",
  group: "数据展示",
  order: 70,
  label: "List 列表",
  eyebrow: "DATA DISPLAY",
  title: "List 列表",
  desc: "承载一组结构化的同质化数据。",
  Component: SectionList,
});
