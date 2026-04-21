import * as React from "react";
import * as Lumina from "lumina";
import { Field, Row } from "./sections/_shared";
import { DEMO_SOURCE_MAP } from "virtual:lumina-demo-sources";

interface SectionDemoSourceRecord {
  demos: Record<string, string>;
}

const runtimeScope = {
  React,
  Field,
  Row,
  ...Lumina,
};

const compiledCache = new Map<string, React.ComponentType>();
let babelPromise: Promise<typeof import("@babel/standalone")> | null = null;

function getBabel() {
  if (!babelPromise) {
    babelPromise = import("@babel/standalone") as Promise<typeof import("@babel/standalone")>;
  }
  return babelPromise;
}

function wrapDemoBody(body: string) {
  return `
let __demoResult;

const __Demo = () => {
${body}
};

__demoResult = __Demo;
`;
}

export function getCurrentSectionId() {
  if (typeof window === "undefined") return "";
  return window.location.hash.replace(/^#\/?/, "").split("/")[0] ?? "";
}

function dedent(code: string): string {
  const lines = code.split("\n");
  const nonEmpty = lines.filter((l) => l.trim().length > 0);
  if (nonEmpty.length === 0) return code;
  const indent = Math.min(...nonEmpty.map((l) => l.match(/^(\s*)/)![1].length));
  if (indent === 0) return code;
  return lines.map((l) => l.slice(indent)).join("\n");
}

export function getLiveDemoSource(sectionId: string, demoId: string) {
  const record = (DEMO_SOURCE_MAP as Record<string, SectionDemoSourceRecord | undefined>)[sectionId];
  if (!record) return null;
  const renderBody = record.demos[demoId];
  if (!renderBody) return null;
  return dedent(renderBody).trim();
}

export async function compileLiveDemo(body: string) {
  const cached = compiledCache.get(body);
  if (cached) return cached;

  const Babel = await getBabel();
  const result = Babel.transform(wrapDemoBody(body), {
    filename: "lumina-live-demo.tsx",
    babelrc: false,
    configFile: false,
    presets: [
      ["typescript", { allExtensions: true, isTSX: true }],
      ["react", { runtime: "classic" }],
    ],
  });

  const compiled = result.code?.trim();
  if (!compiled) {
    throw new Error("实时编译失败：没有生成可执行代码。");
  }

  const scopeKeys = Object.keys(runtimeScope);
  const scopeValues = Object.values(runtimeScope);
  const factory = new Function(...scopeKeys, `${compiled}\nreturn __demoResult;`);
  const Component = factory(...scopeValues) as React.ComponentType;

  if (typeof Component !== "function") {
    throw new Error("实时编译失败：代码没有返回可渲染的 React 组件。");
  }

  compiledCache.set(body, Component);
  return Component;
}
