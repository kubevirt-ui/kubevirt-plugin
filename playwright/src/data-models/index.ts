export * from './allure-constants';
export * from './constants';
export * from './create-vm-test-fixtures';
export * from './data-volume-test-fixtures';
export * from './instance-type-test-fixtures';
export * from './kubernetes-types';
export * from './migration-policy-test-fixtures';
export * from './request-context-template-test-fixtures';
export * from './template-test-fixtures';
export * from './template-vm-test-fixtures';
export * from './virtual-machine-test-fixtures';

// Re-export all fixtures for convenient access
export {
  ALL_CREATE_VM_SCENARIOS,
  CREATE_VM_CREATION_SCENARIOS,
  CREATE_VM_EXTENDED_SCENARIOS,
  CREATE_VM_SMOKE_SCENARIOS,
} from './create-vm-test-fixtures';
export {
  DATA_VOLUME_COMPREHENSIVE_FIXTURES,
  DATA_VOLUME_CREATION_FIXTURES,
  DATA_VOLUME_EDGE_CASE_FIXTURES,
  DATA_VOLUME_SMOKE_TEST_FIXTURE,
} from './data-volume-test-fixtures';
export {
  ALL_USER_INSTANCE_TYPE_FIXTURES,
  CLUSTER_INSTANCE_TYPE_CREATION_FIXTURES,
  INSTANCE_TYPE_EDGE_CASE_FIXTURES,
  INSTANCE_TYPE_SMOKE_TEST_FIXTURE,
  USER_INSTANCE_TYPE_CREATION_FIXTURES,
} from './instance-type-test-fixtures';
export {
  ALL_MIGRATION_POLICY_FIXTURES,
  MIGRATION_POLICY_CREATION_FIXTURES,
  MIGRATION_POLICY_EDGE_CASE_FIXTURES,
  MIGRATION_POLICY_FORM_EDGE_CASE_FIXTURES,
  MIGRATION_POLICY_FORM_FIXTURES,
  MIGRATION_POLICY_FORM_SMOKE_TEST_FIXTURE,
  MIGRATION_POLICY_SMOKE_TEST_FIXTURE,
} from './migration-policy-test-fixtures';
export {
  REQUEST_CONTEXT_TEMPLATE_FIXTURES,
  REQUEST_CONTEXT_TEMPLATE_SMOKE_TEST_FIXTURE,
} from './request-context-template-test-fixtures';
export {
  TEMPLATE_CREATION_FIXTURES,
  TEMPLATE_OS_FIXTURES,
  TEMPLATE_SMOKE_TEST_FIXTURE,
  TEMPLATE_WORKLOAD_FIXTURES,
} from './template-test-fixtures';
export {
  TEMPLATE_VM_CREATION_FIXTURES,
  TEMPLATE_VM_OS_FIXTURES,
  TEMPLATE_VM_SMOKE_TEST_FIXTURE,
  TEMPLATE_VM_WORKLOAD_FIXTURES,
} from './template-vm-test-fixtures';
export {
  VM_CREATION_FIXTURES,
  VM_NETWORK_FIXTURES,
  VM_OS_FIXTURES,
  VM_SMOKE_TEST_FIXTURE,
  VM_WORKLOAD_FIXTURES,
} from './virtual-machine-test-fixtures';

// Re-export types
export type { CreateVmTestScenario } from './create-vm-test-fixtures';
export type { DataVolumeTestCaseParams } from './data-volume-test-fixtures';
export type { InstanceTypeTestCaseParams } from './instance-type-test-fixtures';
export type { MigrationPolicyTestCaseParams } from './migration-policy-test-fixtures';
export type { RequestContextTemplateTestCaseParams } from './request-context-template-test-fixtures';
export type { TemplateTestCaseParams } from './template-test-fixtures';
export type { TemplateSelectorConfig, TemplateVmTestCaseParams } from './template-vm-test-fixtures';
export type { VmTestCaseParams } from './virtual-machine-test-fixtures';
