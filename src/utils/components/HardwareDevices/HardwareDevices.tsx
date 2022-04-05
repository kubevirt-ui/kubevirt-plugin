import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getGPUDevices, getHostDevices } from '@kubevirt-utils/resources/vm';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
} from '@patternfly/react-core';

import { useModal } from '../ModalProvider/ModalProvider';

import { HARDWARE_DEVICE_TYPE } from './utils/constants';
import HardwareDevicesModal from './HardwareDevicesModal';
import HardwareDevicesTable from './HardwareDevicesTable';
import HardwareDeviceTitle from './HardwareDeviceTitle';

type HardwareDevicesProps = {
  vm: V1VirtualMachine;
  onSubmit?: (vm: V1VirtualMachine) => Promise<void | V1VirtualMachine>;
  canEdit?: boolean;
};

const HardwareDevices: React.FC<HardwareDevicesProps> = ({ vm, onSubmit, canEdit = true }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const hostDevices = getHostDevices(vm);
  const gpus = getGPUDevices(vm);

  const onEditGPU = () => {
    createModal(({ isOpen, onClose }) => (
      <HardwareDevicesModal
        vm={vm}
        isOpen={isOpen}
        onClose={onClose}
        headerText={t('GPU Devices')}
        onSubmit={onSubmit}
        initialDevices={gpus}
        btnText={t('Add GPU device')}
        type={HARDWARE_DEVICE_TYPE.GPUS}
      />
    ));
  };

  const onEditHostDevices = () => {
    createModal(({ isOpen, onClose }) => (
      <HardwareDevicesModal
        vm={vm}
        isOpen={isOpen}
        onClose={onClose}
        headerText={t('Host Devices')}
        onSubmit={onSubmit}
        initialDevices={hostDevices}
        btnText={t('Add Host device')}
        type={HARDWARE_DEVICE_TYPE.HOST_DEVICES}
      />
    ));
  };

  return (
    <DescriptionList>
      <DescriptionListGroup>
        <HardwareDeviceTitle title={t('GPU devices')} onClick={onEditGPU} canEdit={canEdit} />
        <DescriptionListDescription>
          <HardwareDevicesTable devices={gpus} />
        </DescriptionListDescription>
      </DescriptionListGroup>

      <DescriptionListGroup>
        <HardwareDeviceTitle
          title={t('Host devices')}
          onClick={onEditHostDevices}
          canEdit={canEdit}
        />
        <DescriptionListDescription>
          <HardwareDevicesTable devices={hostDevices} />
        </DescriptionListDescription>
      </DescriptionListGroup>
    </DescriptionList>
  );
};

export default HardwareDevices;
