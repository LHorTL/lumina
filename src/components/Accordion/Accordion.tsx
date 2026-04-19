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
  activeKeys?: string[];
  defaultActiveKeys?: string[];
  onChange?: (keys: string[]) => void;
  className?: string;
}

/** `Accordion` — collapsible sections. */
export const Accordion: React.FC<AccordionProps> = ({
  items,
  multiple = false,
  activeKeys,
  defaultActiveKeys = [],
  onChange,
  className = "",
}) => {
  const [inner, setInner] = React.useState<string[]>(defaultActiveKeys);
  const isControlled = activeKeys !== undefined;
  const keys = isControlled ? activeKeys! : inner;

  const toggle = (k: string) => {
    const next = keys.includes(k)
      ? keys.filter((x) => x !== k)
      : multiple
      ? [...keys, k]
      : [k];
    if (!isControlled) setInner(next);
    onChange?.(next);
  };

  return (
    <div className={`accordion ${className}`}>
      {items.map((it) => {
        const open = keys.includes(it.key);
        return (
          <div key={it.key} className={`accordion-item ${open ? "open" : ""}`}>
            <button
              type="button"
              className="accordion-head"
              disabled={it.disabled}
              onClick={() => toggle(it.key)}
              aria-expanded={open}
            >
              <span>{it.title}</span>
              <span className="accordion-chev">
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
