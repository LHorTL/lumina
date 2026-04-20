#!/usr/bin/env node
/**
 * gen-llms-doc.mjs
 * Walks playground/sections/*.tsx, extracts every `export default defineSection({...})`
 * via TypeScript's AST, and renders a single docs/llms.md geared at AI
 * assistants (Claude Code / Cursor / Copilot / ChatGPT) consuming Lumina.
 *
 * Why an AST and not a regex: the demo objects contain template literals with
 * backticks, JSX in `description`, and function bodies in `render` — all of
 * which trivially break naive regex extraction.
 *
 * Why not executing the TSX modules: `render` / `Component` functions call
 * into React + lumina runtime; we don't want to bundle-and-execute. Parsing
 * static fields is enough for documentation.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SECTIONS_DIR = path.join(ROOT, "playground", "sections");
const OUT_INDEX = path.join(ROOT, "docs", "llms.md");
const OUT_DIR = path.join(ROOT, "docs", "llms");

const GROUP_ORDER = ["起步", "通用", "表单", "数据展示", "反馈", "Electron"];

/* ---------- AST extraction --------------------------------------------- */

function extractValue(node, locals) {
  if (!node) return undefined;
  // Follow identifier references so `api={[..., { rows: buttonApi }]}` sees
  // the actual const array. Guard against infinite loops with a visited set.
  if (ts.isIdentifier(node) && locals && locals.has(node.text)) {
    const seen = locals.__seen ?? (locals.__seen = new Set());
    if (!seen.has(node.text)) {
      seen.add(node.text);
      const resolved = extractValue(locals.get(node.text), locals);
      seen.delete(node.text);
      return resolved;
    }
  }
  if (ts.isStringLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isTemplateExpression(node)) {
    // Retain the raw source (with ${...} interpolations) so the example is
    // readable as-is. Strip the enclosing backticks.
    const raw = node.getText();
    return raw.startsWith("`") && raw.endsWith("`") ? raw.slice(1, -1) : raw;
  }
  if (ts.isArrayLiteralExpression(node)) {
    return node.elements
      .filter((e) => !ts.isSpreadElement(e))
      .map((e) => extractValue(e, locals));
  }
  if (ts.isObjectLiteralExpression(node)) {
    return extractObject(node, locals);
  }
  if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node)) {
    return { __jsx: node.getText() };
  }
  // Function expressions, arrow fns, calls, unresolved identifiers — raw text
  return { __raw: node.getText() };
}

function extractObject(objNode, locals) {
  const out = {};
  for (const prop of objNode.properties) {
    if (ts.isPropertyAssignment(prop)) {
      const key = ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name)
        ? prop.name.text
        : prop.name.getText();
      out[key] = extractValue(prop.initializer, locals);
    } else if (ts.isShorthandPropertyAssignment(prop)) {
      const ref = locals?.get?.(prop.name.text);
      out[prop.name.text] = ref ? extractValue(ref, locals) : { __raw: prop.name.text };
    }
  }
  return out;
}

function parseSectionFile(filepath) {
  const src = fs.readFileSync(filepath, "utf-8");
  const sf = ts.createSourceFile(
    filepath,
    src,
    ts.ScriptTarget.Latest,
    /*setParentNodes*/ true,
    ts.ScriptKind.TSX
  );

  // Pass 1: collect all `const X = <expr>` declarations in the file so JSX
  // attributes like `demos={demos}` or `api={[{...}, apiRef]}` can be resolved
  // back to their literal definitions. Later definitions overwrite earlier.
  const locals = new Map();
  const collect = (node) => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer
    ) {
      locals.set(node.name.text, node.initializer);
    }
    ts.forEachChild(node, collect);
  };
  collect(sf);

  let meta = null;
  let docPageProps = null;
  const visit = (node) => {
    if (ts.isExportAssignment(node) && !node.isExportEquals) {
      const expr = node.expression;
      if (
        ts.isCallExpression(expr) &&
        ts.isIdentifier(expr.expression) &&
        expr.expression.text === "defineSection" &&
        expr.arguments.length > 0 &&
        ts.isObjectLiteralExpression(expr.arguments[0])
      ) {
        meta = extractObject(expr.arguments[0], locals);
      }
    }
    // Find <DocPage ... /> — either opening or self-closing.
    if (
      (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) &&
      ts.isIdentifier(node.tagName) &&
      node.tagName.text === "DocPage" &&
      !docPageProps
    ) {
      docPageProps = {};
      for (const attr of node.attributes.properties) {
        if (!ts.isJsxAttribute(attr) || !attr.initializer) continue;
        const name = attr.name.getText();
        let expr = attr.initializer;
        if (ts.isJsxExpression(expr)) expr = expr.expression;
        if (!expr) continue;
        docPageProps[name] = extractValue(expr, locals);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);

  if (meta && docPageProps) {
    if (docPageProps.demos) meta.demos = docPageProps.demos;
    if (docPageProps.api) meta.api = docPageProps.api;
    if (docPageProps.whenToUse) meta.whenToUse = docPageProps.whenToUse;
  }
  return meta;
}

/* ---------- Helpers to clean field values ------------------------------ */

function asPlain(v) {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (v.__jsx) return stripJsxToText(v.__jsx);
  if (v.__raw) return `\`${v.__raw}\``;
  return "";
}

// Very light JSX → plain text: drops tags, collapses whitespace.
function stripJsxToText(jsx) {
  return jsx
    .replace(/<\/?[A-Za-z][^>]*>/g, "")
    .replace(/\{["'`]([^"'`]*)["'`]\}/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function escapePipes(s) {
  return String(s).replace(/\|/g, "\\|");
}

/* ---------- Infer imports from component name -------------------------- */

// The "primary" component name per section. Occasionally a section exports
// several components — we list the section `id`'s canonical set.
const COMPONENT_ALIAS = {
  intro: [],
  theme: ["ThemeProvider", "useTheme", "applyTheme"],
  button: ["Button", "IconButton", "Segmented"],
  icon: ["Icon"],
  typography: ["Typography"],
  input: ["Input", "Textarea"],
  switch: ["Switch"],
  checkbox: ["Checkbox"],
  radio: ["RadioGroup"],
  slider: ["Slider"],
  select: ["Select"],
  cascader: ["Cascader"],
  colorpicker: ["ColorPicker"],
  card: ["Card", "Panel"],
  tag: ["Tag"],
  badge: ["Badge"],
  avatar: ["Avatar"],
  divider: ["Divider"],
  progress: ["Progress", "Ring"],
  list: ["List"],
  table: ["Table"],
  tablepro: ["TablePro"],
  image: ["Image", "ImageGrid"],
  calendar: ["Calendar"],
  tabs: ["Tabs"],
  accordion: ["Accordion"],
  modal: ["Modal"],
  drawer: ["Drawer"],
  toast: ["toast", "ToastContainer"],
  tooltip: ["Tooltip"],
  popover: ["Popover"],
  alert: ["Alert"],
  empty: ["Empty"],
  spinner: ["Spinner"],
  skeleton: ["Skeleton"],
  pagination: ["Pagination"],
  titlebar: ["TitleBar"],
  windowcontrols: ["WindowControls"],
  sidebar: ["Sidebar"],
};

/* ---------- Markdown rendering ----------------------------------------- */

function renderApiTable(apiGroup) {
  const title = apiGroup.title ? `**${apiGroup.title}**\n\n` : "";
  const rows = (apiGroup.rows ?? []).map((r) => {
    const prop = asPlain(r.prop) + (r.required ? " \\*" : "");
    const type = `\`${asPlain(r.type) || "—"}\``;
    const def = r.default != null ? `\`${asPlain(r.default)}\`` : "—";
    const desc = escapePipes(asPlain(r.description));
    return `| ${escapePipes(prop)} | ${type} | ${def} | ${desc} |`;
  });
  return (
    title +
    `| Prop | 类型 | 默认 | 说明 |\n| --- | --- | --- | --- |\n${rows.join("\n")}\n`
  );
}

function renderDemo(demo) {
  const lines = [];
  lines.push(`#### ${asPlain(demo.title) || demo.id}`);
  const desc = asPlain(demo.description);
  if (desc) lines.push("", desc);
  if (demo.code) {
    const code = String(demo.code).trim();
    lines.push("", "```tsx", code, "```");
  }
  return lines.join("\n");
}

function renderSection(meta) {
  const lines = [];
  lines.push(`# ${asPlain(meta.title) || meta.id}`);
  lines.push("");
  lines.push(`> ${asPlain(meta.desc)}`);
  lines.push("");

  const imports = COMPONENT_ALIAS[meta.id];
  if (imports && imports.length) {
    lines.push("## 导入");
    lines.push("");
    lines.push("```tsx");
    lines.push(`import { ${imports.join(", ")} } from "@fangxinyan/lumina";`);
    lines.push("```");
    lines.push("");
  }

  const demos = (meta.demos ?? []).filter((d) => d && d.code);
  if (demos.length) {
    lines.push("## 示例");
    lines.push("");
    for (const demo of demos) {
      lines.push(renderDemoAsH3(demo));
      lines.push("");
    }
  }

  const api = meta.api ?? [];
  if (api.length) {
    lines.push("## API");
    lines.push("");
    for (const group of api) {
      lines.push(renderApiTable(group));
      lines.push("");
    }
  }

  lines.push("---");
  lines.push(`[← 回到索引](../llms.md)`);
  lines.push("");

  return lines.join("\n");
}

function renderDemoAsH3(demo) {
  const lines = [];
  lines.push(`### ${asPlain(demo.title) || demo.id}`);
  const desc = asPlain(demo.description);
  if (desc) lines.push("", desc);
  if (demo.code) {
    const code = String(demo.code).trim();
    lines.push("", "```tsx", code, "```");
  }
  return lines.join("\n");
}

/* ---------- Main -------------------------------------------------------- */

function main() {
  const files = fs
    .readdirSync(SECTIONS_DIR)
    .filter((f) => f.endsWith(".tsx") && !f.startsWith("_"))
    .map((f) => path.join(SECTIONS_DIR, f));

  const sections = files
    .map((f) => {
      try {
        return parseSectionFile(f);
      } catch (err) {
        console.warn(`[gen-llms-doc] skip ${path.basename(f)}: ${err.message}`);
        return null;
      }
    })
    .filter(Boolean);

  // Sort: group order then per-section `order`.
  sections.sort((a, b) => {
    const gi = GROUP_ORDER.indexOf(a.group ?? "");
    const gj = GROUP_ORDER.indexOf(b.group ?? "");
    if (gi !== gj) return (gi === -1 ? 99 : gi) - (gj === -1 ? 99 : gj);
    return (a.order ?? 999) - (b.order ?? 999);
  });

  /* -------- Per-component files ----------------------------------------- */
  fs.mkdirSync(OUT_DIR, { recursive: true });
  // Clean previous generated component files (keep only current ones).
  for (const existing of fs.readdirSync(OUT_DIR)) {
    if (existing.endsWith(".md")) fs.unlinkSync(path.join(OUT_DIR, existing));
  }

  let totalBytes = 0;
  for (const meta of sections) {
    const id = String(meta.id ?? "unknown");
    const body = renderSection(meta);
    const outfile = path.join(OUT_DIR, `${id}.md`);
    fs.writeFileSync(outfile, body, "utf-8");
    totalBytes += body.length;
  }

  /* -------- Index file --------------------------------------------------- */
  const pkg = JSON.parse(
    fs.readFileSync(path.join(ROOT, "package.json"), "utf-8")
  );

  // Group sections for the index.
  const grouped = new Map();
  for (const s of sections) {
    const g = s.group ?? "其他";
    if (!grouped.has(g)) grouped.set(g, []);
    grouped.get(g).push(s);
  }

  const indexLines = [
    `# @fangxinyan/lumina · LLM Reference`,
    ``,
    `> 拟态风格的 React 18 组件库,目标是 Electron 桌面应用。**写给 AI 编程助手**的按需文档 —— 每个组件单独一个 \`.md\`,避免一次性读取全部。示例源自 playground 的 demo,可直接复制运行。`,
    ``,
    `- **包名**: \`${pkg.name}\``,
    `- **版本**: \`${pkg.version}\``,
    `- **React 最低版本**: 18`,
    `- **环境**: 带打包器的 React 工程(Vite / Next.js / Webpack / Remix / Electron + Vite 等)`,
    `- **零运行时依赖**: 只依赖 \`react\` / \`react-dom\` (peer deps)`,
    `- **仓库**: ${pkg.repository?.url ?? "-"}`,
    ``,
    `## 用法建议(给 AI)`,
    ``,
    `- **只需要某个组件时**: 直接读 \`./llms/<id>.md\`(例如 \`./llms/button.md\`)。每份 50-300 行,覆盖导入 / 示例 / 完整 Props 表。`,
    `- **需要全局概念时**(安装、主题、图标、浮层): 读本文件底部的「必读 · 全局约定」一节。`,
    `- **通过 npm 包内置路径**:`,
    `  - 索引: \`node_modules/@fangxinyan/lumina/docs/llms.md\` 或子路径导出 \`@fangxinyan/lumina/llms.md\``,
    `  - 单组件: \`node_modules/@fangxinyan/lumina/docs/llms/<id>.md\``,
    ``,
    `## 必读 · 全局约定`,
    ``,
    `1. **安装**  \n   \`npm install @fangxinyan/lumina\``,
    `2. **引入样式**(任一即可):  \n   \`\`\`tsx\n   import "@fangxinyan/lumina/styles"; // 一次性引入全部组件样式\n   \`\`\`\n   或按组件单独引入(适合 tree-shake 到极限):  \n   \`\`\`tsx\n   import "@fangxinyan/lumina/tokens";         // 设计令牌 + 全局 reset\n   import { Button } from "@fangxinyan/lumina"; // 会自动带上 Button.css\n   \`\`\``,
    `3. **TypeScript**: 所有 \`XxxProps\` 接口都是 \`export\`,可直接 \`import { Button, type ButtonProps } from "@fangxinyan/lumina";\``,
    `4. **主题**: 用 \`<ThemeProvider>\` 包根;运行时可通过 \`useTheme()\` 改。六种强调色 (\`rose / sky / coral / mint / violet / amber\`) × 两种模式 (\`light / dark\` + \`system\`) × 三档密度 (\`compact / comfortable / spacious\`)。详见 [\`llms/theme.md\`](./llms/theme.md)。`,
    `5. **图标**: 所有接受 \`icon / leadingIcon / trailingIcon\` 的 prop 用字符串 \`IconName\`。完整列表见 [\`llms/icon.md\`](./llms/icon.md)。`,
    `6. **浮层组件**(Tooltip / Popover / Select / Cascader / ColorPicker / Modal / Drawer): 内部已 \`createPortal\` 到 \`document.body\` + 视口边界翻转,放在 \`overflow: hidden\` 的容器里也不会被裁。`,
    `7. **Electron 专属组件**: \`TitleBar\` / \`WindowControls\` / \`Sidebar\` / \`AppShell\` 提供 macOS / Windows 原生风格的标题栏与导航。`,
    ``,
    `## 组件索引`,
    ``,
  ];

  for (const [g, list] of grouped) {
    indexLines.push(`### ${g}`);
    indexLines.push("");
    for (const s of list) {
      const title = asPlain(s.title) || s.id;
      const desc = asPlain(s.desc);
      indexLines.push(`- [${title}](./llms/${s.id}.md) — ${desc}`);
    }
    indexLines.push("");
  }

  const out = indexLines.join("\n") + "\n";
  fs.mkdirSync(path.dirname(OUT_INDEX), { recursive: true });
  fs.writeFileSync(OUT_INDEX, out, "utf-8");

  console.log(
    `[gen-llms-doc] wrote ${sections.length} component files to ${path.relative(ROOT, OUT_DIR)}/ ` +
      `(${totalBytes} chars) + index at ${path.relative(ROOT, OUT_INDEX)}`
  );
}

function slug(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

main();
