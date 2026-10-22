import BasePage from '@/page-objects/base-page';
import type { VmDetailPage } from '@/page-objects/vm-detail-page';
import { pollUntil } from '@/utils/poll-until';
import { TestTimeouts } from '@/utils/test-config';
import type { Locator } from '@playwright/test';

/** VM detail configuration / snapshots tab interactions (CRUD). */
export class VmDetailTabsPage extends BasePage {
  async addContainerEphemeralDisk(diskName: string, image: string): Promise<void> {
    await this.openAddDiskModal();
    const dialog = this.page.getByRole('dialog').filter({
      has: this.addDiskModalHeading(),
    });
    await dialog.locator('[data-test-id="disk-source-select"]').click();
    const containerSource = this.page
      .getByTestId('disk-source-select-containerDisk')
      .or(this.page.getByRole('option', { name: /Container \(Ephemeral\)/i }))
      .or(this.page.getByRole('menuitem', { name: /Container \(Ephemeral\)/i }));
    await this.robustClick(containerSource.first());
    await dialog.locator('[data-test-id="disk-source-container"]').fill(image);
    const nameInput = dialog.locator('#name');
    await nameInput.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await nameInput.fill(diskName);
    const save = dialog.getByRole('button', { name: /^Save$/i });
    await pollUntil(async () => await save.isEnabled(), {
      message: 'Add disk Save should be enabled',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.robustClick(save);
    await dialog.waitFor({ state: 'hidden', timeout: TestTimeouts.LONG_OPERATION });
    await pollUntil(
      async () =>
        await this.diskRow(diskName)
          .first()
          .isVisible()
          .catch(() => false),
      {
        message: `Disk row ${diskName} should appear after save`,
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
  }

  addDiskButton(): Locator {
    return this.page
      .getByRole('button', { name: /Add disk/i })
      .or(this.page.locator('.disk-list-page__list-page-create-button'));
  }

  addDiskModalHeading(): Locator {
    return this.page.getByRole('heading', { name: /Add disk/i });
  }

  async addEnvironmentConfigMap(configMapName: string): Promise<void> {
    await this.robustClick(
      this.page.getByRole('button', { name: /Add Config Map, Secret or Service Account/i }),
    );
    const row = this.page.locator('.pairs-list__row').last();
    await row.getByRole('button', { name: /Select a resource|Options menu/i }).click();
    const search = row.getByRole('searchbox');
    if (await search.isVisible().catch(() => false)) {
      await search.fill(configMapName);
    }
    await this.page.getByRole('option', { name: new RegExp(configMapName) }).click();
    await this.robustClick(this.page.getByRole('button', { name: /^Save$/i }).last());
    await pollUntil(
      async () => (await this.environmentConfigMapReference(configMapName).count()) > 0,
      {
        message: `Environment should reference ConfigMap ${configMapName}`,
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
  }

  async cancelAddDiskModal(): Promise<void> {
    const dialog = this.page.getByRole('dialog').filter({ has: this.addDiskModalHeading() });
    await this.robustClick(dialog.getByRole('button', { name: /^Cancel$/i }));
    await dialog.waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT });
  }

  async createSnapshot(snapshotName: string): Promise<boolean> {
    await this.robustClick(this.takeSnapshotButton());
    const dialog = this.page.getByRole('dialog', { name: /Take snapshot/i });
    await dialog.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    const unsupported = dialog.getByText(/No disks included in this snapshot/i);
    if (await unsupported.isVisible().catch(() => false)) {
      await dialog.getByRole('button', { name: /^Cancel$/i }).click();
      return false;
    }
    await dialog.locator('#name').fill(snapshotName);
    const save = dialog.getByRole('button', { name: /^Save$/i });
    await this.robustClick(save);
    await dialog.waitFor({ state: 'hidden', timeout: TestTimeouts.LONG_OPERATION });
    await this.page
      .getByRole('link', { name: snapshotName })
      .or(this.page.getByText(snapshotName))
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
    return true;
  }

  async deleteSnapshot(snapshotName: string): Promise<void> {
    const row = this.page
      .getByRole('row')
      .filter({ has: this.page.getByRole('link', { name: snapshotName }) })
      .first();
    await this.robustClick(row.locator('.dropdown-kebab-pf button, button').last());
    await this.robustClick(this.page.getByRole('menuitem', { name: /^Delete$/i }).first());
    const dialog = this.page
      .getByRole('dialog')
      .filter({ hasText: /Delete VirtualMachineSnapshot/i });
    await this.robustClick(dialog.getByRole('button', { name: /^Delete$/i }).first());
    await dialog.waitFor({ state: 'hidden', timeout: TestTimeouts.LONG_OPERATION });
  }

  async detachDisk(diskName: string): Promise<void> {
    const row = this.diskRow(diskName).first();
    await this.robustClick(row.locator('button').last());
    const detachItem = this.page
      .getByRole('menuitem', { name: /^Detach$/i })
      .or(this.page.locator('.pf-v6-c-menu, .pf-c-dropdown__menu').getByText(/^Detach$/i));
    await this.robustClick(detachItem.first());
    const dialog = this.page.getByRole('dialog').filter({ hasText: /disk/i });
    await this.robustClick(dialog.getByRole('button', { name: /^Detach$|^Delete$/i }).first());
    await dialog.waitFor({ state: 'hidden', timeout: TestTimeouts.LONG_OPERATION });
  }

  diskRow(diskName: string): Locator {
    return this.page.locator('[role="row"]').filter({
      has: this.page.getByText(diskName, { exact: true }),
    });
  }

  environmentConfigMapReference(configMapName: string): Locator {
    return this.page.getByRole('tabpanel', { name: /^Environment$/i }).getByText(configMapName);
  }

  async openAddDiskModal(): Promise<void> {
    await this.robustClick(this.addDiskButton());
    await this.addDiskModalHeading().waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }

  async openDisksTab(vmDetail: VmDetailPage): Promise<void> {
    await vmDetail.navigateToDisksTab();
    await this.addDiskButton().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
  }

  async openEnvironmentTab(vmDetail: VmDetailPage): Promise<void> {
    await vmDetail.goToEnvironmentTab();
    await vmDetail.environmentSectionHeading().waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }

  async openMetadataTab(vmDetail: VmDetailPage): Promise<void> {
    await vmDetail.navigateToMetadataTab();
    await pollUntil(() => Promise.resolve(this.page.url().includes('/configurations/metadata')), {
      message: 'VM metadata configuration URL should load',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }

  async openNodeSelectorModal(): Promise<void> {
    const panel = this.page.getByRole('tabpanel', { name: /^Scheduling$/i });
    await this.robustClick(
      panel.locator('[data-test-id="node-selector"]').getByRole('button').first(),
    );
    await this.page
      .getByRole('dialog')
      .filter({ hasText: /Node selector/i })
      .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
  }

  async openSchedulingTab(vmDetail: VmDetailPage): Promise<void> {
    await vmDetail.navigateToSchedulingTab();
    await this.page
      .getByText('Scheduling and resource requirements')
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
  }

  async openScriptsTab(vmDetail: VmDetailPage): Promise<void> {
    await vmDetail.navigateToScriptsTab();
    await vmDetail.scriptsConfigurationPanel().waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await vmDetail
      .scriptsTabHeading()
      .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
  }

  async openSnapshotsTab(vmDetail: VmDetailPage): Promise<void> {
    await vmDetail.navigateToSnapshotsTab();
    await this.takeSnapshotButton().waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }

  async removeLastEnvironmentRow(): Promise<void> {
    const rows = this.page.locator('.pairs-list__row');
    const countBefore = await rows.count();
    await this.robustClick(
      this.page.locator('[data-test-id="pairs-list__delete-from-btn"]').last(),
    );
    await pollUntil(async () => (await rows.count()) < countBefore, {
      message: 'Environment row should be removed from the editor',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.robustClick(this.page.getByRole('button', { name: /^Save$/i }).last());
  }

  rootDiskRow(): Locator {
    return this.diskRow('rootdisk');
  }

  async saveNodeSelectorModal(): Promise<void> {
    const dialog = this.page.getByRole('dialog').filter({ hasText: /Node selector/i });
    await this.robustClick(dialog.getByRole('button', { name: /^Save$/i }));
    await dialog.waitFor({ state: 'hidden', timeout: TestTimeouts.LONG_OPERATION });
  }

  schedulingRequirementsHeading(): Locator {
    return this.page.getByText('Scheduling and resource requirements').first();
  }

  takeSnapshotButton(): Locator {
    return this.page.getByRole('button', { name: /^Take snapshot$/i });
  }

  async updateCloudInitUser(username: string): Promise<void> {
    const panel = this.page.getByRole('tabpanel', { name: /^Scripts$/i });
    await this.robustClick(panel.getByRole('button', { name: /^Edit$/i }).first());
    const dialog = this.page.getByRole('dialog').filter({ hasText: /Cloud-init/i });
    await dialog.locator('#cloudinit-user').fill(username);
    await this.robustClick(dialog.getByRole('button', { name: /^Apply$/i }));
    await dialog.waitFor({ state: 'hidden', timeout: TestTimeouts.LONG_OPERATION });
  }
}
