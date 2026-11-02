import { expect, test } from '@component-deps/fixtures/scene-component-fixture';

import { WizardSceneStep } from '@component-deps/stories/wizard-scene-constants';

test.describe('VM creation wizard (component gallery example)', () => {
  test('deployment step — footer chrome and Next gating', async ({ vmWizard }) => {
    await vmWizard.selectSceneCreationMethod('template');

    await expect(vmWizard.wizardFooterBack()).toBeDisabled();
    await expect(vmWizard.page.getByTestId('wizard-cancel-button')).toBeEnabled();

    await expect(vmWizard.wizardFooterNext()).toBeVisible();
    await expect(vmWizard.wizardFooterNext()).toBeDisabled();
    await expect(vmWizard.getVmNameInput()).toHaveValue('');

    await vmWizard.generateVmName();
    await expect(vmWizard.getVmNameInput()).not.toHaveValue('');
    await expect(vmWizard.wizardFooterNext()).toBeEnabled();
  });

  test('deployment step — invalid VM name validation', async ({ vmWizard }) => {
    await vmWizard.selectSceneCreationMethod('template');
    await vmWizard.fillVmName('my-vm-');
    await expect(vmWizard.getVmNameInput()).toHaveValue('my-vm-');
    await expect(vmWizard.wizardFooterNext()).toBeEnabled();

    await vmWizard.triggerDeploymentNameValidation();

    await expect(
      vmWizard
        .getSceneRoot()
        .getByText(
          /lowercase RFC 1123|must consist of lower case alphanumeric|Maximum name length/i,
        ),
    ).toBeVisible();
    await expect(vmWizard.wizardFooterNext()).toBeDisabled();
    await expect(vmWizard.wizardNavLinkByStepId(WizardSceneStep.DEPLOYMENT_DETAILS)).toHaveAttribute(
      'aria-current',
      'step',
    );

    await vmWizard.fillVmName('valid-vm-name');
    await expect(vmWizard.getVmNameInput()).toHaveValue('valid-vm-name');
    await expect(vmWizard.wizardFooterNext()).toBeEnabled();
  });

  test('template step — Next disabled until a template is selected', async ({ vmWizard }) => {
    await vmWizard.selectSceneCreationMethod('template');
    await vmWizard.completeDeploymentDetailsForScene();
    await vmWizard.clickNext();
    await expect(vmWizard.wizardNavLinkByStepId(WizardSceneStep.TEMPLATE)).toHaveAttribute(
      'aria-current',
      'step',
    );

    await expect(vmWizard.wizardFooterNext()).toBeDisabled();
    await vmWizard.selectSceneTemplateCatalogTile();
    await expect(vmWizard.wizardFooterNext()).toBeEnabled();
  });

  test('template flow — deployment → template → customization → review', async ({ vmWizard }) => {
    await vmWizard.selectSceneCreationMethod('template');
    await vmWizard.completeDeploymentDetailsForScene();
    await vmWizard.clickNext();
    await expect(vmWizard.wizardNavLinkByStepId(WizardSceneStep.TEMPLATE)).toHaveAttribute(
      'aria-current',
      'step',
    );
    await vmWizard.selectSceneTemplateCatalogTile();
    await vmWizard.clickNext();
    await expect(vmWizard.wizardNavLinkByStepId(WizardSceneStep.CUSTOMIZATION)).toHaveAttribute(
      'aria-current',
      'step',
    );
    await vmWizard.clickNext();
    await expect(
      vmWizard.wizardNavLinkByStepId(WizardSceneStep.REVIEW_AND_CREATE),
    ).toHaveAttribute('aria-current', 'step');
    await expect(vmWizard.createVirtualMachineButton()).toBeVisible();
  });
});
