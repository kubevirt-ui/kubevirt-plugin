import React from 'react';

import DedicatedResourcesModal from '@kubevirt-utils/components/DedicatedResourcesModal/DedicatedResourcesModal';
import EvictionStrategyModal from '@kubevirt-utils/components/EvictionStrategy/EvictionStrategyModal';
import HardwareDevicesHeadlessModeModal from '@kubevirt-utils/components/HardwareDevices/modal/HardwareDevicesHeadlessModeModal';
import HardwareDevicesModal from '@kubevirt-utils/components/HardwareDevices/modal/HardwareDevicesModal';
import { HARDWARE_DEVICE_TYPE } from '@kubevirt-utils/components/HardwareDevices/utils/constants';
import StartPauseModal from '@kubevirt-utils/components/StartPauseModal/StartPauseModal';
import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { getGPUDevices, getHostDevices } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { type PendingChange } from '../../utils/types';
import { type PendingChangeContext } from './types';

export const getHardwarePendingChanges = ({
  createModal,
  createProps,
  onSubmit,
  params: {
    dedicatedResourcesChanged,
    evictionStrategyChanged,
    modifiedGPUDevices,
    modifiedGuestSystemAccessLog,
    modifiedHeadlessMode,
    modifiedHostDevices,
    modifiedVolumesHotplug,
    startStrategyChanged,
    t,
    vm,
    vmi,
  },
}: PendingChangeContext): PendingChange[] => [
  {
    ...createProps(VirtualMachineDetailsTab.Details, () =>
      createModal(({ isOpen, onClose }) => (
        <HardwareDevicesModal
          btnText={t('Add GPU device')}
          headerText={t('GPU devices')}
          initialDevices={getGPUDevices(vm) ?? []}
          isOpen={isOpen}
          onClose={onClose}
          onSubmit={onSubmit}
          type={HARDWARE_DEVICE_TYPE.GPUS}
          vm={vm}
          vmi={vmi}
        />
      )),
    ),
    hasPendingChange: !isEmpty(modifiedGPUDevices),
    label:
      !isEmpty(modifiedGPUDevices) && modifiedGPUDevices?.length > 1
        ? modifiedGPUDevices.join(', ')
        : modifiedGPUDevices[0],
  },
  {
    ...createProps(VirtualMachineDetailsTab.Details, () =>
      createModal(({ isOpen, onClose }) => (
        <HardwareDevicesModal
          btnText={t('Add host device')}
          headerText={t('Host devices')}
          initialDevices={getHostDevices(vm) ?? []}
          isOpen={isOpen}
          onClose={onClose}
          onSubmit={onSubmit}
          type={HARDWARE_DEVICE_TYPE.HOST_DEVICES}
          vm={vm}
          vmi={vmi}
        />
      )),
    ),
    hasPendingChange: !isEmpty(modifiedHostDevices),
    label:
      !isEmpty(modifiedHostDevices) && modifiedHostDevices?.length > 1
        ? modifiedHostDevices.join(', ')
        : modifiedHostDevices[0],
  },
  {
    ...createProps(VirtualMachineDetailsTab.Scheduling, () =>
      createModal(({ isOpen, onClose }) => (
        <DedicatedResourcesModal
          headerText={t('Dedicated resources')}
          isOpen={isOpen}
          onClose={onClose}
          onSubmit={onSubmit}
          vm={vm}
          vmi={vmi}
        />
      )),
    ),
    hasPendingChange: dedicatedResourcesChanged,
    label: t('Dedicated resources'),
  },
  {
    ...createProps(VirtualMachineDetailsTab.Scheduling, () =>
      createModal(({ isOpen, onClose }) => (
        <EvictionStrategyModal
          headerText={t('Eviction strategy')}
          isOpen={isOpen}
          onClose={onClose}
          onSubmit={onSubmit}
          vm={vm}
          vmi={vmi}
        />
      )),
    ),
    hasPendingChange: evictionStrategyChanged,
    label: t('Eviction strategy'),
  },
  {
    ...createProps(VirtualMachineDetailsTab.Details, () =>
      createModal(({ isOpen, onClose }) => (
        <StartPauseModal
          headerText={t('Start in pause mode')}
          isOpen={isOpen}
          onClose={onClose}
          onSubmit={onSubmit}
          vm={vm}
          vmi={vmi}
        />
      )),
    ),
    hasPendingChange: startStrategyChanged,
    label: t('Start in pause mode'),
  },
  {
    ...createProps(VirtualMachineDetailsTab.Storage),
    hasPendingChange: !isEmpty(modifiedVolumesHotplug),
    label: `${t('Make persistent disk')} - (${(modifiedVolumesHotplug ?? [])
      .map((volume) => volume?.name)
      .join(', ')})`,
  },
  {
    ...createProps(VirtualMachineDetailsTab.Details, () =>
      createModal(({ isOpen, onClose }) => (
        <HardwareDevicesHeadlessModeModal
          isOpen={isOpen}
          onClose={onClose}
          onSubmit={onSubmit}
          vm={vm}
          vmi={vmi}
        />
      )),
    ),
    hasPendingChange: modifiedHeadlessMode,
    label: t('Headless mode'),
  },
  {
    ...createProps(VirtualMachineDetailsTab.Details),
    hasPendingChange: modifiedGuestSystemAccessLog,
    label: t('Guest system log access'),
  },
];
