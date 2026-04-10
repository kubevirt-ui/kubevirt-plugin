import useCloneVM from '@virtualmachines/creation-wizard/hooks/useCloneVM';
import useCreateCustomizedVM from '@virtualmachines/creation-wizard/hooks/useCreateCustomizedVM';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import { isCloneCreationMethod } from '@virtualmachines/creation-wizard/utils/utils';

type UseCreateVM = () => () => Promise<void>;

const useCreateVM: UseCreateVM = () => {
  const { creationMethod } = useVMWizardStore();
  const cloneVM = useCloneVM();
  const { createCustomizedVM } = useCreateCustomizedVM();

  if (isCloneCreationMethod(creationMethod)) return cloneVM;
  else return createCustomizedVM;
};

export default useCreateVM;
