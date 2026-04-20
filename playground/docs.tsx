import * as React from "react";
import { Icon, IconButton, Tooltip, toast } from "lumina";

/* ============ JSX syntax highlighter ============ */

const KEYWORDS = new Set([
  "import","from","export","default","const","let","var","function","return",
  "if","else","new","typeof","null","undefined","true","false","async","await",
  "type","interface","extends","switch","case","break","this","class","of","in",
]);

const TOKEN_RE =
  /\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|<\/?[A-Za-z][\w.]*|\/>|\b[A-Za-z_$][\w$]*\b|\b\d+\.?\d*\b|=>|[{}()[\]=;,.:!?<>+\-*/&|]/gm;

function classifyToken(t: string): string | null {
  if (t.startsWith("//") || t.startsWith("/*")) return "cm";
  if (t[0] === '"' || t[0] === "'" || t[0] === "`") return "st";
  if (t[0] === "<" && t.length > 1) return "tg";
  if (t === "/>") return "tg";
  if (/^\d/.test(t)) return "nm";
  if (KEYWORDS.has(t)) return "kw";
  return null;
}

function highlightCode(code: string): React.ReactNode[] {
  const src = code.trim();
  const out: React.ReactNode[] = [];
  let last = 0;
  let key = 0;

  const re = new RegExp(TOKEN_RE.source, "gm");
  let m: RegExpExecArray | null;

  while ((m = re.exec(src)) !== null) {
    if (m.index > last) out.push(src.slice(last, m.index));

    const text = m[0];
    const cls = classifyToken(text);

    if (cls) {
      out.push(<span key={key++} className={`hl-${cls}`}>{text}</span>);
    } else {
      const nextChar = src[m.index + text.length];
      if (nextChar === "=" && src[m.index + text.length + 1] !== "=") {
        out.push(<span key={key++} className="hl-at">{text}</span>);
      } else if (text[0] >= "A" && text[0] <= "Z") {
        out.push(<span key={key++} className="hl-tg">{text}</span>);
      } else {
        out.push(text);
      }
    }
    last = m.index + text.length;
  }

  if (last < src.length) out.push(src.slice(last));
  return out;
}

/* ============ Demo card ============ */

export interface DemoProps {
  /** Unique anchor id within the page (e.g. "basic"). */
  id: string;
  /** Demo card title. */
  title: string;
  /** Demo description / what it shows. */
  description?: React.ReactNode;
  /** Raw source string shown when "show code" is toggled. */
  code?: string;
  /** Grid span — 1 (default, half) or 2 (full row). */
  span?: 1 | 2;
  /** The rendered example. */
  children: React.ReactNode;
}

export const Demo: React.FC<DemoProps> = ({ id, title, description, code, span = 1, children }) => {
  const hasPreview = children != null && children !== false;
  const [open, setOpen] = React.useState(!hasPreview);
  const codeRef = React.useRef<HTMLPreElement>(null);
  const [codeHeight, setCodeHeight] = React.useState(0);

  React.useEffect(() => {
    if (open && codeRef.current) {
      setCodeHeight(codeRef.current.scrollHeight);
    }
  }, [open, code]);

  return (
    <section
      id={id}
      className={`doc-demo ${span === 2 ? "span-2" : ""}`}
      data-demo-id={id}
      data-demo-title={title}
    >
      {hasPreview && <div className="doc-demo-preview">{children}</div>}
      <div className="doc-demo-meta">
        <div className="doc-demo-meta-text">
          <a href={`#${id}`} className="doc-demo-title">
            {title}
          </a>
          {description && <div className="doc-demo-desc">{description}</div>}
        </div>
        <div className="doc-demo-actions">
          {code && (
            <Tooltip content="复制代码">
              <IconButton
                icon="copy"
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.clipboard) {
                    navigator.clipboard.writeText(code);
                    toast.success("代码已复制");
                  }
                }}
              />
            </Tooltip>
          )}
          {code && hasPreview && (
            <Tooltip content={open ? "收起代码" : "展开代码"}>
              <IconButton
                icon="code"
                size="sm"
                variant="ghost"
                className={`doc-demo-code-toggle ${open ? "active" : ""}`}
                onClick={() => setOpen((o) => !o)}
              />
            </Tooltip>
          )}
        </div>
      </div>
      {code && (
        <div
          className="doc-demo-code-collapse"
          style={{ height: open ? codeHeight : 0 }}
        >
          <pre ref={codeRef} className="doc-demo-code">
            <code>{highlightCode(code)}</code>
          </pre>
        </div>
      )}
    </section>
  );
};

/* ============ API table ============ */

export interface ApiRow {
  /** Prop / event / member name. */
  prop: string;
  /** Description of what it does. */
  description: React.ReactNode;
  /** TypeScript-ish type signature. */
  type: string;
  /** Default value (rendered as code). */
  default?: string;
  /** Mark prop as required. */
  required?: boolean;
  /** Version this was added. */
  version?: string;
}

export interface ApiTableProps {
  /** Component / interface name shown above the table. */
  title?: string;
  rows: ApiRow[];
}

export const ApiTable: React.FC<ApiTableProps> = ({ title, rows }) => (
  <div className="doc-api">
    {title && <h4 className="doc-api-title">{title}</h4>}
    <div className="doc-api-wrap">
      <table className="doc-api-table">
        <thead>
          <tr>
            <th style={{ width: "18%" }}>参数</th>
            <th style={{ width: "38%" }}>说明</th>
            <th style={{ width: "30%" }}>类型</th>
            <th style={{ width: "14%" }}>默认值</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.prop}>
              <td>
                <code className="doc-api-prop">{r.prop}</code>
                {r.required && <span className="doc-api-required" title="必填">*</span>}
                {r.version && <span className="doc-api-version">{r.version}</span>}
              </td>
              <td>{r.description}</td>
              <td>
                <code className="doc-api-type">{r.type}</code>
              </td>
              <td>{r.default ? <code className="doc-api-default">{r.default}</code> : <span className="doc-api-dash">—</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

/* ============ Doc page block ============ */

export interface DocBlockProps {
  /** Anchor id (e.g. "when-to-use"). */
  id: string;
  /** Section heading. */
  title: string;
  children: React.ReactNode;
}

export const DocBlock: React.FC<DocBlockProps> = ({ id, title, children }) => (
  <section id={id} className="doc-block">
    <h3 className="doc-block-title">
      <a href={`#${id}`} className="doc-block-anchor" aria-label={`Permalink to ${title}`}>
        #
      </a>
      {title}
    </h3>
    <div className="doc-block-body">{children}</div>
  </section>
);

/* ============ Demo grid ============ */

export const DemoGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="doc-demo-grid">{children}</div>
);

/* ============ DocPage — single-component page wrapper ============ */

export interface DocDemoSpec {
  id: string;
  title: string;
  description?: React.ReactNode;
  code?: string;
  span?: 1 | 2;
  /** If omitted, the demo renders as a code-only card (no live preview). */
  render?: () => React.ReactNode;
}

export interface DocPageProps {
  whenToUse?: React.ReactNode;
  demos: DocDemoSpec[];
  api?: { title?: string; rows: ApiRow[] }[];
}

export const DocPage: React.FC<DocPageProps> = ({ whenToUse, demos, api }) => (
  <>
    {whenToUse && (
      <DocBlock id="when-to-use" title="何时使用">
        {whenToUse}
      </DocBlock>
    )}
    <DocBlock id="demos" title="代码演示">
      <DemoGrid>
        {demos.map((d) => (
          <Demo
            key={d.id}
            id={d.id}
            title={d.title}
            description={d.description}
            code={d.code}
            span={d.span}
          >
            {d.render?.()}
          </Demo>
        ))}
      </DemoGrid>
    </DocBlock>
    {api && api.length > 0 && (
      <DocBlock id="api" title="API">
        {api.map((a, i) => (
          <React.Fragment key={i}>
            {i > 0 && <div style={{ height: 16 }} />}
            <ApiTable title={a.title} rows={a.rows} />
          </React.Fragment>
        ))}
      </DocBlock>
    )}
  </>
);

/* ============ Right anchor nav ============ */

export interface AnchorItem {
  href: string;
  label: string;
  /** Indent level (0 / 1). */
  level?: 0 | 1;
}

export const AnchorNav: React.FC<{ items: AnchorItem[]; rootRef: React.RefObject<HTMLElement | null> }> = ({
  items,
  rootRef,
}) => {
  const [active, setActive] = React.useState<string | null>(items[0]?.href ?? null);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const targets = items
      .map((it) => root.querySelector(it.href))
      .filter((el): el is Element => el !== null);

    if (targets.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(`#${visible[0].target.id}`);
      },
      { root, rootMargin: "-10% 0px -70% 0px", threshold: [0, 1] }
    );
    targets.forEach((t) => obs.observe(t));
    return () => obs.disconnect();
  }, [items, rootRef]);

  const click = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const root = rootRef.current;
    const el = root?.querySelector(href) as HTMLElement | null;
    if (!root || !el) return;
    setActive(href);
    root.scrollTo({ top: el.offsetTop - 16, behavior: "smooth" });
  };

  return (
    <nav className="doc-anchor" aria-label="On this page">
      <div className="doc-anchor-title">本页内容</div>
      <ul>
        {items.map((it) => (
          <li key={it.href} className={`level-${it.level ?? 0}`}>
            <a
              href={it.href}
              className={`doc-anchor-link ${active === it.href ? "active" : ""}`}
              onClick={(e) => click(e, it.href)}
            >
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

/* ============ Helper for collecting anchors from demos ============ */

export const collectAnchors = (
  whenToUse: boolean,
  demos: { id: string; title: string }[],
  api: boolean
): AnchorItem[] => {
  const out: AnchorItem[] = [];
  if (whenToUse) out.push({ href: "#when-to-use", label: "何时使用", level: 0 });
  if (demos.length) {
    out.push({ href: "#demos", label: "代码演示", level: 0 });
    for (const d of demos) out.push({ href: `#${d.id}`, label: d.title, level: 1 });
  }
  if (api) out.push({ href: "#api", label: "API", level: 0 });
  return out;
};

/* Re-export icon for convenience in docs */
export { Icon };
