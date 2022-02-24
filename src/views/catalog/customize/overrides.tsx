import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine, V1VirtualMachineSpec } from '@kubevirt-ui/kubevirt-api/kubevirt';

import { getTemplateVirtualMachineObject } from '../utils/templateGetters';

import { DISK_SOURCE } from './components/DiskSource';

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

const overrideVirtualMachineSpec = (
  virtualMachine: V1VirtualMachine,
  customDiskSource: DISK_SOURCE,
): V1VirtualMachineSpec => {
  if (
    customDiskSource &&
    virtualMachine.spec.dataVolumeTemplates &&
    virtualMachine.spec.dataVolumeTemplates.length > 0
  ) {
    const dataVolumeTemplate = virtualMachine.spec.dataVolumeTemplates[0];

    const newDataVolume = {
      ...dataVolumeTemplate,
      spec: { ...dataVolumeTemplate.spec },
    };

    if (customDiskSource?.storage) {
      newDataVolume.spec.storage = overrideStorage(
        dataVolumeTemplate.spec.storage,
        customDiskSource?.storage,
      );
    }

    if (customDiskSource?.source) {
      delete dataVolumeTemplate.spec.sourceRef;
      dataVolumeTemplate.spec.source = customDiskSource.source;
    }
  } else {
    return virtualMachine.spec;
  }
};

export const overrideVirtualMachineObject = (
  template: V1Template,
  namespace: string,
  name: string,
  customDiskSource: DISK_SOURCE,
): V1VirtualMachine => {
  const virtualMachine = getTemplateVirtualMachineObject(template);

  return {
    ...virtualMachine,
    metadata: {
      ...virtualMachine,
      name,
      namespace,
    },
    spec: overrideVirtualMachineSpec(virtualMachine, customDiskSource),
  };
};

export const overrideTemplate = (
  template: V1Template,
  namespace: string,
  name: string,
  customDiskSource: DISK_SOURCE,
): V1Template => {
  return {
    ...template,
    objects: [
      overrideVirtualMachineObject(template, namespace, name, customDiskSource),
      ...template.objects.filter((object) => object.kind !== VirtualMachineModel.kind),
    ],
  };
};
