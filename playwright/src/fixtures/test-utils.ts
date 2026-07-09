/**
 * Test Utilities Aggregator.
 * Provides lazy-loaded access to all utilities, constants, and factories used in tests.
 * Each import is loaded only when first accessed, improving test startup performance.
 */

import { ContextKey } from '@/context-managers/context-keys';
import ScenarioContextManager from '@/context-managers/scenario-context-manager';
import { DataVolumeFactory } from '@/data-factories/data-volume-factory';
import { createUbuntuLikeFilesystemList } from '@/data-factories/filesystem-mock-factory';
import { InstanceTypeFactory } from '@/data-factories/instance-type-factory';
import { MigrationPolicyFactory } from '@/data-factories/migration-policy-factory';
import { SshKeyFactory } from '@/data-factories/ssh-key-factory';
import { TemplateFactory } from '@/data-factories/template-factory';
import { TestFileFactory } from '@/data-factories/test-file-factory';
import { VirtualMachineFactory } from '@/data-factories/virtual-machine-factory';
import { createMinimalVirtualMachineSnapshotYaml } from '@/data-factories/virtual-machine-snapshot-factory';
import { createVmMetricsSet } from '@/data-factories/vm-metrics-mock-factory';
import * as constants from '@/data-models/constants';
import { withAllure } from '@/utils/allure';
import { EnvVariables } from '@/utils/env-variables';
import { FileUtils } from '@/utils/file-utils';
import {
  generateRandomCheckupName,
  generateRandomConfigMapName,
  generateRandomDataVolumeName,
  generateRandomDiskName,
  generateRandomFolderName,
  generateRandomInstanceTypeName,
  generateRandomLabelValue,
  generateRandomMigrationPolicyName,
  generateRandomNadName,
  generateRandomName,
  generateRandomPassword,
  generateRandomPvcName,
  generateRandomQuotaName,
  generateRandomSecretName,
  generateRandomSnapshotName,
  generateRandomString,
  generateRandomTemplateName,
  generateRandomVmName,
  generateTestNamespace,
} from '@/utils/random-data-generator';
import { isLocalhostBaseUrl } from '@/utils/runtime';
import {
  ALL_PROJECTS_NS,
  OS_FILTER_VALUES,
  TEMPLATE_METADATA_NAMES,
} from '@/utils/template-constants';
import { MINUTE, TestTimeouts } from '@/utils/test-config';
import { createAdvancedSearchTestVms } from '@/utils/test-setup-helpers';
import {
  cleanupMigrationPlans,
  createPwPrefixedName,
  createStagedVmName,
  createVmFromTemplateCatalogFlow,
  createVmFromTemplateInNamespace,
  getMigrationPlanCount,
  getMigrationPlanRetentionPolicy,
  getMissingStorageClasses,
  navigateToProjectVmListForNamespace,
  navigateToProjectVmListViaUI,
  navigateToVirtualMachinesWithEmptyProjectsInTree,
  setupPwTestNamespace,
  waitForDataVolumeReady,
  waitForMigrationPlanCreated,
  waitForVmDiskAndGetName,
} from '@/utils/vm-actions-direct-k8s';
import {
  waitForVirtualMachinePaused,
  waitForVirtualMachineReady,
  waitForVirtualMachineStopped,
} from '@/utils/vm-k8s-waits';
import {
  navigateToVmDetailAndConfigurationSubTab,
  verifyCloudInitWithRetries,
} from '@/utils/vm-navigation-helpers';
import {
  waitForApiResponse,
  waitForCondition,
  waitForPageHealthy,
  waitForPageHealthyWithRetry,
} from '@/utils/wait-helpers';

const moduleCache: Record<string, unknown> = {};

function lazyLoad<T>(key: string, loader: () => T): T {
  if (!(key in moduleCache)) {
    moduleCache[key] = loader();
  }
  return moduleCache[key] as T;
}

export class TestUtils {
  get ACTIVATION_KEY() {
    return lazyLoad('ACTIVATION_KEY', () => constants.ACTIVATION_KEY);
  }

  get ALERT_MESSAGES() {
    return lazyLoad('ALERT_MESSAGES', () => constants.ALERT_MESSAGES);
  }

  get ALL_PROJECTS_NS() {
    return lazyLoad('ALL_PROJECTS_NS', () => ALL_PROJECTS_NS);
  }

  get BOOT_MODES() {
    return lazyLoad('BOOT_MODES', () => constants.BOOT_MODES);
  }

  get CHECKBOX_IDS() {
    return lazyLoad('CHECKBOX_IDS', () => constants.CHECKBOX_IDS);
  }

  get CHECKUP_NAMES() {
    return lazyLoad('CHECKUP_NAMES', () => constants.CHECKUP_NAMES);
  }

  get cleanupMigrationPlans() {
    return lazyLoad('cleanupMigrationPlans', () => cleanupMigrationPlans);
  }

  get CLOUD_INIT_CREDENTIALS() {
    return lazyLoad('CLOUD_INIT_CREDENTIALS', () => constants.CLOUD_INIT_CREDENTIALS);
  }

  get COMPARISON_OPERATORS() {
    return lazyLoad('COMPARISON_OPERATORS', () => constants.COMPARISON_OPERATORS);
  }

  get ContextKey() {
    return lazyLoad('ContextKey', () => ContextKey);
  }

  get createAdvancedSearchTestVms() {
    return lazyLoad('createAdvancedSearchTestVms', () => createAdvancedSearchTestVms);
  }

  get createMinimalVirtualMachineSnapshotYaml() {
    return lazyLoad(
      'createMinimalVirtualMachineSnapshotYaml',
      () => createMinimalVirtualMachineSnapshotYaml,
    );
  }

  get createPwPrefixedName() {
    return lazyLoad('createPwPrefixedName', () => createPwPrefixedName);
  }

  get createStagedVmName() {
    return lazyLoad('createStagedVmName', () => createStagedVmName);
  }

  get createUbuntuLikeFilesystemList() {
    return lazyLoad('createUbuntuLikeFilesystemList', () => createUbuntuLikeFilesystemList);
  }

  get createVmFromTemplateCatalogFlow() {
    return lazyLoad('createVmFromTemplateCatalogFlow', () => createVmFromTemplateCatalogFlow);
  }

  get createVmFromTemplateInNamespace() {
    return lazyLoad('createVmFromTemplateInNamespace', () => createVmFromTemplateInNamespace);
  }

  get createVmMetricsSet() {
    return lazyLoad('createVmMetricsSet', () => createVmMetricsSet);
  }

  get DataVolumeFactory() {
    return lazyLoad('DataVolumeFactory', () => DataVolumeFactory);
  }

  get DESCRIPTION_FILTERS() {
    return lazyLoad('DESCRIPTION_FILTERS', () => constants.DESCRIPTION_FILTERS);
  }

  get DISK_NAMES() {
    return lazyLoad('DISK_NAMES', () => constants.DISK_NAMES);
  }

  get DISK_RESERVATION() {
    return lazyLoad('DISK_RESERVATION', () => constants.DISK_RESERVATION);
  }

  get DISK_SIZES() {
    return lazyLoad('DISK_SIZES', () => constants.DISK_SIZES);
  }

  get EnvVariables() {
    return lazyLoad('EnvVariables', () => EnvVariables);
  }

  get FileUtils() {
    return lazyLoad('FileUtils', () => FileUtils);
  }

  get generateRandomCheckupName() {
    return lazyLoad('generateRandomCheckupName', () => generateRandomCheckupName);
  }

  get generateRandomConfigMapName() {
    return lazyLoad('generateRandomConfigMapName', () => generateRandomConfigMapName);
  }

  get generateRandomDataVolumeName() {
    return lazyLoad('generateRandomDataVolumeName', () => generateRandomDataVolumeName);
  }

  get generateRandomDiskName() {
    return lazyLoad('generateRandomDiskName', () => generateRandomDiskName);
  }

  get generateRandomFolderName() {
    return lazyLoad('generateRandomFolderName', () => generateRandomFolderName);
  }

  get generateRandomInstanceTypeName() {
    return lazyLoad('generateRandomInstanceTypeName', () => generateRandomInstanceTypeName);
  }

  get generateRandomLabelValue() {
    return lazyLoad('generateRandomLabelValue', () => generateRandomLabelValue);
  }

  get generateRandomMigrationPolicyName() {
    return lazyLoad('generateRandomMigrationPolicyName', () => generateRandomMigrationPolicyName);
  }

  get generateRandomNadName() {
    return lazyLoad('generateRandomNadName', () => generateRandomNadName);
  }

  get generateRandomName() {
    return lazyLoad('generateRandomName', () => generateRandomName);
  }

  get generateRandomPassword() {
    return lazyLoad('generateRandomPassword', () => generateRandomPassword);
  }

  get generateRandomPvcName() {
    return lazyLoad('generateRandomPvcName', () => generateRandomPvcName);
  }

  get generateRandomQuotaName() {
    return lazyLoad('generateRandomQuotaName', () => generateRandomQuotaName);
  }

  get generateRandomSecretName() {
    return lazyLoad('generateRandomSecretName', () => generateRandomSecretName);
  }

  get generateRandomSnapshotName() {
    return lazyLoad('generateRandomSnapshotName', () => generateRandomSnapshotName);
  }

  get generateRandomString() {
    return lazyLoad('generateRandomString', () => generateRandomString);
  }

  get generateRandomTemplateName() {
    return lazyLoad('generateRandomTemplateName', () => generateRandomTemplateName);
  }

  get generateRandomVmName() {
    return lazyLoad('generateRandomVmName', () => generateRandomVmName);
  }

  get generateTestNamespace() {
    return lazyLoad('generateTestNamespace', () => generateTestNamespace);
  }

  get getMigrationPlanCount() {
    return lazyLoad('getMigrationPlanCount', () => getMigrationPlanCount);
  }

  get getMigrationPlanRetentionPolicy() {
    return lazyLoad('getMigrationPlanRetentionPolicy', () => getMigrationPlanRetentionPolicy);
  }

  get getMissingStorageClasses() {
    return lazyLoad('getMissingStorageClasses', () => getMissingStorageClasses);
  }

  get HCO_SPEC_PATHS() {
    return lazyLoad('HCO_SPEC_PATHS', () => constants.HCO_SPEC_PATHS);
  }

  get INSTANCE_TYPES() {
    return lazyLoad('INSTANCE_TYPES', () => constants.INSTANCE_TYPES);
  }

  get InstanceTypeFactory() {
    return lazyLoad('InstanceTypeFactory', () => InstanceTypeFactory);
  }

  get isLocalhostBaseUrl() {
    return lazyLoad('isLocalhostBaseUrl', () => isLocalhostBaseUrl);
  }

  get LABEL_KEYS() {
    return lazyLoad('LABEL_KEYS', () => constants.LABEL_KEYS);
  }

  get LABEL_VALUES() {
    return lazyLoad('LABEL_VALUES', () => constants.LABEL_VALUES);
  }

  get MEMORY_DENSITY() {
    return lazyLoad('MEMORY_DENSITY', () => constants.MEMORY_DENSITY);
  }

  get MIGRATION_CONFIG() {
    return lazyLoad('MIGRATION_CONFIG', () => constants.MIGRATION_CONFIG);
  }

  get MigrationPolicyFactory() {
    return lazyLoad('MigrationPolicyFactory', () => MigrationPolicyFactory);
  }

  get MINUTE() {
    return lazyLoad('MINUTE', () => MINUTE);
  }

  get NAMESPACES() {
    return lazyLoad('NAMESPACES', () => constants.NAMESPACES);
  }

  get navigateToProjectVmListForNamespace() {
    return lazyLoad(
      'navigateToProjectVmListForNamespace',
      () => navigateToProjectVmListForNamespace,
    );
  }

  get navigateToProjectVmListViaUI() {
    return lazyLoad('navigateToProjectVmListViaUI', () => navigateToProjectVmListViaUI);
  }

  get navigateToVirtualMachinesWithEmptyProjectsInTree() {
    return lazyLoad(
      'navigateToVirtualMachinesWithEmptyProjectsInTree',
      () => navigateToVirtualMachinesWithEmptyProjectsInTree,
    );
  }

  get navigateToVmDetailAndConfigurationSubTab() {
    return lazyLoad(
      'navigateToVmDetailAndConfigurationSubTab',
      () => navigateToVmDetailAndConfigurationSubTab,
    );
  }

  get NETWORKING() {
    return lazyLoad('NETWORKING', () => constants.NETWORKING);
  }

  get OS_FILTER_VALUES() {
    return lazyLoad('OS_FILTER_VALUES', () => OS_FILTER_VALUES);
  }

  get OS_FILTERS() {
    return lazyLoad('OS_FILTERS', () => constants.OS_FILTERS);
  }

  get OS_NAMES() {
    return lazyLoad('OS_NAMES', () => constants.OS_NAMES);
  }

  get PROVIDER_FILTERS() {
    return lazyLoad('PROVIDER_FILTERS', () => constants.PROVIDER_FILTERS);
  }

  get PVC_NAMES() {
    return lazyLoad('PVC_NAMES', () => constants.PVC_NAMES);
  }

  get QUICK_START_TITLES() {
    return lazyLoad('QUICK_START_TITLES', () => constants.QUICK_START_TITLES);
  }

  get REGISTRY_URLS() {
    return lazyLoad('REGISTRY_URLS', () => constants.REGISTRY_URLS);
  }

  get SAVED_SEARCH() {
    return lazyLoad('SAVED_SEARCH', () => constants.SAVED_SEARCH);
  }

  get ScenarioContextManager() {
    return lazyLoad('ScenarioContextManager', () => ScenarioContextManager);
  }

  get SCHEDULING_SETTINGS() {
    return lazyLoad('SCHEDULING_SETTINGS', () => constants.SCHEDULING_SETTINGS);
  }

  get SEARCH_FILTERS() {
    return lazyLoad('SEARCH_FILTERS', () => constants.SEARCH_FILTERS);
  }

  get SEARCH_VALUES() {
    return lazyLoad('SEARCH_VALUES', () => constants.SEARCH_VALUES);
  }

  get SECRET_NAMES() {
    return lazyLoad('SECRET_NAMES', () => constants.SECRET_NAMES);
  }

  get SERVICE_NAMES() {
    return lazyLoad('SERVICE_NAMES', () => constants.SERVICE_NAMES);
  }

  get setupPwTestNamespace() {
    return lazyLoad('setupPwTestNamespace', () => setupPwTestNamespace);
  }

  get SSH_CONFIG() {
    return lazyLoad('SSH_CONFIG', () => constants.SSH_CONFIG);
  }

  get SSH_KEY_PATHS() {
    return lazyLoad('SSH_KEY_PATHS', () => constants.SSH_KEY_PATHS);
  }

  get SshKeyFactory() {
    return lazyLoad('SshKeyFactory', () => SshKeyFactory);
  }

  get STORAGE_CLASSES() {
    return lazyLoad('STORAGE_CLASSES', () => constants.STORAGE_CLASSES);
  }

  get TEMPLATE_DISPLAY_NAMES() {
    return lazyLoad('TEMPLATE_DISPLAY_NAMES', () => constants.TEMPLATE_DISPLAY_NAMES);
  }

  get TEMPLATE_METADATA_NAMES() {
    return lazyLoad('TEMPLATE_METADATA_NAMES', () => TEMPLATE_METADATA_NAMES);
  }

  get TEMPLATE_NAME_PREFIXES() {
    return lazyLoad('TEMPLATE_NAME_PREFIXES', () => constants.TEMPLATE_NAME_PREFIXES);
  }

  get TemplateFactory() {
    return lazyLoad('TemplateFactory', () => TemplateFactory);
  }

  get TEST_ANNOTATIONS() {
    return lazyLoad('TEST_ANNOTATIONS', () => constants.TEST_ANNOTATIONS);
  }

  get TEST_LABELS() {
    return lazyLoad('TEST_LABELS', () => constants.TEST_LABELS);
  }

  get TEST_METADATA() {
    return lazyLoad('TEST_METADATA', () => constants.TEST_METADATA);
  }

  get TEST_PHYS_NNCP_NAME() {
    return lazyLoad('TEST_PHYS_NNCP_NAME', () => constants.TEST_PHYS_NNCP_NAME);
  }

  get TestFileFactory() {
    return lazyLoad('TestFileFactory', () => TestFileFactory);
  }

  get TestTimeouts() {
    return lazyLoad('TestTimeouts', () => TestTimeouts);
  }

  get TOP_CONSUMERS_CARDS() {
    return lazyLoad('TOP_CONSUMERS_CARDS', () => constants.TOP_CONSUMERS_CARDS);
  }

  get verifyCloudInitWithRetries() {
    return lazyLoad('verifyCloudInitWithRetries', () => verifyCloudInitWithRetries);
  }

  get VERSION() {
    return lazyLoad('VERSION', () => constants.VERSION);
  }

  get VirtualMachineFactory() {
    return lazyLoad('VirtualMachineFactory', () => VirtualMachineFactory);
  }

  get VM_CUSTOMIZATION() {
    return lazyLoad('VM_CUSTOMIZATION', () => constants.VM_CUSTOMIZATION);
  }

  get VM_NAME_PREFIXES() {
    return lazyLoad('VM_NAME_PREFIXES', () => constants.VM_NAME_PREFIXES);
  }

  get VM_STATUS() {
    return lazyLoad('VM_STATUS', () => constants.VM_STATUS);
  }

  get waitForApiResponse() {
    return lazyLoad('waitForApiResponse', () => waitForApiResponse);
  }

  get waitForCondition() {
    return lazyLoad('waitForCondition', () => waitForCondition);
  }

  get waitForDataVolumeReady() {
    return lazyLoad('waitForDataVolumeReady', () => waitForDataVolumeReady);
  }

  get waitForMigrationPlanCreated() {
    return lazyLoad('waitForMigrationPlanCreated', () => waitForMigrationPlanCreated);
  }

  get waitForPageHealthy() {
    return lazyLoad('waitForPageHealthy', () => waitForPageHealthy);
  }

  get waitForPageHealthyWithRetry() {
    return lazyLoad('waitForPageHealthyWithRetry', () => waitForPageHealthyWithRetry);
  }

  get waitForVirtualMachinePaused() {
    return lazyLoad('waitForVirtualMachinePaused', () => waitForVirtualMachinePaused);
  }

  get waitForVirtualMachineReady() {
    return lazyLoad('waitForVirtualMachineReady', () => waitForVirtualMachineReady);
  }

  get waitForVirtualMachineStopped() {
    return lazyLoad('waitForVirtualMachineStopped', () => waitForVirtualMachineStopped);
  }

  get waitForVmDiskAndGetName() {
    return lazyLoad('waitForVmDiskAndGetName', () => waitForVmDiskAndGetName);
  }

  get withAllure() {
    return lazyLoad('withAllure', () => withAllure);
  }

  get WORKLOAD_FILTERS() {
    return lazyLoad('WORKLOAD_FILTERS', () => constants.WORKLOAD_FILTERS);
  }

  get WORKLOAD_TYPES() {
    return lazyLoad('WORKLOAD_TYPES', () => constants.WORKLOAD_TYPES);
  }
}

export interface TestUtilsType {
  generateRandomName: typeof generateRandomName;
  generateRandomVmName: typeof generateRandomVmName;
  generateTestNamespace: typeof generateTestNamespace;
  generateRandomTemplateName: typeof generateRandomTemplateName;
  generateRandomFolderName: typeof generateRandomFolderName;
  generateRandomInstanceTypeName: typeof generateRandomInstanceTypeName;
  generateRandomMigrationPolicyName: typeof generateRandomMigrationPolicyName;
  generateRandomDataVolumeName: typeof generateRandomDataVolumeName;
  generateRandomLabelValue: typeof generateRandomLabelValue;
  generateRandomPassword: typeof generateRandomPassword;
  generateRandomString: typeof generateRandomString;
  generateRandomSnapshotName: typeof generateRandomSnapshotName;
  generateRandomNadName: typeof generateRandomNadName;
  generateRandomCheckupName: typeof generateRandomCheckupName;
  generateRandomQuotaName: typeof generateRandomQuotaName;
  generateRandomDiskName: typeof generateRandomDiskName;
  generateRandomConfigMapName: typeof generateRandomConfigMapName;
  generateRandomPvcName: typeof generateRandomPvcName;
  generateRandomSecretName: typeof generateRandomSecretName;
  withAllure: typeof withAllure;
  EnvVariables: typeof EnvVariables;
  TestTimeouts: typeof TestTimeouts;
  MINUTE: typeof MINUTE;
  isLocalhostBaseUrl: typeof isLocalhostBaseUrl;
  waitForApiResponse: typeof waitForApiResponse;
  waitForCondition: typeof waitForCondition;
  waitForPageHealthy: typeof waitForPageHealthy;
  waitForPageHealthyWithRetry: typeof waitForPageHealthyWithRetry;
  waitForVirtualMachineReady: typeof waitForVirtualMachineReady;
  waitForVirtualMachineStopped: typeof waitForVirtualMachineStopped;
  waitForVirtualMachinePaused: typeof waitForVirtualMachinePaused;
  navigateToVmDetailAndConfigurationSubTab: typeof navigateToVmDetailAndConfigurationSubTab;
  verifyCloudInitWithRetries: typeof verifyCloudInitWithRetries;
  getMissingStorageClasses: typeof getMissingStorageClasses;
  cleanupMigrationPlans: typeof cleanupMigrationPlans;
  waitForMigrationPlanCreated: typeof waitForMigrationPlanCreated;
  waitForVmDiskAndGetName: typeof waitForVmDiskAndGetName;
  getMigrationPlanRetentionPolicy: typeof getMigrationPlanRetentionPolicy;
  getMigrationPlanCount: typeof getMigrationPlanCount;
  waitForDataVolumeReady: typeof waitForDataVolumeReady;
  setupPwTestNamespace: typeof setupPwTestNamespace;
  createPwPrefixedName: typeof createPwPrefixedName;
  navigateToVirtualMachinesWithEmptyProjectsInTree: typeof navigateToVirtualMachinesWithEmptyProjectsInTree;
  navigateToProjectVmListForNamespace: typeof navigateToProjectVmListForNamespace;
  navigateToProjectVmListViaUI: typeof navigateToProjectVmListViaUI;
  createVmFromTemplateCatalogFlow: typeof createVmFromTemplateCatalogFlow;
  createStagedVmName: typeof createStagedVmName;
  createVmFromTemplateInNamespace: typeof createVmFromTemplateInNamespace;
  createAdvancedSearchTestVms: typeof createAdvancedSearchTestVms;
  createUbuntuLikeFilesystemList: typeof createUbuntuLikeFilesystemList;
  createVmMetricsSet: typeof createVmMetricsSet;
  TEMPLATE_METADATA_NAMES: typeof TEMPLATE_METADATA_NAMES;
  OS_FILTER_VALUES: typeof OS_FILTER_VALUES;
  ALL_PROJECTS_NS: typeof ALL_PROJECTS_NS;
  ACTIVATION_KEY: typeof constants.ACTIVATION_KEY;
  ALERT_MESSAGES: typeof constants.ALERT_MESSAGES;
  CHECKBOX_IDS: typeof constants.CHECKBOX_IDS;
  CLOUD_INIT_CREDENTIALS: typeof constants.CLOUD_INIT_CREDENTIALS;
  DISK_RESERVATION: typeof constants.DISK_RESERVATION;
  HCO_SPEC_PATHS: typeof constants.HCO_SPEC_PATHS;
  INSTANCE_TYPES: typeof constants.INSTANCE_TYPES;
  PVC_NAMES: typeof constants.PVC_NAMES;
  QUICK_START_TITLES: typeof constants.QUICK_START_TITLES;
  REGISTRY_URLS: typeof constants.REGISTRY_URLS;
  SERVICE_NAMES: typeof constants.SERVICE_NAMES;
  STORAGE_CLASSES: typeof constants.STORAGE_CLASSES;
  TEST_ANNOTATIONS: typeof constants.TEST_ANNOTATIONS;
  TEST_LABELS: typeof constants.TEST_LABELS;
  TEST_METADATA: typeof constants.TEST_METADATA;
  TOP_CONSUMERS_CARDS: typeof constants.TOP_CONSUMERS_CARDS;
  VM_CUSTOMIZATION: typeof constants.VM_CUSTOMIZATION;
  VM_NAME_PREFIXES: typeof constants.VM_NAME_PREFIXES;
  SSH_CONFIG: typeof constants.SSH_CONFIG;
  VM_STATUS: typeof constants.VM_STATUS;
  NETWORKING: typeof constants.NETWORKING;
  NAMESPACES: typeof constants.NAMESPACES;
  DESCRIPTION_FILTERS: typeof constants.DESCRIPTION_FILTERS;
  LABEL_KEYS: typeof constants.LABEL_KEYS;
  LABEL_VALUES: typeof constants.LABEL_VALUES;
  SEARCH_VALUES: typeof constants.SEARCH_VALUES;
  COMPARISON_OPERATORS: typeof constants.COMPARISON_OPERATORS;
  DISK_NAMES: typeof constants.DISK_NAMES;
  DISK_SIZES: typeof constants.DISK_SIZES;
  TEMPLATE_NAME_PREFIXES: typeof constants.TEMPLATE_NAME_PREFIXES;
  TEMPLATE_DISPLAY_NAMES: typeof constants.TEMPLATE_DISPLAY_NAMES;
  BOOT_MODES: typeof constants.BOOT_MODES;
  WORKLOAD_TYPES: typeof constants.WORKLOAD_TYPES;
  SCHEDULING_SETTINGS: typeof constants.SCHEDULING_SETTINGS;
  SAVED_SEARCH: typeof constants.SAVED_SEARCH;
  SEARCH_FILTERS: typeof constants.SEARCH_FILTERS;
  OS_NAMES: typeof constants.OS_NAMES;
  SECRET_NAMES: typeof constants.SECRET_NAMES;
  OS_FILTERS: typeof constants.OS_FILTERS;
  WORKLOAD_FILTERS: typeof constants.WORKLOAD_FILTERS;
  PROVIDER_FILTERS: typeof constants.PROVIDER_FILTERS;
  MIGRATION_CONFIG: typeof constants.MIGRATION_CONFIG;
  MEMORY_DENSITY: typeof constants.MEMORY_DENSITY;
  VERSION: typeof constants.VERSION;
  SSH_KEY_PATHS: typeof constants.SSH_KEY_PATHS;
  CHECKUP_NAMES: typeof constants.CHECKUP_NAMES;
  TEST_PHYS_NNCP_NAME: typeof constants.TEST_PHYS_NNCP_NAME;
  ScenarioContextManager: typeof ScenarioContextManager;
  ContextKey: typeof ContextKey;
  TestFileFactory: typeof TestFileFactory;
  SshKeyFactory: typeof SshKeyFactory;
  DataVolumeFactory: typeof DataVolumeFactory;
  InstanceTypeFactory: typeof InstanceTypeFactory;
  MigrationPolicyFactory: typeof MigrationPolicyFactory;
  createMinimalVirtualMachineSnapshotYaml: typeof createMinimalVirtualMachineSnapshotYaml;
  TemplateFactory: typeof TemplateFactory;
  VirtualMachineFactory: typeof VirtualMachineFactory;
  FileUtils: typeof FileUtils;
}

let testUtilsInstance: TestUtils | null = null;

export function getTestUtils(): TestUtils {
  if (!testUtilsInstance) {
    testUtilsInstance = new TestUtils();
  }
  return testUtilsInstance;
}

export function clearTestUtilsCache(): void {
  Object.keys(moduleCache).forEach((key) => delete moduleCache[key]);
  testUtilsInstance = null;
}
