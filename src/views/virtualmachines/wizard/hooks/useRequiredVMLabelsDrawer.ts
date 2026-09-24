import { useEffect, useState } from 'react';
import { useWatch } from 'react-hook-form';

import type { AutoAppliedLabel } from '@kubevirt-utils/hooks/useAutoAppliedLabels/types';
import useAutoAppliedLabels from '@kubevirt-utils/hooks/useAutoAppliedLabels/useAutoAppliedLabels';
import { getLabels } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useSignals } from '@preact/signals-react/runtime';
import { useVMWizardState } from '@virtualmachines/wizard/state/useVMWizardState';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import { VMWizardStep } from '@virtualmachines/wizard/utils/constants';

type UseRequiredVMLabelsDrawerResult = {
  isPanelOpen: boolean;
  requiredLabels: AutoAppliedLabel[];
  setIsPanelOpen: (open: boolean) => void;
  vmLabels: Record<string, string>;
};

const useRequiredVMLabelsDrawer = (): UseRequiredVMLabelsDrawerResult => {
  useSignals();
  const { control } = useVMWizard();
  const { currentStep } = useVMWizardState();
  const autoLabelsMerged = useWatch({
    control,
    name: 'customization.autoLabelsApplied',
  });

  const vm = useWatch({ control, name: 'customization.vmDraft' });
  const { labels } = useAutoAppliedLabels();
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const isOnCustomizationStep = currentStep === VMWizardStep.CUSTOMIZATION;
  const vmLabels = getLabels(vm, {});
  const requiredLabels = labels.filter((label) => label.required);
  const hasRequiredMissing =
    autoLabelsMerged && requiredLabels.some((label) => isEmpty(vmLabels[label.key] ?? ''));

  useEffect(() => {
    setIsPanelOpen(isOnCustomizationStep && hasRequiredMissing);
  }, [isOnCustomizationStep, hasRequiredMissing]);

  return { isPanelOpen, requiredLabels, setIsPanelOpen, vmLabels };
};

export default useRequiredVMLabelsDrawer;
