// Extracted from utils.ts
// Root: src/views/virtualmachines/details/tabs/configuration/details/utils/utils.ts

import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  getBootloader,
  getDevices,
  getDisks,
  getDomainFeatures,
  getInterfaces,
} from '@kubevirt-utils/resources/vm';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { printableVMStatus } from '@virtualmachines/utils';

export const updateStartStrategy = (checked: boolean, vm: V1VirtualMachine): void => {
  kubevirtK8sPatch({
    cluster: getCluster(vm),
    data: [
      {
        op: 'replace',
        path: `/spec/template/spec/startStrategy`,
        value: checked ? printableVMStatus.Paused : null,
      },
    ],
    model: VirtualMachineModel,
    resource: vm,
  }).catch(kubevirtConsole.error);
};

export const updateBootLoader = (
  updatedVM: V1VirtualMachine,
  vm: V1VirtualMachine,
): Promise<V1VirtualMachine> => {
  const bootLoaderBeforeUpdate = getBootloader(vm);
  const isEfiSecure = getBootloader(updatedVM)?.efi?.secureBoot;
  const domainFeatures = getDomainFeatures(vm);

  const hasSMMFeatureDefined = domainFeatures?.smm !== undefined;

  return kubevirtK8sPatch({
    cluster: getCluster(updatedVM),
    data: [
      {
        op: bootLoaderBeforeUpdate ? 'replace' : 'add',
        path: `/spec/template/spec/domain/firmware`,
        value: { bootloader: getBootloader(updatedVM) },
      },
      ...(isEfiSecure
        ? [
            {
              op: 'add',
              path: `/spec/template/spec/domain/features`,
              value: {},
            },
            {
              op: hasSMMFeatureDefined ? 'replace' : 'add',
              path: `/spec/template/spec/domain/features/smm`,
              value: { enabled: true },
            },
          ]
        : []),
    ],
    model: VirtualMachineModel,
    resource: updatedVM,
  });
};

export const updateBootOrder = (updatedVM: V1VirtualMachine): Promise<V1VirtualMachine> =>
  kubevirtK8sPatch({
    cluster: getCluster(updatedVM),
    data: [
      {
        op: 'replace',
        path: `/spec/template/spec/domain/devices/disks`,
        value: getDisks(updatedVM),
      },
      {
        op: 'replace',
        path: `/spec/template/spec/domain/devices/interfaces`,
        value: getInterfaces(updatedVM),
      },
    ],
    model: VirtualMachineModel,
    resource: updatedVM,
  });

export const updateMetadata = (
  updatedVM: V1VirtualMachine,
  data: { [key: string]: string },
  type: string,
): Promise<V1VirtualMachine> =>
  kubevirtK8sPatch({
    cluster: getCluster(updatedVM),
    data: [
      {
        op: 'replace',
        path: `/metadata/${type}`,
        value: data,
      },
    ],
    model: VirtualMachineModel,
    resource: updatedVM,
  });

export const updateAnnotation = (
  updatedVM: V1VirtualMachine,
  data: { [key: string]: string },
): Promise<V1VirtualMachine> => updateMetadata(updatedVM, data, 'annotations');

export const updateLabels = (
  updatedVM: V1VirtualMachine,
  data: { [key: string]: string },
): Promise<V1VirtualMachine> => updateMetadata(updatedVM, data, 'labels');

export const updateHardwareDevices = (
  type: string,
  vm: V1VirtualMachine,
): Promise<V1VirtualMachine> =>
  kubevirtK8sPatch({
    cluster: getCluster(vm),
    data: [
      {
        op: 'replace',
        path: `/spec/template/spec/domain/devices/${type}`,
        value: getDevices(vm)?.[type as never],
      },
    ],
    model: VirtualMachineModel,
    resource: vm,
  });
