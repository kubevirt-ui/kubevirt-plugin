import type { FC } from 'react';
import { useMemo, useState } from 'react';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { getNodeSelectorLabel } from '@kubevirt-utils/components/NodeSelectorDetailItem/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ListPageBody } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  HelperText,
  HelperTextItem,
  SearchInput,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import useNodesData from '../../utils/hooks/useNodesData';
import type { NodesTableCallbacks } from './nodesTableDefinition';
import { getNodeRowId, getNodesTableColumns } from './nodesTableDefinition';
import { getNoNodesMessage } from './utils';

import './NodesTable.scss';

type NodesTableProps = {
  handleNodeSelection: (node: string) => void;
  selectedNode: string;
  vm: V1VirtualMachine;
};

const NodesTable: FC<NodesTableProps> = ({ handleNodeSelection, selectedNode, vm }) => {
  const { t } = useKubevirtTranslation();
  const { nodesData, nodesDataLoaded, vmArch, vmiLoadError, vmiMissing, vmiNodeSelector } =
    useNodesData(vm);
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

  const nodeSelectorLabel = getNodeSelectorLabel(vmiNodeSelector);
  const noDataMsg = getNoNodesMessage(vmArch, nodeSelectorLabel, t);

  if (vmiLoadError) return <ErrorAlert error={vmiLoadError} />;
  if (vmiMissing)
    return (
      <Alert
        isInline
        title={t('Running VirtualMachineInstance not found')}
        variant={AlertVariant.danger}
      />
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
      {!isEmpty(nodesData) && (vmArch ?? nodeSelectorLabel) && (
        <StackItem>
          <HelperText>
            {vmArch && (
              <HelperTextItem>
                {t('Showing only nodes with {{arch}} architecture, matching this VirtualMachine.', {
                  arch: vmArch,
                })}
              </HelperTextItem>
            )}
            {nodeSelectorLabel && (
              <HelperTextItem>
                {t(
                  "Showing only nodes matching the running VirtualMachine's node selector: {{nodeSelector}}.",
                  { nodeSelector: nodeSelectorLabel },
                )}
              </HelperTextItem>
            )}
          </HelperText>
        </StackItem>
      )}
      <StackItem>
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
            noDataMsg={noDataMsg}
            noFilteredDataMsg={t('No nodes match the search criteria')}
            unfilteredData={nodesData}
          />
        </ListPageBody>
      </StackItem>
    </Stack>
  );
};

export default NodesTable;
