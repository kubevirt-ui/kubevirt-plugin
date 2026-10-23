export {};

declare global {
  interface Window {
    mount: (params: { story: string; props?: Record<string, unknown> }) => Promise<void>;
    unmount: () => Promise<void>;
  }

  interface ImportMeta {
    glob: (pattern: string) => Record<string, () => Promise<unknown>>;
  }
}
