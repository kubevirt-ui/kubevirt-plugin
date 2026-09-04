import { useCallback } from 'react';

import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import {
  CREATE_VM_FORM_FIELDS_UI_STATE,
  CREATE_VM_FORM_FIELDS_VM_DATA,
} from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import { discardGeneratedVMDraft } from '@virtualmachines/wizard/utils/generatedVMDraft';

const useInvalidateGeneratedVM = (): (() => void) => {
  const { setValue } = useVMWizard();

  return useCallback((): void => {
    discardGeneratedVMDraft();
    setValue(CREATE_VM_FORM_FIELDS_VM_DATA.AUTO_LABELS_MERGED, false);
    setValue(CREATE_VM_FORM_FIELDS_UI_STATE.LAST_PROCESSED_TEMPLATE_KEY, '');
  }, [setValue]);
};

export default useInvalidateGeneratedVM;
