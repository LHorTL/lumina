import type { SectionMeta } from "./_types";

const modules = import.meta.glob<{ default: SectionMeta }>("./*.tsx", {
  eager: true,
});

const allSections: SectionMeta[] = Object.entries(modules)
  .filter(([path]) => {
    const base = path.split("/").pop() ?? "";
    return !base.startsWith("_");
  })
  .map(([, m]) => m.default)
  .filter(Boolean);

const idSet = new Set<string>();
for (const s of allSections) {
  if (idSet.has(s.id)) {
    throw new Error(`[playground] Duplicate section id: "${s.id}"`);
  }
  idSet.add(s.id);
}

export const SECTIONS: Record<string, SectionMeta> = Object.fromEntries(
  allSections.map((s) => [s.id, s])
);

export interface NavItem {
  id: string;
  label: string;
}
export interface NavGroup {
  group: string;
  items: NavItem[];
}

const GROUP_ORDER = ["起步", "通用", "表单", "数据展示", "反馈", "Electron"];

export const NAV: NavGroup[] = (() => {
  const buckets: Record<string, { id: string; label: string; order: number }[]> = {};
  for (const s of allSections) {
    (buckets[s.group] ??= []).push({ id: s.id, label: s.label, order: s.order });
  }
  const known = GROUP_ORDER.filter((g) => buckets[g]);
  const extras = Object.keys(buckets).filter((g) => !GROUP_ORDER.includes(g));
  return [...known, ...extras].map((g) => ({
    group: g,
    items: buckets[g]
      .sort((a, b) => a.order - b.order)
      .map(({ id, label }) => ({ id, label })),
  }));
})();

export const DEFAULT_SECTION_ID = "intro";
