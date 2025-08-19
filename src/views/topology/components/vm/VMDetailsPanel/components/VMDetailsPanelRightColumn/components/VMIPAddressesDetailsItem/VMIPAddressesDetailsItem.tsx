import React, { FC } from 'react';

import { IoK8sApiCoreV1Pod } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVMIIPAddresses } from '@kubevirt-utils/resources/vmi';

import VMIPAddresses from './VMIPAddresses';

import '../../../../TopologyVMDetailsPanel.scss';

type VMIPAddressesItemProps = {
  launcherPod: IoK8sApiCoreV1Pod;
  vmi: V1VirtualMachineInstance;
};

const VMIPAddressesDetailsItem: FC<VMIPAddressesItemProps> = ({ launcherPod, vmi }) => {
  const { t } = useKubevirtTranslation();

  const ipAddresses = getVMIIPAddresses(vmi);

  return (
    <VirtualMachineDescriptionItem
      className="topology-vm-details-panel__item"
      descriptionData={launcherPod && ipAddresses && <VMIPAddresses ipAddresses={ipAddresses} />}
      descriptionHeader={<span id="ip-address">{t('IP address')}</span>}
    />
  );
};

export default VMIPAddressesDetailsItem;
