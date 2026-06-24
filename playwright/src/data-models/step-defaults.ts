/**
 * Step-level default constants used as default parameter values in step classes.
 * These provide sensible defaults while allowing tests to override them when needed.
 */
import { DISK_NAMES } from '@/data-models/constants';

export const STEP_DISK_NAMES = {
  LUN_DISK: DISK_NAMES.LUN_DISK,
  SHAREABLE_DISK: DISK_NAMES.SHAREABLE_DISK,
} as const;

export const STEP_NAMESPACES = {
  OPENSHIFT_CNV: 'openshift-cnv',
} as const;

export const STEP_K8S_RESOURCE_NAMES = {
  KUBEVIRT_HYPERCONVERGED: 'kubevirt-hyperconverged',
} as const;

export const STEP_PATCH_TYPE = {
  MERGE: 'merge',
} as const;

export const STEP_GPU_CONFIG = {
  EXPECTED_GPU: 'NVIDIA',
} as const;

export const STEP_VM_NAME_PREFIXES = {
  DEFAULT: 'test-vm',
  TEMPLATE: 'template-vm',
} as const;

export const STEP_TEMPLATE_NAME_PREFIXES = {
  DEFAULT: 'test-template',
} as const;

export const STEP_INSTANCE_TYPE_NAME_PREFIXES = {
  DEFAULT: 'test-instancetype',
} as const;

export const STEP_DATA_VOLUME_NAME_PREFIXES = {
  DEFAULT: 'test-datavolume',
} as const;

export const STEP_MIGRATION_POLICY_NAME_PREFIXES = {
  DEFAULT: 'test-migration-policy',
} as const;

export const STEP_FOLDER_NAME_PREFIXES = {
  BULK_TEST: 'bulk-test-folder',
  DEFAULT: 'test-folder',
} as const;

export const STEP_VOLUME_NAMES = {
  FEDORA: 'fedora',
} as const;

export const STEP_INSTANCE_TYPE_CONFIG = {
  NANO: 'nano',
  ALPINE: 'alpine',
  SMALL: 'small',
  U: 'u',
  AMD64: 'amd64',
  FEDORA: 'fedora',
} as const;

export const STEP_TAG_CONFIG = {
  DEFAULT_KEY: 'environment',
  DEFAULT_VALUE_LENGTH: 6,
} as const;
