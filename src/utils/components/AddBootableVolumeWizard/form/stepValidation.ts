import { type FieldErrors, type FieldPath, get, type UseFormTrigger } from 'react-hook-form';

import type { BootableVolumeWizardFormValues } from './types';

export enum BootableVolumeWizardStep {
  IMAGE_SOURCE = 'image-source',
  OPERATING_SYSTEM = 'operating-system',
  PROJECT_AND_VOLUME = 'project-and-volume',
  REVIEW = 'review',
}

export const BOOTABLE_VOLUME_WIZARD_STEPS = [
  BootableVolumeWizardStep.PROJECT_AND_VOLUME,
  BootableVolumeWizardStep.IMAGE_SOURCE,
  BootableVolumeWizardStep.OPERATING_SYSTEM,
  BootableVolumeWizardStep.REVIEW,
] as const;

const STEP_FIELDS: Record<
  BootableVolumeWizardStep,
  readonly FieldPath<BootableVolumeWizardFormValues>[]
> = {
  [BootableVolumeWizardStep.IMAGE_SOURCE]: [
    'imageSource.sourceType',
    'imageSource.diskSize',
    'imageSource.upload.file',
    'imageSource.existingVolume.project',
    'imageSource.existingVolume.name',
    'imageSource.existingSnapshot.project',
    'imageSource.existingSnapshot.name',
    'imageSource.registry.image',
    'imageSource.registry.cronExpression',
    'imageSource.registry.username',
    'imageSource.registry.password',
    'imageSource.registry.retainRevisions',
    'imageSource.url.imageUrl',
    'imageSource.url.certificate',
    'imageSource.url.configMapName',
  ],
  [BootableVolumeWizardStep.OPERATING_SYSTEM]: [
    'operatingSystem.operatingSystem',
    'operatingSystem.architecture',
  ],
  [BootableVolumeWizardStep.PROJECT_AND_VOLUME]: [
    'projectAndVolume.volumeName',
    'projectAndVolume.destinationProject',
  ],
  [BootableVolumeWizardStep.REVIEW]: [],
};

export const getBootableVolumeWizardStepFields = (
  step: BootableVolumeWizardStep,
): readonly FieldPath<BootableVolumeWizardFormValues>[] => STEP_FIELDS[step];

export const mapBootableVolumeWizardErrorsToSteps = (
  errors: FieldErrors<BootableVolumeWizardFormValues>,
): Record<BootableVolumeWizardStep, boolean> =>
  Object.fromEntries(
    BOOTABLE_VOLUME_WIZARD_STEPS.map((step) => [
      step,
      STEP_FIELDS[step].some((field) => Boolean(get(errors, field))),
    ]),
  ) as Record<BootableVolumeWizardStep, boolean>;

export const triggerBootableVolumeWizardStepValidation = (
  trigger: UseFormTrigger<BootableVolumeWizardFormValues>,
  steps: readonly BootableVolumeWizardStep[],
): Promise<boolean> =>
  trigger(steps.flatMap((step) => [...getBootableVolumeWizardStepFields(step)]));

export const getBootableVolumeWizardNavigationPrerequisites = (
  currentStep: BootableVolumeWizardStep,
  destination: BootableVolumeWizardStep,
): readonly BootableVolumeWizardStep[] => {
  const currentIndex = BOOTABLE_VOLUME_WIZARD_STEPS.indexOf(currentStep);
  const destinationIndex = BOOTABLE_VOLUME_WIZARD_STEPS.indexOf(destination);

  return destinationIndex <= currentIndex
    ? []
    : BOOTABLE_VOLUME_WIZARD_STEPS.slice(0, destinationIndex);
};
