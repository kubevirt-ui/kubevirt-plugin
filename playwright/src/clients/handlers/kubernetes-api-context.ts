import type { JsonPatchOp, KubernetesResource } from '@/data-models/kubernetes-types';
import type * as k8s from '@kubernetes/client-node';

export type KubernetesApiContext = {
  readonly kc: k8s.KubeConfig;
  readonly coreV1Api: k8s.CoreV1Api;
  readonly customObjectsApi: k8s.CustomObjectsApi;
  readonly appsV1Api: k8s.AppsV1Api;
  readonly rbacApi: k8s.RbacAuthorizationV1Api;
  withRetry<T>(
    operation: () => Promise<T>,
    label: string,
    maxRetries?: number,
    delayMs?: number,
  ): Promise<T>;
  /**
   * Read namespace by name. When HTTP(S)_PROXY is set, uses the same CONNECT tunnel as
   * verifyAuthentication — @kubernetes/client-node v1.x does not reliably use KubeConfig.createAgent.
   */
  getNamespaceByName(name: string): Promise<k8s.V1Namespace | undefined>;
  /** POST /api/v1/namespaces — proxy-aware when HTTP(S)_PROXY is set. */
  createNamespaceResource(body: k8s.V1Namespace): Promise<void>;
};

export type KubernetesHandlerCrContext = {
  getCustomResource(
    group: string,
    version: string,
    namespace: string,
    plural: string,
    name: string,
  ): Promise<KubernetesResource>;
  createCustomResource(
    group: string,
    version: string,
    namespace: string,
    plural: string,
    body: unknown,
  ): Promise<KubernetesResource>;
  deleteCustomResource(
    group: string,
    version: string,
    namespace: string,
    plural: string,
    name: string,
  ): Promise<KubernetesResource>;
  patchResource(
    group: string,
    version: string,
    plural: string,
    name: string,
    namespace: string,
    patchBody: JsonPatchOp[] | Record<string, unknown>,
  ): Promise<KubernetesResource>;
  listCustomResources(
    group: string,
    version: string,
    namespace: string,
    plural: string,
  ): Promise<KubernetesResource[]>;
  listClusterCustomResources(
    group: string,
    version: string,
    plural: string,
  ): Promise<KubernetesResource[]>;
  getClusterCustomResource(
    group: string,
    version: string,
    plural: string,
    name: string,
  ): Promise<KubernetesResource>;
  createClusterCustomResource(
    group: string,
    version: string,
    plural: string,
    body: unknown,
  ): Promise<KubernetesResource>;
  deleteClusterCustomResource(
    group: string,
    version: string,
    plural: string,
    name: string,
  ): Promise<KubernetesResource>;
  deleteAllCustomResources(
    group: string,
    version: string,
    plural: string,
    namespace: string,
    options?: { ignoreErrors?: boolean },
  ): Promise<void>;
};

export type KubernetesHandlerContext = KubernetesApiContext & KubernetesHandlerCrContext;
