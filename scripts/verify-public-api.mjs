#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const requireFromRoot = createRequire(path.join(ROOT, "package.json"));

// 公共导出运行时检查只关心 JS 符号；组件入口携带的 CSS 副作用在 Node 中用空加载器跳过。
requireFromRoot.extensions[".css"] = () => undefined;

function readJson(filepath) {
  return JSON.parse(fs.readFileSync(filepath, "utf8"));
}

function readBarrelExports() {
  const source = fs.readFileSync(path.join(ROOT, "src", "index.ts"), "utf8");
  return [...source.matchAll(/export \* from "\.\/components\/([^"]+)";/g)].map((match) => match[1]);
}

function verifyVersionSync() {
  const pkg = readJson(path.join(ROOT, "package.json"));
  const indexSource = fs.readFileSync(path.join(ROOT, "src", "index.ts"), "utf8");
  const versionMatch = indexSource.match(/export const VERSION = "([^"]+)";/);
  if (!versionMatch) {
    throw new Error("src/index.ts 缺少 VERSION 常量");
  }
  if (pkg.version !== versionMatch[1]) {
    throw new Error(`VERSION 不一致: package.json=${pkg.version}, src/index.ts=${versionMatch[1]}`);
  }
}

function verifySubpathResolves() {
  const pkg = readJson(path.join(ROOT, "package.json"));
  const componentSpecs = readBarrelExports().map((name) => `@fangxinyan/lumina/${name}`);
  const explicitExportSpecs = Object.keys(pkg.exports)
    .filter((key) => key.startsWith("./") && !key.includes("*") && key !== "." && key !== "./package.json")
    .map((key) => `@fangxinyan/lumina/${key.slice(2)}`);

  for (const spec of [...new Set([...componentSpecs, ...explicitExportSpecs])]) {
    requireFromRoot.resolve(spec);
  }
}

/** 根据运行时 NAMED_ICON_MAP 校验全部命名图标与包子路径。 */
function verifyNamedIconExports() {
  const iconModule = requireFromRoot("@fangxinyan/lumina/Icon");
  const namedIconMap = iconModule.NAMED_ICON_MAP;
  const iconNames = new Set(iconModule.ICON_NAMES ?? []);

  if (!namedIconMap || typeof namedIconMap !== "object") {
    throw new Error("Icon 入口缺少 NAMED_ICON_MAP");
  }

  for (const [exportName, iconName] of Object.entries(namedIconMap)) {
    if (!/(?:Outlined|Filled)$/.test(exportName)) {
      throw new Error(`NAMED_ICON_MAP 包含不合法的命名导出: ${exportName}`);
    }
    if (!iconNames.has(iconName)) {
      throw new Error(`NAMED_ICON_MAP.${exportName} 指向未知 IconName: ${iconName}`);
    }
    if (!(exportName in iconModule)) {
      throw new Error(`Icon 入口未导出 NAMED_ICON_MAP 中的组件: ${exportName}`);
    }

    const spec = `@fangxinyan/lumina/${exportName}`;
    requireFromRoot.resolve(spec);
    const subpathModule = requireFromRoot(spec);
    if (!(exportName in subpathModule)) {
      throw new Error(`命名图标子路径未导出对应组件: ${spec}`);
    }
  }
}

function verifyTypeSmoke() {
  const smokeFile = path.join(ROOT, ".tmp-public-api-smoke.tsx");
  const tscCli = path.join(ROOT, "node_modules", "typescript", "lib", "tsc.js");
  const smokeSource = `import * as React from "react";
import {
  Button,
  Calendar,
  Card,
  Checkbox,
  ColorPicker,
  IconButton,
  Badge,
  Collapse,
  Cascader,
  DatePicker,
  DateTimePicker,
  Drawer,
  Input,
  Image,
  ImageGrid,
  LayeredImage,
  Modal,
  Popover,
  Radio,
  RadioGroup,
  Select,
  SpriteImage,
  Skeleton,
  Spin,
  Slider,
  Switch,
  Surface,
  Tag,
  TablePro,
  Textarea,
  TextArea,
  ThemePanel,
  TimePicker,
  THEME_PANEL_DEFAULT_PRESET_OPTIONS,
  THEME_PANEL_DEFAULT_THEME_PRESETS,
  LUMINA_THEME_PRESETS,
  cloneLuminaThemePreset,
  pickLuminaThemePresets,
  StarFilled,
  Tooltip,
  ThemeProvider,
  type BadgeProps,
  type ButtonProps,
  type CardProps,
  type CalendarProps,
  type CheckboxProps,
  type ColorPickerProps,
  type FormItemProps,
  type IconButtonProps,
  type CascaderProps,
  type DatePickerProps,
  type DateTimePickerProps,
  type ImageProps,
  type LayeredImageProps,
  type CollapseProps,
  type DrawerBodyInset,
  type DrawerProps,
  type InputProps,
  type ModalProps,
  type ModalBodyInset,
  type ModalStaticHandle,
  type PopoverProps,
  type RadioGroupProps,
  type RadioProps,
  type SliderProps,
  type SelectProps,
  type SpriteImageProps,
  type SkeletonProps,
  type SpinProps,
  type SwitchProps,
  type SurfaceProps,
  type TagProps,
  type TableProProps,
  type TextareaProps,
  type ThemePanelCreateThemePayload,
  type ThemePanelPresetOption,
  type ThemePanelProps,
  type TimePickerProps,
  type TooltipProps,
} from "@fangxinyan/lumina";
import { IconButton as SubpathIconButton } from "@fangxinyan/lumina/IconButton";
import { InputPassword } from "@fangxinyan/lumina/InputPassword";
import { TextArea as SubpathTextArea } from "@fangxinyan/lumina/TextArea";
import { RadioGroup as SubpathRadioGroup } from "@fangxinyan/lumina/RadioGroup";
import { FormItem } from "@fangxinyan/lumina/FormItem";
import { ThemeProvider as SubpathThemeProvider } from "@fangxinyan/lumina/ThemeProvider";
import { Title as SubpathTitle } from "@fangxinyan/lumina/Title";
import { Text as SubpathText } from "@fangxinyan/lumina/Text";
import { Paragraph as SubpathParagraph } from "@fangxinyan/lumina/Paragraph";
import { Link as SubpathLink } from "@fangxinyan/lumina/Link";
import { DeleteOutlined as SubpathDeleteOutlined } from "@fangxinyan/lumina/DeleteOutlined";
import { LoadingOutlined as SubpathLoadingOutlined } from "@fangxinyan/lumina/LoadingOutlined";
import { StarFilled as SubpathStarFilled } from "@fangxinyan/lumina/StarFilled";
import {
  LoadingOutlined,
  RobotOutlined,
  SettingOutlined,
  resolveIconName,
} from "@fangxinyan/lumina/Icon";
import { StatusBarItem, type StatusBarItemProps } from "@fangxinyan/lumina/StatusBarItem";
import { MessageContainer, message } from "@fangxinyan/lumina/message";

const buttonProps: ButtonProps = {
  variant: "primary",
  className: "btn-check",
  style: { opacity: 0.9 },
};

const cardProps: CardProps = {
  background: "linear-gradient(135deg, var(--bg-raised), var(--accent-soft))",
  className: "card-check",
  style: { minHeight: 120 },
};

const invalidCardProps: CardProps = {
  // @ts-expect-error Card uses a single background prop for colors and gradients.
  backgroundColor: "var(--bg-raised)",
};

const iconButtonProps: ButtonProps = {
  icon: "plus",
  tip: "Add item",
};

const squareIconButtonProps: IconButtonProps = {
  icon: "settings",
  tip: "Settings",
  variant: "ghost",
  className: "icon-button-check",
};

const customIconButtonProps: ButtonProps = {
  icon: <img src="/icon.png" alt="" />,
  trailingIcon: <span aria-hidden>!</span>,
};

const inputProps: InputProps = {
  className: "input-check",
  style: { width: 240 },
  placeholder: "Search",
  leadingIcon: <img src="/search.png" alt="" />,
  onChange: (event) => {
    void event.target.value;
  },
};

const selectProps: SelectProps<string> = {
  options: [{ value: "a", label: "A", icon: <img src="/a.png" alt="" /> }],
  allowClear: true,
  showSearch: true,
  popupClassName: "popup-check",
  optionFilterProp: "label",
};

const cascaderProps: CascaderProps = {
  options: [{ value: "root", label: "Root", icon: <img src="/root.png" alt="" />, children: [{ value: "leaf", label: "Leaf" }] }],
  showSearch: { limit: 8 },
  allowClear: true,
  popupClassName: "cascader-check",
};

const datePickerProps: DatePickerProps = {
  value: new Date(2026, 4, 25),
  allowClear: true,
  min: new Date(2026, 0, 1),
  max: new Date(2026, 11, 31),
  className: "date-picker-check",
  style: { width: 220 },
  onChange: (date, dateString) => {
    void date?.getFullYear();
    void dateString;
  },
  disabledDate: (date) => date.getDay() === 0,
};

const dateTimePickerProps: DateTimePickerProps = {
  value: new Date(2026, 4, 25, 14, 30),
  allowClear: true,
  showSecond: true,
  minuteStep: 15,
  min: new Date(2026, 4, 1, 8),
  max: new Date(2026, 4, 31, 20, 30),
  className: "date-time-picker-check",
  style: { width: 260 },
  onChange: (date, dateString) => {
    void date?.getHours();
    void dateString;
  },
  disabledDate: (date) => date.getDay() === 0,
  disabledTime: (time, date) => time.hour < 8 || time.hour > 20 || date.getDay() === 6,
};

const imageProps: ImageProps = {
  variant: "icon",
  src: "/asset.png",
  width: 48,
  height: 48,
  preview: false,
  previewClassName: "image-preview-check",
  previewStyle: {
    background: "var(--mask-bg)",
    backdropFilter: "none",
  },
  previewMaxWidth: "72vw",
  previewMaxHeight: 420,
  renderPreviewToolbar: ({ scale, fitToWindow }) => (
    <button type="button" onClick={fitToWindow}>
      {Math.round(scale * 100)}%
    </button>
  ),
  objectFit: "contain",
};

const spriteImageProps: SpriteImageProps = {
  src: "/sheet.png",
  sprite: { x: 16, y: 32, width: 32, height: 32 },
  alt: "Sprite",
};

const layeredImageProps: LayeredImageProps = {
  layers: [
    { src: "/head.png", alt: "", fit: "cover" },
    { src: "/frame.png", alt: "" },
  ],
  width: 48,
  height: 48,
};

const tagProps: TagProps = {
  icon: <img src="/tag.png" alt="" />,
};

const tooltipProps: Omit<TooltipProps, "children"> = {
  title: "Tip",
  placement: "bottomLeft",
  overlayClassName: "tip-check",
};

const popoverProps: Omit<PopoverProps, "children"> = {
  content: <span>Content</span>,
  placement: "bottomLeft",
  overlayClassName: "popover-check",
};

const modalProps: ModalProps = {
  open: false,
  title: "Hidden",
  maskClassName: "mask-check",
  maskStyle: {
    background: "var(--mask-bg)",
    backdropFilter: "none",
  },
  bodyInset: "safe" satisfies ModalBodyInset,
  bodyProps: { "data-contract": "modal-body" },
};

const drawerProps: DrawerProps = {
  open: false,
  title: "Drawer",
  maskClassName: "drawer-mask-check",
  maskStyle: {
    background: "var(--mask-bg)",
    backdropFilter: "none",
  },
  bodyInset: "safe" satisfies DrawerBodyInset,
  bodyProps: { "data-contract": "drawer-body" },
};

const collapseProps: CollapseProps = {
  items: [{ key: "one", label: "One", children: <span>Body</span> }],
  defaultActiveKey: "one",
};

const spinProps: SpinProps = {
  size: "small",
  tip: "Loading",
};

const textareaProps: TextareaProps = {
  rows: 3,
  placeholder: "Notes",
};

const timePickerProps: TimePickerProps = {
  value: "09:30",
  format: "HH:mm:ss",
  showSecond: true,
  minuteStep: 15,
  allowClear: true,
  className: "time-picker-check",
  style: { width: 220 },
  onChange: (value, time) => {
    void value;
    void time.hour;
  },
  disabledTime: (time) => time.hour < 8 || time.hour > 20,
};

const badgeProps: BadgeProps = {
  count: 3,
};

const radioProps: RadioProps = {
  label: "Daily",
  defaultChecked: true,
  name: "schedule",
  value: "daily",
  required: true,
  form: "settings-form",
};

const radioGroupProps: RadioGroupProps = {
  options: [{ value: "a", label: "A" }],
  defaultValue: "a",
  required: true,
  form: "settings-form",
};

const checkboxProps: CheckboxProps = {
  label: "Accept",
  name: "agreement",
  value: "accepted",
  required: true,
  form: "settings-form",
};

const switchProps: SwitchProps = {
  label: "Notifications",
  name: "notifications",
  value: "enabled",
  required: true,
  form: "settings-form",
};

const sliderProps: SliderProps = {
  range: true,
  defaultValue: [20, 80],
  ariaLabel: ["minimum", "maximum"],
  className: "slider-smoke",
  style: { width: 240 },
};

const colorPickerProps: ColorPickerProps = {
  defaultValue: "#845ef7",
  className: "color-picker-smoke",
  "aria-label": "color picker",
};

const calendarProps: CalendarProps = {
  value: null,
  onViewChange: () => {},
  className: "calendar-smoke",
  style: { width: 280 },
};

const formItemProps: FormItemProps = {
  className: "form-item-smoke",
  style: { padding: 4 },
  "aria-label": "form item",
};

const segmentedRadioGroupProps: RadioGroupProps = {
  options: [{ value: "grid", label: "Grid" }],
  defaultValue: "grid",
  variant: "segmented",
};

const skeletonProps: SkeletonProps = {
  avatar: true,
  paragraph: true,
};

const tableProProps: TableProProps<{ id: number; name: string }> = {
  columns: [{ key: "name", title: "Name", dataIndex: "name" }],
  data: [{ id: 1, name: "Lumina" }],
  rowKey: "id",
  className: "table-pro-check",
  style: { minHeight: 120 },
  tableClassName: "inner-table-check",
};

const statusBarItemProps: StatusBarItemProps = {
  tone: "accent",
};

const surfaceProps: SurfaceProps = {
  preset: "graphite",
  tone: "base",
  variant: "raised",
  padding: "lg",
  radius: "xl",
  height: "content",
  bordered: true,
  accent: "mint",
  themeRadius: 18,
  tokens: { bg: "#171d20" },
  className: "surface-check",
  style: { minHeight: 160 },
};

const themePanelPresetOptions: ThemePanelPresetOption[] = [
  {
    key: "graphite",
    label: "Graphite",
    description: "Dark",
    preset: {
      base: "dark",
      accent: "mint",
      tokens: { bg: "#181b22" },
    },
  },
];

const themePanelProps: ThemePanelProps = {
  compact: true,
  title: "Theme",
  description: "Tune",
  sections: ["mode", "accent", "intensity", "radius"],
  presetOptions: [...THEME_PANEL_DEFAULT_PRESET_OPTIONS, ...themePanelPresetOptions],
  defaultCustomAccent: "#845ef7",
  allowCreateTheme: true,
  defaultCreateThemeName: "Custom",
  createThemeKeyPrefix: "user",
  onCreateTheme: (payload: ThemePanelCreateThemePayload) => {
    void payload.preset;
  },
  showReset: false,
  className: "theme-panel-check",
  style: { width: 320 },
};

const Example = () => {
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const drawerRef = React.useRef<HTMLDivElement>(null);
  const calendarRef = React.useRef<HTMLDivElement>(null);
  const colorPickerRef = React.useRef<HTMLElement>(null);
  const formItemRef = React.useRef<HTMLDivElement>(null);
  const modalRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const datePickerRef = React.useRef<HTMLDivElement>(null);
  const dateTimePickerRef = React.useRef<HTMLDivElement>(null);
  const surfaceRef = React.useRef<HTMLDivElement>(null);
  const sliderRef = React.useRef<HTMLDivElement>(null);
  const themePanelRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const tableProRef = React.useRef<HTMLDivElement>(null);
  const timePickerRef = React.useRef<HTMLDivElement>(null);

  return (
    <ThemeProvider>
      <MessageContainer />
      <ThemePanel
        ref={themePanelRef}
        {...themePanelProps}
        data-testid="theme-panel"
        aria-label="theme panel"
      />
      <Surface
        ref={surfaceRef}
        {...surfaceProps}
        data-testid="surface"
        aria-label="surface"
      >
        <Button>surface child</Button>
      </Surface>
      <Button
        ref={buttonRef}
        {...buttonProps}
        data-testid="btn"
        aria-label="button"
      >
        ok
      </Button>
      <Button
        {...iconButtonProps}
        data-testid="icon-btn"
      />
      <IconButton
        {...squareIconButtonProps}
        data-testid="icon-button"
      />
      <SubpathIconButton
        icon="copy"
        tip="Copy"
        data-testid="subpath-icon-button"
      />
      <Button
        {...customIconButtonProps}
        data-testid="custom-icon-btn"
      />
      <Card
        ref={cardRef}
        {...cardProps}
        data-testid="card"
        aria-label="card"
      >
        custom background
      </Card>
      <Input
        ref={inputRef}
        {...inputProps}
        data-testid="input"
        aria-label="input"
      />
      <Input.Password
        defaultValue="secret"
        data-testid="password"
      />
      <InputPassword
        defaultValue="secret-subpath"
        data-testid="password-subpath"
      />
      <Input.TextArea
        defaultValue="notes"
        onChange={(event) => void event.target.value}
        data-testid="input-textarea"
      />
      <TextArea
        defaultValue="notes alias"
        data-testid="textarea-alias"
      />
      <SubpathTextArea
        defaultValue="notes subpath"
        data-testid="textarea-subpath"
      />
      <Collapse {...collapseProps} data-testid="collapse" />
      <Select {...selectProps} data-testid="select" />
      <Cascader {...cascaderProps} data-testid="cascader" />
      <DatePicker
        ref={datePickerRef}
        {...datePickerProps}
        data-testid="date-picker"
        aria-label="date picker"
      />
      <DateTimePicker
        ref={dateTimePickerRef}
        {...dateTimePickerProps}
        data-testid="date-time-picker"
        aria-label="date time picker"
      />
      <Image {...imageProps} data-testid="image" />
      <ImageGrid images={[{ src: "/one.png", alt: "One", variant: "icon" }]} data-testid="image-grid" />
      <SpriteImage {...spriteImageProps} data-testid="sprite-image" />
      <LayeredImage {...layeredImageProps} data-testid="layered-image" />
      <Tag {...tagProps} data-testid="tag">
        custom
      </Tag>
      <Tooltip {...tooltipProps}>
        <Button>tip</Button>
      </Tooltip>
      <Popover {...popoverProps}>
        <Button>pop</Button>
      </Popover>
      <Modal
        ref={modalRef}
        {...modalProps}
        className="modal-contract"
        style={{ maxWidth: 480 }}
        data-contract="modal"
        onClose={() => {}}
      >
        body
      </Modal>
      <Drawer
        ref={drawerRef}
        {...drawerProps}
        className="drawer-contract"
        style={{ maxWidth: 420 }}
        data-contract="drawer"
        onClose={() => {}}
      >
        drawer body
      </Drawer>
      <Spin {...spinProps} data-testid="spin" />
      <Calendar ref={calendarRef} {...calendarProps} data-contract="calendar" />
      <Checkbox {...checkboxProps} />
      <Switch {...switchProps} />
      <Slider ref={sliderRef} {...sliderProps} data-contract="slider" />
      <ColorPicker ref={colorPickerRef} {...colorPickerProps} />
      <Radio {...radioProps} data-testid="radio" />
      <RadioGroup {...radioGroupProps} data-testid="radio-group" />
      <SubpathRadioGroup {...radioGroupProps} data-testid="radio-group-subpath" />
      <RadioGroup {...segmentedRadioGroupProps} data-testid="radio-segmented" />
      <Skeleton {...skeletonProps} data-testid="skeleton" />
      <Textarea
        ref={textareaRef}
        {...textareaProps}
        data-testid="textarea"
        aria-label="textarea"
      />
      <TimePicker
        ref={timePickerRef}
        {...timePickerProps}
        data-testid="time-picker"
        aria-label="time picker"
      />
      <Badge {...badgeProps} data-testid="badge">
        inbox
      </Badge>
      <StatusBarItem {...statusBarItemProps} data-testid="status">
        synced
      </StatusBarItem>
      <TablePro
        ref={tableProRef}
        {...tableProProps}
        data-testid="table-pro"
        aria-label="table pro"
      />
      <SubpathThemeProvider>
        <FormItem ref={formItemRef} {...formItemProps} data-contract="form-item">
          <SubpathTitle level={5}>Title</SubpathTitle>
          <SubpathText>Text</SubpathText>
          <SubpathParagraph>Paragraph</SubpathParagraph>
          <SubpathLink href="#">Link</SubpathLink>
        </FormItem>
      </SubpathThemeProvider>
      <SettingOutlined />
      <RobotOutlined />
      <LoadingOutlined spin />
      <SubpathDeleteOutlined aria-label="delete" />
      <SubpathLoadingOutlined spin aria-label="loading" />
      <StarFilled aria-label="favorite" />
      <SubpathStarFilled aria-label="subpath favorite" />
    </ThemeProvider>
  );
};

void Example;
void invalidCardProps;
void message.success("Ready");
const modalHandle: ModalStaticHandle = Modal.confirm({ title: "Confirm", content: "Sure?" });
modalHandle.update({ content: "Updated" });
modalHandle.destroy();
void resolveIconName("RobotOutlined");
void THEME_PANEL_DEFAULT_THEME_PRESETS.assistant;
void LUMINA_THEME_PRESETS.graphite;
void cloneLuminaThemePreset("ember");
const pickedLuminaThemes = pickLuminaThemePresets(["light", "dark"] as const);
void pickedLuminaThemes.dark.tokens;
`;

  fs.writeFileSync(smokeFile, smokeSource, "utf8");

  try {
    execFileSync(
      process.execPath,
      [
        tscCli,
        "--noEmit",
        "--jsx",
        "react-jsx",
        "--moduleResolution",
        "bundler",
        "--module",
        "esnext",
        "--target",
        "es2020",
        "--lib",
        "es2020,dom",
        "--skipLibCheck",
        smokeFile,
      ],
      {
        cwd: ROOT,
        stdio: "pipe",
      }
    );
  } catch (error) {
    const stderr = error.stderr?.toString?.() ?? "";
    const stdout = error.stdout?.toString?.() ?? "";
    throw new Error(`TypeScript smoke 校验失败\n${stdout}${stderr}`.trim());
  } finally {
    fs.rmSync(smokeFile, { force: true });
  }
}

function main() {
  verifyVersionSync();
  verifySubpathResolves();
  verifyNamedIconExports();
  verifyTypeSmoke();
  console.log("[verify-public-api] version/export/type smoke checks passed");
}

main();
