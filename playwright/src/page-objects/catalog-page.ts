import FilterToolbarComponent from '@/components/shared/filter-toolbar-component';
import BasePage from '@/page-objects/base-page';
import { dismissConsoleObstructions } from '@/utils/console-modals';
import { CatalogReviewTabTestId } from '@/utils/constants';
import { SECOND, TestTimeouts } from '@/utils/test-config';
import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

/** Virtualization → Catalog (`/k8s/ns/<ns>/templatescatalog`). */
export class CatalogPage extends BasePage {
  private readonly catalogFilterToolbar: FilterToolbarComponent;

  constructor(page: Page) {
    super(page);
    this.catalogFilterToolbar = new FilterToolbarComponent(page);
  }

  readonly gridSelector = '#vm-catalog-grid';
  readonly filterTextSelector = '#filter-text-input';

  catalogGrid(): Locator {
    return this.page.locator(this.gridSelector);
  }

  filterTextInput(): Locator {
    return this.page.locator(this.filterTextSelector);
  }

  gridLinkWithText(text: string): Locator {
    return this.catalogGrid().locator('a').filter({ hasText: text }).first();
  }

  gridLinks(): Locator {
    return this.page.locator(`${this.gridSelector} a`);
  }

  customizeButton(): Locator {
    return this.consoleTestId('customize-vm-btn');
  }

  customizeNameInput(): Locator {
    return this.locator('#vm-customize-NAME').or(this.consoleTestId('vm-name-input')).first();
  }

  createVirtualMachineButton(): Locator {
    return this.page.getByRole('button', { name: /Create VirtualMachine/i });
  }

  catalogFilterPanel(): Locator {
    return this.page
      .locator('#filter-toolbar, .co-catalog-page__filters, [data-test="catalog-filters"]')
      .or(this.osNameFilterGroup());
  }

  osNameFilterGroup(): Locator {
    return this.page
      .locator('fieldset[aria-labelledby="osName"]')
      .or(this.page.getByText('Operating system', { exact: true }));
  }

  workloadFilterGroup(): Locator {
    return this.page
      .locator('fieldset[aria-labelledby="workload"]')
      .or(this.page.getByText('Workload', { exact: true }));
  }

  async openCatalogInNamespace(namespace: string): Promise<void> {
    await this.page.goto(`/k8s/ns/${namespace}/templatescatalog`, {
      waitUntil: 'domcontentloaded',
    });
    await this.catalogGrid().waitFor({ state: 'visible', timeout: 90 * SECOND });
  }

  async openCatalogPrepared(namespace: string): Promise<void> {
    await this.openCatalogInNamespace(namespace);
    await dismissConsoleObstructions(this.page);
  }

  async startCustomizeFlowOnReviewNetworksTab(
    templateMetadataName: string,
    vmName: string,
  ): Promise<void> {
    await this.startCustomizeFlow(templateMetadataName, vmName);
    await this.goToReviewWizardTab(CatalogReviewTabTestId.Networks);
  }

  async expectLoadedInNamespace(namespace: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`/ns/${namespace}/templatescatalog`));
    await expect(this.catalogGrid()).toBeVisible({ timeout: 90 * SECOND });
  }

  async getGridLinkCount(): Promise<number> {
    return await this.gridLinks().count();
  }

  templateTileByMetadataName(metadataName: string): Locator {
    return this.consoleTestId(metadataName).or(
      this.page.locator('.vm-catalog-grid-tile').filter({ hasText: metadataName }),
    );
  }

  async selectTemplateByMetadataName(metadataName: string): Promise<void> {
    const tile = this.templateTileByMetadataName(metadataName);
    await tile.first().waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
    await tile.first().click();
  }

  /** Narrow the grid to Windows templates, then select the Win10 tile by metadata name. */
  async selectWindowsTemplate(metadataName = 'windows10-desktop-medium'): Promise<void> {
    await this.openCatalogFilterToolbar();
    await this.filterByOsCheckbox('osName-Windows', true);
    await this.selectTemplateByMetadataName(metadataName);
  }

  diskBootSourceSection(): Locator {
    return this.page.locator('[data-test-id="disk-boot-source"]');
  }

  async openDiskSourceOptionsMenu(): Promise<void> {
    await this.diskBootSourceSection().getByRole('button', { name: 'Options menu' }).click();
  }

  async selectDiskSourceHttp(imageUrl: string): Promise<void> {
    await this.openDiskSourceOptionsMenu();
    await this.page.getByRole('option', { name: /URL \(creates PVC\)/ }).click();
    await this.page.locator('[data-test-id="disk-boot-source-http-source-input"]').fill(imageUrl);
  }

  async selectDiskSourceRegistry(containerImage: string): Promise<void> {
    await this.openDiskSourceOptionsMenu();
    await this.page.getByRole('option', { name: /Registry \(creates PVC\)/ }).click();
    await this.page
      .locator('[data-test-id="disk-boot-source-container-source-input"]')
      .fill(containerImage);
  }

  async selectDiskSourceBlank(): Promise<void> {
    await this.openDiskSourceOptionsMenu();
    await this.page.getByRole('option', { name: /Blank Create a new blank PVC/ }).click();
  }

  async setCustomizeDiskSizeGiB(giB: number): Promise<void> {
    const spin = this.page
      .locator('.customize-vm')
      .getByRole('spinbutton', { name: 'Input' })
      .first();
    await spin.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    const current = await spin.inputValue();
    if (current === String(giB)) {
      return;
    }
    await spin.click({ clickCount: 3 });
    await spin.pressSequentially(String(giB));
  }

  async expectReviewRootdiskOnDisksTab(sizeGiB?: number): Promise<void> {
    await this.goToReviewWizardTab(CatalogReviewTabTestId.Disks);
    await expect(this.page.getByText('rootdisk', { exact: false }).first()).toBeVisible({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    if (sizeGiB !== undefined) {
      await expect(this.page.getByText(new RegExp(`${sizeGiB}\\s*GiB`, 'i')).first()).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
    } else {
      await expect(this.page.getByText(/\d+\s*GiB/i).first()).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
    }
  }

  async expectReviewRootdiskSizeGiB(giB: number): Promise<void> {
    await this.expectReviewRootdiskOnDisksTab(giB);
  }

  pvcCloneProjectDropdown(): Locator {
    return this.page.locator(
      '[data-test-id="disk-boot-source-pvc-select-project-select-dropdown"]',
    );
  }

  pvcCloneNameDropdown(): Locator {
    return this.page.locator(
      '[data-test-id="disk-boot-source-pvc-select-pvc-name-select-dropdown"]',
    );
  }

  async ensureDiskSourcePvcCloneSelected(): Promise<void> {
    const menu = this.diskBootSourceSection().getByRole('button', { name: 'Options menu' }).first();
    const label = (await menu.textContent()) ?? '';
    if (/PVC \(clone PVC\)/i.test(label)) {
      return;
    }
    await this.openDiskSourceOptionsMenu();
    await this.page.locator('[data-test-id="pvc-clone"]').click();
  }

  async selectPvcCloneProject(pvcNamespace: string): Promise<void> {
    await this.pvcCloneProjectDropdown().getByRole('button').click();
    await this.page.getByRole('option', { name: pvcNamespace }).click();
  }

  async selectPvcCloneNameByPrefix(pvcNamePrefix: string): Promise<void> {
    await this.pvcCloneNameDropdown().getByRole('button').click();
    await this.page
      .getByRole('option')
      .filter({ hasText: new RegExp(`^${pvcNamePrefix}`) })
      .first()
      .click();
  }

  /** Cypress `DiskSource.PVC` — clone PVC from another namespace. */
  async selectDiskSourcePvcClone(pvcNamespace: string, pvcNamePrefix: string): Promise<void> {
    await this.ensureDiskSourcePvcCloneSelected();
    await this.selectPvcCloneProject(pvcNamespace);
    await this.pvcCloneNameDropdown().waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.selectPvcCloneNameByPrefix(pvcNamePrefix);
  }

  async createWindowsVmCustomizeFlow(
    vmName: string,
    configureDiskSource: () => Promise<void>,
    review: { rootDiskSizeGiB?: number } = {},
  ): Promise<void> {
    await this.openCustomizeWizard();
    await this.customizePageHeading().waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.fillCustomizeVmName(vmName);
    await configureDiskSource();
    if (review.rootDiskSizeGiB !== undefined) {
      await this.setCustomizeDiskSizeGiB(review.rootDiskSizeGiB);
    }
    await this.submitCustomizeToReview();
    await this.expectReviewRootdiskOnDisksTab(review.rootDiskSizeGiB);
    await this.createVirtualMachineFromReview();
  }

  /** HTTP / URL disk source (Cypress `DiskSource.URL`, CNV-8925). */
  async createWindowsVmFromIsoCustomizeFlow(
    vmName: string,
    imageUrl: string,
    rootDiskSizeGiB: number,
  ): Promise<void> {
    await this.createWindowsVmCustomizeFlow(vmName, () => this.selectDiskSourceHttp(imageUrl), {
      rootDiskSizeGiB,
    });
  }

  /** Registry disk source (Cypress `DiskSource.REGISTRY`). */
  async createWindowsVmFromRegistryCustomizeFlow(
    vmName: string,
    containerImage: string,
    rootDiskSizeGiB: number,
  ): Promise<void> {
    await this.createWindowsVmCustomizeFlow(
      vmName,
      () => this.selectDiskSourceRegistry(containerImage),
      { rootDiskSizeGiB },
    );
  }

  /** Blank PVC disk source (no cluster boot source). */
  async createWindowsVmFromBlankCustomizeFlow(
    vmName: string,
    rootDiskSizeGiB: number,
  ): Promise<void> {
    await this.createWindowsVmCustomizeFlow(vmName, () => this.selectDiskSourceBlank(), {
      rootDiskSizeGiB,
    });
  }

  async createWindowsVmWithDiskSourceInCatalog(
    namespace: string,
    vmName: string,
    configureDiskSource: () => Promise<void>,
    review: { rootDiskSizeGiB?: number } = {},
  ): Promise<void> {
    await this.openCatalogInNamespace(namespace);
    await this.selectWindowsTemplate();
    await this.createWindowsVmCustomizeFlow(vmName, configureDiskSource, review);
  }

  async createWindowsVmFromIsoInCatalog(
    namespace: string,
    vmName: string,
    imageUrl: string,
    rootDiskSizeGiB: number,
  ): Promise<void> {
    await this.createWindowsVmWithDiskSourceInCatalog(
      namespace,
      vmName,
      () => this.selectDiskSourceHttp(imageUrl),
      { rootDiskSizeGiB },
    );
  }

  async quickCreateVm(vmName: string): Promise<void> {
    await this.customizeButton().click();
    const nameInput = this.page
      .locator('#vm-customize-NAME, [data-test-id="vm-name-input"]')
      .first();
    await nameInput.waitFor({ state: 'visible', timeout: 90 * SECOND });
    await nameInput.fill(vmName);
    await this.page.locator('[data-test-id="customize-vm-submit-button"]').click();
    await this.createVirtualMachineButton().click();
    const noBs = this.page.getByRole('button', { name: 'Create with no available boot source' });
    if (await noBs.isVisible({ timeout: 3 * SECOND }).catch(() => false)) {
      await noBs.click();
    }
  }

  async filterByOsCheckbox(testId: string, checked: boolean): Promise<void> {
    await this.catalogFilterToolbar.setCatalogCheckboxFilter(testId, checked);
  }

  async openCustomizeWizard(): Promise<void> {
    await this.customizeButton().click();
    await this.page.waitForURL(/templatescatalog\/customize/, {
      timeout: TestTimeouts.LONG_OPERATION,
    });
  }

  customizePageHeading(): Locator {
    return this.page.getByRole('heading', { name: /Customize Template parameters/i });
  }

  customizeNextButton(): Locator {
    return this.page.locator('[data-test-id="customize-vm-submit-button"]');
  }

  reviewWizardHeading(): Locator {
    return this.page.getByRole('heading', { name: /Review and create VirtualMachine/i });
  }

  reviewWizardTab(testId: string): Locator {
    return this.consoleTestId(testId);
  }

  async fillCustomizeVmName(name: string): Promise<void> {
    await this.customizeNameInput().waitFor({
      state: 'visible',
      timeout: TestTimeouts.LONG_OPERATION,
    });
    await this.customizeNameInput().fill(name);
  }

  async submitCustomizeToReview(): Promise<void> {
    await this.customizeNextButton().click();
    await this.page.waitForURL(/templatescatalog\/review/, {
      timeout: TestTimeouts.LONG_OPERATION,
    });
    await this.reviewWizardHeading().waitFor({
      state: 'visible',
      timeout: TestTimeouts.LONG_OPERATION,
    });
  }

  async goToReviewWizardTab(testId: string): Promise<void> {
    await this.reviewWizardTab(testId).click();
    await this.page.waitForURL(/templatescatalog\/review/, {
      timeout: TestTimeouts.LONG_OPERATION,
    });
  }

  async goToCustomizeWizardTab(testId: string): Promise<void> {
    await this.reviewWizardTab(testId).click();
    await this.page.waitForURL(/templatescatalog\/customize/, {
      timeout: TestTimeouts.LONG_OPERATION,
    });
  }

  async openCustomizeNetworkInterfacesTab(
    projectNamespace: string,
    templateMetadataName: string,
    options: { templateNamespace?: string; vmName?: string } = {},
  ): Promise<void> {
    const templateNamespace = options.templateNamespace ?? 'openshift-virtualization-os-images';
    const vmNameQuery = options.vmName ? `&vmName=${encodeURIComponent(options.vmName)}` : '';
    await this.page.goto(
      `/k8s/ns/${projectNamespace}/templatescatalog/customize/network-interfaces?name=${templateMetadataName}&namespace=${templateNamespace}&defaultSourceExists=true${vmNameQuery}`,
      { waitUntil: 'domcontentloaded' },
    );
    await this.page
      .getByRole('button', { name: /Add network interface/i })
      .waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
  }

  async createVirtualMachineFromReview(): Promise<void> {
    const createBtn = this.page
      .locator('[data-test-id="create-virtual-machine"]')
      .getByRole('button', { name: /Create VirtualMachine/i });
    await createBtn.waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
    await createBtn.click();
    const noBs = this.page.getByRole('button', { name: 'Create with no available boot source' });
    if (await noBs.isVisible({ timeout: 3 * SECOND }).catch(() => false)) {
      await noBs.click();
    }
    await this.page.waitForURL(/kubevirt\.io~v1~VirtualMachine\/[^/]+$/, {
      timeout: TestTimeouts.LONG_OPERATION,
    });
  }

  /**
   * Catalog tile → customize parameters → review wizard (does not create the VM).
   */
  async startCustomizeFlow(templateMetadataName: string, vmName: string): Promise<void> {
    await this.selectTemplateByMetadataName(templateMetadataName);
    await this.openCustomizeWizard();
    await this.customizePageHeading().waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.fillCustomizeVmName(vmName);
    await this.submitCustomizeToReview();
  }

  async openCatalogFilterToolbar(): Promise<void> {
    await this.catalogFilterToolbar.openCatalogFilterPanelIfClosed(this.osNameFilterGroup());
  }

  async filterByText(text: string): Promise<void> {
    await this.catalogFilterToolbar.filterCatalogByText(text);
  }
}
