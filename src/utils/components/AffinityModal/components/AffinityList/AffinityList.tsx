import React, { useMemo } from 'react';

import { IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import NodeCheckerAlert from '@kubevirt-utils/components/NodeSelectorModal/components/NodeCheckerAlert';
import { generateRows, useDataViewTableSort } from '@kubevirt-utils/hooks/useDataViewTableSort';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Stack, StackItem } from '@patternfly/react-core';
import { DataView, DataViewState, DataViewTable } from '@patternfly/react-data-view';

import { AffinityRowData, AffinityType } from '../../utils/types';
import AddAffinityRuleButton from '../AddAffinityRuleButton';
import AffinityDescriptionText from '../AffinityDescriptionText';

import { AffinityCallbacks, getAffinityColumns, getAffinityRowId } from './affinityTableDefinition';

type AffinityListProps = {
  affinities: AffinityRowData[];
  nodesLoaded: boolean;
  onAffinityClickAdd: () => void;
  onDelete: (affinity: AffinityRowData) => void;
  onEdit: (affinity: AffinityRowData) => void;
  preferredQualifiedNodes: IoK8sApiCoreV1Node[];
  qualifiedNodes: IoK8sApiCoreV1Node[];
};

const AffinityList: React.FC<AffinityListProps> = ({
  affinities,
  nodesLoaded,
  onAffinityClickAdd,
  onDelete,
  onEdit,
  preferredQualifiedNodes,
  qualifiedNodes,
}) => {
  const { t } = useKubevirtTranslation();

  const columns = useMemo(() => getAffinityColumns(t), [t]);
  const { sortedData, tableColumns } = useDataViewTableSort(affinities, columns, 'type');

  const callbacks: AffinityCallbacks = useMemo(
    () => ({ onDelete, onEdit, t }),
    [onEdit, onDelete, t],
  );
  const rows = useMemo(
    () => generateRows(sortedData, columns, callbacks, getAffinityRowId),
    [sortedData, columns, callbacks],
  );

  const activeState = isEmpty(affinities) ? DataViewState.empty : undefined;

  return (
    <Stack hasGutter>
      <StackItem>
        <AffinityDescriptionText />
      </StackItem>
      <StackItem>
        <DataView activeState={activeState}>
          <DataViewTable
            bodyStates={{
              [DataViewState.empty]: (
                <tr>
                  <td className="pf-v6-u-text-align-center" colSpan={columns.length}>
                    {t('No affinity rules found')}
                  </td>
                </tr>
              ),
            }}
            aria-label={t('Affinity rules table')}
            columns={tableColumns}
            rows={rows}
          />
        </DataView>
      </StackItem>
      <StackItem>
        <AddAffinityRuleButton isLinkButton onAffinityClickAdd={onAffinityClickAdd} />
      </StackItem>
      <StackItem>
        {affinities?.some((affinity) => affinity?.type === AffinityType.node) && nodesLoaded && (
          <NodeCheckerAlert
            nodesLoaded={nodesLoaded}
            preferredQualifiedNodes={preferredQualifiedNodes}
            qualifiedNodes={qualifiedNodes}
          />
        )}
      </StackItem>
    </Stack>
  );
};

export default AffinityList;
