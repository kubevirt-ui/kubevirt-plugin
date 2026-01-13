import React, { FC, useState } from 'react';
import produce from 'immer';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ModalPendingChangesAlert from '@kubevirt-utils/components/PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  BootableDeviceType,
  DeviceType,
  getSortedBootableDevices,
} from '@kubevirt-utils/resources/vm/utils/boot-order/bootOrder';
import { ensurePath } from '@kubevirt-utils/utils/utils';

import TabModal from '../TabModal/TabModal';

import { BootOrderModalBody } from './BootOrderModalBody';

import './boot-order.scss';

const BootOrderModal: FC<{
  instanceTypeVM: V1VirtualMachine;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine>;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
}> = ({ instanceTypeVM, isOpen, onClose, onSubmit, vm, vmi }) => {
  const { t } = useKubevirtTranslation();
  const sortedBootableDevices = getSortedBootableDevices({ instanceTypeVM, vm });

  const [devices, setDevices] = useState<BootableDeviceType[]>(sortedBootableDevices);
  const [isEditMode, setIsEditMode] = useState(
    sortedBootableDevices.some((device) => !!device.value.bootOrder),
  );

  const updatedVirtualMachine = produce<V1VirtualMachine>(vm, (draftVM) => {
    ensurePath(draftVM, ['spec.template.spec.domain.devices']);
    const updatedDevices = devices.map((device, index) => ({
      ...device,
      value: {
        ...device.value,
        bootOrder: index + 1,
      },
    }));

    draftVM.spec.template.spec.domain.devices.disks = updatedDevices
      .filter((source) => source.type === DeviceType.DISK)
      .map((source) => source.value);

    draftVM.spec.template.spec.domain.devices.interfaces = updatedDevices
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

export default BootOrderModal;
