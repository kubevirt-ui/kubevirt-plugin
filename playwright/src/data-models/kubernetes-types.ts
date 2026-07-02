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
/**
 * Type bridge — re-exports strongly-typed CRD definitions from the plugin's
 * @kubevirt-ui-ext/kubevirt-api package for use in test code.
 *
 * The generic KubernetesResource interface in kubernetes-types.ts remains the
 * primary type for the CRUD client layer. Use these specific types in tests
 * and data factories when you need compile-time field validation.
 *
 * Usage:
 *   import type { V1VirtualMachine } from '@/data-models/kubevirt-types';
 *   const vm = await k8sClient.vm.get(name, ns) as V1VirtualMachine;
 *   expect(vm.spec?.template?.spec?.domain?.cpu?.cores).toBe(2);
 *
 * Note: The package uses "exports" subpaths which require moduleResolution
 * "node16" or "bundler". Our playwright tsconfig uses "node", so we import
 * directly from dist/ declaration files.
 */

import type { V1beta1DataVolume as DV } from '@kubevirt-ui-ext/kubevirt-api/dist/containerized-data-importer/index';
import type { V1VirtualMachine as VM } from '@kubevirt-ui-ext/kubevirt-api/dist/kubevirt/index';
import type { V1VirtualMachineInstance as VMI } from '@kubevirt-ui-ext/kubevirt-api/dist/kubevirt/index';

// eslint-disable-next-line simple-import-sort/exports
export type {
  V1Affinity,
  V1beta1DataSource,
  V1beta1DataSourceList,
  V1beta1DataVolume,
  V1beta1DataVolumeList,
  V1beta1DataVolumeSource,
  V1beta1DataVolumeSpec,
  V1beta1DataVolumeStatus,
  V1beta1StorageSpec,
  V1Condition as V1MetaCondition,
  V1LabelSelector,
  V1NodeAffinity,
  V1ObjectMeta,
  V1OwnerReference,
  V1PersistentVolumeClaimSpec,
  V1ResourceRequirements,
  V1Toleration,
} from '@kubevirt-ui-ext/kubevirt-api/dist/containerized-data-importer/index';
export type {
  V1AccessCredential,
  V1alpha1MigrationPolicy,
  V1alpha1MigrationPolicyList,
  V1alpha1MigrationPolicySpec,
  V1beta1VirtualMachineClone,
  V1beta1VirtualMachineClusterInstancetype,
  V1beta1VirtualMachineClusterInstancetypeList,
  V1beta1VirtualMachineClusterPreference,
  V1beta1VirtualMachineInstancetype,
  V1beta1VirtualMachineInstancetypeList,
  V1beta1VirtualMachinePreference,
  V1beta1VirtualMachineRestore,
  V1beta1VirtualMachineRestoreList,
  V1beta1VirtualMachineSnapshot,
  V1beta1VirtualMachineSnapshotList,
  V1CloudInitConfigDriveSource,
  V1CloudInitNoCloudSource,
  V1Condition,
  V1CPU,
  V1Devices,
  V1Disk,
  V1DomainSpec,
  V1Interface,
  V1KubeVirt,
  V1KubeVirtConfiguration,
  V1KubeVirtSpec,
  V1KubeVirtStatus,
  V1Memory,
  V1MigrationConfiguration,
  V1Network,
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceList,
  V1VirtualMachineInstanceMigration,
  V1VirtualMachineInstanceMigrationList,
  V1VirtualMachineInstanceSpec,
  V1VirtualMachineInstanceStatus,
  V1VirtualMachineList,
  V1VirtualMachineSpec,
  V1VirtualMachineStatus,
  V1Volume,
} from '@kubevirt-ui-ext/kubevirt-api/dist/kubevirt/index';

export function isDataVolume(r: KubernetesResource): r is KubernetesResource & DV {
  return r.kind === 'DataVolume';
}

export function isVirtualMachine(r: KubernetesResource): r is KubernetesResource & VM {
  return r.kind === 'VirtualMachine';
}

export function isVirtualMachineInstance(r: KubernetesResource): r is KubernetesResource & VMI {
  return r.kind === 'VirtualMachineInstance';
}
