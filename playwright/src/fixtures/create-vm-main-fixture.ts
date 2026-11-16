/**
 * Create VM test fixture.
 *
 * Provides page objects shared across create-vm specs.
 *
 * Usage:
 *   import { test, expect } from '@/fixtures/create-vm-fixture';
 */

import type RequestContextClient from '@/clients/main-request-context-client';
import CreateVmInstanceTypesPage from '@/page-objects/create-vm/create-vm-instance-types-page';
import type { VmDetailPage } from '@/page-objects/vm-detail-page';
import { VmDetailPage as VmDetailPageClass } from '@/page-objects/vm-detail-page';
import WizardVmNavigationPage from '@/page-objects/vm/wizard-vm-navigation-page';
import VmCreationWizardPage from '@/page-objects/vm-wizard/vm-creation-wizard-page';
import VmWizardBootSourcePage from '@/page-objects/vm-wizard/vm-wizard-boot-source-page';
import VmWizardComputeCustomizationPage from '@/page-objects/vm-wizard/vm-wizard-compute-customization-page';
import VmWizardNavigationPage from '@/page-objects/vm-wizard/vm-wizard-navigation-page';
import { withAllure } from '@/utils/allure';
import { moveFirstDeviceDown, normalizeBootOrder } from '@/utils/boot-order-helpers';
import { waitForVirtualMachineReady, waitForVirtualMachineStopped } from '@/utils/vm-k8s-waits';
import { EnvVariables } from '@/utils/env-variables';
import { TemplateFactory } from '@/data-factories/template-factory';
import {
  generateRandomName,
  generateRandomNadName,
  generateRandomSecretName,
  generateRandomTemplateName,
  generateRandomVmName,
  generateTestNamespace,
} from '@/utils/random-data-generator';
import {
  clearDefaultSSHKey,
  createBridgeNetworkAttachmentDefinition,
  getVmAccessCredentials,
  setProjectNetworkSettings,
  setupDefaultSSHKey,
} from '@/utils/wizard-setup-helpers';
import type { ProjectNetworkSettingsAnnotations } from '@/utils/wizard-setup-helpers';
import { TestTimeouts } from '@/utils/test-config';

import { baseTest, expect } from './main-scenario-test-fixture';

async function setupTestNamespace(client: RequestContextClient, prefix: string): Promise<string> {
  const namespace = generateTestNamespace(prefix);
  await client.ensureNamespace(namespace, EnvVariables.isNonPrivUser);
  client.trackResource('Namespace', namespace);
  return namespace;
}

async function navigateToProjectVmListForNamespace(
  vmListPage: WizardVmNavigationPage,
  namespace: string,
): Promise<void> {
  await vmListPage.navigateToProjectVmListViaUI(namespace);
}

const wizardTestUtils = {
  EnvVariables,
  generateRandomName,
  generateRandomNadName,
  generateRandomSecretName,
  generateRandomTemplateName,
  generateRandomVmName,
  generateTestNamespace,
  moveFirstDeviceDown,
  navigateToProjectVmListForNamespace,
  normalizeBootOrder,
  setupTestNamespace,
  TemplateFactory,
  TestTimeouts,
  waitForVirtualMachineReady,
  waitForVirtualMachineStopped,
  withAllure,
};

interface CreateVmFixtures {
  testConfig: { testNamespace: string };
  utils: typeof wizardTestUtils;
  vmCreationWizardPage: VmCreationWizardPage;
  vmDetailPage: VmDetailPage;
  vmListPage: WizardVmNavigationPage;
  vmTreePage: WizardVmNavigationPage;
  vmWizardNavigationPage: VmWizardNavigationPage;
  vmWizardBootSourcePage: VmWizardBootSourcePage;
  vmWizardComputePage: VmWizardComputeCustomizationPage;
  createVmInstanceTypesPage: CreateVmInstanceTypesPage;
}

const test = baseTest.extend<CreateVmFixtures>({
  utils: async ({}, use) => {
    await use(wizardTestUtils);
  },

  testConfig: async ({ testNamespace }, use) => {
    await use({ testNamespace });
  },

  vmListPage: async ({ page }, use) => {
    await use(new WizardVmNavigationPage(page));
  },
  vmTreePage: async ({ page }, use) => {
    await use(new WizardVmNavigationPage(page));
  },
  vmWizardNavigationPage: async ({ page }, use) => {
    await use(new VmWizardNavigationPage(page));
  },
  vmWizardBootSourcePage: async ({ page }, use) => {
    await use(new VmWizardBootSourcePage(page));
  },
  vmWizardComputePage: async ({ page }, use) => {
    await use(new VmWizardComputeCustomizationPage(page));
  },
  createVmInstanceTypesPage: async ({ page }, use) => {
    await use(new CreateVmInstanceTypesPage(page));
  },
  vmCreationWizardPage: async ({ page }, use) => {
    await use(new VmCreationWizardPage(page));
  },
  vmDetailPage: async ({ page }, use) => {
    await use(new VmDetailPageClass(page));
  },
});

export {
  clearDefaultSSHKey,
  createBridgeNetworkAttachmentDefinition,
  expect,
  getVmAccessCredentials,
  setProjectNetworkSettings,
  setupDefaultSSHKey,
  setupTestNamespace,
  test,
  wizardTestUtils,
};
export type { ProjectNetworkSettingsAnnotations };
