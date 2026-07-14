import { load as yamlLoad } from 'js-yaml';

import { ADMIN_ONLY_TAG, T1, T1_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/migration-policies-fixture';

const SUITE = 'Test Virtualization MigrationPolicies page';

test.describe.serial(
  'Tier1 Virt Pages Migration Policies Tests',
  { tag: [T1_TAG, '@tier1-virt-pages-admin'] },
  () => {
    let detailPolicyName: string;
    let deletePolicyName: string;
    let setupError: string | undefined;

    test.beforeAll(async ({ k8sClient, utils }) => {
      try {
        detailPolicyName = utils.generateRandomMigrationPolicyName('bw-detail');
        const detailYaml = utils.MigrationPolicyFactory.create({
          name: detailPolicyName,
          bandwidthPerMigration: '64Mi',
        });
        await k8sClient.createClusterCustomResource(
          'migrations.kubevirt.io',
          'v1alpha1',
          'migrationpolicies',
          yamlLoad(detailYaml) as object,
        );
        k8sClient.trackResource('MigrationPolicy', detailPolicyName);

        const detailCreated = await k8sClient.verifyMigrationPolicyCreated(
          detailPolicyName,
          utils.TestTimeouts.MIGRATION_POLICY_VERIFICATION,
        );
        if (!detailCreated.exists) throw new Error(`Policy ${detailPolicyName} was not created`);

        deletePolicyName = utils.generateRandomMigrationPolicyName('policy-k8s');
        const deleteYaml = utils.MigrationPolicyFactory.create({
          name: deletePolicyName,
          description: 'Test policy created with k8s client',
        });
        await k8sClient.createClusterCustomResource(
          'migrations.kubevirt.io',
          'v1alpha1',
          'migrationpolicies',
          yamlLoad(deleteYaml) as object,
        );
        k8sClient.trackResource('MigrationPolicy', deletePolicyName);

        const deleteCreated = await k8sClient.verifyMigrationPolicyCreated(
          deletePolicyName,
          utils.TestTimeouts.MIGRATION_POLICY_VERIFICATION,
        );
        if (!deleteCreated.exists) throw new Error(`Policy ${deletePolicyName} was not created`);
      } catch (error: unknown) {
        setupError = error instanceof Error ? error.message : String(error);
      }
    });

    test.beforeEach(async ({ migrationPoliciesPage, utils }) => {
      test.skip(!!setupError, `Shared setup failed: ${setupError}`);
      await utils.withAllure({
        suite: SUITE,
        feature: T1,
        tags: [T1_TAG, ADMIN_ONLY_TAG],
      });
      await migrationPoliciesPage.navigateToMigrationPoliciesViaUI();
    });

    test('Migration policy detail page shows bandwidth configuration', async ({
      migrationPoliciesPage,
    }) => {
      await migrationPoliciesPage.navigateToMigrationPolicyDetail(detailPolicyName);

      await expect
        .soft(
          migrationPoliciesPage.detailContentLocator(detailPolicyName),
          'Detail page should show policy name',
        )
        .toBeVisible();

      await expect
        .soft(
          migrationPoliciesPage.detailContentLocator('Bandwidth per migration'),
          'Detail page should show "Bandwidth per migration" label',
        )
        .toBeVisible();

      await expect
        .soft(
          migrationPoliciesPage.detailContentLocator(/64\s*M/),
          'Bandwidth value should display 64 M (64Mi converted to human-readable)',
        )
        .toBeVisible();
    });

    test('MigrationPolicy can be deleted via the UI and is removed from the list', async ({
      k8sClient,
      migrationPoliciesPage,
      page,
      utils,
    }) => {
      await migrationPoliciesPage.navigateToMigrationPolicyDetail(deletePolicyName);
      await migrationPoliciesPage.clickActionsDropdown();
      await migrationPoliciesPage.clickDeleteAction();
      await migrationPoliciesPage.clickSaveButton();
      await page.waitForTimeout(utils.TestTimeouts.RETRY_DELAY);
      await migrationPoliciesPage.waitForPolicyRowDetached(
        deletePolicyName,
        utils.TestTimeouts.MIGRATION_POLICY_VERIFICATION,
      );

      const stillExists = await k8sClient.migrationPolicyExists(deletePolicyName);
      expect.soft(stillExists, `MigrationPolicy ${deletePolicyName} should be deleted`).toBe(false);
    });
  },
);

test.describe.serial(
  'Tier1 MigrationPolicy create via UI form',
  { tag: [T1_TAG, '@tier1-virt-pages-admin'] },
  () => {
    let uiPolicyName: string;

    test.beforeEach(async ({ utils }) => {
      await utils.withAllure({
        suite: SUITE,
        feature: T1,
        tags: [T1_TAG, ADMIN_ONLY_TAG],
      });
    });

    test('Create MigrationPolicy with bandwidth and auto-converge via form', async ({
      k8sClient,
      migrationPoliciesPage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_VM_CREATION);

      uiPolicyName = utils.generateRandomMigrationPolicyName('ui-form');

      await migrationPoliciesPage.navigateToMigrationPoliciesViaUI();
      await migrationPoliciesPage.clickCreateAndSelectOption('With form');
      await migrationPoliciesPage.waitForFormToLoad();

      await migrationPoliciesPage.fillPolicyName(uiPolicyName);
      await migrationPoliciesPage.fillDescription('Created via UI form test');
      await migrationPoliciesPage.selectConfiguration('Bandwidth per migration');
      await migrationPoliciesPage.fillBandwidthPerMigration('128');
      await migrationPoliciesPage.selectConfiguration('Auto converge');
      await migrationPoliciesPage.setAutoConverge(true);

      await migrationPoliciesPage.clickCreateButton();
      k8sClient.trackResource('MigrationPolicy', uiPolicyName);

      const created = await k8sClient.verifyMigrationPolicyCreated(
        uiPolicyName,
        utils.TestTimeouts.MIGRATION_POLICY_VERIFICATION,
      );
      expect
        .soft(created.exists, `MigrationPolicy ${uiPolicyName} should exist after creation`)
        .toBe(true);
    });

    test('Verify UI-created policy detail page and delete', async ({
      k8sClient,
      migrationPoliciesPage,
      page,
      utils,
    }) => {
      test.skip(!uiPolicyName, 'Create test must pass first');

      await migrationPoliciesPage.navigateToMigrationPoliciesViaUI();
      await migrationPoliciesPage.navigateToMigrationPolicyDetail(uiPolicyName);

      await expect
        .soft(
          migrationPoliciesPage.detailContentLocator(uiPolicyName),
          'Detail page should show the UI-created policy name',
        )
        .toBeVisible();

      await expect
        .soft(
          migrationPoliciesPage.detailContentLocator('Bandwidth per migration'),
          'Detail page should show bandwidth configuration',
        )
        .toBeVisible();

      await migrationPoliciesPage.clickActionsDropdown();
      await migrationPoliciesPage.clickDeleteAction();
      await migrationPoliciesPage.clickSaveButton();
      await page.waitForTimeout(utils.TestTimeouts.RETRY_DELAY);
      await migrationPoliciesPage.waitForPolicyRowDetached(
        uiPolicyName,
        utils.TestTimeouts.MIGRATION_POLICY_VERIFICATION,
      );

      const stillExists = await k8sClient.migrationPolicyExists(uiPolicyName);
      expect
        .soft(stillExists, `MigrationPolicy ${uiPolicyName} should be deleted after UI removal`)
        .toBe(false);
    });
  },
);
