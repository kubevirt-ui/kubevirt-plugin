/**
 * Shared Kubernetes API resource types used across client handlers and API tests.
 * These reflect the common OpenShift/KubeVirt API response shapes.
 *
 * The [key: string]: unknown index signature allows dynamic property access on
 * generic resources. When converting between these types and the strongly-typed
 * CRD definitions from @kubevirt-ui-ext/kubevirt-api, use `as unknown as T`.
 */

export interface KubernetesObjectMeta {
  name?: string;
  namespace?: string;
  uid?: string;
  resourceVersion?: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
  creationTimestamp?: string;
  deletionTimestamp?: string;
  finalizers?: string[];
  ownerReferences?: Array<{
    apiVersion: string;
    kind: string;
    name: string;
    uid: string;
    controller?: boolean;
    blockOwnerDeletion?: boolean;
  }>;
  [key: string]: unknown;
}

/** Base shape for any Kubernetes/OpenShift resource object. */
export interface KubernetesResource {
  apiVersion?: string;
  kind?: string;
  metadata?: KubernetesObjectMeta;
  spec?: Record<string, unknown>;
  status?: Record<string, unknown>;
  [key: string]: unknown;
}

/** Generic list resource returned by Kubernetes list endpoints. */
export interface KubernetesListResource<T = KubernetesResource> {
  apiVersion?: string;
  kind?: string;
  metadata?: {
    resourceVersion?: string;
    continue?: string;
    [key: string]: unknown;
  };
  items: T[];
}

/** A single JSON Patch operation (RFC 6902). */
export interface JsonPatchOp {
  op: 'add' | 'copy' | 'move' | 'remove' | 'replace' | 'test';
  path: string;
  value?: unknown;
  from?: string;
}

/** Kubernetes condition object used in status.conditions arrays. */
export interface KubernetesCondition {
  type: string;
  status: 'False' | 'True' | 'Unknown';
  reason?: string;
  message?: string;
  lastTransitionTime?: string;
  lastUpdateTime?: string;
  [key: string]: unknown;
}

/** Extract a human-readable message from an unknown catch error. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
