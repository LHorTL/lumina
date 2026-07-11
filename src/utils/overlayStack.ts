import * as React from "react";

/** 可被浮层焦点管理识别的元素选择器。 */
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
  "[contenteditable='true']",
].join(",");

/** 单个浮层在全局栈中的运行时记录。 */
interface OverlayLayerEntry {
  id: symbol;
  containerRef: React.RefObject<HTMLElement>;
  ownerRef?: React.RefObject<HTMLElement>;
  zIndex?: number;
  onEscape?: () => void;
  trapFocus: boolean;
  document: Document;
  order: number;
}

/** 一个焦点陷阱及其逻辑拥有的 Portal 浮层。 */
interface OverlayFocusScope {
  containers: HTMLElement[];
  focusable: HTMLElement[];
}

/** 文档级滚动锁的原始样式与引用计数。 */
interface ScrollLockState {
  count: number;
  overflow: string;
  paddingRight: string;
}

/** useOverlayLayer 的配置。 */
export interface UseOverlayLayerOptions {
  open: boolean;
  containerRef: React.RefObject<HTMLElement>;
  /** 浮层在上级界面中的触发元素，用于识别跨 Portal 的逻辑父子关系。 */
  ownerRef?: React.RefObject<HTMLElement>;
  /** 浮层实际视觉层级；容器自身不承载 z-index 时用于全局排序。 */
  zIndex?: number;
  onEscape?: () => void;
  escapeEnabled?: boolean;
  trapFocus?: boolean;
  autoFocus?: boolean;
  restoreFocus?: boolean;
  lockScroll?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement>;
}

const layers: OverlayLayerEntry[] = [];
const listeningDocuments = new Map<Document, number>();
const scrollLocks = new Map<Document, ScrollLockState>();
let nextOverlayZIndex = 1000;
let nextLayerOrder = 0;

/** 将父浮层层级传递给其 React 子树（Portal 不会截断 Context）。 */
const OverlayZIndexContext = React.createContext<number | undefined>(undefined);

/** 浏览器使用布局副作用，服务端回退普通副作用，避免 SSR 警告。 */
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

/** OverlayZIndexProvider 的属性。 */
export interface OverlayZIndexProviderProps {
  zIndex: number;
  children?: React.ReactNode;
}

/** 为嵌套浮层提供其父浮层的实际层级基线。 */
export function OverlayZIndexProvider({ zIndex, children }: OverlayZIndexProviderProps): React.ReactElement {
  return React.createElement(OverlayZIndexContext.Provider, { value: zIndex }, children);
}

/**
 * 为每次打开的浮层分配递增层级，确保后打开的嵌套浮层位于前一层之上。
 */
export function useOverlayZIndex(open: boolean, explicitZIndex?: number): number {
  const parentZIndex = React.useContext(OverlayZIndexContext);
  const allocatedZIndexRef = React.useRef<number>();
  const wasOpenRef = React.useRef(false);
  const hasValidExplicitZIndex = explicitZIndex != null && Number.isFinite(explicitZIndex);

  if (hasValidExplicitZIndex) {
    if (open) nextOverlayZIndex = Math.max(nextOverlayZIndex, explicitZIndex!);
    wasOpenRef.current = open;
    return explicitZIndex!;
  }

  if (!open) {
    wasOpenRef.current = false;
    return allocatedZIndexRef.current ?? Math.max(nextOverlayZIndex, parentZIndex ?? 0);
  }

  const floor = parentZIndex ?? 0;
  if (!wasOpenRef.current || allocatedZIndexRef.current == null || allocatedZIndexRef.current <= floor) {
    nextOverlayZIndex = Math.max(nextOverlayZIndex, floor) + 10;
    allocatedZIndexRef.current = nextOverlayZIndex;
  }
  wasOpenRef.current = true;
  return allocatedZIndexRef.current;
}

/** 判断元素及其 DOM 祖先是否会生成可见布局盒。 */
function isElementVisibleForFocus(element: HTMLElement, container: HTMLElement): boolean {
  const view = element.ownerDocument.defaultView;
  if (!view) return true;
  const elementStyle = view.getComputedStyle(element);
  if (elementStyle.visibility === "hidden" || elementStyle.visibility === "collapse") return false;

  let current: HTMLElement | null = element;
  while (current) {
    const style = view.getComputedStyle(current);
    if (style.display === "none" || style.contentVisibility === "hidden") return false;
    if (current === container) break;
    current = current.parentElement;
  }
  return true;
}

/** 返回元素中当前可以参与 Tab 顺序的控件。 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) =>
      element.tabIndex >= 0 &&
      element.getAttribute("aria-hidden") !== "true" &&
      !element.hasAttribute("hidden") &&
      !element.closest("[hidden],[inert]") &&
      isElementVisibleForFocus(element, container)
  );
}

/** 读取浮层容器当前实际使用的层级。 */
function getLayerZIndex(layer: OverlayLayerEntry): number {
  if (layer.zIndex != null && Number.isFinite(layer.zIndex)) return layer.zIndex;
  const container = layer.containerRef.current;
  if (!container) return 0;
  const inlineValue = container.style.zIndex.trim();
  const computedValue = inlineValue || container.ownerDocument.defaultView?.getComputedStyle(container).zIndex || "";
  const parsed = Number.parseFloat(computedValue);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** 判断 child 是否是 parent 通过触发元素逻辑拥有的后代浮层。 */
function isOwnedBy(
  child: OverlayLayerEntry,
  parent: OverlayLayerEntry,
  documentLayers: OverlayLayerEntry[],
  visited = new Set<symbol>()
): boolean {
  if (child === parent || visited.has(child.id)) return false;
  visited.add(child.id);
  const owner = child.ownerRef?.current;
  const parentContainer = parent.containerRef.current;
  if (!owner || !parentContainer) return false;
  if (parentContainer.contains(owner)) return true;
  return documentLayers.some(
    (candidate) =>
      candidate !== child &&
      candidate !== parent &&
      candidate.containerRef.current?.contains(owner) &&
      isOwnedBy(candidate, parent, documentLayers, visited)
  );
}

/** 判断指定浮层是否由任意 DOM 元素直接或跨多层 Portal 逻辑拥有。 */
function isLayerOwnedByElement(
  layer: OverlayLayerEntry,
  owner: HTMLElement,
  documentLayers: OverlayLayerEntry[],
  visited = new Set<symbol>()
): boolean {
  if (visited.has(layer.id)) return false;
  visited.add(layer.id);
  const layerOwner = layer.ownerRef?.current;
  if (!layerOwner) return false;
  if (layerOwner === owner || owner.contains(layerOwner)) return true;
  return documentLayers.some((candidate) => {
    if (candidate === layer || !candidate.containerRef.current?.contains(layerOwner)) return false;
    return isLayerOwnedByElement(candidate, owner, documentLayers, visited);
  });
}

/** 判断目标是否仍位于元素本身或其逻辑拥有的 Portal 浮层中。 */
export function isTargetWithinOverlayScope(owner: HTMLElement, target: EventTarget | null): boolean {
  const NodeConstructor = owner.ownerDocument.defaultView?.Node;
  if (!target || !NodeConstructor || !(target instanceof NodeConstructor)) return false;
  if (owner.contains(target)) return true;
  const documentLayers = layers.filter((layer) => layer.document === owner.ownerDocument);
  return documentLayers.some(
    (layer) =>
      !!layer.containerRef.current?.contains(target) &&
      isLayerOwnedByElement(layer, owner, documentLayers)
  );
}

/** 按逻辑父子、实际层级与注册顺序排列一个文档内的浮层。 */
function orderDocumentLayers(documentLayers: OverlayLayerEntry[]): OverlayLayerEntry[] {
  return [...documentLayers].sort((left, right) => {
    if (isOwnedBy(right, left, documentLayers)) return -1;
    if (isOwnedBy(left, right, documentLayers)) return 1;
    const zIndexDelta = getLayerZIndex(left) - getLayerZIndex(right);
    return zIndexDelta || left.order - right.order;
  });
}

/** 构建焦点陷阱及其跨 Portal 子浮层的统一 Tab 顺序。 */
function createFocusScope(trappingLayer: OverlayLayerEntry, documentLayers: OverlayLayerEntry[]): OverlayFocusScope | null {
  const container = trappingLayer.containerRef.current;
  if (!container) return null;
  const containers = [container];
  const focusable = getFocusableElements(container);
  const ownedLayers = orderDocumentLayers(documentLayers).filter((layer) => isOwnedBy(layer, trappingLayer, documentLayers));

  ownedLayers.forEach((layer) => {
    const childContainer = layer.containerRef.current;
    if (!childContainer) return;
    containers.push(childContainer);
    const childFocusable = getFocusableElements(childContainer);
    if (childFocusable.length === 0) return;
    const owner = layer.ownerRef?.current;
    const ownerIndex = owner
      ? focusable.findIndex((element) => element === owner || owner.contains(element) || element.contains(owner))
      : -1;
    focusable.splice(ownerIndex >= 0 ? ownerIndex + 1 : focusable.length, 0, ...childFocusable);
  });

  return { containers, focusable: [...new Set(focusable)] };
}

/** 把 Tab 键限制在指定浮层焦点范围中。 */
function trapTabKey(event: KeyboardEvent, scope: OverlayFocusScope): void {
  const { containers, focusable } = scope;
  const container = containers[0];
  if (focusable.length === 0) {
    event.preventDefault();
    container.focus();
    return;
  }

  const active = container.ownerDocument.activeElement;
  const activeInsideScope = containers.some((scopeContainer) => scopeContainer.contains(active));
  const activeIndex = focusable.indexOf(active as HTMLElement);
  if (!activeInsideScope || activeIndex < 0) {
    event.preventDefault();
    (event.shiftKey ? focusable[focusable.length - 1] : focusable[0]).focus();
    return;
  }
  const direction = event.shiftKey ? -1 : 1;
  const nextIndex = (activeIndex + direction + focusable.length) % focusable.length;
  event.preventDefault();
  focusable[nextIndex].focus();
}

/** 处理一个文档内最上层浮层的 Escape 与焦点循环。 */
function handleDocumentKeyDown(event: KeyboardEvent): void {
  const documentLayers = layers.filter((layer) => layer.document === event.currentTarget);
  const orderedLayers = orderDocumentLayers(documentLayers);
  const top = orderedLayers[orderedLayers.length - 1];
  if (!top) return;

  if (event.key === "Escape" && top.onEscape) {
    event.preventDefault();
    event.stopPropagation();
    top.onEscape();
    return;
  }

  if (event.key === "Tab") {
    const active = top.document.activeElement;
    const trappingLayer = [...orderedLayers].reverse().find((layer) => {
      if (!layer.trapFocus) return false;
      const scope = createFocusScope(layer, documentLayers);
      if (!scope) return false;
      const ownsTop = layer === top || isOwnedBy(top, layer, documentLayers);
      const containsActive = scope.containers.some((container) => container.contains(active));
      return ownsTop || containsActive;
    });
    const scope = trappingLayer ? createFocusScope(trappingLayer, documentLayers) : null;
    if (scope) trapTabKey(event, scope);
  }
}

/** 为文档安装唯一的浮层键盘监听。 */
function retainDocumentListener(doc: Document): void {
  const count = listeningDocuments.get(doc) ?? 0;
  if (count === 0) doc.addEventListener("keydown", handleDocumentKeyDown, true);
  listeningDocuments.set(doc, count + 1);
}

/** 释放文档级浮层键盘监听。 */
function releaseDocumentListener(doc: Document): void {
  const count = listeningDocuments.get(doc) ?? 0;
  if (count <= 1) {
    doc.removeEventListener("keydown", handleDocumentKeyDown, true);
    listeningDocuments.delete(doc);
    return;
  }
  listeningDocuments.set(doc, count - 1);
}

/** 对文档正文增加可嵌套的滚动锁。 */
function lockDocumentScroll(doc: Document): void {
  const existing = scrollLocks.get(doc);
  if (existing) {
    existing.count += 1;
    return;
  }
  const body = doc.body;
  const scrollbarWidth = Math.max(0, doc.defaultView!.innerWidth - doc.documentElement.clientWidth);
  const computedPadding = Number.parseFloat(doc.defaultView!.getComputedStyle(body).paddingRight) || 0;
  scrollLocks.set(doc, {
    count: 1,
    overflow: body.style.overflow,
    paddingRight: body.style.paddingRight,
  });
  body.style.overflow = "hidden";
  if (scrollbarWidth > 0) body.style.paddingRight = `${computedPadding + scrollbarWidth}px`;
}

/** 释放一次文档正文滚动锁。 */
function unlockDocumentScroll(doc: Document): void {
  const state = scrollLocks.get(doc);
  if (!state) return;
  state.count -= 1;
  if (state.count > 0) return;
  doc.body.style.overflow = state.overflow;
  doc.body.style.paddingRight = state.paddingRight;
  scrollLocks.delete(doc);
}

/**
 * 注册一个浮层，并统一处理最上层 Escape、焦点循环、进入/归还焦点和滚动锁。
 */
export function useOverlayLayer({
  open,
  containerRef,
  ownerRef,
  zIndex,
  onEscape,
  escapeEnabled = true,
  trapFocus = false,
  autoFocus = false,
  restoreFocus = false,
  lockScroll = false,
  initialFocusRef,
}: UseOverlayLayerOptions): void {
  const idRef = React.useRef(Symbol("lumina-overlay"));
  const entryRef = React.useRef<OverlayLayerEntry | null>(null);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);
  const restoreFocusRef = React.useRef(restoreFocus);
  restoreFocusRef.current = restoreFocus;

  if (entryRef.current) {
    entryRef.current.containerRef = containerRef;
    entryRef.current.ownerRef = ownerRef;
    entryRef.current.zIndex = zIndex;
    entryRef.current.onEscape = escapeEnabled ? onEscape : undefined;
    entryRef.current.trapFocus = trapFocus;
  }

  useIsomorphicLayoutEffect(() => {
    if (!open || typeof document === "undefined") return;
    const container = containerRef.current;
    const doc = container?.ownerDocument ?? document;
    previousFocusRef.current = doc.activeElement as HTMLElement | null;

    const entry: OverlayLayerEntry = {
      id: idRef.current,
      containerRef,
      ownerRef,
      zIndex,
      onEscape: escapeEnabled ? onEscape : undefined,
      trapFocus,
      document: doc,
      order: ++nextLayerOrder,
    };
    entryRef.current = entry;
    layers.push(entry);
    retainDocumentListener(doc);

    const frame = autoFocus
      ? doc.defaultView?.requestAnimationFrame(() => {
          const currentContainer = containerRef.current;
          if (!currentContainer) return;
          const target = initialFocusRef?.current ?? getFocusableElements(currentContainer)[0] ?? currentContainer;
          target?.focus();
        })
      : undefined;

    return () => {
      if (frame != null) doc.defaultView?.cancelAnimationFrame(frame);
      const index = layers.findIndex((layer) => layer.id === entry.id);
      if (index >= 0) layers.splice(index, 1);
      releaseDocumentListener(doc);
      const currentEntry = entryRef.current ?? entry;
      entryRef.current = null;
      if (restoreFocusRef.current) {
        const previous = previousFocusRef.current;
        const owner = currentEntry.ownerRef?.current;
        const ownerTarget = owner
          ? (owner.tabIndex >= 0 ? owner : getFocusableElements(owner)[0])
          : undefined;
        const closingContainer = currentEntry.containerRef.current ?? container;
        doc.defaultView?.requestAnimationFrame(() => {
          const active = doc.activeElement;
          const focusWasReleased =
            active == null ||
            active === doc.body ||
            active === doc.documentElement ||
            !active.isConnected ||
            closingContainer?.contains(active);
          const target = ownerTarget?.isConnected ? ownerTarget : previous;
          if (target?.isConnected && focusWasReleased) target.focus();
        });
      }
    };
    // 浮层保持打开时只更新 entry，不重新注册，避免覆盖首次焦点快照。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useIsomorphicLayoutEffect(() => {
    if (!open || !lockScroll || typeof document === "undefined") return;
    const doc = containerRef.current?.ownerDocument ?? document;
    lockDocumentScroll(doc);
    return () => unlockDocumentScroll(doc);
  }, [open, lockScroll, containerRef]);
}
