import { useWatch } from 'react-hook-form';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import { useVMWizardForm } from '../form/VMWizardFormProvider';
import { VMCreationMethod } from '../utils/constants';

export const useWizardReviewVM = (): V1VirtualMachine | null => {
  const { control } = useVMWizardForm();
  const [creationMethod, sourceVM, vmDraft] = useWatch({
    control,
    name: ['creationMethod', 'clone.sourceVM', 'customization.vmDraft'],
  });

  return creationMethod === VMCreationMethod.CLONE ? sourceVM : vmDraft;
};
