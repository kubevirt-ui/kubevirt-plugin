import React, { FC, useMemo, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageBody, TableColumn, VirtualizedTable } from '@openshift-console/dynamic-plugin-sdk';
import { SearchInput } from '@patternfly/react-core';
import NodeRow from '@virtualmachines/actions/components/VirtualMachineComputeMigration/components/NodesTable/components/NodeRow';
import useNodesColumns from '@virtualmachines/actions/components/VirtualMachineComputeMigration/components/NodesTable/utils/hooks/useNodesColumns';
import useNodesData from '@virtualmachines/actions/components/VirtualMachineComputeMigration/utils/hooks/useNodesData';
import { NodeData } from '@virtualmachines/actions/components/VirtualMachineComputeMigration/utils/types';

import './NodesTable.scss';

type NodesTableProps = {
  handleNodeSelection: (node: string) => void;
  selectedNode: string;
  vm: V1VirtualMachine;
};

const NodesTable: FC<NodesTableProps> = ({ handleNodeSelection, selectedNode, vm }) => {
  const { t } = useKubevirtTranslation();
  const columns: TableColumn<NodeData>[] = useNodesColumns();
  const { nodesData, nodesDataLoaded } = useNodesData(vm);
  const [searchValue, setSearchValue] = useState<string>('');

  const filteredData = useMemo(
    () => nodesData.filter((nodeData) => nodeData?.name?.includes(searchValue)),
    [searchValue, nodesData],
  );

  return (
    <>
      <SearchInput
        className="nodes-table-search-bar"
        onChange={(_event, value) => setSearchValue(value)}
        onClear={() => setSearchValue('')}
        placeholder={t('Search node')}
        value={searchValue}
      />
      <ListPageBody>
        <VirtualizedTable
          columns={columns}
          data={filteredData}
          loaded={nodesDataLoaded}
          loadError={undefined}
          Row={NodeRow}
          rowData={{ handleNodeSelection, selectedNode }}
          unfilteredData={nodesData}
        />
      </ListPageBody>
    </>
  );
};

export default NodesTable;
