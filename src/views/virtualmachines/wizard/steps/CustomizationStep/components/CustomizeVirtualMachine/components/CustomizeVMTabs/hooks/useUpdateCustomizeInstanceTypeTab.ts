import { useCallback } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import { patchWizardCustomizedVM } from '@virtualmachines/wizard/utils/patchWizardCustomizedVM';

type UseUpdateCustomizeInstanceTypeTabReturn = {
  updateVMFromForm: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine>;
};

const useUpdateCustomizeInstanceTypeTab = (): UseUpdateCustomizeInstanceTypeTabReturn => {
  const { getValues, setValue } = useVMWizardForm();
  const updateVMFromForm = useCallback(
    (updatedVM: V1VirtualMachine): Promise<V1VirtualMachine> => {
      const replacePatch = [{ data: updatedVM }];
      const patchedVM = patchWizardCustomizedVM(getValues, setValue, replacePatch);

      return Promise.resolve(patchedVM ?? updatedVM);
    },
    [getValues, setValue],
  );

  return { updateVMFromForm };
};

export default useUpdateCustomizeInstanceTypeTab;
