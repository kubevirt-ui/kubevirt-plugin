import { expect } from '@playwright/test';

const K8S_LIST_FIELDS = ['apiVersion', 'items', 'kind', 'metadata'] as const;

/**
 * Asserts that a response body is a valid Kubernetes list object of the given kind.
 *
 * Checks for the presence of all standard K8s list fields (apiVersion, items, kind, metadata),
 * that `kind` matches the expected value, and that `items` is an array.
 */
export function assertList(body: unknown, expectedKind: string): void {
  for (const field of K8S_LIST_FIELDS) {
    expect(body, `${expectedKind} response must have '${field}'`).toHaveProperty(field);
  }
  expect((body as { kind: string }).kind, `kind must be ${expectedKind}`).toBe(expectedKind);
  expect(Array.isArray((body as { items: unknown[] }).items), `items must be an array`).toBe(true);
}
