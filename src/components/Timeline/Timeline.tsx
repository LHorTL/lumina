import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Timeline.css";
import * as React from "react";
import { Spinner } from "../Empty";

export interface TimelineItemConfig {
  /** Unique key for the item */
  key?: string;
  /** Content displayed on the right (or main side) */
  children?: React.ReactNode;
  /** Label displayed on the opposite side (alternate/label mode) */
  label?: React.ReactNode;
  /** Dot color */
  color?: "accent" | "success" | "warning" | "danger" | "info" | "muted";
  /** Custom dot content (replaces default dot) */
  dot?: React.ReactNode;
}

export interface TimelineProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Timeline items */
  items: TimelineItemConfig[];
  /**
   * Show a pending (loading) item at the end.
   * `true` renders a default spinner; a ReactNode renders custom content.
   */
  pending?: boolean | React.ReactNode;
  /** Text shown as the pending item's content */
  pendingContent?: React.ReactNode;
  /** Layout mode */
  mode?: "left" | "right" | "alternate";
  /** Reverse the order of items */
  reverse?: boolean;
}

/**
 * `Timeline` — vertical timeline with pending/loading state.
 *
 * @example
 * <Timeline items={[{ children: "Created" }, { children: "In Progress" }]} pending />
 */
export const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(
  (
    {
      items,
      pending = false,
      pendingContent = "加载中...",
      mode = "left",
      reverse = false,
      className = "",
      ...rest
    },
    ref
  ) => {
    const displayItems = [...items];
    if (reverse) displayItems.reverse();

    const hasPending = pending !== false;

    return (
      <div
        ref={ref}
        className={`timeline timeline-${mode} ${className}`}
        {...rest}
      >
        {displayItems.map((item, i) => (
          <TimelineItem
            key={item.key ?? i}
            item={item}
            isLast={!hasPending && i === displayItems.length - 1}
            position={getPosition(mode, i)}
          />
        ))}
        {hasPending && (
          <TimelineItem
            item={{
              children: pendingContent,
              dot: typeof pending === "boolean" ? undefined : pending,
              color: "muted",
            }}
            isLast
            isPending
            position={getPosition(mode, displayItems.length)}
          />
        )}
      </div>
    );
  }
);
Timeline.displayName = "Timeline";

function getPosition(
  mode: "left" | "right" | "alternate",
  index: number
): "left" | "right" {
  if (mode === "left") return "left";
  if (mode === "right") return "right";
  return index % 2 === 0 ? "left" : "right";
}

interface TimelineItemInternalProps {
  item: TimelineItemConfig;
  isLast: boolean;
  isPending?: boolean;
  position: "left" | "right";
}

const TimelineItem: React.FC<TimelineItemInternalProps> = ({
  item,
  isLast,
  isPending,
  position,
}) => {
  const color = item.color ?? "accent";
  const cls = [
    "timeline-item",
    `timeline-item-${position}`,
    isLast ? "timeline-item-last" : "",
    isPending ? "timeline-item-pending" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls}>
      <div className="timeline-item-label">{item.label}</div>
      <div className="timeline-item-head">
        <div className={`timeline-item-dot ${color} ${isPending ? "pending" : ""}`}>
          {item.dot ?? (isPending && <Spinner size={14} />)}
        </div>
        {!isLast && <div className="timeline-item-tail" />}
      </div>
      <div className="timeline-item-content">{item.children}</div>
    </div>
  );
};
