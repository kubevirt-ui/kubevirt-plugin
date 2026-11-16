import { GATING_TAG, GATING } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/gating-fixture';
import { buildVmYaml } from '@/utils/vm-yaml-builder';

const SUITE = 'Resource creation (gating)';

test.describe('Resource creation (gating)', { tag: [GATING_TAG, '@resource-creation'] }, () => {
  test('Create a VM via the creation wizard', async ({
    vmTreePage,
    vmCreationWizardPage,
    vmDetailPage,
    apiClient,
    testConfig,
    utils,
  }) => {
    await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG, 'e2e-create'] });

    await vmTreePage.navigateToVirtualMachinesViaUI();
    await vmCreationWizardPage.openWizardFromCreateDropdown();
    await vmCreationWizardPage.selectCreationMethod('newVm');
    await vmCreationWizardPage.ensureVmNameFilled();
    await vmCreationWizardPage.clickNext();

    await vmCreationWizardPage.selectOperatingSystem('otherLinux');
    await vmCreationWizardPage.selectOsType('fedora');
    await vmCreationWizardPage.clickNext();

    await vmCreationWizardPage.selectFirstAvailableBootVolume();
    await vmCreationWizardPage.clickNext();

    await vmCreationWizardPage.selectInstanceTypeSeries('u');
    await vmCreationWizardPage.selectComputeSize('small');
    await vmCreationWizardPage.clickNext();

    await vmCreationWizardPage.clickNext();

    const reviewVisible = await vmCreationWizardPage.verifyReviewStepVisible();
    expect(reviewVisible, 'Review step should be visible').toBe(true);

    const isChecked = await vmCreationWizardPage.isStartAfterCreationChecked();
    if (isChecked) {
      await vmCreationWizardPage.toggleStartAfterCreation();
    }

    await vmCreationWizardPage.clickCreateVm();

    await expect
      .poll(() => vmCreationWizardPage.getCreatedVmNameFromUrl(), {
        intervals: [1_000, 2_000, 3_000],
        message: 'Should redirect to VM detail page after creation',
        timeout: utils.TestTimeouts.UI_ACTION_COMPLETE,
      })
      .toBeTruthy();

    const vmName = await vmCreationWizardPage.getCreatedVmNameFromUrl();
    expect(vmName.length, 'VM name should be parsed from redirected URL').toBeGreaterThan(0);
    apiClient.trackResource('VirtualMachine', vmName, testConfig.testNamespace);

    const nameVisible = await vmDetailPage.isVmNameVisible(
      vmName,
      utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
    );
    expect(nameVisible, 'VM name should be visible on the detail page').toBe(true);
  });

  test('Create a VM via YAML import', async ({
    vmTreePage,
    vmListPage,
    apiClient,
    testConfig,
    utils,
  }) => {
    await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG, 'yaml-create'] });

    const vmName = utils.generateRandomVmName('yaml-vm');
    const vmYaml = buildVmYaml(vmName, testConfig.testNamespace)
      .split('\n')
      .filter((line) => !line.match(/^\s+namespace:\s/))
      .join('\n');
    apiClient.trackResource('VirtualMachine', vmName, testConfig.testNamespace);

    await vmTreePage.navigateToNamespaceVirtualMachinesViaUI(testConfig.testNamespace);

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        await vmListPage.clickCreateAndSelectOption('With YAML');
        await vmListPage.page
          .getByRole('heading', { name: 'Create VirtualMachine', level: 1 })
          .waitFor({ state: 'visible', timeout: utils.TestTimeouts.UI_ELEMENT_VISIBILITY });
        break;
      } catch {
        if (attempt === 2) throw new Error('YAML editor heading not visible after 2 attempts');
        await vmTreePage.navigateToNamespaceVirtualMachinesViaUI(testConfig.testNamespace);
      }
    }

    await vmListPage.fillYamlEditor(vmYaml);
    await vmListPage.page.getByRole('button', { name: 'Create', exact: true }).click();

    await vmListPage.page.waitForURL((url) => url.pathname.includes(vmName), {
      timeout: utils.TestTimeouts.DEFAULT,
    });
    expect(vmListPage.page.url(), 'URL should contain the VM name').toContain(vmName);
  });

  test('Create a template via YAML editor', async ({
    apiClient,
    templatesPage,
    testConfig,
    utils,
  }) => {
    await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG] });

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
});
