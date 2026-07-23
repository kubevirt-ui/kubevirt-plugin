import { T1, T1_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/templates-fixture';
import { setupTemplateFromResource } from '@/utils/template-test-helpers';
import { setupTestNamespace } from '@/utils/test-setup-helpers';

const SUITE = 'Template creation flows';

test.describe.serial('Template creation flows', { tag: [T1_TAG, '@tier1-templates'] }, () => {
  let sharedNs: string;

  test.beforeAll(async ({ apiClient, utils }) => {
    sharedNs = await setupTestNamespace(apiClient, 'tpl-creation');
  });

  test.beforeEach(async ({ utils }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [T1_TAG, '@tier1-templates'],
    });
  });

  test('Save existing VM as a template from the VM detail page', async ({
    apiClient,
    pageCommons,
    vmTreePage,
    vmDetailPage,
    templatesPage,
    utils,
  }) => {
    test.setTimeout(utils.TestTimeouts.TEST_VM_CREATION);

    const vmName = utils.generateRandomVmName('vm-save-tpl');
    const templateName = utils.generateRandomTemplateName('saved-tpl');
    // Spaces in the typeahead input are normalized to '-' on the persisted label.
    const saveAsTemplateCategory = {
      display: 'Operating systems',
      label: 'Operating-systems',
    } as const;
    const editedCategory = 'Databases';
    const finalCategory = 'Security';

    await apiClient.createVmFromTemplate(
      utils.TEMPLATE_METADATA_NAMES.RHEL9,
      vmName,
      sharedNs,
      'openshift',
      false,
    );
    apiClient.trackResource('VirtualMachine', vmName, sharedNs);

    const vmExists = await apiClient.waitForVmExists(vmName, sharedNs);
    expect.soft(vmExists, `VM ${vmName} should exist before saving as template`).toBe(true);

    await vmTreePage.navigateToVmViaTreeView(sharedNs, vmName);
    const isVmVisible = await vmDetailPage.isVmNameVisible(vmName);
    expect.soft(isVmVisible, `VM ${vmName} should be visible on detail page`).toBe(true);

    await vmDetailPage.saveAsTemplate(templateName, sharedNs, {
      category: saveAsTemplateCategory.display,
    });
    apiClient.trackResource('VirtualMachineTemplate', templateName, sharedNs);

    await expect
      .poll(
        async () => {
          const template = await apiClient.getResource(
            'template.kubevirt.io',
            'v1beta1',
            'virtualmachinetemplates',
            templateName,
            sharedNs,
          );
          return template?.metadata?.labels?.['vm.kubevirt.io/category'];
        },
        {
          message: `Template ${templateName} should have category label "${saveAsTemplateCategory.label}"`,
          timeout: utils.TestTimeouts.DEFAULT,
          intervals: [2000, 3000, 5000],
        },
      )
      .toBe(saveAsTemplateCategory.label);

    if (!utils.EnvVariables.onAcm) {
      await pageCommons.switchProject(sharedNs);
    }

    await expect
      .poll(
        async () => {
          await templatesPage.navigateToTemplatesViaUI();
          await templatesPage.filterTemplatesByName(templateName);
          return templatesPage.isTemplateVisible(templateName);
        },
        {
          message: `Template ${templateName} should be visible in the list`,
          timeout: utils.TestTimeouts.DEFAULT,
          intervals: [2000, 3000, 5000],
        },
      )
      .toBe(true);

    await templatesPage.navigateToTemplateDetail(templateName);
    await templatesPage.editCategoryFromDetails(editedCategory);
    await expect
      .poll(() => templatesPage.isCategoryVisibleOnDetails(editedCategory), {
        message: `Template details should show category ${editedCategory}`,
        timeout: utils.TestTimeouts.DEFAULT,
        intervals: [1000, 2000],
      })
      .toBe(true);

    await templatesPage.navigateToTemplatesViaUI();
    await templatesPage.filterTemplatesByName(templateName);
    const categoryInList = await templatesPage.hasCategoryInTemplateRow(
      templateName,
      editedCategory,
    );
    expect.soft(categoryInList, `Template row should show category ${editedCategory}`).toBe(true);

    await templatesPage.navigateToTemplateDetail(templateName);
    await templatesPage.editCategoryFromDetails(finalCategory);
    await expect
      .poll(() => templatesPage.isCategoryVisibleOnDetails(finalCategory), {
        message: `Template details should show updated category ${finalCategory}`,
        timeout: utils.TestTimeouts.DEFAULT,
        intervals: [1000, 2000],
      })
      .toBe(true);
  });

  test('Clone a template via the kebab menu', async ({
    apiClient,
    pageCommons,
    templatesPage,
    utils,
  }) => {
    const { templateName: sourceName } = await setupTemplateFromResource(
      apiClient,
      'clone-src',
      {
        targetNamespace: sharedNs,
        displayName: 'Clone Source Template',
        description: 'Template to be cloned',
      },
      utils,
    );

    if (!utils.EnvVariables.onAcm) {
      await pageCommons.switchProject(sharedNs);
    }

    await templatesPage.navigateToTemplatesViaUI();
    await templatesPage.filterTemplatesByName(sourceName);
    const sourceVisible = await templatesPage.isTemplateVisible(sourceName);
    expect.soft(sourceVisible, `Source template ${sourceName} should be visible`).toBe(true);

    const cloneName = utils.generateRandomTemplateName('cloned-tpl');
    await templatesPage.clickCloneTemplate(sourceName);
    await templatesPage.fillCloneTemplateModal(cloneName);
    await templatesPage.clickFooterSaveButton();
    apiClient.trackResource('Template', cloneName, sharedNs);

    await expect
      .poll(
        async () => {
          await templatesPage.navigateToTemplatesViaUI();
          await templatesPage.filterTemplatesByName(cloneName);
          return templatesPage.isTemplateVisible(cloneName);
        },
        {
          message: `Cloned template ${cloneName} should be visible in the list`,
          timeout: utils.TestTimeouts.DEFAULT,
          intervals: [2_000, 3_000, 5_000],
        },
      )
      .toBe(true);
  });

  test('Create a template using the YAML editor', async ({
    apiClient,
    pageCommons,
    templatesPage,
    utils,
  }) => {
    if (!utils.EnvVariables.onAcm) {
      await pageCommons.switchProject(sharedNs);
    }

    const templateName = utils.generateRandomTemplateName('yaml-tpl');
    await templatesPage.navigateToTemplatesViaUI();
    await templatesPage.clickCreateTemplate();

    await templatesPage.setCreateTemplateExampleNameInYamlEditor(templateName);
    await templatesPage.clickCreateButtonInModal();
    apiClient.trackResource('Template', templateName, sharedNs);

    await templatesPage.navigateToTemplatesViaUI();
    await templatesPage.filterTemplatesByName(templateName);
    const isVisible = await templatesPage.isTemplateVisible(templateName);
    expect
      .soft(isVisible, `Template ${templateName} should be visible after YAML creation`)
      .toBe(true);
  });

  test('Delete a template via the UI', async ({ apiClient, pageCommons, templatesPage, utils }) => {
    const { templateName } = await setupTemplateFromResource(
      apiClient,
      'del-tpl',
      {
        targetNamespace: sharedNs,
        displayName: 'Template to delete',
        description: 'Will be deleted via UI',
      },
      utils,
    );

    if (!utils.EnvVariables.onAcm) {
      await pageCommons.switchProject(sharedNs);
    }

    await templatesPage.navigateToTemplatesViaUI();
    await templatesPage.filterTemplatesByName(templateName);
    const isVisible = await templatesPage.isTemplateVisible(templateName);
    expect.soft(isVisible, `Template ${templateName} should be visible before deletion`).toBe(true);

    await templatesPage.deleteTemplateFromList(templateName);
    await templatesPage.waitForTemplateRowDetached(templateName);

    const isStillVisible = await templatesPage.isTemplateVisible(templateName);
    expect
      .soft(isStillVisible, `Template ${templateName} should no longer be visible after deletion`)
      .toBe(false);
  });
});
