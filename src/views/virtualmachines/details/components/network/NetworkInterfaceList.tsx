import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { VirtualizedTable } from '@openshift-console/dynamic-plugin-sdk';

import { getInterfaces, getNetworks } from '../../../utils/selectors';

import useNetworkColumns from './hooks/useNetworkColumns';
import NetworkInterfaceRow, { NetworkInterfaceRowProps } from './NetworkInterfaceRow';
import { getNetworkInterfaceRowData } from './utils';

type NetworkInterfaceTableProps = {
  vm?: V1VirtualMachine;
};

const NetworkInterfaceList: React.FC<NetworkInterfaceTableProps> = ({ vm }) => {
  const networks = getNetworks(vm);
  const interfaces = getInterfaces(vm);

  const data = getNetworkInterfaceRowData(networks, interfaces);

  const columns = useNetworkColumns();
  return (
    <VirtualizedTable<NetworkInterfaceRowProps>
      data={data}
      unfilteredData={data}
      loaded
      loadError={false}
      columns={columns}
      Row={NetworkInterfaceRow}
    />
  );
};

export default NetworkInterfaceList;
