import * as React from "react";
import { Timeline, Icon } from "lumina";
import { DocPage, type ApiRow, type DocDemoSpec } from "../docs";
import { defineSection, type SectionCtx } from "./_types";

const timelineApi: ApiRow[] = [
  { prop: "items", type: "TimelineItemConfig[]", required: true, description: "时间线节点数组" },
  { prop: "pending", type: "boolean | ReactNode", default: "false", description: "显示末尾等待节点；true 显示默认 spinner，传 ReactNode 自定义" },
  { prop: "pendingContent", type: "ReactNode", default: '"加载中..."', description: "等待节点的文字内容" },
  { prop: "mode", type: '"left" | "right" | "alternate"', default: '"left"', description: "布局模式" },
  { prop: "reverse", type: "boolean", default: "false", description: "反转节点顺序" },
  { prop: "itemClassName / itemStyle", type: "string / CSSProperties", description: "透传到每个节点外层" },
  { prop: "contentClassName / contentStyle", type: "string / CSSProperties", description: "透传到每个内容槽" },
  { prop: "contentMinWidth", type: "CSSProperties['minWidth']", default: "0", description: "内容槽最小宽度，默认允许在 flex/grid 中收缩" },
  { prop: "dotClassName / dotStyle", type: "string / CSSProperties", description: "透传到每个圆点槽" },
  { prop: "dotOffset", type: "CSSProperties['marginTop']", default: "4", description: "圆点垂直偏移" },
  { prop: "dotAlign", type: '"start" | "center" | "end"', default: '"center"', description: "圆点在 head 列中的横向对齐" },
  { prop: "labelClassName / labelStyle", type: "string / CSSProperties", description: "透传到每个标签槽" },
];

const timelineItemApi: ApiRow[] = [
  { prop: "key", type: "string", description: "唯一标识" },
  { prop: "children", type: "ReactNode", description: "节点内容" },
  { prop: "label", type: "ReactNode", description: "对侧标签（alternate 模式下使用）" },
  { prop: "color", type: '"accent" | "success" | "warning" | "danger" | "info" | "muted"', default: '"accent"', description: "圆点颜色" },
  { prop: "dot", type: "ReactNode", description: "自定义圆点内容" },
  { prop: "className / style", type: "string / CSSProperties", description: "节点外层样式槽" },
  { prop: "contentClassName / contentStyle", type: "string / CSSProperties", description: "内容槽样式" },
  { prop: "dotClassName / dotStyle", type: "string / CSSProperties", description: "圆点槽样式" },
  { prop: "labelClassName / labelStyle", type: "string / CSSProperties", description: "标签槽样式" },
];

const SectionTimeline: React.FC<SectionCtx> = () => {
  const demos: DocDemoSpec[] = [
    {
      id: "basic",
      title: "基础用法",
      description: "最简单的时间线",
      code: `<Timeline
  items={[
    { children: "创建项目 2024-01-01" },
    { children: "初始化仓库 2024-01-05" },
    { children: "发布 v0.1.0 2024-02-01" },
    { children: "里程碑达成 2024-03-15" },
  ]}
/>`,
      render: () => (
        <Timeline
          items={[
            { children: "创建项目 2024-01-01" },
            { children: "初始化仓库 2024-01-05" },
            { children: "发布 v0.1.0 2024-02-01" },
            { children: "里程碑达成 2024-03-15" },
          ]}
        />
      ),
    },
    {
      id: "colors",
      title: "彩色节点",
      description: "通过 color 区分不同状态",
      code: `<Timeline
  items={[
    { children: "成功部署", color: "success" },
    { children: "告警通知", color: "warning" },
    { children: "构建失败", color: "danger" },
    { children: "信息更新", color: "info" },
  ]}
/>`,
      render: () => (
        <Timeline
          items={[
            { children: "成功部署", color: "success" },
            { children: "告警通知", color: "warning" },
            { children: "构建失败", color: "danger" },
            { children: "信息更新", color: "info" },
          ]}
        />
      ),
    },
    {
      id: "pending",
      title: "等待状态",
      description: "pending 属性展示加载中的末尾节点，适合表示流程尚未结束",
      code: `<Timeline
  pending
  pendingContent="部署中..."
  items={[
    { children: "提交代码 10:21", color: "success" },
    { children: "代码审查通过 10:45", color: "success" },
    { children: "CI 构建完成 11:02", color: "success" },
  ]}
/>`,
      render: () => (
        <Timeline
          pending
          pendingContent="部署中..."
          items={[
            { children: "提交代码 10:21", color: "success" },
            { children: "代码审查通过 10:45", color: "success" },
            { children: "CI 构建完成 11:02", color: "success" },
          ]}
        />
      ),
    },
    {
      id: "custom-pending",
      title: "自定义等待图标",
      description: "pending 传入 ReactNode 自定义等待指示器",
      code: `<Timeline
  pending={<Icon name="clock" size={14} />}
  pendingContent="等待审批..."
  items={[
    { children: "提交申请" },
    { children: "部门审核通过" },
  ]}
/>`,
      render: () => (
        <Timeline
          pending={<Icon name="clock" size={14} />}
          pendingContent="等待审批..."
          items={[
            { children: "提交申请" },
            { children: "部门审核通过" },
          ]}
        />
      ),
    },
    {
      id: "custom-dot",
      title: "自定义圆点",
      description: "通过 dot 字段自定义每个节点的图标",
      code: `<Timeline
  items={[
    { children: "项目创建", dot: <Icon name="folder" size={14} /> },
    { children: "代码提交", dot: <Icon name="code" size={14} /> },
    { children: "发布上线", dot: <Icon name="zap" size={14} /> },
  ]}
/>`,
      render: () => (
        <Timeline
          items={[
            { children: "项目创建", dot: <Icon name="folder" size={14} /> },
            { children: "代码提交", dot: <Icon name="code" size={14} /> },
            { children: "发布上线", dot: <Icon name="zap" size={14} /> },
          ]}
        />
      ),
    },
    {
      id: "alternate",
      title: "交替模式",
      description: "mode=\"alternate\" 让内容交替出现在两侧",
      span: 2,
      code: `<Timeline
  mode="alternate"
  items={[
    { children: "创建项目", label: "2024-01" },
    { children: "完成设计稿", label: "2024-02" },
    { children: "开发完成", label: "2024-03" },
    { children: "发布上线", label: "2024-04" },
  ]}
/>`,
      render: () => (
        <Timeline
          mode="alternate"
          items={[
            { children: "创建项目", label: "2024-01" },
            { children: "完成设计稿", label: "2024-02" },
            { children: "开发完成", label: "2024-03" },
            { children: "发布上线", label: "2024-04" },
          ]}
        />
      ),
    },
    {
      id: "reverse",
      title: "倒序",
      description: "reverse 属性将时间线反转，最新的事件在最上面",
      code: `<Timeline
  reverse
  pending
  pendingContent="进行中..."
  items={[
    { children: "第一步：需求确认", color: "success" },
    { children: "第二步：开发中", color: "success" },
    { children: "第三步：测试", color: "warning" },
  ]}
/>`,
      render: () => (
        <Timeline
          reverse
          pending
          pendingContent="进行中..."
          items={[
            { children: "第一步：需求确认", color: "success" },
            { children: "第二步：开发中", color: "success" },
            { children: "第三步：测试", color: "warning" },
          ]}
        />
      ),
    },
    {
      id: "slot-style",
      title: "槽位样式",
      description: "item / content / dot / label 都可以拿到样式入口；content 默认 min-width: 0，长内容能在弹性容器里正确收缩。",
      span: 2,
      code: `<Timeline
  contentMinWidth={0}
  dotOffset={4}
  items={[
    {
      children: "很长的任务标题...",
      contentStyle: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
      dotStyle: { boxShadow: "var(--neu-shadow-lift)" },
    },
  ]}
/>`,
      render: () => (
        <div style={{ width: 360, maxWidth: "100%" }}>
          <Timeline
            contentMinWidth={0}
            dotOffset={4}
            itemStyle={{ minWidth: 0 }}
            contentStyle={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            dotStyle={{ boxShadow: "var(--neu-shadow-lift)" }}
            items={[
              {
                label: "09:12",
                children: "同步来自实际业务的超长任务名称：角色资料、心法资源、外观记录与筛选状态全部完成",
                color: "success",
              },
              {
                label: "09:15",
                children: "生成报告并写入本地缓存，后续可直接从详情页查看",
                dot: <Icon name="checkCircleFilled" size={14} />,
                dotStyle: { color: "var(--success)" },
              },
              {
                label: "09:18",
                children: "等待远端任务返回",
                color: "muted",
                contentStyle: { color: "var(--fg-muted)" },
              },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <DocPage
      whenToUse={
        <ul>
          <li>展示时间流程或操作历史</li>
          <li>需要告知用户当前进度及等待状态</li>
          <li>按时间顺序展示一系列事件</li>
        </ul>
      }
      demos={demos}
      api={[
        { title: "Timeline", rows: timelineApi },
        { title: "TimelineItemConfig", rows: timelineItemApi },
      ]}
    />
  );
};

export default defineSection({
  id: "timeline",
  group: "数据展示",
  order: 75,
  label: "Timeline 时间线",
  eyebrow: "DATA DISPLAY",
  title: "Timeline 时间线",
  desc: "垂直时间线，支持等待状态、自定义圆点、交替布局",
  Component: SectionTimeline,
});
