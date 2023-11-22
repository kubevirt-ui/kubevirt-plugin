import React, { FC } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getGPUDevices, getHostDevices } from '@kubevirt-utils/resources/vm';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
} from '@patternfly/react-core';

import { useModal } from '../ModalProvider/ModalProvider';

import HardwareDevicesModal from './modal/HardwareDevicesModal';
import { HARDWARE_DEVICE_TYPE } from './utils/constants';
import HardwareDevicesHeadlessMode from './HardwareDevicesHeadlessMode';
import HardwareDevicesTable from './HardwareDevicesTable';
import HardwareDeviceTitle from './HardwareDeviceTitle';

type HardwareDevicesProps = {
  canEdit?: boolean;
  hideEdit?: boolean;
  onSubmit?: (vm: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const HardwareDevices: FC<HardwareDevicesProps> = ({
  canEdit = true,
  hideEdit = false,
  onSubmit,
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const hostDevices = getHostDevices(vm);
  const gpus = getGPUDevices(vm);

  const onEditGPU = () => {
    createModal(({ isOpen, onClose }) => (
      <HardwareDevicesModal
        btnText={t('Add GPU device')}
        headerText={t('GPU devices')}
        initialDevices={gpus}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={onSubmit}
        type={HARDWARE_DEVICE_TYPE.GPUS}
        vm={vm}
        vmi={vmi}
      />
    ));
  };

  const onEditHostDevices = () => {
    createModal(({ isOpen, onClose }) => (
      <HardwareDevicesModal
        btnText={t('Add Host device')}
        headerText={t('Host devices')}
        initialDevices={hostDevices}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={onSubmit}
        type={HARDWARE_DEVICE_TYPE.HOST_DEVICES}
        vm={vm}
        vmi={vmi}
      />
    ));
  };

  return (
    <DescriptionList>
      <DescriptionListGroup>
        <HardwareDeviceTitle
          canEdit={canEdit}
          hideEdit={hideEdit}
          onClick={onEditGPU}
          title={t('GPU devices')}
        />
        <DescriptionListDescription>
          <HardwareDevicesTable devices={gpus} />
        </DescriptionListDescription>
      </DescriptionListGroup>

      <DescriptionListGroup>
        <HardwareDeviceTitle
          canEdit={canEdit}
          hideEdit={hideEdit}
          onClick={onEditHostDevices}
          title={t('Host devices')}
        />
        <DescriptionListDescription>
          <HardwareDevicesTable devices={hostDevices} />
        </DescriptionListDescription>
      </DescriptionListGroup>
      {canEdit && !hideEdit && (
        <DescriptionListGroup>
          <HardwareDevicesHeadlessMode onSubmit={onSubmit} vm={vm} />
        </DescriptionListGroup>
      )}
    </DescriptionList>
  );
};

export default HardwareDevices;
