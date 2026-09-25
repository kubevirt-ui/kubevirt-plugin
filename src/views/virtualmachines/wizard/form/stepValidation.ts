import { type FieldErrors, type FieldPath, get, type UseFormTrigger } from 'react-hook-form';

import {
  CLONE_FLOW,
  INSTANCE_TYPE_FLOW,
  TEMPLATE_FLOW,
  VMCreationMethod,
  VMWizardStep,
} from '../utils/constants';
import { type VMWizardFormValues } from './types';

export type WizardStepErrorMap = Record<VMWizardStep, boolean>;

const STEP_FIELDS: Record<VMWizardStep, readonly FieldPath<VMWizardFormValues>[]> = {
  [VMWizardStep.BOOT_SOURCE]: [
    'instanceType.useBootSource',
    'instanceType.volumeNamespace',
    'instanceType.bootVolume',
  ],
  [VMWizardStep.CLONE]: ['clone.sourceVM'],
  [VMWizardStep.COMPUTE_RESOURCES]: ['instanceType.compute'],
  [VMWizardStep.CUSTOMIZATION]: [
    'customization.vmDraft',
    'customization.templateAdditionalObjects',
  ],
  [VMWizardStep.DEPLOYMENT_DETAILS]: [
    'creationMethod',
    'deployment.cluster',
    'deployment.project',
    'deployment.folder',
    'deployment.description',
  ],
  [VMWizardStep.GUEST_OS]: ['instanceType.operatingSystem', 'instanceType.preference'],
  [VMWizardStep.REVIEW_AND_CREATE]: [],
  [VMWizardStep.TEMPLATE]: ['template.selectedTemplate'],
};

export const getWizardStepIds = (creationMethod: VMCreationMethod): readonly VMWizardStep[] =>
  ({
    [VMCreationMethod.CLONE]: CLONE_FLOW,
    [VMCreationMethod.INSTANCE_TYPE]: INSTANCE_TYPE_FLOW,
    [VMCreationMethod.TEMPLATE]: TEMPLATE_FLOW,
  })[creationMethod];

/** Backward navigation is always available; forward navigation requires all preceding steps. */
export const getNavigationPrerequisites = (
  creationMethod: VMCreationMethod,
  currentStep: VMWizardStep,
  destination: VMWizardStep,
): readonly VMWizardStep[] => {
  const flow = getWizardStepIds(creationMethod);
  const destinationIndex = flow.indexOf(destination);
  return destinationIndex <= flow.indexOf(currentStep) ? [] : flow.slice(0, destinationIndex);
};

const getWizardStepFieldPaths = (
  stepId: VMWizardStep,
  creationMethod: VMCreationMethod,
): readonly FieldPath<VMWizardFormValues>[] =>
  stepId === VMWizardStep.DEPLOYMENT_DETAILS && creationMethod !== VMCreationMethod.CLONE
    ? ((STEP_FIELDS[stepId] as readonly string[]).concat(
        'deployment.name',
      ) as FieldPath<VMWizardFormValues>[])
    : STEP_FIELDS[stepId];

export const mapWizardErrorsToSteps = (
  errors: FieldErrors<VMWizardFormValues>,
  creationMethod: VMWizardFormValues['creationMethod'],
): WizardStepErrorMap =>
  Object.fromEntries(
    Object.values(VMWizardStep).map((step) => [
      step,
      getWizardStepFieldPaths(step, creationMethod).some((field) => Boolean(get(errors, field))),
    ]),
  ) as WizardStepErrorMap;

export const triggerWizardStepsValidation = (
  trigger: UseFormTrigger<VMWizardFormValues>,
  creationMethod: VMCreationMethod,
  steps: readonly VMWizardStep[],
): Promise<boolean> =>
  trigger(steps.flatMap((step) => [...getWizardStepFieldPaths(step, creationMethod)]));
