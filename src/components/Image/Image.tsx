import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Image.css";
import * as React from "react";
import ReactDOM from "react-dom";
import { Icon } from "../Icon";

export interface ImageProps {
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
export const Image: React.FC<ImageProps> = ({
  src,
  alt,
  width = 200,
  height = 140,
  preview = true,
  hover = true,
  placeholder,
  className = "",
}) => {
  const [loaded, setLoaded] = React.useState(false);
  const [err, setErr] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const canPreview = preview && loaded && !err;

  return (
    <>
      <div
        className={`n-image ${hover ? "hover" : ""} ${canPreview ? "clickable" : ""} ${className}`}
        style={{ width }}
        onClick={() => canPreview && setOpen(true)}
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
};

export interface ImageGridProps {
  images: { src: string; alt?: string }[];
  columns?: number;
  itemHeight?: number;
  className?: string;
}

/** `ImageGrid` — auto-fit grid of `Image` items. */
export const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  columns,
  itemHeight = 130,
  className = "",
}) => (
  <div
    className={className}
    style={{
      display: "grid",
      gap: 14,
      gridTemplateColumns: columns
        ? `repeat(${columns}, 1fr)`
        : "repeat(auto-fill, minmax(160px, 1fr))",
    }}
  >
    {images.map((img, i) => (
      <Image key={i} src={img.src} alt={img.alt} width="100%" height={itemHeight} />
    ))}
  </div>
);
