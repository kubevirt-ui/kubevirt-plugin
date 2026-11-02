import { expect, test } from '@component-deps/fixtures/scene-component-fixture';

import { SCENE_BOOTABLE_VOLUME_NAME } from '@component-deps/stories/virt-page-fixtures';
import { WizardSceneStep } from '@component-deps/stories/wizard-scene-constants';

test.describe('VM wizard — creation method and deployment UI', () => {
  test('clone method hides name field and allows Next without a VM name', async ({ vmWizard }) => {
    await vmWizard.selectSceneCreationMethod('clone');

    await expect(vmWizard.getVmNameInput()).toHaveCount(0);
    await expect(vmWizard.wizardFooterNext()).toBeEnabled();
    await vmWizard.clickNext();
    await expect(vmWizard.wizardNavLinkByStepId(WizardSceneStep.CLONE)).toHaveAttribute(
      'aria-current',
      'step',
    );
  });

  test('switching creation method toggles general info (name) section', async ({ vmWizard }) => {
    await vmWizard.selectSceneCreationMethod('template');
    await expect(vmWizard.getVmNameInput()).toBeVisible();

    await vmWizard.selectSceneCreationMethod('clone');
    await expect(vmWizard.getVmNameInput()).toHaveCount(0);

    await vmWizard.selectSceneCreationMethod('instance-type');
    await expect(vmWizard.getVmNameInput()).toBeVisible();
  });
});

test.describe('VM wizard — sidebar navigation gating (template flow)', () => {
  test('later steps stay disabled until deployment has a valid VM name', async ({ vmWizard }) => {
    await vmWizard.selectSceneCreationMethod('template');

    await expect(vmWizard.wizardNavItem('Template')).toBeVisible();
    await expect(vmWizard.wizardNavItem('Template')).toBeDisabled();
    await expect(vmWizard.wizardNavItem(/Customization/)).toBeDisabled();
    await expect(vmWizard.wizardNavItem(/Review and create/)).toBeDisabled();

    await vmWizard.fillVmName('nav-gating-vm');
    await expect(vmWizard.getVmNameInput()).toHaveValue('nav-gating-vm');

    await expect(vmWizard.wizardNavItem('Template')).toBeEnabled();
    await expect(vmWizard.wizardNavItem(/Customization/)).toBeDisabled();
  });

  test('jump to Template via nav after deployment is valid', async ({ vmWizard }) => {
    await vmWizard.selectSceneCreationMethod('template');
    await vmWizard.fillVmName('nav-jump-vm');
    await expect(vmWizard.getVmNameInput()).toHaveValue('nav-jump-vm');

    await vmWizard.jumpToWizardNavStep('Template');
    await expect(vmWizard.wizardNavLinkByStepId(WizardSceneStep.TEMPLATE)).toHaveAttribute(
      'aria-current',
      'step',
    );
    await expect(vmWizard.wizardNavLinkByStepId(WizardSceneStep.DEPLOYMENT_DETAILS)).not.toHaveAttribute(
      'aria-current',
      'step',
    );
    await expect(vmWizard.getSceneRoot().getByTestId('scene-rhel-template')).toBeVisible();
  });
});

test.describe('VM wizard — back / forward (template flow)', () => {
  test('Back from template returns to deployment and preserves VM name', async ({ vmWizard }) => {
    await vmWizard.selectSceneCreationMethod('template');
    await vmWizard.fillVmName('back-nav-vm');
    await expect(vmWizard.getVmNameInput()).toHaveValue('back-nav-vm');
    await vmWizard.clickNext();
    await expect(vmWizard.wizardNavLinkByStepId(WizardSceneStep.TEMPLATE)).toHaveAttribute(
      'aria-current',
      'step',
    );
    await expect(vmWizard.wizardFooterBack()).toBeVisible();
    await expect(vmWizard.wizardFooterBack()).toBeEnabled();

    await vmWizard.clickWizardBackButton();
    await expect(vmWizard.wizardNavLinkByStepId(WizardSceneStep.DEPLOYMENT_DETAILS)).toHaveAttribute(
      'aria-current',
      'step',
    );
    await expect(vmWizard.getVmNameInput()).toHaveValue('back-nav-vm');
    await expect(vmWizard.wizardFooterBack()).toBeDisabled();
  });
});

test.describe('VM wizard — clone flow navigation', () => {
  test('clone source step gates Next until a VM is selected', async ({ vmWizard }) => {
    await vmWizard.selectSceneCreationMethod('clone');
    await vmWizard.clickNext();
    await expect(vmWizard.wizardNavLinkByStepId(WizardSceneStep.CLONE)).toHaveAttribute(
      'aria-current',
      'step',
    );

    await expect(vmWizard.wizardFooterNext()).toBeDisabled();
    await vmWizard.selectSceneCloneSource();
    await expect(vmWizard.wizardFooterNext()).toBeEnabled();

    await vmWizard.clickNext();
    await expect(vmWizard.wizardNavLinkByStepId(WizardSceneStep.REVIEW_AND_CREATE)).toHaveAttribute(
      'aria-current',
      'step',
    );
  });
});

test.describe('VM wizard — boot source step', () => {
  test('No boot source hides Add volume and table; Boot volume restores them', async ({
    vmWizard,
  }) => {
    await vmWizard.selectSceneCreationMethod('instance-type');
    await vmWizard.completeDeploymentDetailsForScene();
    await vmWizard.clickNext();
    await vmWizard.completeGuestOsStepForScene();
    await vmWizard.clickNext();

    await expect(vmWizard.wizardNavLinkByStepId(WizardSceneStep.BOOT_SOURCE)).toHaveAttribute(
      'aria-current',
      'step',
    );

    await expect(vmWizard.bootSourceAddVolumeButton()).toBeVisible();
    await expect(vmWizard.bootSourceVolumeTable()).toBeVisible();
    await expect(vmWizard.bootSourceVolumeRow(SCENE_BOOTABLE_VOLUME_NAME)).toBeVisible();

    await vmWizard.selectNoBootSource();
    await expect(vmWizard.bootSourceAddVolumeButton()).toHaveCount(0);
    await expect(vmWizard.bootSourceVolumeTable()).toHaveCount(0);

    await vmWizard.selectBootVolumeSourceOption();
    await expect(vmWizard.bootSourceAddVolumeButton()).toBeVisible();
    await expect(vmWizard.bootSourceVolumeTable()).toBeVisible();
    await expect(vmWizard.bootSourceVolumeRow(SCENE_BOOTABLE_VOLUME_NAME)).toBeVisible();

    await vmWizard.selectBootVolumeByName(SCENE_BOOTABLE_VOLUME_NAME);
    await expect(vmWizard.bootSourceVolumeRow(SCENE_BOOTABLE_VOLUME_NAME)).toHaveClass(
      /pf-m-selected/,
    );
  });
});

test.describe('VM wizard — instance-type step gating', () => {
  test('boot source and compute gate Next (guest OS pre-filled for RHEL defaults)', async ({
    vmWizard,
  }) => {
    await vmWizard.selectSceneCreationMethod('instance-type');
    await vmWizard.completeDeploymentDetailsForScene();
    await vmWizard.clickNext();
    await expect(vmWizard.wizardNavLinkByStepId(WizardSceneStep.GUEST_OS)).toHaveAttribute(
      'aria-current',
      'step',
    );
    await expect(vmWizard.wizardFooterNext()).toBeEnabled();
    await vmWizard.clickNext();

    await expect(vmWizard.wizardNavLinkByStepId(WizardSceneStep.BOOT_SOURCE)).toHaveAttribute(
      'aria-current',
      'step',
    );
    await expect(vmWizard.wizardFooterNext()).toBeDisabled();
    await vmWizard.completeBootSourceStepForScene();
    await expect(vmWizard.wizardFooterNext()).toBeEnabled();
    await vmWizard.clickNext();

    await expect(vmWizard.wizardNavLinkByStepId(WizardSceneStep.COMPUTE_RESOURCES)).toHaveAttribute(
      'aria-current',
      'step',
    );
    await expect(vmWizard.wizardFooterNext()).toBeDisabled();
    await vmWizard.completeComputeResourcesStepForScene();
    await expect(vmWizard.wizardFooterNext()).toBeEnabled();
  });

  test('switching guest OS family updates tile selection and guest OS type preference', async ({
    vmWizard,
  }) => {
    await vmWizard.selectSceneCreationMethod('instance-type');
    await vmWizard.completeDeploymentDetailsForScene();
    await vmWizard.clickNext();
    await expect(vmWizard.wizardNavLinkByStepId(WizardSceneStep.GUEST_OS)).toHaveAttribute(
      'aria-current',
      'step',
    );

    await expect(vmWizard.guestOsTile('RHEL')).toHaveClass(/operating-system-tile--selected/);
    await expect(vmWizard.guestOsTile('OTHER_LINUX')).not.toHaveClass(
      /operating-system-tile--selected/,
    );
    await expect(vmWizard.guestOsPreferenceButton('rhel.9')).toBeVisible();

    await vmWizard.selectGuestOsTileByTestId('OTHER_LINUX');
    await expect(vmWizard.guestOsTile('OTHER_LINUX')).toHaveClass(/operating-system-tile--selected/);
    await expect(vmWizard.guestOsTile('RHEL')).not.toHaveClass(/operating-system-tile--selected/);
    await expect(vmWizard.guestOsPreferenceButton('centos.stream9')).toBeVisible();

    await vmWizard.selectGuestOsTileByTestId('RHEL');
    await expect(vmWizard.guestOsTile('RHEL')).toHaveClass(/operating-system-tile--selected/);
    await expect(vmWizard.guestOsPreferenceButton('rhel.9')).toBeVisible();
  });

  test('instance-type nav: compute stays disabled until guest OS path is complete', async ({
    vmWizard,
  }) => {
    await vmWizard.selectSceneCreationMethod('instance-type');
    await vmWizard.completeDeploymentDetailsForScene();
    await vmWizard.clickNext();
    await expect(vmWizard.wizardNavLinkByStepId(WizardSceneStep.GUEST_OS)).toHaveAttribute(
      'aria-current',
      'step',
    );

    await expect(vmWizard.wizardNavItem(/Compute resources/)).toBeDisabled();
    await vmWizard.completeGuestOsStepForScene();
    await vmWizard.clickNext();
    await vmWizard.completeBootSourceStepForScene();
    await vmWizard.clickNext();

    await expect(vmWizard.wizardNavLinkByStepId(WizardSceneStep.COMPUTE_RESOURCES)).toHaveAttribute(
      'aria-current',
      'step',
    );
    await expect(vmWizard.wizardNavItem(/Customization/)).toBeDisabled();
  });
});
