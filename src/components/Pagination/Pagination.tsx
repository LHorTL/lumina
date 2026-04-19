import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Pagination.css";
import * as React from "react";
import { Icon } from "../Icon";

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
  className?: string;
}

/** `Pagination` — page number controls. */
export const Pagination: React.FC<PaginationProps> = ({
  total,
  pageSize = 10,
  page,
  defaultPage = 1,
  onChange,
  siblings = 1,
  className = "",
}) => {
  const [inner, setInner] = React.useState(defaultPage);
  const isControlled = page !== undefined;
  const cur = isControlled ? page! : inner;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const go = (p: number) => {
    const next = Math.min(pages, Math.max(1, p));
    if (!isControlled) setInner(next);
    onChange?.(next);
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
      </div>
    </div>
  );
};
