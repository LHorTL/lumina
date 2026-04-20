import * as React from "react";
import { Checkbox, Divider } from "lumina";
import { DocPage } from "../docs";
import { Row } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

const SectionCheckbox: React.FC<SectionCtx> = () => {
  const [s, setS] = React.useState({ a: true, b: false, c: true });
  const all = s.a && s.b && s.c;
  const some = (s.a || s.b || s.c) && !all;
  return (
    <DocPage
      whenToUse={<p>在一组选项中进行多项选择,或单独切换某个开关项。</p>}
      demos={[
        {
          id: "basic",
          title: "基础用法",
          code: `<Checkbox checked={v} onChange={setV} label="同意协议" />`,
          render: () => (
            <Row>
              <Checkbox defaultChecked label="自动保存" />
              <Checkbox label="启用实验功能" />
              <Checkbox disabled label="已锁定" />
            </Row>
          ),
        },
        {
          id: "indeterminate",
          title: "全选/半选",
          description: "indeterminate 用来表示部分选中。",
          code: `<Checkbox indeterminate={some} checked={all} onChange={...} label="全选" />`,
          render: () => (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Checkbox
                checked={all}
                indeterminate={some}
                onChange={(v) => setS({ a: v, b: v, c: v })}
                label="全选"
              />
              <Divider />
              <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 22 }}>
                <Checkbox checked={s.a} onChange={(v) => setS((c) => ({ ...c, a: v }))} label="选项 A" />
                <Checkbox checked={s.b} onChange={(v) => setS((c) => ({ ...c, b: v }))} label="选项 B" />
                <Checkbox checked={s.c} onChange={(v) => setS((c) => ({ ...c, c: v }))} label="选项 C" />
              </div>
            </div>
          ),
        },
      ]}
      api={[
        {
          title: "Checkbox",
          rows: [
            { prop: "checked / defaultChecked", description: "受控/初始", type: "boolean" },
            { prop: "indeterminate", description: "半选态", type: "boolean", default: "false" },
            { prop: "onChange", description: "变更", type: "(checked: boolean) => void" },
            { prop: "label", description: "右侧文案", type: "ReactNode" },
            { prop: "disabled", description: "禁用", type: "boolean", default: "false" },
          ],
        },
      ]}
    />
  );
};

export default defineSection({
  id: "checkbox",
  group: "表单",
  order: 30,
  label: "Checkbox 复选框",
  eyebrow: "DATA ENTRY",
  title: "Checkbox 复选框",
  desc: "在一组选项中进行多项选择,或独立切换某个开关项。",
  Component: SectionCheckbox,
});
