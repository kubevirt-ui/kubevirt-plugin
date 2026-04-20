import * as React from 'react';
import { FCC, memo } from 'react';

import { V1Interface, V1Network } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getNetworkNameLabel } from '@kubevirt-utils/resources/vm/utils/network/network-columns';
import { getNetworkInterfaceRowData } from '@kubevirt-utils/resources/vm/utils/network/rowData';
import { getPrintableNetworkInterfaceType } from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { DescriptionList, Stack, StackItem } from '@patternfly/react-core';
import { WizardDescriptionItem } from '@virtualmachines/creation-wizard/components/WizardDescriptionItem';

type NetworksReviewTableProps = {
  interfaces: V1Interface[];
  networks: V1Network[];
};

const NetworksReviewTable: FCC<NetworksReviewTableProps> = memo(({ interfaces, networks }) => {
  const { t } = useKubevirtTranslation();
  const networkData = getNetworkInterfaceRowData(networks, interfaces);

  return (
    <DescriptionList columnModifier={{ default: '3Col' }}>
      <WizardDescriptionItem
        description={
          <Stack>
            {networkData.map((n, idx) => (
              <StackItem key={n.iface?.name || n.network?.name || `network-row-${idx}`}>
                {n.network?.name || n.iface?.name || NO_DATA_DASH}
              </StackItem>
            ))}
          </Stack>
        }
        title={t('Name')}
      />
      <WizardDescriptionItem
        description={
          <Stack>
            {networkData.map((n, idx) => (
              <StackItem key={n.iface?.name || n.network?.name || `network-label-${idx}`}>
                {getNetworkNameLabel(t, n) || NO_DATA_DASH}
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

export default NetworksReviewTable;
