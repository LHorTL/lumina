import * as React from "react";
import { TimePicker } from "lumina";
import { DocPage } from "../docs";
import { Field, Row } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

const SectionTimePicker: React.FC<SectionCtx> = () => {
  const [time, setTime] = React.useState<string | null>("09:30");
  const [precise, setPrecise] = React.useState<string | null>("14:45:30");

  return (
    <DocPage
      whenToUse={
        <>
          <p>在表单里选择一天内的时间。日期用 DatePicker;只需要小时、分钟、秒时用 TimePicker。</p>
          <ul className="doc-usecase-list">
            <li>预约、排班、定时任务、提醒时间等只关心时分秒的场景</li>
            <li>需要 minuteStep / secondStep 做 5 分钟、15 分钟这类粒度控制</li>
            <li>需要 min / max / disabledTime 限制可选时间窗口</li>
          </ul>
        </>
      }
      demos={[
        {
          id: "basic",
          title: "基础用法",
          description: "确认或 Esc 关闭后焦点回到输入框并保持关闭；再次点击、Enter / ↓ 或 Tab 重新进入可展开。",
          code: `<TimePicker defaultValue="09:30" />`,
          render: () => (
            <Field label="开始时间">
              <TimePicker defaultValue="09:30" />
            </Field>
          ),
        },
        {
          id: "controlled",
          title: "受控",
          description: "value 是 HH:mm / HH:mm:ss 字符串或 null,onChange 第二个参数返回结构化 time。",
          span: 2,
          code: `const [time, setTime] = useState<string | null>("09:30");
<TimePicker value={time} onChange={setTime} allowClear />`,
          render: () => (
            <Row gap={16}>
              <Field label="提醒时间">
                <TimePicker value={time} onChange={setTime} allowClear />
              </Field>
              <Field label="当前值">
                <span style={{ fontSize: 13, color: "var(--fg-muted)" }}>{time ?? "未选择"}</span>
              </Field>
            </Row>
          ),
        },
        {
          id: "seconds",
          title: "秒级选择",
          span: 2,
          code: `<TimePicker
  value={precise}
  onChange={setPrecise}
  format="HH:mm:ss"
  showSecond
/>`,
          render: () => (
            <Row gap={16}>
              <Field label="精确时间">
                <TimePicker
                  value={precise}
                  onChange={setPrecise}
                  format="HH:mm:ss"
                  showSecond
                  allowClear
                />
              </Field>
              <Field label="当前值">
                <span style={{ fontSize: 13, color: "var(--fg-muted)" }}>{precise ?? "未选择"}</span>
              </Field>
            </Row>
          ),
        },
        {
          id: "range-step",
          title: "范围与步进",
          description: "15 分钟粒度,只允许 08:00 到 20:00 之间的时间。",
          span: 2,
          code: `<TimePicker
  min="08:00"
  max="20:00"
  minuteStep={15}
  disabledTime={(time) => time.hour === 12}
/>`,
          render: () => (
            <Field label="可预约时间" hint="12 点整段被 disabledTime 禁用。">
              <TimePicker
                defaultValue="09:30"
                min="08:00"
                max="20:00"
                minuteStep={15}
                disabledTime={(next) => next.hour === 12}
              />
            </Field>
          ),
        },
        {
          id: "size-state",
          title: "尺寸与状态",
          span: 2,
          code: `<TimePicker size="sm" />
<TimePicker invalid />
<TimePicker size="lg" disabled />`,
          render: () => (
            <Row gap={16}>
              <Field label="sm">
                <TimePicker size="sm" defaultValue="08:00" />
              </Field>
              <Field label="invalid">
                <TimePicker invalid defaultValue="09:00" placeholder="错误态" />
              </Field>
              <Field label="lg / disabled">
                <TimePicker size="lg" disabled defaultValue="18:30" />
              </Field>
            </Row>
          ),
        },
      ]}
      api={[
        {
          title: "TimePicker",
          rows: [
            { prop: "value / defaultValue", description: "受控/初始时间", type: "string | null" },
            { prop: "onChange", description: "选择或清空时触发", type: "(value: string | null, time: TimePickerValue | null) => void" },
            { prop: "format", description: "输出和显示格式", type: `"HH:mm" | "HH:mm:ss"`, default: `"HH:mm"` },
            { prop: "showSecond", description: "显示秒列", type: "boolean" },
            { prop: "hourStep / minuteStep / secondStep", description: "列选项步进", type: "number", default: "1" },
            { prop: "min / max", description: "可选时间范围", type: "string" },
            { prop: "disabledTime", description: "自定义禁用时间", type: "(time: TimePickerValue) => boolean" },
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
  id: "timepicker",
  group: "表单",
  order: 77,
  label: "TimePicker 时间选择",
  eyebrow: "DATA ENTRY",
  title: "TimePicker 时间选择",
  desc: "输入框触发的时分秒选择器,支持步进、范围、禁用时间和秒级选择。",
  Component: SectionTimePicker,
});
