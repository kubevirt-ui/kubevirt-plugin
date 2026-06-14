import { useCallback, useMemo } from 'react';
import { useWatch } from 'react-hook-form';

import { vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { isDNS1123Label } from '@kubevirt-utils/utils/validation';
import { useSignals } from '@preact/signals-react/runtime';
import useInstanceTypeVMStore from '@virtualmachines/creation-wizard-new/state/instance-type-vm-store/useInstanceTypeVMStore';
import useVMWizardStore from '@virtualmachines/creation-wizard-new/state/vm-wizard-store/useVMWizardStore';
import { VMWizardStep } from '@virtualmachines/creation-wizard-new/utils/constants';
import {
  getActiveFlow,
  isCloneCreationMethod,
} from '@virtualmachines/creation-wizard-new/utils/utils';

import { useVMWizard } from '../state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_VM_DATA } from '../state/vm-wizard-form/consts';

type WizardStepValidation = {
  isNextDisabledForStep: (stepId: VMWizardStep) => boolean;
  isStepDisabled: (stepId: VMWizardStep) => boolean;
};

const useWizardStepValidation = (): WizardStepValidation => {
  useSignals();
  const { visitedSteps } = useVMWizardStore();
  const {
    operatingSystemType,
    preference,
    selectedBootableVolume,
    selectedInstanceType,
    selectedSeries,
    selectedSize,
    useBootSource,
  } = useInstanceTypeVMStore();
  const { control } = useVMWizard();
  const creationMethod = useWatch({ control, name: CREATE_VM_FORM_FIELDS_VM_DATA.CREATION_METHOD });
  const name = useWatch({ control, name: CREATE_VM_FORM_FIELDS_VM_DATA.NAME });
  const selectedTemplate = useWatch({
    control,
    name: CREATE_VM_FORM_FIELDS_VM_DATA.SELECTED_TEMPLATE,
  });

  const activeFlow = getActiveFlow(creationMethod);

  const isRedHatProvided = Boolean(selectedSeries) && Boolean(selectedSize);
  const isUserProvided =
    Boolean(selectedInstanceType?.namespace) && Boolean(selectedInstanceType?.name);

  const currentVMSignalValue = vmSignal.value;

  const isValidVMName = isCloneCreationMethod(creationMethod) || isDNS1123Label(name);

  const stepNextDisabled: Record<VMWizardStep, boolean> = useMemo(
    () => ({
      [VMWizardStep.BOOT_SOURCE]: useBootSource && isEmpty(selectedBootableVolume),
      [VMWizardStep.CLONE]: isEmpty(currentVMSignalValue),
      [VMWizardStep.COMPUTE_RESOURCES]: !isRedHatProvided && !isUserProvided,
      [VMWizardStep.CUSTOMIZATION]: false,
      [VMWizardStep.DEPLOYMENT_DETAILS]: !isValidVMName,
      [VMWizardStep.GUEST_OS]: !operatingSystemType || !preference,
      [VMWizardStep.REVIEW_AND_CREATE]: false,
      [VMWizardStep.TEMPLATE]: isEmpty(selectedTemplate),
    }),
    [
      currentVMSignalValue,
      isRedHatProvided,
      isUserProvided,
      operatingSystemType,
      preference,
      selectedBootableVolume,
      selectedTemplate,
      useBootSource,
      isValidVMName,
    ],
  );

  const isStepDisabled = useCallback(
    (stepId: VMWizardStep): boolean => {
      const stepIndex = activeFlow.indexOf(stepId);
      if (stepIndex <= 0) return false;

      for (let i = 0; i < stepIndex; i++) {
        if (stepNextDisabled[activeFlow[i]]) return true;
      }

      if (visitedSteps.has(stepId)) return false;

      const previousStep = activeFlow[stepIndex - 1];
      return !visitedSteps.has(previousStep) || stepNextDisabled[previousStep];
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
