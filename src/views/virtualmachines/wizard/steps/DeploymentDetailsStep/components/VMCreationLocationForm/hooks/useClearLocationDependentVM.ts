import { useCallback } from 'react';

import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import { useWizardVMDraft } from '@virtualmachines/wizard/hooks/useWizardVMDraft';
import { VMCreationMethod } from '@virtualmachines/wizard/utils/constants';
import { clearWizardDraftPendingUploads } from '@virtualmachines/wizard/utils/utils';

const useClearLocationDependentVM = (): (() => void) => {
  const { getValues, setValue } = useVMWizardForm();
  const { clearDraft } = useWizardVMDraft();

  return useCallback((): void => {
    clearWizardDraftPendingUploads(getValues, setValue);
    if (getValues('creationMethod') === VMCreationMethod.CLONE) {
      setValue('clone.sourceVM', null, { shouldValidate: true });
    }
    clearDraft();
  }, [clearDraft, getValues, setValue]);
};

export default useClearLocationDependentVM;
