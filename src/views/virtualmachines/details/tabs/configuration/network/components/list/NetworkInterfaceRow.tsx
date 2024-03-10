import React, { FC } from 'react';

import { V1Network, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import PendingBadge from '@kubevirt-utils/components/PendingBadge/PendingBadge';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { getPrintableNetworkInterfaceType } from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';

import NetworkInterfaceActions from './NetworkInterfaceActions';

export type NetworkInterfaceRowProps = {
  obj: NetworkPresentation;
};

const NetworkInterfaceRow: FC<
  RowProps<
    NetworkPresentation,
    { isPending: (network: V1Network) => boolean; vm: V1VirtualMachine }
  >
> = ({ activeColumnIDs, obj: { iface, network }, rowData: { isPending, vm } }) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="name">
        {network.name}
        {isPending(network) && <PendingBadge />}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="model">
        {iface.model || NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="network">
        {network.pod ? t('Pod networking') : network.multus?.networkName || NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="type">
        {getPrintableNetworkInterfaceType(iface)}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="macAddress">
        {iface.macAddress || NO_DATA_DASH}
      </TableData>
      <TableData
        activeColumnIDs={activeColumnIDs}
        className="dropdown-kebab-pf pf-v5-c-table__action"
        id=""
      >
        <NetworkInterfaceActions
          nicName={network.name}
          nicPresentation={{ iface, network }}
          vm={vm}
        />
      </TableData>
    </>
  );
};

export default NetworkInterfaceRow;
