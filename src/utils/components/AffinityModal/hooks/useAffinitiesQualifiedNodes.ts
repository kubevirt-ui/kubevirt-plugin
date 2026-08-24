import { useMemo } from 'react';

import { type IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';

import { withOperatorPredicate } from '../utils/helpers';
import { type AffinityRowData } from '../utils/types';

const matchesAffinity = (node: IoK8sApiCoreV1Node, aff: AffinityRowData): boolean =>
  !!node?.metadata?.labels &&
  (aff?.expressions ?? []).every((exp) => withOperatorPredicate(node?.metadata?.labels, exp)) &&
  (aff?.fields ?? []).every((field) => withOperatorPredicate(node, field));

export const useAffinitiesQualifiedNodes = (
  nodes: IoK8sApiCoreV1Node[],
  isNodesLoaded: boolean,
  affinities: AffinityRowData[],
  filter: (nodes: IoK8sApiCoreV1Node[][]) => IoK8sApiCoreV1Node[],
): IoK8sApiCoreV1Node[] => {
  return useMemo(() => {
    if (isNodesLoaded) {
      const suitableNodes = affinities.map((aff) =>
        (nodes ?? []).filter((node) => matchesAffinity(node, aff)),
      );
      return filter(suitableNodes);
    }
    return [];
  }, [affinities, filter, isNodesLoaded, nodes]);
};
