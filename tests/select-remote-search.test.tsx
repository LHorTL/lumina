import * as React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Select, type SelectOption } from "../src/components/Select";

afterEach(cleanup);

const APPEARANCE_OPTIONS: SelectOption<string>[] = [
  {
    value: "成衣_长云黯雪·二·衣",
    label: "长云黯雪·二·衣",
    ariaLabel: "长云黯雪·二·衣",
    description: "成衣",
  },
  {
    value: "披风_雪落无声",
    label: "雪落无声",
    ariaLabel: "雪落无声",
    description: "披风",
  },
];

describe("Select 远程搜索多选", () => {
  it("把搜索框和标签放在同一触发器内，并在连续选择后保持展开和关键词", async () => {
    const onSearch = vi.fn();
    const onChange = vi.fn();
    const { container, rerender } = render(
      <Select
        multiple
        searchable
        clearable
        defaultOpen
        defaultValue={["成衣_长云黯雪·二·衣"]}
        filterOption={false}
        aria-label="外观名称"
        options={APPEARANCE_OPTIONS}
        onSearch={onSearch}
        onChange={onChange}
      />
    );

    const searchInput = screen.getByRole("combobox", { name: "外观名称" }) as HTMLInputElement;
    expect(searchInput.closest(".select-trigger")).not.toBeNull();
    expect(searchInput.closest(".select-trigger")?.textContent).toContain("长云黯雪·二·衣");

    fireEvent.change(searchInput, { target: { value: "雪" } });
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenLastCalledWith("雪");
    expect(searchInput.style.width).toBe("3ch");

    const secondOption = screen.getByRole("option", { name: "雪落无声" });
    fireEvent.mouseDown(secondOption);
    fireEvent.click(secondOption);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith([
      "成衣_长云黯雪·二·衣",
      "披风_雪落无声",
    ]);
    expect(screen.getByRole("listbox")).not.toBeNull();
    expect(searchInput.value).toBe("雪");
    expect(onSearch).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(document.activeElement).toBe(searchInput));

    rerender(
      <Select
        multiple
        searchable
        clearable
        defaultOpen
        defaultValue={["成衣_长云黯雪·二·衣"]}
        filterOption={false}
        aria-label="外观名称"
        options={[]}
        loading
        onSearch={onSearch}
        onChange={onChange}
      />
    );

    const trigger = container.querySelector(".select-trigger");
    expect(trigger?.textContent).toContain("长云黯雪·二·衣");
    expect(trigger?.textContent).toContain("雪落无声");
    expect(trigger?.textContent).not.toContain("成衣_长云黯雪·二·衣");
    expect(screen.getByText("加载中...")).not.toBeNull();
  });

  it("受控和非受控搜索词各自遵守单向数据流且不重复回调", () => {
    const controlledSearch = vi.fn();
    const { rerender } = render(
      <Select
        multiple
        searchable
        defaultOpen
        searchValue="长云"
        onSearch={controlledSearch}
        aria-label="受控搜索"
        options={APPEARANCE_OPTIONS}
      />
    );
    const controlledInput = screen.getByRole("combobox", { name: "受控搜索" }) as HTMLInputElement;

    fireEvent.change(controlledInput, { target: { value: "长云黯雪" } });
    expect(controlledSearch).toHaveBeenCalledTimes(1);
    expect(controlledSearch).toHaveBeenLastCalledWith("长云黯雪");
    expect(controlledInput.value).toBe("长云");

    rerender(
      <Select
        multiple
        searchable
        defaultOpen
        searchValue="长云黯雪"
        onSearch={controlledSearch}
        aria-label="受控搜索"
        options={APPEARANCE_OPTIONS}
      />
    );
    expect(controlledInput.value).toBe("长云黯雪");
    expect(controlledSearch).toHaveBeenCalledTimes(1);

    cleanup();
    const uncontrolledSearch = vi.fn();
    render(
      <Select
        multiple
        searchable
        defaultOpen
        defaultSearchValue="初始关键词"
        onSearch={uncontrolledSearch}
        aria-label="非受控搜索"
        filterOption={false}
        options={APPEARANCE_OPTIONS}
      />
    );
    const uncontrolledInput = screen.getByRole("combobox", { name: "非受控搜索" }) as HTMLInputElement;
    expect(uncontrolledInput.value).toBe("初始关键词");
    fireEvent.change(uncontrolledInput, { target: { value: "新关键词" } });
    expect(uncontrolledInput.value).toBe("新关键词");
    expect(uncontrolledSearch).toHaveBeenCalledTimes(1);
  });

  it("中文输入合成期间不会误选，键盘选择和退格删除后浮层仍保持展开", () => {
    const onChange = vi.fn();
    render(
      <Select
        multiple
        searchable
        defaultOpen
        defaultSearchValue="长云"
        filterOption={false}
        aria-label="中文搜索"
        options={APPEARANCE_OPTIONS}
        onChange={onChange}
      />
    );
    const searchInput = screen.getByRole("combobox", { name: "中文搜索" }) as HTMLInputElement;

    fireEvent.compositionStart(searchInput);
    fireEvent.keyDown(searchInput, { key: "Enter", keyCode: 229, isComposing: true });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.compositionEnd(searchInput);

    fireEvent.keyDown(searchInput, { key: "Enter" });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(["成衣_长云黯雪·二·衣"]);
    expect(searchInput.value).toBe("长云");
    expect(screen.getByRole("listbox")).not.toBeNull();

    fireEvent.change(searchInput, { target: { value: "" } });
    fireEvent.keyDown(searchInput, { key: "Backspace" });
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(screen.getByRole("listbox")).not.toBeNull();
  });

  it("移除单个标签和清空全部均只回调一次，并保留框内搜索焦点", async () => {
    const onChange = vi.fn();
    const onClear = vi.fn();
    const { container } = render(
      <Select
        multiple
        searchable
        clearable
        defaultOpen
        defaultValue={APPEARANCE_OPTIONS.map((option) => option.value)}
        aria-label="可清除外观"
        options={APPEARANCE_OPTIONS}
        onChange={onChange}
        onClear={onClear}
      />
    );
    const searchInput = screen.getByRole("combobox", { name: "可清除外观" }) as HTMLInputElement;
    searchInput.focus();
    const firstTag = container.querySelector(".select-tag-label")?.closest(".tag");
    const removeButton = firstTag?.querySelector<HTMLElement>("[role='button']");
    expect(removeButton).not.toBeNull();

    fireEvent.mouseDown(removeButton!);
    fireEvent.click(removeButton!);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(["披风_雪落无声"]);
    expect(screen.getByRole("listbox")).not.toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(searchInput));

    const clearButton = screen.getByRole("button", { name: "Clear" });
    fireEvent.mouseDown(clearButton);
    fireEvent.click(clearButton);
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("listbox")).not.toBeNull();
    expect(document.activeElement).toBe(searchInput);
  });

  it("保持单选在选中后关闭的既有行为", () => {
    const onChange = vi.fn();
    const onSearch = vi.fn();
    render(
      <Select
        searchable
        defaultOpen
        defaultSearchValue="长云"
        options={APPEARANCE_OPTIONS}
        onChange={onChange}
        onSearch={onSearch}
      />
    );

    const searchInput = screen.getByRole("combobox");
    expect(searchInput.closest(".select-trigger")).not.toBeNull();
    expect(screen.getByRole("listbox").contains(searchInput)).toBe(false);
    fireEvent.click(screen.getByRole("option", { name: "长云黯雪·二·衣" }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith("成衣_长云黯雪·二·衣");
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenLastCalledWith("");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("点击外部和 Escape 仍会关闭并各自只复位一次搜索词", () => {
    const outsideSearch = vi.fn();
    const outsideOpenChange = vi.fn();
    render(
      <>
        <Select
          multiple
          searchable
          defaultOpen
          defaultSearchValue="雪"
          options={APPEARANCE_OPTIONS}
          onSearch={outsideSearch}
          onOpenChange={outsideOpenChange}
        />
        <button type="button">外部区域</button>
      </>
    );
    fireEvent.mouseDown(screen.getByRole("button", { name: "外部区域" }));
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(outsideSearch).toHaveBeenCalledTimes(1);
    expect(outsideSearch).toHaveBeenLastCalledWith("");
    expect(outsideOpenChange).toHaveBeenCalledTimes(1);
    expect(outsideOpenChange).toHaveBeenLastCalledWith(false);

    cleanup();
    const escapeSearch = vi.fn();
    const escapeOpenChange = vi.fn();
    render(
      <Select
        multiple
        searchable
        defaultOpen
        defaultSearchValue="长云"
        options={APPEARANCE_OPTIONS}
        onSearch={escapeSearch}
        onOpenChange={escapeOpenChange}
      />
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(escapeSearch).toHaveBeenCalledTimes(1);
    expect(escapeSearch).toHaveBeenLastCalledWith("");
    expect(escapeOpenChange).toHaveBeenCalledTimes(1);
    expect(escapeOpenChange).toHaveBeenLastCalledWith(false);
  });
});
