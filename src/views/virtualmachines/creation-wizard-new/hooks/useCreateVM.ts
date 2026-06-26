import { useWatch } from 'react-hook-form';

import useCloneVM from '@virtualmachines/creation-wizard-new/hooks/useCloneVM';
import useCreateCustomizedVM from '@virtualmachines/creation-wizard-new/hooks/useCreateCustomizedVM';
import { isCloneCreationMethod } from '@virtualmachines/creation-wizard-new/utils/utils';

import { useVMWizard } from '../state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_VM_DATA } from '../state/vm-wizard-form/consts';

type UseCreateVM = () => {
  createVM: () => Promise<void>;
  error: Error | unknown;
  isSubmitting: boolean;
};

const useCreateVM: UseCreateVM = () => {
  const { control } = useVMWizard();
  const creationMethod = useWatch({ control, name: CREATE_VM_FORM_FIELDS_VM_DATA.CREATION_METHOD });
  const cloneVM = useCloneVM();
  const { createCustomizedVM, error, isSubmitting } = useCreateCustomizedVM();

  return {
    createVM: isCloneCreationMethod(creationMethod) ? cloneVM : createCustomizedVM,
    error,
    isSubmitting,
  };
};

export default useCreateVM;
