import * as React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AutoComplete } from "../src/components/AutoComplete";
import { Button } from "../src/components/Button";
import { Calendar } from "../src/components/Calendar";
import { Cascader } from "../src/components/Cascader";
import { Checkbox } from "../src/components/Checkbox";
import { ColorPicker } from "../src/components/ColorPicker";
import { DatePicker } from "../src/components/DatePicker";
import { DateTimePicker } from "../src/components/DateTimePicker";
import { Form } from "../src/components/Form";
import { Input } from "../src/components/Input";
import { InputNumber } from "../src/components/InputNumber";
import { Radio, RadioGroup } from "../src/components/Radio";
import { Select } from "../src/components/Select";
import { Slider } from "../src/components/Slider";
import { Switch } from "../src/components/Switch";
import { Textarea } from "../src/components/Textarea";
import { TimePicker } from "../src/components/TimePicker";

afterEach(cleanup);

describe("表单与选择器回归", () => {
  it("清空非受控 Textarea 的真实值", () => {
    render(<Textarea defaultValue="hello" allowClear />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(textarea.value).toBe("");
  });

  it("受控 Input 与 Textarea 清空事件暴露空值且不越权改 DOM", () => {
    const inputChange = vi.fn();
    const textareaChange = vi.fn();
    render(
      <>
        <Input value="input-value" allowClear onChange={inputChange} />
        <Textarea value="textarea-value" allowClear onChange={textareaChange} />
      </>
    );
    screen.getAllByRole("button", { name: "Clear" }).forEach((button) => fireEvent.click(button));
    expect(inputChange.mock.calls[0][0].target.value).toBe("");
    expect(textareaChange.mock.calls[0][0].target.value).toBe("");
    expect((screen.getAllByRole("textbox")[0] as HTMLInputElement).value).toBe("input-value");
    expect((screen.getAllByRole("textbox")[1] as HTMLTextAreaElement).value).toBe("textarea-value");
  });

  it("Cascader 搜索不会绕过禁用路径", () => {
    const onChange = vi.fn();
    render(<Cascader showSearch onChange={onChange} options={[{ value: "blocked", label: "Blocked", disabled: true }]} />);
    fireEvent.click(screen.getByRole("button", { name: /请选择/ }));
    fireEvent.change(screen.getByRole("textbox", { name: "搜索级联选项" }), { target: { value: "Blocked" } });
    expect(screen.queryByRole("option", { name: "Blocked" })).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("Select 分离复杂选项与紧凑已选渲染，并允许调整列表高度", () => {
    render(
      <Select
        defaultOpen
        defaultValue="pro"
        listHeight={420}
        popupStyle={{ minWidth: 480 }}
        options={[
          { value: "pro", label: "专业方案", text: "专业方案" },
          { value: "team", label: "团队方案", text: "团队方案" },
        ]}
        optionRender={(option) => <span data-testid={`option-${option.value}`}>复杂内容 · {option.label}</span>}
        selectedRender={(option) => <span data-testid="selected-plan">已选：{option.label}</span>}
      />
    );

    expect(screen.getByTestId("selected-plan").textContent).toBe("已选：专业方案");
    expect(screen.getByTestId("option-pro").textContent).toBe("复杂内容 · 专业方案");
    expect(document.querySelector<HTMLElement>(".menu-options")?.style.maxHeight).toBe("420px");
    expect(document.querySelector<HTMLElement>(".menu")?.style.minWidth).toBe("480px");
    fireEvent.click(screen.getByRole("option", { name: /团队方案/ }));
    expect(screen.getByTestId("selected-plan").textContent).toBe("已选：团队方案");
  });

  it("Select 在等长选项更新后重新定位首个可用项", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Select
        defaultOpen
        onChange={onChange}
        options={[
          { value: "a", label: "A", disabled: true },
          { value: "b", label: "B" },
        ]}
      />
    );
    rerender(
      <Select
        defaultOpen
        onChange={onChange}
        options={[
          { value: "a", label: "A" },
          { value: "b", label: "B", disabled: true },
        ]}
      />
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger.getAttribute("aria-activedescendant")).toBe(
      screen.getByRole("option", { name: "A" }).id
    );
    fireEvent.keyDown(trigger, { key: "Enter" });
    expect(onChange).toHaveBeenLastCalledWith("a");
  });

  it("Cascader 分离复杂节点与已选路径渲染，并允许调整列高度", () => {
    const { container } = render(
      <Cascader
        defaultValue={["root", "leaf"]}
        listHeight={360}
        popupStyle={{ minWidth: 640 }}
        options={[
          {
            value: "root",
            label: "根节点",
            children: [{ value: "leaf", label: "叶子节点" }],
          },
        ]}
        optionRender={(option, info) => (
          <span data-testid={`cascader-option-${option.value}`}>{info.depth} · {option.label}</span>
        )}
        selectedRender={(selectedOptions) => (
          <span data-testid="cascader-selected">{selectedOptions.map((option) => option.label).join(" → ")}</span>
        )}
      />
    );

    expect(screen.getByTestId("cascader-selected").textContent).toBe("根节点 → 叶子节点");
    fireEvent.click(container.querySelector(".cascader-trigger")!);
    const panel = screen.getByRole("dialog", { name: "级联选择" });
    expect(panel.style.getPropertyValue("--cascader-list-height")).toBe("360px");
    expect(panel.style.minWidth).toBe("640px");
    expect(screen.getByTestId("cascader-option-root").textContent).toBe("0 · 根节点");
    expect(screen.getByTestId("cascader-option-leaf").textContent).toBe("1 · 叶子节点");
  });

  it("Form.Item 首屏应用 initialValue，并按 blur 校验", async () => {
    render(
      <Form>
        <Form.Item name="enabled" valuePropName="checked" initialValue><Checkbox aria-label="enabled" /></Form.Item>
        <Form.Item name="title" rules={[{ required: true }]} validateTrigger="onBlur"><Input aria-label="title" /></Form.Item>
      </Form>
    );
    expect((screen.getByRole("checkbox", { name: "enabled" }) as HTMLInputElement).checked).toBe(true);
    expect(screen.queryByRole("alert")).toBeNull();
    fireEvent.blur(screen.getByRole("textbox", { name: "title" }));
    await waitFor(() => expect(screen.getByRole("alert")).not.toBeNull());
  });

  it("Form.Item 不把 Select 自有浮层内的焦点切换当成失焦", async () => {
    render(
      <Form>
        <Form.Item name="kind" rules={[{ required: true }]} validateTrigger="onBlur">
          <Select searchable options={[{ value: "a", label: "选项 A" }]} />
        </Form.Item>
      </Form>
    );
    const trigger = screen.getByRole("combobox");
    trigger.focus();
    fireEvent.click(trigger);
    screen.getByPlaceholderText("搜索...").focus();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.queryByRole("alert")).toBeNull();

    fireEvent.click(screen.getByRole("option", { name: "选项 A" }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("Form.Item 不把 DatePicker 日历内的焦点切换当成失焦", async () => {
    render(
      <Form>
        <Form.Item name="date" rules={[{ required: true }]} validateTrigger="onBlur">
          <DatePicker />
        </Form.Item>
      </Form>
    );
    const input = screen.getByRole("textbox");
    fireEvent.focus(input);
    const day = screen.getAllByRole("gridcell").find((cell) => !(cell as HTMLButtonElement).disabled)!;
    fireEvent.focus(day);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.queryByRole("alert")).toBeNull();

    fireEvent.click(day);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("AutoComplete 过滤空值并暴露 combobox 关系", () => {
    render(<AutoComplete options={[{ value: "" }, { value: "ok" }]} />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    expect(input.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getAllByRole("option")).toHaveLength(1);
  });

  it("AutoComplete 失焦后安全关闭建议面板", async () => {
    render(
      <>
        <AutoComplete options={[{ value: "ok" }]} />
        <button type="button">外部操作</button>
      </>
    );
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    expect(screen.getByRole("listbox")).not.toBeNull();
    fireEvent.blur(input);
    screen.getByRole("button", { name: "外部操作" }).focus();
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  });

  it("ColorPicker 自定义 Button 不产生嵌套按钮且输入实时变更", () => {
    const onChange = vi.fn();
    const { container } = render(<ColorPicker onChange={onChange}><Button>颜色</Button></ColorPicker>);
    expect(container.querySelector("button button")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "颜色" }));
    fireEvent.change(screen.getByRole("textbox", { name: "十六进制颜色" }), { target: { value: "#123456" } });
    expect(onChange).toHaveBeenLastCalledWith("#123456");
  });

  it("ColorPicker 允许逐字符输入六位色值，并在失焦时提交三位简写", () => {
    const onChange = vi.fn();
    const onChangeComplete = vi.fn();
    render(<ColorPicker defaultOpen onChange={onChange} onChangeComplete={onChangeComplete} />);
    const input = screen.getByRole("textbox", { name: "十六进制颜色" }) as HTMLInputElement;

    fireEvent.change(input, { target: { value: "#1" } });
    fireEvent.change(input, { target: { value: "#12" } });
    fireEvent.change(input, { target: { value: "#123" } });
    expect(input.value).toBe("#123");
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: "#123456" } });
    expect(onChange).toHaveBeenLastCalledWith("#123456");
    fireEvent.change(input, { target: { value: "#abc" } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenLastCalledWith("#aabbcc");
    expect(onChangeComplete).toHaveBeenLastCalledWith("#aabbcc");
  });

  it("ColorPicker 安全包装普通函数触发器并阻止禁用链接行为", () => {
    /** 模拟一个不接收 ref 的普通函数组件。 */
    const FunctionButton: React.FC = () => <button type="button">函数触发器</button>;
    const disabledClick = vi.fn();
    const divRef = React.createRef<HTMLElement>();
    const { container } = render(
      <>
        <ColorPicker><FunctionButton /></ColorPicker>
        <ColorPicker disabled onClick={disabledClick}>
          <a href="#danger">禁用颜色链接</a>
        </ColorPicker>
        <ColorPicker ref={divRef}><div>块级触发器</div></ColorPicker>
      </>
    );
    expect(screen.getAllByRole("button", { name: "函数触发器" })).toHaveLength(1);
    expect(container.querySelector("[role='button'] button")).toBeNull();
    expect(fireEvent.click(screen.getByRole("link", { name: "禁用颜色链接" }))).toBe(false);
    expect(disabledClick).not.toHaveBeenCalled();
    expect(divRef.current?.tagName).toBe("DIV");
  });

  it("Calendar 按日期而不是时分秒判断 min，并支持方向键", () => {
    render(<Calendar value={new Date(2026, 4, 25)} viewDate={new Date(2026, 4, 25)} min={new Date(2026, 4, 25, 12)} />);
    const day = screen.getByRole("gridcell", { name: "2026-05-25" }) as HTMLButtonElement;
    expect(day.disabled).toBe(false);
    day.focus();
    fireEvent.keyDown(day, { key: "ArrowRight" });
    expect(document.activeElement).toBe(screen.getByRole("gridcell", { name: "2026-05-26" }));
  });

  it("Calendar 的纵向导航不会因前方禁用日期发生列偏移", () => {
    render(
      <Calendar
        value={new Date(2026, 6, 1)}
        viewDate={new Date(2026, 6, 1)}
        disabledDate={(date) => date.getDate() === 3}
      />
    );
    const firstDay = screen.getByRole("gridcell", { name: "2026-07-01" });
    firstDay.focus();
    fireEvent.keyDown(firstDay, { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByRole("gridcell", { name: "2026-07-08" }));
  });

  it("Calendar 选中日后来被禁用时仍保留可聚焦日期", () => {
    render(
      <Calendar
        value={new Date(2026, 6, 3)}
        viewDate={new Date(2026, 6, 3)}
        disabledDate={(date) => date.getDate() === 3}
      />
    );
    expect((screen.getByRole("gridcell", { name: "2026-07-01" }) as HTMLButtonElement).tabIndex).toBe(0);
  });

  it("DateTimePicker 选择日期时寻找可用时间", () => {
    const onChange = vi.fn();
    render(<DateTimePicker defaultOpen defaultValue={new Date(2026, 4, 25, 12)} disabledTime={(time) => time.hour !== 9} onChange={onChange} />);
    fireEvent.click(screen.getByRole("gridcell", { name: "2026-05-26" }));
    expect(onChange.mock.calls.at(-1)?.[0]).toEqual(new Date(2026, 4, 26, 9));
  });

  it("DateTimePicker 会禁用整日没有可用时间的日期", () => {
    render(
      <DateTimePicker
        defaultOpen
        defaultValue={new Date(2026, 4, 25, 9)}
        minuteStep={30}
        disabledTime={() => true}
      />
    );
    expect((screen.getByRole("gridcell", { name: "2026-05-25" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("Form Rule 严格区分 string、number 与字符串格式类型", async () => {
    const onFinishFailed = vi.fn();
    render(
      <Form
        initialValues={{ numericText: "123", nonString: 123, nonEmail: 456 }}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item name="numericText" rules={[{ type: "number" }]}><Input /></Form.Item>
        <Form.Item name="nonString" rules={[{ type: "string" }]}><Input /></Form.Item>
        <Form.Item name="nonEmail" rules={[{ type: "email" }]}><Input /></Form.Item>
        <Button type="submit">提交</Button>
      </Form>
    );
    fireEvent.click(screen.getByRole("button", { name: "提交" }));
    await waitFor(() => expect(onFinishFailed).toHaveBeenCalledTimes(1));
    const names = onFinishFailed.mock.calls[0][0].errorFields.map((field: { name: string }) => field.name);
    expect(names).toEqual(["numericText", "nonString", "nonEmail"]);
  });

  it("Input 受控清空不越权修改 DOM，InputNumber 透传并归一化", () => {
    render(<><Input value="fixed" allowClear onValueChange={() => undefined} /><InputNumber defaultValue={200} max={100} data-testid="number" aria-label="number" /></>);
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect((screen.getAllByRole("textbox")[0] as HTMLInputElement).value).toBe("fixed");
    const number = screen.getByRole("spinbutton", { name: "number" }) as HTMLInputElement;
    expect(number.value).toBe("100");
    expect(number.dataset.testid).toBe("number");
  });

  it("Form.Item 的空值不会让带精度的 InputNumber 步进崩溃", () => {
    const onValuesChange = vi.fn();
    render(
      <Form onValuesChange={onValuesChange}>
        <Form.Item name="amount">
          <InputNumber precision={2} />
        </Form.Item>
      </Form>
    );

    fireEvent.click(screen.getByRole("button", { name: "增加数值" }));
    expect((screen.getByRole("spinbutton") as HTMLInputElement).value).toBe("1");
    expect(onValuesChange).toHaveBeenLastCalledWith({ amount: 1 }, { amount: 1 });
  });

  it("Form.Item 把 required 关系落到 Select 的真实 combobox", () => {
    render(
      <Form>
        <Form.Item name="kind" label="类型" required>
          <Select options={[{ value: "a", label: "A" }]} />
        </Form.Item>
      </Form>
    );
    const trigger = screen.getByRole("combobox", { name: "类型" });
    expect(trigger.getAttribute("aria-required")).toBe("true");
    expect(trigger.id).not.toBe("");
  });

  it("Form.Item 为日期与数组控件提供正确空值并透传 wrapper ref/属性", () => {
    const itemRef = React.createRef<HTMLDivElement>();
    render(
      <Form>
        <Form.Item ref={itemRef} name="date" data-testid="date-item">
          <Calendar />
        </Form.Item>
        <Form.Item name="path">
          <Cascader options={[{ value: "a", label: "A" }]} />
        </Form.Item>
      </Form>
    );
    expect(itemRef.current).toBe(screen.getByTestId("date-item"));
    expect(screen.getByRole("grid")).not.toBeNull();
    expect(screen.getByRole("button", { name: /请选择/ })).not.toBeNull();
  });

  it("Form disabled 优先于子控件 false，并合并原有说明关系", () => {
    render(
      <Form disabled>
        <Form.Item name="title" help="帮助">
          <Input disabled={false} aria-describedby="consumer-help" />
        </Form.Item>
      </Form>
    );
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.disabled).toBe(true);
    expect(input.getAttribute("aria-describedby")).toContain("consumer-help");
    expect(input.getAttribute("aria-describedby")).toContain("-help");
  });

  it("RadioGroup 使用 name 与方向键，Select 自定义清除图标且禁用时不显示面板", () => {
    const onChange = vi.fn();
    const { rerender } = render(<RadioGroup name="plan" defaultValue="a" onChange={onChange} options={[{ value: "a", label: "A" }, { value: "b", label: "B" }]} />);
    const radios = screen.getAllByRole("radio") as HTMLInputElement[];
    expect(radios.every((radio) => radio.name === "plan")).toBe(true);
    radios[0].focus();
    fireEvent.keyDown(radios[0], { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith("b");
    rerender(<Select defaultValue="a" allowClear={{ clearIcon: <span data-testid="custom-clear">C</span> }} options={[{ value: "a", label: "A" }]} />);
    expect(screen.getByTestId("custom-clear")).not.toBeNull();
    rerender(<Select open disabled options={[{ value: "a", label: "A" }]} />);
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("独立同名 Radio 同步原生取消状态，RadioGroup 当前项失效时保留 Tab 入口", () => {
    const { container, rerender } = render(
      <>
        <Radio name="standalone" defaultChecked label="A" />
        <Radio name="standalone" label="B" />
      </>
    );
    fireEvent.click(screen.getByRole("radio", { name: "B" }));
    const standalone = screen.getAllByRole("radio") as HTMLInputElement[];
    expect(standalone.map((radio) => radio.checked)).toEqual([false, true]);
    expect(container.querySelectorAll(".radio.checked")).toHaveLength(1);

    rerender(
      <RadioGroup
        value="missing"
        options={[{ value: "a", label: "可用" }, { value: "b", label: "禁用", disabled: true }]}
      />
    );
    expect((screen.getByRole("radio", { name: "可用" }) as HTMLInputElement).tabIndex).toBe(0);
  });

  it("原生 Checkbox/Switch 可提交，Slider 透传属性并钳位，TimePicker 丢弃隐藏秒", () => {
    const onTimeChange = vi.fn();
    const { container } = render(<><form data-testid="form"><Checkbox name="agree" defaultChecked aria-label="agree" /><Switch name="enabled" defaultChecked aria-label="enabled" /></form><Slider defaultValue={200} data-testid="slider" ariaLabel="volume" /><TimePicker defaultValue="09:00" onChange={onTimeChange} /></>);
    const data = new FormData(screen.getByTestId("form") as HTMLFormElement);
    expect(data.get("agree")).toBe("on");
    expect(data.get("enabled")).toBe("on");
    expect(screen.getByTestId("slider")).not.toBeNull();
    expect(screen.getByRole("slider", { name: "volume" }).getAttribute("aria-valuenow")).toBe("100");
    const timeInput = container.querySelector(".time-picker input")!;
    fireEvent.change(timeInput, { target: { value: "09:30:45" } });
    fireEvent.blur(timeInput);
    expect(onTimeChange).toHaveBeenLastCalledWith("09:30", { hour: 9, minute: 30, second: 0 });
  });

  it("Slider 阻止 Home 默认滚动、禁用刻度并忽略零宽轨道", () => {
    const onChange = vi.fn();
    const { container } = render(
      <Slider defaultValue={50} marks={{ 25: "低", 75: "高" }} disabled onChange={onChange} />
    );
    expect((screen.getByRole("button", { name: "低" }) as HTMLButtonElement).disabled).toBe(true);

    const { container: activeContainer } = render(<Slider defaultValue={50} onChange={onChange} />);
    const thumb = screen.getAllByRole("slider").at(-1)!;
    const homeEvent = new KeyboardEvent("keydown", { key: "Home", bubbles: true, cancelable: true });
    fireEvent(thumb, homeEvent);
    expect(homeEvent.defaultPrevented).toBe(true);

    const callsBeforeZeroWidthPointer = onChange.mock.calls.length;
    fireEvent.pointerDown(activeContainer.querySelector(".slider-track")!, { clientX: 10, pointerId: 1 });
    expect(onChange).toHaveBeenCalledTimes(callsBeforeZeroWidthPointer);
    expect(container.querySelectorAll("button:disabled")).toHaveLength(2);

    const { container: edgeMarksContainer } = render(
      <Slider marks={{ 0: "0°C", 50: "50°C", 100: "100°C" }} />
    );
    expect(edgeMarksContainer.querySelector(".slider-mark.edge-start")?.textContent).toBe("0°C");
    expect(edgeMarksContainer.querySelector(".slider-mark.edge-end")?.textContent).toBe("100°C");
  });

  it("Slider 区间拇指交叉后继续拖动同一端", () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function () {
      if (this.classList.contains("slider-track")) {
        return {
          x: 0, y: 0, top: 0, right: 100, bottom: 10, left: 0,
          width: 100, height: 10, toJSON: () => ({}),
        };
      }
      return {
        x: 0, y: 0, top: 0, right: 0, bottom: 0, left: 0,
        width: 0, height: 0, toJSON: () => ({}),
      };
    });
    const { container } = render(<Slider range defaultValue={[40, 60]} />);
    const track = container.querySelector(".slider-track")!;
    const firstThumb = screen.getAllByRole("slider")[0];
    fireEvent.pointerDown(firstThumb, { pointerId: 1, clientX: 40 });
    fireEvent.pointerMove(track, { pointerId: 1, clientX: 80 });
    fireEvent.pointerMove(track, { pointerId: 1, clientX: 90 });
    expect(screen.getAllByRole("slider").map((thumb) => thumb.getAttribute("aria-valuenow"))).toEqual(["60", "90"]);
  });
});
