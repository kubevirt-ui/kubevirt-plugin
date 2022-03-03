import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

import { getTemplateVirtualMachineObject } from '../utils/templateGetters';

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
  namespace: string,
  name: string,
): V1VirtualMachine => {
  const virtualMachine = getTemplateVirtualMachineObject(template);

  return {
    ...virtualMachine,
    metadata: {
      ...virtualMachine,
      name,
      namespace,
    },
  };
};

export const overrideTemplate = (
  template: V1Template,
  namespace: string,
  name: string,
): V1Template => {
  return {
    ...template,
    objects: [
      overrideVirtualMachineObject(template, namespace, name),
      ...template.objects.filter((object) => object.kind !== VirtualMachineModel.kind),
    ],
  };
};
