import * as React from 'react';

import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { withOperatorPredicate } from '../../../utils/helpers';
import { AffinityLabel } from '../../../utils/types';

export const useNodeLabelQualifier = <T extends AffinityLabel = AffinityLabel>(
  nodes: IoK8sApiCoreV1Node[],
  isNodesLoaded: boolean,
  constraints: T[],
): IoK8sApiCoreV1Node[] => {
  const [qualifiedNodes, setQualifiedNodes] = React.useState([]);

  React.useEffect(() => {
    const filteredConstraints = constraints.filter(({ key }) => !!key);
    if (!isEmpty(filteredConstraints) && isNodesLoaded) {
      const suitableNodes = [];
      (nodes || [])?.forEach((node) => {
        const nodeLabels = node?.metadata?.labels || {};
        if (
          nodeLabels &&
          filteredConstraints.every((label) => withOperatorPredicate(nodeLabels, label))
        ) {
          suitableNodes.push(node);
        }
      });
      setQualifiedNodes(suitableNodes);
    }
  }, [constraints, nodes, isNodesLoaded]);

  return qualifiedNodes;
};
