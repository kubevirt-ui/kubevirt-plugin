import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ActionsDropdown from '@kubevirt-utils/components/ActionsDropdown/ActionsDropdown';
import ListSkeleton from '@kubevirt-utils/components/StateHandler/ListSkeleton';
import { ClusterUserDefinedNetworkKind } from '@kubevirt-utils/resources/udn/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  ListPageBody,
  ListPageFilter,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { BulkSelect, BulkSelectValue } from '@patternfly/react-component-groups';
import { Flex } from '@patternfly/react-core';

import useConnectedVMs from '../../../hooks/useConnectedVMs';

import useVirtualMachineActions from './actions/hooks/useVirtualMachineActions';
import useSelectedVMs from './hooks/useSelectedVMs';
import useVirtualMachineColumns from './hooks/useVirtualMachineColumns';
import ConnectedVirtualMachinesRow, {
  ConnectedVirtualMachinesRowData,
} from './ConnectedVirtualMachinesRow';

type ConnectedVirtualMachinesProps = {
  obj: ClusterUserDefinedNetworkKind;
};

const ConnectedVirtualMachines: FC<ConnectedVirtualMachinesProps> = ({ obj: vmNetwork }) => {
  const [vms, loadedVMs, error] = useConnectedVMs(vmNetwork);
  const [data, filteredData, onFilterChange] = useListPageFilter(vms);

  const { isSelected, onSelect, selectedVMs, setSelectedVMs } = useSelectedVMs();

  const [_, activeColumns, loadedColumns] = useVirtualMachineColumns();

  const actions = useVirtualMachineActions(selectedVMs, vmNetwork);

  const loaded = loadedVMs && loadedColumns;
  if (!loaded)
    return (
      <ListPageBody>
        <ListSkeleton />
      </ListPageBody>
    );

  return (
    <ListPageBody>
      <Flex>
        <BulkSelect
          onSelect={(value) => {
            if (value === BulkSelectValue.all || value === BulkSelectValue.page) {
              setSelectedVMs(filteredData);
            } else if (value === BulkSelectValue.none || value === BulkSelectValue.nonePage) {
              setSelectedVMs([]);
            }
          }}
          selectedCount={selectedVMs.length}
          totalCount={filteredData.length}
        />
        <ListPageFilter data={data} loaded={loaded} onFilterChange={onFilterChange} />
        <ActionsDropdown actions={actions} id="vm-bulk-actions" isDisabled={isEmpty(selectedVMs)} />
      </Flex>
      <VirtualizedTable<V1VirtualMachine>
        rowData={
          {
            isSelected,
            onSelect,
            vmNetwork,
          } as ConnectedVirtualMachinesRowData
        }
        columns={activeColumns}
        data={filteredData}
        loaded={loaded}
        loadError={error}
        Row={ConnectedVirtualMachinesRow}
        unfilteredData={data}
      />
    </ListPageBody>
  );
};

export default ConnectedVirtualMachines;
