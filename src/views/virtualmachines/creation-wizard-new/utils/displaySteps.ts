import { createElement } from 'react';
import { VMCreationMethod, VMWizardStep } from './constants';

import CloneSourceStep from '../steps/CloneSourceStep/CloneSourceStep';
import CustomizationStep from '../steps/CustomizationStep/CustomizationStep';
import DeploymentDetailsStepFooter from '../steps/DeploymentDetailsStep/components/DeploymentDetailsStepFooter';
import DeploymentDetailsStep from '../steps/DeploymentDetailsStep/DeploymentDetailsStep';
import BootSourceStep from '../steps/InstanceTypesSteps/BootSourceStep/BootSourceStep';
import ComputeResourcesStepFooter from '../steps/InstanceTypesSteps/ComputeResourcesStep/components/ComputeResourcesStepFooter';
import ComputeResourcesStep from '../steps/InstanceTypesSteps/ComputeResourcesStep/ComputeResourcesStep';
import GuestOSStep from '../steps/InstanceTypesSteps/GuestOSStep/GuestOSStep';
import ReviewAndCreateStepFooter from '../steps/ReviewAndCreateStep/components/ReviewAndCreateStepFooter';
import ReviewAndCreateStep from '../steps/ReviewAndCreateStep/ReviewAndCreateStep';
import TemplateStepFooter from '../steps/TemplateStep/components/TemplateStepFooter';
import TemplateStep from '../steps/TemplateStep/TemplateStep';
import { GetStepsToDisplayByCreationMethodArgs, VMWizardStepDisplay } from './types';
import { TFunction } from 'i18next';
import { CustomWizardNavItemFunction } from '@patternfly/react-core';
import DefaultWizardFooter from '../components/DefaultWizardFooter';

const getDeploymentDetailsStep = (t: TFunction): VMWizardStepDisplay => ({
  children: createElement(DeploymentDetailsStep),
  displayIndex: 1,
  footer: createElement(DeploymentDetailsStepFooter),
  id: VMWizardStep.DEPLOYMENT_DETAILS,
  name: t('Deployment details'),
});

export const getCustomizationStep = (
  t: TFunction,
  navItemWithVMGeneration: CustomWizardNavItemFunction,
  isStepDisabled: (stepId: VMWizardStep) => boolean,
): VMWizardStepDisplay => ({
  children: createElement(CustomizationStep),
  displayIndex: 6,
  footer: createElement(DefaultWizardFooter),
  id: VMWizardStep.CUSTOMIZATION,
  isDisabled: isStepDisabled(VMWizardStep.CUSTOMIZATION),
  name: t('Customization'),
  navItem: navItemWithVMGeneration,
});

export const getReviewAndCreateStep = (
  t: TFunction,
  navItemWithVMGeneration: CustomWizardNavItemFunction,
  isStepDisabled: (stepId: VMWizardStep) => boolean,
): VMWizardStepDisplay => ({
  children: createElement(ReviewAndCreateStep),
  displayIndex: 8,
  footer: createElement(ReviewAndCreateStepFooter),
  id: VMWizardStep.REVIEW_AND_CREATE,
  isDisabled: isStepDisabled(VMWizardStep.REVIEW_AND_CREATE),
  name: t('Review and create'),
  navItem: navItemWithVMGeneration,
});

export const getStepsToDisplayByCreationMethod = ({
  customizationStep,
  isNextDisabledForStep,
  isStepDisabled,
  reviewAndCreateStep,
  t,
}: GetStepsToDisplayByCreationMethodArgs): Record<VMCreationMethod, VMWizardStepDisplay[]> => {
  const deploymentDetailsStep = getDeploymentDetailsStep(t);
  return {
    [VMCreationMethod.CLONE]: [
      deploymentDetailsStep,
      {
        children: createElement(CloneSourceStep),
        displayIndex: 7,
        footer: {
          isNextDisabled: isNextDisabledForStep(VMWizardStep.CLONE),
        },
        id: VMWizardStep.CLONE,
        isDisabled: isStepDisabled(VMWizardStep.CLONE),
        name: t('Source'),
      },
      reviewAndCreateStep,
    ],
    [VMCreationMethod.INSTANCE_TYPE]: [
      deploymentDetailsStep,
      {
        children: createElement(GuestOSStep),
        displayIndex: 2,
        footer: {
          isNextDisabled: isNextDisabledForStep(VMWizardStep.GUEST_OS),
        },
        id: VMWizardStep.GUEST_OS,
        isDisabled: isStepDisabled(VMWizardStep.GUEST_OS),
        name: t('Guest OS'),
      },
      {
        children: createElement(BootSourceStep),
        displayIndex: 3,
        footer: {
          isNextDisabled: isNextDisabledForStep(VMWizardStep.BOOT_SOURCE),
        },
        id: VMWizardStep.BOOT_SOURCE,
        isDisabled: isStepDisabled(VMWizardStep.BOOT_SOURCE),
        name: t('Boot source'),
      },
      {
        children: createElement(ComputeResourcesStep),
        displayIndex: 4,
        footer: createElement(ComputeResourcesStepFooter),
        id: VMWizardStep.COMPUTE_RESOURCES,
        isDisabled: isStepDisabled(VMWizardStep.COMPUTE_RESOURCES),
        name: t('Compute resources'),
      },
      customizationStep,
      reviewAndCreateStep,
    ],
    [VMCreationMethod.TEMPLATE]: [
      deploymentDetailsStep,
      {
        children: createElement(TemplateStep),
        displayIndex: 5,
        footer: createElement(TemplateStepFooter),
        id: VMWizardStep.TEMPLATE,
        isDisabled: isStepDisabled(VMWizardStep.TEMPLATE),
        name: t('Template'),
      },
      customizationStep,
      reviewAndCreateStep,
    ],
  };
};
