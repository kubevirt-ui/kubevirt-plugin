import { ADMIN_ONLY_TAG, T1, T1_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/create-vm-fixture';
import { TEMPLATE_METADATA_NAMES } from '@/utils/template-constants';

const SUITE = 'VM Creation Wizard';

test.describe(
  'VM Creation Wizard — Required field validation',
  { tag: [T1_TAG, '@catalog-wizard', ADMIN_ONLY_TAG] },
  () => {
    test.beforeEach(async ({ vmListPage, vmWizardNavigationPage, testConfig }) => {
      await vmListPage.switchToVirtualizationPerspective();
      await vmListPage.navigateToProjectVmListViaUI(testConfig.testNamespace);
      await vmWizardNavigationPage.openWizardFromCreateDropdown();
    });

    test('Custom configuration — Next is disabled until a Name is provided', async ({
      vmWizardNavigationPage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_SHORT);
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

      const isCustomSelected =
        await vmWizardNavigationPage.verifyCreationMethodCardSelected('newVm');
      expect
        .soft(isCustomSelected, 'Custom configuration should be selected by default')
        .toBe(true);

      const nextDisabledBeforeName = await vmWizardNavigationPage.isNextButtonDisabled();
      expect(nextDisabledBeforeName, 'Next should be disabled without a Name').toBe(true);

      await vmWizardNavigationPage.generateVmName();

      const nextDisabledAfterName = await vmWizardNavigationPage.isNextButtonDisabled();
      expect(nextDisabledAfterName, 'Next should be enabled once a Name is generated').toBe(false);

      await vmWizardNavigationPage.cancelWizard();
    });

    test('Create from Template — Name is required, then a Template selection is required', async ({
      vmWizardNavigationPage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_SHORT);
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

      await vmWizardNavigationPage.selectCreationMethod('fromTemplate');

      const nextDisabledBeforeName = await vmWizardNavigationPage.isNextButtonDisabled();
      expect(nextDisabledBeforeName, 'Next should be disabled without a Name').toBe(true);

      await vmWizardNavigationPage.generateVmName();

      const nextDisabledAfterName = await vmWizardNavigationPage.isNextButtonDisabled();
      expect(nextDisabledAfterName, 'Next should be enabled once a Name is generated').toBe(false);

      await vmWizardNavigationPage.clickNext();

      const catalogVisible = await vmWizardNavigationPage.verifyTemplateCatalogStepVisible();
      expect(catalogVisible, 'Template catalog step should be visible').toBe(true);

      const nextDisabledBeforeTemplate = await vmWizardNavigationPage.isNextButtonDisabled();
      expect(
        nextDisabledBeforeTemplate,
        'Next should be disabled before selecting a template',
      ).toBe(true);

      await vmWizardNavigationPage.selectFirstAvailableTemplate();

      const nextDisabledAfterTemplate = await vmWizardNavigationPage.isNextButtonDisabled();
      expect(nextDisabledAfterTemplate, 'Next should be enabled once a template is selected').toBe(
        false,
      );

      await vmWizardNavigationPage.cancelWizard();
    });

    test('Clone existing VirtualMachine — Name is not required, but a source VM selection is', async ({
      apiClient,
      testConfig,
      vmWizardNavigationPage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_MEDIUM);
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

      const sourceVmName = utils.generateRandomVmName('clone-required');
      await apiClient.createVmFromTemplate(
        TEMPLATE_METADATA_NAMES.RHEL9,
        sourceVmName,
        testConfig.testNamespace,
        'openshift',
        false,
      );
      apiClient.trackResource('VirtualMachine', sourceVmName, testConfig.testNamespace);

      await vmWizardNavigationPage.selectCreationMethod('cloneVm');

      const nextDisabled = await vmWizardNavigationPage.isNextButtonDisabled();
      expect(
        nextDisabled,
        'Next should already be enabled for Clone — Name is not required at this step',
      ).toBe(false);

      await vmWizardNavigationPage.clickNext();

      const sourceStepVisible = await vmWizardNavigationPage.verifyCloneSourceStepVisible();
      expect(sourceStepVisible, 'Source step should be visible').toBe(true);

      const nextDisabledBeforeSource = await vmWizardNavigationPage.isNextButtonDisabled();
      expect(nextDisabledBeforeSource, 'Next should be disabled before selecting a source VM').toBe(
        true,
      );

      await vmWizardNavigationPage.selectFirstAvailableCloneSourceVm();

      const nextDisabledAfterSource = await vmWizardNavigationPage.isNextButtonDisabled();
      expect(nextDisabledAfterSource, 'Next should be enabled once a source VM is selected').toBe(
        false,
      );

      await vmWizardNavigationPage.cancelWizard();
    });
  },
);
