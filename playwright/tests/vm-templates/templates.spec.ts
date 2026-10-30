import { ADMIN_ONLY_TAG, GATING_TAG, T2_TAG } from '@/data-models/allure-constants';
import { ROUTE_VM_TEMPLATES_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/templates-fixture';
import { CRUD_NAMES, TEMPLATE_RHEL9 } from '@/utils/constants';
import { openshiftTemplateImportYaml } from '@/utils/manifests';
import { generateNameWithBase } from '@/utils/random-data-generator';
import { MINUTE, TestTimeouts } from '@/utils/test-config';

import './templates.crud.suite';

test.describe(`Templates read ${ROUTE_VM_TEMPLATES_TAG} ${GATING_TAG}`, () => {
  test('VirtualMachine Templates list loads with catalog templates', async ({
    apiClient,
    templatesPage,
  }) => {
    const name = TEMPLATE_RHEL9.metadataName;
    const catalogNamespace = 'openshift';
    await expect
      .poll(() => apiClient.openshiftTemplateExists(name, catalogNamespace), {
        message: `API should expose catalog template ${catalogNamespace}/${name}`,
        timeout: 2 * MINUTE,
      })
      .toBe(true);
    await templatesPage.goToNamespaceList(catalogNamespace, name);
    await expect(templatesPage.templateGridLink(name, TEMPLATE_RHEL9.name)).toBeVisible({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  });
});

test.describe(`Templates gating create from YAML ${ROUTE_VM_TEMPLATES_TAG} ${GATING_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('Create Template with import YAML', async ({ apiClient, templatesPage, testNamespace }) => {
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
        { name, namespace: testNamespace },
      );
      await expect
        .poll(() => templatesPage.currentUrl())
        .toMatch(templatesPage.pluginTemplateDetailUrlPattern(name));
      await expect
        .poll(() => apiClient.openshiftTemplateExists(name, testNamespace), {
          message: `Template ${testNamespace}/${name} should exist`,
          timeout: TestTimeouts.RESOURCE_CREATION,
        })
        .toBe(true);
      await templatesPage.openPluginTemplate(testNamespace, name);
      await expect(templatesPage.pluginTemplateHeading(name)).toBeVisible({
        timeout: TestTimeouts.RESOURCE_CREATION,
      });
    } finally {
      await apiClient.deleteOpenshiftTemplate(name, testNamespace);
    }
  });
});

test.describe(`Templates catalog detail tabs ${ROUTE_VM_TEMPLATES_TAG} ${GATING_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('RHEL9 template Parameters and Scripts tabs load', async ({ templatesPage }) => {
    const name = TEMPLATE_RHEL9.metadataName;
    await templatesPage.openPluginTemplate('openshift', name);
    await expect(templatesPage.commonTemplateAlert()).toBeVisible({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await templatesPage.goToTemplateTab('parameters');
    await expect(templatesPage.templateParametersMarker()).toBeVisible({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await templatesPage.goToTemplateTab('scripts');
    await expect(templatesPage.templateScriptsCloudInitMarker()).toBeVisible({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  });
});

test.describe(`Templates column management ${ROUTE_VM_TEMPLATES_TAG} ${T2_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('ID(CNV-9329) Template list column management opens', async ({ nav, templatesPage }) => {
    await nav.goToTemplates();
    await templatesPage.goToList();
    await templatesPage.openColumnManagement();
    await expect(templatesPage.columnManagementDialogHeading()).toBeVisible();
  });
});
