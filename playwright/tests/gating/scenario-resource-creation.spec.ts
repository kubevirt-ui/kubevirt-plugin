import { GATING, GATING_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/gating-fixture';
import { isNativeVmTemplatesEnabled } from '@/utils/feature-flags';
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

    await templatesPage.navigateToTemplatesViaUI();
    await templatesPage.clickCreateTemplate();
    await templatesPage.setCreateTemplateExampleNameInYamlEditor(templateName);
    await templatesPage.clickCreateButtonInModal();
    apiClient.trackResource('Template', templateName, testConfig.testNamespace);

    await expect
      .poll(
        async () => {
          await templatesPage.navigateToTemplatesViaUI();
          await templatesPage.filterTemplatesByName(templateName);
          return templatesPage.isTemplateVisible(templateName);
        },
        {
          message: `Template ${templateName} should be visible after creation`,
          timeout: utils.TestTimeouts.DEFAULT,
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
    await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG] });

    await templatesPage.navigateToTemplatesViaUI();
    await pageCommons.switchProject('All Projects');

    await templatesPage.clickCreateTemplateOption('From an existing template');

    const dialog = await templatesPage.verifyCloneDialogOpen();
    expect.soft(dialog.dialogVisible, 'Clone dialog should be visible').toBe(true);
    expect.soft(dialog.hasSourceProjectSelector, 'Should show source project selector').toBe(true);

    await templatesPage.closeDialog();
  });

  test('Create a template from a virtual machine', async ({
    apiClient,
    vmDetailPage,
    vmTreePage,
    templatesPage,
    testConfig,
    utils,
  }) => {
    test.skip(!(await isNativeVmTemplatesEnabled(apiClient)), 'Native VM templates not enabled');
    await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG] });

    const vmName = utils.generateRandomVmName('save-tpl');
    const ns = testConfig.testNamespace;
    const templateName = utils.generateRandomTemplateName('from-vm');

    await apiClient.createVmFromTemplate('rhel9-server-small', vmName, ns);
    apiClient.trackResource('VirtualMachine', vmName, ns);
    const created = await apiClient.verifyVmCreated(vmName, ns, utils.TestTimeouts.VM_BOOTUP);
    expect(created.exists, `VM ${vmName} should be created`).toBe(true);

    await vmTreePage.navigateToVmViaTreeView(ns, vmName);
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

  test('Create a migration policy via form', async ({
    apiClient,
    migrationPoliciesPage,
    utils,
  }) => {
    await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG] });

    const policyName = utils.generateRandomMigrationPolicyName('gating-mp');

    await migrationPoliciesPage.navigateToMigrationPoliciesViaUI();
    await migrationPoliciesPage.clickCreateAndSelectOption('With form');
    await migrationPoliciesPage.waitForFormToLoad();
    await migrationPoliciesPage.fillPolicyName(policyName);
    await migrationPoliciesPage.clickCreateButton();
    apiClient.trackResource('MigrationPolicy', policyName);

    const created = await apiClient.verifyMigrationPolicyCreated(
      policyName,
      utils.TestTimeouts.MIGRATION_POLICY_VERIFICATION,
    );
    expect(created, `MigrationPolicy ${policyName} should exist after creation`).toBe(true);
  });

  test('Create a cluster instance type via YAML editor', async ({
    apiClient,
    instanceTypesPage,
    utils,
  }) => {
    await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG] });

    const itName = utils.generateRandomInstanceTypeName('gating-it');
    const itYaml = [
      'apiVersion: instancetype.kubevirt.io/v1beta1',
      'kind: VirtualMachineClusterInstancetype',
      'metadata:',
      `  name: ${itName}`,
      '  labels:',
      '    app.kubernetes.io/managed-by: playwright-test',
      'spec:',
      '  cpu:',
      '    guest: 1',
      '  memory:',
      '    guest: 1Gi',
    ].join('\n');

    await instanceTypesPage.navigateToInstanceTypesViaUI();
    await instanceTypesPage.clickCreate();
    await instanceTypesPage.fillYamlEditorAndSave(itYaml);
    apiClient.trackResource('VirtualMachineClusterInstanceType', itName);

    await instanceTypesPage.navigateToInstanceTypesViaUI();
    await instanceTypesPage.filterByName(itName);
    const exists = await instanceTypesPage.verifyInstanceTypeExists(itName);
    expect(exists, `InstanceType ${itName} should be visible in the UI`).toBe(true);
  });

  test('Create a bootable volume via YAML editor', async ({
    bootableVolumesPage,
    apiClient,
    testConfig,
    utils,
  }) => {
    await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG] });

    const dvName = utils.generateRandomDataVolumeName('gating-bv');
    const rawYaml = utils.DataVolumeFactory.create({
      name: dvName,
      defaultPreference: utils.INSTANCE_TYPES.FEDORA,
      source: {
        registry: { url: `docker://${utils.REGISTRY_URLS.FEDORA_LATEST}` },
      },
    });
    const dataVolumeYaml = rawYaml
      .split('\n')
      .filter((line) => !line.match(/^\s+namespace:\s/))
      .join('\n');

    await bootableVolumesPage.navigateToNamespaceBootableVolumesViaUI(testConfig.testNamespace);
    await bootableVolumesPage.clickCreateAndSelectOption('With YAML');
    await bootableVolumesPage.fillYamlEditorAndSave(dataVolumeYaml);
    apiClient.trackResource('DataVolume', dvName, testConfig.testNamespace);

    await bootableVolumesPage.filterByName(dvName);
    const rowVisible = await bootableVolumesPage.verifyDataVolumeRowVisible(
      dvName,
      utils.TestTimeouts.DEFAULT,
    );
    expect(rowVisible, `Bootable volume ${dvName} should be visible in the list`).toBe(true);
  });
});
