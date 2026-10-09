import { ADMIN_ONLY_TAG, GATING, GATING_TAG, T1, T1_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/migration-policies-fixture';
import { ROUTE_MIGRATION_POLICIES_TAG } from '@/data-models/route-tags';

const GATING_SUITE = 'Virtualization pages';

test.describe('Migration policies page load', { tag: [ROUTE_MIGRATION_POLICIES_TAG, GATING_TAG] }, () => {
  test('Migration Policies page loads', async ({ migrationPoliciesPage, apiClient, utils }) => {
    await utils.withAllure({ suite: GATING_SUITE, feature: GATING, tags: [GATING_TAG] });

    const policies = await apiClient.listMigrationPolicies();
    const existingNames = (policies as { metadata?: { name?: string } }[])
      .map((p) => p.metadata?.name)
      .filter((n): n is string => Boolean(n));

    await migrationPoliciesPage.navigateToMigrationPoliciesViaUI();

    const ok = await migrationPoliciesPage.verifyPageLoaded(existingNames);
    expect.soft(ok, 'Migration policies page should load with list or empty state').toBe(true);
  });
});


const RESOURCE_SUITE = 'Resource creation (gating)';

test.describe('Migration policy create via form', { tag: [ROUTE_MIGRATION_POLICIES_TAG, GATING_TAG, '@resource-creation'] }, () => {
  test('Create a migration policy via form', async ({
    apiClient,
    migrationPoliciesPage,
    utils,
  }) => {
    await utils.withAllure({ suite: RESOURCE_SUITE, feature: GATING, tags: [GATING_TAG] });

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
});


const SUITE = 'Test Virtualization MigrationPolicies page';

test.describe.serial(
  'Tier1 MigrationPolicy CRUD via UI',
  { tag: [ROUTE_MIGRATION_POLICIES_TAG, T1_TAG, '@tier1-virt-pages-admin'] },
  () => {
    let bandwidthPolicyName: string;
    let autoConvergePolicyName: string;

    test.beforeEach(async ({ utils }) => {
      await utils.withAllure({
        suite: SUITE,
        feature: T1,
        tags: [T1_TAG, ADMIN_ONLY_TAG],
      });
    });

    test('Create MigrationPolicy with bandwidth configuration via form', async ({
      apiClient,
      migrationPoliciesPage,
      utils,
    }) => {
      bandwidthPolicyName = utils.generateRandomMigrationPolicyName('bw-form');

      await migrationPoliciesPage.navigateToMigrationPoliciesViaUI();
      await migrationPoliciesPage.clickCreateAndSelectOption('With form');
      await migrationPoliciesPage.waitForFormToLoad();

      await migrationPoliciesPage.fillPolicyName(bandwidthPolicyName);
      await migrationPoliciesPage.fillDescription('Bandwidth policy created via UI');
      await migrationPoliciesPage.selectConfiguration('Bandwidth per migration');
      await migrationPoliciesPage.fillBandwidthPerMigration('64');

      await migrationPoliciesPage.clickCreateButton();
      apiClient.trackResource('MigrationPolicy', bandwidthPolicyName);

      const created = await apiClient.verifyMigrationPolicyCreated(
        bandwidthPolicyName,
        utils.TestTimeouts.DEFAULT,
      );
      expect(created, `MigrationPolicy ${bandwidthPolicyName} should exist after creation`).toBe(
        true,
      );

      await migrationPoliciesPage.navigateToMigrationPoliciesViaUI();
      await migrationPoliciesPage.filterByName(bandwidthPolicyName);
      await expect
        .poll(() => migrationPoliciesPage.isPolicyVisible(bandwidthPolicyName), {
          message: `Policy ${bandwidthPolicyName} should appear in the list`,
          timeout: utils.TestTimeouts.DEFAULT,
          intervals: [2000, 3000, 5000],
        })
        .toBe(true);
    });

    test('Detail page shows bandwidth configuration', async ({ migrationPoliciesPage }) => {
      test.skip(!bandwidthPolicyName, 'Create test must pass first');

      await migrationPoliciesPage.navigateToMigrationPoliciesViaUI();
      await migrationPoliciesPage.navigateToMigrationPolicyDetail(bandwidthPolicyName);

      await expect
        .soft(
          migrationPoliciesPage.detailContentLocator(bandwidthPolicyName),
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
          migrationPoliciesPage.detailContentLocator(/^\s*64\s+MiB\s*$/),
          'Bandwidth value should display 64 MiB (64Mi converted to human-readable)',
        )
        .toBeVisible();
    });

    test('Create second policy with auto-converge and delete it', async ({
      apiClient,
      migrationPoliciesPage,
      page,
      utils,
    }) => {
      autoConvergePolicyName = utils.generateRandomMigrationPolicyName('ac-form');

      await migrationPoliciesPage.navigateToMigrationPoliciesViaUI();
      await migrationPoliciesPage.clickCreateAndSelectOption('With form');
      await migrationPoliciesPage.waitForFormToLoad();

      await migrationPoliciesPage.fillPolicyName(autoConvergePolicyName);
      await migrationPoliciesPage.selectConfiguration('Auto converge');
      await migrationPoliciesPage.setAutoConverge(true);

      await migrationPoliciesPage.clickCreateButton();
      apiClient.trackResource('MigrationPolicy', autoConvergePolicyName);

      const created = await apiClient.verifyMigrationPolicyCreated(
        autoConvergePolicyName,
        utils.TestTimeouts.DEFAULT,
      );
      expect(created, `MigrationPolicy ${autoConvergePolicyName} should exist after creation`).toBe(
        true,
      );

      await migrationPoliciesPage.navigateToMigrationPoliciesViaUI();
      await migrationPoliciesPage.filterByName(autoConvergePolicyName);
      await expect
        .poll(() => migrationPoliciesPage.isPolicyVisible(autoConvergePolicyName), {
          timeout: utils.TestTimeouts.DEFAULT,
          intervals: [2_000],
          message: `Policy ${autoConvergePolicyName} should appear in the list`,
        })
        .toBe(true);

      await test.step('Delete via actions dropdown', async () => {
        await migrationPoliciesPage.navigateToMigrationPolicyDetail(autoConvergePolicyName);
        await migrationPoliciesPage.clickActionsDropdown();
        await migrationPoliciesPage.clickDeleteAction();
        await migrationPoliciesPage.clickSaveButton();
        await page.waitForTimeout(utils.TestTimeouts.RETRY_DELAY);
        await migrationPoliciesPage.waitForPolicyRowDetached(
          autoConvergePolicyName,
          utils.TestTimeouts.MIGRATION_POLICY_VERIFICATION,
        );
      });
    });

    test('Delete bandwidth policy via UI', async ({ migrationPoliciesPage, page, utils }) => {
      test.skip(!bandwidthPolicyName, 'Create test must pass first');

      await migrationPoliciesPage.navigateToMigrationPoliciesViaUI();
      await migrationPoliciesPage.navigateToMigrationPolicyDetail(bandwidthPolicyName);
      await migrationPoliciesPage.clickActionsDropdown();
      await migrationPoliciesPage.clickDeleteAction();
      await migrationPoliciesPage.clickSaveButton();
      await page.waitForTimeout(utils.TestTimeouts.RETRY_DELAY);
      await migrationPoliciesPage.waitForPolicyRowDetached(
        bandwidthPolicyName,
        utils.TestTimeouts.MIGRATION_POLICY_VERIFICATION,
      );
    });
  },
);
