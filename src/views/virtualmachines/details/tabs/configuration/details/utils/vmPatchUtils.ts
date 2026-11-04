import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  getBootloader,
  getDevices,
  getDisks,
  getDomainFeatures,
  getInterfaces,
} from '@kubevirt-utils/resources/vm';
import { patchVM } from '@kubevirt-utils/resources/vm/utils/patch';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { printableVMStatus } from '@virtualmachines/utils';

export const updateStartStrategy = (checked: boolean, vm: V1VirtualMachine): void => {
  patchVM(vm, [
    {
      op: 'replace',
      path: `/spec/template/spec/startStrategy`,
      value: checked ? printableVMStatus.Paused : null,
    },
  ]).catch(kubevirtConsole.error);
};

export const updateBootLoader = (
  updatedVM: V1VirtualMachine,
  vm: V1VirtualMachine,
): Promise<V1VirtualMachine> => {
  const bootLoaderBeforeUpdate = getBootloader(vm);
  const isEfiSecure = getBootloader(updatedVM)?.efi?.secureBoot;
  const domainFeatures = getDomainFeatures(vm);

  const hasSMMFeatureDefined = domainFeatures?.smm !== undefined;

  return patchVM(updatedVM, [
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
  ]);
};

export const updateBootOrder = (updatedVM: V1VirtualMachine): Promise<V1VirtualMachine> =>
  patchVM(updatedVM, [
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
  ]);

export const updateMetadata = (
  updatedVM: V1VirtualMachine,
  data: { [key: string]: string },
  type: string,
): Promise<V1VirtualMachine> =>
  patchVM(updatedVM, [
    {
      op: 'replace',
      path: `/metadata/${type}`,
      value: data,
    },
  ]);

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
  patchVM(vm, [
    {
      op: 'replace',
      path: `/spec/template/spec/domain/devices/${type}`,
      value: getDevices(vm)?.[type as never],
    },
  ]);
