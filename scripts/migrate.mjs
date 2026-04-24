#!/usr/bin/env node
/**
 * One-shot migrator — moves a flat component .tsx + its CSS section into a folder.
 * Usage: node scripts/migrate.mjs [name:section-header] ...
 *   e.g. node scripts/migrate.mjs Avatar:Avatar Card:Card Alert:Alert
 * The section header is the text inside the `/* ============ <text> ============ *\/` comment
 * in src/styles/components.css. Defaults to the name if not given (name:name).
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd());
const CSS_FILE = path.join(ROOT, "src/styles/components.css");
const COMP_DIR = path.join(ROOT, "src/components");

const args = process.argv.slice(2);
if (!args.length) {
  console.error("usage: node scripts/migrate.mjs Name[:Header] ...");
  process.exit(1);
}

let css = fs.readFileSync(CSS_FILE, "utf8");
const migrated = [];
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

for (const arg of args) {
  const [name, headerRaw] = arg.split(":");
  const header = headerRaw ?? name;
  const escHeader = escapeRe(header);
  // Capture section from header through (but not including) next section header OR EOF.
  const re = new RegExp(
    `\\n?/\\* =+ ${escHeader} =+ \\*/\\n[\\s\\S]*?(?=\\n/\\* =+ |$)`,
    ""
  );
  const match = re.exec(css);
  if (!match) {
    console.error(`NOT FOUND: section header "${header}" for component ${name}`);
    process.exit(2);
  }
  const sectionText = match[0].replace(/^\n/, "").replace(/\s+$/, "") + "\n";
  const folder = path.join(COMP_DIR, name);
  fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(path.join(folder, `${name}.css`), sectionText);
  const tsxSrc = path.join(COMP_DIR, `${name}.tsx`);
  if (!fs.existsSync(tsxSrc)) {
    console.error(`NOT FOUND: ${tsxSrc}`);
    process.exit(3);
  }
  let tsxContent = fs.readFileSync(tsxSrc, "utf8");
  // Rewrite sibling imports: from "./SiblingName" → from "../SiblingName"
  tsxContent = tsxContent.replace(
    /from\s+(["'])\.\/([A-Z][A-Za-z0-9]*)\1/g,
    (_, q, siblingName) => `from ${q}../${siblingName}${q}`
  );
  fs.writeFileSync(
    path.join(folder, `${name}.tsx`),
    `import "./${name}.css";\n${tsxContent}`
  );
  fs.writeFileSync(path.join(folder, "index.ts"), `export * from "./${name}";\n`);
  fs.rmSync(tsxSrc);
  css = css.replace(match[0], "");
  migrated.push(name);
  console.log(`migrated: ${name}`);
}

fs.writeFileSync(CSS_FILE, css);
console.log(`done. ${migrated.length} components migrated.`);
console.log("remember to add @import lines to src/styles/index.css:");
for (const name of migrated) console.log(`@import "../components/${name}/${name}.css";`);
