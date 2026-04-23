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
  Input,
  ThemeProvider,
  type ButtonProps,
  type InputProps,
} from "@fangxinyan/lumina";
import { IconButton, type IconButtonProps } from "@fangxinyan/lumina/IconButton";
import { Textarea, type TextareaProps } from "@fangxinyan/lumina/Textarea";
import { Badge, type BadgeProps } from "@fangxinyan/lumina/Badge";
import { StatusBarItem, type StatusBarItemProps } from "@fangxinyan/lumina/StatusBarItem";
import { ToastContainer, toast } from "@fangxinyan/lumina/toast";

const buttonProps: ButtonProps = {
  variant: "primary",
  className: "btn-check",
  style: { opacity: 0.9 },
};

const inputProps: InputProps = {
  className: "input-check",
  style: { width: 240 },
  placeholder: "Search",
};

const iconButtonProps: IconButtonProps = {
  icon: "plus",
  tip: "Add item",
};

const textareaProps: TextareaProps = {
  rows: 3,
  placeholder: "Notes",
};

const badgeProps: BadgeProps = {
  count: 3,
};

const statusBarItemProps: StatusBarItemProps = {
  tone: "accent",
};

const Example = () => {
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const iconButtonRef = React.useRef<HTMLButtonElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  return (
    <ThemeProvider>
      <ToastContainer />
      <Button
        ref={buttonRef}
        {...buttonProps}
        data-testid="btn"
        aria-label="button"
      >
        ok
      </Button>
      <IconButton
        ref={iconButtonRef}
        {...iconButtonProps}
        data-testid="icon-btn"
      />
      <Input
        ref={inputRef}
        {...inputProps}
        data-testid="input"
        aria-label="input"
      />
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
    </ThemeProvider>
  );
};

void Example;
void toast.success("Ready");
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
