import { useCallback } from 'react';
import { useWatch } from 'react-hook-form';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { finalizeWizardVMDraft } from '@virtualmachines/wizard/form/finalizeWizardVMDraft';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import { reconcileVMDraftUpdate } from '@virtualmachines/wizard/utils/reconcileVMDraftUpdate';

const options = {
  shouldValidate: true,
} as const;

type WizardVMDraft = {
  clearDraft: () => void;
  finalizeDraft: () => V1VirtualMachine | undefined;
  replaceDraft: (
    replacement: V1VirtualMachine,
    expectedCurrentDraft?: V1VirtualMachine,
  ) => V1VirtualMachine | undefined;
  vmDraft: null | V1VirtualMachine;
};

export const useWizardVMDraft = (): WizardVMDraft => {
  const { control, getValues, setValue } = useVMWizardForm();

  // Used, because getValues is not reactive, subscription here ensures rerenders on draft change
  useWatch({ control, name: 'customization.vmDraft' });

  const vmDraft = getValues('customization.vmDraft');

  const clearDraft = useCallback(() => {
    setValue('customization.templateAdditionalObjects', []);
    setValue('customization.autoLabelsApplied', false);
    setValue('customization.vmDraft', null, options);
  }, [setValue]);

  const finalizeDraft = useCallback(() => {
    const current = getValues('customization.vmDraft');

    if (!current) return undefined;

    const finalized = finalizeWizardVMDraft(current, getValues('deployment'));

    if (finalized !== current) setValue('customization.vmDraft', finalized, options);

    return finalized;
  }, [getValues, setValue]);

  const replaceDraft = useCallback(
    (replacement: V1VirtualMachine, expectedCurrentDraft?: V1VirtualMachine) => {
      const current = getValues('customization.vmDraft');

      if (!current && expectedCurrentDraft) return undefined;

      const nextDraft =
        expectedCurrentDraft && current
          ? reconcileVMDraftUpdate(expectedCurrentDraft, current, replacement)
          : replacement;

      setValue('customization.vmDraft', nextDraft, options);

      return nextDraft;
    },
    [getValues, setValue],
  );

  return { clearDraft, finalizeDraft, replaceDraft, vmDraft };
};
