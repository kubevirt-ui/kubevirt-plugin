import type {
  JsonPatchOp,
  KubernetesCondition,
  KubernetesResource,
} from '@/data-models/kubernetes-types';
import type * as k8s from '@kubernetes/client-node';
import type { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/dist/containerized-data-importer/index';
import type { V1beta1VirtualMachineSnapshot } from '@kubevirt-ui-ext/kubevirt-api/dist/kubevirt/index';

export interface KubernetesClientResourceMethods {
  // Generic CRUD
  createCustomResource(
    group: string,
    version: string,
    namespace: string,
    plural: string,
    body: unknown,
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
  deleteCustomResource(
    group: string,
    version: string,
    namespace: string,
    plural: string,
    name: string,
  ): Promise<KubernetesResource>;
  deleteNamespacedService(namespace: string, name: string): Promise<void>;
  patchResource(
    group: string,
    version: string,
    plural: string,
    name: string,
    namespace: string,
    patchBody:
      | JsonPatchOp[]
      | ReadonlyArray<{ op: string; path: string; value?: unknown }>
      | Record<string, unknown>,
  ): Promise<KubernetesResource>;
  getClusterCustomResource(
    group: string,
    version: string,
    plural: string,
    name: string,
  ): Promise<KubernetesResource>;
  getCustomResource(
    group: string,
    version: string,
    namespace: string,
    plural: string,
    name: string,
  ): Promise<KubernetesResource>;
  listClusterCustomResources(
    group: string,
    version: string,
    plural: string,
  ): Promise<KubernetesResource[]>;
  listCustomResources(
    group: string,
    version: string,
    namespace: string,
    plural: string,
  ): Promise<KubernetesResource[]>;
  deleteAllCustomResources(
    group: string,
    version: string,
    plural: string,
    namespace: string,
    options?: { ignoreErrors?: boolean },
  ): Promise<void>;
  patchClusterCustomResource(
    group: string,
    version: string,
    plural: string,
    name: string,
    patchBody:
      | JsonPatchOp[]
      | ReadonlyArray<{ op: string; path: string; value?: unknown }>
      | Record<string, unknown>,
  ): Promise<KubernetesResource>;
  patchClusterCustomResourceWithJsonPatch(
    group: string,
    version: string,
    plural: string,
    name: string,
    patchOps: Array<{ op: 'add' | 'remove' | 'replace'; path: string; value?: unknown }>,
  ): Promise<KubernetesResource>;

  // Template
  getTemplate(templateName: string, namespace: string): Promise<KubernetesResource>;
  createFedoraTemplateWithDataVolumeRootDisk(
    templateName: string,
    namespace: string,
  ): Promise<KubernetesResource>;
  getNativeVmTemplate(templateName: string, namespace: string): Promise<KubernetesResource>;
  verifyNativeVmTemplateCreated(
    templateName: string,
    namespace: string,
    timeoutMs?: number,
  ): Promise<{ error?: string; exists: boolean; template?: KubernetesResource }>;
  findTemplateByMetadataName(
    metadataName: string,
    namespace?: string,
  ): Promise<KubernetesResource | null>;
  getTemplateBootDataSourceRef(
    template: KubernetesResource,
    defaultDataSourceNamespace?: string,
  ): { name: string; namespace: string } | null;
  listTemplates(namespace: string): Promise<KubernetesResource[]>;
  verifyTemplateCreated(
    templateName: string,
    namespace: string,
    timeoutMs?: number,
  ): Promise<{ error?: string; exists: boolean; template?: KubernetesResource }>;

  // DataVolume
  dataVolumeExists(dataVolumeName: string, namespace: string): Promise<boolean>;
  dataSourceExists(dataSourceName: string, namespace: string): Promise<boolean>;
  patchDataSourceAnnotations(
    dataSourceName: string,
    namespace: string,
    annotations: Record<string, string>,
  ): Promise<void>;
  isDataSourceReady(name: string, namespace: string): Promise<boolean>;
  verifyDataVolumeCreated(
    dataVolumeName: string,
    namespace: string,
    timeoutMs?: number,
  ): Promise<{ dataVolume?: V1beta1DataVolume; error?: string; exists: boolean }>;
  createBlankDataVolume(
    dataVolumeName: string,
    namespace: string,
    size?: string,
  ): Promise<V1beta1DataVolume>;
  waitForDataVolumeSucceeded(
    dataVolumeName: string,
    namespace: string,
    timeoutMs?: number,
  ): Promise<void>;

  // Snapshot
  getVolumesnapshotsByLabel(
    namespace: string,
    labels: Record<string, string>,
    namePattern?: string,
    timeoutMs?: number,
  ): Promise<KubernetesResource[]>;
  deleteVolumesnapshotsByLabel(
    namespace: string,
    labels: Record<string, string>,
    timeoutMs?: number,
  ): Promise<boolean>;
  listVolumeSnapshotsInNamespace(namespace: string): Promise<KubernetesResource[]>;
  getVolumeSnapshotNameFromVirtualMachineSnapshot(
    virtualMachineSnapshotName: string,
    namespace: string,
    timeoutMs?: number,
    singleAttempt?: boolean,
  ): Promise<string>;
  createVolumeSnapshot(
    snapshotName: string,
    namespace: string,
    sourcePvcName: string,
    volumeSnapshotClassName?: string,
  ): Promise<KubernetesResource>;
  waitForVolumeSnapshotReady(
    snapshotName: string,
    namespace: string,
    timeoutMs?: number,
  ): Promise<void>;
  createVmSnapshot(
    snapshotName: string,
    vmName: string,
    namespace: string,
  ): Promise<V1beta1VirtualMachineSnapshot>;
  waitForSnapshotReady(
    snapshotName: string,
    namespace: string,
    timeoutMs?: number,
  ): Promise<boolean>;
  getVirtualMachineSnapshot(
    snapshotName: string,
    namespace: string,
  ): Promise<V1beta1VirtualMachineSnapshot>;

  // Secret / ConfigMap / PVC
  createSecret(
    name: string,
    namespace: string,
    data: { [key: string]: string },
    type?: string,
  ): Promise<k8s.V1Secret>;
  createSysprepConfigMap(
    name: string,
    namespace: string,
    unattendXml?: string,
  ): Promise<KubernetesResource>;
  createTlsCaCertConfigMap(
    name: string,
    namespace: string,
    caPem: string,
  ): Promise<k8s.V1ConfigMap>;
  verifySecretExists(name: string, namespace: string, timeout?: number): Promise<boolean>;
  createSSHKeySecret(
    name: string,
    namespace: string,
    sshPublicKey?: string,
  ): Promise<KubernetesResource>;
  verifySysprepConfigMapExists(
    name: string,
    namespace: string,
    timeout?: number,
  ): Promise<{ exists: boolean; hasAutounattend?: boolean; data?: Record<string, string> }>;
  getConfigMap(name: string, namespace: string): Promise<KubernetesResource | null>;
  patchConfigMap(
    name: string,
    namespace: string,
    patchData: Record<string, string>,
  ): Promise<KubernetesResource>;
  deleteSecret(name: string, namespace: string): Promise<boolean>;
  createPvc(
    name: string,
    namespace: string,
    size?: string,
    storageClassName?: string,
    accessModes?: string[],
  ): Promise<k8s.V1PersistentVolumeClaim>;
  deletePvc(
    name: string,
    namespace: string,
    options?: { ignoreNotFound?: boolean },
  ): Promise<boolean>;
  deleteAllSecrets(namespace: string, options?: { ignoreErrors?: boolean }): Promise<void>;
  deleteConfigMapsWithPrefix(
    namespace: string,
    prefix: string,
    options?: { ignoreErrors?: boolean },
  ): Promise<void>;

  // Migration Policy
  getMigrationPolicy(policyName: string): Promise<KubernetesResource>;
  listMigrationPolicies(): Promise<KubernetesResource[]>;
  migrationPolicyExists(policyName: string): Promise<boolean>;
  verifyMigrationPolicyCreated(
    policyName: string,
    timeoutMs?: number,
  ): Promise<{ error?: string; exists: boolean; policy?: KubernetesResource }>;
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
export function applyResourceDelegations(proto: any): void {
  // Generic CRUD → this.customResource
  delegateTo(proto, 'customResource', [
    'createCustomResource',
    'createClusterCustomResource',
    'deleteNamespacedService',
    'getClusterCustomResource',
    'listClusterCustomResources',
    'listCustomResources',
    'deleteAllCustomResources',
  ]);

  // Methods with return-type casts
  proto.deleteClusterCustomResource = async function (
    this: HandlerMap,
    group: string,
    version: string,
    plural: string,
    name: string,
  ): Promise<KubernetesResource> {
    const result = await this.customResource.deleteClusterCustomResource(
      group,
      version,
      plural,
      name,
    );
    return result as KubernetesResource;
  };

  proto.deleteCustomResource = async function (
    this: HandlerMap,
    group: string,
    version: string,
    namespace: string,
    plural: string,
    name: string,
  ): Promise<KubernetesResource> {
    const result = await this.customResource.deleteCustomResource(
      group,
      version,
      namespace,
      plural,
      name,
    );
    return result as KubernetesResource;
  };

  proto.patchResource = function (this: HandlerMap, ...args: unknown[]) {
    return this.customResource.patchResource(...args);
  };

  proto.getCustomResource = function (this: HandlerMap, ...args: unknown[]) {
    return this.customResource.getCustomResource(...args);
  };

  proto.patchClusterCustomResource = function (this: HandlerMap, ...args: unknown[]) {
    return this.customResource.patchClusterCustomResource(...args);
  };

  proto.patchClusterCustomResourceWithJsonPatch = function (this: HandlerMap, ...args: unknown[]) {
    return this.customResource.patchClusterCustomResourceWithJsonPatch(...args);
  };

  // Template → this.template
  delegateTo(proto, 'template', [
    'getTemplate',
    'createFedoraTemplateWithDataVolumeRootDisk',
    'getNativeVmTemplate',
    'verifyNativeVmTemplateCreated',
    'findTemplateByMetadataName',
    'getTemplateBootDataSourceRef',
    'listTemplates',
    'verifyTemplateCreated',
  ]);

  // DataVolume → this.dataVolume
  delegateTo(proto, 'dataVolume', [
    'dataVolumeExists',
    'dataSourceExists',
    'patchDataSourceAnnotations',
    'verifyDataVolumeCreated',
    'createBlankDataVolume',
    'waitForDataVolumeSucceeded',
  ]);

  // isDataSourceReady has inline logic
  proto.isDataSourceReady = async function (
    this: HandlerMap,
    name: string,
    namespace: string,
  ): Promise<boolean> {
    try {
      const ds = (await (this as unknown as KubernetesClientResourceMethods).getCustomResource(
        'cdi.kubevirt.io',
        'v1beta1',
        namespace,
        'datasources',
        name,
      )) as KubernetesResource;
      const conditions = ds?.status?.conditions;
      const list = Array.isArray(conditions) ? conditions : [];
      return list.some((c: KubernetesCondition) => c.type === 'Ready' && c.status === 'True');
    } catch {
      return false;
    }
  };

  // Snapshot → this.snapshot
  delegateTo(proto, 'snapshot', [
    'getVolumesnapshotsByLabel',
    'deleteVolumesnapshotsByLabel',
    'listVolumeSnapshotsInNamespace',
    'getVolumeSnapshotNameFromVirtualMachineSnapshot',
    'createVolumeSnapshot',
    'waitForVolumeSnapshotReady',
    'createVmSnapshot',
    'waitForSnapshotReady',
    'getVirtualMachineSnapshot',
  ]);

  // Secret / ConfigMap / PVC → this.secret
  delegateTo(proto, 'secret', [
    'createSecret',
    'createTlsCaCertConfigMap',
    'verifySecretExists',
    'verifySysprepConfigMapExists',
    'deleteSecret',
    'createPvc',
    'deletePvc',
    'deleteAllSecrets',
    'deleteConfigMapsWithPrefix',
  ]);

  // Methods with return-type casts
  proto.createSysprepConfigMap = async function (
    this: HandlerMap,
    name: string,
    namespace: string,
    unattendXml?: string,
  ): Promise<KubernetesResource> {
    const cm = await this.secret.createSysprepConfigMap(name, namespace, unattendXml);
    return cm as unknown as KubernetesResource;
  };

  proto.createSSHKeySecret = async function (
    this: HandlerMap,
    name: string,
    namespace: string,
    sshPublicKey?: string,
  ): Promise<KubernetesResource> {
    const secret = await this.secret.createSSHKeySecret(name, namespace, sshPublicKey);
    return secret as unknown as KubernetesResource;
  };

  proto.getConfigMap = function (this: HandlerMap, name: string, namespace: string) {
    return this.secret.getConfigMap(name, namespace);
  };

  proto.patchConfigMap = async function (
    this: HandlerMap,
    name: string,
    namespace: string,
    patchData: Record<string, string>,
  ): Promise<KubernetesResource> {
    const cm = await this.secret.patchConfigMap(name, namespace, patchData);
    return cm as unknown as KubernetesResource;
  };

  // Migration Policy — convenience wrappers
  proto.getMigrationPolicy = async function (this: HandlerMap, policyName: string) {
    return (this as unknown as KubernetesClientResourceMethods).getClusterCustomResource(
      'migrations.kubevirt.io',
      'v1alpha1',
      'migrationpolicies',
      policyName,
    );
  };

  proto.listMigrationPolicies = async function (this: HandlerMap) {
    return (this as unknown as KubernetesClientResourceMethods).listClusterCustomResources(
      'migrations.kubevirt.io',
      'v1alpha1',
      'migrationpolicies',
    );
  };

  proto.migrationPolicyExists = function (this: HandlerMap, policyName: string) {
    return this.namespace.migrationPolicyExists(policyName);
  };

  proto.verifyMigrationPolicyCreated = function (this: HandlerMap, ...args: unknown[]) {
    return this.namespace.verifyMigrationPolicyCreated(...args);
  };
}
