import { defineConfig } from "tsup";
import fs from "node:fs";
import path from "node:path";

// Enumerate every src/components/<Name>/ folder as its own entry.
// Consumers can then `import { Button } from "lumina/Button"` — bundler
// follows Button.tsx's `import "./Button.css"` side-effect and loads only
// that component's CSS.
const componentsDir = "src/components";
const componentEntries = Object.fromEntries(
  fs
    .readdirSync(componentsDir)
    .filter((name) => fs.statSync(path.join(componentsDir, name)).isDirectory())
    .map((name) => [name, path.posix.join(componentsDir, name, "index.ts")])
);

export default defineConfig({
  entry: {
    index: "src/index.ts",
    ...componentEntries,
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: false,
  clean: true,
  splitting: true,
  treeshake: true,
  external: ["react", "react-dom"],
  loader: {
    ".css": "copy",
  },
  onSuccess: async () => {
    const fs = await import("node:fs/promises");
    const postcss = (await import("postcss")).default;
    const atImport = (await import("postcss-import")).default;
    const src = await fs.readFile("src/styles/index.css", "utf8");
    const out = await postcss([atImport()]).process(src, {
      from: "src/styles/index.css",
      to: "dist/styles.css",
    });
    await fs.writeFile("dist/styles.css", out.css, "utf8");
    await fs.copyFile("src/styles/tokens.css", "dist/tokens.css");
  },
});
