import { useEffect, useState } from 'react';
import { useWatch } from 'react-hook-form';

import useAutoAppliedLabels from '@kubevirt-utils/hooks/useAutoAppliedLabels/useAutoAppliedLabels';
import { AutoAppliedLabel } from '@kubevirt-utils/hooks/useAutoAppliedLabels/types';
import { getLabels } from '@kubevirt-utils/resources/shared';
import { customizeWizardVMSignal } from '@kubevirt-utils/signals/customizeWizardVMSignal';
import { useSignals } from '@preact/signals-react/runtime';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import {
  CREATE_VM_FORM_FIELDS_STEP_NAVIGATION,
  CREATE_VM_FORM_FIELDS_VM_DATA,
} from '@virtualmachines/wizard/state/vm-wizard-form/consts';
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
  const autoLabelsMerged = useWatch({
    control,
    name: CREATE_VM_FORM_FIELDS_VM_DATA.AUTO_LABELS_MERGED,
  });
  const currentStep = useWatch({
    control,
    name: CREATE_VM_FORM_FIELDS_STEP_NAVIGATION.CURRENT_STEP,
  });
  const { labels } = useAutoAppliedLabels();
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const isOnCustomizationStep = currentStep === VMWizardStep.CUSTOMIZATION;
  const vmLabels = getLabels(customizeWizardVMSignal.value, {});
  const requiredLabels = labels.filter((label) => label.required);
  const hasRequiredMissing =
    autoLabelsMerged && requiredLabels.some((label) => !String(vmLabels[label.key] ?? '').trim());

  useEffect(() => {
    setIsPanelOpen(isOnCustomizationStep && hasRequiredMissing);
  }, [isOnCustomizationStep, hasRequiredMissing]);

  return { isPanelOpen, requiredLabels, setIsPanelOpen, vmLabels };
};

export default useRequiredVMLabelsDrawer;
