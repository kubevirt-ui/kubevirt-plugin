import { useCallback, useMemo } from 'react';
import { useWatch } from 'react-hook-form';

import useAutoAppliedLabels from '@kubevirt-utils/hooks/useAutoAppliedLabels/useAutoAppliedLabels';
import { getLabels } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { isDNS1123Label } from '@kubevirt-utils/utils/validation';
import { useSignals } from '@preact/signals-react/runtime';
import { VMWizardStep } from '@virtualmachines/wizard/utils/constants';
import { getActiveFlow, isCloneCreationMethod } from '@virtualmachines/wizard/utils/utils';

import { useVMWizard } from '../state/vm-wizard-context/VMWizardContext';

type WizardStepValidation = {
  isNextDisabledForStep: (stepId: VMWizardStep) => boolean;
  isStepDisabled: (stepId: VMWizardStep) => boolean;
};

const useWizardStepValidation = (): WizardStepValidation => {
  useSignals();
  const { control } = useVMWizard();
  const [
    autoLabelsMerged,
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
      'customization.autoLabelsApplied',
      'creationMethod',
      'deployment.name',
      'template.selectedTemplate',
      'navigation.visitedSteps',
      'instanceType.operatingSystem',
      'instanceType.preference',
      'instanceType.useBootSource',
      'instanceType.bootVolume.volume',
      'instanceType.compute',
      'instanceType.compute.series',
      'instanceType.compute.size',
    ],
  });

  const { labels: autoAppliedLabels } = useAutoAppliedLabels();

  const activeFlow = useMemo(() => getActiveFlow(creationMethod), [creationMethod]);
  const cloneSource = useWatch({ control, name: 'clone.sourceVM' });
  const currentVMValue = useWatch({ control, name: 'customization.vmDraft' });

  const hasRequiredLabelsMissing = useMemo(() => {
    if (!autoLabelsMerged) return false;
    const vmLabels = getLabels(currentVMValue, {});
    return autoAppliedLabels.some(
      (label) => label.required && !String(vmLabels[label.key] ?? '').trim(),
    );
  }, [autoAppliedLabels, currentVMValue, autoLabelsMerged]);

  const stepNextDisabled: Record<VMWizardStep, boolean> = useMemo(() => {
    const isRedHatProvided = Boolean(selectedSeries) && Boolean(selectedSize);
    const isUserProvided =
      Boolean(selectedInstanceType?.type === 'user' && selectedInstanceType.namespace) &&
      Boolean(selectedInstanceType?.name);
    const isValidVMName = isCloneCreationMethod(creationMethod) || isDNS1123Label(name);

    return {
      [VMWizardStep.BOOT_SOURCE]: useBootSource && isEmpty(selectedBootableVolume),
      [VMWizardStep.CLONE]: isEmpty(cloneSource),
      [VMWizardStep.COMPUTE_RESOURCES]: !isRedHatProvided && !isUserProvided,
      [VMWizardStep.CUSTOMIZATION]: hasRequiredLabelsMissing,
      [VMWizardStep.DEPLOYMENT_DETAILS]: !isValidVMName,
      [VMWizardStep.GUEST_OS]: !operatingSystemType || !preference,
      [VMWizardStep.REVIEW_AND_CREATE]: false,
      [VMWizardStep.TEMPLATE]: isEmpty(selectedTemplate),
    };
  }, [
    creationMethod,
    cloneSource,
    hasRequiredLabelsMissing,
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
