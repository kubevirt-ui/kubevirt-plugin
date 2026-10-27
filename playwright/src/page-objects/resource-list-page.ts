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
  readonly filterToolbar: FilterToolbarComponent;
  protected readonly modal: ModalComponent;

  constructor(page: Page) {
    super(page);
    this.modal = new ModalComponent(page);
    this.filterToolbar = new FilterToolbarComponent(page);
  }

  /** Console list menus and KubeVirt `ActionsDropdown` (Popper) delete entries. */
  private deleteActionLocators(menu: Locator): Locator {
    const pluginDelete = this.page.locator(
      [
        '[data-test-id="instacetype-delete-action"]',
        '[data-test-id="preference-delete-action"]',
        '[data-test-id="mp-action-delete"]',
      ].join(', '),
    );

    return pluginDelete
      .or(this.page.locator('[data-test-id$="-action-delete"]'))
      .or(menu.locator('[data-test-id$="-action-delete"]'))
      .or(menu.getByRole('menuitem', { name: /^Delete$/i }))
      .or(menu.getByRole('menuitem', { name: /Delete VirtualMachine/i }))
      .or(menu.getByRole('menuitem', { name: /Delete VirtualMachineInstancetype/i }))
      .or(menu.getByRole('menuitem', { name: /Delete DataSource/i }))
      .or(menu.getByRole('menuitem', { name: /Delete MigrationPolicy/i }))
      .or(menu.getByRole('button', { name: /^Delete$/i }));
  }

  private async findKubevirtActionsToggle(
    name: string,
    row: Locator,
  ): Promise<{ root: Frame | Page; toggle: Locator } | null> {
    const pattern = new RegExp(escapeRegExp(name));
    const roots: Array<Frame | Page> = [
      this.page,
      ...this.page.frames().filter((frame) => frame !== this.page.mainFrame()),
    ];

    for (const root of roots) {
      const frameRow = root.getByRole('row', { name: pattern }).first();
      if (!(await frameRow.isVisible().catch(() => false))) {
        continue;
      }
      const kebabToggle = frameRow
        .locator('[data-test="actions-dropdown"]')
        .getByTestId('kebab-button')
        .first()
        .or(root.locator('[data-test="actions-dropdown"]').getByTestId('kebab-button').first());
      if (await kebabToggle.isVisible().catch(() => false)) {
        return { root, toggle: kebabToggle };
      }

      const pluginActionsDropdown = frameRow.locator(
        '[data-test-id="migration-policies-actions"], [data-test-id="virtual-machine-cluster-instance-type-actions"], [data-test-id="virtual-machine-cluster-preference-actions"]',
      );
      const actionsToggle = pluginActionsDropdown.getByRole('button').first();
      if (await actionsToggle.isVisible().catch(() => false)) {
        return { root, toggle: actionsToggle };
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
        return { root: this.page, toggle };
      }
    }

    return null;
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

  private async openConsoleRowDeleteMenu(name: string): Promise<boolean> {
    const pattern = new RegExp(escapeRegExp(name));
    for (const root of [this.page, ...this.page.frames()]) {
      const row = root.getByRole('row', { name: pattern }).first();
      if (!(await row.isVisible().catch(() => false))) {
        continue;
      }
      const actions = row
        .locator(
          '[data-test="kebab-button"], [data-test-id="kebab-button"], [data-test-id="actions-menu-button"], [data-test="dropdown-button"], button[aria-label*="Actions"], button[aria-label="Actions"]',
        )
        .or(row.getByRole('button', { name: /^Actions$/i }));
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

  async chooseCreateOption(option: RegExp | string): Promise<void> {
    const itemIn = (scope: Locator) =>
      scope
        .getByRole('menuitem', { name: option })
        .or(scope.getByRole('link', { name: option }))
        .or(scope.getByRole('button', { name: option }));

    for (const scope of [this.page.locator('main'), this.page]) {
      const item = itemIn(scope);
      if (
        await item
          .first()
          .isVisible()
          .catch(() => false)
      ) {
        await item.first().click();
        return;
      }
    }

    const menus = this.page.getByRole('menu').filter({ visible: true });
    const menuCount = await menus.count();
    for (let index = menuCount - 1; index >= 0; index -= 1) {
      const menu = menus.nth(index);
      const item = itemIn(menu);
      if (
        await item
          .first()
          .isVisible()
          .catch(() => false)
      ) {
        await item.first().click();
        return;
      }
    }

    const fallback = itemIn(this.page);
    await fallback.first().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await fallback.first().click();
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

  async confirmDelete(resourceName?: string): Promise<void> {
    await pollUntil(
      async () => {
        const deleteModal = this.deleteConfirmationDialog();
        if (!(await deleteModal.isVisible().catch(() => false))) {
          return false;
        }
        return (await deleteModal.getByRole('heading', { name: /Delete/i }).count()) > 0;
      },
      {
        message: 'Delete confirmation dialog should open with a heading',
        timeout: TestTimeouts.ELEMENT_WAIT,
      },
    );
    const deleteModal = this.deleteConfirmationDialog();
    await this.fillDeleteConfirmationName(deleteModal, resourceName);
    await this.confirmDeleteDialog(deleteModal);
  }

  confirmDeleteButton(): Locator {
    return this.page.getByRole('button', { name: 'Delete' });
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
      .or(deleteModal.getByRole('button', { name: /Delete VirtualMachineInstancetype/i }))
      .or(deleteModal.getByRole('button', { name: /Delete MigrationPolicy/i }));

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

  async createFromYamlAndSubmit(manifestYaml?: string): Promise<void> {
    const onImport =
      /\/~new(\/|$)|\/import(\/|$)/i.test(this.page.url()) ||
      (await this.page
        .locator('.monaco-editor')
        .first()
        .isVisible()
        .catch(() => false));
    if (!onImport) {
      await this.chooseCreateOption(/with yaml|import yaml/i);
    }
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

  protected deleteConfirmationDialog(): Locator {
    const deleteHeading = this.page.getByRole('heading', { name: /Delete/i });
    const deleteSubmit = this.page.getByRole('button', { name: /^Delete$/i });
    return this.page
      .locator('#tab-modal, [role="dialog"][aria-modal="true"]')
      .filter({ visible: true })
      .filter({ has: deleteHeading })
      .filter({ has: deleteSubmit })
      .first();
  }

  deleteDialogHeading(kindLabel: string): Locator {
    return this.page.getByRole('heading', { name: new RegExp(`Delete ${kindLabel}`, 'i') });
  }

  async deleteResourceFromList(name: string): Promise<void> {
    await this.openDeleteDialog(name);
    await this.confirmDelete(name);
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

  async filterByName(name: string): Promise<void> {
    const itemFilter = this.testId('item-filter');
    if (
      await itemFilter
        .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT })
        .then(() => true)
        .catch(() => false)
    ) {
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

  async getResourceTitleText(): Promise<string> {
    return (await this.resourceTitle().textContent())?.trim() ?? '';
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

  async gotoList(path: string): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  async isListNameVisible(name: string, namespace?: string): Promise<boolean> {
    const pattern = new RegExp(escapeRegExp(name));
    const hrefNeedle = namespace
      ? `/ns/${namespace}/kubevirt.io~v1~VirtualMachine/${name}`
      : undefined;
    for (const root of this.listSearchRoots()) {
      if (hrefNeedle) {
        const byHref = root.locator(`a[href*="${hrefNeedle}"]`);
        if (
          await byHref
            .first()
            .isVisible()
            .catch(() => false)
        ) {
          return true;
        }
      }
      if (
        await root
          .getByRole('link', { name: pattern })
          .first()
          .isVisible()
          .catch(() => false)
      ) {
        return true;
      }
      if (
        await root
          .getByRole('row', { name: pattern })
          .first()
          .isVisible()
          .catch(() => false)
      ) {
        return true;
      }
    }
    return false;
  }

  /** Console list content may render in the plugin iframe — search every frame. */
  protected listSearchRoots(): Array<Frame | Page> {
    return [this.page, ...this.page.frames().filter((frame) => frame !== this.page.mainFrame())];
  }

  nameLink(name: string): Locator {
    return this.page.getByRole('link', { name: new RegExp(escapeRegExp(name)) }).first();
  }

  async openCreateDropdown(primaryLabel: RegExp | string): Promise<void> {
    const headerCreateLink = this.page
      .locator('main')
      .getByRole('link')
      .filter({ has: this.page.getByRole('button', { name: /^Create$/i }) })
      .first();
    if (await headerCreateLink.isVisible().catch(() => false)) {
      await this.robustClick(headerCreateLink);
      return;
    }
    const headerCreateButton = this.page
      .locator('main')
      .getByRole('button', { name: /^Create$/i })
      .first();
    if (await headerCreateButton.isVisible().catch(() => false)) {
      await this.robustClick(headerCreateButton);
      return;
    }

    const labeledCreateInMain = this.page
      .locator('main')
      .getByRole('button', { name: primaryLabel })
      .or(this.page.locator('main').getByRole('link', { name: primaryLabel }));
    if (
      await labeledCreateInMain
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      await this.robustClick(labeledCreateInMain.first());
      return;
    }

    const create = this.page.getByTestId('item-create');
    if (await create.isVisible().catch(() => false)) {
      const toggle = create
        .locator('button.pf-c-dropdown__toggle-button, button.pf-v6-c-menu-toggle')
        .last();
      const buttons = create.getByRole('button');
      const buttonCount = await buttons.count();
      let target: Locator | null = null;
      if (await toggle.isVisible().catch(() => false)) {
        target = toggle;
      } else if (buttonCount > 0) {
        target = buttons.nth(buttonCount > 1 ? 1 : 0);
      }
      if (target) {
        await this.robustClick(target);
        await this.page
          .getByRole('menu')
          .filter({ visible: true })
          .first()
          .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT })
          .catch(() => undefined);
        return;
      }
    }
    await this.robustClick(this.page.getByRole('button', { name: primaryLabel }).first());
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
            'vm-action-delete',
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

  async openResourceLink(name: string): Promise<void> {
    await this.page
      .getByRole('link', { name: new RegExp(name) })
      .first()
      .click();
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

  resourceDetailHeading(name: string): Locator {
    return this.page.getByRole('heading', { name: new RegExp(name) });
  }

  resourceDetailUrlPattern(kindPathSegment: string, name: string): RegExp {
    const escaped = kindPathSegment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`${escaped}/${name}(?:/|$)`);
  }

  resourceTitle(): Locator {
    return this.consoleTestId('resource-title');
  }

  row(name: RegExp | string): Locator {
    const pattern = typeof name === 'string' ? new RegExp(escapeRegExp(name)) : name;
    return this.page.getByRole('row', { name: pattern }).first();
  }

  templateRowLink(name: string): Locator {
    return this.nameLink(name);
  }

  protected visibleActionsMenu(): Locator {
    return this.page
      .locator(
        '.pf-c-dropdown__menu.pf-m-align-right, .pf-c-dropdown__menu.pf-m-visible, .pf-c-dropdown__menu--visible, .pf-v6-c-menu, [role="menu"]',
      )
      .filter({ visible: true })
      .last();
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

  yamlParseError(): Locator {
    return this.page.getByText(/Error parsing YAML/i);
  }
}
