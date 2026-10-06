import { expect, type Locator } from '@playwright/test';

import { WizardSceneStep } from '../../../../stories/wizard-scene-constants';
import { SCENE_BOOTABLE_VOLUME_NAME, SCENE_TEMPLATE_NAME, SCENE_VM_NAME } from '../../../../stories/virt-page-fixtures';

export const WIZARD_STORY = 'scenes/vm-wizard/VmCreationWizardShell/Default';

/** PF6 assigns step `id` to nav links; active step is `aria-current="step"`. */
export const wizardNavLinkByStepId = (root: Locator, stepId: string): Locator =>
  root.locator(`.pf-v6-c-wizard__nav-link#${stepId}`);

export const wizardNav = (root: Locator): Locator => root.locator('.pf-v6-c-wizard__nav');

export const wizardNavItem = (root: Locator, stepName: string | RegExp): Locator =>
  wizardNav(root).getByRole('button', { name: stepName });

/** Wizard footers render outside the step panel; only the active step footer is shown. */
export const wizardFooterNext = (root: Locator): Locator => root.getByTestId('wizard-next-button');

export const wizardFooterBack = (root: Locator): Locator => root.getByTestId('wizard-back-button');

export const vmNameInput = (root: Locator): Locator => root.locator('#vm-name');

export const expectWizardNextEnabled = async (root: Locator, enabled: boolean): Promise<void> => {
  const next = wizardFooterNext(root);
  await expect(next).toBeVisible();
  if (enabled) {
    await expect(next).toBeEnabled();
  } else {
    await expect(next).toBeDisabled();
  }
};

export const expectWizardBackEnabled = async (root: Locator, enabled: boolean): Promise<void> => {
  const back = wizardFooterBack(root);
  await expect(back).toBeVisible();
  if (enabled) {
    await expect(back).toBeEnabled();
  } else {
    await expect(back).toBeDisabled();
  }
};

export const expectWizardNavItemEnabled = async (
  root: Locator,
  stepName: string | RegExp,
  enabled: boolean,
): Promise<void> => {
  const item = wizardNavItem(root, stepName);
  await expect(item).toBeVisible();
  if (enabled) {
    await expect(item).toBeEnabled();
  } else {
    await expect(item).toBeDisabled();
  }
};

export const clickWizardNext = async (root: Locator): Promise<void> => {
  const next = wizardFooterNext(root).filter({ hasText: 'Next' });
  await expect(next).toBeEnabled();
  await next.click();
};

export const clickWizardBack = async (root: Locator): Promise<void> => {
  const back = wizardFooterBack(root);
  await expect(back).toBeEnabled();
  await back.click();
};

export const jumpToWizardNavStep = async (root: Locator, stepName: string | RegExp): Promise<void> => {
  const item = wizardNavItem(root, stepName);
  await expect(item).toBeEnabled();
  await item.click();
};

export const selectCreationMethod = async (
  root: Locator,
  method: 'template' | 'instance-type' | 'clone',
): Promise<void> => {
  await root.getByTestId(`creation-method-${method}`).click();
};

export const generateWizardVmName = async (root: Locator): Promise<void> => {
  await root.getByTestId('generate-vm-name-button').click();
};

export const fillWizardVmName = async (root: Locator, name: string): Promise<void> => {
  const input = vmNameInput(root);
  await input.fill(name);
  await expect(input).toHaveValue(name);
};

export const expectWizardStepActive = async (
  root: Locator,
  stepId: (typeof WizardSceneStep)[keyof typeof WizardSceneStep],
): Promise<void> => {
  await expect(wizardNavLinkByStepId(root, stepId)).toHaveAttribute('aria-current', 'step');
};

export const expectWizardStepInactive = async (
  root: Locator,
  stepId: (typeof WizardSceneStep)[keyof typeof WizardSceneStep],
): Promise<void> => {
  await expect(wizardNavLinkByStepId(root, stepId)).not.toHaveAttribute('aria-current', 'step');
};

export const completeDeploymentDetailsForNamedFlows = async (root: Locator): Promise<void> => {
  await generateWizardVmName(root);
};

export const selectTemplateCatalogTile = async (root: Locator): Promise<void> => {
  await root.getByTestId(SCENE_TEMPLATE_NAME).click();
};

export const selectCloneSourceVm = async (root: Locator): Promise<void> => {
  await root.getByText(SCENE_VM_NAME, { exact: true }).first().click();
};

export type GuestOsTileType = 'RHEL' | 'OTHER_LINUX' | 'WINDOWS';

export const guestOsTile = (root: Locator, os: GuestOsTileType): Locator =>
  root.getByTestId(`os-tile-${os}`);

export const selectGuestOsTile = async (root: Locator, os: GuestOsTileType): Promise<void> => {
  await guestOsTile(root, os).click();
};

export const expectGuestOsTileSelected = async (
  root: Locator,
  os: GuestOsTileType,
  selected: boolean,
): Promise<void> => {
  const tile = guestOsTile(root, os);
  if (selected) {
    await expect(tile).toHaveClass(/operating-system-tile--selected/);
  } else {
    await expect(tile).not.toHaveClass(/operating-system-tile--selected/);
  }
};

export const expectGuestOsPreferenceToggle = async (
  root: Locator,
  preferenceName: string | RegExp,
): Promise<void> => {
  await expect(root.getByRole('button', { name: preferenceName })).toBeVisible();
};

export const completeGuestOsStep = async (root: Locator): Promise<void> => {
  await selectGuestOsTile(root, 'RHEL');
  await expectGuestOsPreferenceToggle(root, 'rhel.9');
};

export const completeBootSourceStep = async (root: Locator): Promise<void> => {
  const volumeCell = root.getByTestId(SCENE_BOOTABLE_VOLUME_NAME);
  if (await volumeCell.isVisible()) {
    await volumeCell.click();
    return;
  }
  await root.getByLabel('No boot source').click();
};

export const completeComputeResourcesStep = async (root: Locator): Promise<void> => {
  await root.getByTestId('instance-type-series-u1').click();
  const sizeToggle = root.getByRole('button', { name: /small:|Select size/ });
  await sizeToggle.click();
  await root.page().getByTestId('instance-type-size-medium').click();
};

export const expectReviewStepReady = async (root: Locator): Promise<void> => {
  await expectWizardStepActive(root, WizardSceneStep.REVIEW_AND_CREATE);
  await expect(root.getByTestId('create-virtual-machine')).toBeVisible();
};

/** Clicks Next on deployment when name is invalid to surface strict DNS-1123 validation. */
export const triggerDeploymentNameStrictValidation = async (root: Locator): Promise<void> => {
  await wizardFooterNext(root).click();
};
