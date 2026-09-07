import fs from "node:fs";
import { execFileSync } from "node:child_process";

// 手动输入优先；自动 CI 和 tag 发布读取同一提交的明确范围标记，默认仍为 full。
const requested = process.env.REQUESTED_VALIDATION_SCOPE;
const message = execFileSync("git", ["show", "-s", "--format=%B", "HEAD"], { encoding: "utf8" });
const scope = requested || (/^Lumina-Validation: select\r?$/m.test(message) ? "select" : "full");
if (scope !== "full" && scope !== "select") throw new Error(`未知验证范围：${scope}`);
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `scope=${scope}\n`);
console.log(`Lumina validation scope: ${scope}`);
