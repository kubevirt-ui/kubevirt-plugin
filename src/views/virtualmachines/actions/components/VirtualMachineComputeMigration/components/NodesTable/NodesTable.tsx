import React, { FC, useState } from 'react';

import {
  ListPageBody,
  ListPageFilter,
  TableColumn,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import NodeRow from '@virtualmachines/actions/components/VirtualMachineComputeMigration/components/NodesTable/components/NodeRow';
import useNodesColumns from '@virtualmachines/actions/components/VirtualMachineComputeMigration/components/NodesTable/utils/hooks/useNodesColumns';
import useNodesData from '@virtualmachines/actions/components/VirtualMachineComputeMigration/utils/hooks/useNodesData';
import { NodeData } from '@virtualmachines/actions/components/VirtualMachineComputeMigration/utils/types';

type NodesTableProps = {
  handleNodeSelection: (node: string) => void;
  selectedNode: string;
};

const NodesTable: FC<NodesTableProps> = () => {
  const columns: TableColumn<NodeData>[] = useNodesColumns();
  // const filters = useNodeFilter();
  const { nodesData, nodesDataLoaded } = useNodesData();
  const [data, filteredData, onFilterChange] = useListPageFilter(nodesData);
  const [selectedNode, setSelectedNode] = useState<string>('');

  const handleNodeSelection = (changedNode: string) => {
    changedNode === selectedNode ? setSelectedNode('') : setSelectedNode(changedNode);
  };

  return (
    <ListPageBody>
      <ListPageFilter
        data={nodesData}
        hideLabelFilter
        loaded={nodesDataLoaded}
        onFilterChange={onFilterChange}
        // rowSearchFilters={filters}
      />
      <VirtualizedTable
        columns={columns}
        data={filteredData}
        loaded={nodesDataLoaded}
        loadError={undefined}
        Row={NodeRow}
        rowData={{ handleNodeSelection, selectedNode }}
        unfilteredData={data}
      />
    </ListPageBody>
  );
};

export default NodesTable;
