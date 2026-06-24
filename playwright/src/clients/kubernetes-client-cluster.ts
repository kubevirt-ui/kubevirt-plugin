import type { JsonPatchOp, KubernetesResource } from '@/data-models/kubernetes-types';
import type * as k8s from '@kubernetes/client-node';

export interface KubernetesClientClusterMethods {
  // Namespace
  getPods(namespace: string): Promise<k8s.V1Pod[]>;
  getNamespaceResourceAllocationForOverview(namespace: string): Promise<{
    runningCount: number;
    vcpu: number;
    memoryMiB: number;
    storageGiB: number;
  }>;
  waitForPodReady(namespace: string, podName: string, timeoutMs?: number): Promise<boolean>;
  serviceExists(name: string, namespace: string): Promise<boolean>;
  waitForServiceExists(
    name: string,
    namespace: string,
    timeoutMs?: number,
    pollIntervalMs?: number,
  ): Promise<boolean>;
  namespaceExists(name: string): Promise<boolean>;
  createNamespace(name: string, labels?: Record<string, string>): Promise<boolean>;
  waitForTestUserInNamespace(
    namespace: string,
    username: string,
    timeoutMs?: number,
  ): Promise<void>;
  grantUserAccessToNamespace(namespace: string, username: string): Promise<void>;
  grantUserKubevirtAccessToNamespace(namespace: string, username: string): Promise<void>;
  grantUserViewAccessToNamespace(namespace: string, username: string): Promise<void>;
  grantUserTemplateListAccess(namespace: string, username: string): Promise<void>;
  grantUserHotplugSubresourceAccess(namespace: string, username: string): Promise<void>;
  grantUserClusterViewAccess(username: string): Promise<void>;
  grantUserCdiClusterReadAccess(username: string): Promise<void>;
  ensureNonPrivUserExists(username: string, password?: string): Promise<boolean>;
  deleteClusterRoleBinding(name: string): Promise<void>;
  deleteNamespace(name: string, options?: { ignoreNotFound?: boolean }): Promise<boolean>;
  waitForNamespaceReady(name: string, timeout?: number): Promise<boolean>;
  getNamespaces(): Promise<string[]>;
  ensureStorageCheckupPermissions(namespace: string): Promise<{
    results: Record<string, { created: boolean; alreadyExisted: boolean }>;
    anyCreated: boolean;
  }>;
  ensureNetworkCheckupPermissions(namespace: string): Promise<{
    results: Record<string, { created: boolean; alreadyExisted: boolean }>;
    anyCreated: boolean;
  }>;
  ensureOvnNadExists(
    nadName: string,
    namespace: string,
  ): Promise<{ created: boolean; alreadyExisted: boolean }>;
  getNamespaceCount(excludeSystem?: boolean, onlyWithVms?: boolean): Promise<number>;
  setupTestNamespace(namespace: string, labels?: Record<string, string>): Promise<boolean>;
  cleanupTestNamespace(namespace: string): Promise<void>;

  // Node
  getNodes(): Promise<KubernetesResource[]>;
  getReadyNodes(): Promise<KubernetesResource[]>;
  isClusterSingleNode(): Promise<boolean>;
  getMigrationTargetNodes(excludeNodeName?: string): Promise<KubernetesResource[]>;
  getNodeNameWithLowerAllocatable(nodes: KubernetesResource[]): string | undefined;
  cordonNode(nodeName: string): Promise<void>;
  uncordonNode(nodeName: string): Promise<void>;
  getVmNodeName(vmName: string, namespace: string): Promise<null | string>;
  getNodesWithVmsInNamespace(namespace: string): Promise<string[]>;

  // HCO
  getHyperConvergedStatusAndVersion(
    name?: string,
    namespace?: string,
  ): Promise<{ status: string; version: string | undefined }>;
  getHyperConverged(name?: string, namespace?: string): Promise<KubernetesResource>;
  patchHyperConverged(
    name?: string,
    namespace?: string,
    patchOps?: Array<{ op: string; path: string; value?: unknown }>,
  ): Promise<KubernetesResource>;
  getHyperConvergedField(
    jsonPath: string,
    name?: string,
    namespace?: string,
  ): Promise<string | undefined>;
  verifyHCOSpec(
    jsonPath: string,
    expectedValue: string,
    name?: string,
    namespace?: string,
  ): Promise<boolean>;
  verifyLiveMigrationLimits(
    expectedParallelMigrationsPerCluster: string,
    expectedParallelOutboundMigrationsPerNode: string,
    name?: string,
    namespace?: string,
  ): Promise<{
    parallelMigrationsPerCluster: boolean;
    parallelOutboundMigrationsPerNode: boolean;
    actualParallelMigrationsPerCluster?: number | string;
    actualParallelOutboundMigrationsPerNode?: number | string;
  }>;
  verifyMemoryDensity(
    expectedMemoryOvercommitPercentage: string,
    name?: string,
    namespace?: string,
    maxRetries?: number,
    retryInterval?: number,
  ): Promise<{
    memoryOvercommitPercentage: boolean;
    actualMemoryOvercommitPercentage?: number | string;
  }>;

  // Cluster Setup
  verifyAuthentication(): Promise<boolean>;
  getNamespaceByName(name: string): Promise<k8s.V1Namespace | undefined>;
  createNamespaceResource(body: k8s.V1Namespace): Promise<void>;
  setupKubevirtUiConfig(cnvNamespace?: string, username?: string): Promise<void>;
  setupConsoleUserSettings(
    username?: string,
    defaultNamespace?: string,
    maxAttempts?: number,
  ): Promise<boolean>;
  getUserUid(username: string): Promise<string | undefined>;
  canUserPerformAction(
    username: string,
    namespace: string,
    verb: string,
    group: string,
    resource: string,
  ): Promise<boolean>;
  disableVirtualizationWelcomeSettings(
    cnvNamespace?: string,
    username?: string,
    userUid?: string,
  ): Promise<boolean>;
  getStorageClassNames(): Promise<string[]>;
  setDefaultStorageClassForVirtualMachines(storageClassName: string): Promise<void>;
  isClusterObservabilityOperatorInstalled(): Promise<boolean>;
  waitForClusterObservabilityOperatorInstalled(timeoutMs?: number): Promise<boolean>;
  ensureClusterObservabilityOperatorUninstalled(): Promise<void>;
}

type HandlerMap = Record<string, Record<string, (...args: unknown[]) => unknown>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- prototype delegation requires dynamic property assignment
function delegateTo(proto: any, handler: string, methods: string[]) {
  for (const method of methods) {
    proto[method] = function (this: HandlerMap, ...args: unknown[]) {
      return this[handler][method](...args);
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- applies mixin methods to class prototype
export function applyClusterDelegations(proto: any): void {
  // Namespace → this.namespace
  delegateTo(proto, 'namespace', [
    'getPods',
    'getNamespaceResourceAllocationForOverview',
    'waitForPodReady',
    'serviceExists',
    'waitForServiceExists',
    'namespaceExists',
    'createNamespace',
    'waitForTestUserInNamespace',
    'grantUserAccessToNamespace',
    'grantUserKubevirtAccessToNamespace',
    'grantUserViewAccessToNamespace',
    'grantUserTemplateListAccess',
    'grantUserHotplugSubresourceAccess',
    'grantUserClusterViewAccess',
    'grantUserCdiClusterReadAccess',
    'ensureNonPrivUserExists',
    'deleteClusterRoleBinding',
    'deleteNamespace',
    'waitForNamespaceReady',
    'getNamespaces',
    'ensureStorageCheckupPermissions',
    'ensureNetworkCheckupPermissions',
    'getNamespaceCount',
    'setupTestNamespace',
    'cleanupTestNamespace',
  ]);

  // ensureOvnNadExists has extra tracking logic
  proto.ensureOvnNadExists = async function (
    this: HandlerMap,
    nadName: string,
    namespace: string,
  ): Promise<{ created: boolean; alreadyExisted: boolean }> {
    const result = (await this.namespace.ensureOvnNadExists(nadName, namespace)) as {
      created: boolean;
      alreadyExisted: boolean;
    };
    if (result.created) {
      (this as unknown as { trackResource: (...a: unknown[]) => void }).trackResource(
        'NetworkAttachmentDefinition',
        nadName,
        namespace,
      );
    }
    return result;
  };

  // Node → this.node
  delegateTo(proto, 'node', [
    'getNodes',
    'getReadyNodes',
    'isClusterSingleNode',
    'getMigrationTargetNodes',
    'getNodeNameWithLowerAllocatable',
    'cordonNode',
    'uncordonNode',
    'getVmNodeName',
    'getNodesWithVmsInNamespace',
  ]);

  // HCO → this.hco
  delegateTo(proto, 'hco', [
    'getHyperConvergedStatusAndVersion',
    'getHyperConverged',
    'getHyperConvergedField',
    'verifyHCOSpec',
    'verifyLiveMigrationLimits',
    'verifyMemoryDensity',
  ]);

  // patchHyperConverged casts patchOps
  proto.patchHyperConverged = function (
    this: HandlerMap,
    name = 'kubevirt-hyperconverged',
    namespace = 'openshift-cnv',
    patchOps: Array<{ op: string; path: string; value?: unknown }> = [],
  ) {
    return this.hco.patchHyperConverged(name, namespace, patchOps as JsonPatchOp[]);
  };

  // Cluster Setup → this.clusterSetup
  delegateTo(proto, 'clusterSetup', [
    'verifyAuthentication',
    'getNamespaceByName',
    'createNamespaceResource',
    'setupKubevirtUiConfig',
    'setupConsoleUserSettings',
    'getUserUid',
    'canUserPerformAction',
    'disableVirtualizationWelcomeSettings',
    'getStorageClassNames',
    'setDefaultStorageClassForVirtualMachines',
    'isClusterObservabilityOperatorInstalled',
    'waitForClusterObservabilityOperatorInstalled',
    'ensureClusterObservabilityOperatorUninstalled',
  ]);
}
