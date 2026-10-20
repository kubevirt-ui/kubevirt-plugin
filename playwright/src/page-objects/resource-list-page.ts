import FilterToolbarComponent from '@/components/shared/filter-toolbar-component';
import ModalComponent from '@/components/shared/modal-component';
import BasePage from '@/page-objects/base-page';
import { pollUntil, waitForUrlMatch } from '@/utils/poll-until';
import { MINUTE, TestTimeouts } from '@/utils/test-config';
import type { Frame, Locator, Page } from '@playwright/test';

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
      .locator('#tab-modal')
      .filter({ visible: true })
      .filter({ has: this.page.getByRole('heading', { name: /Delete/i }) })
      .or(
        this.page
          .locator('[role="dialog"][aria-modal="true"]')
          .filter({ visible: true })
          .filter({ has: this.page.getByRole('heading', { name: /Delete/i }) }),
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
    const submitCandidates = deleteModal
      .getByTestId('save-button')
      .or(deleteModal.locator('[data-test="danger-button"]'))
      .or(deleteModal.getByRole('button', { name: /^Delete$/i }))
      .or(deleteModal.getByRole('button', { name: /Delete DataSource/i }))
      .or(deleteModal.getByRole('button', { name: /Delete Template/i }))
      .or(deleteModal.getByRole('button', { name: /Delete VirtualMachine/i }))
      .or(deleteModal.getByRole('button', { name: /Delete VirtualMachineInstancetype/i }));

    const findEnabledSubmit = async (): Promise<Locator | null> => {
      const count = await submitCandidates.count();
      for (let i = 0; i < count; i++) {
        const btn = submitCandidates.nth(i);
        if (!(await btn.isVisible().catch(() => false))) {
          continue;
        }
        if (!(await btn.isEnabled().catch(() => false))) {
          continue;
        }
        return btn;
      }
      return null;
    };

    await pollUntil(async () => (await findEnabledSubmit()) !== null, {
      message: 'Delete confirmation button should be visible and enabled',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });

    const submit = await findEnabledSubmit();
    if (submit) {
      await this.robustClick(submit);
    } else {
      await this.clickDeleteConfirmationButton();
    }
    await deleteModal.waitFor({ state: 'hidden', timeout: 2 * MINUTE });
  }

  resourceTitle(): Locator {
    return this.consoleTestId('resource-title');
  }

  row(name: string | RegExp): Locator {
    const pattern = typeof name === 'string' ? new RegExp(escapeRegExp(name)) : name;
    return this.page.getByRole('row', { name: pattern }).first();
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

  /** Poll URL — `waitForURL` hangs if the browser is already on the detail page (no new navigation). */
  async waitForResourceDetailUrl(
    pattern: RegExp,
    timeout = TestTimeouts.LONG_OPERATION,
  ): Promise<void> {
    await waitForUrlMatch(() => this.page.url(), pattern, {
      message: `Resource detail URL should match ${pattern}`,
      timeout,
    });
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

  resourceDetailHeading(name: string): Locator {
    return this.page.getByRole('heading', { name: new RegExp(name) });
  }

  resourceDetailUrlPattern(kindPathSegment: string, name: string): RegExp {
    const escaped = kindPathSegment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`${escaped}/${name}(?:/|$)`);
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
  async waitForYamlEditorParsable(): Promise<void> {
    await pollUntil(
      async () => {
        const value = await this.getYamlEditorValue();
        return value.includes('\n') && /\nkind:\s/m.test(value);
      },
      {
        message: 'YAML editor must contain a multiline manifest',
        timeout: TestTimeouts.ELEMENT_WAIT,
      },
    );
    await this.yamlParseError().waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT });
  }

  /**
   * OpenShift 4.13 Monaco exposes `editor.getModels()` only (no `getEditors`).
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

    await this.waitForYamlEditorParsable();
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
    await this.yamlParseError().waitFor({ state: 'hidden', timeout: TestTimeouts.SHORT_WAIT });
    await pollUntil(async () => await submitButton.isEnabled(), {
      message: 'YAML create/submit button should be enabled',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
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

  protected visibleActionsMenu(): Locator {
    return this.page
      .locator(
        '.pf-c-dropdown__menu.pf-m-align-right, .pf-c-dropdown__menu.pf-m-visible, .pf-c-dropdown__menu--visible, .pf-v6-c-menu, [role="menu"]',
      )
      .filter({ visible: true })
      .last();
  }

  /** Console list menus and KubeVirt `ActionsDropdown` (Popper) delete entries. */
  private deleteActionLocators(menu: Locator): Locator {
    const pluginDelete = this.page.locator(
      [
        '[data-test="instacetype-delete-action"]',
        '[data-test="preference-delete-action"]',
        '[data-test="mp-action-delete"]',
      ].join(', '),
    );

    return pluginDelete
      .or(this.page.locator('[data-test-id$="-action-delete"]'))
      .or(menu.locator('[data-test-id$="-action-delete"]'))
      .or(menu.getByRole('menuitem', { name: /^Delete$/i }))
      .or(menu.getByRole('menuitem', { name: /Delete VirtualMachine/i }))
      .or(menu.getByRole('menuitem', { name: /Delete VirtualMachineInstancetype/i }))
      .or(menu.getByRole('menuitem', { name: /Delete DataSource/i }))
      .or(menu.getByRole('button', { name: /^Delete$/i }));
  }

  private async findVisibleDeleteAction(menu: Locator): Promise<Locator | null> {
    const candidates = this.deleteActionLocators(menu);
    const count = await candidates.count();
    for (let i = 0; i < count; i++) {
      const item = candidates.nth(i);
      if (await item.isVisible().catch(() => false)) {
        return item;
      }
    }
    return null;
  }

  private async findKubevirtActionsToggle(
    name: string,
    row: Locator,
  ): Promise<{ toggle: Locator; root: Page | Frame } | null> {
    const pattern = new RegExp(escapeRegExp(name));
    const roots: Array<Page | Frame> = [
      this.page,
      ...this.page.frames().filter((frame) => frame !== this.page.mainFrame()),
    ];

    for (const root of roots) {
      const frameRow = root.getByRole('row', { name: pattern }).first();
      if (!(await frameRow.isVisible().catch(() => false))) {
        continue;
      }
      const toggle = frameRow
        .locator('[data-test="actions-dropdown"]')
        .getByTestId('kebab-button')
        .first()
        .or(root.locator('[data-test="actions-dropdown"]').getByTestId('kebab-button').first());
      if (await toggle.isVisible().catch(() => false)) {
        return { toggle, root };
      }
    }

    if (await row.isVisible().catch(() => false)) {
      const toggle = row
        .locator('[data-test="actions-dropdown"]')
        .getByTestId('kebab-button')
        .first()
        .or(
          this.page.locator('[data-test="actions-dropdown"]').getByTestId('kebab-button').first(),
        );
      if (await toggle.isVisible().catch(() => false)) {
        return { toggle, root: this.page };
      }
    }

    return null;
  }

  /** KubeVirt `ActionsDropdown` (kebab + Popper menu, often portaled). */
  protected async openKubevirtRowActionsMenu(
    _name: string,
    _row: Locator,
    toggle: Locator,
  ): Promise<void> {
    await toggle.scrollIntoViewIfNeeded();
    await this.robustClick(toggle);
    await pollUntil(async () => (await toggle.getAttribute('aria-expanded')) === 'true', {
      message: 'KubeVirt row actions menu should expand',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
  }

  private async openConsoleRowDeleteMenu(name: string): Promise<boolean> {
    const pattern = new RegExp(escapeRegExp(name));
    for (const root of [this.page, ...this.page.frames()]) {
      const row = root.getByRole('row', { name: pattern }).first();
      if (!(await row.isVisible().catch(() => false))) {
        continue;
      }
      const actions = row.locator(
        '[data-test="kebab-button"], [data-test-id="kebab-button"], [data-test-id="actions-menu-button"], [data-test="dropdown-button"], button[aria-label*="Actions"], button[aria-label="Actions"]',
      );
      if (
        !(await actions
          .first()
          .isVisible()
          .catch(() => false))
      ) {
        continue;
      }
      await actions.first().click();
      const menu = root
        .locator(
          '.pf-c-dropdown__menu.pf-m-align-right, .pf-c-dropdown__menu--visible, .pf-v6-c-menu, [role="menu"]',
        )
        .filter({ visible: true })
        .last();
      const deleteItem = menu
        .locator('[data-test-id$="-action-delete"]')
        .or(menu.getByRole('menuitem', { name: /^Delete$/i }))
        .or(menu.getByRole('menuitem', { name: /Delete VirtualMachineInstancetype/i }))
        .first();
      if (await deleteItem.isVisible().catch(() => false)) {
        await deleteItem.click();
        return true;
      }
    }
    return false;
  }

  protected async clickVisiblePluginDeleteAction(...actionTestIds: string[]): Promise<void> {
    await pollUntil(
      async () => {
        for (const frame of this.page.frames()) {
          for (const id of actionTestIds) {
            const action = frame.getByTestId(id);
            if (await action.isVisible().catch(() => false)) {
              await action.click();
              return true;
            }
          }
        }
        const menu = this.visibleActionsMenu();
        const fallback = await this.findVisibleDeleteAction(menu);
        if (fallback) {
          await fallback.click();
          return true;
        }
        return false;
      },
      {
        message: `Plugin delete action should be visible (${actionTestIds.join(', ')})`,
        timeout: TestTimeouts.ELEMENT_WAIT,
      },
    );
  }

  async openRowActions(name: string): Promise<void> {
    const row = this.row(name).first();
    await row.waitFor({ state: 'visible' });
    const actions = row.locator(
      '[data-test="actions-dropdown"] [data-test="kebab-button"], [data-test="kebab-button"], [data-test-id="kebab-button"], [data-test-id="actions-menu-button"], [data-test="dropdown-button"], button[aria-label*="Actions"], button[aria-label="Actions"]',
    );
    await this.robustClick(actions.first());
    const menu = this.visibleActionsMenu();
    await pollUntil(async () => (await this.findVisibleDeleteAction(menu)) !== null, {
      message: 'Row actions menu should expose a Delete action',
      timeout: TestTimeouts.ELEMENT_WAIT,
    }).catch(async () => {
      await menu.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    });
  }

  /** Row kebab → Delete (retries when the PF dropdown re-renders and detaches the menuitem). */
  async openDeleteDialog(name: string): Promise<void> {
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const row = this.row(name).first();
      await row.waitFor({ state: 'visible' });

      const kubevirtMenu = await this.findKubevirtActionsToggle(name, row);

      try {
        if (kubevirtMenu) {
          await this.openKubevirtRowActionsMenu(name, row, kubevirtMenu.toggle);
          await this.clickVisiblePluginDeleteAction(
            'instacetype-delete-action',
            'preference-delete-action',
            'mp-action-delete',
          );
        } else if (await this.openConsoleRowDeleteMenu(name)) {
          return;
        } else {
          const actions = row.locator(
            '[data-test="kebab-button"], [data-test-id="kebab-button"], [data-test-id="actions-menu-button"], [data-test="dropdown-button"], button[aria-label*="Actions"], button[aria-label="Actions"]',
          );
          await this.robustClick(actions.first());
          const menu = this.visibleActionsMenu();
          await pollUntil(async () => (await this.findVisibleDeleteAction(menu)) !== null, {
            message: 'Delete action should be visible in row actions menu',
            timeout: TestTimeouts.ELEMENT_WAIT,
          });
          const deleteItem = await this.findVisibleDeleteAction(menu);
          if (!deleteItem) {
            throw new Error('Delete action not found in row actions menu');
          }
          await this.robustClick(deleteItem);
        }
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
