import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import {
  V1beta1DataVolumeSpec,
  V1VirtualMachine,
  V1VirtualMachineSpec,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';

const overrideVirtualMachineSpec = (
  virtualMachine: V1VirtualMachine,
  customSource?: V1beta1DataVolumeSpec,
): V1VirtualMachineSpec => {
  const dataVolumeTemplate = virtualMachine?.spec?.dataVolumeTemplates?.[0];

  if (!dataVolumeTemplate || !customSource) return virtualMachine.spec;

  const newDataVolumeTemplate = {
    ...dataVolumeTemplate,
    spec: { ...dataVolumeTemplate.spec, ...customSource },
  };

  delete newDataVolumeTemplate.spec.sourceRef;

  return {
    ...virtualMachine.spec,
    dataVolumeTemplates: [newDataVolumeTemplate],
  };
};

export const overrideVirtualMachineObject = (
  template: V1Template,
  name: string,
  customSource?: V1beta1DataVolumeSpec,
): V1VirtualMachine => {
  const virtualMachine = getTemplateVirtualMachineObject(template);

  return {
    ...virtualMachine,
    metadata: {
      ...virtualMachine.metadata,
      name,
    },
    spec: overrideVirtualMachineSpec(virtualMachine, customSource),
  };
};

export const overrideTemplate = (
  template: V1Template,
  name: string,
  customSource?: V1beta1DataVolumeSpec,
): V1Template => {
  return {
    ...template,
    objects: [overrideVirtualMachineObject(template, name, customSource)],
  };
};
