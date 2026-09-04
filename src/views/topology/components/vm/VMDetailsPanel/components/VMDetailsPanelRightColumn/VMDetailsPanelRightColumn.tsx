import React, { type FC } from 'react';

import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { useVMIAndPodForVM } from '@kubevirt-utils/resources/vm';
import { hasS390xArchitecture } from '@kubevirt-utils/resources/vm/utils/architecture';
import { DescriptionList } from '@patternfly/react-core';
import SSHTabAuthorizedSSHKey from '@virtualmachines/details/tabs/configuration/ssh/components/SSHTabAuthorizedSSHKey';

import VMGPUDevicesDetailsItem from './components/HardwareDevices/VMGPUDevicesDetailsItem';
import VMHostDevicesDetailsItem from './components/HardwareDevices/VMHostDevicesDetailsItem';
import VMBootOrderDetailsItem from './components/VMBootOrderDetailsItem';
import VMHostnameDetailsItem from './components/VMHostnameDetailsItem';
import VMIPAddressesDetailsItem from './components/VMIPAddressesDetailsItem/VMIPAddressesDetailsItem';
import VMNodeDetailsItem from './components/VMNodeDetailsItem';
import VMPodDetailsItem from './components/VMPodDetailsItem';
import VMStatusDetailsItem from './components/VMStatusDetailsItem';
import VMTimezoneDetailsItem from './components/VMTimezoneDetailsItem';
import VMUserCredentialsDetailsItem from './components/VMUserCredentialsDetailsItem/VMUserCredentialsDetailsItem';
import VMWorkloadProfileDetailsItem from './components/VMWorkloadProfileDetailsItem';

export type VMResourceListProps = {
  instanceTypeVM?: V1VirtualMachine;
  vm?: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const VMDetailsPanelRightColumn: FC<VMResourceListProps> = ({ instanceTypeVM, vm, vmi }) => {
  const { pod } = useVMIAndPodForVM(getName(vm), getNamespace(vm));
  const vmHasS390xArchitecture = hasS390xArchitecture(vm);

  return (
    <DescriptionList className="pf-v6-c-description-list__group">
      <VMStatusDetailsItem vm={vm} vmi={vmi} />
      <VMPodDetailsItem pod={pod} />
      <VMBootOrderDetailsItem instanceTypeVM={instanceTypeVM} vm={vm} vmi={vmi} />
      <VMIPAddressesDetailsItem launcherPod={pod} vmi={vmi} />
      <VMHostnameDetailsItem vm={vm} vmi={vmi} />
      <VMTimezoneDetailsItem vmi={vmi} />
      <VMNodeDetailsItem launcherPod={pod} vm={vm} vmi={vmi} />
      <VMWorkloadProfileDetailsItem vm={vm} />
      <VMUserCredentialsDetailsItem vm={vm} vmi={vmi} />
      <SSHTabAuthorizedSSHKey className="topology-vm-details-panel__item" vm={vm} />
      {!vmHasS390xArchitecture && <VMGPUDevicesDetailsItem vm={vm} vmi={vmi} />}
      <VMHostDevicesDetailsItem vm={vm} vmi={vmi} />
    </DescriptionList>
  );
};

export default VMDetailsPanelRightColumn;
