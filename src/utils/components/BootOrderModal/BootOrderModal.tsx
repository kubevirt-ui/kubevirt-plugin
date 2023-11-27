import * as React from 'react';
import produce from 'immer';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ModalPendingChangesAlert from '@kubevirt-utils/components/PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getDisks, getInterfaces } from '@kubevirt-utils/resources/vm';
import {
  BootableDeviceType,
  DeviceType,
  transformDevices,
} from '@kubevirt-utils/resources/vm/utils/boot-order/bootOrder';
import { ensurePath } from '@kubevirt-utils/utils/utils';

import TabModal from '../TabModal/TabModal';

import { BootOrderModalBody } from './BootOrderModalBody';

import './boot-order.scss';

export const BootOrderModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
}> = ({ isOpen, onClose, onSubmit, vm, vmi }) => {
  const { t } = useKubevirtTranslation();
  const transformedDevices = transformDevices(getDisks(vm), getInterfaces(vm));

  const [devices, setDevices] = React.useState<BootableDeviceType[]>(
    transformedDevices.sort((a, b) => a.value.bootOrder - b.value.bootOrder),
  );
  const [isEditMode, setIsEditMode] = React.useState(
    transformedDevices.some((device) => !!device.value.bootOrder),
  );

  const updatedVirtualMachine = produce<V1VirtualMachine>(vm, (draftVM) => {
    ensurePath(draftVM, ['spec.template.spec.domain.devices']);

    draftVM.spec.template.spec.domain.devices.disks = devices
      .filter((source) => source.type === DeviceType.DISK)
      .map((source) => source.value);

    draftVM.spec.template.spec.domain.devices.interfaces = devices
      .filter((source) => source.type === DeviceType.NIC)
      .map((source) => source.value);
  });

  return (
    <TabModal
      headerText={t('VirtualMachine boot order')}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={() => onSubmit(updatedVirtualMachine)}
    >
      {vmi && <ModalPendingChangesAlert />}
      <BootOrderModalBody
        changeEditMode={(v) => setIsEditMode(v)}
        devices={devices}
        isEditMode={isEditMode}
        onChange={setDevices}
      />
    </TabModal>
  );
};
