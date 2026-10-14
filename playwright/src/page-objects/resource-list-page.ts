import FilterToolbarComponent from '@/components/shared/filter-toolbar-component';
import ModalComponent from '@/components/shared/modal-component';
import BasePage from '@/page-objects/base-page';
import { MINUTE, TestTimeouts } from '@/utils/test-config';
import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Shared OpenShift console list-page actions (Create dropdown, row navigation, delete).
 * Assertions belong in specs — use locators and query helpers from here.
 */
export class ResourceListPage extends BasePage {
  protected readonly modal: ModalComponent;
  readonly filterToolbar: FilterToolbarComponent;

  constructor(page: Page) {
    super(page);
    this.modal = new ModalComponent(page);
    this.filterToolbar = new FilterToolbarComponent(page);
  }

  protected deleteConfirmationDialog(): Locator {
    return this.page
      .getByRole('dialog')
      .filter({ has: this.page.getByRole('heading', { name: /Delete/i }) })
      .or(
        this.page.locator('#tab-modal').filter({
          has: this.page.getByRole('heading', { name: /Delete/i }),
        }),
      )
      .first();
  }

  protected async fillDeleteConfirmationName(
    deleteModal: Locator,
    resourceName?: string,
  ): Promise<void> {
    if (!resourceName) {
      return;
    }
    const nameInput = deleteModal.locator('#confirm-name, input[name="confirmName"]');
    if (await nameInput.isVisible().catch(() => false)) {
      await nameInput.fill(resourceName);
    }
    const typeConfirm = deleteModal.getByPlaceholder(/type.*name|confirm/i);
    if (await typeConfirm.isVisible().catch(() => false)) {
      await typeConfirm.fill(resourceName);
    }
  }

  protected async confirmDeleteDialog(deleteModal: Locator): Promise<void> {
    const propagation = deleteModal.getByLabel(/propagation policy/i);
    if (await propagation.isVisible().catch(() => false)) {
      await propagation.selectOption({ label: 'Background' }).catch(async () => {
        await deleteModal.getByText(/Background/i).click();
      });
    }
    const confirm = deleteModal
      .locator('[data-test="danger-button"]')
      .or(deleteModal.getByRole('button', { name: /^Delete$/i }))
      .or(deleteModal.getByRole('button', { name: /Delete DataSource/i }))
      .or(deleteModal.getByRole('button', { name: /Delete Template/i }))
      .or(deleteModal.getByRole('button', { name: /Delete VirtualMachine/i }));
    if (
      await confirm
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      await this.robustClick(confirm.first());
    } else {
      await this.clickDeleteConfirmationButton();
    }
    await deleteModal.waitFor({ state: 'hidden', timeout: 2 * MINUTE });
  }

  resourceTitle(): Locator {
    return this.consoleTestId('resource-title');
  }

  row(name: string): Locator {
    return this.page.getByRole('row', { name: new RegExp(escapeRegExp(name)) }).first();
  }

  deleteDialogHeading(kindLabel: string): Locator {
    return this.page.getByRole('heading', { name: new RegExp(`Delete ${kindLabel}`, 'i') });
  }

  confirmDeleteButton(): Locator {
    return this.page.getByRole('button', { name: 'Delete' });
  }

  async gotoList(path: string): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  /** Use `toHaveURL` — `waitForURL` hangs if the browser is already on the detail page (no new navigation). */
  async waitForResourceDetailUrl(
    pattern: RegExp,
    timeout = TestTimeouts.LONG_OPERATION,
  ): Promise<void> {
    await expect(this.page).toHaveURL(pattern, { timeout });
  }

  async filterByName(name: string): Promise<void> {
    const itemFilter = this.testId('item-filter');
    if (await itemFilter.isVisible().catch(() => false)) {
      await this.filterToolbar.filterByName(name);
      return;
    }

    const input = this.page
      .getByPlaceholder(/Search by name|Filter by name|Search/i)
      .or(this.page.locator('#filter-text-input input, #name-filter input'))
      .first();
    await this.resourceTitle()
      .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT })
      .catch(() => undefined);
    if (
      !(await input
        .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT })
        .catch(() => false))
    ) {
      return;
    }
    await input.fill(name);
    await input.press('Enter');
    await this.page.waitForTimeout(TestTimeouts.NETWORK_DELAY);
  }

  templateRowLink(name: string): Locator {
    return this.nameLink(name);
  }

  nameLink(name: string): Locator {
    return this.page.getByRole('link', { name: new RegExp(escapeRegExp(name)) }).first();
  }

  async getResourceTitleText(): Promise<string> {
    return (await this.resourceTitle().textContent())?.trim() ?? '';
  }

  async openCreateDropdown(primaryLabel: string | RegExp): Promise<void> {
    const dropdown = this.page.getByTestId('item-create').getByRole('button', {
      name: primaryLabel,
    });
    if (await dropdown.isVisible().catch(() => false)) {
      await dropdown.click();
      return;
    }
    await this.page.getByRole('button', { name: primaryLabel }).first().click();
  }

  async chooseCreateOption(option: string | RegExp): Promise<void> {
    const item = this.page
      .getByRole('menuitem', { name: option })
      .or(this.page.getByRole('link', { name: option }))
      .or(this.page.getByRole('button', { name: option }));
    await item.first().click();
  }

  yamlParseError(): Locator {
    return this.page.getByText(/Error parsing YAML/i);
  }

  /** Read current Monaco model text (OpenShift Import YAML / resource YAML editors). */
  async getYamlEditorValue(): Promise<string> {
    return this.page.evaluate(() => {
      const monaco = (
        window as { monaco?: { editor: { getModels: () => { getValue: () => string }[] } } }
      ).monaco;
      const model = monaco?.editor?.getModels?.()?.[0];
      return model?.getValue?.() ?? '';
    });
  }

  /** Console Import YAML rejects single-line manifests; Monaco `setValue` alone can leave invalid state. */
  async assertYamlEditorParsable(): Promise<void> {
    await expect
      .poll(
        async () => {
          const value = await this.getYamlEditorValue();
          return value.includes('\n') && /\nkind:\s/m.test(value);
        },
        {
          message: 'YAML editor must contain a multiline manifest',
          timeout: TestTimeouts.ELEMENT_WAIT,
        },
      )
      .toBe(true);
    await expect(this.yamlParseError()).toBeHidden({ timeout: TestTimeouts.ELEMENT_WAIT });
  }

  /**
   * OpenShift 4.12 Monaco exposes `editor.getModels()` only (no `getEditors`).
   * Do not use `textarea.fill()` — it collapses/breaks YAML and leaves "Error parsing YAML" on ~new/import.
   */
  async fillYamlEditor(manifestYaml: string): Promise<void> {
    const editor = this.page.locator('.monaco-editor').first();
    await editor.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    // Default ~new template loads after navigation; replacing too early races invalid content.
    await this.page.waitForTimeout(TestTimeouts.UI_ANIMATION_DELAY);

    const setViaModel = await this.page.evaluate((yaml) => {
      const monaco = (
        window as { monaco?: { editor: { getModels: () => { setValue: (v: string) => void }[] } } }
      ).monaco;
      const model = monaco?.editor?.getModels?.()?.[0];
      if (!model) {
        return false;
      }
      model.setValue(yaml);
      return true;
    }, manifestYaml);

    if (!setViaModel) {
      const textarea = this.page
        .locator('.monaco-editor textarea.inputarea, .monaco-editor textarea')
        .first();
      await textarea.click({ force: true });
      const selectAll = process.platform === 'darwin' ? 'Meta+A' : 'Control+A';
      await this.page.keyboard.press(selectAll);
      await this.page.keyboard.insertText(manifestYaml);
    }

    await this.assertYamlEditorParsable();
  }

  async createFromYamlAndSubmit(manifestYaml?: string): Promise<void> {
    await this.chooseCreateOption(/with yaml|import yaml/i);
    await this.page.locator('.monaco-editor').first().waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    if (manifestYaml) {
      await this.fillYamlEditor(manifestYaml);
    }
    const submit = this.page
      .locator('[data-test="save-changes"]')
      .or(this.page.getByRole('button', { name: /^Create$/ }));
    const submitButton = submit.first();
    await expect(this.yamlParseError()).toBeHidden({ timeout: TestTimeouts.SHORT_WAIT });
    await expect(submitButton).toBeEnabled({ timeout: TestTimeouts.ELEMENT_WAIT });
    await submitButton.click();
    await submit
      .first()
      .waitFor({ state: 'hidden', timeout: TestTimeouts.LONG_OPERATION })
      .catch(() => undefined);
  }

  async openResourceLink(name: string): Promise<void> {
    await this.page
      .getByRole('link', { name: new RegExp(name) })
      .first()
      .click();
  }

  private visibleActionsMenu(): Locator {
    return this.page
      .locator(
        '.pf-c-dropdown__menu.pf-m-align-right, .pf-c-dropdown__menu--visible, .pf-v6-c-menu, [role="menu"]',
      )
      .filter({ has: this.page.getByRole('menuitem') })
      .last();
  }

  async openRowActions(name: string): Promise<void> {
    const row = this.row(name).first();
    await row.waitFor({ state: 'visible' });
    const actions = row.locator(
      '[data-test-id="actions-menu-button"], [data-test="dropdown-button"], button[aria-label*="Actions"], button[aria-label="Actions"]',
    );
    await this.robustClick(actions.first());
    await this.visibleActionsMenu().waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }

  /** Row kebab → Delete (retries when the PF dropdown re-renders and detaches the menuitem). */
  async openDeleteDialog(name: string): Promise<void> {
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const row = this.row(name).first();
      await row.waitFor({ state: 'visible' });

      const actions = row.locator(
        '[data-test-id="actions-menu-button"], [data-test="dropdown-button"], button[aria-label*="Actions"], button[aria-label="Actions"]',
      );
      await this.robustClick(actions.first());

      const menu = this.visibleActionsMenu();
      const deleteItem = menu
        .locator('[data-test-id$="-action-delete"]')
        .or(menu.getByRole('menuitem', { name: /^Delete$/i }))
        .first();

      try {
        await deleteItem.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
        await this.robustClick(deleteItem);
        return;
      } catch (error) {
        await this.page.keyboard.press('Escape').catch(() => undefined);
        if (attempt === maxAttempts) {
          throw error;
        }
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      }
    }
  }

  async confirmDelete(resourceName?: string): Promise<void> {
    const deleteModal = this.deleteConfirmationDialog();
    await deleteModal.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.fillDeleteConfirmationName(deleteModal, resourceName);
    await this.confirmDeleteDialog(deleteModal);
  }

  async deleteResourceFromList(name: string): Promise<void> {
    await this.openDeleteDialog(name);
    await this.confirmDelete(name);
  }
}
