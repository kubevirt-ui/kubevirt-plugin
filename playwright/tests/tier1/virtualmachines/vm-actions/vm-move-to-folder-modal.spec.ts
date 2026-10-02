import { load as yamlLoad } from 'js-yaml';

import { T1, T1_TAG, VM_ACTIONS_TAG } from '@/data-models/allure-constants';
import type { KubernetesResource } from '@/data-models/kubernetes-types';
import { expect, test } from '@/fixtures/vm-actions-fixture';
import { FOLDER_LABEL } from '@/utils/api-builders';

const SUITE = 'Move to group modal';

const GROUP_ALPHA = 'group-alpha';
const GROUP_BETA = 'group-beta';
const GROUP_SORT_A = 'folder-a-sort';
const GROUP_SORT_M = 'folder-m-sort';
const GROUP_SORT_Z = 'folder-z-sort';

const createVmWithFolder = async (
  apiClient: {
    createVirtualMachine: (namespace: string, payload: KubernetesResource) => Promise<unknown>;
    waitForVmExists: (name: string, namespace: string) => Promise<boolean>;
  },
  utils: {
    VirtualMachineFactory: { create: (options: Record<string, unknown>) => string };
    generateRandomVmName: (prefix: string) => string;
  },
  namespace: string,
  folderName?: string,
): Promise<string> => {
  const vmName = utils.generateRandomVmName('move-group');
  const yaml = utils.VirtualMachineFactory.create({
    name: vmName,
    namespace,
    runStrategy: 'Halted',
    cpuCores: 1,
    memory: '256Mi',
  });
  const payload = yamlLoad(yaml) as KubernetesResource;

  if (folderName) {
    payload.metadata = {
      ...(payload.metadata ?? {}),
      labels: {
        ...(payload.metadata?.labels ?? {}),
        [FOLDER_LABEL]: folderName,
      },
    };
  }

  await apiClient.createVirtualMachine(namespace, payload);
  const exists = await apiClient.waitForVmExists(vmName, namespace);
  if (!exists) {
    throw new Error(`VM ${vmName} was not created in ${namespace}`);
  }

  return vmName;
};

test.describe.serial(
  'Tier1 Move to group modal',
  { tag: [T1_TAG, '@tier1-vm-actions', '@CNV-96512'] },
  () => {
    let ns: string;
    let vmInAlpha: string;
    let vmInBeta: string;
    let vmSortA: string;
    let vmSortM: string;
    let vmSortZ: string;
    let vmBulkOne: string;
    let vmBulkTwo: string;
    let newGroupName: string;

    test.beforeAll(async ({ apiClient, utils }) => {
      ns = utils.generateTestNamespace('move-group');
      await apiClient.createNamespace(ns);
      await apiClient.waitForNamespaceReady(ns);
      apiClient.trackResource('Namespace', ns);

      vmInAlpha = await createVmWithFolder(apiClient, utils, ns, GROUP_ALPHA);
      vmInBeta = await createVmWithFolder(apiClient, utils, ns, GROUP_BETA);
      vmSortA = await createVmWithFolder(apiClient, utils, ns, GROUP_SORT_A);
      vmSortM = await createVmWithFolder(apiClient, utils, ns, GROUP_SORT_M);
      vmSortZ = await createVmWithFolder(apiClient, utils, ns, GROUP_SORT_Z);
      vmBulkOne = await createVmWithFolder(apiClient, utils, ns, GROUP_ALPHA);
      vmBulkTwo = await createVmWithFolder(apiClient, utils, ns, GROUP_ALPHA);
      newGroupName = utils.generateRandomFolderName('created-group');

      for (const vmName of [vmInAlpha, vmInBeta, vmSortA, vmSortM, vmSortZ, vmBulkOne, vmBulkTwo]) {
        apiClient.trackResource('VirtualMachine', vmName, ns);
      }
    });

    test.beforeEach(async ({ vmDetailPage }) => {
      await vmDetailPage.navigateToVirtualMachineDetail(vmInAlpha, ns);
    });

    test(
      'preselects current group and disables Save until destination changes',
      { tag: ['@adminOnly'] },
      async ({ vmDetailPage, utils }) => {
        await utils.withAllure({
          suite: SUITE,
          feature: T1,
          tags: [T1_TAG, VM_ACTIONS_TAG, '@CNV-96512'],
        });

        await test.step('Open Move to group modal', async () => {
          await vmDetailPage.performVmAction('move-to-folder');
          await vmDetailPage.moveToFolderModal.waitForModal();
        });

        await test.step('Current group is preselected and Save stays disabled', async () => {
          expect(await vmDetailPage.moveToFolderModal.getSearchInputValue()).toBe(GROUP_ALPHA);
          expect(await vmDetailPage.moveToFolderModal.getModalBodyText()).toContain(GROUP_ALPHA);
          expect(await vmDetailPage.moveToFolderModal.isSaveButtonEnabled()).toBe(false);
        });

        await test.step('Selecting a different group enables Save', async () => {
          await vmDetailPage.moveToFolderModal.fillSearchGroup(GROUP_BETA);
          await vmDetailPage.moveToFolderModal.openDropdown();
          await vmDetailPage.page
            .locator(`#select-typeahead-${GROUP_BETA}`)
            .click({ timeout: utils.TestTimeouts.ELEMENT_WAIT });
          const bodyText = await vmDetailPage.moveToFolderModal.getModalBodyText();
          expect(bodyText).toMatch(/from group/i);
          expect(bodyText).toMatch(/to group/i);
          expect(bodyText).toContain(GROUP_ALPHA);
          expect(bodyText).toContain(GROUP_BETA);
          expect(await vmDetailPage.moveToFolderModal.isSaveButtonEnabled()).toBe(true);
        });

        await vmDetailPage.moveToFolderModal.clickCancel();
      },
    );

    test(
      'creates a new group with Enter and persists the move',
      { tag: ['@adminOnly'] },
      async ({ vmDetailPage, apiClient, utils }) => {
        await utils.withAllure({
          suite: SUITE,
          feature: T1,
          tags: [T1_TAG, VM_ACTIONS_TAG, '@CNV-96512'],
        });

        await test.step('Create a new group with Enter', async () => {
          await vmDetailPage.performVmAction('move-to-folder');
          await vmDetailPage.moveToFolderModal.waitForModal();
          await vmDetailPage.moveToFolderModal.fillSearchGroup(newGroupName);
          await vmDetailPage.moveToFolderModal.pressEnterInSearchGroup();
          expect(await vmDetailPage.moveToFolderModal.getSearchInputValue()).toBe(newGroupName);
          expect(await vmDetailPage.moveToFolderModal.isSaveButtonEnabled()).toBe(true);
        });

        await test.step('Save moves the VM to the new group', async () => {
          await vmDetailPage.moveToFolderModal.clickSave();
          await vmDetailPage.moveToFolderModal.waitForModalHidden();
        });

        await test.step('VM folder label matches the new group', async () => {
          const vm = await apiClient.getVirtualMachine(ns, vmInAlpha);
          expect(vm.metadata?.labels?.[FOLDER_LABEL]).toBe(newGroupName);
        });
      },
    );

    test(
      'lists existing groups alphabetically and blocks oversize names',
      { tag: ['@adminOnly'] },
      async ({ vmDetailPage, utils }) => {
        await utils.withAllure({
          suite: SUITE,
          feature: T1,
          tags: [T1_TAG, VM_ACTIONS_TAG, '@CNV-96512'],
        });

        await test.step('Folder options are sorted alphabetically', async () => {
          await vmDetailPage.performVmAction('move-to-folder');
          await vmDetailPage.moveToFolderModal.waitForModal();
          const optionValues = await vmDetailPage.moveToFolderModal.getVisibleFolderOptionValues();
          const sortedValues = [...optionValues].sort((left, right) => left.localeCompare(right));
          expect(optionValues).toEqual(sortedValues);
          expect(optionValues).toEqual(
            expect.arrayContaining([GROUP_SORT_A, GROUP_SORT_M, GROUP_SORT_Z]),
          );
        });

        await test.step('Oversize group names show validation and keep Save disabled', async () => {
          const oversizeName = 'a'.repeat(64);
          await vmDetailPage.moveToFolderModal.fillSearchGroup(oversizeName);
          await vmDetailPage.moveToFolderModal.openDropdown();
          const validationError = await vmDetailPage.moveToFolderModal.getValidationErrorText();
          expect(validationError).toMatch(/63 bytes or fewer/i);
          expect(await vmDetailPage.moveToFolderModal.isSaveButtonEnabled()).toBe(false);
          await vmDetailPage.moveToFolderModal.clickCancel();
        });
      },
    );

    test(
      'bulk modal preselects shared group and shows it in the summary',
      { tag: ['@adminOnly'] },
      async ({ vmListPage, utils }) => {
        await utils.withAllure({
          suite: SUITE,
          feature: T1,
          tags: [T1_TAG, VM_ACTIONS_TAG, '@CNV-96512'],
        });

        await vmListPage.navigateToNamespaceVmListAndWait(ns);
        await vmListPage.waitForVmRowVisible(vmBulkOne);

        await test.step('Open bulk Move to group modal', async () => {
          await vmListPage.selectVmByCheckbox(vmBulkOne);
          await vmListPage.selectVmByCheckbox(vmBulkTwo);
          await vmListPage.clickVmAction('move-to-folder');
          await vmListPage.moveToFolderModal.waitForModal();
        });

        await test.step('Shared group is shown and preselected', async () => {
          const bodyText = await vmListPage.moveToFolderModal.getModalBodyText();
          expect(bodyText).toContain(GROUP_ALPHA);
          expect(bodyText).toContain(ns);
          expect(bodyText).toMatch(/2 VirtualMachines/i);
          expect(bodyText).not.toMatch(/to group/i);
          expect(await vmListPage.moveToFolderModal.getSearchInputValue()).toBe(GROUP_ALPHA);
          expect(await vmListPage.moveToFolderModal.isSaveButtonEnabled()).toBe(false);
        });

        await vmListPage.moveToFolderModal.clickCancel();
      },
    );
  },
);
