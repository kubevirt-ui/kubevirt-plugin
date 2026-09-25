import produce from 'immer';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { removePodNetworkFromVM } from '@kubevirt-utils/resources/vm/utils/network/utils';
import { VMCreationMethod } from '@virtualmachines/wizard/utils/constants';

import { finalizeWizardVMDraft } from './finalizeWizardVMDraft';
import { type VMWizardFormValues } from './types';

export type FinalVMMapperEnvironment = {
  isIPv6SingleStack: boolean;
};

export const mapWizardValuesToFinalVM = (
  values: VMWizardFormValues,
  { isIPv6SingleStack }: FinalVMMapperEnvironment,
): null | V1VirtualMachine => {
  if (values.creationMethod === VMCreationMethod.CLONE || !values.customization.vmDraft) {
    return null;
  }

  const finalizedDraft = finalizeWizardVMDraft(values.customization.vmDraft, values.deployment);

  if (!isIPv6SingleStack) return finalizedDraft;

  return produce(finalizedDraft, (draft) => removePodNetworkFromVM(draft));
};
