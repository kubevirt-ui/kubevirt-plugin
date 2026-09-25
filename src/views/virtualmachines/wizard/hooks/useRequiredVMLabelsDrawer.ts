import { useEffect, useState } from 'react';
import { type FieldPath, useFormState } from 'react-hook-form';

import type { AutoAppliedLabel } from '@kubevirt-utils/hooks/useAutoAppliedLabels/types';
import { type VMWizardFormValues } from '@virtualmachines/wizard/form/types';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import { VMWizardStep } from '@virtualmachines/wizard/utils/constants';

type UseRequiredVMLabelsDrawerResult = {
  isPanelOpen: boolean;
  requiredLabels: AutoAppliedLabel[];
  setIsPanelOpen: (open: boolean) => void;
};

const useRequiredVMLabelsDrawer = (
  currentStep: VMWizardStep,
  labels: readonly AutoAppliedLabel[],
): UseRequiredVMLabelsDrawerResult => {
  const { control, getFieldState } = useVMWizardForm();
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const isOnCustomizationStep = currentStep === VMWizardStep.CUSTOMIZATION;
  const requiredLabels = labels.filter((label) => label.required);
  const formState = useFormState({ control, name: 'customization.vmDraft' });
  const errorPath = 'customization.vmDraft.metadata.labels' as FieldPath<VMWizardFormValues>;
  const hasRequiredLabelError = getFieldState(errorPath, formState).invalid;

  useEffect(() => {
    setIsPanelOpen(isOnCustomizationStep && hasRequiredLabelError);
  }, [hasRequiredLabelError, isOnCustomizationStep]);

  return { isPanelOpen, requiredLabels, setIsPanelOpen };
};

export default useRequiredVMLabelsDrawer;
