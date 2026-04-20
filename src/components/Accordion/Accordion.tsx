import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Accordion.css";
import * as React from "react";
import { Icon } from "../Icon";

export interface AccordionItem {
  key: string;
  title: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** If true, multiple sections can be open at once. */
  multiple?: boolean;
  /**
   * Accordion mode — at most one item open at a time. Takes precedence over `multiple`
   * when both are set.
   */
  accordion?: boolean;
  /**
   * What triggers expansion.
   * - `"header"` (default): clicking anywhere on the header toggles.
   * - `"icon"`: only the chevron icon is clickable.
   * - `"disabled"`: the panel cannot be toggled.
   */
  collapsible?: "header" | "icon" | "disabled";
  activeKeys?: string[];
  defaultActiveKeys?: string[];
  onChange?: (keys: string[]) => void;
  className?: string;
}

/** `Accordion` — collapsible sections. */
export const Accordion: React.FC<AccordionProps> = ({
  items,
  multiple = false,
  accordion = false,
  collapsible = "header",
  activeKeys,
  defaultActiveKeys = [],
  onChange,
  className = "",
}) => {
  const [inner, setInner] = React.useState<string[]>(defaultActiveKeys);
  const isControlled = activeKeys !== undefined;
  const keys = isControlled ? activeKeys! : inner;

  // accordion takes precedence over multiple
  const singleOpen = accordion || !multiple;

  const toggle = (k: string, itemDisabled?: boolean) => {
    if (collapsible === "disabled" || itemDisabled) return;
    const next = keys.includes(k)
      ? keys.filter((x) => x !== k)
      : singleOpen
      ? [k]
      : [...keys, k];
    if (!isControlled) setInner(next);
    onChange?.(next);
  };

  return (
    <div className={`accordion ${className}`}>
      {items.map((it) => {
        const open = keys.includes(it.key);
        const isDisabled = it.disabled || collapsible === "disabled";
        const headerClickable = collapsible === "header" && !isDisabled;
        return (
          <div
            key={it.key}
            className={`accordion-item ${open ? "open" : ""} ${isDisabled ? "disabled" : ""} ${collapsible === "icon" ? "icon-only" : ""}`}
          >
            <button
              type="button"
              className="accordion-head"
              disabled={isDisabled}
              onClick={() => headerClickable && toggle(it.key, it.disabled)}
              aria-expanded={open}
            >
              <span>{it.title}</span>
              <span
                className={`accordion-chev${collapsible === "icon" ? " clickable" : ""}`}
                onClick={(e) => {
                  if (collapsible === "icon" && !isDisabled) {
                    e.stopPropagation();
                    toggle(it.key, it.disabled);
                  }
                }}
              >
                <Icon name="chevDown" size={16} />
              </span>
            </button>
            <div className="accordion-body">
              <div className="accordion-body-inner">{it.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
