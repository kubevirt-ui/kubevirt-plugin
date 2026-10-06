import { expect, test } from '@playwright/test';

import { WizardSceneStep } from '../../../../stories/wizard-scene-constants';
import {
  clickWizardBack,
  clickWizardNext,
  completeBootSourceStep,
  completeComputeResourcesStep,
  completeDeploymentDetailsForNamedFlows,
  completeGuestOsStep,
  expectGuestOsPreferenceToggle,
  expectGuestOsTileSelected,
  selectGuestOsTile,
  expectWizardBackEnabled,
  expectWizardNavItemEnabled,
  expectWizardNextEnabled,
  expectWizardStepActive,
  expectWizardStepInactive,
  fillWizardVmName,
  jumpToWizardNavStep,
  selectCloneSourceVm,
  selectCreationMethod,
  vmNameInput,
  WIZARD_STORY,
} from './wizard-flow-helpers';

test.describe.configure({ mode: 'serial' });

test.describe('VM wizard — creation method and deployment UI', () => {
  test('clone method hides name field and allows Next without a VM name', async ({ mount }) => {
    const root = await mount(WIZARD_STORY);
    await selectCreationMethod(root, 'clone');

    await expect(vmNameInput(root)).toHaveCount(0);
    await expectWizardNextEnabled(root, true);
    await clickWizardNext(root);
    await expectWizardStepActive(root, WizardSceneStep.CLONE);
  });

  test('switching creation method toggles general info (name) section', async ({ mount }) => {
    const root = await mount(WIZARD_STORY);
    await selectCreationMethod(root, 'template');
    await expect(vmNameInput(root)).toBeVisible();

    await selectCreationMethod(root, 'clone');
    await expect(vmNameInput(root)).toHaveCount(0);

    await selectCreationMethod(root, 'instance-type');
    await expect(vmNameInput(root)).toBeVisible();
  });
});

test.describe('VM wizard — sidebar navigation gating (template flow)', () => {
  test('later steps stay disabled until deployment has a valid VM name', async ({ mount }) => {
    const root = await mount(WIZARD_STORY);
    await selectCreationMethod(root, 'template');

    await expectWizardNavItemEnabled(root, 'Template', false);
    await expectWizardNavItemEnabled(root, /Customization/, false);
    await expectWizardNavItemEnabled(root, /Review and create/, false);

    await fillWizardVmName(root, 'nav-gating-vm');

    await expectWizardNavItemEnabled(root, 'Template', true);
    await expectWizardNavItemEnabled(root, /Customization/, false);
  });

  test('jump to Template via nav after deployment is valid', async ({ mount }) => {
    const root = await mount(WIZARD_STORY);
    await selectCreationMethod(root, 'template');
    await fillWizardVmName(root, 'nav-jump-vm');

    await jumpToWizardNavStep(root, 'Template');
    await expectWizardStepActive(root, WizardSceneStep.TEMPLATE);
    await expectWizardStepInactive(root, WizardSceneStep.DEPLOYMENT_DETAILS);
    await expect(root.getByTestId('scene-rhel-template')).toBeVisible();
  });
});

test.describe('VM wizard — back / forward (template flow)', () => {
  test('Back from template returns to deployment and preserves VM name', async ({ mount }) => {
    const root = await mount(WIZARD_STORY);
    await selectCreationMethod(root, 'template');
    await fillWizardVmName(root, 'back-nav-vm');
    await clickWizardNext(root);
    await expectWizardStepActive(root, WizardSceneStep.TEMPLATE);
    await expectWizardBackEnabled(root, true);

    await clickWizardBack(root);
    await expectWizardStepActive(root, WizardSceneStep.DEPLOYMENT_DETAILS);
    await expect(vmNameInput(root)).toHaveValue('back-nav-vm');
    await expectWizardBackEnabled(root, false);
  });
});

test.describe('VM wizard — clone flow navigation', () => {
  test('clone source step gates Next until a VM is selected', async ({ mount }) => {
    const root = await mount(WIZARD_STORY);
    await selectCreationMethod(root, 'clone');
    await clickWizardNext(root);
    await expectWizardStepActive(root, WizardSceneStep.CLONE);

    await expectWizardNextEnabled(root, false);
    await selectCloneSourceVm(root);
    await expectWizardNextEnabled(root, true);

    await clickWizardNext(root);
    await expectWizardStepActive(root, WizardSceneStep.REVIEW_AND_CREATE);
  });
});

test.describe('VM wizard — instance-type step gating', () => {
  test('boot source and compute gate Next (guest OS pre-filled for RHEL defaults)', async ({ mount }) => {
    const root = await mount(WIZARD_STORY);
    await selectCreationMethod(root, 'instance-type');
    await completeDeploymentDetailsForNamedFlows(root);
    await clickWizardNext(root);
    await expectWizardStepActive(root, WizardSceneStep.GUEST_OS);
    // Form defaults to RHEL; gallery preference stub selects rhel.9 — Next is already valid here.
    await expectWizardNextEnabled(root, true);
    await clickWizardNext(root);

    await expectWizardStepActive(root, WizardSceneStep.BOOT_SOURCE);
    await expectWizardNextEnabled(root, false);
    await completeBootSourceStep(root);
    await expectWizardNextEnabled(root, true);
    await clickWizardNext(root);

    await expectWizardStepActive(root, WizardSceneStep.COMPUTE_RESOURCES);
    await expectWizardNextEnabled(root, false);
    await completeComputeResourcesStep(root);
    await expectWizardNextEnabled(root, true);
  });

  test('switching guest OS family updates tile selection and guest OS type preference', async ({
    mount,
  }) => {
    const root = await mount(WIZARD_STORY);
    await selectCreationMethod(root, 'instance-type');
    await completeDeploymentDetailsForNamedFlows(root);
    await clickWizardNext(root);
    await expectWizardStepActive(root, WizardSceneStep.GUEST_OS);

    await expectGuestOsTileSelected(root, 'RHEL', true);
    await expectGuestOsTileSelected(root, 'OTHER_LINUX', false);
    await expectGuestOsPreferenceToggle(root, 'rhel.9');

    await selectGuestOsTile(root, 'OTHER_LINUX');
    await expectGuestOsTileSelected(root, 'OTHER_LINUX', true);
    await expectGuestOsTileSelected(root, 'RHEL', false);
    await expectGuestOsPreferenceToggle(root, 'centos.stream9');

    await selectGuestOsTile(root, 'RHEL');
    await expectGuestOsTileSelected(root, 'RHEL', true);
    await expectGuestOsPreferenceToggle(root, 'rhel.9');
  });

  test('instance-type nav: compute stays disabled until guest OS path is complete', async ({
    mount,
  }) => {
    const root = await mount(WIZARD_STORY);
    await selectCreationMethod(root, 'instance-type');
    await completeDeploymentDetailsForNamedFlows(root);
    await clickWizardNext(root);
    await expectWizardStepActive(root, WizardSceneStep.GUEST_OS);

    await expectWizardNavItemEnabled(root, /Compute resources/, false);
    await completeGuestOsStep(root);
    await clickWizardNext(root);
    await completeBootSourceStep(root);
    await clickWizardNext(root);

    await expectWizardStepActive(root, WizardSceneStep.COMPUTE_RESOURCES);
    await expectWizardNavItemEnabled(root, /Customization/, false);
  });
});
