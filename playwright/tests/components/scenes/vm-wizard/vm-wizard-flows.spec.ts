import { expect, test } from '@playwright/test';

import { expectGalleryStoryReflectsState } from '../../gallery-assertions';
import { WizardSceneStep } from '../../../../stories/wizard-scene-constants';
import {
  clickWizardNext,
  completeDeploymentDetailsForNamedFlows,
  expectReviewStepReady,
  expectWizardNextEnabled,
  expectWizardStepActive,
  fillWizardVmName,
  generateWizardVmName,
  selectCreationMethod,
  selectTemplateCatalogTile,
  triggerDeploymentNameStrictValidation,
  vmNameInput,
  WIZARD_STORY,
} from './wizard-flow-helpers';

test.describe.configure({ mode: 'serial' });

test.describe('VM creation wizard (component gallery example)', () => {
  test('deployment step — creation methods visible', async ({ mount, page }) => {
    const root = await expectGalleryStoryReflectsState(mount, page, WIZARD_STORY, [
      { id: 'scene-vm-creation-wizard', type: 'visibleTestId' },
      { id: 'creation-method-template', type: 'visibleTestId' },
      { id: 'creation-method-instance-type', type: 'visibleTestId' },
      { id: 'creation-method-clone', type: 'visibleTestId' },
      { id: 'wizard-next-button', type: 'visibleTestId' },
    ]);

    await expectWizardStepActive(root, WizardSceneStep.DEPLOYMENT_DETAILS);
  });

  test('deployment step — footer chrome and Next gating', async ({ mount }) => {
    const root = await mount(WIZARD_STORY);
    await selectCreationMethod(root, 'template');

    await expect(root.getByTestId('wizard-back-button')).toBeDisabled();
    await expect(root.getByTestId('wizard-cancel-button')).toBeEnabled();

    await expectWizardNextEnabled(root, false);
    await expect(vmNameInput(root)).toHaveValue('');

    await generateWizardVmName(root);
    await expect(vmNameInput(root)).not.toHaveValue('');
    await expectWizardNextEnabled(root, true);
  });

  test('deployment step — invalid VM name validation', async ({ mount }) => {
    const root = await mount(WIZARD_STORY);
    await selectCreationMethod(root, 'template');
    // Lenient validation allows a trailing hyphen while typing; Next then enforces strict DNS-1123.
    await fillWizardVmName(root, 'my-vm-');
    await expectWizardNextEnabled(root, true);

    await triggerDeploymentNameStrictValidation(root);

    await expect(
      root.getByText(
        /lowercase RFC 1123|must consist of lower case alphanumeric|Maximum name length/i,
      ),
    ).toBeVisible();
    await expectWizardNextEnabled(root, false);
    await expectWizardStepActive(root, WizardSceneStep.DEPLOYMENT_DETAILS);

    await fillWizardVmName(root, 'valid-vm-name');
    await expectWizardNextEnabled(root, true);
  });

  test('template step — Next disabled until a template is selected', async ({ mount }) => {
    const root = await mount(WIZARD_STORY);
    await selectCreationMethod(root, 'template');
    await completeDeploymentDetailsForNamedFlows(root);
    await clickWizardNext(root);
    await expectWizardStepActive(root, WizardSceneStep.TEMPLATE);

    await expectWizardNextEnabled(root, false);
    await selectTemplateCatalogTile(root);
    await expectWizardNextEnabled(root, true);
  });

  test('template flow — deployment → template → customization → review', async ({ mount }) => {
    const root = await mount(WIZARD_STORY);
    await selectCreationMethod(root, 'template');
    await completeDeploymentDetailsForNamedFlows(root);
    await clickWizardNext(root);
    await expectWizardStepActive(root, WizardSceneStep.TEMPLATE);
    await selectTemplateCatalogTile(root);
    await clickWizardNext(root);
    await expectWizardStepActive(root, WizardSceneStep.CUSTOMIZATION);
    await clickWizardNext(root);
    await expectReviewStepReady(root);
  });
});
