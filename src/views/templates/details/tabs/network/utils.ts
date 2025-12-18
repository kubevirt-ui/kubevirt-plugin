import produce from 'immer';
import { Draft } from 'immer';

import { produceVMNetworks } from '@catalog/utils/WizardVMContext';
import { TemplateModel, V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  getTemplateVirtualMachineObject,
  replaceTemplateVM,
} from '@kubevirt-utils/resources/template';
import { getInterface } from '@kubevirt-utils/resources/vm';
import { NetworkInterfaceState } from '@kubevirt-utils/resources/vm/utils/network/types';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sUpdate } from '@multicluster/k8sRequests';

export const produceTemplateNetwork = (
  template: V1Template,
  updateNetwork: (vmDraft: Draft<V1VirtualMachine>) => void,
) => {
  const vm = getTemplateVirtualMachineObject(template);
  const updatedVM = produceVMNetworks(vm, updateNetwork);

  return replaceTemplateVM(template, updatedVM);
};

export const setTemplateNetworkInterfaceState = (
  template: V1Template,
  nicName: string,
  desiredState: NetworkInterfaceState,
): Promise<V1Template | void> => {
  const templateVM = getTemplateVirtualMachineObject(template);
  if (!getInterface(templateVM, nicName)) return undefined;

  const updatedTemplate = produce(template, (draftTemplate) => {
    const draftTemplateVM = getTemplateVirtualMachineObject(draftTemplate);
    const interfaceToUpdate = getInterface(draftTemplateVM, nicName);
    interfaceToUpdate.state = desiredState;
  });

  return kubevirtK8sUpdate({
    cluster: getCluster(template),
    data: updatedTemplate,
    model: TemplateModel,
  }).catch((error) => kubevirtConsole.error(error));
};
