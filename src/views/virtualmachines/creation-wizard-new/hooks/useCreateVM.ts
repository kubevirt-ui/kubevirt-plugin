import useCloneVM from '@virtualmachines/creation-wizard-new/hooks/useCloneVM';
import useCreateCustomizedVM from '@virtualmachines/creation-wizard-new/hooks/useCreateCustomizedVM';
import useVMWizardStore from '@virtualmachines/creation-wizard-new/state/vm-wizard-store/useVMWizardStore';
import { isCloneCreationMethod } from '@virtualmachines/creation-wizard-new/utils/utils';

type UseCreateVM = () => {
  createVM: () => Promise<void>;
  error: Error | unknown;
  isSubmitting: boolean;
};

const useCreateVM: UseCreateVM = () => {
  const { creationMethod } = useVMWizardStore();
  const cloneVM = useCloneVM();
  const { createCustomizedVM, error, isSubmitting } = useCreateCustomizedVM();

  return {
    createVM: isCloneCreationMethod(creationMethod) ? cloneVM : createCustomizedVM,
    error,
    isSubmitting,
  };
};

export default useCreateVM;
