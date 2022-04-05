import * as React from 'react';

import { V1Interface, V1Network } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNetworkInterfaceRowData } from '@kubevirt-utils/resources/vm/utils/network/rowData';
import { getPrintableNetworkInterfaceType } from '@kubevirt-utils/resources/vm/utils/network/selectors';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Stack,
  StackItem,
} from '@patternfly/react-core';

export const interfacesTypes = {
  bridge: 'Bridge',
  masquerade: 'Masquerade',
  sriov: 'SR-IOV',
};

export const WizardOverviewNetworksTable: React.FC<{
  networks: V1Network[];
  interfaces: V1Interface[];
  isInlineGrid?: boolean;
}> = React.memo(({ networks = [], interfaces = [], isInlineGrid }) => {
  const { t } = useKubevirtTranslation();
  const networkData = getNetworkInterfaceRowData(networks, interfaces);

  return (
    <DescriptionList columnModifier={{ default: '3Col' }} isInlineGrid={isInlineGrid}>
      <DescriptionListGroup>
        <DescriptionListTerm>{t('Name')}</DescriptionListTerm>
        <DescriptionListDescription>
          <Stack>
            {networkData.map((n) => (
              <StackItem key={n.network.name}>{n.network.name}</StackItem>
            ))}
          </Stack>
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>{t('Network')}</DescriptionListTerm>
        <DescriptionListDescription>
          <Stack>
            {networkData.map((n) => (
              <StackItem key={n.network.name}>
                {n.network.pod ? t('Pod networking') : n.network.multus?.networkName || '-'}
              </StackItem>
            ))}
          </Stack>
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>{t('Type')}</DescriptionListTerm>
        <DescriptionListDescription>
          <Stack>
            {networkData.map((n) => (
              <StackItem key={n.iface.name}>{getPrintableNetworkInterfaceType(n.iface)}</StackItem>
            ))}
          </Stack>
        </DescriptionListDescription>
      </DescriptionListGroup>
    </DescriptionList>
  );
});
WizardOverviewNetworksTable.displayName = 'WizardOverviewNetworksTable';
