import React from 'react';

import {
  V1Disk,
  V1Interface,
  V1Network,
  V1VirtualMachine,
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
import AddNetworkInterfaceButton from '@virtualmachines/details/tabs/configuration/network/components/AddNetworkInterfaceButton';
import NetworkInterfaceList from '@virtualmachines/wizard/steps/CustomizationStep/components/CustomizeVirtualMachine/components/CustomizeVMTabs/tabs/network/NetworkInterfaceList';
import {
  hasNonVirtioInterface,
  switchInterfacesToVirtio,
} from '@virtualmachines/wizard/steps/CustomizationStep/utils/virtioUtils';

const CustomizeInstanceTypeNetworkTab = () => {
  const { t } = useKubevirtTranslation();
  const vm = customizeWizardVMSignal.value;

  if (!vm) {
    return <Loading />;
  }

  const onAddNetworkInterface = (
    updatedNetworks: V1Network[],
    updatedInterfaces: V1Interface[],
    updatedDisks?: V1Disk[],
  ) => {
    const updates: Parameters<typeof patchCustomizeWizardVMSignal>[0] = [
      { data: updatedNetworks, path: 'spec.template.spec.networks' },
      { data: updatedInterfaces, path: 'spec.template.spec.domain.devices.interfaces' },
    ];
    if (updatedDisks) {
      updates.push({ data: updatedDisks, path: 'spec.template.spec.domain.devices.disks' });
    }
    return Promise.resolve(patchCustomizeWizardVMSignal(updates));
  };

  const onUpdateVM = (updatedVM: V1VirtualMachine) => {
    patchCustomizeWizardVMSignal([{ data: updatedVM }]);
    return Promise.resolve();
  };

  return (
    <PageSection>
      {hasNonVirtioInterface(vm) && (
        <VirtIORecommendationAlert
          description={t(
            'VirtIO provides the best performance. Switch network interfaces to VirtIO unless guest drivers are unavailable.',
          )}
          onSwitchToVirtio={() => patchCustomizeWizardVMSignal(switchInterfacesToVirtio(vm))}
          title={t('Non-VirtIO network interfaces detected')}
        />
      )}
      <Title headingLevel="h2">
        <SearchItem id="network">{t('Network interfaces')}</SearchItem>
      </Title>
      <AddNetworkInterfaceButton onAddNetworkInterface={onAddNetworkInterface} vm={vm} />
      <NetworkInterfaceList onUpdateVM={onUpdateVM} vm={vm} />
    </PageSection>
  );
};

export default CustomizeInstanceTypeNetworkTab;
