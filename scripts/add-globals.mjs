#!/usr/bin/env node
// One-shot: prepend tokens.css + shared.css imports to every component TSX.
// These are globals every component needs (CSS variables + animation keyframes).
// Bundlers dedupe by content hash — all 27 TSX files reference the same
// dist/tokens-HASH.css and dist/shared-HASH.css.
import fs from "node:fs";
import path from "node:path";

const COMP_DIR = "src/components";
const IMPORTS = [
  'import "../../styles/tokens.css";',
  'import "../../styles/shared.css";',
];

const dirs = fs
  .readdirSync(COMP_DIR)
  .filter((n) => fs.statSync(path.join(COMP_DIR, n)).isDirectory());

let changed = 0;
for (const name of dirs) {
  const file = path.join(COMP_DIR, name, `${name}.tsx`);
  if (!fs.existsSync(file)) continue;
  const src = fs.readFileSync(file, "utf8");
  if (src.includes("../../styles/tokens.css")) continue; // already done
  // Insert AFTER the local `./<Name>.css` import, keep that first so it wins
  // specificity/order. Resulting order: tokens → shared → self.
  // Actually for cascade we want tokens FIRST so component rules can override.
  const lines = src.split("\n");
  const selfIdx = lines.findIndex((l) => l.includes(`./${name}.css`));
  if (selfIdx === -1) {
    console.warn(`skip ${name}: no self CSS import found`);
    continue;
  }
  // Insert tokens + shared BEFORE self — tokens load first (cascade order),
  // then shared, then component rules (most specific last).
  lines.splice(selfIdx, 0, ...IMPORTS);
  fs.writeFileSync(file, lines.join("\n"));
  changed++;
  console.log(`patched: ${name}`);
}
console.log(`done. ${changed} files patched.`);
