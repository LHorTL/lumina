#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const requireFromRoot = createRequire(path.join(ROOT, "package.json"));

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
    .filter((key) => key.startsWith("./") && key !== "./*" && key !== "./llms/*" && key !== "." && key !== "./package.json")
    .map((key) => `@fangxinyan/lumina/${key.slice(2)}`);

  for (const spec of [...new Set([...componentSpecs, ...explicitExportSpecs])]) {
    requireFromRoot.resolve(spec);
  }
}

function verifyTypeSmoke() {
  const smokeFile = path.join(ROOT, ".tmp-public-api-smoke.tsx");
  const tscCli = path.join(ROOT, "node_modules", "typescript", "lib", "tsc.js");
  const smokeSource = `import * as React from "react";
import {
  Button,
  Badge,
  Collapse,
  Cascader,
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
  Tag,
  TablePro,
  Textarea,
  Tooltip,
  ThemeProvider,
  type BadgeProps,
  type ButtonProps,
  type CascaderProps,
  type ImageProps,
  type LayeredImageProps,
  type CollapseProps,
  type InputProps,
  type ModalStaticHandle,
  type PopoverProps,
  type RadioGroupProps,
  type RadioProps,
  type SelectProps,
  type SpriteImageProps,
  type SkeletonProps,
  type SpinProps,
  type TagProps,
  type TableProProps,
  type TextareaProps,
  type TooltipProps,
} from "@fangxinyan/lumina";
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

const iconButtonProps: ButtonProps = {
  icon: "plus",
  tip: "Add item",
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

const imageProps: ImageProps = {
  variant: "icon",
  src: "/asset.png",
  width: 48,
  height: 48,
  preview: false,
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

const badgeProps: BadgeProps = {
  count: 3,
};

const radioProps: RadioProps = {
  label: "Daily",
  defaultChecked: true,
};

const radioGroupProps: RadioGroupProps = {
  options: [{ value: "a", label: "A" }],
  defaultValue: "a",
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
};

const statusBarItemProps: StatusBarItemProps = {
  tone: "accent",
};

const Example = () => {
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  return (
    <ThemeProvider>
      <MessageContainer />
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
      <Button
        {...customIconButtonProps}
        data-testid="custom-icon-btn"
      />
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
      <Input.TextArea
        defaultValue="notes"
        onChange={(event) => void event.target.value}
        data-testid="input-textarea"
      />
      <Collapse {...collapseProps} data-testid="collapse" />
      <Select {...selectProps} data-testid="select" />
      <Cascader {...cascaderProps} data-testid="cascader" />
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
      <Modal open={false} title="Hidden" onClose={() => {}}>
        body
      </Modal>
      <Spin {...spinProps} data-testid="spin" />
      <Radio {...radioProps} data-testid="radio" />
      <RadioGroup {...radioGroupProps} data-testid="radio-group" />
      <RadioGroup {...segmentedRadioGroupProps} data-testid="radio-segmented" />
      <Skeleton {...skeletonProps} data-testid="skeleton" />
      <Textarea
        ref={textareaRef}
        {...textareaProps}
        data-testid="textarea"
        aria-label="textarea"
      />
      <Badge {...badgeProps} data-testid="badge">
        inbox
      </Badge>
      <StatusBarItem {...statusBarItemProps} data-testid="status">
        synced
      </StatusBarItem>
      <TablePro {...tableProProps} data-testid="table-pro" />
      <SettingOutlined />
      <RobotOutlined />
      <LoadingOutlined spin />
    </ThemeProvider>
  );
};

void Example;
void message.success("Ready");
const modalHandle: ModalStaticHandle = Modal.confirm({ title: "Confirm", content: "Sure?" });
modalHandle.update({ content: "Updated" });
modalHandle.destroy();
void resolveIconName("RobotOutlined");
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
  verifyTypeSmoke();
  console.log("[verify-public-api] version/export/type smoke checks passed");
}

main();
