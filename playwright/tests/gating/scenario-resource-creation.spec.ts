import { GATING, GATING_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/gating-fixture';

const SUITE = 'Resource creation (gating)';

test.describe('Resource creation (gating)', { tag: [GATING_TAG, '@resource-creation'] }, () => {
  test('Create a template via YAML editor', async ({
    k8sClient,
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
    k8sClient.trackResource('Template', templateName, testConfig.testNamespace);

    await templatesPage.navigateToTemplatesViaUI();
    await templatesPage.filterTemplatesByName(templateName);
    const isVisible = await templatesPage.isTemplateVisible(templateName);
    expect(isVisible, `Template ${templateName} should be visible after creation`).toBe(true);
  });

  test('Create a migration policy via form', async ({
    k8sClient,
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
    k8sClient.trackResource('MigrationPolicy', policyName);

    const created = await k8sClient.verifyMigrationPolicyCreated(
      policyName,
      utils.TestTimeouts.MIGRATION_POLICY_VERIFICATION,
    );
    expect(created.exists, `MigrationPolicy ${policyName} should exist after creation`).toBe(true);
  });

  test('Create a cluster instance type via YAML editor', async ({
    k8sClient,
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
    k8sClient.trackResource('VirtualMachineClusterInstanceType', itName);

    await instanceTypesPage.navigateToInstanceTypesViaUI();
    await instanceTypesPage.filterByName(itName);
    const exists = await instanceTypesPage.verifyInstanceTypeExists(itName);
    expect(exists, `InstanceType ${itName} should be visible in the UI`).toBe(true);
  });

  test('Create a bootable volume via YAML editor', async ({
    bootableVolumesPage,
    k8sClient,
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
    k8sClient.trackResource('DataVolume', dvName, testConfig.testNamespace);

    const rowVisible = await bootableVolumesPage.verifyDataVolumeRowVisible(
      dvName,
      utils.TestTimeouts.DEFAULT,
    );
    expect(rowVisible, `Bootable volume ${dvName} should be visible in the list`).toBe(true);
  });
});
