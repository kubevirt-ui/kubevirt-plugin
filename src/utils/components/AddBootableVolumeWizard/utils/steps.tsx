import { createElement, type ReactElement } from 'react';
import type { TFunction } from 'i18next';

import { type CustomWizardNavItemFunction, WizardNavItem } from '@patternfly/react-core';

import BootableVolumeWizardFooter from '../components/BootableVolumeWizardFooter';
import { BootableVolumeWizardStep } from '../form/stepValidation';
import ImageSourceStep from '../steps/ImageSourceStep/ImageSourceStep';
import OperatingSystemStep from '../steps/OperatingSystemStep/OperatingSystemStep';
import ProjectAndVolumeStep from '../steps/ProjectAndVolumeStep/ProjectAndVolumeStep';
import ReviewStep from '../steps/ReviewStep/ReviewStep';
import type { BootableVolumeWizardNavItemConfig, BootableVolumeWizardStepDisplay } from './types';

const getDefaultFooter = (navigation: BootableVolumeWizardNavItemConfig): ReactElement =>
  createElement(BootableVolumeWizardFooter, { navigation });

export const getBootableVolumeWizardSteps = (
  t: TFunction,
  navigation: BootableVolumeWizardNavItemConfig,
): BootableVolumeWizardStepDisplay[] => [
  {
    children: createElement(ProjectAndVolumeStep),
    displayIndex: 1,
    footer: getDefaultFooter(navigation),
    id: BootableVolumeWizardStep.PROJECT_AND_VOLUME,
    name: t('Project & volume'),
  },
  {
    children: createElement(ImageSourceStep),
    displayIndex: 2,
    footer: getDefaultFooter(navigation),
    id: BootableVolumeWizardStep.IMAGE_SOURCE,
    name: t('Image source'),
  },
  {
    children: createElement(OperatingSystemStep),
    displayIndex: 3,
    footer: getDefaultFooter(navigation),
    id: BootableVolumeWizardStep.OPERATING_SYSTEM,
    name: t('Operating system'),
  },
  {
    children: createElement(ReviewStep),
    displayIndex: 4,
    footer: getDefaultFooter(navigation),
    id: BootableVolumeWizardStep.REVIEW,
    name: t('Review'),
  },
];

export const getBootableVolumeWizardNavItem =
  (navigation: BootableVolumeWizardNavItemConfig): CustomWizardNavItemFunction =>
  (step, activeStep, _steps, goToStepByIndex) => (
    <WizardNavItem
      content={step.name}
      id={step.id}
      isCurrent={step.id === activeStep?.id}
      isDisabled={step.isDisabled}
      onClick={() => void navigation.handleNavItemClick(step, activeStep, goToStepByIndex)}
      stepIndex={step.index}
    />
  );
