/**
 * Slim test-utils aggregator for API contract specs.
 * Only exports symbols referenced by `playwright/tests/api/**`.
 */

import { DataVolumeFactory } from '@/data-factories/data-volume-factory';
import { InstanceTypeFactory } from '@/data-factories/instance-type-factory';
import { MigrationPolicyFactory } from '@/data-factories/migration-policy-factory';
import { TemplateFactory } from '@/data-factories/template-factory';
import { VirtualMachineFactory } from '@/data-factories/virtual-machine-factory';
import { createMinimalVirtualMachineSnapshotYaml } from '@/data-factories/virtual-machine-snapshot-factory';
import { REGISTRY_URLS } from '@/data-models/constants';
import {
  generateRandomDataVolumeName,
  generateRandomFolderName,
  generateRandomInstanceTypeName,
  generateRandomMigrationPolicyName,
  generateRandomName,
  generateRandomSnapshotName,
  generateRandomTemplateName,
  generateRandomVmName,
} from '@/utils/random-data-generator';
import { TestTimeouts } from '@/utils/test-config';

export type TestUtilsType = {
  DataVolumeFactory: typeof DataVolumeFactory;
  InstanceTypeFactory: typeof InstanceTypeFactory;
  MigrationPolicyFactory: typeof MigrationPolicyFactory;
  REGISTRY_URLS: typeof REGISTRY_URLS;
  TemplateFactory: typeof TemplateFactory;
  TestTimeouts: typeof TestTimeouts;
  VirtualMachineFactory: typeof VirtualMachineFactory;
  createMinimalVirtualMachineSnapshotYaml: typeof createMinimalVirtualMachineSnapshotYaml;
  generateRandomDataVolumeName: typeof generateRandomDataVolumeName;
  generateRandomFolderName: typeof generateRandomFolderName;
  generateRandomInstanceTypeName: typeof generateRandomInstanceTypeName;
  generateRandomMigrationPolicyName: typeof generateRandomMigrationPolicyName;
  generateRandomName: typeof generateRandomName;
  generateRandomSnapshotName: typeof generateRandomSnapshotName;
  generateRandomTemplateName: typeof generateRandomTemplateName;
  generateRandomVmName: typeof generateRandomVmName;
};

let cached: TestUtilsType | undefined;

export function getTestUtils(): TestUtilsType {
  if (!cached) {
    cached = {
      DataVolumeFactory,
      InstanceTypeFactory,
      MigrationPolicyFactory,
      REGISTRY_URLS,
      TemplateFactory,
      TestTimeouts,
      VirtualMachineFactory,
      createMinimalVirtualMachineSnapshotYaml,
      generateRandomDataVolumeName,
      generateRandomFolderName,
      generateRandomInstanceTypeName,
      generateRandomMigrationPolicyName,
      generateRandomName,
      generateRandomSnapshotName,
      generateRandomTemplateName,
      generateRandomVmName,
    };
  }
  return cached;
}
