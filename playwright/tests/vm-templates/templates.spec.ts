import { ADMIN_ONLY_TAG, GATING_TAG, T1_TAG, T2_TAG } from '@/data-models/allure-constants';
import { ROUTE_VM_TEMPLATES_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/templates-fixture';
import { CRUD_NAMES, TEMPLATE_RHEL9 } from '@/utils/constants';
import { verifyOpenshiftTemplateCreated } from '@/utils/creation-verification';
import { openshiftTemplateImportYaml } from '@/utils/manifests';
import { generateNameWithBase, generateRandomLabel } from '@/utils/random-data-generator';
import { MINUTE, TestTimeouts } from '@/utils/test-config';

test.describe(`Templates read ${ROUTE_VM_TEMPLATES_TAG} ${GATING_TAG}`, () => {
  test('VirtualMachine Templates list loads with catalog templates', async ({
    templatesPage,
    nav,
    apiClient,
  }) => {
    const name = TEMPLATE_RHEL9.metadataName;
    await expect
      .poll(() => apiClient.openshiftTemplateExists(name, 'openshift'), {
        message: `API should expose catalog template openshift/${name}`,
        timeout: 2 * MINUTE,
      })
      .toBe(true);
    await nav.goToTemplates();
    await templatesPage.waitForListLoaded();
    await templatesPage.filterByName(name);
    await expect(templatesPage.templateGridLink(name)).toBeVisible({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  });
});

test.describe(`Templates gating create from YAML ${ROUTE_VM_TEMPLATES_TAG} ${GATING_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('Create Template with import YAML', async ({ templatesPage, testNamespace, apiClient }) => {
    const name = generateNameWithBase(`${CRUD_NAMES.templateE2e}-gating`, 50);

    await apiClient.deleteOpenshiftTemplate(name, testNamespace);
    await expect
      .poll(() => apiClient.openshiftTemplateExists(name, testNamespace), {
        message: `pre-test cleanup: Template ${testNamespace}/${name} should be absent`,
      })
      .toBe(false);

    try {
      await templatesPage.goToNamespaceList(testNamespace);
      await templatesPage.dismissConsoleObstructions();
      await templatesPage.createFromYaml(
        openshiftTemplateImportYaml({ name, namespace: testNamespace }),
      );
      await expect
        .poll(() => templatesPage.currentUrl())
        .toMatch(templatesPage.pluginTemplateDetailUrlPattern(name));
      await verifyOpenshiftTemplateCreated(apiClient, templatesPage, testNamespace, name);
    } finally {
      await apiClient.deleteOpenshiftTemplate(name, testNamespace);
    }
  });
});

test.describe(`Templates CRUD from YAML ${ROUTE_VM_TEMPLATES_TAG} ${T1_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('Create Template with YAML and delete in UI', async ({
    templatesPage,
    testNamespace,
    apiClient,
  }) => {
    const name = generateNameWithBase(CRUD_NAMES.templateE2e, 50);

    await apiClient.deleteOpenshiftTemplate(name, testNamespace);
    await expect
      .poll(() => apiClient.openshiftTemplateExists(name, testNamespace), {
        message: `pre-test cleanup: Template ${testNamespace}/${name} should be absent`,
      })
      .toBe(false);

    await templatesPage.goToNamespaceList(testNamespace);
    await templatesPage.dismissConsoleObstructions();
    await templatesPage.createFromYaml(
      openshiftTemplateImportYaml({ name, namespace: testNamespace }),
    );

    await expect
      .poll(() => templatesPage.currentUrl())
      .toMatch(templatesPage.pluginTemplateDetailUrlPattern(name));
    await expect(templatesPage.resourceDetailHeading(name)).toBeVisible({
      timeout: TestTimeouts.RESOURCE_CREATION,
    });
    await verifyOpenshiftTemplateCreated(apiClient, templatesPage, testNamespace, name);

    await templatesPage.deleteFromDetail(name);
    await expect
      .poll(() => apiClient.openshiftTemplateExists(name, testNamespace), {
        message: `Template ${testNamespace}/${name} should be deleted`,
        timeout: TestTimeouts.LONG_OPERATION,
      })
      .toBe(false);
  });
});

test.describe(`Templates UI update and delete ${ROUTE_VM_TEMPLATES_TAG} ${T1_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('Update Template labels in UI', async ({ templatesPage, testNamespace, apiClient }) => {
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

  test('Delete Template from list in UI', async ({ templatesPage, testNamespace, apiClient }) => {
    const name = generateNameWithBase(`${CRUD_NAMES.templateE2e}-del`, 50);

    await apiClient.deleteOpenshiftTemplate(name, testNamespace);
    await apiClient.applyOpenshiftTemplate(testNamespace, name);

    await templatesPage.openTemplate(testNamespace, name);
    await templatesPage.deleteFromDetail(name);
    await templatesPage.goToNamespaceList(testNamespace);
    await expect(templatesPage.row(name)).toBeHidden({ timeout: TestTimeouts.LONG_OPERATION });
  });
});

test.describe(`Templates column management ${ROUTE_VM_TEMPLATES_TAG} ${T2_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('ID(CNV-9329) Template list column management opens', async ({ templatesPage, nav }) => {
    await nav.goToTemplates();
    await templatesPage.goToList();
    await templatesPage.openColumnManagement();
    await expect(templatesPage.columnManagementDialogHeading()).toBeVisible();
  });
});
