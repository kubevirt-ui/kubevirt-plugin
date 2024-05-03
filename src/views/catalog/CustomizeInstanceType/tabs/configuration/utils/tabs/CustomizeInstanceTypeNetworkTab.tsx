import React from 'react';

import NetworkInterfaceList from '@catalog/wizard/tabs/network/components/list/NetworkInterfaceList';
import { V1Interface, V1Network } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { updateCustomizeInstanceType, vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import { PageSection, PageSectionVariants, Title } from '@patternfly/react-core';
import AddNetworkInterfaceButton from '@virtualmachines/details/tabs/configuration/network/components/AddNetworkInterfaceButton';

const CustomizeInstanceTypeNetworkTab = () => {
  const { t } = useKubevirtTranslation();
  const vm = vmSignal.value;

  if (!vm) {
    return <Loading />;
  }

  const onAddNetworkInterface = (updatedNetworks: V1Network[], updatedInterfaces: V1Interface[]) =>
    Promise.resolve(
      updateCustomizeInstanceType([
        {
          data: updatedNetworks,
          path: 'spec.template.spec.networks',
        },
        {
          data: updatedInterfaces,
          path: 'spec.template.spec.domain.devices.interfaces',
        },
      ]),
    );

  return (
    <PageSection variant={PageSectionVariants.light}>
      <Title headingLevel="h2">
        <SearchItem id="network">{t('Network interfaces')}</SearchItem>
      </Title>
      <AddNetworkInterfaceButton onAddNetworkInterface={onAddNetworkInterface} vm={vm} />
      <NetworkInterfaceList vm={vm} />
    </PageSection>
  );
};

export default CustomizeInstanceTypeNetworkTab;
