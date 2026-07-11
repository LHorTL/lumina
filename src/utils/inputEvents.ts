/** 为清空回调创建值已更新、其余原生属性仍指向真实控件的事件目标代理。 */
export function createValueOverrideTarget<
  T extends HTMLInputElement | HTMLTextAreaElement,
>(element: T | null, value: string): T {
  if (!element) return { value } as T;
  return new Proxy(element, {
    get(target, property) {
      if (property === "value") return value;
      const result = Reflect.get(target, property, target);
      return typeof result === "function" ? result.bind(target) : result;
    },
  });
}
