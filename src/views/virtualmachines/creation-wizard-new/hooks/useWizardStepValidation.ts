import { useCallback, useMemo } from 'react';
import { useWatch } from 'react-hook-form';

import { vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { isDNS1123Label } from '@kubevirt-utils/utils/validation';
import { useSignals } from '@preact/signals-react/runtime';
import { VMWizardStep } from '@virtualmachines/creation-wizard-new/utils/constants';
import {
  getActiveFlow,
  isCloneCreationMethod,
} from '@virtualmachines/creation-wizard-new/utils/utils';

import { useVMWizard } from '../state/vm-wizard-context/VMWizardContext';
import {
  CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA,
  CREATE_VM_FORM_FIELDS_STEP_NAVIGATION,
  CREATE_VM_FORM_FIELDS_VM_DATA,
} from '../state/vm-wizard-form/consts';

type WizardStepValidation = {
  isNextDisabledForStep: (stepId: VMWizardStep) => boolean;
  isStepDisabled: (stepId: VMWizardStep) => boolean;
};

const useWizardStepValidation = (): WizardStepValidation => {
  useSignals();
  const { control } = useVMWizard();
  const [
    creationMethod,
    name,
    selectedTemplate,
    visitedSteps,
    operatingSystemType,
    preference,
    useBootSource,
    selectedBootableVolume,
    selectedInstanceType,
    selectedSeries,
    selectedSize,
  ] = useWatch({
    control,
    name: [
      CREATE_VM_FORM_FIELDS_VM_DATA.CREATION_METHOD,
      CREATE_VM_FORM_FIELDS_VM_DATA.NAME,
      CREATE_VM_FORM_FIELDS_VM_DATA.SELECTED_TEMPLATE,
      CREATE_VM_FORM_FIELDS_STEP_NAVIGATION.VISITED_STEPS,
      CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.ROOT,
      CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.PREFERENCE,
      CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.USE_BOOT_SOURCE,
      CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.SELECTED_BOOTABLE_VOLUME,
      CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.SELECTED_INSTANCE_TYPE,
      CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.SELECTED_SERIES,
      CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.SELECTED_SIZE,
    ],
  });

  const activeFlow = useMemo(() => getActiveFlow(creationMethod), [creationMethod]);
  const currentVMSignalValue = vmSignal.value;

  const stepNextDisabled: Record<VMWizardStep, boolean> = useMemo(() => {
    const isRedHatProvided = Boolean(selectedSeries) && Boolean(selectedSize);
    const isUserProvided =
      Boolean(selectedInstanceType?.namespace) && Boolean(selectedInstanceType?.name);
    const isValidVMName = isCloneCreationMethod(creationMethod) || isDNS1123Label(name);

    return {
      [VMWizardStep.BOOT_SOURCE]: useBootSource && isEmpty(selectedBootableVolume),
      [VMWizardStep.CLONE]: isEmpty(currentVMSignalValue),
      [VMWizardStep.COMPUTE_RESOURCES]: !isRedHatProvided && !isUserProvided,
      [VMWizardStep.CUSTOMIZATION]: false,
      [VMWizardStep.DEPLOYMENT_DETAILS]: !isValidVMName,
      [VMWizardStep.GUEST_OS]: !operatingSystemType || !preference,
      [VMWizardStep.REVIEW_AND_CREATE]: false,
      [VMWizardStep.TEMPLATE]: isEmpty(selectedTemplate),
    };
  }, [
    creationMethod,
    currentVMSignalValue,
    name,
    operatingSystemType,
    preference,
    selectedBootableVolume,
    selectedInstanceType,
    selectedSeries,
    selectedSize,
    selectedTemplate,
    useBootSource,
  ]);

  const isStepDisabled = useCallback(
    (stepId: VMWizardStep): boolean => {
      if (!activeFlow.includes(stepId)) return false;

      const stepIndex = activeFlow.indexOf(stepId);

      if (stepIndex <= 0) return false;

      const activeFlowUntilCurrentStep = activeFlow.slice(0, stepIndex);

      const isSomePreviousStepsDisabledOrNotVisited = activeFlowUntilCurrentStep.some(
        (activeFlowStepId) =>
          stepNextDisabled[activeFlowStepId] || !visitedSteps.has(activeFlowStepId),
      );

      return isSomePreviousStepsDisabledOrNotVisited;
    },
    [activeFlow, stepNextDisabled, visitedSteps],
  );

  const isNextDisabledForStep = useCallback(
    (stepId: VMWizardStep): boolean => Boolean(stepNextDisabled[stepId]),
    [stepNextDisabled],
  );

  return { isNextDisabledForStep, isStepDisabled };
};

export default useWizardStepValidation;
