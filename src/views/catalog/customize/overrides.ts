import produce from 'immer';

import { produceVMDisks } from '@catalog/utils/WizardVMContext';
import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataVolumeSpec, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';

export const overrideVirtualMachineDataVolumeSpec = (
  virtualMachine: V1VirtualMachine,
  customSource?: V1beta1DataVolumeSpec,
): V1VirtualMachine => {
  return produceVMDisks(virtualMachine, (draftVM) => {
    if (draftVM.spec.dataVolumeTemplates[0] && !!customSource)
      draftVM.spec.dataVolumeTemplates[0].spec = customSource;
  });
};

export const overrideVirtualMachineName = (
  template: V1Template,
  name: string,
): V1VirtualMachine => {
  const virtualMachine = getTemplateVirtualMachineObject(template);

  return produce(virtualMachine, (draftVM) => {
    draftVM.metadata.name = name;
  });
};

export const overrideTemplateVirtualMachine = (template: V1Template, name: string): V1Template => {
  return {
    ...template,
    objects: [overrideVirtualMachineName(template, name)],
  };
};
