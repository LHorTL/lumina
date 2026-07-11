import * as React from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppShell, Sidebar, TitleBar } from "../src/components/AppShell";
import { Avatar } from "../src/components/Avatar";
import { Badge } from "../src/components/Badge";
import { Divider } from "../src/components/Divider";
import { Image } from "../src/components/Image";
import { Progress } from "../src/components/Progress";
import { Skeleton } from "../src/components/Skeleton";
import { Spin } from "../src/components/Spin";
import { Splitter } from "../src/components/Splitter";
import { StatusBar } from "../src/components/StatusBar";
import { Table } from "../src/components/Table";
import { Tag } from "../src/components/Tag";
import { Timeline } from "../src/components/Timeline";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("display component regressions", () => {
  it("keeps fallback row keys stable across local pagination", () => {
    const rows = [{ name: "A" }, { name: "B" }, { name: "C" }];
    const onChange = vi.fn();
    render(
      <Table
        columns={[{ key: "name", title: "Name", dataIndex: "name" }]}
        data={rows}
        pagination={{ defaultCurrent: 2, pageSize: 1 }}
        rowSelection={{ onChange }}
      />
    );

    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[checkboxes.length - 1]);

    expect(onChange).toHaveBeenCalledWith([1], [rows[1]]);
  });

  it("emits controlled column filters through the unified change callback", () => {
    const onChange = vi.fn();
    render(
      <Table
        columns={[{
          key: "kind",
          title: "Kind",
          dataIndex: "kind",
          filters: [{ text: "A", value: "a" }],
          filteredValue: [],
        }]}
        data={[{ kind: "a" }, { kind: "b" }]}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "筛选列" }));
    const dialog = screen.getByRole("dialog", { name: "列筛选" });
    fireEvent.click(within(dialog).getByRole("checkbox"));
    fireEvent.click(within(dialog).getByRole("button", { name: "确定" }));

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      action: "filter",
      filters: { kind: ["a"] },
      currentData: [{ kind: "a" }],
    }));
  });

  it("supports non-draggable title bars and nested accessible sidebars", () => {
    const onExpandedKeysChange = vi.fn();
    render(
      <AppShell
        titleBar={<TitleBar draggable={false} title="Lumina" />}
        sidebar={(
          <Sidebar
            activeKey="child"
            onExpandedKeysChange={onExpandedKeysChange}
            items={[{ key: "parent", label: "父级", children: [{ key: "child", label: "子级" }] }]}
          />
        )}
      >
        content
      </AppShell>
    );

    expect(document.querySelector<HTMLElement>(".titlebar")?.classList.contains("no-drag")).toBe(true);
    expect(screen.getByRole("button", { name: "子级" }).getAttribute("aria-current")).toBe("page");
    const parent = screen.getByRole("button", { name: "父级" });
    expect(parent.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(parent);
    expect(parent.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("button", { name: "子级" })).toBeNull();
    expect(onExpandedKeysChange).toHaveBeenLastCalledWith([]);
  });

  it("keeps controlled Sidebar groups aligned with expandedKeys", () => {
    const onExpandedKeysChange = vi.fn();
    const { rerender } = render(
      <Sidebar
        expandedKeys={[]}
        onExpandedKeysChange={onExpandedKeysChange}
        items={[{ key: "parent", label: "父级", children: [{ key: "child", label: "子级" }] }]}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "父级" }));
    expect(onExpandedKeysChange).toHaveBeenLastCalledWith(["parent"]);
    expect(screen.queryByRole("button", { name: "子级" })).toBeNull();

    rerender(
      <Sidebar
        expandedKeys={["parent"]}
        onExpandedKeysChange={onExpandedKeysChange}
        items={[{ key: "parent", label: "父级", children: [{ key: "child", label: "子级" }] }]}
      />
    );
    expect(screen.getByRole("button", { name: "子级" })).not.toBeNull();
  });

  it("clamps splitter size and completes keyboard resizing", () => {
    const onResizeEnd = vi.fn();
    render(
      <div style={{ width: 400, height: 200 }}>
        <Splitter defaultSize={80} min={80} onResizeEnd={onResizeEnd} storageKey="test">
          <div>A</div>
          <div>B</div>
        </Splitter>
      </div>
    );

    const separator = screen.getByRole("separator", { name: "调整分栏尺寸" });
    expect(document.querySelector<HTMLElement>(".splitter-panel.first")?.style.width).toBe("80px");
    fireEvent.keyDown(separator, { key: "ArrowRight" });
    expect(onResizeEnd).toHaveBeenCalledWith(96);
    expect(window.localStorage.getItem("lumina:splitter:v1:test")).toBe("96");
  });

  it("forwards clickable status item attributes", () => {
    render(
      <StatusBar.Item onClick={() => undefined} data-testid="status-action" aria-label="打开状态">
        Ready
      </StatusBar.Item>
    );
    expect(screen.getByTestId("status-action").getAttribute("aria-label")).toBe("打开状态");
  });

  it("falls back from broken avatar sources to initials", () => {
    const { container } = render(<Avatar src="/broken.png" fallbackSrc="/fallback.png" alt="Alice" />);
    fireEvent.error(container.querySelector("img")!);
    expect(container.querySelector("img")?.getAttribute("src")).toBe("/fallback.png");
    fireEvent.error(container.querySelector("img")!);
    expect(screen.getByText("AL")).not.toBeNull();
  });

  it("exposes robust progress, spin, skeleton, badge, divider and tag semantics", () => {
    const onRemove = vi.fn();
    render(
      <>
        <Progress value={0} max={0} showValue />
        <Spin />
        <Skeleton data-testid="skeleton" />
        <Badge count={0} showZero><span>Inbox</span></Badge>
        <Divider direction="vertical" />
        <Tag removable onRemove={onRemove}>tag</Tag>
      </>
    );

    expect(screen.getByRole("progressbar").getAttribute("aria-valuemax")).toBe("100");
    expect(screen.getByRole("status", { name: "加载中" })).not.toBeNull();
    expect(screen.getByTestId("skeleton").getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByRole("status", { name: "0" })).not.toBeNull();
    expect(screen.getByRole("separator").getAttribute("aria-orientation")).toBe("vertical");
    fireEvent.keyDown(screen.getByRole("button", { name: "移除" }), { key: "Enter" });
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("opens image preview from the keyboard", () => {
    const { container } = render(<Image src="/asset.png" alt="Asset" />);
    fireEvent.load(container.querySelector("img")!);
    fireEvent.keyDown(screen.getByRole("button", { name: "复制图片" }), { key: "Enter" });
    expect(screen.queryByRole("dialog", { name: "图片预览" })).toBeNull();
    fireEvent.keyDown(screen.getByRole("button", { name: "预览：Asset" }), { key: "Enter" });
    expect(screen.getByRole("dialog", { name: "图片预览" })).not.toBeNull();
  });

  it("keeps timeline item identity when reversing", () => {
    const items = [
      { children: <input aria-label="A" defaultValue="A" /> },
      { children: <input aria-label="B" defaultValue="B" /> },
    ];
    const { rerender } = render(<Timeline items={items} />);
    rerender(<Timeline items={items} reverse />);
    const values = screen.getAllByRole("textbox").map((element) => (element as HTMLInputElement).value);
    expect(values).toEqual(["B", "A"]);
  });
});
