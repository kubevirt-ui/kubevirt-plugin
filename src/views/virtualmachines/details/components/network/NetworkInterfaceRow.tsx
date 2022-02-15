import * as React from 'react';

import { V1Interface, V1Network } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';

import NetworkInterfaceActions from './NetworkInterfaceActions';

export type NetworkInterfaceRowProps = {
  iface: V1Interface;
  network: V1Network;
};

const NetworkInterfaceRow: React.FC<RowProps<NetworkInterfaceRowProps, { kind: string }>> = ({
  obj: { iface, network },
  activeColumnIDs,
}) => {
  return (
    <>
      <TableData id="name" activeColumnIDs={activeColumnIDs}>
        {network.name}
      </TableData>
      <TableData id="model" activeColumnIDs={activeColumnIDs}>
        {iface.model || '-'}
      </TableData>
      <TableData id="network" activeColumnIDs={activeColumnIDs}>
        {network.pod ? 'Pod networking' : network.multus?.networkName || '-'}
      </TableData>
      <TableData id="type" activeColumnIDs={activeColumnIDs}>
        {iface.masquerade ? 'Masquerade' : '-'}
      </TableData>
      <TableData id="mac-address" activeColumnIDs={activeColumnIDs}>
        {iface.macAddress}
      </TableData>
      <TableData
        id="actions"
        activeColumnIDs={activeColumnIDs}
        className="dropdown-kebab-pf pf-c-table__action"
      >
        <NetworkInterfaceActions />
      </TableData>
    </>
  );
};

export default NetworkInterfaceRow;
