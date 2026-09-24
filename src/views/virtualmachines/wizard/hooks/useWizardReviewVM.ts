import { useWatch } from 'react-hook-form';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import { useVMWizard } from '../state/vm-wizard-context/VMWizardContext';
import { VMCreationMethod } from '../utils/constants';

export const useWizardReviewVM = (): V1VirtualMachine | null => {
  const { control } = useVMWizard();
  const creationMethod = useWatch({ control, name: 'creationMethod' });

  return useWatch({
    control,
    name: creationMethod === VMCreationMethod.CLONE ? 'clone.sourceVM' : 'customization.vmDraft',
  });
};
