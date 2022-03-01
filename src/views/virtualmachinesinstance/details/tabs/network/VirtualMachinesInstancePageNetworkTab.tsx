import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ListPageBody, VirtualizedTable } from '@openshift-console/dynamic-plugin-sdk';

import useVirtualMachineInstanceNetworkTab from './hooks/useVirtualMachineInstanceNetworkTab';
import useVirtualMachineInstanceNetworkTabColumns from './hooks/useVirtualMachineInstanceNetworkTabColumns';
import VirtualMachineInstancePageNetworkTabRow from './VirtualMachineInstancePageNetworkTabRow';

import './virtual-machines-insance-page-network-tab.scss';

type VirtualMachinesInstancePageNetworkTabProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj: V1VirtualMachineInstance;
};

const VirtualMachinesInstancePageNetworkTab: React.FC<
  VirtualMachinesInstancePageNetworkTabProps
> = ({ obj: vmi }) => {
  const columns = useVirtualMachineInstanceNetworkTabColumns();
  const [data] = useVirtualMachineInstanceNetworkTab(vmi);

  return (
    <div className="VirtualMachinesInstancePageNetworkTab">
      <ListPageBody>
        <VirtualizedTable
          data={data}
          unfilteredData={data}
          loaded={!!vmi}
          loadError={null}
          columns={columns}
          Row={VirtualMachineInstancePageNetworkTabRow}
        />
      </ListPageBody>
    </div>
  );
};

export default VirtualMachinesInstancePageNetworkTab;
