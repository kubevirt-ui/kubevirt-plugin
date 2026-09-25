import { useWatch } from 'react-hook-form';

import { type VMWizardFormValues } from '@virtualmachines/wizard/form/types';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import useCloneVM from '@virtualmachines/wizard/hooks/useCloneVM';
import useCreateCustomizedVM from '@virtualmachines/wizard/hooks/useCreateCustomizedVM';
import { isCloneCreationMethod } from '@virtualmachines/wizard/utils/utils';

type UseCreateVM = () => {
  createVM: () => Promise<void>;
  error: unknown;
  isSubmitting: boolean;
};

const useCreateVM: UseCreateVM = () => {
  const { control, handleSubmit } = useVMWizardForm();
  const creationMethod = useWatch({ control, name: 'creationMethod' });
  const { cloneVM, error: cloneError, isSubmitting: isCloneSubmitting } = useCloneVM();

  const {
    createCustomizedVM,
    error: createError,
    isSubmitting: isCreateSubmitting,
  } = useCreateCustomizedVM();

  const isCloneMethod = isCloneCreationMethod(creationMethod);
  const submitCloneVM = handleSubmit((values: VMWizardFormValues) => cloneVM(values));
  const submitCustomizedVM = handleSubmit((values: VMWizardFormValues) =>
    createCustomizedVM(values),
  );

  return isCloneMethod
    ? { createVM: submitCloneVM, error: cloneError, isSubmitting: isCloneSubmitting }
    : { createVM: submitCustomizedVM, error: createError, isSubmitting: isCreateSubmitting };
};

export default useCreateVM;
