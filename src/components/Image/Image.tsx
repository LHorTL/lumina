import "../../styles/tokens.css";
import "../../styles/shared.css";
import "./Image.css";
import * as React from "react";
import ReactDOM from "react-dom";
import { Button, IconButton } from "../Button";
import { Icon } from "../Icon";
import { usePortalContainer } from "../../utils/portal";
import { OverlayZIndexProvider, useOverlayLayer, useOverlayZIndex } from "../../utils/overlayStack";
import {
  InternalComponentThemePart,
  useComponentPortalTheme,
  withComponentTheme,
  type ComponentThemeProps,
} from "../Theme/ComponentTheme";

export type ImageVariant = "framed" | "raw" | "icon";
export type ImagePreviewMode = "fit" | "actual";

export interface ImagePreviewToolbarRenderProps {
  scale: number;
  mode: ImagePreviewMode;
  zoomIn: () => void;
  zoomOut: () => void;
  fitToWindow: () => void;
  actualSize: () => void;
  reset: () => void;
  close: () => void;
}

export interface ImageProps extends React.HTMLAttributes<HTMLDivElement>, ComponentThemeProps {
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
  /** Class name forwarded to the full-screen preview overlay. */
  previewClassName?: string;
  /** Inline style forwarded to the full-screen preview overlay. */
  previewStyle?: React.CSSProperties;
  /** Max width of the image inside the preview overlay. Defaults to 80vw. */
  previewMaxWidth?: number | string;
  /** Max height of the image inside the preview overlay. Defaults to 80vh. */
  previewMaxHeight?: number | string;
  /** Render extra controls in the preview toolbar. */
  renderPreviewToolbar?: (props: ImagePreviewToolbarRenderProps) => React.ReactNode;
  /** Hover scale-up. */
  hover?: boolean;
  /** Custom placeholder while loading or on error. */
  placeholder?: React.ReactNode;
  /** Extra props forwarded to the underlying img. */
  imgProps?: Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "alt" | "width" | "height">;
  className?: string;
}

const PREVIEW_MIN_SCALE = 0.2;
const PREVIEW_MAX_SCALE = 5;
const PREVIEW_ZOOM_STEP = 0.2;
const IMAGE_DOWNLOAD_EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/avif": "avif",
};
const IMAGE_MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  avif: "image/avif",
};
const PREVIEW_THEME_ATTRS = ["data-theme", "data-theme-mode", "data-accent", "data-density"] as const;
const PREVIEW_THEME_VARS = [
  "--bg",
  "--bg-raised",
  "--fg",
  "--fg-muted",
  "--fg-subtle",
  "--border",
  "--mask-bg",
  "--accent",
  "--accent-ink",
  "--accent-soft",
  "--accent-glow",
  "--neu-float",
  "--neu-shadow-float",
  "--neu-shadow-subtle",
  "--neu-shadow-inset-strong",
  "--ctrl-h-sm",
  "--ctrl-pad-x-sm",
  "--r-sm",
  "--r-lg",
  "--r-pill",
  "--gap-2",
  "--gap-4",
  "--gap-5",
  "--gap-8",
  "--font-mono",
  "--fs-sm",
  "--dur-fast",
  "--dur",
  "--ease",
] as const;

type PreviewThemeBridge = {
  attrs: Partial<Record<typeof PREVIEW_THEME_ATTRS[number], string>>;
  style: React.CSSProperties & Partial<Record<typeof PREVIEW_THEME_VARS[number], string>>;
};
type ClipboardItemCtor = new (items: Record<string, Blob>) => ClipboardItem;
type ClipboardItemWithSupports = ClipboardItemCtor & {
  supports?: (type: string) => boolean;
};

const clampPreviewScale = (value: number) =>
  Math.min(PREVIEW_MAX_SCALE, Math.max(PREVIEW_MIN_SCALE, Math.round(value * 100) / 100));

const sanitizeImageFilename = (value: string) => {
  const fallback = value.trim().replace(/\s+/g, "-").replace(/[\\/:*?"<>|#%{}^~[\]`]/g, "-");
  return fallback.replace(/-+/g, "-").replace(/^-|-$/g, "") || "image";
};

const getDataUrlImageExt = (src: string) => {
  const mime = /^data:([^;,]+)/.exec(src)?.[1]?.toLowerCase();
  return mime ? IMAGE_DOWNLOAD_EXT_BY_MIME[mime] : undefined;
};

const getImageMimeFromSrc = (src: string) => {
  const cleanSrc = src.split(/[?#]/)[0] || "";
  const ext = /\.([a-z0-9]+)$/i.exec(cleanSrc)?.[1]?.toLowerCase();
  return ext ? IMAGE_MIME_BY_EXT[ext] : undefined;
};

const getImageDownloadName = (src: string, alt: string | undefined) => {
  const dataExt = getDataUrlImageExt(src);
  if (dataExt) return `${sanitizeImageFilename(alt || "image")}.${dataExt}`;

  try {
    const url = new URL(src, typeof window !== "undefined" ? window.location.href : "http://localhost");
    const parts = url.pathname.split("/").filter(Boolean);
    const segment = decodeURIComponent(parts[parts.length - 1] || "");
    if (segment) return sanitizeImageFilename(segment);
  } catch {
    const parts = src.split(/[?#]/)[0]?.split("/").filter(Boolean);
    const segment = parts?.[parts.length - 1];
    if (segment) return sanitizeImageFilename(segment);
  }

  return `${sanitizeImageFilename(alt || "image")}.png`;
};

const getClipboardItemCtor = () => {
  if (typeof ClipboardItem === "undefined") return undefined;
  return ClipboardItem as ClipboardItemWithSupports;
};

const isClipboardImageMimeSupported = (mime: string, ClipboardItemImpl: ClipboardItemWithSupports) => {
  const normalized = mime.toLowerCase();
  if (!normalized.startsWith("image/")) return false;
  return ClipboardItemImpl.supports?.(normalized) ?? normalized === "image/png";
};

const dataUrlToImageBlob = (src: string) => {
  const match = /^data:([^;,]+)((?:;[^,]*)?),(.*)$/i.exec(src);
  if (!match) return undefined;

  const mime = match[1].toLowerCase();
  if (!mime.startsWith("image/")) return undefined;

  const metadata = match[2].toLowerCase();
  const payload = match[3];
  if (metadata.includes(";base64")) {
    const binary = atob(payload.replace(/\s/g, ""));
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return new Blob([bytes], { type: mime });
  }

  return new Blob([decodeURIComponent(payload)], { type: mime });
};

const readImageBlob = async (src: string) => {
  const dataBlob = dataUrlToImageBlob(src);
  if (dataBlob) return dataBlob;
  if (typeof fetch === "undefined") return undefined;

  const response = await fetch(src);
  if (!response.ok) return undefined;

  const blob = await response.blob();
  const mime = blob.type.toLowerCase() || getImageMimeFromSrc(src);
  if (!mime?.startsWith("image/")) return undefined;
  return blob.type ? blob : new Blob([blob], { type: mime });
};

const convertImageBlobToPng = (blob: Blob) =>
  new Promise<Blob | undefined>((resolve) => {
    if (typeof document === "undefined" || typeof URL === "undefined") {
      resolve(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(blob);
    const image = document.createElement("img");
    const cleanup = () => URL.revokeObjectURL(objectUrl);

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d");
      if (!context) {
        cleanup();
        resolve(undefined);
        return;
      }
      context.drawImage(image, 0, 0);
      canvas.toBlob((pngBlob) => {
        cleanup();
        resolve(pngBlob ?? undefined);
      }, "image/png");
    };
    image.onerror = () => {
      cleanup();
      resolve(undefined);
    };
    image.src = objectUrl;
  });

const prepareClipboardImageBlob = async (blob: Blob, ClipboardItemImpl: ClipboardItemWithSupports) => {
  const sourceSupported = isClipboardImageMimeSupported(blob.type, ClipboardItemImpl);
  if (blob.type === "image/png") return sourceSupported ? blob : undefined;

  const pngBlob = await convertImageBlobToPng(blob);
  if (pngBlob && isClipboardImageMimeSupported(pngBlob.type, ClipboardItemImpl)) {
    return pngBlob;
  }
  return sourceSupported ? blob : undefined;
};

const fallbackCopyText = (text: string) => {
  if (typeof document === "undefined") return false;
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  const copied = document.execCommand?.("copy") ?? false;
  textarea.remove();
  return copied;
};

const copyText = (text: string) => {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      void Promise.resolve(navigator.clipboard.writeText(text)).catch(() =>
        fallbackCopyText(text)
      );
    } catch {
      fallbackCopyText(text);
    }
    return;
  }
  fallbackCopyText(text);
};

const copyImageToClipboard = async (src: string) => {
  if (typeof navigator === "undefined" || !navigator.clipboard?.write) return false;
  const ClipboardItemImpl = getClipboardItemCtor();
  if (!ClipboardItemImpl) return false;

  try {
    const sourceBlob = await readImageBlob(src);
    if (!sourceBlob) return false;

    const clipboardBlob = await prepareClipboardImageBlob(sourceBlob, ClipboardItemImpl);
    if (!clipboardBlob) return false;

    await navigator.clipboard.write([
      new ClipboardItemImpl({ [clipboardBlob.type]: clipboardBlob }),
    ]);
    return true;
  } catch {
    return false;
  }
};

const copyImage = async (src: string) => {
  const copiedImage = await copyImageToClipboard(src);
  if (!copiedImage) copyText(src);
};

const triggerImageDownload = (src: string, filename: string) => {
  if (typeof document === "undefined") return;
  const anchor = document.createElement("a");
  anchor.href = src;
  anchor.download = filename;
  anchor.rel = "noopener noreferrer";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
};

const readPreviewThemeBridge = (source: HTMLElement | null): PreviewThemeBridge => {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return { attrs: {}, style: {} };
  }

  const anchor = source ?? document.documentElement;
  const attrs: PreviewThemeBridge["attrs"] = {};
  for (const attr of PREVIEW_THEME_ATTRS) {
    const owner = anchor.closest<HTMLElement>(`[${attr}]`) ?? document.documentElement;
    const value = owner.getAttribute(attr);
    if (value) attrs[attr] = value;
  }

  const computed = window.getComputedStyle(anchor);
  const style: PreviewThemeBridge["style"] = {};
  for (const variable of PREVIEW_THEME_VARS) {
    const value = computed.getPropertyValue(variable).trim();
    if (value) style[variable] = value;
  }

  return { attrs, style };
};

/**
 * `Image` — image surface with framed, raw and icon-oriented variants.
 *
 * @example
 * <Image src={url} width={240} height={160} />
 * <Image variant="icon" src={iconUrl} width={48} height={48} preview={false} />
 */
const ImageBase = React.forwardRef<HTMLDivElement, ImageProps>(({
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
  previewClassName = "",
  previewStyle,
  previewMaxWidth = "80vw",
  previewMaxHeight = "80vh",
  renderPreviewToolbar,
  hover = true,
  placeholder,
  imgProps,
  className = "",
  style,
  onClick,
  onKeyDown,
  ...rest
}, ref) => {
  const [loaded, setLoaded] = React.useState(false);
  const [err, setErr] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [previewScale, setPreviewScale] = React.useState(1);
  const [previewMode, setPreviewMode] = React.useState<ImagePreviewMode>("fit");
  const [previewOffset, setPreviewOffset] = React.useState({ x: 0, y: 0 });
  const [previewDragging, setPreviewDragging] = React.useState(false);
  const [previewTheme, setPreviewTheme] = React.useState<PreviewThemeBridge>({ attrs: {}, style: {} });
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const imageRef = React.useRef<HTMLImageElement>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const portalContainer = usePortalContainer();
  const portalTheme = useComponentPortalTheme(["Image", "ImageGrid"]);
  const explicitPreviewZIndex = typeof previewStyle?.zIndex === "number"
    ? previewStyle.zIndex
    : undefined;
  const previewZIndex = useOverlayZIndex(open, explicitPreviewZIndex);
  const dragRef = React.useRef<{
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;
  } | null>(null);
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

  const setRootRef = React.useCallback((node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  }, [ref]);

  React.useEffect(() => {
    setLoaded(false);
    setErr(false);
    setOpen(false);
  }, [src]);

  React.useEffect(() => {
    const image = imageRef.current;
    if (!image || loaded || err) return;
    if (image.complete) {
      if (image.naturalWidth > 0) {
        setLoaded(true);
      } else {
        setErr(true);
      }
    }
  }, [src, loaded, err]);

  React.useEffect(() => {
    if (open) overlayRef.current?.focus();
  }, [open]);

  const resetPreview = React.useCallback(() => {
    setPreviewScale(1);
    setPreviewOffset({ x: 0, y: 0 });
  }, []);

  const fitToWindow = React.useCallback(() => {
    setPreviewMode("fit");
    resetPreview();
  }, [resetPreview]);

  const actualSize = React.useCallback(() => {
    setPreviewMode("actual");
    resetPreview();
  }, [resetPreview]);

  const zoomIn = React.useCallback(() => {
    setPreviewScale((current) => clampPreviewScale(current + PREVIEW_ZOOM_STEP));
  }, []);

  const zoomOut = React.useCallback(() => {
    setPreviewScale((current) => clampPreviewScale(current - PREVIEW_ZOOM_STEP));
  }, []);

  const closePreview = React.useCallback(() => {
    dragRef.current = null;
    setPreviewDragging(false);
    setOpen(false);
    window.requestAnimationFrame(() => rootRef.current?.focus());
  }, []);

  React.useEffect(() => {
    if (open && !canPreview) closePreview();
  }, [canPreview, closePreview, open]);

  useOverlayLayer({
    open: open && portalContainer != null,
    containerRef: overlayRef,
    ownerRef: rootRef,
    zIndex: previewZIndex,
    onEscape: closePreview,
    trapFocus: true,
    autoFocus: true,
    lockScroll: true,
  });

  const openPreview = React.useCallback(() => {
    setPreviewMode("fit");
    resetPreview();
    setPreviewTheme(readPreviewThemeBridge(rootRef.current));
    setOpen(true);
  }, [resetPreview]);

  const copyImageSrc = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!src) return;
    void copyImage(src);
  }, [src]);

  const downloadImageSrc = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!src) return;
    triggerImageDownload(src, getImageDownloadName(src, alt));
  }, [alt, src]);

  const handlePreviewWheel = React.useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  }, [zoomIn, zoomOut]);

  const startPreviewDrag = React.useCallback((event: React.MouseEvent<HTMLImageElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      baseX: previewOffset.x,
      baseY: previewOffset.y,
    };
    setPreviewDragging(true);
  }, [previewOffset.x, previewOffset.y]);

  const movePreviewDrag = React.useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    event.preventDefault();
    setPreviewOffset({
      x: drag.baseX + event.clientX - drag.startX,
      y: drag.baseY + event.clientY - drag.startY,
    });
  }, []);

  const endPreviewDrag = React.useCallback(() => {
    dragRef.current = null;
    setPreviewDragging(false);
  }, []);

  const handlePreviewKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      closePreview();
    }
    if (event.key === "+" || event.key === "=") {
      zoomIn();
    }
    if (event.key === "-") {
      zoomOut();
    }
  }, [closePreview, zoomIn, zoomOut]);

  const previewToolbarProps: ImagePreviewToolbarRenderProps = {
    scale: previewScale,
    mode: previewMode,
    zoomIn,
    zoomOut,
    fitToWindow,
    actualSize,
    reset: resetPreview,
    close: closePreview,
  };

  return (
    <>
      <div
        ref={setRootRef}
        className={`n-image ${variant} ${visualFrame ? "framed" : "unframed"} ${hover ? "hover" : ""} ${canPreview ? "clickable" : ""} ${className}`}
        style={{ width, ...(resolvedPadding !== undefined ? { padding: resolvedPadding } : {}), ...style }}
        role={canPreview ? "button" : undefined}
        tabIndex={canPreview ? 0 : undefined}
        aria-label={canPreview ? `预览${alt ? `：${alt}` : "图片"}` : undefined}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented && canPreview) openPreview();
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (
            !event.defaultPrevented &&
            event.target === event.currentTarget &&
            canPreview &&
            (event.key === "Enter" || event.key === " ")
          ) {
            event.preventDefault();
            openPreview();
          }
        }}
        {...rest}
      >
        <div className="n-image-frame" style={{ width: "100%", height: resolvedHeight }}>
          {!err && src && (
            <img
              {...imageRest}
              ref={imageRef}
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
                {src && (
                  <>
	                    <button
	                      type="button"
	                      className="ia-btn"
	                      onClick={copyImageSrc}
	                      aria-label="复制图片"
	                    >
                      <Icon name="copy" size={13} />
                    </button>
                    <button
                      type="button"
                      className="ia-btn"
                      onClick={downloadImageSrc}
                      aria-label="下载"
                    >
                      <Icon name="download" size={13} />
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      {open &&
        portalContainer &&
        ReactDOM.createPortal(
          <OverlayZIndexProvider zIndex={previewZIndex}>
            <div
            {...previewTheme.attrs}
            {...portalTheme.dataAttributes}
            ref={overlayRef}
            role="dialog"
            aria-modal="true"
            aria-label="图片预览"
            tabIndex={-1}
            className={["image-preview-overlay", previewClassName].filter(Boolean).join(" ")}
            style={{
              ...previewTheme.style,
              ...portalTheme.style,
              ...portalTheme.styles.overlay,
              ...previewStyle,
              zIndex: previewStyle?.zIndex ?? previewZIndex,
            }}
            onClick={closePreview}
            onWheel={handlePreviewWheel}
            onMouseMove={movePreviewDrag}
            onMouseUp={endPreviewDrag}
            onMouseLeave={endPreviewDrag}
            onKeyDown={handlePreviewKeyDown}
          >
            <div
              className="image-preview-toolbar"
              role="toolbar"
              aria-label="图片预览工具栏"
              onClick={(event) => event.stopPropagation()}
            >
              <InternalComponentThemePart components={["IconButton", "Button"]}>
                <IconButton
                  icon="minus"
                  size="sm"
                  variant="ghost"
                  tip="缩小"
                  disabled={previewScale <= PREVIEW_MIN_SCALE}
                  onClick={zoomOut}
                />
                <span className="image-preview-scale" aria-live="polite">
                  {Math.round(previewScale * 100)}%
                </span>
                <IconButton
                  icon="plus"
                  size="sm"
                  variant="ghost"
                  tip="放大"
                  disabled={previewScale >= PREVIEW_MAX_SCALE}
                  onClick={zoomIn}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="image-preview-ratio"
                  aria-label="适配窗口"
                  onClick={fitToWindow}
                >
                  适配
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="image-preview-ratio"
                  aria-label="1:1"
                  onClick={actualSize}
                >
                  1:1
                </Button>
                <IconButton
                  icon="reload"
                  size="sm"
                  variant="ghost"
                  tip="重置"
                  onClick={resetPreview}
                />
              </InternalComponentThemePart>
              {renderPreviewToolbar && (
                <span className="image-preview-toolbar-slot">
                  {renderPreviewToolbar(previewToolbarProps)}
                </span>
              )}
              <InternalComponentThemePart components="IconButton">
                <IconButton
                  icon="x"
                  size="sm"
                  variant="ghost"
                  tip="关闭"
                  onClick={closePreview}
                />
              </InternalComponentThemePart>
            </div>
            <img
              className="image-preview-img"
              src={src}
              alt={alt}
              draggable={false}
              style={{
                maxWidth: previewMode === "fit" ? previewMaxWidth : "none",
                maxHeight: previewMode === "fit" ? previewMaxHeight : "none",
                transform: `translate3d(${previewOffset.x}px, ${previewOffset.y}px, 0) scale(${previewScale})`,
                cursor: previewDragging ? "grabbing" : "grab",
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={startPreviewDrag}
            />
            </div>
          </OverlayZIndexProvider>,
          portalContainer
        )}
    </>
  );
});
ImageBase.displayName = "Image";

export const Image = withComponentTheme(
  ImageBase,
  "Image",
  ["image", "button"]
);

export interface ImageGridItem extends Omit<ImageProps, "children"> {
  src: string;
  alt?: string;
}

export interface ImageGridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    ComponentThemeProps {
  images: ImageGridItem[];
  columns?: number;
  itemHeight?: number;
  minItemWidth?: number | string;
  gap?: number | string;
  imageProps?: Omit<ImageProps, "src" | "alt" | "width" | "height">;
  className?: string;
}

/** `ImageGrid` — auto-fit grid of `Image` items. */
const ImageGridBase = React.forwardRef<HTMLDivElement, ImageGridProps>(({
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
      <InternalComponentThemePart key={i} components="Image">
        <Image
          {...imageProps}
          {...img}
          src={img.src}
          alt={img.alt}
          width={img.width ?? "100%"}
          height={img.height ?? itemHeight}
        />
      </InternalComponentThemePart>
    ))}
  </div>
));
ImageGridBase.displayName = "ImageGrid";

export const ImageGrid = withComponentTheme(
  ImageGridBase,
  "ImageGrid",
  ["image", "button"]
);

export interface SpriteRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpriteImageProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    ComponentThemeProps {
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
const SpriteImageBase = React.forwardRef<HTMLDivElement, SpriteImageProps>(({
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
SpriteImageBase.displayName = "SpriteImage";

export const SpriteImage = withComponentTheme(
  SpriteImageBase,
  "SpriteImage",
  "image"
);

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

export interface LayeredImageProps
  extends React.HTMLAttributes<HTMLDivElement>,
    ComponentThemeProps {
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
const LayeredImageBase = React.forwardRef<HTMLDivElement, LayeredImageProps>(({
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
LayeredImageBase.displayName = "LayeredImage";

export const LayeredImage = withComponentTheme(
  LayeredImageBase,
  "LayeredImage",
  "image"
);
