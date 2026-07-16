import React, { FC, useMemo, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageBody } from '@openshift-console/dynamic-plugin-sdk';
import { HelperText, HelperTextItem, SearchInput, Stack, StackItem } from '@patternfly/react-core';

import useNodesData from '../../utils/hooks/useNodesData';

import { getNodeRowId, getNodesTableColumns, NodesTableCallbacks } from './nodesTableDefinition';

import './NodesTable.scss';

type NodesTableProps = {
  handleNodeSelection: (node: string) => void;
  selectedNode: string;
  vm: V1VirtualMachine;
};

const NodesTable: FC<NodesTableProps> = ({ handleNodeSelection, selectedNode, vm }) => {
  const { t } = useKubevirtTranslation();
  const { nodesData, nodesDataLoaded, vmArch } = useNodesData(vm);
  const columns = useMemo(() => getNodesTableColumns(t), [t]);
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
    <Stack hasGutter>
      <StackItem>
        <SearchInput
          aria-label={t('Search node')}
          className="nodes-table-search-bar"
          onChange={(_event, value) => setSearchValue(value)}
          onClear={() => setSearchValue('')}
          placeholder={t('Search node')}
          value={searchValue}
        />
      </StackItem>
      {vmArch && nodesData.length > 0 && (
        <StackItem>
          <HelperText>
            <HelperTextItem>
              {t('Showing only nodes with {{arch}} architecture, matching this VirtualMachine.', {
                arch: vmArch,
              })}
            </HelperTextItem>
          </HelperText>
        </StackItem>
      )}
      <StackItem>
        <ListPageBody>
          <KubevirtTable
            noDataMsg={
              vmArch
                ? t('No nodes with {{arch}} architecture found', { arch: vmArch })
                : t('No nodes found')
            }
            ariaLabel={t('Nodes table')}
            callbacks={callbacks}
            columns={columns}
            data={filteredData}
            dataTest="nodes-table"
            fixedLayout
            getRowId={getNodeRowId}
            initialSortKey="name"
            loaded={nodesDataLoaded}
            noFilteredDataMsg={t('No nodes match the search criteria')}
            unfilteredData={nodesData}
          />
        </ListPageBody>
      </StackItem>
    </Stack>
  );
};

export default NodesTable;
