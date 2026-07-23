import { ADMIN_ONLY_TAG, T1, T1_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/migration-policies-fixture';

const SUITE = 'Test Virtualization MigrationPolicies page';

test.describe.serial(
  'Tier1 MigrationPolicy CRUD via UI',
  { tag: [T1_TAG, '@tier1-virt-pages-admin'] },
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

      await expect
        .poll(
          async () => {
            await migrationPoliciesPage.navigateToMigrationPoliciesViaUI();
            return migrationPoliciesPage.isPolicyVisible(bandwidthPolicyName);
          },
          {
            message: `Policy ${bandwidthPolicyName} should appear in the list`,
            timeout: utils.TestTimeouts.DEFAULT,
            intervals: [2000, 3000, 5000],
          },
        )
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
          migrationPoliciesPage.detailContentLocator(/64\s*M/),
          'Bandwidth value should display 64 M (64Mi converted to human-readable)',
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

      await expect
        .poll(
          async () => {
            await migrationPoliciesPage.navigateToMigrationPoliciesViaUI();
            return migrationPoliciesPage.isPolicyVisible(autoConvergePolicyName);
          },
          {
            timeout: 30_000,
            intervals: [2_000],
            message: `Policy ${autoConvergePolicyName} should appear in the list`,
          },
        )
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
