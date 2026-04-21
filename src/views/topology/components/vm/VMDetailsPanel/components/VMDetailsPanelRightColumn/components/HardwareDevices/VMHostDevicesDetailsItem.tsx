import React, { FC } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import HardwareDevicesModal from '@kubevirt-utils/components/HardwareDevices/modal/HardwareDevicesModal';
import { HARDWARE_DEVICE_TYPE } from '@kubevirt-utils/components/HardwareDevices/utils/constants';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getHostDevices } from '@kubevirt-utils/resources/vm';
import { updateHardwareDevices } from '@virtualmachines/details/tabs/configuration/details/utils/utils';

import '../../../../TopologyVMDetailsPanel.scss';

type VMHostDevicesDetailsItemProps = {
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const VMHostDevicesDetailsItem: FC<VMHostDevicesDetailsItemProps> = ({ vm, vmi }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const hostDevices = getHostDevices(vm);
  const hostDevicesCount = getHostDevices(vm)?.length || [].length;

  const onEditHostDevices = () => {
    createModal(({ isOpen, onClose }) => (
      <HardwareDevicesModal
        onSubmit={(updatedVM) =>
          updateHardwareDevices(HARDWARE_DEVICE_TYPE.HOST_DEVICES, updatedVM)
        }
        btnText={t('Add Host device')}
        headerText={t('Host devices')}
        initialDevices={hostDevices}
        isOpen={isOpen}
        onClose={onClose}
        type={HARDWARE_DEVICE_TYPE.HOST_DEVICES}
        vm={vm}
        vmi={vmi}
      />
    ));
  };

  return (
    <DescriptionItem
      descriptionData={
        <span>
          {t('{{hostDevicesCount}} Host devices', {
            hostDevicesCount,
          })}
        </span>
      }
      className="topology-vm-details-panel__item"
      descriptionHeader={<span id="host-devices">{t('Host devices')}</span>}
      isEdit
      onEditClick={onEditHostDevices}
    />
  );
};

export default VMHostDevicesDetailsItem;
