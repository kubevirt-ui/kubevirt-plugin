import produce from 'immer';

import { V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';

export const getTemplateVMWithNamespace = (template: V1Template): V1VirtualMachine => {
  const vm = getTemplateVirtualMachineObject(template);

  if (vm) {
    return produce(vm, (draftVM) => {
      draftVM.metadata.namespace =
        draftVM?.metadata?.namespace || template?.metadata?.namespace || 'default';
    });
  }
};
