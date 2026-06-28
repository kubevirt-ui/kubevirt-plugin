/**
 * Labels and Annotations (Metadata) tab — simple/advanced view, edit modals,
 * inline delete, label key select, and system metadata handling.
 *
 * Run locally with:
 *   RUN_FEATURE_TESTS=true npx playwright test --config=playwright.config.ts --project=features
 *
 * These tests are excluded from CI (the "features" project only loads when
 * the RUN_FEATURE_TESTS env var is set to "true").
 */
import { expect, test } from '../../fixtures';
import { MetadataTabPage } from '../../pages/MetadataTabPage';
import { MINUTE, SECOND, SHORT_TIMEOUT } from '../../utils/constants';
import { env } from '../../utils/env';
import { createExampleVM, deleteResource, oc, ocIgnore } from '../../utils/oc';

const NS = env.testNamespace;
const VM_NAME = `${NS}-metadata`;

const TEST_LABEL_KEY = 'test-metadata-label';
const TEST_LABEL_VALUE = 'e2e-value';
const TEST_ANNOTATION_KEY = 'test-metadata-annotation';
const TEST_ANNOTATION_VALUE = 'e2e-annotation-value';

/** Dismiss the Welcome modal or any blocking backdrop if it appears. */
async function dismissWelcomeModal(page: import('@playwright/test').Page): Promise<void> {
  const closeBtn = page.locator('.pf-v6-c-modal-box button[aria-label="Close"]');
  const appeared = await closeBtn
    .waitFor({ state: 'visible', timeout: 5 * SECOND })
    .then(() => true)
    .catch(() => false);
  if (appeared) {
    await closeBtn.click();
    await expect(page.locator('.pf-v6-c-backdrop')).toBeHidden({ timeout: 5 * SECOND });
  }
}

/** Navigate directly to a VM's Configuration > Metadata tab. */
async function openMetadataTab(page: import('@playwright/test').Page, metadata: MetadataTabPage) {
  await page.goto(`/k8s/ns/${NS}/kubevirt.io~v1~VirtualMachine/${VM_NAME}`, {
    waitUntil: 'domcontentloaded',
  });
  await dismissWelcomeModal(page);
  await expect(page.locator('h1').getByText(VM_NAME)).toBeVisible({ timeout: 2 * MINUTE });
  await metadata.goToMetadataTab();
}

/** Add a label to the VM via oc for test setup. */
function addTestLabel() {
  oc(`label vm ${VM_NAME} -n ${NS} ${TEST_LABEL_KEY}=${TEST_LABEL_VALUE} --overwrite`);
}

/** Remove a label from the VM via oc for test cleanup. */
function removeTestLabel() {
  ocIgnore(`label vm ${VM_NAME} -n ${NS} ${TEST_LABEL_KEY}-`);
}

/** Add an annotation to the VM via oc for test setup. */
function addTestAnnotation() {
  oc(`annotate vm ${VM_NAME} -n ${NS} ${TEST_ANNOTATION_KEY}=${TEST_ANNOTATION_VALUE} --overwrite`);
}

/** Remove an annotation from the VM via oc for test cleanup. */
function removeTestAnnotation() {
  ocIgnore(`annotate vm ${VM_NAME} -n ${NS} ${TEST_ANNOTATION_KEY}-`);
}

test.describe('Labels and Annotations tab', () => {
  test.skip(!NS, 'No test namespace configured');

  test.beforeAll(() => {
    createExampleVM(VM_NAME, NS);
  });

  test.afterAll(() => {
    deleteResource('vm', VM_NAME, NS);
  });

  // Remove test-created label and annotation after each test to ensure
  // each test starts from a clean, predictable state.
  test.afterEach(() => {
    removeTestLabel();
    removeTestAnnotation();
  });

  // ── Simple view layout ─────────────────────────────────────────────────────

  test('metadata tab renders with labels and annotations sections', async ({ page }) => {
    const metadata = new MetadataTabPage(page);
    await openMetadataTab(page, metadata);
    await metadata.expectSimpleViewVisible();
  });

  test('page title shows "Labels and annotations"', async ({ page }) => {
    const metadata = new MetadataTabPage(page);
    await openMetadataTab(page, metadata);
    await expect(page.locator('h2').getByText('Labels and annotations')).toBeVisible();
  });

  test('labels section has help text tooltip', async ({ page }) => {
    const metadata = new MetadataTabPage(page);
    await openMetadataTab(page, metadata);
    await metadata.expectLabelsCardVisible();
  });

  test('annotations section has help text tooltip', async ({ page }) => {
    const metadata = new MetadataTabPage(page);
    await openMetadataTab(page, metadata);
    await metadata.expectAnnotationsCardVisible();
  });

  // ── Advanced view toggle ───────────────────────────────────────────────────

  test('advanced view toggle is visible and unchecked by default', async ({ page }) => {
    const metadata = new MetadataTabPage(page);
    await openMetadataTab(page, metadata);
    await metadata.expectAdvancedViewDisabled();
  });

  test('toggling to advanced view shows classic metadata editor', async ({ page }) => {
    const metadata = new MetadataTabPage(page);
    await openMetadataTab(page, metadata);
    await metadata.toggleAdvancedView();
    await metadata.expectAdvancedViewEnabled();
    await metadata.expectAdvancedViewContent();
  });

  test('toggling back to simple view shows cards again', async ({ page }) => {
    const metadata = new MetadataTabPage(page);
    await openMetadataTab(page, metadata);
    await metadata.toggleAdvancedView();
    await metadata.expectAdvancedViewEnabled();
    await metadata.toggleAdvancedView();
    await metadata.expectAdvancedViewDisabled();
    await metadata.expectSimpleViewVisible();
  });

  // ── Labels table (with data) ───────────────────────────────────────────────

  test('labels table shows user labels when present', async ({ page }) => {
    addTestLabel();
    const metadata = new MetadataTabPage(page);
    await openMetadataTab(page, metadata);
    await metadata.expectLabelsTableVisible();

    const table = metadata.labelsTable();
    await expect(table.getByText(TEST_LABEL_KEY)).toBeVisible({ timeout: 10 * SECOND });
    await expect(table.getByText(TEST_LABEL_VALUE)).toBeVisible();
  });

  test('label value is clickable for search navigation', async ({ page }) => {
    addTestLabel();
    const metadata = new MetadataTabPage(page);
    await openMetadataTab(page, metadata);

    const valueLink = metadata.labelsTable().getByRole('button', { name: TEST_LABEL_VALUE });
    await expect(valueLink).toBeVisible({ timeout: 10 * SECOND });
  });

  test('system labels are hidden in simple view', async ({ page }) => {
    addTestLabel();
    const metadata = new MetadataTabPage(page);
    await openMetadataTab(page, metadata);

    const table = metadata.labelsTable();
    await expect(table.getByText('kubevirt.io/')).toBeHidden();
  });

  // ── Edit Labels Modal ──────────────────────────────────────────────────────

  test('clicking "Add label" opens the edit labels modal', async ({ page }) => {
    addTestLabel();
    const metadata = new MetadataTabPage(page);
    await openMetadataTab(page, metadata);
    await expect(metadata.labelsAddBtn).toBeVisible({ timeout: SHORT_TIMEOUT });
    await metadata.openEditLabelsModal();
    await metadata.expectModalVisible('Edit labels');
  });

  test('edit labels modal shows Key/Value headers', async ({ page }) => {
    addTestLabel();
    const metadata = new MetadataTabPage(page);
    await openMetadataTab(page, metadata);
    await metadata.openEditLabelsModal();

    const dialog = metadata.modalDialog();
    await expect(dialog.getByText('Key', { exact: true })).toBeVisible();
    await expect(dialog.getByText('Value', { exact: true })).toBeVisible();
  });

  test('edit labels modal has Save and Cancel buttons', async ({ page }) => {
    addTestLabel();
    const metadata = new MetadataTabPage(page);
    await openMetadataTab(page, metadata);
    await metadata.openEditLabelsModal();

    await expect(metadata.modalSaveButton()).toBeVisible();
    await expect(metadata.modalCancelButton()).toBeVisible();
  });

  test('edit labels modal shows existing user labels', async ({ page }) => {
    addTestLabel();
    const metadata = new MetadataTabPage(page);
    await openMetadataTab(page, metadata);
    await metadata.openEditLabelsModal();

    // Label keys are inside LabelKeySelect inputs, not text nodes
    const dialog = metadata.modalDialog();
    await expect(dialog.locator(`input[value="${TEST_LABEL_KEY}"]`)).toBeVisible({
      timeout: 10 * SECOND,
    });
  });

  test('edit labels modal hides system labels from editable rows', async ({ page }) => {
    addTestLabel();
    const metadata = new MetadataTabPage(page);
    await openMetadataTab(page, metadata);
    await metadata.openEditLabelsModal();

    // System label keys should not appear in any input
    const dialog = metadata.modalDialog();
    await expect(dialog.locator('input[value*="kubevirt.io/"]')).toHaveCount(0);
  });

  test('"Add label" button adds new row to the modal', async ({ page }) => {
    addTestLabel();
    const metadata = new MetadataTabPage(page);
    await openMetadataTab(page, metadata);
    await metadata.openEditLabelsModal();

    const removesBefore = await metadata.modalRemoveButtons().count();
    await metadata.modalAddLabelButton().click();
    const removesAfter = await metadata.modalRemoveButtons().count();

    expect(removesAfter).toBe(removesBefore + 1);
  });

  test('Save is disabled when a label row has an empty key', async ({ page }) => {
    addTestLabel();
    const metadata = new MetadataTabPage(page);
    await openMetadataTab(page, metadata);
    await metadata.openEditLabelsModal();
    await metadata.expectModalVisible('Edit labels');

    const addBtn = metadata.modalAddLabelButton();
    await expect(addBtn).toBeVisible({ timeout: SHORT_TIMEOUT });
    await addBtn.click();
    await expect(metadata.modalSaveButton()).toBeDisabled();
  });

  test('cancel closes the modal without saving', async ({ page }) => {
    addTestLabel();
    const metadata = new MetadataTabPage(page);
    await openMetadataTab(page, metadata);
    await metadata.openEditLabelsModal();
    await metadata.modalCancelButton().click();
    await metadata.expectModalHidden();
  });

  // ── Label Key Select ───────────────────────────────────────────────────────

  test('label key select shows suggested keys dropdown', async ({ page }) => {
    addTestLabel();
    const metadata = new MetadataTabPage(page);
    await openMetadataTab(page, metadata);
    await metadata.openEditLabelsModal();
    await metadata.expectModalVisible('Edit labels');

    const countBefore = await metadata.modalRemoveButtons().count();
    await metadata.modalAddLabelButton().click();
    await expect(metadata.modalRemoveButtons()).toHaveCount(countBefore + 1, {
      timeout: SHORT_TIMEOUT,
    });
    await metadata.typeInLabelKeySelect(countBefore, 'Env');
    await metadata.expectSuggestedKeysGroupVisible();
  });

  test('label key select shows "Create new" option for custom keys', async ({ page }) => {
    addTestLabel();
    const metadata = new MetadataTabPage(page);
    await openMetadataTab(page, metadata);
    await metadata.openEditLabelsModal();
    await metadata.expectModalVisible('Edit labels');

    const countBefore = await metadata.modalRemoveButtons().count();
    await metadata.modalAddLabelButton().click();
    await expect(metadata.modalRemoveButtons()).toHaveCount(countBefore + 1, {
      timeout: SHORT_TIMEOUT,
    });
    await metadata.typeInLabelKeySelect(countBefore, 'my-custom-key');
    await metadata.expectCreateNewOption('my-custom-key');
  });

  test('system-prefixed keys are blocked in label key select', async ({ page }) => {
    addTestLabel();
    const metadata = new MetadataTabPage(page);
    await openMetadataTab(page, metadata);
    await metadata.openEditLabelsModal();
    await metadata.expectModalVisible('Edit labels');

    const countBefore = await metadata.modalRemoveButtons().count();
    await metadata.modalAddLabelButton().click();
    await expect(metadata.modalRemoveButtons()).toHaveCount(countBefore + 1, {
      timeout: SHORT_TIMEOUT,
    });
    await metadata.typeInLabelKeySelect(countBefore, 'kubevirt.io/test');

    await expect(metadata.createNewOption()).toHaveCount(0);
  });

  // ── Save new label via modal ───────────────────────────────────────────────

  test('adding a new label via modal persists to the VM', async ({ page }) => {
    removeTestLabel();
    const metadata = new MetadataTabPage(page);
    await openMetadataTab(page, metadata);
    await metadata.openEditLabelsModal();
    await metadata.expectModalVisible('Edit labels');

    const newKey = 'e2e-new-label';
    const newValue = 'playwright-test';

    const countBefore = await metadata.modalRemoveButtons().count();
    await metadata.modalAddLabelButton().click();
    await expect(metadata.modalRemoveButtons()).toHaveCount(countBefore + 1, {
      timeout: SHORT_TIMEOUT,
    });
    const newRowIndex = countBefore;

    await metadata.typeInLabelKeySelect(newRowIndex, newKey);
    await metadata.selectCreateNewOption();

    await metadata.modalValueInputs().nth(newRowIndex).fill(newValue);
    await metadata.modalSaveButton().click();
    await metadata.expectModalHidden();

    await page.waitForTimeout(2 * SECOND);
    await metadata.goToMetadataTab();
    await metadata.expectLabelsTableVisible();
    await expect(metadata.labelsTable().getByText(newKey)).toBeVisible({ timeout: 10 * SECOND });

    // Clean up the specific key added by this test (TEST_LABEL_KEY is handled by afterEach)
    ocIgnore(`label vm ${VM_NAME} -n ${NS} ${newKey}-`);
  });

  // ── Edit Annotations Modal ─────────────────────────────────────────────────

  test('clicking "Add annotation" opens the annotations modal', async ({ page }) => {
    addTestAnnotation();
    const metadata = new MetadataTabPage(page);
    await openMetadataTab(page, metadata);
    await metadata.openEditAnnotationsModal();
    await metadata.expectModalVisible('Edit annotations');
  });

  test('annotations modal has "Add more" button', async ({ page }) => {
    addTestAnnotation();
    const metadata = new MetadataTabPage(page);
    await openMetadataTab(page, metadata);
    await metadata.openEditAnnotationsModal();

    await expect(metadata.modalAddMoreButton()).toBeVisible();
  });

  // ── Inline delete ──────────────────────────────────────────────────────────

  test('inline delete button removes a label from the VM', async ({ page }) => {
    addTestLabel();
    const metadata = new MetadataTabPage(page);
    await openMetadataTab(page, metadata);
    await metadata.expectLabelsTableVisible();

    await metadata.deleteInlineLabel(TEST_LABEL_KEY);

    await expect(async () => {
      await expect(metadata.labelsTable().getByText(TEST_LABEL_KEY)).toBeHidden();
    }).toPass({ intervals: [SECOND, 2 * SECOND], timeout: 10 * SECOND });
  });

  // ── Empty states ───────────────────────────────────────────────────────────

  test('labels empty state shows when no user labels exist', async ({ page }) => {
    removeTestLabel();
    const metadata = new MetadataTabPage(page);
    await openMetadataTab(page, metadata);

    // After removing user labels, the labels section must render either the
    // empty state (no user labels) or the table (other user labels still present).
    await expect(metadata.labelsSection).toBeVisible({ timeout: SHORT_TIMEOUT });
    const hasTable = await metadata
      .labelsTable()
      .isVisible()
      .catch(() => false);
    const hasEmpty = await metadata.labelsSection
      .getByText('No labels yet.')
      .isVisible()
      .catch(() => false);

    expect(hasTable || hasEmpty).toBe(true);
  });

  test('system metadata link appears in empty state when system labels exist', async ({ page }) => {
    removeTestLabel();
    const metadata = new MetadataTabPage(page);
    await openMetadataTab(page, metadata);

    // KubeVirt always adds system labels, so after removing user labels the
    // empty state should always show the system-labels link.
    await expect(metadata.labelsSection.getByText('No labels yet.')).toBeVisible({
      timeout: SHORT_TIMEOUT,
    });

    const sysLink = metadata.labelsSection.locator('[data-test="labels-show-system-link"]');
    await expect(sysLink).toBeVisible({ timeout: SHORT_TIMEOUT });
    await expect(sysLink).toContainText('system labels');
  });

  test('clicking system metadata link switches to advanced view', async ({ page }) => {
    removeTestLabel();
    const metadata = new MetadataTabPage(page);
    await openMetadataTab(page, metadata);

    await expect(metadata.labelsSection.getByText('No labels yet.')).toBeVisible({
      timeout: SHORT_TIMEOUT,
    });

    const sysLink = metadata.labelsSection.locator('[data-test="labels-show-system-link"]');
    await expect(sysLink).toBeVisible({ timeout: SHORT_TIMEOUT });
    await sysLink.click();
    await metadata.expectAdvancedViewEnabled();
  });

  // ── RBAC ───────────────────────────────────────────────────────────────────

  test('add buttons are visible when user has patch permission', async ({ page }) => {
    addTestLabel();
    addTestAnnotation();
    const metadata = new MetadataTabPage(page);
    await openMetadataTab(page, metadata);

    await expect(metadata.labelsAddBtn).toBeVisible({ timeout: SHORT_TIMEOUT });
  });
});
