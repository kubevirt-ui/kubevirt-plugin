import { ADMIN_ONLY_TAG, T1, T1_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/gating-fixture';
import { isNativeVmTemplatesEnabled } from '@/utils/feature-flags';

const SUITE = 'Resource creation (tier1)';

test.describe('Resource creation (tier1)', { tag: [T1_TAG, '@resource-creation'] }, () => {
  // Cluster-scoped / admin UI affordances — disabled for non-priv (no create MigrationPolicy / ClusterIT).
  test(
    'Clone a template from an existing template',
    { tag: [ADMIN_ONLY_TAG] },
    async ({ templatesPage, pageCommons, utils }) => {
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG, ADMIN_ONLY_TAG] });

      await templatesPage.navigateToTemplatesViaUI();
      await pageCommons.switchProject('All Projects');

      await templatesPage.clickCreateTemplateOption('From an existing template');

      const dialog = await templatesPage.verifyCloneDialogOpen();
      expect.soft(dialog.dialogVisible, 'Clone dialog should be visible').toBe(true);
      expect
        .soft(dialog.hasSourceProjectSelector, 'Should show source project selector')
        .toBe(true);

      await templatesPage.closeDialog();
    },
  );

  test('"From a virtual machine" navigates to the VM list', async ({ templatesPage, utils }) => {
    await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

    await templatesPage.navigateToTemplatesViaUI();
    await templatesPage.clickCreateTemplateOption('From a virtual machine');

    const result = await templatesPage.verifyNavigatedToVmsPage();
    expect(result.onVmList, 'Should navigate to the VirtualMachines list with tab=vms').toBe(true);
    expect
      .soft(result.toastVisible, 'Should show guidance toast for saving a VM as a template')
      .toBe(true);
  });

  test('Create a template from a virtual machine', async ({
    apiClient,
    vmDetailPage,
    vmTreePage,
    templatesPage,
    testConfig,
    utils,
  }) => {
    test.skip(
      !(await isNativeVmTemplatesEnabled(apiClient)),
      'Native VM templates (template.kubevirt.io) not available on this cluster (requires CNV 4.22+)',
    );
    await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

    const vmName = utils.generateRandomVmName('save-tpl');
    const ns = testConfig.testNamespace;
    const templateName = utils.generateRandomTemplateName('from-vm');

    // Stopped VM avoids the running-VM inconsistency alert in Save as template.
    await apiClient.createVmFromTemplate('rhel9-server-small', vmName, ns, 'openshift', false);
    apiClient.trackResource('VirtualMachine', vmName, ns);
    const created = await apiClient.verifyVmCreated(vmName, ns, utils.TestTimeouts.VM_BOOTUP);
    expect(created.exists, `VM ${vmName} should be created`).toBe(true);

    // Prime the dynamic plugin via the VM list, then open detail (Actions lives on detail).
    await vmTreePage.navigateToVmViaTreeView(ns, vmName);
    const nameVisible = await vmDetailPage.isVmNameVisible(
      vmName,
      utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
    );
    expect(nameVisible, 'VM detail page should show the VM name').toBe(true);

    // Product path: VM detail → Actions dropdown → Save as template.
    await vmDetailPage.saveAsTemplate(templateName, ns);
    apiClient.trackResource('VirtualMachineTemplate', templateName, ns);

    await expect
      .poll(
        async () => {
          for (const version of ['v1beta1', 'v1alpha1'] as const) {
            try {
              const tpl = await apiClient.getResource(
                'template.kubevirt.io',
                version,
                'virtualmachinetemplates',
                templateName,
                ns,
              );
              if (tpl) return true;
            } catch {
              // try next API version
            }
          }
          return false;
        },
        {
          timeout: utils.TestTimeouts.RESOURCE_CREATION,
          message: `VirtualMachineTemplate ${ns}/${templateName} should exist after Save as template`,
        },
      )
      .toBe(true);

    await expect
      .poll(
        async () => {
          await templatesPage.navigateToTemplatesViaUI();
          await templatesPage.filterTemplatesByName(templateName);
          return templatesPage.isTemplateVisible(templateName);
        },
        {
          timeout: utils.TestTimeouts.DEFAULT,
          intervals: [2000, 3000, 5000],
          message: `Template ${templateName} should be visible in the Templates list`,
        },
      )
      .toBe(true);
  });

  test(
    'Create a migration policy via form',
    { tag: [ADMIN_ONLY_TAG] },
    async ({ apiClient, migrationPoliciesPage, utils }) => {
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG, ADMIN_ONLY_TAG] });

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
    },
  );

  test(
    'Create a cluster instance type via YAML editor',
    { tag: [ADMIN_ONLY_TAG] },
    async ({ apiClient, instanceTypesPage, utils }) => {
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG, ADMIN_ONLY_TAG] });

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
    },
  );

  test('Create a bootable volume via YAML editor', async ({
    bootableVolumesPage,
    apiClient,
    testConfig,
    utils,
  }) => {
    await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

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
