import * as React from "react";
import { DateTimePicker } from "lumina";
import { DocPage } from "../docs";
import { Field, Row } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

const formatLocalDateTime = (date: Date | null, includeSecond = false) => {
  if (!date) return "未选择";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  const second = String(date.getSeconds()).padStart(2, "0");
  return includeSecond
    ? `${year}-${month}-${day} ${hour}:${minute}:${second}`
    : `${year}-${month}-${day} ${hour}:${minute}`;
};

/** 将日期时间格式化为斜杠日期文本。 */
const formatSlashDateTime = (date: Date) =>
  `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

/** 解析斜杠日期时间文本。 */
const parseSlashDateTime = (input: string): Date | null => {
  const match = input.trim().match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{1,2})$/);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), Number(match[4]), Number(match[5]));
  return Number.isNaN(date.getTime()) ? null : date;
};

const SectionDateTimePicker: React.FC<SectionCtx> = () => {
  const [startAt, setStartAt] = React.useState<Date | null>(new Date(2026, 4, 25, 9, 30));
  const [deployAt, setDeployAt] = React.useState<Date | null>(new Date(2026, 4, 25, 14, 45, 30));
  const [bookAt, setBookAt] = React.useState<Date | null>(new Date(2026, 4, 26, 10, 30));

  return (
    <DocPage
      whenToUse={
        <>
          <p>在一个输入框里选择完整日期时间。只选日期用 DatePicker;只选一天内时间用 TimePicker。日期区域支持快速切换年份和月份。</p>
          <ul className="doc-usecase-list">
            <li>预约开始时间、发布计划、提醒触发时间等需要精确到时分的场景</li>
            <li>需要 Calendar 和时间列在同一个浮层内完成选择</li>
            <li>需要 min / max / disabledDate / disabledTime 同时约束日期和时间</li>
          </ul>
        </>
      }
      demos={[
        {
          id: "basic",
          title: "基础用法",
          description: "确认或 Esc 关闭后焦点回到输入框并保持关闭；再次点击、Enter / ↓ 或 Tab 重新进入可展开。",
          code: `<DateTimePicker defaultValue={new Date(2026, 4, 25, 9, 30)} />`,
          render: () => (
            <Field label="开始时间">
              <DateTimePicker defaultValue={new Date(2026, 4, 25, 9, 30)} />
            </Field>
          ),
        },
        {
          id: "controlled",
          title: "受控",
          description: "value 使用 Date | null,onChange 同时返回 Date 和格式化字符串。",
          span: 2,
          code: `const [startAt, setStartAt] = useState<Date | null>(new Date(2026, 4, 25, 9, 30));
<DateTimePicker value={startAt} onChange={setStartAt} allowClear />`,
          render: () => (
            <Row gap={16}>
              <Field label="会议开始">
                <DateTimePicker value={startAt} onChange={setStartAt} allowClear />
              </Field>
              <Field label="当前值">
                <span style={{ fontSize: 13, color: "var(--fg-muted)" }}>
                  {formatLocalDateTime(startAt)}
                </span>
              </Field>
            </Row>
          ),
        },
        {
          id: "seconds",
          title: "秒级选择",
          span: 2,
          code: `<DateTimePicker
  value={deployAt}
  onChange={setDeployAt}
  format="YYYY-MM-DD HH:mm:ss"
  showSecond
/>`,
          render: () => (
            <Row gap={16}>
              <Field label="发布时间">
                <DateTimePicker
                  value={deployAt}
                  onChange={setDeployAt}
                  format="YYYY-MM-DD HH:mm:ss"
                  showSecond
                  allowClear
                />
              </Field>
              <Field label="当前值">
                <span style={{ fontSize: 13, color: "var(--fg-muted)" }}>
                  {formatLocalDateTime(deployAt, true)}
                </span>
              </Field>
            </Row>
          ),
        },
        {
          id: "constraints",
          title: "范围与步进",
          description: "15 分钟粒度,只允许工作日 08:00 到 20:00 之间的时间。",
          span: 2,
          code: `<DateTimePicker
  min={new Date(2026, 4, 1, 8)}
  max={new Date(2026, 4, 31, 20)}
  minuteStep={15}
  disabledDate={(date) => date.getDay() === 0 || date.getDay() === 6}
  disabledTime={(time) => time.hour === 12}
/>`,
          render: () => (
            <Row gap={16}>
              <Field label="可预约时间" hint="周末不可选,12 点整段被 disabledTime 禁用。">
                <DateTimePicker
                  value={bookAt}
                  onChange={setBookAt}
                  min={new Date(2026, 4, 1, 8)}
                  max={new Date(2026, 4, 31, 20)}
                  minuteStep={15}
                  disabledDate={(next) => next.getDay() === 0 || next.getDay() === 6}
                  disabledTime={(time) => time.hour === 12}
                />
              </Field>
              <Field label="当前值">
                <span style={{ fontSize: 13, color: "var(--fg-muted)" }}>
                  {formatLocalDateTime(bookAt)}
                </span>
              </Field>
            </Row>
          ),
        },
        {
          id: "size-state",
          title: "尺寸与状态",
          span: 2,
          code: `<DateTimePicker size="sm" />
<DateTimePicker invalid />
<DateTimePicker size="lg" disabled />`,
          render: () => (
            <Row gap={16}>
              <Field label="sm">
                <DateTimePicker size="sm" defaultValue={new Date(2026, 4, 25, 8)} />
              </Field>
              <Field label="invalid">
                <DateTimePicker invalid defaultValue={new Date(2026, 4, 25, 9)} placeholder="错误态" />
              </Field>
              <Field label="lg / disabled">
                <DateTimePicker size="lg" disabled defaultValue={new Date(2026, 4, 25, 18, 30)} />
              </Field>
            </Row>
          ),
        },
        {
          id: "custom-parser",
          title: "自定义格式与解析",
          code: `<DateTimePicker format={formatSlashDateTime} parse={parseSlashDateTime} />`,
          render: () => <DateTimePicker defaultValue={new Date(2026, 4, 25, 9, 30)} format={formatSlashDateTime} parse={parseSlashDateTime} />,
        },
      ]}
      api={[
        {
          title: "DateTimePicker",
          rows: [
            { prop: "value / defaultValue", description: "受控/初始日期时间", type: "Date | null" },
            { prop: "onChange", description: "选择或清空时触发", type: "(date: Date | null, dateString: string) => void" },
            { prop: "format", description: "显示格式或自定义格式化函数", type: `"YYYY-MM-DD HH:mm" | "YYYY-MM-DD HH:mm:ss" | ((date) => string)`, default: `"YYYY-MM-DD HH:mm"` },
            { prop: "parse", description: "自定义 format 函数对应的输入解析器", type: "(input: string) => Date | null" },
            { prop: "showSecond", description: "显示秒列", type: "boolean" },
            { prop: "hourStep / minuteStep / secondStep", description: "列选项步进", type: "number", default: "1" },
            { prop: "min / max", description: "可选日期时间范围", type: "Date" },
            { prop: "disabledDate", description: "自定义禁用日期", type: "(date: Date) => boolean" },
            { prop: "disabledTime", description: "按当前日期禁用具体时间", type: "(time: TimePickerValue, date: Date) => boolean" },
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
  id: "datetimepicker",
  group: "表单",
  order: 76,
  label: "DateTimePicker 日期时间选择",
  eyebrow: "DATA ENTRY",
  title: "DateTimePicker 日期时间选择",
  desc: "输入框触发的日期时间选择器,把 Calendar 与时分秒列组合在同一个浮层内。",
  Component: SectionDateTimePicker,
});
