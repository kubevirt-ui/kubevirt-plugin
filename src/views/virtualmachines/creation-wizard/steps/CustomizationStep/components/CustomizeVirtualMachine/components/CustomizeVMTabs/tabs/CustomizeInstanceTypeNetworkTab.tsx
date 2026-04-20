import React from 'react';

import NetworkInterfaceList from '@catalog/wizard/tabs/network/components/list/NetworkInterfaceList';
import {
  V1Disk,
  V1Interface,
  V1Network,
  V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { updateCustomizeInstanceType } from '@kubevirt-utils/store/customizeInstanceType';
import { vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import { PageSection, Title } from '@patternfly/react-core';
import AddNetworkInterfaceButton from '@virtualmachines/details/tabs/configuration/network/components/AddNetworkInterfaceButton';

const CustomizeInstanceTypeNetworkTab = () => {
  const { t } = useKubevirtTranslation();
  const vm = vmSignal.value;

  if (!vm) {
    return <Loading />;
  }

  const onAddNetworkInterface = (
    updatedNetworks: V1Network[],
    updatedInterfaces: V1Interface[],
    updatedDisks?: V1Disk[],
  ) => {
    const updates: Parameters<typeof updateCustomizeInstanceType>[0] = [
      { data: updatedNetworks, path: 'spec.template.spec.networks' },
      { data: updatedInterfaces, path: 'spec.template.spec.domain.devices.interfaces' },
    ];
    if (updatedDisks) {
      updates.push({ data: updatedDisks, path: 'spec.template.spec.domain.devices.disks' });
    }
    return Promise.resolve(updateCustomizeInstanceType(updates));
  };

  const onUpdateVM = (updatedVM: V1VirtualMachine) => {
    updateCustomizeInstanceType([{ data: updatedVM }]);
    return Promise.resolve();
  };

  return (
    <PageSection>
      <Title headingLevel="h2">
        <SearchItem id="network">{t('Network interfaces')}</SearchItem>
      </Title>
      <AddNetworkInterfaceButton onAddNetworkInterface={onAddNetworkInterface} vm={vm} />
      <NetworkInterfaceList onUpdateVM={onUpdateVM} vm={vm} />
    </PageSection>
  );
};

export default CustomizeInstanceTypeNetworkTab;
