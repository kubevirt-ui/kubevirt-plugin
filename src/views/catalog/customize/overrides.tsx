import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template/utils/selectors';

export const overrideStorage = (dataVolumeStorage, newStorage: string) => {
  if (!newStorage) return dataVolumeStorage;

  return {
    ...dataVolumeStorage,
    resources: {
      ...dataVolumeStorage?.resources,
      requests: {
        ...dataVolumeStorage?.resources?.requests,
        storage: newStorage,
      },
    },
  };
};

export const overrideVirtualMachineObject = (
  template: V1Template,
  name: string,
): V1VirtualMachine => {
  const virtualMachine = getTemplateVirtualMachineObject(template);

  return {
    ...virtualMachine,
    metadata: {
      ...virtualMachine.metadata,
      name,
    },
  };
};

export const overrideTemplate = (template: V1Template, name: string): V1Template => {
  return {
    ...template,
    objects: [overrideVirtualMachineObject(template, name)],
  };
};
