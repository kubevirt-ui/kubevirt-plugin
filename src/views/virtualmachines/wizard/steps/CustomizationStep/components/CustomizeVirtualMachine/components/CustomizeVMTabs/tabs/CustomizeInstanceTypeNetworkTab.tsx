import React, { type FC } from 'react';

import {
  type V1Disk,
  type V1Interface,
  type V1Network,
  type V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import VirtIORecommendationAlert from '@kubevirt-utils/components/VirtIORecommendationAlert/VirtIORecommendationAlert';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  customizeWizardVMSignal,
  patchCustomizeWizardVMSignal,
} from '@kubevirt-utils/signals/customizeWizardVMSignal';
import { PageSection, Title } from '@patternfly/react-core';
import { useSignals } from '@preact/signals-react/runtime';
import AddNetworkInterfaceButton from '@virtualmachines/details/tabs/configuration/network/components/AddNetworkInterfaceButton';
import NetworkInterfaceList from '@virtualmachines/wizard/steps/CustomizationStep/components/CustomizeVirtualMachine/components/CustomizeVMTabs/tabs/network/NetworkInterfaceList';

const CustomizeInstanceTypeNetworkTab: FC = () => {
  useSignals();
  const { t } = useKubevirtTranslation();
  const vm = customizeWizardVMSignal.value;

  if (!vm) {
    return <Loading />;
  }

  const onAddNetworkInterface = (
    updatedNetworks: V1Network[],
    updatedInterfaces: V1Interface[],
    updatedDisks?: V1Disk[],
  ): Promise<V1VirtualMachine> => {
    const updates: Parameters<typeof patchCustomizeWizardVMSignal>[0] = [
      { data: updatedNetworks, path: 'spec.template.spec.networks' },
      { data: updatedInterfaces, path: 'spec.template.spec.domain.devices.interfaces' },
    ];
    if (updatedDisks) {
      updates.push({ data: updatedDisks, path: 'spec.template.spec.domain.devices.disks' });
    }
    return Promise.resolve(patchCustomizeWizardVMSignal(updates));
  };

  const onUpdateVM = (updatedVM: V1VirtualMachine): Promise<void> => {
    patchCustomizeWizardVMSignal([{ data: updatedVM }]);
    return Promise.resolve();
  };

  return (
    <PageSection>
      <Title headingLevel="h2">
        <SearchItem id="network">{t('Network interfaces')}</SearchItem>
      </Title>
      <VirtIORecommendationAlert kind="network" vm={vm} />
      <AddNetworkInterfaceButton onAddNetworkInterface={onAddNetworkInterface} vm={vm} />
      <NetworkInterfaceList onUpdateVM={onUpdateVM} vm={vm} />
    </PageSection>
  );
};

export default CustomizeInstanceTypeNetworkTab;
