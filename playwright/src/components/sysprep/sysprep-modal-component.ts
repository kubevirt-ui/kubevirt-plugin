import BaseComponent from '@/components/shared/base-component';
import {
  SYSPREP_SAMPLE_AUTOUNATTEND_XML,
  SYSPREP_SAMPLE_UNATTEND_XML,
} from '@/utils/sysprep-test-helpers';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export default class SysprepModalComponent extends BaseComponent {
  constructor(page: Page) {
    super(page);
  }

  private get sysprepModal() {
    return this.page.locator('#tab-modal').filter({
      has: this.page.getByRole('heading', { name: 'Sysprep' }),
    });
  }

  async openSysprepModal(): Promise<void> {
    const editButton = this.testId('sysprep-button-edit');
    await editButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(editButton);
    await this.sysprepModal.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
  }

  async selectNone(): Promise<void> {
    await this.robustClick(this.consoleTestId('sysprep-selection-none'));
  }

  async selectUseExisting(): Promise<void> {
    await this.robustClick(this.consoleTestId('sysprep-selection-use-existing'));
  }

  async selectCreateNew(): Promise<void> {
    await this.robustClick(this.consoleTestId('sysprep-selection-create-new'));
  }

  async fillCreateNewSysprep(
    autounattend = SYSPREP_SAMPLE_AUTOUNATTEND_XML,
    unattend = SYSPREP_SAMPLE_UNATTEND_XML,
  ): Promise<void> {
    await this.fillSysprepField('autounattend', autounattend);
    await this.fillSysprepField('unattend', unattend);
  }

  async selectExistingSysprep(configMapName: string): Promise<void> {
    const toggle = this.sysprepModal.locator('#select-sysprep');
    await toggle.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(toggle);

    const option = this.page
      .getByRole('option', { name: configMapName })
      .or(this.page.getByRole('menuitem', { name: configMapName }));
    await option.first().waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(option.first());
  }

  async saveSysprepModal(): Promise<void> {
    const saveButton = this.sysprepModal.getByTestId('save-button');
    await saveButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

    const start = Date.now();
    while (Date.now() - start < TestTimeouts.ELEMENT_WAIT) {
      if (await saveButton.isEnabled()) {
        break;
      }
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MICRO);
    }

    await this.robustClick(saveButton);
    await this.sysprepModal
      .waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT })
      .catch(() => undefined);
  }

  async getDisplayedSysprepName(): Promise<string | null> {
    const section = this.testId('sysprep-button');
    const link = section.getByRole('link');

    if (await link.isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM }).catch(() => false)) {
      return (await link.textContent())?.trim() ?? null;
    }

    return null;
  }

  async isSysprepNotAvailable(): Promise<boolean> {
    const section = this.testId('sysprep-button');
    return section.getByText('Not available').isVisible();
  }

  async runCreateDetachAttachFlow(): Promise<string> {
    await this.openSysprepModal();
    await this.selectCreateNew();
    await this.fillCreateNewSysprep();
    await this.saveSysprepModal();

    const createdName = await this.getDisplayedSysprepName();
    if (!createdName) {
      throw new Error('Expected sysprep ConfigMap name after creating a new sysprep');
    }

    await this.openSysprepModal();
    await this.selectNone();
    await this.saveSysprepModal();

    if (!(await this.isSysprepNotAvailable())) {
      throw new Error('Expected sysprep to show Not available after detaching');
    }

    await this.openSysprepModal();
    await this.selectUseExisting();
    await this.selectExistingSysprep(createdName);
    await this.saveSysprepModal();

    const reattachedName = await this.getDisplayedSysprepName();
    if (reattachedName !== createdName) {
      throw new Error(`Expected sysprep ${createdName} to be re-attached, got ${reattachedName}`);
    }

    return createdName;
  }

  private async fillSysprepField(
    field: 'autounattend' | 'unattend',
    value: string,
  ): Promise<void> {
    const testId =
      field === 'autounattend' ? 'sysprep-autounattend-xml-input' : 'sysprep-unattend-xml-input';
    const fieldLocator = this.sysprepModal.getByTestId(testId);
    const textarea = fieldLocator.locator('textarea');

    await textarea.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await textarea.fill(value);
  }
}
