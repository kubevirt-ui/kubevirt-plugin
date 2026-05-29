import produce from 'immer';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getTemplateVirtualMachineObject, Template } from '@kubevirt-utils/resources/template';

export const getTemplateVMWithNamespace = (template: Template): undefined | V1VirtualMachine => {
  const vm = getTemplateVirtualMachineObject(template);

  if (!vm?.spec) {
    return undefined;
  }

  return produce(vm, (draftVM) => {
    draftVM.metadata ??= {};
    draftVM.metadata.namespace ??= template?.metadata?.namespace || 'default';
  });
};
