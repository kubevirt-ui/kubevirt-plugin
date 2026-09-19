import { load as yamlLoad } from 'js-yaml';

import { ADMIN_ONLY_TAG, T1, T1_TAG, VM_LIST_TAG } from '@/data-models/allure-constants';
import type { KubernetesCondition, KubernetesResource } from '@/data-models/kubernetes-types';
import { expect, test } from '@/fixtures/vm-list-fixture';
import { setupTestNamespace } from '@/utils/test-setup-helpers';
import { waitForVmPrintableStatus } from '@/utils/vm-search-test-helpers';

const SUITE = 'VM List CSV Export';
const NO_DATA_DASH = '—';

const parseCsv = (content: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  const pushField = (): void => {
    row.push(field);
    field = '';
  };

  const pushRow = (): void => {
    pushField();
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (inQuotes) {
      if (char === '"' && content[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
      continue;
    }
    if (char === ',') {
      pushField();
      continue;
    }
    if (char === '\n') {
      pushRow();
      continue;
    }
    if (char !== '\r') {
      field += char;
    }
  }

  if (inQuotes || field !== '' || row.length > 0) {
    pushRow();
  }

  return rows;
};

const expectedConditionsCsvValue = (vm: KubernetesResource): string => {
  const status = vm.status as
    | { conditions?: KubernetesCondition[]; printableStatus?: string }
    | undefined;
  const conditions = status?.conditions ?? [];
  const isActuallyLiveMigratable =
    status?.printableStatus === 'Running' &&
    conditions.some(
      ({ status: conditionStatus, type }) =>
        type === 'LiveMigratable' && conditionStatus === 'True',
    );

  const filtered = conditions.filter(
    (condition) =>
      (condition.type === 'LiveMigratable' && condition.status === 'True') ||
      (Boolean(condition.reason) &&
        !(condition.type === 'LiveMigratable' && condition.status === 'False')),
  );

  const labels = filtered
    .map((condition) => {
      const conditionStatus =
        condition.type === 'LiveMigratable'
          ? isActuallyLiveMigratable
            ? 'True'
            : 'False'
          : condition.status;
      if (!condition.type || !conditionStatus) {
        return '';
      }
      return `${condition.type}=${conditionStatus}`;
    })
    .filter(Boolean);

  return labels.length === 0 ? NO_DATA_DASH : labels.join(', ');
};

test.describe(SUITE, { tag: [T1_TAG, ADMIN_ONLY_TAG] }, () => {
  let namespace: string;
  let vmName: string;
  let secondVmName: string;

  test.beforeAll(async ({ apiClient, utils }) => {
    namespace = await setupTestNamespace(apiClient, 'csv-export');
    vmName = utils.generateRandomVmName('csv-vm');
    secondVmName = utils.generateRandomVmName('csv-vm');

    for (const name of [vmName, secondVmName]) {
      const yaml = utils.VirtualMachineFactory.create({
        name,
        namespace,
        runStrategy: 'Halted',
        cpuCores: 1,
        memory: '256Mi',
      });
      const payload = yamlLoad(yaml) as KubernetesResource;
      await apiClient.createVirtualMachine(namespace, payload);
      await apiClient.waitForVmExists(name, namespace);
      await waitForVmPrintableStatus(apiClient, namespace, name, 'Stopped');
      apiClient.trackResource('VirtualMachine', name, namespace);
    }
  });

  test.afterAll(async ({ apiClient }) => {
    if (!namespace) {
      return;
    }
    for (const name of [vmName, secondVmName]) {
      if (!name) {
        continue;
      }
      await apiClient.deleteVirtualMachine(namespace, name).catch(() => undefined);
      await apiClient.waitForVmDeleted(name, namespace).catch(() => undefined);
    }
  });

  test.beforeEach(async ({ vmListPage }) => {
    await vmListPage.navigateToNamespaceVirtualMachinesViaUI(namespace);
    await vmListPage.clickVmListTab();
  });

  test('exports the namespaced VM list as CSV', async ({ apiClient, vmListPage, utils }) => {
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

      const [headers, ...dataRows] = parseCsv(content.trimEnd());
      expect(headers, 'CSV header should include Name').toContain('Name');
      expect(headers, 'CSV header should include Conditions').toContain('Conditions');
      expect(headers, 'CSV header should include IP address').toContain('IP address');
      expect(headers, 'CSV header should not include Actions').not.toContain('Actions');

      const nameIndex = headers.indexOf('Name');
      const conditionsIndex = headers.indexOf('Conditions');
      const ipIndex = headers.indexOf('IP address');
      const vmRow = dataRows.find((row) => row[nameIndex] === vmName);
      expect(vmRow, `CSV should contain a row for VM ${vmName}`).toBeDefined();
      if (!vmRow) {
        return;
      }

      const vm = (await apiClient.getVirtualMachine(namespace, vmName)) as KubernetesResource;
      expect(vmRow[nameIndex]).toBe(vmName);
      expect(vmRow[conditionsIndex]).toBe(expectedConditionsCsvValue(vm));
      expect(vmRow[ipIndex]).toBe(NO_DATA_DASH);
    });
  });

  test('exports selected VMs or the full list from the export dropdown', async ({
    vmListPage,
    utils,
  }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [T1_TAG, VM_LIST_TAG, ADMIN_ONLY_TAG],
    });

    await test.step('Wait until both Halted VMs are listed', async () => {
      const firstVisible = await vmListPage.isVmVisibleByDataTest(vmName);
      const secondVisible = await vmListPage.isVmVisibleByDataTest(secondVmName);
      expect(firstVisible, `VM ${vmName} should be visible in the namespaced list`).toBe(true);
      expect(secondVisible, `VM ${secondVmName} should be visible in the namespaced list`).toBe(
        true,
      );
    });

    await test.step('Select one VM', async () => {
      await vmListPage.selectVmByCheckbox(vmName);
    });

    const selectedDownload = await test.step('Export selected VMs', async () => {
      return vmListPage.downloadCsvExport('selected');
    });
    const [selectedHeaders, ...selectedRows] = parseCsv(selectedDownload.content.trimEnd());
    const selectedNameIndex = selectedHeaders.indexOf('Name');
    const selectedNames = selectedRows.map((row) => row[selectedNameIndex]);
    expect(selectedNames, 'Selected export should contain only the checked VM').toEqual([vmName]);

    const allDownload = await test.step('Export all VMs', async () => {
      return vmListPage.downloadCsvExport('all');
    });
    const [allHeaders, ...allRows] = parseCsv(allDownload.content.trimEnd());
    const allNameIndex = allHeaders.indexOf('Name');
    const allNames = allRows.map((row) => row[allNameIndex]);
    expect(allNames, 'All export should contain both VMs').toEqual(
      expect.arrayContaining([vmName, secondVmName]),
    );
    expect(allNames, 'All export should contain exactly the two test VMs').toHaveLength(2);
  });
});
