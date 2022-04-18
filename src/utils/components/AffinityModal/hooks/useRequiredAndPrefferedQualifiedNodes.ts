import * as React from 'react';

import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes';

import { intersectionWith, unionWith } from '../utils/helpers';
import { AffinityCondition, AffinityRowData, AffinityType } from '../utils/types';

import { useAffinitiesQualifiedNodes } from './useAffinityQualifiedNodes';

type UseRequiredAndPrefferedQualifiedNodes = (
  nodes: IoK8sApiCoreV1Node[],
  nodesLoaded: boolean,
  affinities: AffinityRowData[],
) => [IoK8sApiCoreV1Node[], IoK8sApiCoreV1Node[]];

export const useRequiredAndPrefferedQualifiedNodes: UseRequiredAndPrefferedQualifiedNodes = (
  nodes,
  nodesLoaded,
  affinities,
) => {
  const [requiredNodeAffinities, preferredNodeAffinities] = React.useMemo(
    () => [
      affinities?.filter(
        (aff) => aff?.type === AffinityType.node && aff?.condition === AffinityCondition.required,
      ),
      affinities?.filter(
        (aff) => aff?.type === AffinityType.node && aff?.condition === AffinityCondition.preferred,
      ),
    ],
    [affinities],
  );

  const qualifiedRequiredNodes = useAffinitiesQualifiedNodes(
    nodes,
    nodesLoaded,
    requiredNodeAffinities,
    React.useCallback(
      (suitableNodes) => suitableNodes.reduce((acc, curr) => unionWith(acc, curr), []),
      [],
    ),
  );

  // AND Relation between Preferred Affinities
  const qualifiedPreferredNodes = useAffinitiesQualifiedNodes(
    nodes,
    nodesLoaded,
    preferredNodeAffinities,
    React.useCallback(
      (suitableNodes) =>
        suitableNodes.reduce((acc, curr) => intersectionWith(acc, curr), suitableNodes[0]),
      [],
    ),
  );

  return [qualifiedRequiredNodes, qualifiedPreferredNodes];
};
