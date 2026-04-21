import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import type { Plugin } from "vite";

const VIRTUAL_DEMO_SOURCE_ID = "virtual:lumina-demo-sources";
const RESOLVED_VIRTUAL_DEMO_SOURCE_ID = `\0${VIRTUAL_DEMO_SOURCE_ID}`;

interface SectionDemoSourceRecord {
  demos: Record<string, string>;
}

const PLAYGROUND_SECTION_DIR = path.resolve(process.cwd(), "playground", "sections");

function getNodeText(node: ts.Node, sf: ts.SourceFile): string {
  const raw = sf.text.slice(node.getStart(sf), node.getEnd());
  const lines = raw.split("\n");
  if (lines.length <= 1) return raw;
  const col = sf.getLineAndCharacterOfPosition(node.getStart(sf)).character;
  const subsequent = lines.slice(1).filter((l) => l.trim().length > 0);
  if (subsequent.length === 0) return raw;
  const minIndent = Math.min(...subsequent.map((l) => l.match(/^(\s*)/)![1].length));
  const strip = Math.min(col, minIndent);
  if (strip === 0) return raw;
  return [lines[0], ...lines.slice(1).map((l) => l.slice(strip))].join("\n");
}

function collectBindingNames(pattern: ts.BindingName): string[] {
  if (ts.isIdentifier(pattern)) return [pattern.text];
  if (ts.isArrayBindingPattern(pattern)) {
    return pattern.elements.flatMap((e) =>
      ts.isOmittedExpression(e) ? [] : collectBindingNames(e.name)
    );
  }
  if (ts.isObjectBindingPattern(pattern)) {
    return pattern.elements.flatMap((e) => collectBindingNames(e.name));
  }
  return [];
}

function getDeclaredNames(node: ts.Node): string[] {
  if (ts.isVariableStatement(node)) {
    return node.declarationList.declarations.flatMap((decl) =>
      collectBindingNames(decl.name)
    );
  }
  if (
    ts.isFunctionDeclaration(node) ||
    ts.isInterfaceDeclaration(node) ||
    ts.isTypeAliasDeclaration(node) ||
    ts.isClassDeclaration(node) ||
    ts.isEnumDeclaration(node)
  ) {
    return node.name ? [node.name.text] : [];
  }
  return [];
}

function isMetaDeclarationName(name: string, componentName: string): boolean {
  if (name === componentName) return true;
  if (name === "demos") return true;
  return /api(?:row|rows)?$/i.test(name);
}

function getSectionMeta(sf: ts.SourceFile): { id: string; componentName: string } | null {
  for (const stmt of sf.statements) {
    if (!ts.isExportAssignment(stmt) || stmt.isExportEquals) continue;
    const expr = stmt.expression;
    if (
      !ts.isCallExpression(expr) ||
      !ts.isIdentifier(expr.expression) ||
      expr.expression.text !== "defineSection" ||
      expr.arguments.length === 0 ||
      !ts.isObjectLiteralExpression(expr.arguments[0])
    ) {
      continue;
    }
    let id = "";
    let componentName = "";
    for (const prop of expr.arguments[0].properties) {
      if (!ts.isPropertyAssignment(prop)) continue;
      const key = ts.isIdentifier(prop.name) ? prop.name.text : prop.name.getText(sf);
      if (key === "id" && ts.isStringLiteral(prop.initializer)) {
        id = prop.initializer.text;
      }
      if (key === "Component" && ts.isIdentifier(prop.initializer)) {
        componentName = prop.initializer.text;
      }
    }
    if (id && componentName) return { id, componentName };
  }
  return null;
}

function findComponentNode(
  sf: ts.SourceFile,
  componentName: string
): ts.FunctionLikeDeclarationBase | null {
  for (const stmt of sf.statements) {
    if (ts.isFunctionDeclaration(stmt) && stmt.name?.text === componentName) {
      return stmt;
    }
    if (!ts.isVariableStatement(stmt)) continue;
    for (const decl of stmt.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name) || decl.name.text !== componentName || !decl.initializer) continue;
      if (ts.isArrowFunction(decl.initializer) || ts.isFunctionExpression(decl.initializer)) {
        return decl.initializer;
      }
    }
  }
  return null;
}

function collectLocals(node: ts.Node): Map<string, ts.Expression> {
  const locals = new Map<string, ts.Expression>();
  const visit = (current: ts.Node) => {
    if (
      ts.isVariableDeclaration(current) &&
      ts.isIdentifier(current.name) &&
      current.initializer
    ) {
      locals.set(current.name.text, current.initializer);
    }
    ts.forEachChild(current, visit);
  };
  visit(node);
  return locals;
}

function resolveExpression(
  expr: ts.Expression | undefined,
  locals: Map<string, ts.Expression>
): ts.Expression | undefined {
  if (!expr) return undefined;
  if (ts.isIdentifier(expr) && locals.has(expr.text)) {
    return resolveExpression(locals.get(expr.text), locals);
  }
  return expr;
}

function extractRenderBody(node: ts.Expression, sf: ts.SourceFile): string | null {
  if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
    if (ts.isBlock(node.body)) {
      return node.body.statements.map((stmt) => getNodeText(stmt, sf)).join("\n\n").trim();
    }
    return `return ${getNodeText(node.body, sf).trim()};`;
  }
  return null;
}

interface SupportStmt {
  names: string[];
  code: string;
}

function extractSupportStatements(
  componentNode: ts.FunctionLikeDeclarationBase,
  sf: ts.SourceFile
): SupportStmt[] {
  const componentBody = componentNode.body;
  if (!componentBody || !ts.isBlock(componentBody)) return [];
  const lastReturnIndex = [...componentBody.statements]
    .map((stmt, index) => ({ stmt, index }))
    .filter(({ stmt }) => ts.isReturnStatement(stmt))
    .map(({ index }) => index)
    .pop();

  const statements =
    lastReturnIndex == null
      ? componentBody.statements
      : componentBody.statements.slice(0, lastReturnIndex);

  return statements
    .filter((stmt) => !getDeclaredNames(stmt).some((name) => name === "demos"))
    .map((stmt) => ({ names: getDeclaredNames(stmt), code: getNodeText(stmt, sf) }));
}

function filterSupportForDemo(support: SupportStmt[], renderBody: string): string {
  const used = support.filter((s) =>
    s.names.length === 0 || s.names.some((n) => new RegExp(`\\b${n}\\b`).test(renderBody))
  );
  return used.map((s) => s.code).join("\n\n").trim();
}

function extractDocPageDemos(
  componentNode: ts.FunctionLikeDeclarationBase,
  sf: ts.SourceFile,
  support: SupportStmt[],
  fileSupport: SupportStmt[]
): Record<string, string> {
  const demos: Record<string, string> = {};
  if (!componentNode.body) return demos;
  const locals = collectLocals(componentNode);

  let demoArray: ts.ArrayLiteralExpression | null = null;
  const visit = (node: ts.Node) => {
    if (demoArray) return;
    if (
      (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) &&
      ts.isIdentifier(node.tagName) &&
      node.tagName.text === "DocPage"
    ) {
      for (const attr of node.attributes.properties) {
        if (!ts.isJsxAttribute(attr) || attr.name.getText(sf) !== "demos" || !attr.initializer) continue;
        const rawExpr = ts.isJsxExpression(attr.initializer) ? attr.initializer.expression : attr.initializer;
        const resolved = resolveExpression(rawExpr, locals);
        if (resolved && ts.isArrayLiteralExpression(resolved)) {
          demoArray = resolved;
          return;
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(componentNode);

  if (!demoArray) return demos;
  const resolvedDemoArray = demoArray as ts.ArrayLiteralExpression;

  for (const item of resolvedDemoArray.elements) {
    if (!ts.isObjectLiteralExpression(item)) continue;
    let demoId = "";
    let renderBody = "";
    for (const prop of item.properties) {
      if (!ts.isPropertyAssignment(prop)) continue;
      const key = ts.isIdentifier(prop.name) ? prop.name.text : prop.name.getText(sf);
      if (key === "id" && ts.isStringLiteral(prop.initializer)) {
        demoId = prop.initializer.text;
      }
      if (key === "render") {
        renderBody = extractRenderBody(prop.initializer, sf) ?? "";
      }
    }
    if (demoId && renderBody) {
      const demoFileSupport = filterSupportForDemo(fileSupport, renderBody);
      const demoSupport = filterSupportForDemo(support, renderBody);
      demos[demoId] = [demoFileSupport, demoSupport, renderBody].filter(Boolean).join("\n\n");
    }
  }

  return demos;
}

function extractFileSupportStatements(
  sf: ts.SourceFile,
  componentName: string
): SupportStmt[] {
  return sf.statements
    .filter((stmt) => {
      if (ts.isImportDeclaration(stmt) || ts.isExportAssignment(stmt)) return false;
      const names = getDeclaredNames(stmt);
      if (names.length === 0) return false;
      return !names.every((name) => isMetaDeclarationName(name, componentName));
    })
    .map((stmt) => ({ names: getDeclaredNames(stmt), code: getNodeText(stmt, sf) }));
}

function buildDemoSourceManifest(): Record<string, SectionDemoSourceRecord> {
  const files = fs
    .readdirSync(PLAYGROUND_SECTION_DIR)
    .filter((file: string) => file.endsWith(".tsx") && !file.startsWith("_"))
    .map((file: string) => path.join(PLAYGROUND_SECTION_DIR, file));

  const manifest: Record<string, SectionDemoSourceRecord> = {};

  for (const filepath of files) {
    const source = fs.readFileSync(filepath, "utf8");
    const sf = ts.createSourceFile(filepath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const meta = getSectionMeta(sf);
    if (!meta) continue;
    const componentNode = findComponentNode(sf, meta.componentName);
    if (!componentNode) continue;

    const fileSupport = extractFileSupportStatements(sf, meta.componentName);
    const support = extractSupportStatements(componentNode, sf);
    const demos = extractDocPageDemos(componentNode, sf, support, fileSupport);
    if (Object.keys(demos).length === 0) continue;

    manifest[meta.id] = { demos };
  }

  return manifest;
}

export function luminaDemoSourcePlugin(): Plugin {
  return {
    name: "lumina-demo-source-plugin",
    resolveId(id) {
      if (id === VIRTUAL_DEMO_SOURCE_ID) return RESOLVED_VIRTUAL_DEMO_SOURCE_ID;
      return null;
    },
    load(id) {
      if (id !== RESOLVED_VIRTUAL_DEMO_SOURCE_ID) return null;
      const manifest = buildDemoSourceManifest();
      return [
        "export const DEMO_SOURCE_MAP = ",
        `${JSON.stringify(manifest)};`,
        "export default DEMO_SOURCE_MAP;",
      ].join("\n");
    },
    handleHotUpdate(ctx) {
      if (!ctx.file.startsWith(PLAYGROUND_SECTION_DIR) || !ctx.file.endsWith(".tsx")) return;
      const mod = ctx.server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_DEMO_SOURCE_ID);
      if (!mod) return;
      ctx.server.moduleGraph.invalidateModule(mod);
      return [mod];
    },
  };
}
