import { T1_TAG } from '@/data-models/allure-constants';
import { ROUTE_VM_TEMPLATES_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/templates-fixture';
import { CRUD_NAMES } from '@/utils/constants';
import { generateNameWithBase, generateRandomLabel } from '@/utils/random-data-generator';
import { TestTimeouts } from '@/utils/test-config';

test.describe(`Templates UI update and delete ${ROUTE_VM_TEMPLATES_TAG} ${T1_TAG}`, () => {
  test('Update Template labels in UI', async ({ apiClient, templatesPage, testNamespace }) => {
    const name = generateNameWithBase(CRUD_NAMES.templateE2e, 50);
    const label = generateRandomLabel('e2e');

    await apiClient.deleteOpenshiftTemplate(name, testNamespace);
    await apiClient.applyOpenshiftTemplate(testNamespace, name);

    try {
      await templatesPage.openTemplate(testNamespace, name);
      await templatesPage.editLabels(name, label);
      await expect(templatesPage.labelOnDetail(label)).toBeVisible();
    } finally {
      await apiClient.deleteOpenshiftTemplate(name, testNamespace);
    }
  });

  test('Delete Template from list in UI', async ({ apiClient, templatesPage, testNamespace }) => {
    const name = generateNameWithBase(`${CRUD_NAMES.templateE2e}-del`, 50);

    await apiClient.deleteOpenshiftTemplate(name, testNamespace);
    await apiClient.applyOpenshiftTemplate(testNamespace, name);
    await expect
      .poll(() => apiClient.openshiftTemplateExists(name, testNamespace), {
        message: `Template ${testNamespace}/${name} should exist after API create`,
        timeout: TestTimeouts.RESOURCE_CREATION,
      })
      .toBe(true);

    try {
      await templatesPage.goToNamespaceList(testNamespace);
      await templatesPage.filterByName(name);
      await expect(templatesPage.templateGridLink(name)).toBeVisible();
      await templatesPage.deleteFromList(name);
      await expect
        .poll(() => apiClient.openshiftTemplateExists(name, testNamespace), {
          message: `Template ${testNamespace}/${name} should be deleted`,
          timeout: TestTimeouts.RESOURCE_CREATION,
        })
        .toBe(false);
    } finally {
      await apiClient.deleteOpenshiftTemplate(name, testNamespace);
    }
  });
});
