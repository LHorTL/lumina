import * as React from "react";
import { createPortal } from "react-dom";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { Alert } from "../src/components/Alert";
import { Collapse } from "../src/components/Collapse";
import { CommandPalette } from "../src/components/CommandPalette";
import { ContextMenu } from "../src/components/ContextMenu";
import { ColorPicker } from "../src/components/ColorPicker";
import { Drawer } from "../src/components/Drawer";
import { List } from "../src/components/List";
import { message, MessageContainer } from "../src/components/Message";
import { Modal } from "../src/components/Modal";
import { Pagination } from "../src/components/Pagination";
import { Popover } from "../src/components/Popover";
import { Select } from "../src/components/Select";
import { Sidebar } from "../src/components/AppShell";
import { Table } from "../src/components/Table";
import { Tabs } from "../src/components/Tabs";
import { Tooltip } from "../src/components/Tooltip";

/** 为 jsdom 补足浮层和折叠动画所需的浏览器 API。 */
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  });
  Object.defineProperty(globalThis, "ResizeObserver", {
    configurable: true,
    value: class {
      observe(): void {}
      disconnect(): void {}
    },
  });
});

/** 模拟 Popover 内容内部再次 Portal 到同一文档的控件。 */
const NestedPortalButton: React.FC = () => createPortal(
  <button type="button">二级浮层按钮</button>,
  document.body
);

afterEach(() => {
  message.clear();
  cleanup();
  vi.useRealTimers();
});

describe("overlay and navigation regressions", () => {
  it("enables Modal shadow-safe body spacing by default and supports full-bleed content", () => {
    const { rerender } = render(
      <Modal open title="安全区" bodyProps={{ "data-panel": "modal-body" }}>
        内容
      </Modal>
    );
    const body = document.querySelector<HTMLElement>(".modal-body")!;
    const dialog = screen.getByRole("dialog", { name: "安全区" });
    expect(body.classList.contains("inset-safe")).toBe(true);
    expect(body.dataset.panel).toBe("modal-body");
    expect(dialog.style.maxWidth).toBe("92vw");

    rerender(
      <Modal open title="贴边" bodyInset="none">
        内容
      </Modal>
    );
    expect(document.querySelector(".modal-body")?.classList.contains("inset-none")).toBe(true);
  });

  it("keeps Drawer chrome fixed while its shadow-safe body owns scrolling", () => {
    render(
      <Drawer
        open
        title="安全区"
        bodyClassName="custom-drawer-body"
        bodyStyle={{ maxHeight: 240 }}
        bodyProps={{ "data-panel": "drawer-body" }}
        bodyOverflow="hidden"
      >
        内容
      </Drawer>
    );
    const body = document.querySelector<HTMLElement>(".drawer-body")!;
    const dialog = screen.getByRole("dialog", { name: "安全区" });
    expect(body.classList.contains("inset-safe")).toBe(true);
    expect(body.classList.contains("custom-drawer-body")).toBe(true);
    expect(body.dataset.panel).toBe("drawer-body");
    expect(body.style.maxHeight).toBe("240px");
    expect(body.style.overflow).toBe("hidden");
    expect(dialog.style.maxWidth).toBe("92vw");
  });

  it("reschedules a keyed message when duration changes", () => {
    vi.useFakeTimers();
    render(<MessageContainer />);

    act(() => {
      message.open({ key: "sync", content: "同步中", duration: 0 });
    });
    expect(screen.getByText("同步中")).not.toBeNull();

    act(() => {
      message.success({ key: "sync", content: "同步完成", duration: 100 });
    });
    act(() => vi.advanceTimersByTime(99));
    expect(screen.getByText("同步完成")).not.toBeNull();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByText("同步完成")).toBeNull();
  });

  it("supports empty configs, zero ReactNodes, overload onClose and numeric keys", () => {
    vi.useFakeTimers();
    render(<MessageContainer />);
    const closeByTimer = vi.fn();
    const closeByButton = vi.fn();

    act(() => {
      message.open({ duration: 0 });
      message.info(0, "计数", closeByButton);
      message.success("稍后关闭", 50, closeByTimer);
    });
    expect(document.querySelectorAll(".message")).toHaveLength(3);
    expect(screen.getByText("计数")).not.toBeNull();
    expect(screen.getByText("0")).not.toBeNull();
    fireEvent.click(screen.getAllByRole("button", { name: "Dismiss" })[1]);
    expect(closeByButton).toHaveBeenCalledOnce();
    act(() => vi.advanceTimersByTime(50));
    expect(closeByTimer).toHaveBeenCalledOnce();

    let id = 0;
    act(() => {
      id = message.open({ content: "按 id", duration: 0 });
      message.open({ key: id, content: "按数字 key", duration: 0 });
      message.dismiss(id);
    });
    expect(screen.getByText("按 id")).not.toBeNull();
    expect(screen.queryByText("按数字 key")).toBeNull();
    act(() => message.dismissById(id));
    expect(screen.queryByText("按 id")).toBeNull();
  });

  it("dismisses a closable alert without requiring an onClose handler", () => {
    render(<Alert closable>提示内容</Alert>);
    fireEvent.click(screen.getByRole("button", { name: "关闭提示" }));
    expect(screen.queryByText("提示内容")).toBeNull();
  });

  it("keeps list row actions separate from the row trigger", () => {
    const onRowClick = vi.fn();
    const onAction = vi.fn();
    render(
      <List
        items={[{
          key: "one",
          title: "项目一",
          onClick: onRowClick,
          actions: <button onClick={onAction}>更多</button>,
        }]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "更多" }));
    expect(onAction).toHaveBeenCalledOnce();
    expect(onRowClick).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "项目一" }));
    expect(onRowClick).toHaveBeenCalledOnce();
  });

  it("exposes pagination boundary and current-page semantics", () => {
    const { rerender } = render(<Pagination total={100} defaultPage={10} />);
    expect((screen.getByRole("button", { name: "下一页" }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByRole("button", { name: "第 10 页" }).getAttribute("aria-current")).toBe("page");

    rerender(<Pagination total={15} defaultPage={10} />);
    expect(screen.getByText(/第 2 \/ 2 页/)).not.toBeNull();
    expect(screen.getByRole("button", { name: "第 2 页" }).getAttribute("aria-current")).toBe("page");
  });

  it("makes icon-only collapse keyboard reachable and marks closed content inert", () => {
    render(
      <Collapse
        collapsible="icon"
        items={[{ key: "one", label: "面板一", children: <button>内部操作</button> }]}
      />
    );
    const toggle = screen.getByRole("button", { name: "展开面板" });
    const region = screen.getByRole("region", { hidden: true });
    expect(region.hasAttribute("inert")).toBe(true);

    fireEvent.click(toggle);
    expect(screen.getByRole("button", { name: "收起面板" })).not.toBeNull();
    expect(region.hasAttribute("inert")).toBe(false);
  });

  it("moves Tabs with arrow keys and skips disabled items", () => {
    render(
      <Tabs
        fill
        tabBarClassName="workspace-tabs-bar"
        contentClassName="workspace-tabs-content"
        items={[
          { key: "a", label: "A", content: "内容 A" },
          { key: "b", label: "B", disabled: true, content: "内容 B" },
          { key: "c", label: "C", content: "内容 C" },
        ]}
      />
    );
    const first = screen.getByRole("tab", { name: "A" });
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowRight" });
    const third = screen.getByRole("tab", { name: "C" });
    expect(third.getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(third);
    const panel = screen.getByRole("tabpanel");
    expect(panel.getAttribute("aria-labelledby")).toBe(third.id);
    expect(panel.classList.contains("workspace-tabs-content")).toBe(true);
    expect(document.querySelector(".tabs")?.classList.contains("fill")).toBe(true);
    expect(document.querySelector(".tabs-nav")?.classList.contains("workspace-tabs-bar")).toBe(true);
  });

  it("refreshes the CommandPalette imperative ref and combobox relation on open", () => {
    const panelRef = React.createRef<HTMLDivElement>();
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <CommandPalette ref={panelRef} open={false} onOpenChange={onOpenChange} items={[]} />
    );
    expect(panelRef.current).toBeNull();

    rerender(
      <CommandPalette
        ref={panelRef}
        open
        onOpenChange={onOpenChange}
        items={[{ key: "open", label: "打开" }]}
      />
    );
    expect(panelRef.current).not.toBeNull();
    const combobox = screen.getByRole("combobox");
    expect(combobox.getAttribute("aria-controls")).toBe(screen.getByRole("listbox").id);
    expect(combobox.getAttribute("aria-activedescendant")).toBe(
      screen.getByRole("option", { name: "打开" }).id
    );
  });

  it("executes the correct interleaved grouped command", () => {
    const runA2 = vi.fn();
    const runB1 = vi.fn();
    render(
      <CommandPalette
        open
        items={[
          { key: "a1", group: "A", label: "A1" },
          { key: "b1", group: "B", label: "B1", onSelect: runB1 },
          { key: "a2", group: "A", label: "A2", onSelect: runA2 },
        ]}
      />
    );
    const optionA2 = screen.getByRole("option", { name: "A2" });
    fireEvent.mouseEnter(optionA2);
    expect(screen.getByRole("combobox").getAttribute("aria-activedescendant")).toBe(optionA2.id);
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Enter" });
    expect(runA2).toHaveBeenCalledOnce();
    expect(runB1).not.toHaveBeenCalled();
  });

  it("保留查询重开命令面板时按筛选结果重置活动项", () => {
    const run = vi.fn();
    const items = [
      { key: "disabled", label: "禁用命令", disabled: true },
      { key: "run", label: "运行项目", onSelect: run },
    ];
    const { rerender } = render(
      <CommandPalette open resetOnOpen={false} items={items} />
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "运行" } });
    expect(screen.getAllByRole("option")).toHaveLength(1);

    rerender(<CommandPalette open={false} resetOnOpen={false} items={items} />);
    rerender(<CommandPalette open resetOnOpen={false} items={items} />);
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Enter" });
    expect(run).toHaveBeenCalledOnce();
  });

  it("命令面板的焦点陷阱忽略 tabIndex=-1 的选项", () => {
    render(
      <CommandPalette
        open
        items={[{ key: "run", label: "运行", onSelect: vi.fn() }]}
      />
    );
    const input = screen.getByRole("combobox");
    input.focus();
    fireEvent.keyDown(input, { key: "Tab" });
    expect(document.activeElement).toBe(input);
  });

  it("opens ColorPicker when custom children are plain text", () => {
    render(<ColorPicker>自定义颜色</ColorPicker>);
    const trigger = screen.getByRole("button", { name: /选择颜色/ });
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog", { name: "选择颜色" })).not.toBeNull();
  });

  it("无 href 的 ColorPicker 链接触发器可通过键盘打开", () => {
    render(<ColorPicker><a>颜色链接</a></ColorPicker>);
    const trigger = screen.getByRole("button", { name: "颜色链接" });
    expect(trigger.tabIndex).toBe(0);
    fireEvent.keyDown(trigger, { key: "Enter" });
    expect(screen.getByRole("dialog", { name: "选择颜色" })).not.toBeNull();
  });

  it("折叠 Sidebar 为复杂标签保留显式可访问名称", () => {
    render(
      <Sidebar
        collapsed
        items={[{
          key: "workspace",
          label: <span>工作区 <strong>团队</strong></span>,
          ariaLabel: "工作区",
          icon: <span aria-hidden>图</span>,
        }]}
      />
    );
    const item = screen.getByRole("button", { name: "工作区" });
    expect(item.getAttribute("title")).toBe("工作区");
  });

  it("closes a Select before its parent Modal on consecutive Escape presses", () => {
    /** 用受控父弹窗验证嵌套 Select 的 Escape 栈顺序。 */
    const Harness: React.FC = () => {
      const [modalOpen, setModalOpen] = React.useState(true);
      return (
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="父弹窗">
          <Select options={[{ value: "a", label: "选项 A" }]} />
        </Modal>
      );
    };
    render(<Harness />);
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).not.toBeNull();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(screen.getByRole("dialog", { name: "父弹窗" })).not.toBeNull();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "父弹窗" })).toBeNull();
  });

  it("keeps same-commit child overlays above an explicit parent and restores inside it", () => {
    vi.useFakeTimers();
    render(
      <Modal open zIndex={7200} title="同帧父弹窗">
        <Select
          defaultOpen
          searchable
          options={[{ value: "a", label: "选项 A" }]}
        />
      </Modal>
    );
    act(() => vi.runOnlyPendingTimers());
    const modal = screen.getByRole("dialog", { name: "同帧父弹窗" });
    const listbox = screen.getByRole("listbox");
    expect(Number(listbox.style.zIndex)).toBeGreaterThan(7200);
    const search = within(listbox).getByRole("combobox");
    search.focus();
    fireEvent.keyDown(document, { key: "Escape" });
    act(() => vi.runOnlyPendingTimers());
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(modal.contains(document.activeElement)).toBe(true);
    expect(document.activeElement).toBe(screen.getByRole("combobox"));
  });

  it("follows logical Tab order through an owned Select portal", () => {
    render(
      <Modal open title="焦点顺序">
        <Select
          defaultOpen
          searchable
          options={[{ value: "a", label: "选项 A" }]}
        />
        <button type="button">后续按钮</button>
      </Modal>
    );
    const trigger = document.querySelector<HTMLElement>(".select-trigger")!;
    const search = within(screen.getByRole("listbox")).getByRole("combobox");
    trigger.focus();
    fireEvent.keyDown(trigger, { key: "Tab" });
    expect(document.activeElement).toBe(search);
    fireEvent.keyDown(search, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(trigger);
  });

  it("does not restore focus while an open modal only changes z-index", () => {
    const { rerender } = render(
      <Modal open zIndex={4000} title="层级更新">
        <input aria-label="保持焦点" />
      </Modal>
    );
    const input = screen.getByRole("textbox", { name: "保持焦点" });
    input.focus();
    rerender(
      <Modal open zIndex={5000} title="层级更新">
        <input aria-label="保持焦点" />
      </Modal>
    );
    expect(document.activeElement).toBe(input);
  });

  it("fires afterOpenChange once for the final transition with the latest callback", () => {
    vi.useFakeTimers();
    const first = vi.fn();
    const latest = vi.fn();
    const { rerender } = render(<Modal open={false} afterOpenChange={first}>内容</Modal>);
    rerender(<Modal open afterOpenChange={first}>内容</Modal>);
    rerender(<Modal open afterOpenChange={latest}>内容</Modal>);
    rerender(<Modal open={false} afterOpenChange={latest}>内容</Modal>);
    act(() => vi.runOnlyPendingTimers());
    expect(first).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledTimes(1);
    expect(latest).toHaveBeenCalledWith(false);
  });

  it("ignores non-finite explicit z-index values", () => {
    render(<Modal open zIndex={Number.NaN} title="非法层级">内容</Modal>);
    const overlay = document.querySelector<HTMLElement>(".modal-overlay")!;
    expect(Number.isFinite(Number(overlay.style.zIndex))).toBe(true);
  });

  it("toggles a table filter once when its text is clicked", () => {
    render(
      <Table
        columns={[{
          key: "kind",
          title: "Kind",
          dataIndex: "kind",
          filters: [{ text: "筛选 A", value: "a" }],
        }]}
        data={[{ kind: "a" }]}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "筛选列" }));
    const dialog = screen.getByRole("dialog", { name: "列筛选" });
    const checkbox = within(dialog).getByRole("checkbox") as HTMLInputElement;
    fireEvent.click(within(dialog).getByText("筛选 A"));
    expect(checkbox.checked).toBe(true);
    fireEvent.click(within(dialog).getByText("筛选 A"));
    expect(checkbox.checked).toBe(false);
  });

  it("lets only the topmost modal layer handle Escape", () => {
    const closeModal = vi.fn();
    const closeDrawer = vi.fn();
    render(
      <>
        <Modal open onClose={closeModal} title="底层弹窗">内容</Modal>
        <Drawer open onClose={closeDrawer} title="顶层抽屉">内容</Drawer>
      </>
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(closeDrawer).toHaveBeenCalledOnce();
    expect(closeModal).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: "底层弹窗" })).not.toBeNull();
  });

  it("allocates a higher z-index to an overlay opened later", () => {
    /** 先打开 Modal，再从其中打开 Drawer 以验证动态层级。 */
    const Harness: React.FC = () => {
      const [drawerOpen, setDrawerOpen] = React.useState(false);
      return (
        <>
          <Modal open title="先开弹窗">
            <button onClick={() => setDrawerOpen(true)}>打开抽屉</button>
          </Modal>
          <Drawer open={drawerOpen} title="后开抽屉">抽屉内容</Drawer>
        </>
      );
    };
    render(<Harness />);
    const modalOverlay = document.querySelector<HTMLElement>(".modal-overlay")!;
    fireEvent.click(screen.getByRole("button", { name: "打开抽屉" }));

    const drawerPanel = screen.getByRole("dialog", { name: "后开抽屉" });
    const drawerMask = document.querySelector<HTMLElement>(".drawer-overlay")!;
    const modalZIndex = Number(modalOverlay.style.zIndex);
    const drawerZIndex = Number(drawerPanel.style.zIndex);
    expect(drawerZIndex).toBeGreaterThan(modalZIndex);
    expect(Number(drawerMask.style.zIndex)).toBe(drawerZIndex - 1);
  });

  it("preserves explicit Modal and Drawer z-index values", () => {
    render(
      <>
        <Modal open title="显式弹窗" zIndex={7200} maskStyle={{ zIndex: 9999 }}>内容</Modal>
        <Drawer open title="显式抽屉" zIndex={8100} style={{ zIndex: 9999 }}>内容</Drawer>
      </>
    );
    expect(document.querySelector<HTMLElement>(".modal-overlay")!.style.zIndex).toBe("7200");
    expect(screen.getByRole("dialog", { name: "显式抽屉" }).style.zIndex).toBe("8100");
    expect(document.querySelector<HTMLElement>(".drawer-overlay")!.style.zIndex).toBe("8099");
  });

  it("traps modal focus, locks scrolling, and restores the opener", () => {
    vi.useFakeTimers();
    /** 用按钮控制弹窗，以验证打开前后的焦点归还。 */
    const Harness: React.FC = () => {
      const [open, setOpen] = React.useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>打开设置</button>
          <Modal open={open} onClose={() => setOpen(false)} title="设置">
            内容
          </Modal>
        </>
      );
    };
    render(<Harness />);
    const opener = screen.getByRole("button", { name: "打开设置" });
    opener.focus();
    fireEvent.click(opener);
    act(() => vi.runOnlyPendingTimers());
    expect(document.body.style.overflow).toBe("hidden");

    const dialog = screen.getByRole("dialog", { name: "设置" });
    const ok = within(dialog).getByRole("button", { name: "确定" });
    ok.focus();
    fireEvent.keyDown(ok, { key: "Tab" });
    expect(document.activeElement).toBe(within(dialog).getByRole("button", { name: "Close" }));

    fireEvent.click(within(dialog).getByRole("button", { name: "取消" }));
    act(() => vi.runOnlyPendingTimers());
    expect(document.body.style.overflow).toBe("");
    expect(document.activeElement).toBe(opener);
  });

  it("skips CSS-hidden controls in the modal Tab order", () => {
    render(
      <Modal open title="隐藏控件">
        <button type="button">开始</button>
        <button type="button" style={{ display: "none" }}>不可见</button>
        <button type="button">结束</button>
      </Modal>
    );
    const start = screen.getByRole("button", { name: "开始" });
    start.focus();
    fireEvent.keyDown(start, { key: "Tab" });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "结束" }));
  });

  it("opens Popover from focus and closes it with Escape", () => {
    render(
      <Popover trigger="focus" title="帮助" content="说明">
        <button>查看帮助</button>
      </Popover>
    );
    const trigger = screen.getByRole("button", { name: "查看帮助" });
    fireEvent.focus(trigger);
    const dialog = screen.getByRole("dialog", { name: "帮助" });
    expect(trigger.getAttribute("aria-controls")).toBe(dialog.id);
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "帮助" })).toBeNull();
  });

  it("does not treat a nested React portal as an outside Popover click", () => {
    render(
      <Popover content={<NestedPortalButton />}>
        <button>打开浮层</button>
      </Popover>
    );
    fireEvent.click(screen.getByRole("button", { name: "打开浮层" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.mouseDown(screen.getByRole("button", { name: "二级浮层按钮" }));
    expect(dialog.isConnected).toBe(true);
  });

  it("connects Tooltip to its trigger and supports Escape dismissal", () => {
    render(
      <Tooltip content="复制路径" delay={0} closeDelay={0}>
        <button>复制</button>
      </Tooltip>
    );
    const trigger = screen.getByRole("button", { name: "复制" });
    fireEvent.focus(trigger);
    const tooltip = screen.getByRole("tooltip");
    expect(trigger.getAttribute("aria-describedby")).toContain(tooltip.id);
    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("deduplicates matching pointer and mouse Tooltip transitions", () => {
    const onOpenChange = vi.fn();
    render(
      <Tooltip content="提示" delay={0} closeDelay={0} onOpenChange={onOpenChange}>
        <button>悬浮</button>
      </Tooltip>
    );
    const anchor = screen.getByRole("button", { name: "悬浮" }).parentElement!;
    fireEvent.pointerEnter(anchor);
    fireEvent.mouseEnter(anchor);
    expect(onOpenChange.mock.calls.filter(([open]) => open)).toHaveLength(1);
    fireEvent.pointerLeave(anchor);
    fireEvent.mouseLeave(anchor);
    expect(onOpenChange.mock.calls.filter(([open]) => !open)).toHaveLength(1);
  });

  it("opens ContextMenu from Shift+F10 and focuses the first item", () => {
    vi.useFakeTimers();
    render(
      <ContextMenu items={[{ key: "copy", label: "复制" }]}>
        <button>文件</button>
      </ContextMenu>
    );
    const trigger = screen.getByRole("button", { name: "文件" });
    trigger.focus();
    fireEvent.keyDown(trigger, { key: "F10", shiftKey: true });
    act(() => vi.runOnlyPendingTimers());
    const menu = screen.getByRole("menu");
    expect(within(menu).getByRole("menuitem", { name: "复制" })).toBe(document.activeElement);
  });

  it("adds a keyboard entry point to a non-interactive ContextMenu child", () => {
    vi.useFakeTimers();
    render(
      <ContextMenu items={[{ key: "copy", label: "复制" }]}>
        <div>文件区域</div>
      </ContextMenu>
    );
    const trigger = screen.getByText("文件区域");
    expect(trigger.tabIndex).toBe(0);
    trigger.focus();
    fireEvent.keyDown(trigger, { key: "F10", shiftKey: true });
    act(() => vi.runOnlyPendingTimers());
    expect(screen.getByRole("menu")).not.toBeNull();
    expect(screen.getByRole("menuitem", { name: "复制" })).toBe(document.activeElement);
  });

  it("restores ContextMenu focus when it becomes disabled", () => {
    vi.useFakeTimers();
    const { rerender } = render(
      <ContextMenu items={[{ key: "copy", label: "复制" }]}>
        <button>文件</button>
      </ContextMenu>
    );
    const trigger = screen.getByRole("button", { name: "文件" });
    trigger.focus();
    fireEvent.keyDown(trigger, { key: "F10", shiftKey: true });
    act(() => vi.runOnlyPendingTimers());
    expect(screen.getByRole("menu")).not.toBeNull();
    rerender(
      <ContextMenu disabled items={[{ key: "copy", label: "复制" }]}>
        <button>文件</button>
      </ContextMenu>
    );
    act(() => vi.runOnlyPendingTimers());
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
