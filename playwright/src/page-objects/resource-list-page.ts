import FilterToolbarComponent from '@/components/shared/filter-toolbar-component';
import ModalComponent from '@/components/shared/modal-component';
import BasePage from '@/page-objects/base-page';
import { pollUntil, waitForUrlMatch } from '@/utils/poll-until';
import { TestTimeouts } from '@/utils/test-config';
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
        '[data-test-id="datasource-action-delete"]',
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

  protected async findKubevirtActionsToggle(
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
        [
          '[data-test-id="migration-policies-actions"]',
          '[data-test-id="virtual-machine-user-instance-type-actions"]',
          '[data-test-id="virtual-machine-cluster-instance-type-actions"]',
          '[data-test-id="virtual-machine-preference-actions"]',
          '[data-test-id="virtual-machine-cluster-preference-actions"]',
          '[data-test-id="virtual-machine-actions"]',
          '[data-test-id="data-source-actions"]',
        ].join(', '),
      );
      const actionsToggle = pluginActionsDropdown.getByRole('button').first();
      if (await actionsToggle.isVisible().catch(() => false)) {
        return { root, toggle: actionsToggle };
      }

      const kvRowActions = frameRow.locator('.kv-actions-dropdown button').first();
      if (await kvRowActions.isVisible().catch(() => false)) {
        return { root, toggle: kvRowActions };
      }

      const actionsCellButton = frameRow
        .locator('[role="gridcell"]')
        .last()
        .getByRole('button')
        .first();
      if (await actionsCellButton.isVisible().catch(() => false)) {
        return { root, toggle: actionsCellButton };
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
        .or(row.getByRole('button', { name: /^Actions$/i }))
        .or(row.locator('[role="gridcell"]').last().getByRole('button').first());
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

  /** OpenShift 4.22+ split Create on the VM list (primary → wizard; menu → With YAML). */
  protected virtualMachineListCreateControl(): Locator {
    const header = this.page.locator('main').getByRole('heading', { name: /^VirtualMachines$/i });
    return header
      .locator('xpath=ancestor::main[1]')
      .locator('#tour-step-create-button [data-test="item-create"]')
      .or(
        header.locator(
          'xpath=ancestor::main[1]//[data-test-id="details-actions"]//[data-test="item-create"]',
        ),
      )
      .or(this.page.locator('.VirtualMachineEmptyState [data-test="item-create"]'))
      .first();
  }

  protected virtualMachineListCreateDropdownToggle(): Locator {
    const create = this.virtualMachineListCreateControl();
    return create
      .locator(
        'button.pf-v6-c-menu-toggle, button.pf-c-dropdown__toggle-button, button.pf-v6-c-menu-toggle__toggle',
      )
      .last()
      .or(create.getByRole('button').last());
  }

  protected virtualMachineListCreatePrimaryButton(): Locator {
    const create = this.virtualMachineListCreateControl();
    return create
      .getByRole('button', { name: /^Create$|^Create VirtualMachine$/i })
      .or(create.locator('.pf-v6-c-menu-toggle__button').first())
      .first();
  }

  /** OpenShift 4.22+ split Create control on the VM list (`#tour-step-create-button`). */
  protected tourStepCreateButtonRoot(): Locator {
    return this.page.locator('#tour-step-create-button');
  }

  /** Primary split action — opens the VM creation wizard route. */
  async openVmWizardFromTourCreateButton(): Promise<void> {
    await this.dismissConsoleObstructions();
    // Hash fragments (`#content-scrollable`) must not defeat the already-on-wizard check.
    if (/\/vm-wizard(?:\/|$|\?|#)/.test(this.page.url())) {
      return;
    }
    if (
      await this.page
        .locator('.vm-creation-wizard, .pf-v6-c-wizard.vm-creation-wizard')
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      return;
    }
    const primaryButton = this.virtualMachineListCreatePrimaryButton();
    if (await primaryButton.isVisible().catch(() => false)) {
      await this.robustClick(primaryButton);
      return;
    }
    const tourRoot = this.tourStepCreateButtonRoot();
    const tourPrimary = tourRoot
      .getByRole('button', { name: /^Create$|^Create VirtualMachine$/i })
      .first();
    if (await tourPrimary.isVisible().catch(() => false)) {
      await this.robustClick(tourPrimary);
      return;
    }
    if (await tourRoot.isVisible().catch(() => false)) {
      await this.robustClick(tourRoot.locator('button').first());
      return;
    }
    const primary = this.page
      .locator('main')
      .getByRole('button', { name: /^Create$/i })
      .first();
    if (await primary.isVisible().catch(() => false)) {
      await this.robustClick(primary);
      return;
    }
    const emptyCreate = this.page
      .getByRole('button', { name: /^Create VirtualMachine$/i })
      .or(this.page.locator('.VirtualMachineEmptyState [data-test="item-create"]'))
      .first();
    if (await emptyCreate.isVisible().catch(() => false)) {
      await this.robustClick(emptyCreate);
      return;
    }
    await this.openCreateDropdown(/Create VirtualMachine|^Create$/i);
    await this.chooseCreateOption(/^Create$/i);
  }

  /** Split-button menu → With YAML (4.22 VM list; CNV-82506 dropdown is YAML-only). */
  async openYamlImportFromTourCreateDropdown(): Promise<void> {
    await this.dismissConsoleObstructions();

    const openYamlViaMenu = async (toggle: Locator): Promise<boolean> => {
      if (!(await toggle.isVisible().catch(() => false))) {
        return false;
      }
      try {
        await this.robustClick(toggle);
        await this.chooseCreateOption(/with yaml/i);
        await this.waitForVirtualMachineYamlImportEditor();
        return true;
      } catch {
        await this.page.keyboard.press('Escape').catch(() => undefined);
        return false;
      }
    };

    if (await openYamlViaMenu(this.virtualMachineListCreateMenuToggleButton())) {
      return;
    }

    const create = this.virtualMachineListCreateControl();
    if (await create.isVisible().catch(() => false)) {
      if (await openYamlViaMenu(this.virtualMachineListCreateDropdownToggle())) {
        return;
      }
    }

    // Only click the tour split chevron when the nested control is actually painted.
    // `#tour-step-create-button` can be present while `item-create` is still mounting —
    // robustClick then burns the suite timeout before the URL fallback runs.
    const tourMenuButton = this.tourStepCreateButtonRoot()
      .locator('[data-test="item-create"] button')
      .last();
    if (await openYamlViaMenu(tourMenuButton)) {
      return;
    }

    const namespace = this.page.url().match(/\/ns\/([^/]+)\//)?.[1];
    if (namespace) {
      await this.page.goto(`/k8s/ns/${namespace}/kubevirt.io~v1~VirtualMachine/~new`, {
        waitUntil: 'domcontentloaded',
      });
      await this.waitForVirtualMachineYamlImportEditor();
      return;
    }

    throw new Error('VirtualMachine YAML import: no Create split control and no namespace in URL');
  }

  /** Split-button chevron beside the primary Create action (works without `data-test="item-create"`). */
  protected virtualMachineListCreateMenuToggleButton(): Locator {
    const primary = this.page
      .locator('main')
      .getByRole('button', { name: /^Create$|^Create VirtualMachine$/i })
      .first();
    return primary.locator('xpath=following-sibling::button[1]');
  }

  protected async waitForVirtualMachineYamlImportEditor(): Promise<void> {
    await pollUntil(
      async () =>
        /VirtualMachine\/~new/i.test(this.page.url()) ||
        (await this.page
          .locator('.monaco-editor')
          .first()
          .isVisible()
          .catch(() => false)),
      {
        message: 'VirtualMachine YAML import editor should open from Create → With YAML',
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
  }

  async chooseCreateOption(option: RegExp | string): Promise<void> {
    const itemIn = (scope: Page | Frame | Locator) =>
      scope
        .getByRole('menuitem', { name: option })
        .or(scope.getByRole('link', { name: option }))
        .or(scope.getByRole('button', { name: option }));

    // PF Create menus remount under load — re-resolve and force-click until one sticks.
    await pollUntil(
      async () => {
        const candidates: Locator[] = [];
        for (const root of this.listSearchRoots()) {
          candidates.push(itemIn(root).first());
        }
        candidates.push(itemIn(this.page.locator('main')).first(), itemIn(this.page).first());
        const menus = this.page.getByRole('menu').filter({ visible: true });
        const menuCount = await menus.count();
        for (let index = menuCount - 1; index >= 0; index -= 1) {
          candidates.push(itemIn(menus.nth(index)).first());
        }

        for (const item of candidates) {
          if (!(await item.isVisible().catch(() => false))) {
            continue;
          }
          try {
            await item.click({ force: true, timeout: TestTimeouts.UI_DELAY_MEDIUM });
            return true;
          } catch {
            // Detached / closed between visibility check and click — retry.
          }
        }
        return false;
      },
      {
        intervalMs: 500,
        message: `Create dropdown option ${String(option)} should be clickable`,
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
  }

  protected async clickVisiblePluginDeleteAction(...actionTestIds: string[]): Promise<void> {
    await pollUntil(
      async () => {
        for (const frame of this.page.frames()) {
          for (const id of actionTestIds) {
            const action = frame.getByTestId(id).or(frame.locator(`[data-test-id="${id}"]`));
            if (
              await action
                .first()
                .isVisible()
                .catch(() => false)
            ) {
              await action.first().click();
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

  protected async clickVisiblePluginRowAction(
    actionTestId: string,
    menuLabel = /^Edit$/i,
  ): Promise<void> {
    await pollUntil(
      async () => {
        for (const frame of this.page.frames()) {
          const action = frame
            .getByTestId(actionTestId)
            .or(frame.locator(`[data-test-id="${actionTestId}"]`));
          if (
            !(await action
              .first()
              .isVisible()
              .catch(() => false))
          ) {
            continue;
          }
          const menuItem = action.getByRole('menuitem').first();
          if (await menuItem.isVisible().catch(() => false)) {
            if (await menuItem.isDisabled().catch(() => true)) {
              return false;
            }
            await this.robustClick(menuItem);
            return true;
          }
          const byLabelInFrame = frame.getByRole('menuitem', { name: menuLabel }).first();
          if (await byLabelInFrame.isVisible().catch(() => false)) {
            if (await byLabelInFrame.isDisabled().catch(() => true)) {
              return false;
            }
            await this.robustClick(byLabelInFrame);
            return true;
          }
          return false;
        }
        const menu = this.visibleActionsMenu();
        const byId = menu.locator(`[data-test-id="${actionTestId}"]`).first();
        if (await byId.isVisible().catch(() => false)) {
          const menuItem = byId.getByRole('menuitem').first().or(byId);
          if (await menuItem.isDisabled().catch(() => true)) {
            return false;
          }
          await this.robustClick(menuItem);
          return true;
        }
        const byLabel = menu.getByRole('menuitem', { name: menuLabel });
        if (await byLabel.isVisible().catch(() => false)) {
          if (await byLabel.isDisabled().catch(() => true)) {
            return false;
          }
          await this.robustClick(byLabel);
          return true;
        }
        return false;
      },
      {
        message: `Plugin row action should be enabled (${actionTestId})`,
        timeout: TestTimeouts.ELEMENT_WAIT,
      },
    );
  }

  async confirmDelete(resourceName?: string): Promise<void> {
    await pollUntil(
      async () => {
        const deleteModal = this.deleteConfirmationDialog();
        if (await deleteModal.isVisible().catch(() => false)) {
          return true;
        }
        // Prefer plugin action ids (data-test) — ActionsDropdown MenuItems use data-test={id}.
        const pluginDelete = this.page
          .getByTestId('preference-delete-action')
          .or(this.page.getByTestId('vm-action-delete'))
          .or(this.page.getByTestId('datasource-action-delete'))
          .or(this.page.locator('[data-test="preference-delete-action"]'))
          .filter({ visible: true })
          .first();
        if (await pluginDelete.isVisible().catch(() => false)) {
          await pluginDelete.click({ force: true }).catch(() => undefined);
          return false;
        }
        // Console row Delete can leave the menuitem focused without activating — Enter/click again.
        const deleteItem = this.page
          .getByRole('menuitem', { name: /^Delete$/i })
          .filter({ visible: true })
          .first();
        if (await deleteItem.isVisible().catch(() => false)) {
          await deleteItem.click({ force: true }).catch(() => undefined);
          await this.page.keyboard.press('Enter').catch(() => undefined);
          return false;
        }
        // Menu closed without opening dialog — re-open kebab for the named row (not first table row).
        const row = resourceName
          ? this.row(resourceName).first()
          : this.page
              .locator('[role="grid"] [role="row"]')
              .filter({ has: this.page.getByRole('link') })
              .first();
        const kebab = row
          .locator('[data-test="actions-dropdown"] button, [data-test-id="virtual-machine-cluster-preference-actions"] button')
          .first()
          .or(row.locator('[role="gridcell"]').last().getByRole('button').first())
          .or(row.getByRole('button').last());
        if (await kebab.isVisible().catch(() => false)) {
          await kebab.click({ force: true }).catch(() => undefined);
        }
        return false;
      },
      {
        message: 'Delete confirmation dialog should open',
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

    // Console delete modals use data-test=confirm-action / save-button, or a plain Delete button (PF6).
    const saveButton = deleteModal
      .getByTestId('confirm-action')
      .or(deleteModal.getByTestId('save-button'))
      .or(deleteModal.getByRole('button', { name: /^Delete$/i }))
      .first();
    await pollUntil(async () => (await saveButton.isEnabled().catch(() => false)) === true, {
      message: 'Delete confirmation button should be visible and enabled',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });

    const dismissDeleteModal = async (): Promise<void> => {
      await deleteModal
        .getByTestId('cancel-button')
        .click({ force: true })
        .catch(() => deleteModal.getByLabel('Close').click({ force: true }));
      await deleteModal
        .waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT })
        .catch(() => undefined);
    };

    const deleteErrorAlreadyGone = async (): Promise<boolean> => {
      const alert = deleteModal.getByRole('alert');
      if (!(await alert.isVisible().catch(() => false))) {
        return false;
      }
      const text = ((await alert.textContent()) ?? '').toLowerCase();
      return text.includes('not found') || text.includes('already been deleted');
    };

    // Retry submit until the modal closes — never Cancel on timeout (that aborts the delete).
    await pollUntil(
      async () => {
        if (!(await deleteModal.isVisible().catch(() => false))) {
          return true;
        }
        if (await deleteErrorAlreadyGone()) {
          await dismissDeleteModal();
          return !(await deleteModal.isVisible().catch(() => false));
        }
        const btn = deleteModal
          .getByTestId('save-button')
          .or(deleteModal.getByTestId('confirm-action'))
          .or(deleteModal.getByRole('button', { name: /^Delete$/i }))
          .first();
        if (await btn.isEnabled().catch(() => false)) {
          const deleteRequest = this.page
            .waitForResponse(
              (response) =>
                response.request().method() === 'DELETE' &&
                /datasources|datavolumes|virtualmachines|templates|preferences|instancetypes|migrationpolicies/i.test(
                  response.url(),
                ),
              { timeout: TestTimeouts.ELEMENT_WAIT },
            )
            .catch(() => null);
          await btn.click({ force: true }).catch(() => undefined);
          const response = await deleteRequest;
          if (response && (response.status() === 404 || response.status() === 410)) {
            await dismissDeleteModal();
            return true;
          }
        }
        return !(await deleteModal.isVisible().catch(() => false));
      },
      {
        message: 'Delete confirmation dialog should close after submit',
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
  }

  protected async openImportYamlCreateLink(): Promise<boolean> {
    for (const root of this.listSearchRoots()) {
      const link = root.locator('main a[href*="/~new"], a[href*="/~new"]').first();
      if (await link.isVisible().catch(() => false)) {
        await this.robustClick(link);
        return true;
      }
    }
    return false;
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
      const onVmList = /kubevirt\.io~v1~VirtualMachine/i.test(this.page.url());
      if (onVmList && !(await this.openImportYamlCreateLink())) {
        if (
          await this.virtualMachineListCreateControl()
            .isVisible()
            .catch(() => false)
        ) {
          await this.openYamlImportFromTourCreateDropdown();
        } else {
          await this.chooseCreateOption(/with yaml|import yaml/i);
        }
      } else if (!onVmList) {
        if (!(await this.openImportYamlCreateLink())) {
          await this.chooseCreateOption(/with yaml|import yaml/i);
        }
      }
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
    // Console often prefixes with "Warning alert:" in the heading accessible name.
    // KubeVirt TabModal DeleteModal uses #tab-modal + data-test="dialog-modal" + save-button.
    const deleteHeading = this.page.getByRole('heading', {
      name: /Delete|Warning alert:.*Delete/i,
    });
    const deleteTitle = this.page.getByText(/Delete\s+\w+|Are you sure you want to delete/i).first();
    const deleteSubmit = this.page
      .getByTestId('confirm-action')
      .or(this.page.getByTestId('save-button'))
      .or(this.page.locator('[data-test="save-button"]'))
      .or(this.page.getByRole('button', { name: /^Delete$/i }));
    return this.page
      .locator(
        '#tab-modal, [data-test="dialog-modal"], [role="dialog"][aria-modal="true"], [role="dialog"]',
      )
      .filter({ visible: true })
      .filter({ has: deleteHeading.or(deleteTitle).or(deleteSubmit) })
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
    await this.dismissConsoleObstructions();

    const openItemCreateMenu = async (): Promise<boolean> => {
      for (const root of this.listSearchRoots()) {
        const create = root.getByTestId('item-create');
        if (!(await create.isVisible().catch(() => false))) {
          continue;
        }
        const toggle = create
          .locator('button.pf-c-dropdown__toggle-button, button.pf-v6-c-menu-toggle')
          .last();
        const buttons = create.getByRole('button');
        const buttonCount = await buttons.count();
        let target: Locator | null = null;
        if (await toggle.isVisible().catch(() => false)) {
          target = toggle;
        } else if (buttonCount > 1) {
          target = buttons.nth(1);
        }
        if (!target) {
          continue;
        }
        await this.robustClick(target);
        await root
          .getByRole('menu')
          .filter({ visible: true })
          .first()
          .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT })
          .catch(() => undefined);
        return true;
      }
      return false;
    };

    if (await openItemCreateMenu()) {
      return;
    }

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

    for (const root of this.listSearchRoots()) {
      const labeledCreate = root
        .getByRole('button', { name: primaryLabel })
        .or(root.getByRole('link', { name: primaryLabel }));
      if (
        !(await labeledCreate
          .first()
          .isVisible()
          .catch(() => false))
      ) {
        continue;
      }
      if (await openItemCreateMenu()) {
        return;
      }
      const splitToggle = labeledCreate
        .first()
        .locator(
          'xpath=ancestor::*[@data-test-id="item-create" or @data-test="item-create"][1]//button[contains(@class,"menu-toggle") or contains(@class,"dropdown__toggle-button")]',
        )
        .last();
      if (await splitToggle.isVisible().catch(() => false)) {
        await this.robustClick(splitToggle);
        return;
      }
      await this.robustClick(labeledCreate.first());
      return;
    }

    if (await openItemCreateMenu()) {
      return;
    }

    for (const root of this.listSearchRoots()) {
      const createLink = root.getByRole('link', { name: primaryLabel }).first();
      if (await createLink.isVisible().catch(() => false)) {
        await this.robustClick(createLink);
        return;
      }
      const createButton = root.getByRole('button', { name: primaryLabel }).first();
      if (await createButton.isVisible().catch(() => false)) {
        await this.robustClick(createButton);
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
            'datasource-action-delete',
            'instacetype-delete-action',
            'preference-delete-action',
            'mp-action-delete',
          );
        } else if (await this.openConsoleRowDeleteMenu(name)) {
          return;
        } else {
          const pluginKebab = row
            .locator(
              [
                '[data-test-id="virtual-machine-actions"]',
                '[data-test-id="data-source-actions"]',
                '[data-test-id="migration-policies-actions"]',
                '[data-test-id="virtual-machine-user-instance-type-actions"]',
                '[data-test-id="virtual-machine-cluster-instance-type-actions"]',
                '[data-test-id="virtual-machine-preference-actions"]',
                '[data-test-id="virtual-machine-cluster-preference-actions"]',
              ].join(', '),
            )
            .getByRole('button')
            .first()
            .or(row.locator('.pf-v5-c-table__action button, .dropdown-kebab-pf button').first());
          if (await pluginKebab.isVisible().catch(() => false)) {
            await this.openKubevirtRowActionsMenu(name, row, pluginKebab);
            await this.clickVisiblePluginDeleteAction(
              'vm-action-delete',
              'datasource-action-delete',
              'instacetype-delete-action',
              'preference-delete-action',
              'mp-action-delete',
            );
            return;
          }
          // 4.22 PF6 row kebab is often a plain menu-toggle with no aria-label / data-test.
          const actions = row
            .locator(
              '[data-test="kebab-button"], [data-test-id="kebab-button"], [data-test-id="actions-menu-button"], [data-test="dropdown-button"], [data-test-id="data-source-actions"] button, button[aria-label*="Actions"], button[aria-label="Actions"]',
            )
            .or(
              row.locator(
                'button.pf-v6-c-menu-toggle.pf-m-plain, button.pf-v5-c-menu-toggle.pf-m-plain',
              ),
            )
            .or(row.locator('[role="gridcell"]').last().getByRole('button').first())
            .or(row.getByRole('button').last());
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
    const expanded = async (): Promise<boolean> => {
      if ((await toggle.getAttribute('aria-expanded')) === 'true') {
        return true;
      }
      const menu = this.visibleActionsMenu();
      return await menu.isVisible().catch(() => false);
    };
    if (!(await expanded())) {
      await this.robustClick(toggle);
    }
    await pollUntil(expanded, {
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
    const actions = row
      .locator(
        '[data-test="actions-dropdown"] [data-test="kebab-button"], [data-test="kebab-button"], [data-test-id="kebab-button"], [data-test-id="actions-menu-button"], [data-test="dropdown-button"], [data-test-id="data-source-actions"] button, button[aria-label*="Actions"], button[aria-label="Actions"]',
      )
      .or(
        row.locator('button.pf-v6-c-menu-toggle.pf-m-plain, button.pf-v5-c-menu-toggle.pf-m-plain'),
      )
      .or(row.getByRole('button').last());
    await this.robustClick(actions.first());
    const menu = this.visibleActionsMenu();
    await pollUntil(async () => (await this.findVisibleDeleteAction(menu)) !== null, {
      message: 'Row actions menu should expose a Delete action',
      timeout: TestTimeouts.ELEMENT_WAIT,
    }).catch(async () => {
      await menu.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    });
  }

  /** OpenShift appends `#content-scrollable`; strip query/hash before URL assertions. */
  protected resourceConsolePath(url: string): string {
    return (url.split('?')[0] ?? url).split('#')[0] ?? url;
  }

  resourceDetailHeading(name: string): Locator {
    return this.page.getByRole('heading', { name: new RegExp(name) });
  }

  resourceDetailUrlPattern(kindPathSegment: string, name: string): RegExp {
    const escaped = kindPathSegment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`${escaped}/${name}(?:/|$)`);
  }

  resourceTitle(): Locator {
    // Plugin TemplatePageTitle uses data-test; older console chrome uses data-test-id.
    return this.consoleTestId('resource-title').or(
      this.page.locator('[data-test="resource-title"]'),
    );
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
    await waitForUrlMatch(() => this.resourceConsolePath(this.page.url()), pattern, {
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
