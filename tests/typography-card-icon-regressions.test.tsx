import * as React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Card } from "../src/components/Card";
import { DeleteOutlined, Icon } from "../src/components/Icon";
import { Typography } from "../src/components/Typography";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("typography, card and icon regressions", () => {
  it("forwards native typography attributes and keeps paragraph refs stable while editing", () => {
    const paragraphRef = React.createRef<HTMLParagraphElement>();
    const onCancel = vi.fn();
    const onChange = vi.fn();
    render(
      <Typography.Paragraph
        ref={paragraphRef}
        id="editable-copy"
        data-kind="body"
        editable={{ onCancel, onChange }}
      >
        原文
      </Typography.Paragraph>
    );

    expect(paragraphRef.current?.tagName).toBe("P");
    expect(paragraphRef.current?.dataset.kind).toBe("body");
    fireEvent.click(screen.getByRole("button", { name: "编辑" }));
    expect(paragraphRef.current?.tagName).toBe("P");
    const editor = screen.getByRole("textbox");
    fireEvent.change(editor, { target: { value: "修改后" } });
    fireEvent.blur(editor);

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("fully disables links without allowing consumer click handlers to override the guard", () => {
    const onClick = vi.fn();
    const onKeyDown = vi.fn();
    render(
      <Typography.Link href="/danger" disabled onClick={onClick} onKeyDown={onKeyDown}>
        禁用链接
      </Typography.Link>
    );
    const link = screen.getByText("禁用链接").closest("a")!;

    expect(link.getAttribute("href")).toBeNull();
    expect(link.tabIndex).toBe(-1);
    expect(fireEvent.click(link)).toBe(false);
    expect(fireEvent.keyDown(link, { key: "Enter" })).toBe(false);
    expect(onClick).not.toHaveBeenCalled();
    expect(onKeyDown).not.toHaveBeenCalled();
  });

  it("uses the link itself as the text edit trigger without navigating", () => {
    const onClick = vi.fn();
    const onStart = vi.fn();
    render(
      <Typography.Link
        href="/target"
        onClick={onClick}
        editable={{ triggerType: ["text"], onStart }}
      >
        编辑链接文字
      </Typography.Link>
    );
    const link = screen.getByRole("link", { name: "编辑链接文字" });

    expect(screen.queryByRole("button", { name: "编辑" })).toBeNull();
    expect(fireEvent.click(link)).toBe(false);
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole("textbox")).not.toBeNull();
  });

  it("renders link copy and edit actions outside the anchor", async () => {
    const onClick = vi.fn();
    const writeText = vi.fn<() => Promise<void>>().mockResolvedValue();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    const { container } = render(
      <Typography.Link href="/target" onClick={onClick} copyable editable>
        带操作的链接
      </Typography.Link>
    );
    const link = screen.getByRole("link", { name: "带操作的链接" });
    const copyAction = screen.getByRole("button", { name: "复制" });
    const editAction = screen.getByRole("button", { name: "编辑" });

    expect(link.contains(copyAction)).toBe(false);
    expect(link.contains(editAction)).toBe(false);
    expect(container.querySelector("a button, a input, a textarea")).toBeNull();
    fireEvent.click(copyAction);
    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    expect(onClick).not.toHaveBeenCalled();
    fireEvent.click(editAction);
    expect(screen.getByRole("textbox")).not.toBeNull();
    expect(container.querySelector("a button, a input, a textarea")).toBeNull();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("supports an enterIcon action and keeps controlled editing reusable", async () => {
    const onChange = vi.fn();
    const onCancel = vi.fn();
    const { rerender } = render(
      <Typography.Text
        editable={{
          editing: true,
          text: "初始值",
          enterIcon: <span data-testid="enter-icon">✓</span>,
          onChange,
          onCancel,
        }}
      >
        初始值
      </Typography.Text>
    );
    const editor = screen.getByRole("textbox") as HTMLInputElement;
    const confirmAction = screen.getByRole("button", { name: "确认编辑" });

    expect(confirmAction.tagName).toBe("BUTTON");
    expect(confirmAction.tabIndex).toBe(0);
    expect(screen.getByTestId("enter-icon")).not.toBeNull();
    fireEvent.change(editor, { target: { value: "第一次" } });
    fireEvent.click(confirmAction);
    expect(onChange).toHaveBeenLastCalledWith("第一次");
    expect(onCancel).not.toHaveBeenCalled();

    fireEvent.change(editor, { target: { value: "第二次" } });
    fireEvent.keyDown(editor, { key: "Enter" });
    expect(onChange).toHaveBeenLastCalledWith("第二次");
    expect(onChange).toHaveBeenCalledTimes(2);

    rerender(
      <Typography.Text
        editable={{
          editing: true,
          text: "服务端更新",
          enterIcon: <span>✓</span>,
          onChange,
          onCancel,
        }}
      >
        服务端更新
      </Typography.Text>
    );
    await waitFor(() => expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("服务端更新"));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "第三次" } });
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(onChange).toHaveBeenLastCalledWith("第三次");
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it("reports clipboard success only after fulfillment and exposes failures", async () => {
    const onCopy = vi.fn();
    const onCopyError = vi.fn();
    const writeText = vi
      .fn<() => Promise<void>>()
      .mockResolvedValueOnce()
      .mockRejectedValueOnce(new Error("blocked"));
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    const { rerender } = render(
      <Typography.Text copyable={{ onCopy, onCopyError }}>内容</Typography.Text>
    );

    fireEvent.click(screen.getByRole("button", { name: "复制" }));
    await waitFor(() => expect(onCopy).toHaveBeenCalledTimes(1));
    expect(onCopyError).not.toHaveBeenCalled();

    rerender(<Typography.Text copyable={{ onCopy, onCopyError }}>另一段</Typography.Text>);
    fireEvent.click(screen.getByRole("button", { name: "已复制" }));
    await waitFor(() => expect(onCopyError).toHaveBeenCalledTimes(1));
    expect(onCopy).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "复制失败" })).not.toBeNull();
  });

  it("shows ellipsis affordances only when the rendered element is actually truncated", async () => {
    let scrollWidth = 240;
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(100);
    vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockImplementation(() => scrollWidth);
    const { rerender } = render(
      <Typography.Text ellipsis={{ expandable: true, tooltip: true }}>
        很长的一段文字
      </Typography.Text>
    );

    await waitFor(() => expect(screen.getByRole("button", { name: "展开" })).not.toBeNull());
    scrollWidth = 50;
    rerender(
      <Typography.Text ellipsis={{ expandable: true, tooltip: true }}>
        短文
      </Typography.Text>
    );
    await waitFor(() => expect(screen.queryByRole("button", { name: "展开" })).toBeNull());
  });

  it("把始终可见的省略后缀放在裁切容器之外", () => {
    const { container } = render(
      <Typography.Text ellipsis={{ suffix: "—作者" }}>
        很长的一段正文内容
      </Typography.Text>
    );
    const root = container.querySelector<HTMLElement>(".typo-text")!;
    const content = root.querySelector<HTMLElement>(".typo-ellipsis-content")!;
    const suffix = root.querySelector<HTMLElement>(".typo-suffix")!;
    expect(root.classList.contains("ellipsis-with-suffix")).toBe(true);
    expect(root.classList.contains("ellipsis")).toBe(false);
    expect(content.classList.contains("ellipsis")).toBe(true);
    expect(content.nextElementSibling).toBe(suffix);
  });

  it("associates an open ellipsis tooltip with its trigger", async () => {
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(100);
    vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockReturnValue(240);
    render(
      <Typography.Text ellipsis={{ tooltip: true }} aria-describedby="existing-description">
        关联提示文本
      </Typography.Text>
    );
    const trigger = screen.getByText("关联提示文本");

    fireEvent.mouseEnter(trigger);
    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip.id).not.toBe("");
    expect(trigger.getAttribute("aria-describedby")?.split(" ")).toEqual([
      "existing-description",
      tooltip.id,
    ]);
  });

  it("isolates loading card content and restores keyboard activation afterward", () => {
    const onClick = vi.fn();
    const onBodyAction = vi.fn();
    const onHeaderAction = vi.fn();
    const { rerender } = render(
      <Card
        interactive
        loading
        onClick={onClick}
        actions={<button type="button" onClick={onHeaderAction}>标题操作</button>}
      >
        <button type="button" onClick={onBodyAction}>内部操作</button>
      </Card>
    );
    const card = document.querySelector<HTMLElement>(".card")!;
    const content = document.querySelector<HTMLElement>(".card-body-content")!;
    const actions = document.querySelector<HTMLElement>(".card-actions")!;

    expect(card.tabIndex).toBe(-1);
    expect(card.getAttribute("aria-disabled")).toBe("true");
    expect(content.inert).toBe(true);
    expect(actions.inert).toBe(true);
    expect(content.getAttribute("aria-hidden")).toBe("true");
    fireEvent.click(card);
    fireEvent.click(screen.getByText("内部操作"));
    fireEvent.click(screen.getByText("标题操作"));
    expect(onClick).not.toHaveBeenCalled();
    expect(onBodyAction).not.toHaveBeenCalled();
    expect(onHeaderAction).not.toHaveBeenCalled();

    rerender(
      <Card interactive onClick={onClick}>
        正文
      </Card>
    );
    const activeCard = screen.getByRole("button", { name: "正文" });
    expect(activeCard.closest(".card")?.getAttribute("role")).not.toBe("button");
    fireEvent.click(activeCard);
    expect(onClick).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(activeCard, { key: "Enter" });
    expect(onClick).toHaveBeenCalledTimes(2);
    fireEvent.keyDown(activeCard, { key: " " });
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it("does not activate an interactive card from nested control events", () => {
    const onCardClick = vi.fn();
    const onActionClick = vi.fn();
    render(
      <Card interactive onClick={onCardClick}>
        <button type="button" onClick={onActionClick}>独立操作</button>
      </Card>
    );
    const action = screen.getByText("独立操作");

    fireEvent.keyDown(action, { key: "Enter" });
    expect(onCardClick).not.toHaveBeenCalled();
    fireEvent.click(action);
    expect(onActionClick).toHaveBeenCalledTimes(1);
    expect(onCardClick).not.toHaveBeenCalled();
  });

  it("treats unnamed icons as decorative and named icons as semantic", () => {
    render(
      <>
        <Icon name="trash" data-testid="decorative-icon" />
        <Icon name="trash" title="删除" />
        <DeleteOutlined aria-label="删除文件" />
      </>
    );

    const decorative = screen.getByTestId("decorative-icon");
    expect(decorative.getAttribute("aria-hidden")).toBe("true");
    expect(decorative.getAttribute("focusable")).toBe("false");
    expect(screen.getByRole("img", { name: "删除" })).not.toBeNull();
    expect(screen.getByRole("img", { name: "删除文件" })).not.toBeNull();
  });
});
