import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Image.css";
import * as React from "react";
import ReactDOM from "react-dom";
import { Icon } from "../Icon";

export type ImageVariant = "framed" | "raw" | "icon";

export interface ImageProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  /** Visual treatment. `framed` keeps the neumorphic shell; `raw`/`icon` remove padding by default. */
  variant?: ImageVariant;
  /** Whether to render the inner neumorphic frame. Defaults to true only for `framed`. */
  frame?: boolean;
  /** Outer padding. Defaults to 6px for framed images and 0 for raw/icon images. */
  padding?: number | string;
  /** CSS object-fit applied to the underlying img. */
  objectFit?: React.CSSProperties["objectFit"];
  /** CSS object-position applied to the underlying img. */
  objectPosition?: React.CSSProperties["objectPosition"];
  /** Allow click-to-zoom preview overlay. */
  preview?: boolean;
  /** Hover scale-up. */
  hover?: boolean;
  /** Custom placeholder while loading or on error. */
  placeholder?: React.ReactNode;
  /** Extra props forwarded to the underlying img. */
  imgProps?: Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "alt" | "width" | "height">;
  className?: string;
}

/**
 * `Image` — image surface with framed, raw and icon-oriented variants.
 *
 * @example
 * <Image src={url} width={240} height={160} />
 * <Image variant="icon" src={iconUrl} width={48} height={48} preview={false} />
 */
export const Image = React.forwardRef<HTMLDivElement, ImageProps>(({
  src,
  alt,
  width = 200,
  height,
  variant = "framed",
  frame,
  padding,
  objectFit,
  objectPosition,
  preview,
  hover = true,
  placeholder,
  imgProps,
  className = "",
  style,
  ...rest
}, ref) => {
  const [loaded, setLoaded] = React.useState(false);
  const [err, setErr] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const visualFrame = frame ?? variant === "framed";
  const resolvedHeight = height ?? (variant === "icon" ? width : 140);
  const resolvedPadding = padding ?? (visualFrame ? undefined : 0);
  const resolvedObjectFit = objectFit ?? (variant === "icon" ? "contain" : "cover");
  const canPreview = (preview ?? variant === "framed") && loaded && !err;
  const {
    className: imgClassName = "",
    style: imgStyle,
    onLoad,
    onError,
    ...imageRest
  } = imgProps ?? {};

  React.useEffect(() => {
    setLoaded(false);
    setErr(false);
    setOpen(false);
  }, [src]);

  return (
    <>
      <div
        ref={ref}
        className={`n-image ${variant} ${visualFrame ? "framed" : "unframed"} ${hover ? "hover" : ""} ${canPreview ? "clickable" : ""} ${className}`}
        style={{ width, ...(resolvedPadding !== undefined ? { padding: resolvedPadding } : {}), ...style }}
        onClick={() => canPreview && setOpen(true)}
        {...rest}
      >
        <div className="n-image-frame" style={{ width: "100%", height: resolvedHeight }}>
          {!err && src && (
            <img
              {...imageRest}
              src={src}
              alt={alt}
              className={imgClassName}
              style={{ objectFit: resolvedObjectFit, objectPosition, ...imgStyle }}
              onLoad={(event) => {
                setLoaded(true);
                onLoad?.(event);
              }}
              onError={(event) => {
                setErr(true);
                onError?.(event);
              }}
            />
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

export interface ImageGridItem extends Omit<ImageProps, "children"> {
  src: string;
  alt?: string;
}

export interface ImageGridProps extends React.HTMLAttributes<HTMLDivElement> {
  images: ImageGridItem[];
  columns?: number;
  itemHeight?: number;
  minItemWidth?: number | string;
  gap?: number | string;
  imageProps?: Omit<ImageProps, "src" | "alt" | "width" | "height">;
  className?: string;
}

/** `ImageGrid` — auto-fit grid of `Image` items. */
export const ImageGrid = React.forwardRef<HTMLDivElement, ImageGridProps>(({
  images,
  columns,
  itemHeight = 130,
  minItemWidth = 160,
  gap = 14,
  imageProps,
  className = "",
  style,
  ...rest
}, ref) => (
  <div
    ref={ref}
    className={className}
    style={{
      display: "grid",
      gap,
      gridTemplateColumns: columns
        ? `repeat(${columns}, 1fr)`
        : `repeat(auto-fill, minmax(${typeof minItemWidth === "number" ? `${minItemWidth}px` : minItemWidth}, 1fr))`,
      ...style,
    }}
    {...rest}
  >
    {images.map((img, i) => (
      <Image
        key={i}
        {...imageProps}
        {...img}
        src={img.src}
        alt={img.alt}
        width={img.width ?? "100%"}
        height={img.height ?? itemHeight}
      />
    ))}
  </div>
));
ImageGrid.displayName = "ImageGrid";

export interface SpriteRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpriteImageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  src: string;
  sprite: SpriteRect;
  alt?: string;
  width?: number | string;
  height?: number | string;
  scale?: number;
  backgroundSize?: string;
  variant?: ImageVariant;
  frame?: boolean;
  padding?: number | string;
  className?: string;
}

/**
 * `SpriteImage` — crops one rectangle from a sprite sheet.
 *
 * @example
 * <SpriteImage src={sheetUrl} sprite={{ x: 64, y: 32, width: 32, height: 32 }} />
 */
export const SpriteImage = React.forwardRef<HTMLDivElement, SpriteImageProps>(({
  src,
  sprite,
  alt,
  width,
  height,
  scale = 1,
  backgroundSize,
  variant = "icon",
  frame,
  padding,
  className = "",
  style,
  ...rest
}, ref) => {
  const visualFrame = frame ?? variant === "framed";
  const resolvedWidth = width ?? sprite.width * scale;
  const resolvedHeight = height ?? sprite.height * scale;
  const resolvedPadding = padding ?? (visualFrame ? undefined : 0);

  return (
    <div
      ref={ref}
      className={`n-sprite-image ${variant} ${visualFrame ? "framed" : "unframed"} ${className}`}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt === "" ? true : undefined}
      style={{ width: resolvedWidth, ...(resolvedPadding !== undefined ? { padding: resolvedPadding } : {}), ...style }}
      {...rest}
    >
      <div className="n-sprite-image-frame" style={{ height: resolvedHeight }}>
        <span
          className="n-sprite-image-sprite"
          style={{
            width: sprite.width,
            height: sprite.height,
            backgroundImage: `url(${JSON.stringify(src)})`,
            backgroundPosition: `${-sprite.x}px ${-sprite.y}px`,
            backgroundSize,
            transform: scale !== 1 ? `scale(${scale})` : undefined,
          }}
        />
      </div>
    </div>
  );
});
SpriteImage.displayName = "SpriteImage";

export type LayeredImageInset =
  | number
  | string
  | Partial<Record<"top" | "right" | "bottom" | "left", number | string>>;

export interface LayeredImageLayer
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "alt" | "width" | "height"> {
  src: string;
  alt?: string;
  fit?: React.CSSProperties["objectFit"];
  inset?: LayeredImageInset;
  zIndex?: number;
}

export interface LayeredImageProps extends React.HTMLAttributes<HTMLDivElement> {
  layers: LayeredImageLayer[];
  width?: number | string;
  height?: number | string;
  variant?: ImageVariant;
  frame?: boolean;
  padding?: number | string;
  className?: string;
}

const insetStyle = (inset: LayeredImageInset | undefined): React.CSSProperties => {
  if (inset == null) return { inset: 0 };
  if (typeof inset === "number" || typeof inset === "string") return { inset };
  return inset;
};

/**
 * `LayeredImage` — stacks several images in the same box, useful for avatar + frame assets.
 *
 * @example
 * <LayeredImage layers={[{ src: headUrl }, { src: frameUrl }]} width={48} height={48} />
 */
export const LayeredImage = React.forwardRef<HTMLDivElement, LayeredImageProps>(({
  layers,
  width = 64,
  height = 64,
  variant = "icon",
  frame,
  padding,
  className = "",
  style,
  ...rest
}, ref) => {
  const visualFrame = frame ?? variant === "framed";
  const resolvedPadding = padding ?? (visualFrame ? undefined : 0);

  return (
    <div
      ref={ref}
      className={`n-layered-image ${variant} ${visualFrame ? "framed" : "unframed"} ${className}`}
      style={{ width, ...(resolvedPadding !== undefined ? { padding: resolvedPadding } : {}), ...style }}
      {...rest}
    >
      <div className="n-layered-image-frame" style={{ height }}>
        {layers.map(({ src: layerSrc, alt: layerAlt = "", fit = "contain", inset, zIndex, className: layerClassName = "", style: layerStyle, ...layerRest }, index) => (
          <span
            key={`${layerSrc}-${index}`}
            className="n-layered-image-layer"
            style={{
              zIndex,
              ...insetStyle(inset),
            }}
          >
            <img
              {...layerRest}
              src={layerSrc}
              alt={layerAlt}
              className={layerClassName}
              style={{
                objectFit: fit,
                ...layerStyle,
              }}
            />
          </span>
        ))}
      </div>
    </div>
  );
});
LayeredImage.displayName = "LayeredImage";
