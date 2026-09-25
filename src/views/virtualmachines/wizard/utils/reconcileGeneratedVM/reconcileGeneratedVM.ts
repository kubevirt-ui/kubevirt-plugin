import { produce } from 'immer';
import isEqual from 'lodash/isEqual';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  getDisks,
  getInterfaces,
  getNetworks,
  getVolumes,
} from '@kubevirt-utils/resources/vm/utils/selectors';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import { reconcileVMDraftUpdate } from '@virtualmachines/wizard/utils/reconcileVMDraftUpdate';

const getGeneratedStorage = (vm: V1VirtualMachine): Record<string, unknown> => ({
  dataVolumeTemplates: vm.spec?.dataVolumeTemplates,
  disks: getDisks(vm),
  volumes: getVolumes(vm),
});

const getGeneratedNetworking = (vm: V1VirtualMachine): Record<string, unknown> => ({
  interfaces: getInterfaces(vm),
  networks: getNetworks(vm),
});

export const reconcileGeneratedVM = (
  previousGeneratedVM: V1VirtualMachine,
  customizedVM: V1VirtualMachine,
  nextGeneratedVM: V1VirtualMachine,
): V1VirtualMachine => {
  const reconciledVM = reconcileVMDraftUpdate(previousGeneratedVM, customizedVM, nextGeneratedVM);
  const storageChanged = !isEqual(
    getGeneratedStorage(previousGeneratedVM),
    getGeneratedStorage(nextGeneratedVM),
  );
  const networkingChanged = !isEqual(
    getGeneratedNetworking(previousGeneratedVM),
    getGeneratedNetworking(nextGeneratedVM),
  );

  return produce(reconciledVM, (draft) => {
    if (storageChanged) {
      draft.spec.dataVolumeTemplates = nextGeneratedVM.spec.dataVolumeTemplates;

      ensurePath(draft, 'spec.template.spec.domain.devices');

      draft.spec.template.spec.domain.devices.disks = getDisks(nextGeneratedVM);
      draft.spec.template.spec.volumes = getVolumes(nextGeneratedVM);
    }

    if (networkingChanged) {
      ensurePath(draft, 'spec.template.spec.domain.devices');

      draft.spec.template.spec.domain.devices.interfaces = getInterfaces(nextGeneratedVM);
      draft.spec.template.spec.networks = getNetworks(nextGeneratedVM);
    }
  });
};
