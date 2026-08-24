import React, { type FC, memo } from 'react';

import { type V1Interface, type V1Network } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getNetworkNameLabel } from '@kubevirt-utils/resources/vm/utils/network/network-columns';
import { getNetworkInterfaceRowData } from '@kubevirt-utils/resources/vm/utils/network/rowData';
import { getPrintableNetworkInterfaceType } from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { DescriptionList, Stack, StackItem } from '@patternfly/react-core';

type NetworksReviewTableProps = {
  interfaces: V1Interface[];
  networks: V1Network[];
};

const NetworksReviewTable: FC<NetworksReviewTableProps> = memo(({ interfaces, networks }) => {
  const { t } = useKubevirtTranslation();
  const networkData = getNetworkInterfaceRowData(networks, interfaces);

  return (
    <DescriptionList columnModifier={{ default: '3Col' }}>
      <DescriptionItem
        descriptionData={
          <Stack>
            {networkData.map((row) => (
              <StackItem key={row.iface?.name ?? row.network?.name}>
                {row.network?.name ?? row.iface?.name ?? NO_DATA_DASH}
              </StackItem>
            ))}
          </Stack>
        }
        descriptionHeader={t('Name')}
      />
      <DescriptionItem
        descriptionData={
          <Stack>
            {networkData.map((row) => (
              <StackItem key={row.iface?.name ?? row.network?.name}>
                {getNetworkNameLabel(t, row) ?? NO_DATA_DASH}
              </StackItem>
            ))}
          </Stack>
        }
        descriptionHeader={t('Network')}
      />
      <DescriptionItem
        descriptionData={
          <Stack>
            {networkData.map((row) => (
              <StackItem key={row.iface?.name ?? row.network?.name}>
                {row.iface ? getPrintableNetworkInterfaceType(row.iface) : NO_DATA_DASH}
              </StackItem>
            ))}
          </Stack>
        }
        descriptionHeader={t('Type')}
      />
    </DescriptionList>
  );
});

NetworksReviewTable.displayName = 'NetworksReviewTable';

export default NetworksReviewTable;
