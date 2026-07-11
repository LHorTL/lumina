import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Pagination } from "../src/components/Pagination";
import { Table } from "../src/components/Table";

afterEach(cleanup);

describe("分页边界", () => {
  it("归一化非法总数、页大小、页码与兄弟按钮数量", () => {
    render(<Pagination total={100} pageSize={0} page={Number.POSITIVE_INFINITY} siblings={Number.POSITIVE_INFINITY} />);
    expect(screen.getByText("共 100 条 · 第 1 / 10 页")).not.toBeNull();
    expect(screen.queryByRole("button", { name: /Infinity/ })).toBeNull();
  });

  it("远程非受控分页不会按当前页数据长度错误复位", () => {
    render(
      <Table
        columns={[{ key: "name", title: "名称", dataIndex: "name" }]}
        data={[{ name: "远程第五页" }]}
        pagination={{ mode: "remote", total: 100, pageSize: 10, defaultCurrent: 5 }}
      />
    );
    expect(screen.getByText("远程第五页")).not.toBeNull();
    expect(screen.getByText("共 100 条 · 第 5 / 10 页")).not.toBeNull();
  });
});
