import { useCallback, useMemo } from 'react';

import { vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { isDNS1123Label } from '@kubevirt-utils/utils/validation';
import { useSignals } from '@preact/signals-react/runtime';
import useInstanceTypeVMStore from '@virtualmachines/creation-wizard/state/instance-type-vm-store/useInstanceTypeVMStore';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import { VMWizardStep } from '@virtualmachines/creation-wizard/utils/constants';
import { getActiveFlow, isCloneCreationMethod } from '@virtualmachines/creation-wizard/utils/utils';

type WizardStepValidation = {
  isNextDisabledForStep: (stepId: VMWizardStep) => boolean;
  isStepDisabled: (stepId: VMWizardStep) => boolean;
};

const useWizardStepValidation = (): WizardStepValidation => {
  useSignals();
  const { creationMethod, selectedTemplate, visitedSteps, vmName } = useVMWizardStore();
  const {
    operatingSystemType,
    preference,
    selectedBootableVolume,
    selectedInstanceType,
    selectedSeries,
    selectedSize,
    useBootSource,
  } = useInstanceTypeVMStore();

  const activeFlow = getActiveFlow(creationMethod);

  const isRedHatProvided = Boolean(selectedSeries) && Boolean(selectedSize);
  const isUserProvided =
    Boolean(selectedInstanceType?.namespace) && Boolean(selectedInstanceType?.name);

  const currentVMSignalValue = vmSignal.value;

  const isValidVMName = isCloneCreationMethod(creationMethod) || isDNS1123Label(vmName);

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
