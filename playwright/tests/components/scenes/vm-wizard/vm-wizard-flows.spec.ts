import { expect, test } from '@component-deps/fixtures/scene-component-fixture';

import { WizardSceneStep } from '@component-deps/stories/wizard-scene-constants';

test.describe.configure({ mode: 'serial' });

test.describe('VM creation wizard (component gallery example)', () => {
  test('deployment step — footer chrome and Next gating', async ({ vmWizard }) => {
    await vmWizard.selectSceneCreationMethod('template');

    await expect(vmWizard.wizardFooterBack()).toBeDisabled();
    await expect(vmWizard.page.getByTestId('wizard-cancel-button')).toBeEnabled();

    await vmWizard.expectFooterNextEnabled(false);
    await expect(vmWizard.getVmNameInput()).toHaveValue('');

    await vmWizard.generateVmName();
    await expect(vmWizard.getVmNameInput()).not.toHaveValue('');
    await vmWizard.expectFooterNextEnabled(true);
  });

  test('deployment step — invalid VM name validation', async ({ vmWizard }) => {
    await vmWizard.selectSceneCreationMethod('template');
    await vmWizard.fillVmNameExpectingValue('my-vm-');
    await vmWizard.expectFooterNextEnabled(true);

    await vmWizard.triggerDeploymentNameValidation();

    await expect(
      vmWizard
        .getSceneRoot()
        .getByText(
          /lowercase RFC 1123|must consist of lower case alphanumeric|Maximum name length/i,
        ),
    ).toBeVisible();
    await vmWizard.expectFooterNextEnabled(false);
    await vmWizard.expectStepActiveById(WizardSceneStep.DEPLOYMENT_DETAILS);

    await vmWizard.fillVmNameExpectingValue('valid-vm-name');
    await vmWizard.expectFooterNextEnabled(true);
  });

  test('template step — Next disabled until a template is selected', async ({ vmWizard }) => {
    await vmWizard.selectSceneCreationMethod('template');
    await vmWizard.completeDeploymentDetailsForScene();
    await vmWizard.clickNext();
    await vmWizard.expectStepActiveById(WizardSceneStep.TEMPLATE);

    await vmWizard.expectFooterNextEnabled(false);
    await vmWizard.selectSceneTemplateCatalogTile();
    await vmWizard.expectFooterNextEnabled(true);
  });

  test('template flow — deployment → template → customization → review', async ({ vmWizard }) => {
    await vmWizard.selectSceneCreationMethod('template');
    await vmWizard.completeDeploymentDetailsForScene();
    await vmWizard.clickNext();
    await vmWizard.expectStepActiveById(WizardSceneStep.TEMPLATE);
    await vmWizard.selectSceneTemplateCatalogTile();
    await vmWizard.clickNext();
    await vmWizard.expectStepActiveById(WizardSceneStep.CUSTOMIZATION);
    await vmWizard.clickNext();
    await vmWizard.expectReviewStepReady();
  });
});
