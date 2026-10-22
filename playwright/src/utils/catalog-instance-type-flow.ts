import type { CatalogPage } from '@/page-objects/catalog-page';
import type { VmNetworkInterfacesPage } from '@/page-objects/vm-network-interfaces-page';
import { DEFAULT_RED_HAT_INSTANCE_TYPE_SERIES } from '@/utils/constants';
import { TestTimeouts } from '@/utils/test-config';

/** `true` when `/vm-wizard` instance-type flow is available (not legacy `templatescatalog`). */
export async function prepareInstanceTypeWizardOrLegacyCatalog(
  catalogPage: CatalogPage,
  namespace: string,
): Promise<boolean> {
  return await catalogPage.prepareInstanceTypeWizardEntry(namespace);
}

export async function createLinuxVmViaInstanceTypesWizardOrLegacyCatalog(
  catalogPage: CatalogPage,
  options: { bootVolumeName: string; namespace: string; series: RegExp | string; vmName: string },
): Promise<void> {
  const wizardReady = await catalogPage.prepareInstanceTypeWizardEntry(options.namespace);
  if (wizardReady) {
    await catalogPage.selectGuestOsTile('RHEL');
    await catalogPage.selectFirstBootableVolumeInWizard();
    await catalogPage.selectRedHatInstanceTypeSeries(
      typeof options.series === 'string' ? options.series : 'n',
    );
    await catalogPage.openInstanceTypeCustomizationStep();
    await catalogPage.fillCustomizeVmName(options.vmName);
    await catalogPage.submitCustomizeToReview();
    await catalogPage.createVirtualMachineFromReview();
    return;
  }
  await catalogPage.openCatalogInNamespace(options.namespace);
  await catalogPage.createVirtualMachineFromInstanceTypesCatalog({
    bootVolumeName: options.bootVolumeName,
    series: options.series,
    vmName: options.vmName,
  });
}

export type InstanceTypeNetworkFlowMode = 'legacy' | 'wizard';

/** Opens wizard network customization or legacy InstanceTypes VM details step. */
export async function openInstanceTypeNetworkCustomizationOrLegacyDetails(
  catalogPage: CatalogPage,
  namespace: string,
  networks: VmNetworkInterfacesPage,
): Promise<InstanceTypeNetworkFlowMode> {
  const wizardReady = await catalogPage.prepareInstanceTypeWizardEntry(namespace);
  if (wizardReady) {
    await catalogPage.selectGuestOsTile('RHEL');
    await catalogPage.selectFirstBootableVolumeInWizard();
    await catalogPage.selectRedHatInstanceTypeSeries('n');
    await catalogPage.openInstanceTypeCustomizationStep();
    await catalogPage.openInstanceTypeCustomizationSubTab('network');
    await networks.waitForNetworkTabReady();
    return 'wizard';
  }
  await catalogPage.openCatalogInNamespace(namespace);
  await catalogPage.prepareInstanceTypesCatalogTab();
  await catalogPage.selectBootableVolumeForInstanceTypes('rhel9');
  await catalogPage.selectInstanceTypeSeriesAndSize(DEFAULT_RED_HAT_INSTANCE_TYPE_SERIES);
  return 'legacy';
}

export async function createWindowsVmViaWizardLegacyCatalogOrLinuxFallback(
  catalogPage: CatalogPage,
  namespace: string,
  vmName: string,
): Promise<'linux' | 'windows'> {
  await catalogPage.openCatalogInNamespace(namespace);
  const legacy = catalogPage.isLegacyTemplatesCatalogRoute();
  if (!legacy) {
    const wizardReady = await catalogPage.prepareInstanceTypeWizardEntry(namespace);
    if (wizardReady) {
      const windowsTile = catalogPage.guestOsTile('WINDOWS');
      if (await windowsTile.isVisible({ timeout: TestTimeouts.ELEMENT_WAIT }).catch(() => false)) {
        await catalogPage.selectGuestOsTile('WINDOWS');
        await catalogPage.selectFirstBootableVolumeInWizard();
        await catalogPage.selectRedHatInstanceTypeSeries('n');
        await catalogPage.openInstanceTypeCustomizationStep();
        await catalogPage.fillCustomizeVmName(vmName);
        await catalogPage.submitCustomizeToReview();
        await catalogPage.createVirtualMachineFromReview();
        return 'windows';
      }
    }
  } else {
    await catalogPage.prepareInstanceTypesCatalogTab();
    const windowsRow = catalogPage.instanceTypeRowMatching(/windows/i).first();
    if (await windowsRow.isVisible({ timeout: TestTimeouts.ELEMENT_WAIT }).catch(() => false)) {
      await catalogPage.selectBootableVolumeForInstanceTypesIfPresent(/windows/i);
      await catalogPage.selectInstanceTypeSeriesAndSize(DEFAULT_RED_HAT_INSTANCE_TYPE_SERIES);
      await catalogPage.instanceTypeVmNameInput().fill(vmName);
      await catalogPage.acceptInstanceTypesDeveloperPreviewIfPrompted();
      await catalogPage.instanceTypeCreateVirtualMachineButton().click();
      return 'windows';
    }
  }
  await catalogPage.openCatalogInNamespace(namespace);
  await catalogPage.prepareInstanceTypesCatalogTab();
  const selected = await catalogPage.selectBootableVolumeForInstanceTypesIfPresent(/rhel9|fedora/i);
  if (!selected) {
    const fallbackRow = catalogPage.instanceTypeRowMatching(/rhel|fedora|centos/i).first();
    await fallbackRow.waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
    await fallbackRow.click();
  }
  await catalogPage.selectInstanceTypeSeriesAndSize(DEFAULT_RED_HAT_INSTANCE_TYPE_SERIES);
  await catalogPage.instanceTypeVmNameInput().fill(vmName);
  await catalogPage.acceptInstanceTypesDeveloperPreviewIfPrompted();
  await catalogPage.instanceTypeCreateVirtualMachineButton().click();
  return 'linux';
}
