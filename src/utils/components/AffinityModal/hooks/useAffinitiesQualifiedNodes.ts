import * as React from 'react';

import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes';

import { withOperatorPredicate } from '../utils/helpers';
import { AffinityRowData } from '../utils/types';

export const useAffinitiesQualifiedNodes = (
  nodes: IoK8sApiCoreV1Node[],
  isNodesLoaded: boolean,
  affinities: AffinityRowData[],
  filter: (nodes: IoK8sApiCoreV1Node[][]) => IoK8sApiCoreV1Node[],
): IoK8sApiCoreV1Node[] => {
  return React.useMemo(() => {
    if (isNodesLoaded) {
      const suitableNodes = affinities.map((aff) =>
        (nodes || []).filter(
          (node) =>
            node?.metadata?.labels &&
            (aff?.expressions || []).every((exp) =>
              withOperatorPredicate(node?.metadata?.labels, exp),
            ) &&
            (aff?.fields || []).every((field) => withOperatorPredicate(node, field)),
        ),
      );
      // OR/AND relation between nodes
      return filter(suitableNodes);
    }
    return [];
  }, [affinities, filter, isNodesLoaded, nodes]);
};
