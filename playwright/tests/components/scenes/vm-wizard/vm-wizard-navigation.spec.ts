import { expect, test } from '@component-deps/fixtures/scene-component-fixture';

import { WizardSceneStep } from '@component-deps/stories/wizard-scene-constants';

test.describe.configure({ mode: 'serial' });

test.describe('VM wizard — creation method and deployment UI', () => {
  test('clone method hides name field and allows Next without a VM name', async ({ vmWizard }) => {
    await vmWizard.selectSceneCreationMethod('clone');

    await expect(vmWizard.getVmNameInput()).toHaveCount(0);
    await vmWizard.expectFooterNextEnabled(true);
    await vmWizard.clickNext();
    await vmWizard.expectStepActiveById(WizardSceneStep.CLONE);
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

    await vmWizard.expectWizardNavItemEnabled('Template', false);
    await vmWizard.expectWizardNavItemEnabled(/Customization/, false);
    await vmWizard.expectWizardNavItemEnabled(/Review and create/, false);

    await vmWizard.fillVmNameExpectingValue('nav-gating-vm');

    await vmWizard.expectWizardNavItemEnabled('Template', true);
    await vmWizard.expectWizardNavItemEnabled(/Customization/, false);
  });

  test('jump to Template via nav after deployment is valid', async ({ vmWizard }) => {
    await vmWizard.selectSceneCreationMethod('template');
    await vmWizard.fillVmNameExpectingValue('nav-jump-vm');

    await vmWizard.jumpToWizardNavStep('Template');
    await vmWizard.expectStepActiveById(WizardSceneStep.TEMPLATE);
    await vmWizard.expectStepInactiveById(WizardSceneStep.DEPLOYMENT_DETAILS);
    await expect(vmWizard.getSceneRoot().getByTestId('scene-rhel-template')).toBeVisible();
  });
});

test.describe('VM wizard — back / forward (template flow)', () => {
  test('Back from template returns to deployment and preserves VM name', async ({ vmWizard }) => {
    await vmWizard.selectSceneCreationMethod('template');
    await vmWizard.fillVmNameExpectingValue('back-nav-vm');
    await vmWizard.clickNext();
    await vmWizard.expectStepActiveById(WizardSceneStep.TEMPLATE);
    await vmWizard.expectFooterBackEnabled(true);

    await vmWizard.clickWizardBackButton();
    await vmWizard.expectStepActiveById(WizardSceneStep.DEPLOYMENT_DETAILS);
    await expect(vmWizard.getVmNameInput()).toHaveValue('back-nav-vm');
    await vmWizard.expectFooterBackEnabled(false);
  });
});

test.describe('VM wizard — clone flow navigation', () => {
  test('clone source step gates Next until a VM is selected', async ({ vmWizard }) => {
    await vmWizard.selectSceneCreationMethod('clone');
    await vmWizard.clickNext();
    await vmWizard.expectStepActiveById(WizardSceneStep.CLONE);

    await vmWizard.expectFooterNextEnabled(false);
    await vmWizard.selectSceneCloneSource();
    await vmWizard.expectFooterNextEnabled(true);

    await vmWizard.clickNext();
    await vmWizard.expectStepActiveById(WizardSceneStep.REVIEW_AND_CREATE);
  });
});

test.describe('VM wizard — instance-type step gating', () => {
  test('boot source and compute gate Next (guest OS pre-filled for RHEL defaults)', async ({
    vmWizard,
  }) => {
    await vmWizard.selectSceneCreationMethod('instance-type');
    await vmWizard.completeDeploymentDetailsForScene();
    await vmWizard.clickNext();
    await vmWizard.expectStepActiveById(WizardSceneStep.GUEST_OS);
    await vmWizard.expectFooterNextEnabled(true);
    await vmWizard.clickNext();

    await vmWizard.expectStepActiveById(WizardSceneStep.BOOT_SOURCE);
    await vmWizard.expectFooterNextEnabled(false);
    await vmWizard.completeBootSourceStepForScene();
    await vmWizard.expectFooterNextEnabled(true);
    await vmWizard.clickNext();

    await vmWizard.expectStepActiveById(WizardSceneStep.COMPUTE_RESOURCES);
    await vmWizard.expectFooterNextEnabled(false);
    await vmWizard.completeComputeResourcesStepForScene();
    await vmWizard.expectFooterNextEnabled(true);
  });

  test('switching guest OS family updates tile selection and guest OS type preference', async ({
    vmWizard,
  }) => {
    await vmWizard.selectSceneCreationMethod('instance-type');
    await vmWizard.completeDeploymentDetailsForScene();
    await vmWizard.clickNext();
    await vmWizard.expectStepActiveById(WizardSceneStep.GUEST_OS);

    await vmWizard.expectGuestOsTileSelected('RHEL', true);
    await vmWizard.expectGuestOsTileSelected('OTHER_LINUX', false);
    await vmWizard.expectGuestOsPreferenceVisible('rhel.9');

    await vmWizard.selectGuestOsTileByTestId('OTHER_LINUX');
    await vmWizard.expectGuestOsTileSelected('OTHER_LINUX', true);
    await vmWizard.expectGuestOsTileSelected('RHEL', false);
    await vmWizard.expectGuestOsPreferenceVisible('centos.stream9');

    await vmWizard.selectGuestOsTileByTestId('RHEL');
    await vmWizard.expectGuestOsTileSelected('RHEL', true);
    await vmWizard.expectGuestOsPreferenceVisible('rhel.9');
  });

  test('instance-type nav: compute stays disabled until guest OS path is complete', async ({
    vmWizard,
  }) => {
    await vmWizard.selectSceneCreationMethod('instance-type');
    await vmWizard.completeDeploymentDetailsForScene();
    await vmWizard.clickNext();
    await vmWizard.expectStepActiveById(WizardSceneStep.GUEST_OS);

    await vmWizard.expectWizardNavItemEnabled(/Compute resources/, false);
    await vmWizard.completeGuestOsStepForScene();
    await vmWizard.clickNext();
    await vmWizard.completeBootSourceStepForScene();
    await vmWizard.clickNext();

    await vmWizard.expectStepActiveById(WizardSceneStep.COMPUTE_RESOURCES);
    await vmWizard.expectWizardNavItemEnabled(/Customization/, false);
  });
});
