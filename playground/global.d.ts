declare module "virtual:lumina-demo-sources" {
  export interface SectionDemoSourceRecord {
    demos: Record<string, string>;
  }

  export const DEMO_SOURCE_MAP: Record<string, SectionDemoSourceRecord>;
  export default DEMO_SOURCE_MAP;
}

declare module "@babel/standalone" {
  export interface TransformResult {
    code?: string | null;
  }

  export interface TransformOptions {
    filename?: string;
    babelrc?: boolean;
    configFile?: boolean;
    presets?: unknown[];
  }

  export function transform(code: string, options?: TransformOptions): TransformResult;
}
