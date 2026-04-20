import * as React from "react";
import { Calendar } from "lumina";
import { DocPage } from "../docs";
import { defineSection, type SectionCtx } from "./_types";

const SectionCalendar: React.FC<SectionCtx> = () => {
  const [date, setDate] = React.useState<Date>(new Date());
  const [workDate, setWorkDate] = React.useState<Date>(new Date());
  return (
    <DocPage
      whenToUse={<p>查看与选择日期。</p>}
      demos={[
        {
          id: "basic",
          title: "基础用法",
          span: 2,
          code: `<Calendar value={date} onChange={setDate} />`,
          render: () => (
            <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
              <Calendar value={date} onChange={setDate} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 8 }}>
                <div className="showcase-label">已选日期</div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 18,
                    fontWeight: 600,
                    color: "var(--accent-ink)",
                  }}
                >
                  {date.toISOString().slice(0, 10)}
                </div>
                <div style={{ color: "var(--fg-muted)", fontSize: 13 }}>点击日期切换。</div>
              </div>
            </div>
          ),
        },
        {
          id: "disabled-date",
          title: "禁用日期",
          description: "通过 disabledDate 将周末标灰并禁止点击;与 min/max 可叠加使用。",
          span: 2,
          code: `<Calendar
  value={workDate}
  onChange={setWorkDate}
  disabledDate={(d) => d.getDay() === 0 || d.getDay() === 6}
/>`,
          render: () => (
            <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
              <Calendar
                value={workDate}
                onChange={setWorkDate}
                disabledDate={(d) => d.getDay() === 0 || d.getDay() === 6}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 8 }}>
                <div className="showcase-label">工作日选择</div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 18,
                    fontWeight: 600,
                    color: "var(--accent-ink)",
                  }}
                >
                  {workDate.toISOString().slice(0, 10)}
                </div>
                <div style={{ color: "var(--fg-muted)", fontSize: 13 }}>周末被禁用。</div>
              </div>
            </div>
          ),
        },
      ]}
      api={[
        {
          title: "Calendar",
          rows: [
            { prop: "value / defaultValue", description: "受控/初始日期", type: "Date" },
            { prop: "onChange", description: "选择回调", type: "(date: Date) => void" },
            { prop: "min / max", description: "可选范围", type: "Date" },
            {
              prop: "disabledDate",
              description: "自定义禁用判断,返回 true 的日期不可选",
              type: "(date: Date) => boolean",
            },
          ],
        },
      ]}
    />
  );
};

export default defineSection({
  id: "calendar",
  group: "数据展示",
  order: 110,
  label: "Calendar 日历",
  eyebrow: "DATA DISPLAY",
  title: "Calendar 日历",
  desc: "查看与选择日期。",
  Component: SectionCalendar,
});
