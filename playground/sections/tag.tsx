import * as React from "react";
import { Button, Tag } from "lumina";
import { DocPage } from "../docs";
import { Row } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

const RemovableTagsDemo: React.FC = () => {
  const [tags, setTags] = React.useState([
    { id: "1", label: "设计", tone: "accent" as const },
    { id: "2", label: "前端", tone: "info" as const },
    { id: "3", label: "Lumina", tone: "success" as const },
    { id: "4", label: "Electron", tone: "warning" as const },
  ]);
  return (
    <Row>
      {tags.length === 0 ? (
        <Button
          size="sm"
          variant="ghost"
          icon="plus"
          onClick={() =>
            setTags([
              { id: "1", label: "设计", tone: "accent" },
              { id: "2", label: "前端", tone: "info" },
              { id: "3", label: "Lumina", tone: "success" },
              { id: "4", label: "Electron", tone: "warning" },
            ])
          }
        >
          重置
        </Button>
      ) : (
        tags.map((t) => (
          <Tag
            key={t.id}
            tone={t.tone}
            removable
            onRemove={() => setTags((list) => list.filter((x) => x.id !== t.id))}
          >
            {t.label}
          </Tag>
        ))
      )}
    </Row>
  );
};

const SectionTag: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={<p>标记关键词、状态或分类。</p>}
    demos={[
      {
        id: "tone",
        title: "语气",
        code: `<Tag>Default</Tag>
<Tag tone="accent">Accent</Tag>
<Tag tone="success">Success</Tag>`,
        render: () => (
          <Row>
            <Tag>Default</Tag>
            <Tag tone="accent">Accent</Tag>
            <Tag tone="info">Info</Tag>
            <Tag tone="success">Success</Tag>
            <Tag tone="warning">Warning</Tag>
            <Tag tone="danger">Danger</Tag>
          </Row>
        ),
      },
      {
        id: "solid",
        title: "实心",
        code: `<Tag tone="accent" solid>Solid</Tag>`,
        render: () => (
          <Row>
            <Tag tone="accent" solid>Accent</Tag>
            <Tag tone="success" solid>Success</Tag>
            <Tag tone="warning" solid>Warning</Tag>
            <Tag tone="danger" solid>Danger</Tag>
          </Row>
        ),
      },
      {
        id: "dot",
        title: "圆点状态",
        description: "dot 渲染前置色块。",
        code: `<Tag tone="success" dot>在线</Tag>`,
        render: () => (
          <Row>
            <Tag tone="success" dot>在线</Tag>
            <Tag tone="warning" dot>忙碌</Tag>
            <Tag tone="danger" dot>异常</Tag>
            <Tag dot>离线</Tag>
          </Row>
        ),
      },
      {
        id: "removable",
        title: "可移除",
        description: "removable + onRemove 实现关闭按钮。",
        code: `<Tag removable onRemove={() => remove(t.id)}>{t.label}</Tag>`,
        render: () => <RemovableTagsDemo />,
      },
    ]}
    api={[
      {
        title: "Tag",
        rows: [
          { prop: "tone", description: "色调", type: `"neutral" | "accent" | "info" | "success" | "warning" | "danger"`, default: `"neutral"` },
          { prop: "solid", description: "实心填充", type: "boolean", default: "false" },
          { prop: "dot", description: "前置圆点", type: "boolean", default: "false" },
          { prop: "removable", description: "显示 ×", type: "boolean", default: "false" },
          { prop: "onRemove", description: "关闭回调", type: "() => void" },
        ],
      },
    ]}
  />
);

export default defineSection({
  id: "tag",
  group: "数据展示",
  order: 20,
  label: "Tag 标签",
  eyebrow: "DATA DISPLAY",
  title: "Tag 标签",
  desc: "标记关键词、状态或分类。",
  Component: SectionTag,
});
