import { expect, Locator, Page } from '@playwright/test';

import { SECOND, SHORT_TIMEOUT } from '../utils/constants';
import { byTest } from '../utils/locators';

const ADVANCED_VIEW_TOGGLE = 'advanced-view-toggle';
const LABELS_SECTION = 'labels';
const ANNOTATIONS_SECTION = 'annotations';
const LABEL_KEY_SELECT = 'label-key-select';
const SYSTEM_METADATA_LINK = 'labels-show-system-link';

export class MetadataTabPage {
  readonly advancedViewToggle: Locator;
  readonly annotationsAddBtn: Locator;
  readonly annotationsSection: Locator;
  readonly labelsAddBtn: Locator;
  readonly labelsSection: Locator;

  constructor(private readonly page: Page) {
    this.labelsSection = byTest(page, LABELS_SECTION);
    this.annotationsSection = byTest(page, ANNOTATIONS_SECTION);
    this.labelsAddBtn = byTest(page, `${LABELS_SECTION}-add-btn`);
    this.annotationsAddBtn = byTest(page, `${ANNOTATIONS_SECTION}-add-btn`);
    this.advancedViewToggle = page.locator(`#${ADVANCED_VIEW_TOGGLE}`);
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  annotationsTable(): Locator {
    return byTest(this.page, `${ANNOTATIONS_SECTION}-table`);
  }

  // ── Simple view assertions ──────────────────────────────────────────────────

  /** Locator for the "Create new" option in the label key dropdown. */
  createNewOption(): Locator {
    return this.page.locator('#label-key-select-__create__');
  }

  deleteButton(key: string): Locator {
    return this.page.locator(`button[aria-label="Remove ${key}"]`);
  }

  async deleteInlineLabel(key: string) {
    await this.deleteButton(key).click();
    const dialog = this.page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Delete' }).click();
  }

  // ── Advanced view ───────────────────────────────────────────────────────────

  async expectAdvancedViewContent() {
    await expect(this.page.getByText('Labels', { exact: true })).toBeVisible({
      timeout: SHORT_TIMEOUT,
    });
    await expect(this.page.getByText('Annotations', { exact: true })).toBeVisible({
      timeout: SHORT_TIMEOUT,
    });
  }

  async expectAdvancedViewDisabled() {
    await expect(this.advancedViewToggle).not.toBeChecked({ timeout: SHORT_TIMEOUT });
  }

  async expectAdvancedViewEnabled() {
    await expect(this.advancedViewToggle).toBeChecked({ timeout: SHORT_TIMEOUT });
  }

  async expectAnnotationsCardVisible() {
    await expect(this.annotationsSection).toBeVisible({ timeout: SHORT_TIMEOUT });
  }

  // ── Label table ─────────────────────────────────────────────────────────────

  async expectAnnotationsEmptyState() {
    await expect(this.annotationsSection.getByText('No annotations yet.')).toBeVisible({
      timeout: SHORT_TIMEOUT,
    });
  }

  async expectAnnotationsTableVisible() {
    await expect(this.annotationsTable()).toBeVisible({ timeout: SHORT_TIMEOUT });
  }

  async expectCreateNewOption(keyName: string) {
    const option = this.createNewOption();
    await expect(option).toBeVisible({ timeout: SHORT_TIMEOUT });
    await expect(option).toContainText(keyName);
  }

  async expectDeleteButtonLoading(key: string) {
    await expect(this.deleteButton(key)).toBeDisabled();
  }

  async expectDeleteError() {
    await expect(this.page.locator('.pf-v6-c-alert__title')).toBeVisible({
      timeout: SHORT_TIMEOUT,
    });
  }

  async expectLabelKeySelectOpen(index: number) {
    const select = this.modalLabelKeySelect(index);
    await expect(select.getByRole('listbox')).toBeVisible({ timeout: SHORT_TIMEOUT });
  }

  // ── Empty states ────────────────────────────────────────────────────────────

  async expectLabelsCardVisible() {
    await expect(this.labelsSection).toBeVisible({ timeout: SHORT_TIMEOUT });
  }

  async expectLabelsEmptyState() {
    await expect(this.labelsSection.getByText('No labels yet.')).toBeVisible({
      timeout: SHORT_TIMEOUT,
    });
  }

  async expectLabelsTableVisible() {
    await expect(this.labelsTable()).toBeVisible({ timeout: SHORT_TIMEOUT });
  }

  // ── Edit Labels Modal ───────────────────────────────────────────────────────

  async expectModalHidden() {
    await expect(this.modalDialog()).toBeHidden({ timeout: SHORT_TIMEOUT });
  }

  async expectModalVisible(headerText: string) {
    const dialog = this.modalDialog();
    await expect(dialog).toBeVisible({ timeout: SHORT_TIMEOUT });
    await expect(dialog.getByText(headerText)).toBeVisible();
  }

  async expectSimpleViewVisible() {
    await expect(this.labelsSection).toBeVisible({ timeout: SHORT_TIMEOUT });
    await expect(this.annotationsSection).toBeVisible({ timeout: SHORT_TIMEOUT });
  }

  async expectSuggestedKeysGroupVisible() {
    await expect(this.page.getByText('Suggested keys')).toBeVisible({ timeout: SHORT_TIMEOUT });
  }

  async getAnnotationCount(): Promise<number> {
    const table = this.annotationsTable();
    const isVisible = await table.isVisible().catch(() => false);
    if (!isVisible) return 0;
    return table.locator('tbody tr').count();
  }

  async getLabelCount(): Promise<number> {
    const table = this.labelsTable();
    const isVisible = await table.isVisible().catch(() => false);
    if (!isVisible) return 0;
    return table.locator('tbody tr').count();
  }

  /** Navigate to Configuration > Metadata sub-tab on a VM detail page. */
  async goToMetadataTab() {
    const configTab = this.page.locator('[data-test-id="horizontal-link-Configuration"]');
    await expect(configTab).toBeVisible({ timeout: SHORT_TIMEOUT });
    await configTab.click();

    const metadataTab = this.page.locator('[data-test-id="vm-configuration-metadata"]');
    await expect(metadataTab).toBeVisible({ timeout: SHORT_TIMEOUT });
    await metadataTab.click();
  }

  labelsTable(): Locator {
    return byTest(this.page, `${LABELS_SECTION}-table`);
  }

  modalAddLabelButton(): Locator {
    return this.modalDialog().getByRole('button', { name: 'Add label' });
  }

  modalAddMoreButton(): Locator {
    return this.modalDialog().getByRole('button', { name: 'Add more' });
  }

  /** Get all annotation key inputs in the modal. */
  modalAnnotationKeyInputs(): Locator {
    return this.modalDialog().locator('input[placeholder="Key"]');
  }

  /** Get all annotation value inputs in the modal. */
  modalAnnotationValueInputs(): Locator {
    return this.modalDialog().locator('input[placeholder="Value"]');
  }

  modalCancelButton(): Locator {
    return this.modalDialog().getByRole('button', { name: 'Cancel' });
  }

  modalDialog(): Locator {
    return this.page.getByRole('dialog');
  }

  // ── Label Key Select interactions ───────────────────────────────────────────

  /** Get the nth label key select in the modal (0-based). */
  modalLabelKeySelect(index: number): Locator {
    return this.modalDialog().locator(`[data-test="${LABEL_KEY_SELECT}"]`).nth(index);
  }

  modalRemoveButtons(): Locator {
    return this.modalDialog().locator('button[aria-label="Remove"]');
  }

  modalSaveButton(): Locator {
    return this.modalDialog().getByRole('button', { name: 'Save' });
  }

  /** Get all value inputs in the modal. */
  modalValueInputs(): Locator {
    return this.modalDialog().locator('input[placeholder="Value"]');
  }

  async openEditAnnotationsModal() {
    await this.annotationsAddBtn.click();
  }

  async openEditLabelsModal() {
    await this.labelsAddBtn.click();
  }

  /** Click the "Create ..." option if the dropdown is still open, or skip if auto-committed. */
  async selectCreateNewOption() {
    const option = this.createNewOption();
    const appeared = await option
      .waitFor({ state: 'visible', timeout: 2 * SECOND })
      .then(() => true)
      .catch(() => false);
    if (appeared) await option.click();
  }

  // ── Inline delete ───────────────────────────────────────────────────────────

  async selectLabelKeyOption(optionText: string) {
    await this.page.getByRole('option', { exact: true, name: optionText }).click();
  }

  systemMetadataLink(): Locator {
    return byTest(this.page, SYSTEM_METADATA_LINK);
  }

  async toggleAdvancedView() {
    // PatternFly Switch: the <input> is visually hidden behind a <span> toggle.
    // Use Playwright's check/uncheck which handles hidden inputs, or click the
    // parent label wrapper that contains the visible toggle.
    const switchLabel = this.page.locator('.pf-v6-c-switch', {
      has: this.advancedViewToggle,
    });
    await switchLabel.click();
  }

  async typeInLabelKeySelect(index: number, text: string) {
    const select = this.modalLabelKeySelect(index);
    const input = select.locator('input[role="combobox"]');
    await expect(input).toBeVisible({ timeout: SHORT_TIMEOUT });
    await input.click();
    await input.pressSequentially(text, { delay: 30 });
    await this.page.waitForTimeout(0.5 * SECOND);
  }
}
