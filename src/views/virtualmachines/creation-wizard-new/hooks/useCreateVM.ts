import { useWatch } from 'react-hook-form';

import useCloneVM from '@virtualmachines/creation-wizard-new/hooks/useCloneVM';
import useCreateCustomizedVM from '@virtualmachines/creation-wizard-new/hooks/useCreateCustomizedVM';
import { isCloneCreationMethod } from '@virtualmachines/creation-wizard-new/utils/utils';

import { useVMWizard } from '../state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_VM_DATA } from '../state/vm-wizard-form/consts';

type UseCreateVM = () => {
  createVM: () => Promise<void>;
  error: unknown;
  isSubmitting: boolean;
};

const useCreateVM: UseCreateVM = () => {
  const { control } = useVMWizard();
  const creationMethod = useWatch({ control, name: CREATE_VM_FORM_FIELDS_VM_DATA.CREATION_METHOD });
  const { cloneVM, error: cloneError, isSubmitting: isCloneSubmitting } = useCloneVM();
  const {
    createCustomizedVM,
    error: createError,
    isSubmitting: isCreateSubmitting,
  } = useCreateCustomizedVM();

  const isCloneMethod = isCloneCreationMethod(creationMethod);

  return isCloneMethod
    ? { createVM: cloneVM, error: cloneError, isSubmitting: isCloneSubmitting }
    : { createVM: createCustomizedVM, error: createError, isSubmitting: isCreateSubmitting };
};

export default useCreateVM;
