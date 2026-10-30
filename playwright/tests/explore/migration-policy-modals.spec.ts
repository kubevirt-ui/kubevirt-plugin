/**
 * Manual / playwright-cli companion: documents edit + delete modal DOM.
 * Run: SKIP_GLOBAL_TEARDOWN=true npm run test-playwright-headless -- playwright/tests/explore/migration-policy-modals.spec.ts
 */
import { ADMIN_ONLY_TAG, T1_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/migration-policies-fixture';
import { generateRandomMigrationPolicyName } from '@/utils/random-data-generator';
import { TestTimeouts } from '@/utils/test-config';

test.describe(`MigrationPolicy modal exploration ${T1_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test.describe.configure({ mode: 'serial' });

  test('snapshot MigrationPolicy delete and edit modals', async ({
    apiClient,
    migrationPoliciesPage,
    nav,
    page,
  }) => {
    const name = generateRandomMigrationPolicyName('pw-cli-modal');
    await apiClient.deleteMigrationPolicy(name);
    await apiClient.applyMigrationPolicyExample(name);

    await nav.goToMigrationPolicies();
    await migrationPoliciesPage.goToList();
    await migrationPoliciesPage.dismissConsoleObstructions();
    await migrationPoliciesPage.filterByName(name);
    await expect(migrationPoliciesPage.row(name)).toBeVisible({
      timeout: TestTimeouts.LONG_OPERATION,
    });

    const row = migrationPoliciesPage.row(name);
    const kebab = row
      .locator('[data-test-id="migration-policies-actions"]')
      .getByRole('button')
      .first()
      .or(row.getByRole('gridcell').last().getByRole('button').first());

    // --- Delete confirmation modal (TabModal + ConfirmActionMessage) ---
    await kebab.click();
    await page.locator('[data-test-id="mp-action-delete"]').click();
    const deleteDialog = page
      .locator('#tab-modal, [role="dialog"][aria-modal="true"]')
      .filter({ visible: true })
      .filter({ has: page.getByRole('heading', { name: /Delete/i }) })
      .filter({ has: page.getByRole('button', { name: /^Delete$/i }) })
      .first();
    await expect(deleteDialog).toBeVisible({ timeout: TestTimeouts.ELEMENT_WAIT });
    const deleteSnapshot = {
      hasConfirmNameInput: await deleteDialog
        .locator('#confirm-name, input[name="confirmName"]')
        .count(),
      heading: await deleteDialog.getByRole('heading').first().innerText(),
      saveButton: await deleteDialog.getByRole('button', { name: /^Delete$/i }).count(),
      tabModalId: await deleteDialog.getAttribute('id'),
    };
    console.log('DELETE_MODAL', JSON.stringify(deleteSnapshot, null, 2));
    await deleteDialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(deleteDialog).toBeHidden();

    // --- Edit modal (MigrationPolicyEditModal / TabModal) ---
    await kebab.click();
    const editItem = page.locator('[data-test-id="mp-action-edit"]').getByRole('menuitem');
    await expect(editItem).toBeEnabled({ timeout: TestTimeouts.ELEMENT_WAIT });
    await page.locator('[data-test-id="mp-action-edit"]').click();
    const editDialog = page
      .locator('#tab-modal, [role="dialog"][aria-modal="true"]')
      .filter({ visible: true })
      .filter({ has: page.getByRole('button', { name: 'Save' }) })
      .first();
    await expect(editDialog).toBeVisible({ timeout: TestTimeouts.ELEMENT_WAIT });
    const editSnapshot = {
      heading: await editDialog
        .getByRole('heading')
        .first()
        .innerText()
        .catch(() => ''),
      nameInput: await editDialog
        .locator('input#migration-policy-name, .migration-policy__form-body input[type="text"]')
        .count(),
      saveButton: await editDialog.getByRole('button', { name: 'Save' }).count(),
      tabModalId: await editDialog.getAttribute('id'),
    };
    console.log('EDIT_MODAL', JSON.stringify(editSnapshot, null, 2));
    await editDialog.getByRole('button', { name: 'Cancel' }).click();

    await apiClient.deleteMigrationPolicy(name);
  });
});
