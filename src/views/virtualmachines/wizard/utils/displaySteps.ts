import { createElement, type ReactElement } from 'react';
import { type TFunction } from 'i18next';

import DefaultWizardFooter from '../components/DefaultWizardFooter';
import CloneSourceStep from '../steps/CloneSourceStep/CloneSourceStep';
import CustomizationStep from '../steps/CustomizationStep/CustomizationStep';
import DeploymentDetailsStepFooter from '../steps/DeploymentDetailsStep/components/DeploymentDetailsStepFooter';
import DeploymentDetailsStep from '../steps/DeploymentDetailsStep/DeploymentDetailsStep';
import BootSourceStep from '../steps/InstanceTypesSteps/BootSourceStep/BootSourceStep';
import ComputeResourcesStep from '../steps/InstanceTypesSteps/ComputeResourcesStep/ComputeResourcesStep';
import GuestOSStep from '../steps/InstanceTypesSteps/GuestOSStep/GuestOSStep';
import ReviewAndCreateStepFooter from '../steps/ReviewAndCreateStep/components/ReviewAndCreateStepFooter';
import ReviewAndCreateStep from '../steps/ReviewAndCreateStep/ReviewAndCreateStep';
import TemplateStep from '../steps/TemplateStep/TemplateStep';
import { VMCreationMethod, VMWizardStep } from './constants';
import {
  type GetStepsToDisplayByCreationMethodArgs,
  type VMWizardStepDisplay,
  type WizardStepNavItemConfig,
} from './types';

const getDefaultFooter = (navigation: WizardStepNavItemConfig): ReactElement =>
  createElement(DefaultWizardFooter, { navigation });

const getDeploymentDetailsStep = (
  t: TFunction,
  navigation: WizardStepNavItemConfig,
): VMWizardStepDisplay => ({
  children: createElement(DeploymentDetailsStep),
  displayIndex: 1,
  footer: createElement(DeploymentDetailsStepFooter, { navigation }),
  id: VMWizardStep.DEPLOYMENT_DETAILS,
  name: t('Deployment details'),
});

const getCustomizationStep = (
  t: TFunction,
  navItemConfig: WizardStepNavItemConfig,
): VMWizardStepDisplay => ({
  children: createElement(CustomizationStep),
  displayIndex: 6,
  footer: getDefaultFooter(navItemConfig),
  id: VMWizardStep.CUSTOMIZATION,
  name: t('Customization'),
});

const getReviewAndCreateStep = (
  t: TFunction,
  navItemConfig: WizardStepNavItemConfig,
): VMWizardStepDisplay => ({
  children: createElement(ReviewAndCreateStep),
  displayIndex: 8,
  footer: createElement(ReviewAndCreateStepFooter, { navigation: navItemConfig }),
  id: VMWizardStep.REVIEW_AND_CREATE,
  name: t('Review and create'),
});

export const getStepsToDisplayByCreationMethod = ({
  navItemConfig,
  t,
}: GetStepsToDisplayByCreationMethodArgs): Record<VMCreationMethod, VMWizardStepDisplay[]> => {
  const deploymentDetailsStep = getDeploymentDetailsStep(t, navItemConfig);
  const customizationStep = getCustomizationStep(t, navItemConfig);
  const reviewAndCreateStep = getReviewAndCreateStep(t, navItemConfig);

  return {
    [VMCreationMethod.CLONE]: [
      deploymentDetailsStep,
      {
        children: createElement(CloneSourceStep),
        displayIndex: 7,
        footer: getDefaultFooter(navItemConfig),
        id: VMWizardStep.CLONE,
        name: t('Source'),
      },
      reviewAndCreateStep,
    ],
    [VMCreationMethod.INSTANCE_TYPE]: [
      deploymentDetailsStep,
      {
        children: createElement(GuestOSStep),
        displayIndex: 2,
        footer: getDefaultFooter(navItemConfig),
        id: VMWizardStep.GUEST_OS,
        name: t('Guest OS'),
      },
      {
        children: createElement(BootSourceStep),
        displayIndex: 3,
        footer: getDefaultFooter(navItemConfig),
        id: VMWizardStep.BOOT_SOURCE,
        name: t('Boot source'),
      },
      {
        children: createElement(ComputeResourcesStep),
        displayIndex: 4,
        footer: getDefaultFooter(navItemConfig),
        id: VMWizardStep.COMPUTE_RESOURCES,
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
        footer: getDefaultFooter(navItemConfig),
        id: VMWizardStep.TEMPLATE,
        name: t('Template'),
      },
      customizationStep,
      reviewAndCreateStep,
    ],
  };
};
