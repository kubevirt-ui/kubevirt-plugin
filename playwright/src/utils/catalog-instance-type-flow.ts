import type { CatalogPage } from '@/page-objects/catalog-page';
import type { VmNetworkInterfacesPage } from '@/page-objects/vm-network-interfaces-page';
import type { VmWizardPage } from '@/page-objects/vm-wizard-page';
import {
  CATALOG_INSTANCE_TYPES_BOOT_VOLUME,
  DEFAULT_RED_HAT_INSTANCE_TYPE_SERIES,
} from '@/utils/constants';
import { TestTimeouts } from '@/utils/test-config';
import { expect } from '@playwright/test';

/** Catalog and wizard page objects share the instance-type create surface. */
type InstanceTypeCatalogSurface = CatalogPage | VmWizardPage;

/** `true` when `/vm-wizard` instance-type flow is available (not legacy `templatescatalog`). */
export async function prepareInstanceTypeWizardOrLegacyCatalog(
  vmWizardPage: InstanceTypeCatalogSurface,
  namespace: string,
): Promise<boolean> {
  return await vmWizardPage.prepareInstanceTypeWizardEntry(namespace);
}

export async function createLinuxVmViaInstanceTypesWizardOrLegacyCatalog(
  vmWizardPage: InstanceTypeCatalogSurface,
  options: {
    bootVolumeName: string;
    folderName?: string;
    namespace: string;
    series: RegExp | string;
    vmName: string;
  },
): Promise<void> {
  const wizardReady = await vmWizardPage.prepareInstanceTypeWizardEntry(options.namespace);
  if (wizardReady) {
    await vmWizardPage.selectGuestOsTile('RHEL');
    await vmWizardPage.selectFirstBootableVolumeInWizard();
    await vmWizardPage.selectRedHatInstanceTypeSeries(
      typeof options.series === 'string' ? options.series : 'n',
    );
    await vmWizardPage.openInstanceTypeCustomizationStep();
    await vmWizardPage.fillCustomizeVmName(options.vmName);
    await vmWizardPage.submitCustomizeToReview();
    if (options.folderName) {
      // Folder review helpers live on VmWizardPage; CatalogPage shares the create path.
      const wizardWithFolder = vmWizardPage as VmWizardPage;
      await expect(wizardWithFolder.reviewWizardFolderRow()).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
      await wizardWithFolder.setReviewWizardFolder(options.folderName);
    }
    await vmWizardPage.createVirtualMachineFromReview();
    return;
  }
  await vmWizardPage.openCatalogInNamespace(options.namespace);
  await vmWizardPage.createVirtualMachineFromInstanceTypesCatalog({
    bootVolumeName: options.bootVolumeName,
    folderName: options.folderName,
    series: options.series,
    vmName: options.vmName,
  });
}

export type InstanceTypeNetworkFlowMode = 'legacy' | 'wizard';

/** Opens wizard network customization or legacy InstanceTypes VM details step. */
export async function openInstanceTypeNetworkCustomizationOrLegacyDetails(
  vmWizardPage: InstanceTypeCatalogSurface,
  namespace: string,
  networks: VmNetworkInterfacesPage,
): Promise<InstanceTypeNetworkFlowMode> {
  const wizardReady = await vmWizardPage.prepareInstanceTypeWizardEntry(namespace);
  if (wizardReady) {
    await vmWizardPage.selectGuestOsTile('RHEL');
    await vmWizardPage.selectFirstBootableVolumeInWizard();
    await vmWizardPage.selectRedHatInstanceTypeSeries('n');
    await vmWizardPage.openInstanceTypeCustomizationStep();
    await vmWizardPage.openInstanceTypeCustomizationSubTab('network');
    await networks.waitForNetworkTabReady();
    return 'wizard';
  }
  await vmWizardPage.openCatalogInNamespace(namespace);
  await vmWizardPage.prepareInstanceTypesCatalogTab();
  await vmWizardPage.selectBootableVolumeForInstanceTypes(CATALOG_INSTANCE_TYPES_BOOT_VOLUME);
  await vmWizardPage.selectInstanceTypeSeriesAndSize(DEFAULT_RED_HAT_INSTANCE_TYPE_SERIES);
  return 'legacy';
}

export async function createWindowsVmViaWizardLegacyCatalogOrLinuxFallback(
  vmWizardPage: InstanceTypeCatalogSurface,
  namespace: string,
  vmName: string,
): Promise<'linux' | 'windows'> {
  await vmWizardPage.openCatalogInNamespace(namespace);
  const legacy = vmWizardPage.isLegacyTemplatesCatalogRoute();
  if (!legacy) {
    const wizardReady = await vmWizardPage.prepareInstanceTypeWizardEntry(namespace);
    if (wizardReady) {
      const windowsTile = vmWizardPage.guestOsTile('WINDOWS');
      if (await windowsTile.isVisible({ timeout: TestTimeouts.ELEMENT_WAIT }).catch(() => false)) {
        await vmWizardPage.selectGuestOsTile('WINDOWS');
        await vmWizardPage.selectFirstBootableVolumeInWizard();
        await vmWizardPage.selectRedHatInstanceTypeSeries('n');
        await vmWizardPage.openInstanceTypeCustomizationStep();
        await vmWizardPage.fillCustomizeVmName(vmName);
        await vmWizardPage.submitCustomizeToReview();
        await vmWizardPage.createVirtualMachineFromReview();
        return 'windows';
      }
    }
  } else {
    await vmWizardPage.prepareInstanceTypesCatalogTab();
    const windowsRow = vmWizardPage.instanceTypeRowMatching(/windows/i).first();
    if (await windowsRow.isVisible({ timeout: TestTimeouts.ELEMENT_WAIT }).catch(() => false)) {
      await vmWizardPage.selectBootableVolumeForInstanceTypesIfPresent(/windows/i);
      await vmWizardPage.selectInstanceTypeSeriesAndSize(DEFAULT_RED_HAT_INSTANCE_TYPE_SERIES);
      await vmWizardPage.instanceTypeVmNameInput().fill(vmName);
      await vmWizardPage.acceptInstanceTypesDeveloperPreviewIfPrompted();
      await vmWizardPage.instanceTypeCreateVirtualMachineButton().click();
      return 'windows';
    }
  }
  await vmWizardPage.openCatalogInNamespace(namespace);
  await vmWizardPage.prepareInstanceTypesCatalogTab();
  const selected = await vmWizardPage.selectBootableVolumeForInstanceTypesIfPresent(
    /fedora|rhel9/i,
  );
  if (!selected) {
    const fallbackRow = vmWizardPage.instanceTypeRowMatching(/rhel|fedora|centos/i).first();
    await fallbackRow.waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
    await fallbackRow.click();
  }
  await vmWizardPage.selectInstanceTypeSeriesAndSize(DEFAULT_RED_HAT_INSTANCE_TYPE_SERIES);
  await vmWizardPage.instanceTypeVmNameInput().fill(vmName);
  await vmWizardPage.acceptInstanceTypesDeveloperPreviewIfPrompted();
  await vmWizardPage.instanceTypeCreateVirtualMachineButton().click();
  return 'linux';
}
