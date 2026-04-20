import React, { FCC, useMemo } from 'react';

import { IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import NodeCheckerAlert from '@kubevirt-utils/components/NodeSelectorModal/components/NodeCheckerAlert';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack, StackItem } from '@patternfly/react-core';

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

const AffinityList: FCC<AffinityListProps> = ({
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
  const callbacks: AffinityCallbacks = useMemo(
    () => ({ onDelete, onEdit, t }),
    [onEdit, onDelete, t],
  );

  return (
    <Stack hasGutter>
      <StackItem>
        <AffinityDescriptionText />
      </StackItem>
      <StackItem>
        <KubevirtTable
          ariaLabel={t('Affinity rules table')}
          callbacks={callbacks}
          columns={columns}
          data={affinities}
          dataTest="affinity-list"
          getRowId={getAffinityRowId}
          initialSortKey="type"
          noDataMsg={t('No affinity rules found')}
        />
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
