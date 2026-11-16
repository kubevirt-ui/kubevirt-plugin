import { ADMIN_ONLY_TAG, T1_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUAL_MACHINES_DETAIL_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/templates-main-fixture';
import { CRUD_NAMES } from '@/utils/constants';
import { generateNameWithBase } from '@/utils/random-data-generator';
import { TestTimeouts } from '@/utils/test-config';

test.describe(`VM Save as native template ${ROUTE_VIRTUAL_MACHINES_DETAIL_TAG} ${T1_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('Create VirtualMachineTemplate from existing VM via Actions', async ({
    apiClient,
    templatesPage,
    testNamespace,
    vmDetailPage,
  }) => {
    const vmName = generateNameWithBase(`${CRUD_NAMES.vmExample}-sat-gating`, 50);
    const templateName = generateNameWithBase(`${CRUD_NAMES.nativeTemplateE2e}-gating`, 50);

    await apiClient.deleteNativeVirtualMachineTemplate(templateName, testNamespace);
    await apiClient.prepareVirtualMachineForSaveAsTemplate(testNamespace, vmName);

    try {
      await vmDetailPage.openVmAndWaitForDetail(testNamespace, vmName);
      await vmDetailPage.saveAsTemplate(templateName, testNamespace);

      await apiClient.waitForNativeVirtualMachineTemplate(templateName, testNamespace);
      await templatesPage.goToNamespaceList(testNamespace, templateName);
      await expect(templatesPage.templateGridLink(templateName)).toBeVisible({
        timeout: TestTimeouts.RESOURCE_CREATION,
      });
    } finally {
      await apiClient.deleteNativeVirtualMachineTemplate(templateName, testNamespace);
      await apiClient.deleteVirtualMachine(vmName, testNamespace);
    }
  });
});

test.describe(`VM Save as native template ${ROUTE_VIRTUAL_MACHINES_DETAIL_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('Save as template navigates to template detail', async ({
    apiClient,
    testNamespace,
    vmDetailPage,
  }) => {
    const vmName = generateNameWithBase(`${CRUD_NAMES.vmExample}-sat-t1`, 50);
    const templateName = generateNameWithBase(`${CRUD_NAMES.nativeTemplateE2e}-t1`, 50);

    await apiClient.deleteNativeVirtualMachineTemplate(templateName, testNamespace);
    await apiClient.prepareVirtualMachineForSaveAsTemplate(testNamespace, vmName);

    try {
      await vmDetailPage.openVmAndWaitForDetail(testNamespace, vmName);
      await vmDetailPage.saveAsTemplate(templateName, testNamespace);
      // Save as template navigates to the templates list; detail URL is also accepted.
      await expect
        .poll(() => vmDetailPage.currentUrl())
        .toMatch(
          new RegExp(
            `(?:/templates(?:/${templateName})?(?:/|$)|VirtualMachineTemplate/${templateName}|template\\.kubevirt\\.io~v1(?:alpha1|beta1)~VirtualMachineTemplate/${templateName})`,
          ),
        );
      await apiClient.waitForNativeVirtualMachineTemplate(templateName, testNamespace);
    } finally {
      await apiClient.deleteNativeVirtualMachineTemplate(templateName, testNamespace);
      await apiClient.deleteVirtualMachine(vmName, testNamespace);
    }
  });
});
