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
      await templatesPage.filterByOpenShiftOrDefaultTemplates();

      const rhel9Name = utils.TEMPLATE_METADATA_NAMES.RHEL9;
      await templatesPage.filterTemplatesByName(rhel9Name);
      await expect
        .poll(() => templatesPage.isTemplateVisible(rhel9Name), {
          timeout: 30_000,
          intervals: [2_000],
          message: 'RHEL9 template should be visible after name search',
        })
        .toBe(true);

      if (!utils.EnvVariables.isS390x) {
        const win10Name = utils.TEMPLATE_METADATA_NAMES.WIN10;
        await templatesPage.filterTemplatesByName(win10Name);
        const win10Visible = await templatesPage.isTemplateVisible(win10Name);
        expect.soft(win10Visible, 'WIN10 template should be visible after name search').toBe(true);
      }
    });
  });
});

test.describe(
  'Template creation flows',
  { tag: [ROUTE_VM_TEMPLATES_TAG, GATING_TAG, '@resource-creation'] },
  () => {
    test('Create a template via YAML editor', async ({
      apiClient,
      templatesPage,
      testConfig,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_LONG);
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
      test.setTimeout(utils.TestTimeouts.TEST_MEDIUM);
      await utils.withAllure({ suite: RESOURCE_SUITE, feature: GATING, tags: [GATING_TAG] });

      await templatesPage.navigateToTemplatesViaUI();
      await pageCommons.switchProject('All Projects');

      await templatesPage.clickCreateTemplateOption('From an existing template');

      const dialog = await templatesPage.verifyCloneDialogOpen();
      expect.soft(dialog.dialogVisible, 'Clone dialog should be visible').toBe(true);
      expect
        .soft(dialog.hasSourceProjectSelector, 'Should show source project selector')
        .toBe(true);

      await templatesPage.closeDialog();
    });

    test('"From a virtual machine" navigates to the VM list', async ({ templatesPage, utils }) => {
      await utils.withAllure({ suite: RESOURCE_SUITE, feature: GATING, tags: [GATING_TAG] });

      await templatesPage.navigateToTemplatesViaUI();
      await templatesPage.clickCreateTemplateOption('From a virtual machine');

      const result = await templatesPage.verifyNavigatedToVmsPage();
      expect(result.onVmList, 'Should navigate to the VirtualMachines list with tab=vms').toBe(
        true,
      );
      expect
        .soft(result.toastVisible, 'Should show guidance toast for saving a VM as a template')
        .toBe(true);
    });

    test('Create a template from a virtual machine', async ({
      apiClient,
      vmDetailPage,
      templatesPage,
      testConfig,
      utils,
    }) => {
      test.skip(!(await isNativeVmTemplatesEnabled(apiClient)), 'Native VM templates not enabled');
      test.setTimeout(utils.TestTimeouts.TEST_VM_CREATION);
      await utils.withAllure({ suite: RESOURCE_SUITE, feature: GATING, tags: [GATING_TAG] });

      const vmName = utils.generateRandomVmName('save-tpl');
      const ns = testConfig.testNamespace;
      const templateName = utils.generateRandomTemplateName('from-vm');

      await test.step('Create a halted VM from a Red Hat template', async () => {
        await apiClient.createVmFromTemplate('rhel9-server-small', vmName, ns, 'openshift', false);
        apiClient.trackResource('VirtualMachine', vmName, ns);
        const vmExists = await apiClient.waitForVmExists(vmName, ns);
        expect(vmExists, `VM ${vmName} should exist before saving as template`).toBe(true);
      });

      await test.step('Open VM detail and save as template', async () => {
        await vmDetailPage.navigateToVirtualMachineDetail(vmName, ns);
        await expect
          .poll(() => vmDetailPage.isVmNameVisible(vmName, utils.TestTimeouts.SHORT_WAIT), {
            message: `VM detail page should show ${vmName}`,
            timeout: utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
            intervals: [2_000, 3_000],
          })
          .toBe(true);

        await vmDetailPage.saveAsTemplate(templateName, ns);
        apiClient.trackResource('VirtualMachineTemplate', templateName, ns);
      });

      await test.step('VirtualMachineTemplate exists in the API', async () => {
        await expect
          .poll(
            async () => {
              const template = await apiClient.getResource(
                'template.kubevirt.io',
                'v1beta1',
                'virtualmachinetemplates',
                templateName,
                ns,
              );
              return Boolean(template?.metadata?.name);
            },
            {
              message: `VirtualMachineTemplate ${templateName} should exist in ${ns}`,
              timeout: utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
              intervals: [2_000, 3_000, 5_000],
            },
          )
          .toBe(true);
      });

      await test.step('Template is visible in the project templates list', async () => {
        await expect
          .poll(
            async () => {
              await templatesPage.navigateToProjectTemplates(ns, { preferNativeTemplates: true });
              return templatesPage.isTemplateListedByName(templateName);
            },
            {
              message: `Template ${templateName} should be visible in the list`,
              timeout: utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
              intervals: [2_000, 3_000, 5_000],
            },
          )
          .toBe(true);
      });
    });
  },
);
