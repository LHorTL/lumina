import * as React from "react";
import { Button, Icon, List, Tag } from "lumina";
import { DocPage } from "../docs";
import { defineSection, type SectionCtx } from "./_types";

/** 演示列表项点击语义和无分隔线样式。 */
const InteractiveListDemo: React.FC = () => {
  const [selected, setSelected] = React.useState("尚未选择");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Tag tone="info">当前：{selected}</Tag>
      <List
        dividers={false}
        items={[
          {
            key: "download",
            avatar: <Icon name="download" size={18} />,
            title: "下载构建产物",
            description: "点击整行触发操作",
            onClick: () => setSelected("下载构建产物"),
          },
          {
            key: "share",
            avatar: <Icon name="upload" size={18} />,
            title: "分享预览链接",
            description: "键盘聚焦后也可激活",
            onClick: () => setSelected("分享预览链接"),
          },
        ]}
      />
    </div>
  );
};

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
      {
        id: "interactive",
        title: "可点击与无分隔线",
        description: "提供 onClick 时整行获得按钮语义；dividers={false} 适合更轻量的操作列表。",
        code: `<List
  dividers={false}
  items={[{ title: "下载构建产物", onClick: handleClick }]}
/>`,
        render: () => <InteractiveListDemo />,
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
  order: 80,
  label: "List 列表",
  eyebrow: "DATA DISPLAY",
  title: "List 列表",
  desc: "承载一组结构化的同质化数据。",
  Component: SectionList,
});
