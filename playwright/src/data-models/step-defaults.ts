/**
 * Step-level default constants used as default parameter values in step classes.
 * These provide sensible defaults while allowing tests to override them when needed.
 */
import {
  DISK_NAMES,
  K8S_NAMESPACES,
  K8S_PATCH_TYPES,
  K8S_RESOURCE_NAMES,
  SECRET_NAMES,
  SSH_CONFIG,
  SSH_KEY_PATHS,
} from '@/data-models/constants';

export const STEP_DISK_NAMES = {
  LUN_DISK: DISK_NAMES.LUN_DISK,
  SHAREABLE_DISK: DISK_NAMES.SHAREABLE_DISK,
} as const;

export const STEP_SSH_CONFIG = {
  USERNAME: 'cloud-user',
  SSH_KEY_PATH: 'fixtures/cnv.key',
  PUBLIC_KEY_PATH: SSH_KEY_PATHS.PUBLIC_KEY,
  SECRET_NAME: SECRET_NAMES.TEST_SECRET,
  PUBLIC_KEY: SSH_CONFIG.PUBLIC_KEY,
} as const;

export const STEP_NAMESPACES = K8S_NAMESPACES;

export const STEP_K8S_RESOURCE_NAMES = K8S_RESOURCE_NAMES;

export const STEP_PATCH_TYPE = K8S_PATCH_TYPES;

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
