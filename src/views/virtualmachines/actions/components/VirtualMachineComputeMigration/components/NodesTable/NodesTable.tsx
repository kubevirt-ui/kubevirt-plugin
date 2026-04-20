import React, { FCC, useMemo, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageBody } from '@openshift-console/dynamic-plugin-sdk';
import { SearchInput } from '@patternfly/react-core';

import useNodesData from '../../utils/hooks/useNodesData';

import { getNodeRowId, getNodesTableColumns, NodesTableCallbacks } from './nodesTableDefinition';

import './NodesTable.scss';

type NodesTableProps = {
  handleNodeSelection: (node: string) => void;
  selectedNode: string;
  vm: V1VirtualMachine;
};

const NodesTable: FCC<NodesTableProps> = ({ handleNodeSelection, selectedNode, vm }) => {
  const { t } = useKubevirtTranslation();
  const columns = useMemo(() => getNodesTableColumns(t), [t]);
  const { nodesData, nodesDataLoaded } = useNodesData(vm);
  const [searchValue, setSearchValue] = useState<string>('');

  const filteredData = useMemo(
    () => nodesData.filter((nodeData) => nodeData?.name?.includes(searchValue)),
    [searchValue, nodesData],
  );

  const callbacks: NodesTableCallbacks = useMemo(
    () => ({ handleNodeSelection, selectedNode }),
    [handleNodeSelection, selectedNode],
  );

  return (
    <>
      <SearchInput
        aria-label={t('Search node')}
        className="nodes-table-search-bar"
        onChange={(_event, value) => setSearchValue(value)}
        onClear={() => setSearchValue('')}
        placeholder={t('Search node')}
        value={searchValue}
      />
      <ListPageBody>
        <KubevirtTable
          ariaLabel={t('Nodes table')}
          callbacks={callbacks}
          columns={columns}
          data={filteredData}
          dataTest="nodes-table"
          fixedLayout
          getRowId={getNodeRowId}
          initialSortKey="name"
          loaded={nodesDataLoaded}
          noDataMsg={t('No nodes found')}
          noFilteredDataMsg={t('No nodes match the search criteria')}
          unfilteredData={nodesData}
        />
      </ListPageBody>
    </>
  );
};

export default NodesTable;
