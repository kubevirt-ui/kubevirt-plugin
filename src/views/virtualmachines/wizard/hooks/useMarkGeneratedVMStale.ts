import { useCallback } from 'react';

import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_UI_STATE } from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import { markGeneratedVMDraftStale } from '@virtualmachines/wizard/utils/generatedVMDraft';

const useMarkGeneratedVMStale = (): (() => void) => {
  const { setValue } = useVMWizard();

  return useCallback((): void => {
    markGeneratedVMDraftStale();
    setValue(CREATE_VM_FORM_FIELDS_UI_STATE.LAST_PROCESSED_TEMPLATE_KEY, '');
  }, [setValue]);
};

export default useMarkGeneratedVMStale;
