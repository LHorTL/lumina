import * as React from "react";
import { Button, DeleteOutlined, ICON_NAMES, Icon, Input, LoadingOutlined, message, StarFilled, Tag } from "lumina";
import { DocPage } from "../docs";
import { Row } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

/** 提供搜索与滚动边界的完整图标画廊。 */
const IconGallery: React.FC = () => {
  const [query, setQuery] = React.useState("");
  const filteredNames = React.useMemo(
    () => ICON_NAMES.filter((name) => name.toLowerCase().includes(query.trim().toLowerCase())),
    [query]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
      <Row gap={8}>
        <Input
          leadingIcon="search"
          allowClear
          value={query}
          onValueChange={setQuery}
          placeholder={`搜索 ${ICON_NAMES.length} 枚图标`}
          style={{ flex: "1 1 260px" }}
        />
        <Tag tone="info">{filteredNames.length} / {ICON_NAMES.length}</Tag>
      </Row>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(92px, 1fr))",
          gap: 6,
          maxHeight: 360,
          overflowY: "auto",
          padding: 4,
        }}
      >
        {filteredNames.map((name) => (
          <Button
            key={name}
            variant="ghost"
            onClick={() => {
              navigator.clipboard?.writeText(name);
              message.success(`已复制 "${name}"`);
            }}
            style={{
              width: "100%",
              height: 68,
              padding: 8,
              flexDirection: "column",
              gap: 6,
              fontFamily: "var(--font-mono)",
              fontSize: 10,
            }}
          >
            <Icon name={name} size={18} />
            <span>{name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

const SectionIcon: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={
      <>
        <p>统一的图标集,所有图标继承当前文字颜色。共 {ICON_NAMES.length} 枚。</p>
      </>
    }
    demos={[
      {
        id: "basic",
        title: "基础用法",
        description: "通过 name 指定图标,size 控制尺寸,stroke 控制描边粗细。",
        code: `<Icon name="search" size={16} />
<Icon name="heart" size={20} stroke={1.5} />`,
        render: () => (
          <Row>
            <Icon name="search" size={16} />
            <Icon name="heart" size={20} stroke={1.5} />
            <Icon name="star" size={24} />
            <Icon name="bell" size={28} stroke={2.5} />
          </Row>
        ),
      },
      {
        id: "named",
        title: "命名图标组件",
        description: "Outlined / Filled 命名组件与 Icon 共用同一入口，也支持对应名称的包子路径。",
        code: `import { DeleteOutlined } from "@fangxinyan/lumina/DeleteOutlined";
import { LoadingOutlined } from "@fangxinyan/lumina/LoadingOutlined";
import { StarFilled } from "@fangxinyan/lumina/StarFilled";

<DeleteOutlined aria-label="删除" />
<LoadingOutlined aria-label="加载中" />
<StarFilled aria-label="收藏" />`,
        render: () => (
          <Row>
            <DeleteOutlined aria-label="删除" size={20} />
            <LoadingOutlined aria-label="加载中" size={20} />
            <StarFilled aria-label="收藏" size={20} />
          </Row>
        ),
      },
      {
        id: "all",
        title: "全部图标",
        span: 2,
        description: "点击图标可复制名称。",
        render: () => <IconGallery />,
      },
    ]}
    api={[
      {
        title: "Icon",
        rows: [
          { prop: "name", description: "图标名", type: "IconName", required: true },
          { prop: "size", description: "尺寸 (px)", type: "number", default: "16" },
          { prop: "stroke", description: "描边粗细", type: "number", default: "2" },
          { prop: "title", description: "语义图标的可访问标题；省略时默认作为装饰图标", type: "string" },
        ],
      },
      {
        title: "NamedIconProps",
        rows: [
          { prop: "size", description: "尺寸", type: "number | string", default: `"1em"` },
          { prop: "spin", description: "旋转动画", type: "boolean" },
          { prop: "rotate", description: "静态旋转角度", type: "number" },
        ],
      },
    ]}
  />
);

export default defineSection({
  id: "icon",
  group: "通用",
  order: 20,
  label: "Icon 图标",
  eyebrow: "GENERAL",
  title: "Icon 图标",
  desc: "线性图标集,继承当前文字颜色,可调整尺寸与描边。",
  Component: SectionIcon,
});
