import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';

import { produceVMNetworks } from '@catalog/utils/WizardVMContext';
import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';

export const produceTemplateNetwork = (
  template: V1Template,
  updateNetwork: (vmDraft: WritableDraft<V1VirtualMachine>) => void,
) => {
  return produce(template, (draftTemplate) => {
    const vm = getTemplateVirtualMachineObject(draftTemplate);

    const updatedVM = produceVMNetworks(vm, updateNetwork);

    draftTemplate.objects = [updatedVM];
  });
};
