import * as React from 'react';
import { useHistory } from 'react-router-dom';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import CPUMemoryModal from '@kubevirt-utils/components/CPUMemoryModal/CpuMemoryModal';
import HardwareDevicesModal from '@kubevirt-utils/components/HardwareDevices/HardwareDevicesModal';
import { HARDWARE_DEVICE_TYPE } from '@kubevirt-utils/components/HardwareDevices/utils/constants';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getGPUDevices, getHostDevices } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';

import { VirtualMachineDetailsTab, VirtualMachineDetailsTabLabel } from '../utils/constants';
import {
  checkBootOrderChanged,
  checkCPUMemoryChanged,
  getChangedEnvDisks,
  getChangedGPUDevices,
  getChangedHostDevices,
  getChangedNics,
  getTabURL,
} from '../utils/helpers';
import { PendingChange } from '../utils/types';

export const usePendingChanges = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): PendingChange[] => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();
  const { createModal } = useModal();

  const cpuMemoryChanged = checkCPUMemoryChanged(vm, vmi);
  const bootOrderChanged = checkBootOrderChanged(vm, vmi);

  const modifiedEnvDisks = getChangedEnvDisks(vm, vmi);
  const modifiedNics = getChangedNics(vm, vmi);
  const modifiedGPUDevices = getChangedGPUDevices(vm, vmi);
  const modifiedHostDevices = getChangedHostDevices(vm, vmi);

  const onSubmit = (updatedVM: V1VirtualMachine) =>
    k8sUpdate({
      model: VirtualMachineModel,
      data: updatedVM,
      ns: updatedVM?.metadata?.namespace,
      name: updatedVM?.metadata?.name,
    });

  return [
    {
      hasPendingChange: cpuMemoryChanged,
      tabLabel: VirtualMachineDetailsTabLabel.Details,
      label: t('CPU | Memory'),
      handleAction: () => {
        history.push(getTabURL(vm, VirtualMachineDetailsTab.Details));
        createModal(({ isOpen, onClose }) => (
          <CPUMemoryModal vm={vm} isOpen={isOpen} onClose={onClose} onSubmit={onSubmit} vmi={vmi} />
        ));
      },
    },
    {
      hasPendingChange: bootOrderChanged,
      tabLabel: VirtualMachineDetailsTabLabel.Details,
      label: t('Boot order'),
      handleAction: () => {
        history.push(getTabURL(vm, VirtualMachineDetailsTab.Details));
        // TODO: createModal(({ isOpen, onClose }) => (<BootOrderModal vm={vm} isOpen={isOpen} onClose={onClose} onSubmit={onSubmit} />))
      },
    },
    {
      hasPendingChange: !isEmpty(modifiedEnvDisks),
      tabLabel: VirtualMachineDetailsTabLabel.Environment,
      label:
        !isEmpty(modifiedEnvDisks) && modifiedEnvDisks?.length > 1
          ? modifiedEnvDisks.join(', ')
          : modifiedEnvDisks[0],
      handleAction: () => {
        history.push(getTabURL(vm, VirtualMachineDetailsTab.Environment));
      },
    },
    {
      hasPendingChange: !isEmpty(modifiedNics),
      tabLabel: VirtualMachineDetailsTabLabel.NetworkInterfaces,
      label:
        !isEmpty(modifiedNics) && modifiedNics?.length > 1
          ? modifiedNics.join(', ')
          : modifiedNics[0],
      handleAction: () => {
        history.push(getTabURL(vm, VirtualMachineDetailsTab.NetworkInterfaces));
      },
    },
    {
      hasPendingChange: !isEmpty(modifiedGPUDevices),
      tabLabel: VirtualMachineDetailsTabLabel.Details,
      label:
        !isEmpty(modifiedGPUDevices) && modifiedGPUDevices?.length > 1
          ? modifiedGPUDevices.join(', ')
          : modifiedGPUDevices[0],
      handleAction: () => {
        history.push(getTabURL(vm, VirtualMachineDetailsTab.Details));
        createModal(({ isOpen, onClose }) => (
          <HardwareDevicesModal
            vm={vm}
            isOpen={isOpen}
            onClose={onClose}
            headerText={t('GPU devices')}
            onSubmit={onSubmit}
            initialDevices={getGPUDevices(vm)}
            btnText={t('Add GPU device')}
            type={HARDWARE_DEVICE_TYPE.GPUS}
            vmi={vmi}
          />
        ));
      },
    },
    {
      hasPendingChange: !isEmpty(modifiedHostDevices),
      tabLabel: VirtualMachineDetailsTabLabel.Details,
      label:
        !isEmpty(modifiedHostDevices) && modifiedHostDevices?.length > 1
          ? modifiedHostDevices.join(', ')
          : modifiedHostDevices[0],
      handleAction: () => {
        history.push(getTabURL(vm, VirtualMachineDetailsTab.Details));
        createModal(({ isOpen, onClose }) => (
          <HardwareDevicesModal
            vm={vm}
            isOpen={isOpen}
            onClose={onClose}
            headerText={t('Host devices')}
            onSubmit={onSubmit}
            initialDevices={getHostDevices(vm)}
            btnText={t('Add Host device')}
            type={HARDWARE_DEVICE_TYPE.HOST_DEVICES}
            vmi={vmi}
          />
        ));
      },
    },
  ];
};
