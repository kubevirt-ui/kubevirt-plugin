import React, { FC } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import HardwareDevicesModal from '@kubevirt-utils/components/HardwareDevices/modal/HardwareDevicesModal';
import { HARDWARE_DEVICE_TYPE } from '@kubevirt-utils/components/HardwareDevices/utils/constants';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getGPUDevices } from '@kubevirt-utils/resources/vm';
import { updateHardwareDevices } from '@virtualmachines/details/tabs/configuration/details/utils/utils';

import '../../../../TopologyVMDetailsPanel.scss';

type VMGPUDevicesDetailsItemProps = {
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const VMGPUDevicesDetailsItem: FC<VMGPUDevicesDetailsItemProps> = ({ vm, vmi }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const gpus = getGPUDevices(vm);
  const gpusCount = getGPUDevices(vm)?.length || [].length;

  const onEditGPU = () => {
    createModal(({ isOpen, onClose }) => (
      <HardwareDevicesModal
        btnText={t('Add GPU device')}
        headerText={t('GPU devices')}
        initialDevices={gpus}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={(updatedVM) => updateHardwareDevices(HARDWARE_DEVICE_TYPE.GPUS, updatedVM)}
        type={HARDWARE_DEVICE_TYPE.GPUS}
        vm={vm}
        vmi={vmi}
      />
    ));
  };

  return (
    <DescriptionItem
      descriptionData={
        <span>
          {t('{{gpusCount}} GPU devices', {
            gpusCount,
          })}
        </span>
      }
      className="topology-vm-details-panel__item"
      descriptionHeader={<span id="gpu-devices">{t('GPU devices')}</span>}
      isEdit
      onEditClick={onEditGPU}
    />
  );
};

export default VMGPUDevicesDetailsItem;
