import * as React from "react";

export interface SectionCtx {
  go: (id: string) => void;
  setTweak: (k: string, v: unknown) => void;
  openTweaks: () => void;
  scrollRoot?: React.RefObject<HTMLElement | null>;
}

export interface SectionMeta {
  id: string;
  group: string;
  order: number;
  label: string;
  eyebrow: string;
  title: string;
  desc: string;
  Component: React.FC<SectionCtx>;
}

export const defineSection = (meta: SectionMeta): SectionMeta => meta;
