import * as React from 'react';

import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes';
import NodeCheckerAlert from '@kubevirt-utils/components/NodeSelectorModal/components/NodeCheckerAlert';
import { VirtualizedTable } from '@openshift-console/dynamic-plugin-sdk';
import { Stack, StackItem } from '@patternfly/react-core';

import { AffinityRowData, AffinityType } from '../../utils/types';
import AddAffinityRuleButton from '../AddAffinityRuleButton';
import AffinityDescriptionText from '../AffinityDescriptionText';

import AffinityRow from './components/AffinityRow';
import useAffinityColumns from './hooks/useAffinityColumns';

type AffinityListProps = {
  affinities: AffinityRowData[];
  onAffinityClickAdd: () => void;
  qualifiedNodes: IoK8sApiCoreV1Node[];
  prefferedQualifiedNodes: IoK8sApiCoreV1Node[];
  nodesLoaded: boolean;
  onEdit: (affinity: AffinityRowData) => void;
  onDelete: (affinity: AffinityRowData) => void;
};

const AffinityList: React.FC<AffinityListProps> = ({
  affinities,
  onAffinityClickAdd,
  qualifiedNodes,
  prefferedQualifiedNodes,
  nodesLoaded,
  onEdit,
  onDelete,
}) => {
  const columns = useAffinityColumns();
  return (
    <Stack hasGutter>
      <StackItem>
        <AffinityDescriptionText />
      </StackItem>
      <StackItem>
        <VirtualizedTable<AffinityRowData>
          data={affinities || []}
          unfilteredData={affinities || []}
          loaded
          loadError={false}
          columns={columns}
          Row={AffinityRow}
          rowData={{ onEdit, onDelete }}
        />
      </StackItem>
      <StackItem>
        <AddAffinityRuleButton isLinkButton onAffinityClickAdd={onAffinityClickAdd} />
      </StackItem>
      <StackItem>
        {affinities?.some((affinity) => affinity?.type === AffinityType.node) && (
          <NodeCheckerAlert
            qualifiedNodes={qualifiedNodes}
            prefferedQualifiedNodes={prefferedQualifiedNodes}
            nodesLoaded={nodesLoaded}
          />
        )}
      </StackItem>
    </Stack>
  );
};
export default AffinityList;
