import * as React from "react";
import {
  Avatar,
  Button,
  Divider,
  Input,
  Pagination,
  Progress,
  Select,
  TablePro,
  Tag,
  toast,
} from "lumina";
import { DocPage } from "../docs";
import { defineSection, type SectionCtx } from "./_types";

const SectionTablePro: React.FC<SectionCtx> = () => {
  const raw = React.useMemo(
    () => [
      { id: 1, name: "金伟", role: "设计", status: "在线", level: "P7", progress: 92 },
      { id: 2, name: "陆希", role: "研发", status: "忙碌", level: "P6", progress: 71 },
      { id: 3, name: "马可", role: "产品", status: "离线", level: "P8", progress: 45 },
      { id: 4, name: "周妍", role: "研发", status: "在线", level: "P5", progress: 88 },
      { id: 5, name: "何秋", role: "运营", status: "在线", level: "P6", progress: 63 },
      { id: 6, name: "林夕", role: "研发", status: "忙碌", level: "P7", progress: 76 },
      { id: 7, name: "白露", role: "设计", status: "在线", level: "P5", progress: 54 },
      { id: 8, name: "吴桐", role: "产品", status: "离线", level: "P6", progress: 40 },
    ],
    []
  );
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [selected, setSelected] = React.useState<(string | number)[]>([]);
  const [sortKey, setSortKey] = React.useState("id");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");
  const [page, setPage] = React.useState(1);
  const pageSize = 4;

  const filtered = React.useMemo(() => {
    let d = raw;
    if (search) d = d.filter((r) => r.name.includes(search));
    if (roleFilter !== "all") d = d.filter((r) => r.role === roleFilter);
    return [...d].sort((a, b) => {
      const A = (a as any)[sortKey];
      const B = (b as any)[sortKey];
      const cmp = A > B ? 1 : A < B ? -1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [raw, search, roleFilter, sortKey, sortDir]);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <DocPage
      whenToUse={<p>带工具栏、搜索、筛选、排序、多选、分页的全功能表格。</p>}
      demos={[
        {
          id: "full",
          title: "全功能",
          span: 2,
          code: `<TablePro
  rowKey="id" data={paged} columns={...}
  selectable selected={selected} onSelect={setSelected}
  sortKey={sortKey} sortDir={sortDir} onSort={...}
  toolbar={<Input ... /> <Select ... />}
  actions={<Button>新增</Button>}
  footer={<Pagination ... />}
/>`,
          render: () => (
            <TablePro
              rowKey="id"
              data={paged}
              selectable
              selected={selected}
              onSelect={setSelected}
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={(k) => {
                if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                else {
                  setSortKey(k);
                  setSortDir("asc");
                }
              }}
              columns={[
                {
                  key: "name",
                  title: "姓名",
                  dataIndex: "name",
                  sortable: true,
                  render: (v) => (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <Avatar alt={String(v)} size="sm" /> {v}
                    </span>
                  ),
                },
                { key: "role", title: "部门", dataIndex: "role", sortable: true, render: (v) => <Tag tone="accent">{v}</Tag> },
                { key: "level", title: "级别", dataIndex: "level", sortable: true },
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
                {
                  key: "progress",
                  title: "完成度",
                  dataIndex: "progress",
                  sortable: true,
                  render: (v) => (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 120 }}>
                      <div style={{ flex: 1 }}>
                        <Progress value={Number(v)} size="sm" />
                      </div>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, width: 32, textAlign: "right" }}>
                        {v}%
                      </span>
                    </div>
                  ),
                },
              ]}
              toolbar={
                <>
                  <div style={{ width: 200 }}>
                    <Input placeholder="搜索成员..." leadingIcon="search" value={search} onChange={setSearch} />
                  </div>
                  <div style={{ width: 140 }}>
                    <Select
                      value={roleFilter}
                      onChange={setRoleFilter}
                      options={[
                        { value: "all", label: "全部" },
                        { value: "设计", label: "设计" },
                        { value: "研发", label: "研发" },
                        { value: "产品", label: "产品" },
                        { value: "运营", label: "运营" },
                      ]}
                    />
                  </div>
                </>
              }
              actions={
                <>
                  {selected.length > 0 && (
                    <>
                      <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>已选 {selected.length}</span>
                      <Button
                        size="sm"
                        variant="danger"
                        icon="trash"
                        onClick={() => {
                          toast.error(`已删除 ${selected.length} 条`);
                          setSelected([]);
                        }}
                      >
                        批量删除
                      </Button>
                      <Divider direction="vertical" />
                    </>
                  )}
                  <Button size="sm" variant="primary" icon="plus">
                    新增
                  </Button>
                </>
              }
              footer={
                <Pagination total={filtered.length} pageSize={pageSize} page={page} onChange={setPage} />
              }
            />
          ),
        },
      ]}
      api={[
        {
          title: "TablePro",
          rows: [
            { prop: "...", description: "继承自 Table 全部 props", type: "TableProps" },
            { prop: "toolbar", description: "工具栏内容", type: "ReactNode" },
            { prop: "actions", description: "工具栏右侧操作", type: "ReactNode" },
            { prop: "footer", description: "底部 (一般放 Pagination)", type: "ReactNode" },
            { prop: "title", description: "工具栏标题", type: "ReactNode" },
          ],
        },
      ]}
    />
  );
};

export default defineSection({
  id: "tablepro",
  group: "数据展示",
  order: 90,
  label: "Table Pro",
  eyebrow: "DATA DISPLAY",
  title: "Table Pro",
  desc: "带工具栏 / 搜索 / 筛选 / 排序 / 多选 / 分页的全功能表格。",
  Component: SectionTablePro,
});
