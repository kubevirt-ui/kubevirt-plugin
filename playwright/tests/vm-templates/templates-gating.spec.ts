import { GATING, GATING_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/templates-fixture';
import { isNativeVmTemplatesEnabled } from '@/utils/feature-flags';
import { ROUTE_VM_TEMPLATES_TAG } from '@/data-models/route-tags';

const GATING_SUITE = 'Virtualization pages';
const RESOURCE_SUITE = 'Resource creation (gating)';

test.describe('Templates page load', { tag: [ROUTE_VM_TEMPLATES_TAG, GATING_TAG] }, () => {
  test('Templates page loads with Red Hat templates and expected columns', async ({
    templatesPage,
    pageCommons,
    utils,
  }) => {
    await utils.withAllure({ suite: GATING_SUITE, feature: GATING, tags: [GATING_TAG] });

    await templatesPage.navigateToTemplatesViaUI();
    await pageCommons.switchProject('All Projects');

    await test.step('Red Hat templates are visible', async () => {
      await templatesPage.filterByDefaultTemplates();

      const rhel9Name = utils.TEMPLATE_METADATA_NAMES.RHEL9;
      await expect
        .poll(() => templatesPage.isTemplateVisible(rhel9Name), {
          timeout: 30_000,
          intervals: [2_000],
          message: 'RHEL9 template should be visible after filtering',
        })
        .toBe(true);

      if (!utils.EnvVariables.isS390x) {
        const win10Visible = await templatesPage.isTemplateVisible(
          utils.TEMPLATE_METADATA_NAMES.WIN10,
        );
        expect.soft(win10Visible, 'WIN10 template should be visible').toBe(true);
      }
    });
  });
});

test.describe('Template creation flows', { tag: [ROUTE_VM_TEMPLATES_TAG, GATING_TAG, '@resource-creation'] }, () => {
  test('Create a template via YAML editor', async ({
    apiClient,
    templatesPage,
    testConfig,
    utils,
  }) => {
    await utils.withAllure({ suite: RESOURCE_SUITE, feature: GATING, tags: [GATING_TAG] });

    const templateName = utils.generateRandomTemplateName('gating-yaml-tpl');
    const ns = testConfig.testNamespace;

    await templatesPage.navigateToTemplatesViaUI();
    await templatesPage.switchProject(ns);
    await templatesPage.clickCreateTemplate();
    await templatesPage.setCreateTemplateExampleNameInYamlEditor(templateName, ns);
    await templatesPage.clickCreateButtonInModal();
    apiClient.trackResource('Template', templateName, ns);

    await templatesPage.page.waitForURL((url) => url.pathname.includes(templateName), {
      timeout: utils.TestTimeouts.DEFAULT,
    });

    await expect
      .poll(
        async () => {
          await templatesPage.navigateToTemplatesViaUI();
          await templatesPage.switchProject(ns);
          await templatesPage.filterTemplatesByName(templateName);
          return templatesPage.isTemplateVisible(templateName);
        },
        {
          message: `Template ${templateName} should be visible after creation`,
          timeout: utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
          intervals: [2000, 3000, 5000],
        },
      )
      .toBe(true);
  });

  test('Clone a template from an existing template', async ({
    templatesPage,
    pageCommons,
    utils,
  }) => {
    await utils.withAllure({ suite: RESOURCE_SUITE, feature: GATING, tags: [GATING_TAG] });

    await templatesPage.navigateToTemplatesViaUI();
    await pageCommons.switchProject('All Projects');

    await templatesPage.clickCreateTemplateOption('From an existing template');

    const dialog = await templatesPage.verifyCloneDialogOpen();
    expect.soft(dialog.dialogVisible, 'Clone dialog should be visible').toBe(true);
    expect.soft(dialog.hasSourceProjectSelector, 'Should show source project selector').toBe(true);

    await templatesPage.closeDialog();
  });

  test('"From a virtual machine" navigates to the VM list', async ({ templatesPage, utils }) => {
    await utils.withAllure({ suite: RESOURCE_SUITE, feature: GATING, tags: [GATING_TAG] });

    await templatesPage.navigateToTemplatesViaUI();
    await templatesPage.clickCreateTemplateOption('From a virtual machine');

    const result = await templatesPage.verifyNavigatedToVmsPage();
    expect(result.onVmList, 'Should navigate to the VirtualMachines list with tab=vms').toBe(true);
    expect
      .soft(result.toastVisible, 'Should show guidance toast for saving a VM as a template')
      .toBe(true);
  });

  // Re-enable after hot cluster is upgraded to CNV 4.22+ (requires template.kubevirt.io CRDs).
  test.skip('Create a template from a virtual machine', async ({
    apiClient,
    vmDetailPage,
    vmListPage,
    templatesPage,
    testConfig,
    utils,
  }) => {
    test.skip(!(await isNativeVmTemplatesEnabled(apiClient)), 'Native VM templates not enabled');
    await utils.withAllure({ suite: RESOURCE_SUITE, feature: GATING, tags: [GATING_TAG] });

    const vmName = utils.generateRandomVmName('save-tpl');
    const ns = testConfig.testNamespace;
    const templateName = utils.generateRandomTemplateName('from-vm');

    await apiClient.createVmFromTemplate('rhel9-server-small', vmName, ns);
    apiClient.trackResource('VirtualMachine', vmName, ns);
    const created = await apiClient.verifyVmCreated(vmName, ns, utils.TestTimeouts.VM_BOOTUP);
    expect(created.exists, `VM ${vmName} should be created`).toBe(true);

    await vmListPage.navigateToVmViaTreeView(ns, vmName);
    const nameVisible = await vmDetailPage.isVmNameVisible(
      vmName,
      utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
    );
    expect(nameVisible, 'VM detail page should show the VM name').toBe(true);

    await vmDetailPage.saveAsTemplate(templateName, ns);
    apiClient.trackResource('Template', templateName, ns);

    await templatesPage.navigateToTemplatesViaUI();
    await templatesPage.filterTemplatesByName(templateName);
    const tplVisible = await templatesPage.isTemplateVisible(templateName);
    expect(tplVisible, `Template ${templateName} should be visible after creation`).toBe(true);
  });
});
