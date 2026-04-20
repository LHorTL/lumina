import * as React from "react";
import { Button, ColorPicker } from "lumina";
import { DocPage } from "../docs";
import { Field, Row } from "./_shared";
import { defineSection, type SectionCtx } from "./_types";

const SectionColorPicker: React.FC<SectionCtx> = () => {
  const [color, setColor] = React.useState("#845ef7");
  const [brand, setBrand] = React.useState("#51cf66");
  return (
    <DocPage
      whenToUse={
        <>
          <p>
            让用户从色域、色相、预设或十六进制输入中挑选一个颜色,适合主题配色、标签
            着色、品牌主色选择等场景。
          </p>
          <ul className="doc-usecase-list">
            <li>需要自定义颜色而预设色板不够用</li>
            <li>想让用户直观地用鼠标拖动选色</li>
            <li>需要把颜色持久化到后端、状态或 URL</li>
          </ul>
        </>
      }
      demos={[
        {
          id: "basic",
          title: "基础用法",
          description: "非受控用法,点击色块弹出面板。",
          code: `<ColorPicker defaultValue="#ff6b6b" onChange={setColor} />`,
          render: () => (
            <Row>
              <ColorPicker defaultValue="#ff6b6b" />
              <ColorPicker defaultValue="#22b8cf" />
              <ColorPicker defaultValue="#51cf66" />
            </Row>
          ),
        },
        {
          id: "controlled",
          title: "受控",
          description: "实时同步 value,失焦 / 拖拽结束时再调用 onChangeComplete。",
          code: `<ColorPicker value={color} onChange={setColor} showText />`,
          render: () => (
            <Field label={`当前:${color}`}>
              <ColorPicker value={color} onChange={setColor} showText />
            </Field>
          ),
        },
        {
          id: "size",
          title: "尺寸",
          code: `<ColorPicker size="sm" />
<ColorPicker />
<ColorPicker size="lg" />`,
          render: () => (
            <Row>
              <ColorPicker size="sm" defaultValue="#fd7e14" />
              <ColorPicker defaultValue="#fd7e14" />
              <ColorPicker size="lg" defaultValue="#fd7e14" />
            </Row>
          ),
        },
        {
          id: "disabled",
          title: "禁用",
          code: `<ColorPicker disabled defaultValue="#868e96" />`,
          render: () => (
            <Row>
              <ColorPicker disabled defaultValue="#868e96" showText />
            </Row>
          ),
        },
        {
          id: "presets",
          title: "自定义预设",
          description: "presets 传入十六进制数组,面板底部会渲染一排色块。",
          code: `<ColorPicker
  presets={["#ff6b6b", "#ffd43b", "#51cf66", "#339af0", "#845ef7"]}
/>`,
          render: () => (
            <Row>
              <ColorPicker
                defaultValue="#51cf66"
                presets={[
                  "#ff6b6b",
                  "#ffd43b",
                  "#51cf66",
                  "#339af0",
                  "#845ef7",
                  "#f06595",
                ]}
                showText
              />
            </Row>
          ),
        },
        {
          id: "custom-trigger",
          title: "自定义触发器",
          description: "将 children 作为触发器;色块容器会继承传入的交互元素。",
          span: 2,
          code: `<ColorPicker value={brand} onChange={setBrand}>
  <Button icon="palette">品牌色 · {brand}</Button>
</ColorPicker>`,
          render: () => (
            <ColorPicker value={brand} onChange={setBrand}>
              <Button icon="palette" variant="primary">
                品牌色 · {brand}
              </Button>
            </ColorPicker>
          ),
        },
      ]}
      api={[
        {
          title: "ColorPicker",
          rows: [
            { prop: "value / defaultValue", description: "十六进制颜色", type: "string", default: `"#845ef7"` },
            { prop: "onChange", description: "每次变化触发(拖拽 / 输入 / 预设点击)", type: "(hex: string) => void" },
            { prop: "onChangeComplete", description: "拖拽/输入结束触发", type: "(hex: string) => void" },
            { prop: "size", description: "触发器尺寸", type: `"sm" | "md" | "lg"`, default: `"md"` },
            { prop: "placement", description: "面板位置", type: `"top" | "bottom" | "left" | "right"`, default: `"bottom"` },
            { prop: "presets", description: "预设色数组", type: "string[]" },
            { prop: "showText", description: "触发器右侧显示 hex", type: "boolean", default: "false" },
            { prop: "disabled", description: "禁用", type: "boolean", default: "false" },
            { prop: "open / defaultOpen / onOpenChange", description: "受控面板显隐", type: "—" },
            { prop: "children", description: "自定义触发器", type: "ReactNode" },
          ],
        },
      ]}
    />
  );
};

export default defineSection({
  id: "colorpicker",
  group: "表单",
  order: 80,
  label: "ColorPicker 颜色选择",
  eyebrow: "DATA ENTRY",
  title: "ColorPicker 颜色选择",
  desc: "拟态风格的颜色选择器:HSV 色域、色相、hex 输入、预设调色板。",
  Component: SectionColorPicker,
});
