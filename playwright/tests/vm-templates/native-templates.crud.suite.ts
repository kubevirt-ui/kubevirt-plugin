import { T1_TAG, T2_TAG } from '@/data-models/allure-constants';
import { ROUTE_VM_TEMPLATES_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/templates-fixture';
import { CRUD_NAMES } from '@/utils/constants';
import { generateNameWithBase, generateRandomLabel } from '@/utils/random-data-generator';
import { TestTimeouts } from '@/utils/test-config';

test.describe(`Native VirtualMachineTemplate read and update ${ROUTE_VM_TEMPLATES_TAG} ${T1_TAG}`, () => {
  test('Native template detail loads after API create from VM', async ({
    apiClient,
    templatesPage,
    testNamespace,
  }) => {
    const vmName = generateNameWithBase(`${CRUD_NAMES.vmExample}-native-read`, 50);
    const templateName = generateNameWithBase(`${CRUD_NAMES.nativeTemplateE2e}-read`, 50);

    await apiClient.prepareVirtualMachineForSaveAsTemplate(testNamespace, vmName);
    await apiClient.applyNativeVirtualMachineTemplateFromVm(
      testNamespace,
      vmName,
      templateName,
      `E2E ${templateName}`,
    );

    try {
      await templatesPage.openPluginTemplate(testNamespace, templateName);
      await expect(templatesPage.pluginTemplateHeading(templateName)).toBeVisible({
        timeout: TestTimeouts.RESOURCE_CREATION,
      });
    } finally {
      await apiClient.deleteNativeVirtualMachineTemplate(templateName, testNamespace);
      await apiClient.deleteVirtualMachine(vmName, testNamespace);
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
    await apiClient.applyNativeVirtualMachineTemplateFromVm(testNamespace, vmName, templateName);

    try {
      await templatesPage.openTemplate(testNamespace, templateName);
      await templatesPage.editLabels(templateName, label);
      await expect(templatesPage.labelOnDetail(label)).toBeVisible();
    } finally {
      await apiClient.deleteNativeVirtualMachineTemplate(templateName, testNamespace);
      await apiClient.deleteVirtualMachine(vmName, testNamespace);
    }
  });
});

test.describe(`Native VirtualMachineTemplate delete ${ROUTE_VM_TEMPLATES_TAG} ${T2_TAG}`, () => {
  test('Delete native template from detail Actions', async ({
    apiClient,
    templatesPage,
    testNamespace,
  }) => {
    const vmName = generateNameWithBase(`${CRUD_NAMES.vmExample}-native-del`, 50);
    const templateName = generateNameWithBase(`${CRUD_NAMES.nativeTemplateE2e}-del`, 50);

    await apiClient.prepareVirtualMachineForSaveAsTemplate(testNamespace, vmName);
    await apiClient.applyNativeVirtualMachineTemplateFromVm(testNamespace, vmName, templateName);

    await templatesPage.openTemplate(testNamespace, templateName);
    await templatesPage.deleteFromDetail(templateName);
    await templatesPage.goToNamespaceList(testNamespace);
    await expect
      .poll(() => apiClient.nativeVirtualMachineTemplateExists(templateName, testNamespace))
      .toBe(false);
    await expect(templatesPage.row(templateName)).toBeHidden({
      timeout: TestTimeouts.LONG_OPERATION,
    });

    await apiClient.deleteVirtualMachine(vmName, testNamespace);
  });
});
