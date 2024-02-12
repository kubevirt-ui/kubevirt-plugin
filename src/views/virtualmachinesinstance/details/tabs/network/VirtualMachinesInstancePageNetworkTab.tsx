import React, { FC } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ListPageBody, VirtualizedTable } from '@openshift-console/dynamic-plugin-sdk';

import useVirtualMachineInstanceNetworkTab from './hooks/useVirtualMachineInstanceNetworkTab';
import useVirtualMachineInstanceNetworkTabColumns from './hooks/useVirtualMachineInstanceNetworkTabColumns';
import VirtualMachineInstancePageNetworkTabRow from './VirtualMachineInstancePageNetworkTabRow';

import './virtual-machines-insance-page-network-tab.scss';

type VirtualMachinesInstancePageNetworkTabProps = {
  obj: V1VirtualMachineInstance;
};

const VirtualMachinesInstancePageNetworkTab: FC<VirtualMachinesInstancePageNetworkTabProps> = ({
  obj: vmi,
}) => {
  const columns = useVirtualMachineInstanceNetworkTabColumns();
  const [data] = useVirtualMachineInstanceNetworkTab(vmi);

  return (
    <div className="VirtualMachinesInstancePageNetworkTab">
      <ListPageBody>
        <VirtualizedTable
          columns={columns}
          data={data}
          loaded={!!vmi}
          loadError={null}
          Row={VirtualMachineInstancePageNetworkTabRow}
          unfilteredData={data}
        />
      </ListPageBody>
    </div>
  );
};

export default VirtualMachinesInstancePageNetworkTab;
