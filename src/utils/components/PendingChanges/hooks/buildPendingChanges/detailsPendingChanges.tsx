import React from 'react';

import BootOrderModal from '@kubevirt-utils/components/BootOrderModal/BootOrderModal';
import CPUMemoryModal from '@kubevirt-utils/components/CPUMemoryModal/CPUMemoryModal';
import FirmwareBootloaderModal from '@kubevirt-utils/components/FirmwareBootloaderModal/FirmwareBootloaderModal';
import HostnameModal from '@kubevirt-utils/components/HostnameModal/HostnameModal';
import StandaloneInstanceTypeModal from '@kubevirt-utils/components/InstanceTypeModal/StandaloneInstanceTypeModal';
import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { isInstanceTypeVM } from '@kubevirt-utils/resources/instancetype/helper';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { updatedInstanceType } from '@virtualmachines/details/tabs/configuration/details/utils/utils';

import { restartRequired } from '../../utils/helpers';
import { type PendingChange } from '../../utils/types';
import { type PendingChangeContext } from './types';

export const getDetailsPendingChanges = ({
  createModal,
  createProps,
  onSubmit,
  params: {
    bootModeChanged,
    bootOrderChanged,
    cpuMemoryChanged,
    hostnameChanged,
    instanceTypeChanged,
    instanceTypeExpandedSpec,
    modifiedCDROMs,
    modifiedEnvDisks,
    modifiedNICs,
    t,
    vm,
    vmi,
  },
}: PendingChangeContext): PendingChange[] => [
  {
    ...createProps(VirtualMachineDetailsTab.Details, () =>
      createModal(({ isOpen, onClose }) => (
        <CPUMemoryModal isOpen={isOpen} onClose={onClose} onSubmit={onSubmit} vm={vm} />
      )),
    ),
    hasPendingChange: !isInstanceTypeVM(vm) && cpuMemoryChanged && restartRequired(vm),
    label: t('CPU | Memory'),
  },
  {
    ...createProps(VirtualMachineDetailsTab.Details, () =>
      createModal(({ isOpen, onClose }) => (
        <StandaloneInstanceTypeModal
          isOpen={isOpen}
          onClose={onClose}
          onSubmit={updatedInstanceType}
          vm={vm}
        />
      )),
    ),
    hasPendingChange: isInstanceTypeVM(vm) && instanceTypeChanged && restartRequired(vm),
    label: t('InstanceType'),
  },
  {
    ...createProps(VirtualMachineDetailsTab.Details, () =>
      createModal(({ isOpen, onClose }) => (
        <BootOrderModal
          instanceTypeVM={instanceTypeExpandedSpec}
          isOpen={isOpen}
          onClose={onClose}
          onSubmit={onSubmit}
          vm={vm}
          vmi={vmi}
        />
      )),
    ),
    hasPendingChange: bootOrderChanged,
    label: t('Boot disk'),
  },
  {
    ...createProps(VirtualMachineDetailsTab.Details, () =>
      createModal(({ isOpen, onClose }) => (
        <HostnameModal isOpen={isOpen} onClose={onClose} onSubmit={onSubmit} vm={vm} vmi={vmi} />
      )),
    ),
    hasPendingChange: hostnameChanged,
    label: t('Hostname'),
  },
  {
    ...createProps(VirtualMachineDetailsTab.Details, () =>
      createModal(({ isOpen, onClose }) => (
        <FirmwareBootloaderModal
          isOpen={isOpen}
          onClose={onClose}
          onSubmit={onSubmit}
          vm={vm}
          vmi={vmi}
        />
      )),
    ),
    hasPendingChange: bootModeChanged,
    label: t('Boot mode'),
  },
  {
    ...createProps(VirtualMachineDetailsTab.Environment),
    hasPendingChange: !isEmpty(modifiedEnvDisks),
    label:
      !isEmpty(modifiedEnvDisks) && modifiedEnvDisks?.length > 1
        ? modifiedEnvDisks.join(', ')
        : modifiedEnvDisks[0],
  },
  {
    ...createProps(VirtualMachineDetailsTab.Storage),
    hasPendingChange: !isEmpty(modifiedCDROMs),
    label: modifiedCDROMs.join(', '),
  },
  {
    ...createProps(VirtualMachineDetailsTab.Network),
    hasPendingChange: !isEmpty(modifiedNICs),
    label: modifiedNICs.join(', '),
  },
];
