import * as React from "react";
import { Pagination } from "lumina";
import { DocPage } from "../docs";
import { defineSection, type SectionCtx } from "./_types";

const SectionPagination: React.FC<SectionCtx> = () => {
  const [page, setPage] = React.useState(3);
  const [jumpPage, setJumpPage] = React.useState(1);
  const [sizePage, setSizePage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [fullPage, setFullPage] = React.useState(1);
  const [fullPageSize, setFullPageSize] = React.useState(20);

  return (
    <DocPage
      whenToUse={
        <p>
          当单页数据量较大、需要分段展示时使用。Pagination 与 Table / List 等组件常结合使用。
        </p>
      }
      demos={[
        {
          id: "basic",
          title: "基础用法",
          span: 2,
          code: `<Pagination total={85} page={page} onChange={setPage} />`,
          render: () => (
            <Pagination total={85} page={page} onChange={setPage} />
          ),
        },
        {
          id: "quick-jumper",
          title: "快速跳转",
          description: "启用 showQuickJumper,输入页码按 Enter 跳转,超出范围会被夹紧。",
          span: 2,
          code: `<Pagination
  total={250}
  page={jumpPage}
  onChange={setJumpPage}
  showQuickJumper
/>`,
          render: () => (
            <Pagination
              total={250}
              page={jumpPage}
              onChange={setJumpPage}
              showQuickJumper
            />
          ),
        },
        {
          id: "size-changer",
          title: "每页条数",
          description: "启用 showSizeChanger,切换条数会回到第 1 页并触发 onShowSizeChange + onChange(1)。",
          span: 2,
          code: `<Pagination
  total={320}
  page={sizePage}
  pageSize={pageSize}
  onChange={setSizePage}
  showSizeChanger
  onShowSizeChange={(_cur, size) => setPageSize(size)}
/>`,
          render: () => (
            <Pagination
              total={320}
              page={sizePage}
              pageSize={pageSize}
              onChange={setSizePage}
              showSizeChanger
              onShowSizeChange={(_cur, size) => setPageSize(size)}
            />
          ),
        },
        {
          id: "full-featured",
          title: "跳转 + 条数 + 自定义选项",
          description: "同时启用两项,并通过 pageSizeOptions 自定义候选条数。",
          span: 2,
          code: `<Pagination
  total={999}
  page={fullPage}
  pageSize={fullPageSize}
  onChange={setFullPage}
  showQuickJumper
  showSizeChanger
  pageSizeOptions={[20, 50, 100, 200]}
  onShowSizeChange={(_cur, size) => setFullPageSize(size)}
/>`,
          render: () => (
            <Pagination
              total={999}
              page={fullPage}
              pageSize={fullPageSize}
              onChange={setFullPage}
              showQuickJumper
              showSizeChanger
              pageSizeOptions={[20, 50, 100, 200]}
              onShowSizeChange={(_cur, size) => setFullPageSize(size)}
            />
          ),
        },
      ]}
      api={[
        {
          title: "Pagination",
          rows: [
            { prop: "total", description: "数据总条数", type: "number", required: true },
            { prop: "pageSize", description: "每页条数", type: "number", default: "10" },
            { prop: "page / defaultPage", description: "受控/初始页码", type: "number", default: "1" },
            { prop: "onChange", description: "页码变化回调", type: "(page: number) => void" },
            { prop: "siblings", description: "当前页两侧可见的页码数", type: "number", default: "1" },
            {
              prop: "showQuickJumper",
              description: "显示跳转输入框,按 Enter 跳转",
              type: "boolean",
              default: "false",
            },
            {
              prop: "showSizeChanger",
              description: "显示每页条数选择器,切换后回到第 1 页",
              type: "boolean",
              default: "false",
            },
            {
              prop: "pageSizeOptions",
              description: "每页条数候选项",
              type: "number[]",
              default: "[10, 20, 50, 100]",
            },
            {
              prop: "onShowSizeChange",
              description: "每页条数变更回调",
              type: "(current: number, size: number) => void",
            },
          ],
        },
      ]}
    />
  );
};

export default defineSection({
  id: "pagination",
  group: "数据展示",
  order: 115,
  label: "Pagination 分页",
  eyebrow: "DATA DISPLAY",
  title: "Pagination 分页",
  desc: "分页控件,支持快速跳转与每页条数切换。",
  Component: SectionPagination,
});
