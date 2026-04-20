import * as React from "react";
import { Avatar } from "lumina";
import { DocPage } from "../docs";
import { Row } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

const SectionAvatar: React.FC<SectionCtx> = () => (
  <DocPage
    whenToUse={<p>用图像、首字母代表用户或事物。</p>}
    demos={[
      {
        id: "basic",
        title: "基础",
        description: "通过 alt 自动生成首字母。",
        code: `<Avatar alt="金伟" />
<Avatar alt="陆" size="lg" />`,
        render: () => (
          <Row>
            <Avatar alt="金" size="sm" />
            <Avatar alt="陆" />
            <Avatar alt="马" size="lg" />
            <Avatar alt="ZY" size="xl" />
            <Avatar alt="周" size={64} />
          </Row>
        ),
      },
      {
        id: "shape",
        title: "方形头像",
        description: "shape=\"square\" 使用圆角方形,尺寸变化时圆角跟随变化。",
        code: `<Avatar alt="金" shape="square" />
<Avatar alt="陆" shape="square" size="lg" />`,
        render: () => (
          <Row>
            <Avatar alt="金" shape="square" size="sm" />
            <Avatar alt="陆" shape="square" />
            <Avatar alt="马" shape="square" size="lg" />
            <Avatar alt="Z" shape="square" size="xl" />
            <Avatar alt="方" shape="square" status="online" />
          </Row>
        ),
      },
      {
        id: "status",
        title: "状态",
        description: "在右下角显示状态点。",
        code: `<Avatar alt="金" status="online" />
<Avatar alt="陆" status="busy" />`,
        render: () => (
          <Row>
            <Avatar alt="金" status="online" />
            <Avatar alt="陆" status="busy" />
            <Avatar alt="马" status="away" />
            <Avatar alt="周" status="offline" />
          </Row>
        ),
      },
    ]}
    api={[
      {
        title: "Avatar",
        rows: [
          { prop: "src", description: "图片 URL", type: "string" },
          { prop: "alt", description: "替代文本/首字母来源", type: "string" },
          { prop: "initials", description: "自定义首字母", type: "string" },
          { prop: "size", description: "尺寸", type: `number | "sm" | "md" | "lg" | "xl"`, default: `"md"` },
          { prop: "shape", description: "形状", type: `"circle" | "square"`, default: `"circle"` },
          { prop: "status", description: "状态点", type: `"online" | "busy" | "away" | "offline"` },
        ],
      },
    ]}
  />
);

export default defineSection({
  id: "avatar",
  group: "数据展示",
  order: 40,
  label: "Avatar 头像",
  eyebrow: "DATA DISPLAY",
  title: "Avatar 头像",
  desc: "用图像、首字母代表用户或事物。",
  Component: SectionAvatar,
});
