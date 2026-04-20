import * as React from "react";
import { Avatar, Table, Tag } from "lumina";
import { DocPage } from "../docs";
import { defineSection, type SectionCtx } from "./_types";

const SectionTable: React.FC<SectionCtx> = () => {
  const data = [
    { id: 1, name: "金伟", role: "设计", status: "在线", joined: "2024-03-12" },
    { id: 2, name: "陆希", role: "研发", status: "忙碌", joined: "2024-05-28" },
    { id: 3, name: "马可", role: "产品", status: "离线", joined: "2023-11-04" },
    { id: 4, name: "周妍", role: "研发", status: "在线", joined: "2025-01-20" },
  ];
  return (
    <DocPage
      whenToUse={<p>用于结构化的数据展示。需要复杂功能时请使用 Table Pro。</p>}
      demos={[
        {
          id: "basic",
          title: "基础表格",
          span: 2,
          code: `<Table rowKey="id" columns={[...]} data={data} />`,
          render: () => (
            <Table
              rowKey="id"
              columns={[
                {
                  key: "name",
                  title: "姓名",
                  dataIndex: "name",
                  render: (v) => (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <Avatar alt={String(v)} size="sm" /> {v}
                    </span>
                  ),
                },
                { key: "role", title: "部门", dataIndex: "role", render: (v) => <Tag tone="accent">{v}</Tag> },
                {
                  key: "status",
                  title: "状态",
                  dataIndex: "status",
                  render: (v) => (
                    <Tag tone={v === "在线" ? "success" : v === "忙碌" ? "warning" : "neutral"} dot>
                      {v}
                    </Tag>
                  ),
                },
                { key: "joined", title: "加入时间", dataIndex: "joined" },
              ]}
              data={data}
            />
          ),
        },
        {
          id: "variants",
          title: "样式变体",
          span: 2,
          description: "三种视觉变体:striped (条纹)、embossed (凸起)、cards (卡片行)。",
          code: `<Table variant="striped" ... />
<Table variant="embossed" ... />
<Table variant="cards" ... />`,
          render: () => (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Table
                rowKey="id"
                variant="striped"
                columns={[
                  { key: "name", title: "条纹", dataIndex: "name" },
                  { key: "role", title: "部门", dataIndex: "role" },
                ]}
                data={data}
              />
            </div>
          ),
        },
      ]}
      api={[
        {
          title: "Table",
          rows: [
            { prop: "columns", description: "列定义", type: "TableColumn[]", required: true },
            { prop: "data", description: "数据数组", type: "Row[]", required: true },
            { prop: "rowKey", description: "行键", type: "string | (row) => key" },
            { prop: "variant", description: "视觉变体", type: `"default" | "striped" | "embossed" | "cards"`, default: `"default"` },
            { prop: "selectable", description: "显示选择列", type: "boolean", default: "false" },
            { prop: "selected / onSelect", description: "受控选中", type: "(string | number)[]" },
            { prop: "sortKey / sortDir / onSort", description: "受控排序", type: "—" },
            { prop: "onRowClick", description: "点击行", type: "(row, i) => void" },
          ],
        },
      ]}
    />
  );
};

export default defineSection({
  id: "table",
  group: "数据展示",
  order: 80,
  label: "Table 表格",
  eyebrow: "DATA DISPLAY",
  title: "Table 表格",
  desc: "结构化数据展示。",
  Component: SectionTable,
});
