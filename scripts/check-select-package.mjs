import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";

const require = createRequire(import.meta.url);
// 此脚本只检查 Select 发布产物；Node 中忽略 CSS 解析，样式内容在下方单独断言。
require.extensions[".css"] = () => undefined;
const pkg = require("../package.json");
const lock = require("../package-lock.json");
const select = require("@fangxinyan/lumina/Select");
assert.ok(select.Select, "Select 子路径缺少组件导出");
assert.equal(lock.version, pkg.version);
assert.equal(lock.packages[""].version, pkg.version);
assert.ok(fs.readFileSync("src/index.ts", "utf8").includes(`export const VERSION = "${pkg.version}"`));
assert.ok(fs.readFileSync("dist/styles.css", "utf8").includes(".select.multi.responsive"));
assert.ok(fs.readFileSync("docs/llms/select.md", "utf8").includes('maxTagCount="responsive"'));
execFileSync(process.execPath, [
  require.resolve("typescript/bin/tsc"), "--noEmit", "--strict", "--skipLibCheck",
  "--target", "ES2020", "--module", "ESNext", "--moduleResolution", "bundler",
  "--jsx", "react-jsx", "tests/select-package-smoke.tsx",
], { stdio: "inherit" });
console.log(`Select ${pkg.version}: 根出口和子路径类型、版本、样式、生成文档检查通过`);
