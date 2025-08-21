import React, { FC } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { useVMIAndPodsForVM } from '@kubevirt-utils/resources/vm';
import { getVMIPod } from '@kubevirt-utils/resources/vmi';
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
  vm?: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const VMDetailsPanelRightColumn: FC<VMResourceListProps> = ({ vm, vmi }) => {
  const { pods } = useVMIAndPodsForVM(getName(vm), getNamespace(vm));
  const launcherPod = getVMIPod(vmi, pods);

  return (
    <DescriptionList
      className="pf-v6-c-description-list__group"
      data-test-id="details-paneel-right-column"
    >
      <VMStatusDetailsItem vm={vm} vmi={vmi} />
      <VMPodDetailsItem pods={pods} vmi={vmi} />
      <VMBootOrderDetailsItem vm={vm} vmi={vmi} />
      <VMIPAddressesDetailsItem launcherPod={launcherPod} vmi={vmi} />
      <VMHostnameDetailsItem vm={vm} vmi={vmi} />
      <VMTimezoneDetailsItem vmi={vmi} />
      <VMNodeDetailsItem launcherPod={launcherPod} vm={vm} vmi={vmi} />
      <VMWorkloadProfileDetailsItem vm={vm} />
      <VMUserCredentialsDetailsItem vm={vm} vmi={vmi} />
      <SSHTabAuthorizedSSHKey className="topology-vm-details-panel__item" vm={vm} />
      <VMGPUDevicesDetailsItem vm={vm} vmi={vmi} />
      <VMHostDevicesDetailsItem vm={vm} vmi={vmi} />
    </DescriptionList>
  );
};

export default VMDetailsPanelRightColumn;
