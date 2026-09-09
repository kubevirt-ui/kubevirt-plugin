import { useCallback, useMemo } from 'react';

import { type IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';

import { intersectionWith, unionWith } from '../utils/helpers';
import { AffinityCondition, type AffinityRowData, AffinityType } from '../utils/types';
import { useAffinitiesQualifiedNodes } from './useAffinitiesQualifiedNodes';

type UseRequiredAndPreferredQualifiedNodes = (
  nodes: IoK8sApiCoreV1Node[],
  nodesLoaded: boolean,
  affinities: AffinityRowData[],
) => [IoK8sApiCoreV1Node[], IoK8sApiCoreV1Node[]];

export const useRequiredAndPreferredQualifiedNodes: UseRequiredAndPreferredQualifiedNodes = (
  nodes,
  nodesLoaded,
  affinities,
) => {
  const [requiredNodeAffinities, preferredNodeAffinities] = useMemo(
    () => [
      affinities?.filter(
        (aff) => aff?.type === AffinityType.Node && aff?.condition === AffinityCondition.Required,
      ),
      affinities?.filter(
        (aff) => aff?.type === AffinityType.Node && aff?.condition === AffinityCondition.Preferred,
      ),
    ],
    [affinities],
  );

  const qualifiedRequiredNodes = useAffinitiesQualifiedNodes(
    nodes,
    nodesLoaded,
    requiredNodeAffinities,
    useCallback(
      (suitableNodes) => suitableNodes.reduce((acc, curr) => unionWith(acc, curr), []),
      [],
    ),
  );

  // AND Relation between Preferred Affinities
  const qualifiedPreferredNodes = useAffinitiesQualifiedNodes(
    nodes,
    nodesLoaded,
    preferredNodeAffinities,
    useCallback(
      (suitableNodes) =>
        suitableNodes.reduce((acc, curr) => intersectionWith(acc, curr), suitableNodes[0]),
      [],
    ),
  );

  return [qualifiedRequiredNodes, qualifiedPreferredNodes];
};
