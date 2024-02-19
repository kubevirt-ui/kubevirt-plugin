import * as React from 'react';

import { WizardDescriptionItem } from '@catalog/wizard/components/WizardDescriptionItem';
import { V1Interface, V1Network } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNetworkInterfaceRowData } from '@kubevirt-utils/resources/vm/utils/network/rowData';
import { getPrintableNetworkInterfaceType } from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { DescriptionList, Stack, StackItem } from '@patternfly/react-core';

export const interfacesTypes = {
  bridge: 'Bridge',
  masquerade: 'Masquerade',
  sriov: 'SR-IOV',
};

export const WizardOverviewNetworksTable: React.FC<{
  interfaces: V1Interface[];
  isInlineGrid?: boolean;
  networks: V1Network[];
}> = React.memo(({ interfaces = [], isInlineGrid, networks = [] }) => {
  const { t } = useKubevirtTranslation();
  const networkData = getNetworkInterfaceRowData(networks, interfaces);

  return (
    <DescriptionList
      className="pf-c-description-list"
      columnModifier={{ default: '3Col' }}
      isInlineGrid={isInlineGrid}
    >
      <WizardDescriptionItem
        description={
          <Stack>
            {networkData.map((n) => (
              <StackItem key={n.network.name}>{n.network.name}</StackItem>
            ))}
          </Stack>
        }
        title={t('Name')}
      />
      <WizardDescriptionItem
        description={
          <Stack>
            {networkData.map((n) => (
              <StackItem key={n.network.name}>
                {n.network.pod ? t('Pod networking') : n.network.multus?.networkName || '-'}
              </StackItem>
            ))}
          </Stack>
        }
        title={t('Network')}
      />
      <WizardDescriptionItem
        description={
          <Stack>
            {networkData.map((n) => (
              <StackItem key={n.iface.name}>{getPrintableNetworkInterfaceType(n.iface)}</StackItem>
            ))}
          </Stack>
        }
        title={t('Type')}
      />
    </DescriptionList>
  );
});
WizardOverviewNetworksTable.displayName = 'WizardOverviewNetworksTable';
