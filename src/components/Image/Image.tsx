import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Image.css";
import * as React from "react";
import ReactDOM from "react-dom";
import { Icon } from "../Icon";

export interface ImageProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  /** Allow click-to-zoom preview overlay. */
  preview?: boolean;
  /** Hover scale-up. */
  hover?: boolean;
  /** Custom placeholder while loading or on error. */
  placeholder?: React.ReactNode;
  className?: string;
}

/** `Image` — neumorphic framed image with optional preview overlay. */
export const Image = React.forwardRef<HTMLDivElement, ImageProps>(({
  src,
  alt,
  width = 200,
  height = 140,
  preview = true,
  hover = true,
  placeholder,
  className = "",
  style,
  ...rest
}, ref) => {
  const [loaded, setLoaded] = React.useState(false);
  const [err, setErr] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const canPreview = preview && loaded && !err;

  return (
    <>
      <div
        ref={ref}
        className={`n-image ${hover ? "hover" : ""} ${canPreview ? "clickable" : ""} ${className}`}
        style={{ width, ...style }}
        onClick={() => canPreview && setOpen(true)}
        {...rest}
      >
        <div className="n-image-frame" style={{ width: "100%", height }}>
          {!err && src && (
            <img src={src} alt={alt} onLoad={() => setLoaded(true)} onError={() => setErr(true)} />
          )}
          <div className={`n-image-placeholder ${loaded && !err ? "loaded" : ""}`}>
            {placeholder ?? <Icon name="image" size={28} />}
          </div>
          {canPreview && (
            <>
              <div className="image-hint">
                <Icon name="eye" size={14} />
                <span>点击查看</span>
              </div>
              <div className="image-actions" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="ia-btn"
                  onClick={() => setOpen(true)}
                  aria-label="预览"
                >
                  <Icon name="eye" size={13} />
                </button>
                {src && (
                  <a className="ia-btn" href={src} download aria-label="下载">
                    <Icon name="download" size={13} />
                  </a>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      {open &&
        typeof document !== "undefined" &&
        ReactDOM.createPortal(
          <div className="image-preview-overlay" onClick={() => setOpen(false)}>
            <img src={src} alt={alt} onClick={(e) => e.stopPropagation()} />
          </div>,
          document.body
        )}
    </>
  );
});
Image.displayName = "Image";

export interface ImageGridProps extends React.HTMLAttributes<HTMLDivElement> {
  images: { src: string; alt?: string }[];
  columns?: number;
  itemHeight?: number;
  className?: string;
}

/** `ImageGrid` — auto-fit grid of `Image` items. */
export const ImageGrid = React.forwardRef<HTMLDivElement, ImageGridProps>(({
  images,
  columns,
  itemHeight = 130,
  className = "",
  style,
  ...rest
}, ref) => (
  <div
    ref={ref}
    className={className}
    style={{
      display: "grid",
      gap: 14,
      gridTemplateColumns: columns
        ? `repeat(${columns}, 1fr)`
        : "repeat(auto-fill, minmax(160px, 1fr))",
      ...style,
    }}
    {...rest}
  >
    {images.map((img, i) => (
      <Image key={i} src={img.src} alt={img.alt} width="100%" height={itemHeight} />
    ))}
  </div>
));
ImageGrid.displayName = "ImageGrid";
