import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Playground app config. For library build see tsup.config.ts.
export default defineConfig({
  plugins: [react()],
  root: "./playground",
  resolve: {
    alias: [
      { find: /^lumina\/styles$/, replacement: path.resolve(__dirname, "src/styles/index.css") },
      { find: /^lumina$/, replacement: path.resolve(__dirname, "src/index.ts") },
    ],
  },
  server: {
    port: 5173,
    open: true,
  },
});
