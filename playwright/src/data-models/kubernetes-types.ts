/** Minimal kubernetes error helpers (main `playwright/src/data-models/kubernetes-types.ts`). */

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
