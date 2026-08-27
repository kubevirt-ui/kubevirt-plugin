import { load as yamlLoad } from 'js-yaml';

import { ADMIN_ONLY_TAG, T1, T1_TAG, VM_LIST_TAG } from '@/data-models/allure-constants';
import type { KubernetesResource } from '@/data-models/kubernetes-types';
import { expect, test } from '@/fixtures/vm-list-fixture';
import { setupTestNamespace } from '@/utils/test-setup-helpers';

const SUITE = 'VM List CSV Export';

test.describe(SUITE, { tag: [T1_TAG, ADMIN_ONLY_TAG] }, () => {
  let namespace: string;
  let vmName: string;

  test.beforeAll(async ({ apiClient, utils }) => {
    namespace = await setupTestNamespace(apiClient, 'csv-export');
    vmName = utils.generateRandomVmName('csv-vm');

    const yaml = utils.VirtualMachineFactory.create({
      name: vmName,
      namespace,
      runStrategy: 'Halted',
      cpuCores: 1,
      memory: '256Mi',
    });
    const payload = yamlLoad(yaml) as KubernetesResource;
    await apiClient.createVirtualMachine(namespace, payload);
    await apiClient.waitForVmExists(vmName, namespace);
    apiClient.trackResource('VirtualMachine', vmName, namespace);
  });

  test.afterAll(async ({ apiClient }) => {
    if (vmName && namespace) {
      await apiClient.deleteVirtualMachine(namespace, vmName).catch(() => undefined);
      await apiClient.waitForVmDeleted(vmName, namespace).catch(() => undefined);
    }
  });

  test.beforeEach(async ({ vmListPage }) => {
    await vmListPage.navigateToNamespaceVirtualMachinesViaUI(namespace);
    await vmListPage.clickVmListTab();
  });

  test('exports the namespaced VM list as CSV', async ({ vmListPage, utils }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [T1_TAG, VM_LIST_TAG, ADMIN_ONLY_TAG],
    });

    await test.step('Wait until the Halted VM is listed', async () => {
      const visible = await vmListPage.isVmVisibleByDataTest(vmName);
      expect(visible, `VM ${vmName} should be visible in the namespaced list`).toBe(true);
    });

    const downloaded = await test.step('Download the CSV export', async () => {
      return vmListPage.downloadCsvExport();
    });
    expect(downloaded, 'CSV download should complete').toBeDefined();
    const { content, filename } = downloaded;

    await test.step('Assert filename, headers, and VM row', async () => {
      expect(filename, 'CSV filename should end with <namespace>-virtual-machines.csv').toMatch(
        new RegExp(`${namespace}-virtual-machines\\.csv$`),
      );

      const [headerLine, ...dataLines] = content.trimEnd().split('\n');
      const headers = headerLine.split(',');

      expect(headers, 'CSV header should include Name').toContain('Name');
      expect(headers, 'CSV header should not include Actions').not.toContain('Actions');
      expect(
        dataLines.some((line) => line.includes(vmName)),
        `CSV should contain a row for VM ${vmName}`,
      ).toBe(true);
    });
  });
});
