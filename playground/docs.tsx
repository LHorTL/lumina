import * as React from "react";
import { Button, Alert, Icon, Tooltip, message } from "lumina";
import { CodeEditor } from "./CodeEditor";
import { compileLiveDemo, getCurrentSectionId, getLiveDemoSource } from "./live-demo";

function formatLiveError(error: unknown) {
  if (error instanceof Error) {
    return error.message.split("\n").find(Boolean) ?? "代码执行失败";
  }
  return "代码执行失败";
}

class PreviewBoundary extends React.Component<
  {
    fallback: React.ReactNode;
    onError: (error: Error) => void;
    resetKey: unknown;
    children: React.ReactNode;
  },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  componentDidUpdate(prevProps: Readonly<{ resetKey: unknown }>) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.failed) {
      this.setState({ failed: false });
    }
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

const CandidateProbe: React.FC<{
  Component: React.ComponentType;
  onReady: () => void;
}> = ({ Component, onReady }) => {
  React.useLayoutEffect(() => {
    onReady();
  }, [onReady]);

  return <Component />;
};

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
  const codeRef = React.useRef<HTMLDivElement>(null);
  const [codeHeight, setCodeHeight] = React.useState(0);
  const sectionId = React.useMemo(() => getCurrentSectionId(), []);
  const liveSource = React.useMemo(() => getLiveDemoSource(sectionId, id), [id, sectionId]);
  const source = React.useMemo(() => (liveSource ?? code ?? "").trim(), [liveSource, code]);
  const [draft, setDraft] = React.useState(source);
  const deferredDraft = React.useDeferredValue(draft);
  const [committedLive, setCommittedLive] = React.useState<React.ComponentType | null>(null);
  const [pendingLive, setPendingLive] = React.useState<{
    key: number;
    Component: React.ComponentType;
  } | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<"idle" | "compiling" | "validating" | "ready" | "error">("idle");
  const compileTicketRef = React.useRef(0);

  React.useEffect(() => {
    setDraft(source);
    setCommittedLive(null);
    setPendingLive(null);
    setError(null);
    setStatus("idle");
    compileTicketRef.current += 1;
  }, [source]);

  React.useEffect(() => {
    if (open && codeRef.current) {
      setCodeHeight(codeRef.current.scrollHeight);
    }
  }, [draft, error, open, source, status]);

  React.useEffect(() => {
    if (!open || !hasPreview || !liveSource) return;
    if (deferredDraft.trim() === source && committedLive == null) {
      setError(null);
      setStatus("idle");
      return;
    }

    let cancelled = false;
    const ticket = compileTicketRef.current + 1;
    compileTicketRef.current = ticket;
    setStatus("compiling");

    void compileLiveDemo(deferredDraft)
      .then((Component) => {
        if (cancelled || ticket !== compileTicketRef.current) return;
        setPendingLive({ key: ticket, Component });
        setStatus("validating");
      })
      .catch((nextError) => {
        if (cancelled || ticket !== compileTicketRef.current) return;
        setPendingLive(null);
        setStatus("error");
        setError(formatLiveError(nextError));
      });

    return () => {
      cancelled = true;
    };
  }, [deferredDraft, hasPreview, liveSource, open, source]);

  const reset = React.useCallback(() => {
    compileTicketRef.current += 1;
    setDraft(source);
    setCommittedLive(null);
    setPendingLive(null);
    setError(null);
    setStatus("idle");
  }, [source]);

  const previewContent = committedLive ? (
    <PreviewBoundary
      fallback={children}
      resetKey={committedLive}
      onError={(nextError) => {
        setCommittedLive(null);
        setPendingLive(null);
        setStatus("error");
        setError(formatLiveError(nextError));
      }}
    >
      {React.createElement(committedLive)}
    </PreviewBoundary>
  ) : (
    children
  );

  const statusText = liveSource
    ? status === "compiling"
      ? "正在编译代码..."
      : status === "validating"
        ? "代码有效，正在同步预览..."
        : status === "ready"
          ? "预览已按最新代码同步。"
          : status === "error"
            ? "代码报错，已保留上一次成功预览。"
            : "编辑下方代码后，上方预览会自动同步。"
    : "当前示例使用静态代码片段。";

  return (
    <section
      id={id}
      className={`doc-demo ${span === 2 ? "span-2" : ""}`}
      data-demo-id={id}
      data-demo-title={title}
    >
      {hasPreview && <div className="doc-demo-preview">{previewContent}</div>}
      <div className="doc-demo-meta">
        <div className="doc-demo-meta-text">
          <a href={`#${id}`} className="doc-demo-title">
            {title}
          </a>
          {description && <div className="doc-demo-desc">{description}</div>}
        </div>
        <div className="doc-demo-actions">
          {source && (
            <Tooltip content="复制当前代码">
              <Button
                icon="copy"
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.clipboard) {
                    navigator.clipboard.writeText(draft);
                    message.success("代码已复制");
                  }
                }}
              />
            </Tooltip>
          )}
          {source && hasPreview && (
            <Tooltip content={open ? "收起代码" : "展开代码"}>
              <Button
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
      {source && (
        <div
          className="doc-demo-code-collapse"
          style={{ height: open ? codeHeight : 0 }}
        >
          <div ref={codeRef} className="doc-demo-editor-shell">
            <div className="doc-demo-live-meta">
              <span className={`doc-demo-live-status ${status}`}>{statusText}</span>
              {liveSource && (
                <Button size="sm" variant="ghost" onClick={reset}>
                  重置
                </Button>
              )}
            </div>
            {error && (
              <Alert tone="danger" title="代码有误">
                {error}
              </Alert>
            )}
            <CodeEditor
              className="doc-demo-editor"
              value={draft}
              onChange={setDraft}
              invalid={!!error}
            />
          </div>
        </div>
      )}
      {pendingLive && (
        <div className="doc-demo-probe" aria-hidden="true">
          <PreviewBoundary
            fallback={null}
            resetKey={pendingLive.key}
            onError={(nextError) => {
              setPendingLive(null);
              setStatus("error");
              setError(formatLiveError(nextError));
            }}
          >
            <CandidateProbe
              Component={pendingLive.Component}
              onReady={() => {
                if (pendingLive.key !== compileTicketRef.current) return;
                setCommittedLive(() => pendingLive.Component);
                setPendingLive(null);
                setStatus("ready");
                setError(null);
              }}
            />
          </PreviewBoundary>
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
