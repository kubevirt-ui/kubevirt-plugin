import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { getPrintableNetworkInterfaceType } from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';

import NetworkInterfaceActions from './NetworkInterfaceActions';

export type NetworkInterfaceRowProps = {
  obj: NetworkPresentation;
};

const NetworkInterfaceRow: React.FC<RowProps<NetworkPresentation>> = ({
  obj: { iface, network },
  activeColumnIDs,
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <TableData id="name" activeColumnIDs={activeColumnIDs}>
        {network.name}
      </TableData>
      <TableData id="model" activeColumnIDs={activeColumnIDs}>
        {iface.model || NO_DATA_DASH}
      </TableData>
      <TableData id="network" activeColumnIDs={activeColumnIDs}>
        {network.pod ? t('Pod networking') : network.multus?.networkName || NO_DATA_DASH}
      </TableData>
      <TableData id="type" activeColumnIDs={activeColumnIDs}>
        {getPrintableNetworkInterfaceType(iface)}
      </TableData>
      <TableData id="macAddress" activeColumnIDs={activeColumnIDs}>
        {iface.macAddress || NO_DATA_DASH}
      </TableData>
      <TableData
        id="actions"
        activeColumnIDs={activeColumnIDs}
        className="dropdown-kebab-pf pf-c-table__action"
      >
        <NetworkInterfaceActions nicName={network.name} nicPresentation={{ iface, network }} />
      </TableData>
    </>
  );
};

export default NetworkInterfaceRow;
