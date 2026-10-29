import type { TeardownRule } from './types';

/**
 * Namespace-scoped teardown (main: cleanup-vms, templates, etc.).
 * On release-4.13, per-test namespaces are created/deleted in the `apiClient` fixture — no global testNamespace.
 */
export function getNamespaceTeardownRules(): TeardownRule[] {
  return [];
}
