import "./code-editor.css";
import * as React from "react";
import Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  className?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, invalid, className }) => {
  const preRef = React.useRef<HTMLPreElement>(null);
  const taRef = React.useRef<HTMLTextAreaElement>(null);

  const highlighted = React.useMemo(
    () => Prism.highlight(value, Prism.languages.tsx!, "tsx"),
    [value],
  );

  const syncScroll = React.useCallback(() => {
    const ta = taRef.current;
    const pre = preRef.current;
    if (!ta || !pre) return;
    pre.scrollTop = ta.scrollTop;
    pre.scrollLeft = ta.scrollLeft;
  }, []);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const ta = e.currentTarget;
        const { selectionStart, selectionEnd } = ta;
        const next = value.slice(0, selectionStart) + "  " + value.slice(selectionEnd);
        onChange(next);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = selectionStart + 2;
        });
      }
    },
    [value, onChange],
  );

  return (
    <div className={`code-editor ${invalid ? "invalid" : ""} ${className ?? ""}`}>
      <pre ref={preRef} aria-hidden="true">
        <code dangerouslySetInnerHTML={{ __html: highlighted + "\n" }} />
      </pre>
      <textarea
        ref={taRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
      />
    </div>
  );
};
