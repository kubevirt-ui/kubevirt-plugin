import { ADMIN_ONLY_TAG, GATING_TAG, T1_TAG, T2_TAG } from '@/data-models/allure-constants';
import { ROUTE_MIGRATION_POLICIES_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/migration-policies-fixture';
import { CRUD_NAMES } from '@/utils/constants';
import { verifyMigrationPolicyCreated } from '@/utils/creation-verification';
import { migrationPolicyManifest } from '@/utils/manifests';
import {
  generateNameWithBase,
  generateRandomMigrationPolicyName,
} from '@/utils/random-data-generator';
import { TestTimeouts } from '@/utils/test-config';

test.describe(`MigrationPolicies read ${ROUTE_MIGRATION_POLICIES_TAG} ${GATING_TAG}`, () => {
  test('MigrationPolicies list page and create affordance are visible', async ({
    migrationPoliciesPage,
    nav,
  }) => {
    await nav.goToMigrationPolicies();
    await migrationPoliciesPage.goToList();
    await expect(migrationPoliciesPage.createMigrationPolicyButton()).toBeVisible();
  });
});

test.describe(`MigrationPolicies UI create YAML ${ROUTE_MIGRATION_POLICIES_TAG} ${GATING_TAG} ${T2_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('ID(CNV-9384) Create MigrationPolicy from YAML and delete in UI', async ({
    migrationPoliciesPage,
    nav,
    apiClient,
  }) => {
    const name = generateNameWithBase(CRUD_NAMES.migrationPolicyExample, 40);

    await apiClient.deleteMigrationPolicy(name);
    await expect
      .poll(() => apiClient.migrationPolicyExists(name), {
        message: `pre-test cleanup: MigrationPolicy ${name} should be absent`,
      })
      .toBe(false);

    await nav.goToMigrationPolicies();
    await migrationPoliciesPage.goToList();
    await migrationPoliciesPage.dismissConsoleObstructions();
    await migrationPoliciesPage.createFromYaml(migrationPolicyManifest({ name }));
    await verifyMigrationPolicyCreated(apiClient, migrationPoliciesPage, name);

    await nav.goToMigrationPolicies();
    await migrationPoliciesPage.goToList();
    await migrationPoliciesPage.deleteFromList(name);
    await expect
      .poll(() => apiClient.migrationPolicyExists(name), {
        message: `MigrationPolicy ${name} should be deleted`,
        timeout: TestTimeouts.LONG_OPERATION,
      })
      .toBe(false);
  });
});

test.describe(`MigrationPolicies UI update and delete ${ROUTE_MIGRATION_POLICIES_TAG} ${T1_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('ID(CNV-9386) Update MigrationPolicy namespace selector labels', async ({
    migrationPoliciesPage,
    apiClient,
  }) => {
    const name = generateRandomMigrationPolicyName('mp-labels');

    await apiClient.deleteMigrationPolicy(name);
    await apiClient.applyMigrationPolicyExample(name);

    try {
      await migrationPoliciesPage.openDetail(name);
      await migrationPoliciesPage.editNamespaceSelectorLabels('owner=cnv-qe');
      await expect(migrationPoliciesPage.namespaceSelectorOwnerText()).toBeVisible();
    } finally {
      await apiClient.deleteMigrationPolicy(name);
    }
  });

  test('ID(CNV-9388) Delete MigrationPolicy from list in UI', async ({
    migrationPoliciesPage,
    nav,
    apiClient,
  }) => {
    const name = generateRandomMigrationPolicyName('mp-del');

    await apiClient.deleteMigrationPolicy(name);
    await apiClient.applyMigrationPolicyExample(name);

    await nav.goToMigrationPolicies();
    await migrationPoliciesPage.goToList();
    await expect(migrationPoliciesPage.row(name)).toBeVisible();
    await migrationPoliciesPage.deleteFromList(name);
    await expect(migrationPoliciesPage.row(name)).toBeHidden();
  });
});

test.describe(`MigrationPolicies UI create form ${ROUTE_MIGRATION_POLICIES_TAG} ${T2_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('ID(CNV-9385) Create MigrationPolicy with form and delete in UI', async ({
    migrationPoliciesPage,
    nav,
    apiClient,
  }) => {
    const name = generateNameWithBase(CRUD_NAMES.migrationPolicyForm, 40);

    await apiClient.deleteMigrationPolicy(name);

    await nav.goToMigrationPolicies();
    await migrationPoliciesPage.goToList();
    await migrationPoliciesPage.createFromForm(name);
    await verifyMigrationPolicyCreated(apiClient, migrationPoliciesPage, name);
    await nav.goToMigrationPolicies();
    await migrationPoliciesPage.goToList();
    await migrationPoliciesPage.deleteFromList(name);
  });
});

test.describe(`MigrationPolicies UI edit ${ROUTE_MIGRATION_POLICIES_TAG} ${T2_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('ID(CNV-9387) Edit MigrationPolicy from list kebab and save', async ({
    migrationPoliciesPage,
    nav,
    apiClient,
  }) => {
    const name = generateRandomMigrationPolicyName('mp-edit');

    await apiClient.deleteMigrationPolicy(name);
    await apiClient.applyMigrationPolicyExample(name);

    try {
      await nav.goToMigrationPolicies();
      await migrationPoliciesPage.goToList();
      await migrationPoliciesPage.editFromList(name);
      await expect(migrationPoliciesPage.editPolicyModalHeading()).toBeVisible();
      await migrationPoliciesPage.saveEditModal();
      await migrationPoliciesPage.goToList();
      await migrationPoliciesPage.filterByName(name);
      await expect(migrationPoliciesPage.row(name)).toBeVisible();
    } finally {
      await apiClient.deleteMigrationPolicy(name);
    }
  });
});
