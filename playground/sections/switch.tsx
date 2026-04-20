import * as React from "react";
import { Switch } from "lumina";
import { DocPage } from "../docs";
import { Row } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

const SectionSwitch: React.FC<SectionCtx> = () => {
  const [v, setV] = React.useState(true);
  return (
    <DocPage
      whenToUse={<p>表示两种相互对立状态的切换,例如开/关、启用/禁用。</p>}
      demos={[
        {
          id: "basic",
          title: "基础用法",
          code: `<Switch checked={v} onChange={setV} label="开启通知" />`,
          render: () => (
            <Row>
              <Switch checked={v} onChange={setV} label="开启通知" />
            </Row>
          ),
        },
        {
          id: "size",
          title: "尺寸",
          description: "提供 sm / md 两档。",
          code: `<Switch size="sm" defaultChecked />
<Switch defaultChecked />`,
          render: () => (
            <Row>
              <Switch size="sm" defaultChecked />
              <Switch defaultChecked />
            </Row>
          ),
        },
        {
          id: "disabled",
          title: "禁用",
          code: `<Switch disabled label="不可用" />
<Switch disabled defaultChecked label="禁用且开启" />`,
          render: () => (
            <Row>
              <Switch disabled label="不可用" />
              <Switch disabled defaultChecked label="禁用且开启" />
            </Row>
          ),
        },
      ]}
      api={[
        {
          title: "Switch",
          rows: [
            { prop: "checked / defaultChecked", description: "受控/初始", type: "boolean" },
            { prop: "onChange", description: "状态变更", type: "(checked: boolean) => void" },
            { prop: "label", description: "右侧文案", type: "ReactNode" },
            { prop: "size", description: "尺寸", type: `"sm" | "md"`, default: `"md"` },
            { prop: "disabled", description: "禁用", type: "boolean", default: "false" },
          ],
        },
      ]}
    />
  );
};

export default defineSection({
  id: "switch",
  group: "表单",
  order: 20,
  label: "Switch 开关",
  eyebrow: "DATA ENTRY",
  title: "Switch 开关",
  desc: "二元状态切换器。",
  Component: SectionSwitch,
});
