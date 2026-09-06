import { expect } from '@playwright/test';

import type {
  VmWizardBootSourcePage,
  VmWizardComputeCustomizationPage,
  VmWizardNavigationPage,
} from '@/page-objects';

export async function completeDeploymentDetailsStep(
  vmWizardNavigationPage: VmWizardNavigationPage,
): Promise<void> {
  const tilesVisible = await vmWizardNavigationPage.verifyCreationMethodTilesVisible();
  expect.soft(tilesVisible, 'Creation method tiles should be visible').toBe(true);

  const isCustomSelected = await vmWizardNavigationPage.verifyCreationMethodCardSelected('newVm');
  expect.soft(isCustomSelected, 'Custom configuration should be selected by default').toBe(true);

  await vmWizardNavigationPage.generateVmName();
  await vmWizardNavigationPage.clickNext();
}

export async function completeGuestOsStep(
  vmWizardNavigationPage: VmWizardNavigationPage,
): Promise<void> {
  const osTilesVisible = await vmWizardNavigationPage.verifyOsTilesVisible();
  expect.soft(osTilesVisible, 'OS tiles (RHEL, Windows, Other Linux) should be visible').toBe(true);

  const osDropdownVisible = await vmWizardNavigationPage.verifyOsTypeDropdownVisible();
  expect.soft(osDropdownVisible, 'OS type dropdown should be visible').toBe(true);

  const selectedOs = await vmWizardNavigationPage.getSelectedOsType();
  expect.soft(selectedOs.length, 'An OS type should be pre-selected').toBeGreaterThan(0);

  await vmWizardNavigationPage.clickNext();
}

export async function completeBootSourceStep(
  vmWizardBootSourcePage: VmWizardBootSourcePage,
  vmWizardNavigationPage: VmWizardNavigationPage,
): Promise<void> {
  const bootStepVisible = await vmWizardBootSourcePage.verifyBootSourceStepVisible();
  expect.soft(bootStepVisible, 'Boot source step should be visible').toBe(true);

  const tableVisible = await vmWizardBootSourcePage.verifyBootVolumeTableOrEmptyState();
  expect.soft(tableVisible, 'Boot volume table or empty state should be visible').toBe(true);

  const volumeCount = await vmWizardBootSourcePage.getBootVolumeCount();
  if (volumeCount > 0) {
    const columnsVisible = await vmWizardBootSourcePage.verifyBootVolumeTableColumnsVisible();
    expect.soft(columnsVisible, 'Boot volume table columns should be visible').toBe(true);

    await vmWizardBootSourcePage.selectBootVolumeByName('rhel');
  } else {
    await vmWizardBootSourcePage.selectNoBootSource();
  }

  await vmWizardNavigationPage.clickNext();
}

export async function verifyComputeResourcesStep(
  vmWizardComputePage: VmWizardComputeCustomizationPage,
): Promise<void> {
  const computeVisible = await vmWizardComputePage.verifyComputeResourcesStepVisible();
  expect.soft(computeVisible, 'Compute resources step should be visible').toBe(true);

  const seriesVisible = await vmWizardComputePage.verifyInstanceTypeSeriesVisible();
  expect.soft(seriesVisible, 'Instance type series cards should be visible').toBe(true);

  await vmWizardComputePage.selectInstanceTypeSeries('u');
  await vmWizardComputePage.selectComputeSize('medium');

  const sizeText = await vmWizardComputePage.getComputeSizeDropdownText();
  expect.soft(sizeText, 'A medium compute size should be selected').toContain('CPUs');
}

export async function completeComputeResourcesStep(
  vmWizardComputePage: VmWizardComputeCustomizationPage,
  vmWizardNavigationPage: VmWizardNavigationPage,
): Promise<void> {
  await verifyComputeResourcesStep(vmWizardComputePage);
  await vmWizardNavigationPage.clickNext();
}
