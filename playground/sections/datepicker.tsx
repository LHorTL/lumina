import * as React from "react";
import { Button, DatePicker, Input, Modal } from "lumina";
import { DocPage } from "../docs";
import { Field, Row } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

/** 将当前日期转换为演示用的本地日期文本。 */
const formatLocalDate = (date: Date | null) => {
  if (!date) return "未选择";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/** 将日期格式化为点分隔文本。 */
const formatDotDate = (date: Date) =>
  `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;

/** 解析点分隔日期文本。 */
const parseDotDate = (input: string): Date | null => {
  const match = input.trim().match(/^(\d{4})\.(\d{1,2})\.(\d{1,2})$/);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
};

/** 展示日期选择器的值、显隐状态与关闭后的键盘交互。 */
const SectionDatePicker: React.FC<SectionCtx> = () => {
  const [date, setDate] = React.useState<Date | null>(new Date(2026, 4, 25));
  const [workday, setWorkday] = React.useState<Date | null>(new Date(2026, 4, 26));
  const [standaloneOpen, setStandaloneOpen] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [controlledPickerOpen, setControlledPickerOpen] = React.useState(false);

  return (
    <DocPage
      whenToUse={
        <>
          <p>在表单里选择日期。需要一直展示完整月视图时用 Calendar;需要输入框触发浮层选择时用 DatePicker。浮层内可点击年份或月份快速切换。</p>
          <ul className="doc-usecase-list">
            <li>表单、筛选器、计划时间等只需要选择某一天的场景</li>
            <li>需要 min / max / disabledDate 限制可选日期</li>
            <li>需要快速切换年份或月份,再选择具体日期</li>
            <li>需要用户手动输入 YYYY-MM-DD 一类日期文本</li>
          </ul>
        </>
      }
      demos={[
        {
          id: "basic",
          title: "基础用法",
          code: `<DatePicker defaultValue={new Date(2026, 4, 25)} />`,
          render: () => (
            <Field label="发布日期">
              <DatePicker defaultValue={new Date(2026, 4, 25)} />
            </Field>
          ),
        },
        {
          id: "focus-restoration",
          title: "关闭与焦点归还",
          description: "确定、选中日期、今天、清空或 Esc 关闭后，焦点回到输入框并保持关闭。可重复点击、按 Enter / ↓ 或通过 Tab 重新进入；点击外部控件后焦点留在该控件。",
          span: 2,
          code: `<DatePicker defaultValue={new Date(2027, 6, 7)} allowClear />`,
          render: () => (
            <Row>
              <DatePicker
                aria-label="独立日期"
                defaultValue={new Date(2027, 6, 7)}
                allowClear
                onOpenChange={setStandaloneOpen}
              />
              <span role="status" aria-label="独立浮层状态">{standaloneOpen ? "浮层已打开" : "浮层已关闭"}</span>
              <Input aria-label="下一个字段" placeholder="点击此处验证焦点" />
            </Row>
          ),
        },
        {
          id: "modal-controlled",
          title: "弹窗内受控日期与显隐",
          description: "value 与 open 分别受控。关闭日期浮层后可继续键盘操作，再按 Esc 关闭父弹窗。",
          span: 2,
          code: `const [date, setDate] = useState<Date | null>(new Date());
const [modalOpen, setModalOpen] = useState(false);
const [open, setOpen] = useState(false);
<>
  <Button onClick={() => setModalOpen(true)}>打开日期表单</Button>
  <Modal open={modalOpen} title="日期表单" footer={null}
    onCancel={() => { setModalOpen(false); setOpen(false); }}>
    <DatePicker value={date} onChange={setDate} open={open} onOpenChange={setOpen} allowClear />
  </Modal>
</>`,
          render: () => (
            <>
              <Button onClick={() => setModalOpen(true)}>打开日期表单</Button>
              <Modal
                open={modalOpen}
                title="日期表单"
                footer={null}
                onCancel={() => { setModalOpen(false); setControlledPickerOpen(false); }}
              >
                <Field label="计划日期">
                  <DatePicker
                    aria-label="弹窗日期"
                    value={date}
                    onChange={setDate}
                    open={controlledPickerOpen}
                    onOpenChange={setControlledPickerOpen}
                    allowClear
                  />
                  <span role="status" aria-label="受控日期状态">{formatLocalDate(date)} · {controlledPickerOpen ? "浮层已打开" : "浮层已关闭"}</span>
                  <Input aria-label="弹窗备注" placeholder="关闭日历后可继续填写" />
                </Field>
              </Modal>
            </>
          ),
        },
        {
          id: "controlled",
          title: "受控",
          description: "value 使用 Date | null,onChange 同时返回 Date 和格式化字符串。",
          span: 2,
          code: `const [date, setDate] = useState<Date | null>(new Date());
<DatePicker value={date} onChange={setDate} allowClear />`,
          render: () => (
            <Row gap={16}>
              <Field label="计划日期">
                <DatePicker value={date} onChange={setDate} allowClear />
              </Field>
              <Field label="当前值">
                <span style={{ fontSize: 13, color: "var(--fg-muted)" }}>{formatLocalDate(date)}</span>
              </Field>
            </Row>
          ),
        },
        {
          id: "constraints",
          title: "限制范围",
          description: "min / max 与 disabledDate 会同步作用于 Calendar 单元格和手动输入。",
          span: 2,
          code: `<DatePicker
  value={workday}
  onChange={setWorkday}
  min={new Date(2026, 4, 1)}
  max={new Date(2026, 4, 31)}
  disabledDate={(date) => date.getDay() === 0 || date.getDay() === 6}
/>`,
          render: () => (
            <Row gap={16}>
              <Field label="工作日">
                <DatePicker
                  value={workday}
                  onChange={setWorkday}
                  min={new Date(2026, 4, 1)}
                  max={new Date(2026, 4, 31)}
                  disabledDate={(next) => next.getDay() === 0 || next.getDay() === 6}
                />
              </Field>
              <Field label="说明" hint="周末不可选,范围限制在 2026 年 5 月。">
                <span style={{ fontSize: 13, color: "var(--fg-muted)" }}>{formatLocalDate(workday)}</span>
              </Field>
            </Row>
          ),
        },
        {
          id: "format-size",
          title: "格式与尺寸",
          span: 2,
          code: `<DatePicker size="sm" format="YYYY/MM/DD" />
<DatePicker format="YYYY年MM月DD日" />
<DatePicker size="lg" disabled />`,
          render: () => (
            <Row gap={16}>
              <Field label="sm / slash">
                <DatePicker size="sm" format="YYYY/MM/DD" defaultValue={new Date(2026, 4, 25)} />
              </Field>
              <Field label="md / 中文">
                <DatePicker format="YYYY年MM月DD日" defaultValue={new Date(2026, 4, 25)} />
              </Field>
              <Field label="lg / disabled">
                <DatePicker size="lg" disabled defaultValue={new Date(2026, 4, 25)} />
              </Field>
            </Row>
          ),
        },
        {
          id: "custom-parser",
          title: "自定义格式与解析",
          code: `<DatePicker format={formatDotDate} parse={parseDotDate} />`,
          render: () => <DatePicker defaultValue={new Date(2026, 4, 25)} format={formatDotDate} parse={parseDotDate} />,
        },
      ]}
      api={[
        {
          title: "DatePicker",
          rows: [
            { prop: "value / defaultValue", description: "受控/初始日期", type: "Date | null" },
            { prop: "onChange", description: "选择或清空时触发", type: "(date: Date | null, dateString: string) => void" },
            { prop: "format", description: "显示格式或自定义格式化函数", type: `"YYYY-MM-DD" | "YYYY/MM/DD" | "YYYY年MM月DD日" | ((date) => string)`, default: `"YYYY-MM-DD"` },
            { prop: "parse", description: "自定义 format 函数对应的输入解析器", type: "(input: string) => Date | null" },
            { prop: "min / max", description: "可选日期范围", type: "Date" },
            { prop: "disabledDate", description: "自定义禁用日期", type: "(date: Date) => boolean" },
            { prop: "size", description: "输入框尺寸", type: `"sm" | "md" | "lg"`, default: `"md"` },
            { prop: "allowClear", description: "允许清空", type: "boolean", default: "false" },
            { prop: "open / defaultOpen / onOpenChange", description: "受控/初始显隐及变化回调；关闭后的焦点归还不会再次请求打开", type: "—" },
            { prop: "popupClassName / dropdownClassName", description: "浮层 className", type: "string" },
            { prop: "disabled / readOnly / invalid / placeholder", description: "常规输入状态", type: "—" },
          ],
        },
      ]}
    />
  );
};

export default defineSection({
  id: "datepicker",
  group: "表单",
  order: 75,
  label: "DatePicker 日期选择",
  eyebrow: "DATA ENTRY",
  title: "DatePicker 日期选择",
  desc: "输入框触发的日期选择器,复用 Calendar 并支持范围、禁用日期和格式化。",
  Component: SectionDatePicker,
});
