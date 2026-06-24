/**
 * Typed context keys for the scenario context manager.
 * Provides type safety, prevents typos, and enables IDE autocomplete.
 */

import type { KubernetesResource } from '@/data-models/kubernetes-types';

export enum ContextKey {
  CONFIG_TEST_NAMESPACE = 'testNamespace',
  CONFIG_CNV_NAMESPACE = 'cnvNamespace',
  CONFIG_SECRET_NAME = 'secretName',
  CONFIG_PROJECT_NAME = 'projectName',

  CURRENT_VM = 'currentVm',
  CURRENT_VM_NAME = 'currentVmName',
  CURRENT_VM_NAMESPACE = 'currentVmNamespace',
  CURRENT_VM_YAML = 'currentVmYaml',
  CURRENT_VM_TAG = 'currentVmTag',

  CURRENT_DATA_VOLUME_NAME = 'currentDataVolumeName',
  CURRENT_DATA_VOLUME_NAMESPACE = 'currentDataVolumeNamespace',
  CURRENT_DATA_VOLUME_YAML = 'currentDataVolumeYaml',

  CURRENT_DISK_NAME = 'currentDiskName',
  CURRENT_DISK_DATA_VOLUME_NAME = 'currentDiskDataVolumeName',
  CURRENT_CDROM_DISK_NAME = 'currentCdromDiskName',

  CURRENT_SSH_SECRET_NAME = 'currentSshSecretName',

  CURRENT_TEMPLATE_NAME = 'currentTemplateName',
  CURRENT_TEMPLATE_NAMESPACE = 'currentTemplateNamespace',
  CURRENT_TEMPLATE_YAML = 'currentTemplateYaml',
  CURRENT_TEMPLATE_CONFIG = 'currentTemplateConfig',

  CURRENT_INSTANCE_TYPE_NAME = 'currentInstanceTypeName',
  CURRENT_INSTANCE_TYPE_NAMESPACE = 'currentInstanceTypeNamespace',
  CURRENT_INSTANCE_TYPE_YAML = 'currentInstanceTypeYaml',
  CURRENT_INSTANCE_TYPE_IS_CLUSTER_SCOPED = 'currentInstanceTypeIsClusterScoped',

  CURRENT_MIGRATION_POLICY_NAME = 'currentMigrationPolicyName',
  CURRENT_MIGRATION_POLICY_YAML = 'currentMigrationPolicyYaml',

  CURRENT_FOLDER_NAME = 'currentFolderName',
  SECOND_FOLDER_NAME = 'secondFolderName',
  SECOND_FOLDER_NAMESPACE = 'secondFolderNamespace',

  STATE_NAMESPACE_EXISTS = 'namespaceExists',
  STATE_SECRET_EXISTS = 'secretExists',
  STATE_USER_TOKEN = 'userToken',
  STATE_VM_LOGS = 'vmLogs',
  STATE_POD_LIST = 'podList',
  STATE_VM_POD_NAME = 'vmPodName',

  NAMESPACE = 'namespace',
  VM_NAME = 'vmName',
  CURRENT_SNAPSHOT_NAME = 'currentSnapshotName',

  /** Sysprep autounattend ConfigMap paired with the current Windows VM setup flow */
  CURRENT_SYSPREP_CONFIG_MAP_NAME = 'currentSysprepConfigMapName',
}

export interface ContextValueTypeMap {
  [ContextKey.CONFIG_TEST_NAMESPACE]: string;
  [ContextKey.CONFIG_CNV_NAMESPACE]: string;
  [ContextKey.CONFIG_SECRET_NAME]: string;
  [ContextKey.CONFIG_PROJECT_NAME]: string;

  [ContextKey.CURRENT_VM]: KubernetesResource;
  [ContextKey.CURRENT_VM_NAME]: string;
  [ContextKey.CURRENT_VM_NAMESPACE]: string;
  [ContextKey.CURRENT_VM_YAML]: string;
  [ContextKey.CURRENT_VM_TAG]: string;

  [ContextKey.CURRENT_DATA_VOLUME_NAME]: string;
  [ContextKey.CURRENT_DATA_VOLUME_NAMESPACE]: string;
  [ContextKey.CURRENT_DATA_VOLUME_YAML]: string;

  [ContextKey.CURRENT_DISK_NAME]: string;
  [ContextKey.CURRENT_DISK_DATA_VOLUME_NAME]: string;
  [ContextKey.CURRENT_CDROM_DISK_NAME]: string;

  [ContextKey.CURRENT_TEMPLATE_NAME]: string;
  [ContextKey.CURRENT_TEMPLATE_NAMESPACE]: string;
  [ContextKey.CURRENT_TEMPLATE_YAML]: string;
  [ContextKey.CURRENT_TEMPLATE_CONFIG]: Record<string, unknown>;

  [ContextKey.CURRENT_INSTANCE_TYPE_NAME]: string;
  [ContextKey.CURRENT_INSTANCE_TYPE_NAMESPACE]: string;
  [ContextKey.CURRENT_INSTANCE_TYPE_YAML]: string;
  [ContextKey.CURRENT_INSTANCE_TYPE_IS_CLUSTER_SCOPED]: boolean;

  [ContextKey.CURRENT_MIGRATION_POLICY_NAME]: string;
  [ContextKey.CURRENT_MIGRATION_POLICY_YAML]: string;

  [ContextKey.CURRENT_FOLDER_NAME]: string;
  [ContextKey.SECOND_FOLDER_NAME]: string;
  [ContextKey.SECOND_FOLDER_NAMESPACE]: string;

  [ContextKey.STATE_NAMESPACE_EXISTS]: boolean;
  [ContextKey.STATE_SECRET_EXISTS]: boolean;
  [ContextKey.STATE_USER_TOKEN]: string;
  [ContextKey.STATE_VM_LOGS]: string;
  [ContextKey.STATE_POD_LIST]: KubernetesResource[];
  [ContextKey.STATE_VM_POD_NAME]: string;

  [ContextKey.NAMESPACE]: string;
  [ContextKey.VM_NAME]: string;
  [ContextKey.CURRENT_SNAPSHOT_NAME]: string;

  [ContextKey.CURRENT_SYSPREP_CONFIG_MAP_NAME]: string;
}

export type ContextValueType<K extends ContextKey> = K extends keyof ContextValueTypeMap
  ? ContextValueTypeMap[K]
  : unknown;
