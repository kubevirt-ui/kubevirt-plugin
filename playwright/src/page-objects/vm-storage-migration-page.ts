import BasePage from '@/page-objects/base-page';
import type { VmListPage } from '@/page-objects/vm-list-page';
import { TestTimeouts } from '@/utils/test-config';
import { expect } from '@playwright/test';

/**
 * VM list row → Migration → Migrate storage wizard (kubevirt-ui parity, trimmed).
 */
export class VmStorageMigrationPage extends BasePage {
  private readonly migrationModal = this.locator('#virtual-machine-migration-modal');
  private readonly migrateStorageAction = this.locator(
    '[data-test-id="vm-action-migrate-storage"]',
  );
  private readonly migrationMenu = this.locator('[data-test-id="migration-menu"]');
  private readonly wizardFooter = this.migrationModal.locator(
    '.pf-v6-c-wizard__footer, .pf-v5-c-wizard__footer, [class*="wizard__footer"]',
  );
  private readonly primaryNext = this.wizardFooter
    .getByRole('button', { name: /^(Next|Migrate|Finish)$/i })
    .or(this.wizardFooter.locator('button.pf-v6-c-button.pf-m-primary, button.pf-m-primary'))
    .first();
  private readonly secondaryBack = this.wizardFooter
    .getByRole('button', { name: /^Back$/i })
    .or(this.wizardFooter.locator('button.pf-v6-c-button.pf-m-secondary, button.pf-m-secondary'))
    .first();
  /** 4.22 destination step pre-fills a StorageClass MenuToggle (not placeholder "Select…"). */
  private readonly selectScButton = this.migrationModal
    .locator('button[placeholder="Select StorageClass"]')
    .or(
      this.migrationModal.getByRole('button', { name: /StorageClass/i }).filter({
        hasNotText: /Source and target|Migration details|^Review$/i,
      }),
    )
    .or(
      this.migrationModal.locator('[data-test*="storage-class"], [data-test-id*="storage-class"]'),
    )
    .first();
  private readonly selectedVolumesRadio = this.migrationModal.locator(
    'input[id="selected-volumes"]',
  );
  private readonly selectAllRows = this.migrationModal.locator('[aria-label="Select all rows"]');

  async openStorageMigrationModalFromList(
    vmList: VmListPage,
    namespace: string,
    vmName: string,
    assertNextEnabled = true,
  ): Promise<void> {
    await vmList.goToNamespaceList(namespace);
    await vmList.waitForVmRowInList(vmName, namespace);
    await vmList.openRowActions(vmName);
    await this.migrationMenu.waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
    await this.robustClick(this.migrationMenu);
    await this.migrateStorageAction.waitFor({
      state: 'visible',
      timeout: TestTimeouts.LONG_OPERATION,
    });
    await this.robustClick(this.migrateStorageAction);
    await this.migrationModal.waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
    const nextButton = this.migrationModal
      .locator('button.pf-v6-c-button.pf-m-primary, button.pf-m-primary')
      .first();
    if (assertNextEnabled) {
      await expect(nextButton).toBeEnabled({ timeout: TestTimeouts.LONG_OPERATION });
    }
  }

  async isMigrateStorageActionEnabled(
    vmList: VmListPage,
    namespace: string,
    vmName: string,
  ): Promise<boolean> {
    try {
      await vmList.goToNamespaceList(namespace);
      await vmList.waitForVmRowInList(vmName, namespace);
      await vmList.openRowActions(vmName);
      if (!(await this.migrationMenu.isVisible({ timeout: TestTimeouts.UI_DELAY_LONG }))) {
        return false;
      }
      await this.migrationMenu.click();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      if (!(await this.migrateStorageAction.isVisible({ timeout: TestTimeouts.UI_DELAY_LONG }))) {
        return false;
      }
      return !(await this.migrateStorageAction.isDisabled());
    } catch {
      return false;
    } finally {
      await this.page.keyboard.press('Escape');
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }
  }

  async isWizardNavStepDisabled(stepName: string): Promise<boolean> {
    const navLink = this.migrationModal
      .locator(
        '.pf-v6-c-wizard__nav-link, .pf-v5-c-wizard__nav-link, button.pf-v6-c-wizard__nav-link',
      )
      .filter({ hasText: stepName })
      .first();
    await navLink.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    if (await navLink.isDisabled().catch(() => false)) {
      return true;
    }
    const ariaDisabled = await navLink.getAttribute('aria-disabled');
    if (ariaDisabled === 'true') {
      return true;
    }
    const className = (await navLink.getAttribute('class')) ?? '';
    return /\bpf-m-disabled\b/.test(className);
  }

  async clickSelectedVolumesRadio(): Promise<void> {
    const radio = this.selectedVolumesRadio;
    const label = this.migrationModal.locator('label[for="selected-volumes"]');
    if (await label.isVisible().catch(() => false)) {
      await label.click();
    } else {
      await radio.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await radio.click({ force: true });
    }
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async selectAllVolumesInModal(): Promise<void> {
    await this.selectAllRows.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.selectAllRows.click({ force: true });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async closeMigrationModal(): Promise<void> {
    const closeButton = this.migrationModal.locator('.pf-v6-c-wizard__close');
    await closeButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(closeButton);
    await this.migrationModal.waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT });
  }

  async performStorageClassMigration(
    vmList: VmListPage,
    namespace: string,
    vmName: string,
    destinationStorageClass: string,
    options?: {
      keepOriginalVolumes?: boolean;
      migrationCompletionTimeoutMs?: number;
      selectedVolumes?: boolean;
    },
  ): Promise<boolean> {
    const {
      selectedVolumes = false,
      migrationCompletionTimeoutMs = TestTimeouts.STORAGE_MIGRATION_MODAL_COMPLETION,
      keepOriginalVolumes = false,
    } = options ?? {};

    try {
      await this.openStorageMigrationModalFromList(vmList, namespace, vmName);

      if (selectedVolumes) {
        await this.clickSelectedVolumesRadio();
        await this.selectAllVolumesInModal();
      }

      return await this.completeWizardWithStorageClass(
        destinationStorageClass,
        migrationCompletionTimeoutMs,
        keepOriginalVolumes,
      );
    } catch (error) {
      await this.closeMigrationModal().catch(() => undefined);
      throw error instanceof Error
        ? error
        : new Error(`performStorageClassMigration failed: ${String(error)}`);
    }
  }

  private async completeWizardWithStorageClass(
    destinationStorageClass: string,
    migrationCompletionTimeoutMs: number,
    keepOriginalVolumes: boolean,
  ): Promise<boolean> {
    try {
      // Prefer wizard nav (desktop) — footer Next alone can leave the SC step collapsed.
      const destNav = this.migrationModal
        .locator(
          '.pf-v6-c-wizard__nav-link, .pf-v5-c-wizard__nav-link, button.pf-v6-c-wizard__nav-link',
        )
        .filter({ hasText: /Source and target StorageClass|Destination/i })
        .first();
      if (await destNav.isVisible().catch(() => false)) {
        await this.robustClick(destNav);
      } else {
        await this.primaryNext.click();
      }
      await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);

      await this.selectScButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      const alreadySelected = new RegExp(destinationStorageClass, 'i').test(
        (await this.selectScButton.textContent().catch(() => '')) || '',
      );
      if (!alreadySelected) {
        await this.robustClick(this.selectScButton);
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

        const scOption = this.page
          .locator(`button#select-inline-filter-${destinationStorageClass}`)
          .or(this.page.getByRole('option', { name: new RegExp(destinationStorageClass) }))
          .or(this.page.getByRole('menuitem', { name: new RegExp(destinationStorageClass) }))
          .or(
            this.page
              .locator('[role="listbox"] button, [role="menu"] button, .pf-v6-c-menu button')
              .filter({ hasText: destinationStorageClass }),
          )
          .first();
        await scOption.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
        await this.robustClick(scOption);
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      }

      const keepVolumesCheckbox = this.migrationModal.locator('#keep-original-volumes');
      if (await keepVolumesCheckbox.isVisible().catch(() => false)) {
        const isChecked = await keepVolumesCheckbox.isChecked();
        if (keepOriginalVolumes !== isChecked) {
          await keepVolumesCheckbox.click({ force: true });
          await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
        }
      }

      await this.primaryNext.click();
      await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);
      await this.primaryNext.click();

      const started = this.migrationModal.getByText(
        /Storage migration in progress|Migration in progress|In progress/i,
      );
      const completed = this.migrationModal.getByText(
        /Storage migration completed|Migration completed|Successfully migrated|Succeeded/i,
      );

      await started
        .or(completed)
        .first()
        .waitFor({ state: 'visible', timeout: TestTimeouts.BULK_VM_OPERATION });

      if (!(await completed.isVisible().catch(() => false))) {
        // Brief extra wait for completion; deleteSource often stays "in progress" on this cluster.
        await completed
          .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT })
          .catch(() => undefined);
      }

      if (!(await completed.isVisible().catch(() => false))) {
        const modalText = (await this.migrationModal.innerText().catch(() => '')) || '';
        // Prefer text check — PF may keep duplicate "In progress" nodes that fail isVisible().
        if (
          /migration in progress/i.test(modalText) &&
          /View storage migrations/i.test(modalText)
        ) {
          await this.closeMigrationModal().catch(() => undefined);
          return true;
        }
        throw new Error(
          `Storage migration did not complete within timeout. Modal text: ${modalText.slice(
            0,
            800,
          )}`,
        );
      }

      const closeButton = this.migrationModal.getByRole('button', { name: /^Close$/i }).first();
      await closeButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await this.robustClick(closeButton);
      return true;
    } catch (error) {
      await this.closeMigrationModal().catch(() => undefined);
      throw error instanceof Error
        ? error
        : new Error(`completeWizardWithStorageClass failed: ${String(error)}`);
    }
  }

  async startStorageMigrationAndCancelWhileInProgress(
    vmList: VmListPage,
    namespace: string,
    vmName: string,
    destinationStorageClass: string,
  ): Promise<void> {
    await this.openStorageMigrationModalFromList(vmList, namespace, vmName);
    await this.primaryNext.click();
    await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);

    await this.selectScButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(this.selectScButton);
    const scOption = this.locator(`button#select-inline-filter-${destinationStorageClass}`);
    await scOption.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(scOption);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    await this.primaryNext.click();
    await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);

    const cancelButton = this.migrationModal.locator('button:has-text("Cancel")').first();
    const completed = this.migrationModal.locator('text=Storage migration completed').first();

    await this.primaryNext.click();

    const deadline = Date.now() + TestTimeouts.BULK_VM_OPERATION;
    while (Date.now() < deadline) {
      if (await cancelButton.isVisible().catch(() => false)) {
        await this.robustClick(cancelButton);
        await this.migrationModal.waitFor({ state: 'hidden', timeout: TestTimeouts.DEFAULT });
        return;
      }
      if (await completed.isVisible().catch(() => false)) {
        throw new Error('Storage migration completed before cancel could be applied');
      }
      await this.page.waitForTimeout(100);
    }
    throw new Error('Timed out waiting for cancel control during storage migration');
  }

  async navigateToStorageMigrationPlans(namespace: string): Promise<void> {
    const crdRef =
      'migrations.kubevirt.io~v1alpha1~MultiNamespaceVirtualMachineStorageMigrationPlan';
    await this.goTo(`/k8s/ns/${namespace}/${crdRef}`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getMigrationPlanProgress(): Promise<{ percentage: number; title: string }> {
    // 4.22 plans list may use data-test status cells or a plain progressbar + status text.
    const statusCell = this.locator('[data-test^="storage-migration-status-"]')
      .or(this.page.getByRole('progressbar'))
      .or(this.page.getByText(/Completed|In progress|Failed/i))
      .first();
    await statusCell.waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
    const progressBar = this.page.getByRole('progressbar').first();
    const ariaValue =
      (await progressBar.getAttribute('aria-valuenow').catch(() => null)) ??
      (await statusCell.getAttribute('aria-valuenow').catch(() => null)) ??
      '0';
    const percentage = Number.parseInt(ariaValue, 10);
    const titleFromTestId = await this.locator('[data-test^="storage-migration-status-title-"]')
      .first()
      .textContent()
      .catch(() => null);
    const titleFromText = await this.page
      .getByText(/Completed|In progress|Failed|Succeeded/i)
      .first()
      .textContent()
      .catch(() => null);
    const title = (titleFromTestId ?? titleFromText ?? '').trim();
    return { percentage: Number.isNaN(percentage) ? 0 : percentage, title };
  }
}
