import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Timeline.css";
import * as React from "react";
import { Spin } from "../Spin";

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
  /** Class name forwarded to the item wrapper. */
  className?: string;
  /** Inline style forwarded to the item wrapper. */
  style?: React.CSSProperties;
  /** Class name forwarded to the content wrapper. */
  contentClassName?: string;
  /** Inline style forwarded to the content wrapper. */
  contentStyle?: React.CSSProperties;
  /** Class name forwarded to the dot wrapper. */
  dotClassName?: string;
  /** Inline style forwarded to the dot wrapper. */
  dotStyle?: React.CSSProperties;
  /** Class name forwarded to the label wrapper. */
  labelClassName?: string;
  /** Inline style forwarded to the label wrapper. */
  labelStyle?: React.CSSProperties;
}

export interface TimelineProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Timeline items */
  items: TimelineItemConfig[];
  /**
   * Show a pending (loading) item at the end.
   * `true` renders a default Spin indicator; a ReactNode renders custom content.
   */
  pending?: boolean | React.ReactNode;
  /** Text shown as the pending item's content */
  pendingContent?: React.ReactNode;
  /** Layout mode */
  mode?: "left" | "right" | "alternate";
  /** Reverse the order of items */
  reverse?: boolean;
  /** Class name forwarded to every item wrapper. */
  itemClassName?: string;
  /** Inline style forwarded to every item wrapper. */
  itemStyle?: React.CSSProperties;
  /** Class name forwarded to every content wrapper. */
  contentClassName?: string;
  /** Inline style forwarded to every content wrapper. */
  contentStyle?: React.CSSProperties;
  /** Minimum width for every content wrapper. Defaults to `0` so flex/grid children can shrink. */
  contentMinWidth?: React.CSSProperties["minWidth"];
  /** Class name forwarded to every dot wrapper. */
  dotClassName?: string;
  /** Inline style forwarded to every dot wrapper. */
  dotStyle?: React.CSSProperties;
  /** Vertical offset for the dot. */
  dotOffset?: React.CSSProperties["marginTop"];
  /** Cross-axis dot alignment inside the head column. */
  dotAlign?: "start" | "center" | "end";
  /** Class name forwarded to every label wrapper. */
  labelClassName?: string;
  /** Inline style forwarded to every label wrapper. */
  labelStyle?: React.CSSProperties;
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
      itemClassName,
      itemStyle,
      contentClassName,
      contentStyle,
      contentMinWidth,
      dotClassName,
      dotStyle,
      dotOffset,
      dotAlign = "center",
      labelClassName,
      labelStyle,
      className = "",
      style,
      ...rest
    },
    ref
  ) => {
    const displayItems = [...items];
    if (reverse) displayItems.reverse();

    const hasPending = pending !== false;
    const timelineStyle = {
      ...(dotOffset != null ? { "--timeline-dot-offset": toCssSize(dotOffset) } : {}),
      ...(contentMinWidth != null
        ? { "--timeline-content-min-width": toCssSize(contentMinWidth) }
        : {}),
      ...style,
    } as React.CSSProperties;
    const sharedItemProps = {
      itemClassName,
      itemStyle,
      contentClassName,
      contentStyle,
      dotClassName,
      dotStyle,
      dotAlign,
      labelClassName,
      labelStyle,
    };

    return (
      <div
        ref={ref}
        className={`timeline timeline-${mode} timeline-dot-${dotAlign} ${className}`}
        style={timelineStyle}
        {...rest}
      >
        {displayItems.map((item, i) => (
          <TimelineItem
            key={item.key ?? i}
            item={item}
            isLast={!hasPending && i === displayItems.length - 1}
            position={getPosition(mode, i)}
            {...sharedItemProps}
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
            {...sharedItemProps}
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
  itemClassName?: string;
  itemStyle?: React.CSSProperties;
  contentClassName?: string;
  contentStyle?: React.CSSProperties;
  dotClassName?: string;
  dotStyle?: React.CSSProperties;
  dotAlign: "start" | "center" | "end";
  labelClassName?: string;
  labelStyle?: React.CSSProperties;
}

const TimelineItem: React.FC<TimelineItemInternalProps> = ({
  item,
  isLast,
  isPending,
  position,
  itemClassName,
  itemStyle,
  contentClassName,
  contentStyle,
  dotClassName,
  dotStyle,
  dotAlign,
  labelClassName,
  labelStyle,
}) => {
  const color = item.color ?? "accent";
  const cls = [
    "timeline-item",
    `timeline-item-${position}`,
    isLast ? "timeline-item-last" : "",
    isPending ? "timeline-item-pending" : "",
    itemClassName,
    item.className,
  ]
    .filter(Boolean)
    .join(" ");
  const dotCls = [
    "timeline-item-dot",
    color,
    isPending ? "pending" : "",
    dotClassName,
    item.dotClassName,
  ]
    .filter(Boolean)
    .join(" ");
  const dotAlignStyle: React.CSSProperties =
    dotAlign === "start"
      ? { alignSelf: "flex-start" }
      : dotAlign === "end"
        ? { alignSelf: "flex-end" }
        : {};

  return (
    <div className={cls} style={{ ...itemStyle, ...item.style }}>
      <div
        className={`timeline-item-label ${labelClassName ?? ""} ${item.labelClassName ?? ""}`}
        style={{ ...labelStyle, ...item.labelStyle }}
      >
        {item.label}
      </div>
      <div className="timeline-item-head">
        <div className={dotCls} style={{ ...dotAlignStyle, ...dotStyle, ...item.dotStyle }}>
          {item.dot ?? (isPending && <Spin size={14} />)}
        </div>
        {!isLast && <div className="timeline-item-tail" />}
      </div>
      <div
        className={`timeline-item-content ${contentClassName ?? ""} ${item.contentClassName ?? ""}`}
        style={{ ...contentStyle, ...item.contentStyle }}
      >
        {item.children}
      </div>
    </div>
  );
};

function toCssSize(
  value: React.CSSProperties["marginTop"] | React.CSSProperties["minWidth"]
): string {
  return typeof value === "number" ? `${value}px` : String(value);
}
