import * as React from "react";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Image } from "../src/components/Image";

const originalCreateObjectURLDescriptor = Object.getOwnPropertyDescriptor(URL, "createObjectURL");
const originalRevokeObjectURLDescriptor = Object.getOwnPropertyDescriptor(URL, "revokeObjectURL");

const restoreUrlProperty = (name: "createObjectURL" | "revokeObjectURL", descriptor: PropertyDescriptor | undefined) => {
  if (descriptor) {
    Object.defineProperty(URL, name, descriptor);
  } else {
    Reflect.deleteProperty(URL, name);
  }
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  Reflect.deleteProperty(globalThis, "ClipboardItem");
  restoreUrlProperty("createObjectURL", originalCreateObjectURLDescriptor);
  restoreUrlProperty("revokeObjectURL", originalRevokeObjectURLDescriptor);
});

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
const pngDataUrl =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=";
const svgDataUrl =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect width='1' height='1' fill='red'/%3E%3C/svg%3E";

describe("Image preview", () => {
  it("copies the image blob when async clipboard images are supported", async () => {
    const write = vi.fn(() => Promise.resolve());
    const writeText = vi.fn();
    const clipboardItems: Array<Record<string, Blob>> = [];
    const ClipboardItemMock = vi.fn(function (this: { items?: Record<string, Blob> }, items: Record<string, Blob>) {
      clipboardItems.push(items);
      this.items = items;
    });

    Object.defineProperty(globalThis, "ClipboardItem", {
      configurable: true,
      value: ClipboardItemMock,
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { write, writeText },
    });

    const { container } = render(
      <Image src={pngDataUrl} alt="Asset" width={180} height={120} />
    );

    const image = container.querySelector("img");
    fireEvent.load(image!);

    expect(screen.queryByRole("button", { name: "预览" })).toBeNull();

    const copy = screen.getByRole("button", { name: "复制图片" });
    fireEvent.click(copy);
    await tick();

    expect(ClipboardItemMock).toHaveBeenCalledTimes(1);
    expect(clipboardItems[0]["image/png"]).toBeInstanceOf(Blob);
    expect(clipboardItems[0]["image/png"].type).toBe("image/png");
    expect(write).toHaveBeenCalledWith([expect.objectContaining({ items: clipboardItems[0] })]);
    expect(writeText).not.toHaveBeenCalled();

    expect(screen.getByRole("button", { name: "下载" })).not.toBeNull();
    fireEvent.click(container.querySelector(".n-image")!);
    expect(screen.getByRole("dialog", { name: "图片预览" })).not.toBeNull();
  });

  it("normalizes svg clipboard images to png for paste compatibility", async () => {
    const write = vi.fn(() => Promise.resolve());
    const writeText = vi.fn();
    const clipboardItems: Array<Record<string, Blob>> = [];
    const ClipboardItemMock = vi.fn(function (this: { items?: Record<string, Blob> }, items: Record<string, Blob>) {
      clipboardItems.push(items);
      this.items = items;
    });
    ClipboardItemMock.supports = vi.fn((type: string) => type === "image/svg+xml" || type === "image/png");

    Object.defineProperty(globalThis, "ClipboardItem", {
      configurable: true,
      value: ClipboardItemMock,
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { write, writeText },
    });

    const { container } = render(
      <Image src={svgDataUrl} alt="Vector asset" width={180} height={120} />
    );

    fireEvent.load(container.querySelector("img")!);

    const originalCreateElement = document.createElement.bind(document);
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn(() => "blob:lumina-image"),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    });
    vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      if (tagName.toLowerCase() === "img") {
        const image = originalCreateElement("img") as HTMLImageElement;
        Object.defineProperty(image, "naturalWidth", { configurable: true, value: 8 });
        Object.defineProperty(image, "naturalHeight", { configurable: true, value: 8 });
        Object.defineProperty(image, "src", {
          configurable: true,
          set() {
            setTimeout(() => image.onload?.(new Event("load")), 0);
          },
        });
        return image;
      }
      if (tagName.toLowerCase() === "canvas") {
        const canvas = originalCreateElement("canvas") as HTMLCanvasElement;
        canvas.getContext = vi.fn(() => ({ drawImage: vi.fn() })) as unknown as HTMLCanvasElement["getContext"];
        canvas.toBlob = vi.fn((callback: BlobCallback) => {
          callback(new Blob(["png"], { type: "image/png" }));
        });
        return canvas;
      }
      return originalCreateElement(tagName);
    });

    fireEvent.click(screen.getByRole("button", { name: "复制图片" }));
    await tick();
    await tick();

    expect(ClipboardItemMock.supports).toHaveBeenCalledWith("image/svg+xml");
    expect(clipboardItems[0]["image/png"]).toBeInstanceOf(Blob);
    expect(clipboardItems[0]["image/svg+xml"]).toBeUndefined();
    expect(write).toHaveBeenCalledWith([expect.objectContaining({ items: clipboardItems[0] })]);
    expect(writeText).not.toHaveBeenCalled();
  });

  it("falls back to copying the image src when image clipboard write fails", async () => {
    const write = vi.fn(() => Promise.reject(new Error("clipboard blocked")));
    const writeText = vi.fn();

    Object.defineProperty(globalThis, "ClipboardItem", {
      configurable: true,
      value: vi.fn(function (this: { items?: Record<string, Blob> }, items: Record<string, Blob>) {
        this.items = items;
      }),
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { write, writeText },
    });

    const { container } = render(
      <Image src={pngDataUrl} alt="Fallback asset" width={180} height={120} />
    );

    fireEvent.load(container.querySelector("img")!);
    fireEvent.click(screen.getByRole("button", { name: "复制图片" }));
    await tick();
    await tick();

    expect(write).toHaveBeenCalled();
    expect(writeText).toHaveBeenCalledWith(pngDataUrl);
  });

  it("falls back to execCommand when clipboard write is unavailable", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });
    const execCommand = vi.fn(() => true);
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: execCommand,
    });

    const { container } = render(
      <Image src="/fallback.png" alt="Fallback asset" width={180} height={120} />
    );

    fireEvent.load(container.querySelector("img")!);
    fireEvent.click(screen.getByRole("button", { name: "复制图片" }));
    await tick();

    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(document.querySelector("textarea")?.value).toBeUndefined();
  });

  it("downloads through a temporary anchor instead of relying on a passive link", () => {
    const createdAnchors: HTMLAnchorElement[] = [];
    const originalCreateElement = document.createElement.bind(document);

    vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      const element = originalCreateElement(tagName);
      if (tagName.toLowerCase() === "a") {
        createdAnchors.push(element as HTMLAnchorElement);
        vi.spyOn(element as HTMLAnchorElement, "click").mockImplementation(() => undefined);
      }
      return element;
    });

    const { container } = render(
      <Image src="/images/sample.png" alt="Sample asset" width={180} height={120} />
    );

    fireEvent.load(container.querySelector("img")!);
    fireEvent.click(screen.getByRole("button", { name: "下载" }));

    const anchor = createdAnchors[createdAnchors.length - 1];
    expect(anchor?.href).toContain("/images/sample.png");
    expect(anchor?.download).toBe("sample.png");
    expect(anchor?.click).toHaveBeenCalled();
  });

  it("carries scoped theme attributes into the portal preview", () => {
    const { container } = render(
      <div data-theme="dark" data-accent="rose" data-density="compact">
        <Image src="/themed.png" alt="Themed asset" width={180} height={120} />
      </div>
    );

    const image = container.querySelector("img");
    fireEvent.load(image!);
    fireEvent.click(container.querySelector(".n-image")!);

    const dialog = screen.getByRole("dialog", { name: "图片预览" });

    expect(dialog.getAttribute("data-theme")).toBe("dark");
    expect(dialog.getAttribute("data-accent")).toBe("rose");
    expect(dialog.getAttribute("data-density")).toBe("compact");
  });

  it("enables preview when an image is already complete before onLoad fires", async () => {
    vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true);
    vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(200);

    const { container } = render(
      <Image src="/cached.png" alt="Cached asset" width={180} height={120} />
    );

    await tick();
    fireEvent.click(container.querySelector(".n-image")!);

    expect(screen.getByRole("dialog", { name: "图片预览" })).not.toBeNull();
  });

  it("exposes zoom controls, preview sizing, and custom toolbar actions", () => {
    const onCustomAction = vi.fn();

    const { container } = render(
      <Image
        src="/asset.png"
        alt="Asset"
        width={180}
        height={120}
        previewMaxWidth="72vw"
        previewMaxHeight={420}
        renderPreviewToolbar={({ scale }) => (
          <button type="button" onClick={onCustomAction}>
            标记 {Math.round(scale * 100)}%
          </button>
        )}
      />
    );

    const image = container.querySelector("img");
    fireEvent.load(image!);
    fireEvent.click(container.querySelector(".n-image")!);

    const dialog = screen.getByRole("dialog", { name: "图片预览" });
    const toolbar = within(dialog).getByRole("toolbar", { name: "图片预览工具栏" });
    const previewImage = within(dialog).getByAltText("Asset");

    expect(previewImage.style.maxWidth).toBe("72vw");
    expect(previewImage.style.maxHeight).toBe("420px");
    expect(previewImage.style.transform).toBe("translate3d(0px, 0px, 0) scale(1)");

    fireEvent.click(within(toolbar).getByRole("button", { name: "放大" }));
    expect(previewImage.style.transform).toBe("translate3d(0px, 0px, 0) scale(1.2)");
    expect(within(toolbar).getByText("120%")).not.toBeNull();

    fireEvent.click(within(toolbar).getByRole("button", { name: "1:1" }));
    expect(previewImage.style.maxWidth).toBe("none");
    expect(previewImage.style.maxHeight).toBe("none");
    expect(previewImage.style.transform).toBe("translate3d(0px, 0px, 0) scale(1)");

    fireEvent.click(within(toolbar).getByRole("button", { name: "适配窗口" }));
    expect(previewImage.style.maxWidth).toBe("72vw");
    expect(previewImage.style.maxHeight).toBe("420px");

    fireEvent.click(within(toolbar).getByRole("button", { name: /标记/ }));
    expect(onCustomAction).toHaveBeenCalledTimes(1);

    fireEvent.wheel(dialog, { deltaY: -80 });
    expect(previewImage.style.transform).toBe("translate3d(0px, 0px, 0) scale(1.2)");

    fireEvent.mouseDown(previewImage, { button: 0, clientX: 10, clientY: 12 });
    fireEvent.mouseMove(dialog, { clientX: 30, clientY: 37 });
    fireEvent.mouseUp(dialog);
    expect(previewImage.style.transform).toBe("translate3d(20px, 25px, 0) scale(1.2)");
  });

  it("traps preview lifecycle, restores focus, and closes when preview becomes unavailable", async () => {
    const { container, rerender } = render(
      <Image src="/lifecycle.png" alt="Lifecycle" width={180} height={120} />
    );
    fireEvent.load(container.querySelector("img")!);
    const trigger = screen.getByRole("button", { name: "预览：Lifecycle" });
    trigger.focus();
    fireEvent.click(trigger);
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "图片预览" })).toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(trigger));
    expect(document.body.style.overflow).toBe("");

    fireEvent.click(trigger);
    expect(screen.getByRole("dialog", { name: "图片预览" })).not.toBeNull();
    rerender(
      <Image src="/lifecycle.png" alt="Lifecycle" width={180} height={120} preview={false} />
    );
    expect(screen.queryByRole("dialog", { name: "图片预览" })).toBeNull();
    expect(document.body.style.overflow).toBe("");
  });
});
