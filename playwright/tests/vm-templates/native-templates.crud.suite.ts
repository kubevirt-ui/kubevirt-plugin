import { T1_TAG, T2_TAG } from '@/data-models/allure-constants';
import { ROUTE_VM_TEMPLATES_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/templates-main-fixture';
import { CRUD_NAMES } from '@/utils/constants';
import { isNativeVmTemplatesEnabled } from '@/utils/feature-flags';
import { generateNameWithBase, generateRandomLabel } from '@/utils/random-data-generator';
import { TestTimeouts } from '@/utils/test-config';

test.describe(`Native VirtualMachineTemplate read and update ${ROUTE_VM_TEMPLATES_TAG} ${T1_TAG}`, () => {
  test.beforeEach(async ({ apiClient }) => {
    test.skip(
      !(await isNativeVmTemplatesEnabled(apiClient)),
      'Native VM templates (template.kubevirt.io) not available on this cluster',
    );
  });

  test('Native template detail loads after API create from VM', async ({
    apiClient,
    templatesPage,
    testNamespace,
  }) => {
    const vmName = generateNameWithBase(`${CRUD_NAMES.vmExample}-native-read`, 50);
    const templateName = generateNameWithBase(`${CRUD_NAMES.nativeTemplateE2e}-read`, 50);

    await apiClient.prepareVirtualMachineForSaveAsTemplate(testNamespace, vmName);
    apiClient.trackResource('VirtualMachine', vmName, testNamespace);
    await apiClient.applyNativeVirtualMachineTemplateFromVm(
      testNamespace,
      vmName,
      templateName,
      `E2E ${templateName}`,
    );
    apiClient.trackResource('VirtualMachineTemplate', templateName, testNamespace);
    await apiClient.waitForNativeVirtualMachineTemplate(templateName, testNamespace);

    try {
      await templatesPage.openNativeVirtualMachineTemplate(testNamespace, templateName);
      await expect(
        templatesPage
          .pluginTemplateHeading(templateName)
          .or(templatesPage.resourceTitle().filter({ hasText: templateName }))
          .first(),
      ).toBeVisible({ timeout: TestTimeouts.RESOURCE_CREATION });
    } finally {
      // Non-priv proxy sessions may 403 on VM delete; namespace teardown covers leftovers.
      await apiClient.deleteNativeVirtualMachineTemplate(templateName, testNamespace).catch(() => undefined);
      await apiClient.deleteVirtualMachine(vmName, testNamespace).catch(() => undefined);
    }
  });

  test('Update native template labels in UI', async ({
    apiClient,
    templatesPage,
    testNamespace,
  }) => {
    const vmName = generateNameWithBase(`${CRUD_NAMES.vmExample}-native-lbl`, 50);
    const templateName = generateNameWithBase(`${CRUD_NAMES.nativeTemplateE2e}-lbl`, 50);
    const label = generateRandomLabel('native');

    await apiClient.prepareVirtualMachineForSaveAsTemplate(testNamespace, vmName);
    apiClient.trackResource('VirtualMachine', vmName, testNamespace);
    await apiClient.applyNativeVirtualMachineTemplateFromVm(testNamespace, vmName, templateName);
    apiClient.trackResource('VirtualMachineTemplate', templateName, testNamespace);
    await apiClient.waitForNativeVirtualMachineTemplate(templateName, testNamespace);

    try {
      await templatesPage.openNativeVirtualMachineTemplate(testNamespace, templateName);
      await templatesPage.editLabels(templateName, label);
      await expect(templatesPage.labelOnDetail(label)).toBeVisible();
    } finally {
      await apiClient.deleteNativeVirtualMachineTemplate(templateName, testNamespace).catch(() => undefined);
      await apiClient.deleteVirtualMachine(vmName, testNamespace).catch(() => undefined);
    }
  });
});

test.describe(`Native VirtualMachineTemplate delete ${ROUTE_VM_TEMPLATES_TAG} ${T2_TAG}`, () => {
  test.beforeEach(async ({ apiClient }) => {
    test.skip(
      !(await isNativeVmTemplatesEnabled(apiClient)),
      'Native VM templates (template.kubevirt.io) not available on this cluster',
    );
  });

  test('Delete native template from detail Actions', async ({
    apiClient,
    templatesPage,
    testNamespace,
  }) => {
    const vmName = generateNameWithBase(`${CRUD_NAMES.vmExample}-native-del`, 50);
    const templateName = generateNameWithBase(`${CRUD_NAMES.nativeTemplateE2e}-del`, 50);

    await apiClient.prepareVirtualMachineForSaveAsTemplate(testNamespace, vmName);
    apiClient.trackResource('VirtualMachine', vmName, testNamespace);
    await apiClient.applyNativeVirtualMachineTemplateFromVm(testNamespace, vmName, templateName);
    apiClient.trackResource('VirtualMachineTemplate', templateName, testNamespace);
    await apiClient.waitForNativeVirtualMachineTemplate(templateName, testNamespace);

    await templatesPage.openNativeVirtualMachineTemplate(testNamespace, templateName);
    await templatesPage.deleteFromDetail(templateName);
    await templatesPage.goToNativeTemplateList(testNamespace);
    await expect
      .poll(() => apiClient.nativeVirtualMachineTemplateExists(templateName, testNamespace))
      .toBe(false);
    await expect(templatesPage.row(templateName)).toBeHidden({
      timeout: TestTimeouts.LONG_OPERATION,
    });

    await apiClient.deleteVirtualMachine(vmName, testNamespace).catch(() => undefined);
  });
});
