import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { luminaDemoSourcePlugin } from "./playground/demo-source-plugin";

// Playground app config. For library build see tsup.config.ts.
export default defineConfig({
  plugins: [react(), luminaDemoSourcePlugin()],
  root: "./playground",
  resolve: {
    alias: [
      { find: /^lumina\/styles$/, replacement: path.resolve(__dirname, "src/styles/index.css") },
      { find: /^lumina$/, replacement: path.resolve(__dirname, "src/index.ts") },
    ],
  },
  build: {
    chunkSizeWarningLimit: 3500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("@babel/standalone")) return "babel";
          if (id.includes("prismjs") || id.includes("/playground/CodeEditor.tsx") || id.includes("/playground/live-demo.tsx")) {
            return "playground-live-tools";
          }
          if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) return "react-vendor";
          if (id.includes("node_modules")) return "vendor";
          return undefined;
        },
      },
    },
  },
  server: {
    port: 5173,
    open: false,
  },
});
