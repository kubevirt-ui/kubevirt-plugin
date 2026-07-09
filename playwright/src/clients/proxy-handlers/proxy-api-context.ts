import type {
  JsonPatchOp,
  KubernetesListResource,
  KubernetesResource,
} from '@/data-models/kubernetes-types';

/**
 * Transport context shared by all console-proxy handler classes.
 *
 * `RequestContextClient` satisfies this contract and passes `this` to every
 * handler constructor, giving handlers access to the generic HTTP helpers
 * without coupling them to the full client class.
 *
 * Pattern mirrors `KubernetesHandlerContext` used by the K8s client handlers.
 */
export type ProxyApiContext = {
  /**
   * List any Kubernetes resource through the console proxy.
   * Omit `namespace` for cluster-scoped or all-namespace lists.
   */
  listResources(
    group: string,
    version: string,
    plural: string,
    namespace?: string,
    queryParams?: Record<string, string>,
  ): Promise<KubernetesListResource>;

  /** Get a single Kubernetes resource through the console proxy. */
  getResource(
    group: string,
    version: string,
    plural: string,
    name: string,
    namespace?: string,
  ): Promise<KubernetesResource | null>;

  /** Create any Kubernetes resource through the console proxy. */
  createResource(
    group: string,
    version: string,
    plural: string,
    spec: KubernetesResource,
    namespace?: string,
  ): Promise<KubernetesResource | null>;

  /** Delete any Kubernetes resource through the console proxy. */
  deleteResource(
    group: string,
    version: string,
    plural: string,
    name: string,
    namespace?: string,
  ): Promise<KubernetesResource | null>;

  /**
   * JSON Patch (RFC 6902) any resource through the console proxy.
   * Requires each target path to already exist.
   */
  patchResource(
    group: string,
    version: string,
    plural: string,
    name: string,
    patch: JsonPatchOp[],
    namespace?: string,
  ): Promise<KubernetesResource | null>;

  /**
   * JSON Merge Patch (RFC 7396) any resource through the console proxy.
   * Prefer over `patchResource` when the target sub-path may not exist yet —
   * merge-patch creates missing intermediate objects automatically.
   * Required for CRDs (strategic-merge-patch is not supported).
   */
  mergePatchResource(
    group: string,
    version: string,
    plural: string,
    name: string,
    patch: Record<string, unknown>,
    namespace?: string,
  ): Promise<KubernetesResource | null>;

  /**
   * Raw HTTP request through the console proxy.
   * Use for subresource paths (e.g. `/start`, `/stop`, `/restart`) that are
   * not covered by the generic resource helpers.
   */
  _request(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    path: string,
    extra?: Record<string, unknown>,
  ): Promise<KubernetesResource | null>;
};
