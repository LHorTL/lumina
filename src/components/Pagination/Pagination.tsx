import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Pagination.css";
import * as React from "react";
import { Icon } from "../Icon";
import { Select } from "../Select";

export interface PaginationProps {
  /** Total number of items. */
  total: number;
  /** Items per page. */
  pageSize?: number;
  /** Current page (1-indexed). */
  page?: number;
  defaultPage?: number;
  onChange?: (page: number) => void;
  /** Max visible page buttons (before ellipsis logic). */
  siblings?: number;
  /**
   * Render a "跳至 N 页" input to the right of the page buttons. Enter key commits
   * and clamps to `1..totalPages`.
   */
  showQuickJumper?: boolean;
  /**
   * Render a Select to let the user switch the page size. Resetting the size sends the
   * user back to page 1 and calls both `onShowSizeChange` and `onChange(1)`.
   */
  showSizeChanger?: boolean;
  /** Page size choices for `showSizeChanger`. Defaults to `[10, 20, 50, 100]`. */
  pageSizeOptions?: number[];
  /** Fires when the user picks a new page size via the size changer. */
  onShowSizeChange?: (current: number, size: number) => void;
  className?: string;
}

const DEFAULT_SIZE_OPTIONS = [10, 20, 50, 100];

/** `Pagination` — page number controls. */
export const Pagination: React.FC<PaginationProps> = ({
  total,
  pageSize = 10,
  page,
  defaultPage = 1,
  onChange,
  siblings = 1,
  showQuickJumper = false,
  showSizeChanger = false,
  pageSizeOptions = DEFAULT_SIZE_OPTIONS,
  onShowSizeChange,
  className = "",
}) => {
  const [inner, setInner] = React.useState(defaultPage);
  const isControlled = page !== undefined;
  const cur = isControlled ? page! : inner;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const [jumpDraft, setJumpDraft] = React.useState("");

  const go = (p: number) => {
    const next = Math.min(pages, Math.max(1, p));
    if (!isControlled) setInner(next);
    onChange?.(next);
  };

  const handleJump = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    const n = Number(jumpDraft);
    if (!Number.isFinite(n) || n < 1) {
      setJumpDraft("");
      return;
    }
    go(Math.trunc(n));
    setJumpDraft("");
  };

  const handleSizeChange = (size: number) => {
    onShowSizeChange?.(cur, size);
    // reset to page 1 — Ant Design parity
    if (!isControlled) setInner(1);
    onChange?.(1);
  };

  const range = (): (number | "...")[] => {
    const out: (number | "...")[] = [];
    const add = (n: number | "...") => out.push(n);
    const s = Math.max(2, cur - siblings);
    const e = Math.min(pages - 1, cur + siblings);
    add(1);
    if (s > 2) add("...");
    for (let i = s; i <= e; i++) add(i);
    if (e < pages - 1) add("...");
    if (pages > 1) add(pages);
    return out;
  };

  return (
    <div className={`pagination ${className}`}>
      <span className="pg-info">
        共 {total} 条 · 第 {cur} / {pages} 页
      </span>
      <div className="pg-controls">
        <button
          type="button"
          className={`pg ${cur === 1 ? "disabled" : ""}`}
          onClick={() => cur > 1 && go(cur - 1)}
          aria-label="Previous"
        >
          <Icon name="chevLeft" size={12} />
        </button>
        {range().map((p, i) =>
          p === "..." ? (
            <span key={`e${i}`} className="ellipsis">…</span>
          ) : (
            <button
              key={p}
              type="button"
              className={`pg ${p === cur ? "active" : ""}`}
              onClick={() => go(p)}
            >
              {p}
            </button>
          )
        )}
        <button
          type="button"
          className={`pg ${cur === pages ? "disabled" : ""}`}
          onClick={() => cur < pages && go(cur + 1)}
          aria-label="Next"
        >
          <Icon name="chevRight" size={12} />
        </button>
        {showSizeChanger && (
          <div className="pg-size-changer">
            <Select<number>
              value={pageSize}
              size="sm"
              options={pageSizeOptions.map((n) => ({ value: n, label: `${n} 条/页` }))}
              onChange={handleSizeChange}
            />
          </div>
        )}
        {showQuickJumper && (
          <label className="pg-jumper">
            <span className="pg-jumper-label">跳至</span>
            <input
              type="text"
              inputMode="numeric"
              className="pg-jumper-input"
              value={jumpDraft}
              onChange={(e) => setJumpDraft(e.target.value.replace(/[^\d]/g, ""))}
              onKeyDown={handleJump}
              aria-label="跳转到指定页"
            />
            <span className="pg-jumper-label">页</span>
          </label>
        )}
      </div>
    </div>
  );
};
