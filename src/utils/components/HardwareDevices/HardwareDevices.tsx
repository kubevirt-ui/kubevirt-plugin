import * as React from 'react';

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
import HardwareDevicesTable from './HardwareDevicesTable';
import HardwareDeviceTitle from './HardwareDeviceTitle';

type HardwareDevicesProps = {
  vm: V1VirtualMachine;
  onSubmit?: (vm: V1VirtualMachine) => Promise<void | V1VirtualMachine>;
  canEdit?: boolean;
  vmi?: V1VirtualMachineInstance;
};

const HardwareDevices: React.FC<HardwareDevicesProps> = ({ vm, vmi, onSubmit, canEdit = true }) => {
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
        headerText={t('GPU devices')}
        onSubmit={onSubmit}
        initialDevices={gpus}
        btnText={t('Add GPU device')}
        type={HARDWARE_DEVICE_TYPE.GPUS}
        vmi={vmi}
      />
    ));
  };

  const onEditHostDevices = () => {
    createModal(({ isOpen, onClose }) => (
      <HardwareDevicesModal
        vm={vm}
        isOpen={isOpen}
        onClose={onClose}
        headerText={t('Host devices')}
        onSubmit={onSubmit}
        initialDevices={hostDevices}
        btnText={t('Add Host device')}
        type={HARDWARE_DEVICE_TYPE.HOST_DEVICES}
        vmi={vmi}
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
