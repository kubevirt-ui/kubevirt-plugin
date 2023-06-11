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
  nodesLoaded: boolean;
  onAffinityClickAdd: () => void;
  onDelete: (affinity: AffinityRowData) => void;
  onEdit: (affinity: AffinityRowData) => void;
  prefferedQualifiedNodes: IoK8sApiCoreV1Node[];
  qualifiedNodes: IoK8sApiCoreV1Node[];
};

const AffinityList: React.FC<AffinityListProps> = ({
  affinities,
  nodesLoaded,
  onAffinityClickAdd,
  onDelete,
  onEdit,
  prefferedQualifiedNodes,
  qualifiedNodes,
}) => {
  const columns = useAffinityColumns();
  return (
    <Stack hasGutter>
      <StackItem>
        <AffinityDescriptionText />
      </StackItem>
      <StackItem>
        <VirtualizedTable<AffinityRowData>
          columns={columns}
          data={affinities || []}
          loaded
          loadError={false}
          Row={AffinityRow}
          rowData={{ onDelete, onEdit }}
          unfilteredData={affinities || []}
        />
      </StackItem>
      <StackItem>
        <AddAffinityRuleButton isLinkButton onAffinityClickAdd={onAffinityClickAdd} />
      </StackItem>
      <StackItem>
        {affinities?.some((affinity) => affinity?.type === AffinityType.node) && nodesLoaded && (
          <NodeCheckerAlert
            nodesLoaded={nodesLoaded}
            prefferedQualifiedNodes={prefferedQualifiedNodes}
            qualifiedNodes={qualifiedNodes}
          />
        )}
      </StackItem>
    </Stack>
  );
};
export default AffinityList;
