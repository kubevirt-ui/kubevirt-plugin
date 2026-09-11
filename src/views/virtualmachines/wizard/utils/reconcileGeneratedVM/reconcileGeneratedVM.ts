import { produce } from 'immer';
import isEqual from 'lodash/isEqual';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import {
  getGeneratedNetworkConfiguration,
  getGeneratedStorageConfiguration,
  reconcileValue,
} from './utils/helpers';

export const reconcileGeneratedVM = (
  previousGeneratedVM: V1VirtualMachine,
  customizedVM: V1VirtualMachine,
  nextGeneratedVM: V1VirtualMachine,
): V1VirtualMachine => {
  const reconciledVM = reconcileValue(
    previousGeneratedVM,
    customizedVM,
    nextGeneratedVM,
  ) as V1VirtualMachine;
  const generatedStorageChanged = !Boolean(
    isEqual(
      getGeneratedStorageConfiguration(previousGeneratedVM),
      getGeneratedStorageConfiguration(nextGeneratedVM),
    ),
  );
  const generatedNetworkChanged = !Boolean(
    isEqual(
      getGeneratedNetworkConfiguration(previousGeneratedVM),
      getGeneratedNetworkConfiguration(nextGeneratedVM),
    ),
  );

  return produce(reconciledVM, (draftVM) => {
    if (generatedStorageChanged) {
      draftVM.spec.dataVolumeTemplates = nextGeneratedVM.spec.dataVolumeTemplates;
      draftVM.spec.template.spec.domain.devices.disks =
        nextGeneratedVM.spec.template.spec.domain.devices.disks;
      draftVM.spec.template.spec.volumes = nextGeneratedVM.spec.template.spec.volumes;
    }

    if (generatedNetworkChanged) {
      draftVM.spec.template.spec.domain.devices.interfaces =
        nextGeneratedVM.spec.template.spec.domain.devices.interfaces;
      draftVM.spec.template.spec.networks = nextGeneratedVM.spec.template.spec.networks;
    }
  });
};
