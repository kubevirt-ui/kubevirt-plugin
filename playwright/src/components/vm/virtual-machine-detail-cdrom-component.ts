/**
 * VirtualMachine instance disks tab — CD-ROM mount/eject flows.
 */

import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export default class VirtualMachineDetailCdromComponent extends BaseComponent {
  private readonly _btnPlaceholderSelectISOFile = this.locator(
    'button[placeholder="Select ISO file"]',
  );
  private readonly _fileInput = this.locator('[data-test-id="disk-source-upload"] [type="file"]');
  private readonly _inputIdSimpleFileFilename = this.locator('input[id="simple-file-filename"]');
  private readonly _tabModal = this.locator('#tab-modal');
  private readonly _tabModalSaveButton = this.locator('#tab-modal [data-test="save-button"]');

  constructor(page: Page) {
    super(page);
  }

  async ejectCdrom(diskName: string): Promise<boolean> {
    try {
      const diskRow = this.page.locator('tr').filter({ hasText: diskName }).first();
      await diskRow.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });

      const kebabMenu = diskRow.locator(
        'button.pf-v6-c-menu-toggle.pf-m-plain, [data-test="kebab-button"], [data-test-id="kebab-button"], button[aria-label="Actions"], button[aria-label="Kebab toggle"]',
      );
      await kebabMenu.first().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await this.robustClick(kebabMenu.first());
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      const ejectBtn = this.page
        .locator(
          '[role="menuitem"]:has-text("Eject"), [role="option"]:has-text("Eject"), button:has-text("Eject")',
        )
        .first();
      await ejectBtn.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await this.robustClick(ejectBtn);

      try {
        await this._tabModalSaveButton.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_DELAY_LONG,
        });
        await this.robustClick(this._tabModalSaveButton);
      } catch {
        // eject may not require a confirmation modal
      }

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
      return true;
    } catch {
      return false;
    }
  }

  async ejectCdromByVolumeName(volumeName: string): Promise<boolean> {
    try {
      const kebab = this.page.locator(`#disk-actions-${volumeName}`);
      await kebab.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
      await kebab.click({ force: true });
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

      const ejectItem = this.page.getByRole('menuitem', { name: 'Eject' });
      await ejectItem.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await ejectItem.click({ force: true });

      const dialogEjectButton = this.page.locator(
        '[data-test="dialog-modal"] [data-test="save-button"]',
      );
      await dialogEjectButton.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
      await this.robustClick(dialogEjectButton);

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
      return true;
    } catch {
      return false;
    }
  }

  async getMountCDROMModalOptions(diskName: string): Promise<{
    title: string;
    radioLabels: string[];
    defaultSelected: string;
    hasUploadModeSelector: boolean;
  }> {
    try {
      const diskRow = this.locator('tr', { hasText: diskName }).first();
      await diskRow.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });

      const kebabMenu = diskRow.locator(
        'button.pf-v6-c-menu-toggle.pf-m-plain, [data-test="kebab-button"], [data-test-id="kebab-button"], button[aria-label="Actions"], button[aria-label="Kebab toggle"]',
      );
      await kebabMenu.first().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await this.robustClick(kebabMenu.first());
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      const mountBtn = this.page
        .locator(
          '[role="menuitem"]:has-text("Mount"), [role="option"]:has-text("Mount"), button:has-text("Mount")',
        )
        .first();
      await mountBtn.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await this.robustClick(mountBtn);

      const modal = this._tabModal;
      await modal.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

      const title =
        (
          await modal
            .locator('h1, h2')
            .first()
            .textContent()
            .catch(() => '')
        )?.trim() ?? '';

      const radioInputs = modal.locator('input[type="radio"][name="cdrom-source"]');
      const count = await radioInputs.count();
      const radioLabels: string[] = [];
      let defaultSelected = '';
      for (let i = 0; i < count; i++) {
        const radio = radioInputs.nth(i);
        const id = (await radio.getAttribute('id')) ?? '';
        const label =
          (
            await modal
              .locator(`label[for="${id}"]`)
              .textContent()
              .catch(() => '')
          )?.trim() ?? '';
        radioLabels.push(label);
        if (await radio.isChecked()) {
          defaultSelected = label;
        }
      }

      const hasUploadModeSelector = await modal
        .locator(
          '[data-test="upload-mode-selector"], select[id*="upload-mode"], [id*="upload-type"]',
        )
        .isVisible()
        .catch(() => false);

      await modal.locator('button:has-text("Cancel")').click();
      await modal
        .waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT })
        .catch(() => null);

      return { title, radioLabels, defaultSelected, hasUploadModeSelector };
    } catch {
      return { title: '', radioLabels: [], defaultSelected: '', hasUploadModeSelector: false };
    }
  }

  /**
   * Returns a column value from the VMI Disks tab table.
   * VMI tables use data-test (not data-test-id) selectors.
   */
  async getVmiDiskColumnValue(
    diskName: string,
    column: 'drive' | 'interface' | 'name' | 'source' | 'size',
  ): Promise<string | null> {
    try {
      const cell = this.locator(`[data-test="disk-${column}-${diskName}"]`).first();
      const visible = await cell
        .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
        .catch(() => false);
      if (visible) {
        return (await cell.textContent())?.trim() || null;
      }
      const columnIndex: Record<string, number> = {
        name: 1,
        source: 2,
        drive: 3,
        size: 4,
        interface: 5,
      };
      const idx = columnIndex[column];
      if (idx) {
        const row = this.locator('tr').filter({ hasText: diskName }).first();
        const td = row.locator(`td:nth-child(${idx})`).first();
        const tdVisible = await td
          .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
          .catch(() => false);
        if (tdVisible) {
          return (await td.textContent())?.trim() || null;
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  async mountCdrom(
    diskName: string,
    source: string,
    sourceType: 'pvc' | 'upload' = 'pvc',
  ): Promise<boolean> {
    try {
      const diskRow = this.locator('tr', { hasText: diskName }).first();
      await diskRow.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });

      const kebabMenu = diskRow.locator(
        'button.pf-v6-c-menu-toggle.pf-m-plain, [data-test="kebab-button"], [data-test-id="kebab-button"], button[aria-label="Actions"], button[aria-label="Kebab toggle"]',
      );
      await kebabMenu.first().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await this.robustClick(kebabMenu.first());
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      const mountBtn = this.page
        .locator(
          '[role="menuitem"]:has-text("Mount"), [role="option"]:has-text("Mount"), button:has-text("Mount")',
        )
        .first();
      await mountBtn.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await this.robustClick(mountBtn);

      if (sourceType === 'upload') {
        const fileInput = this._inputIdSimpleFileFilename;
        await fileInput.waitFor({
          state: 'attached',
          timeout: TestTimeouts.UI_ACTION_COMPLETE,
        });

        await this._fileInput.setInputFiles(source);

        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
      } else {
        const selectIsoButton = this._btnPlaceholderSelectISOFile;
        await selectIsoButton.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_ACTION_COMPLETE,
        });
        await selectIsoButton.click();

        const isoOption = this.locator(`button[id="select-inline-filter-${source}"]`);
        await isoOption.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
        await isoOption.click();
      }

      await this.robustClick(this._tabModalSaveButton);

      await this._tabModal
        .waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT })
        .catch(async () => {
          throw new Error('Mount CD-ROM modal failed to close');
        });

      return true;
    } catch {
      return false;
    }
  }

  async navigateToVmiDisksTab(vmName: string, namespace: string): Promise<void> {
    await this.goTo(`/k8s/ns/${namespace}/kubevirt.io~v1~VirtualMachineInstance/${vmName}/disks`);
    await this.locator('[aria-label="Disks table"]')
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
  }
}
