import * as React from 'react';

import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { TolerationLabel } from '../utils/constants';

export const useNodeTaintQualifier = <T extends TolerationLabel = TolerationLabel>(
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
        const nodeTaints = node?.spec?.taints || [];
        if (
          nodeTaints &&
          filteredConstraints.every(({ key, value, effect }) =>
            nodeTaints.some((taint) => {
              // value is optional for node taints
              if (taint?.value && value) {
                return taint.key === key && taint.value === value && taint.effect === effect;
              }
              return taint.key === key && taint.effect === effect;
            }),
          )
        ) {
          suitableNodes.push(node);
        }
      });
      setQualifiedNodes(suitableNodes);
    }
  }, [constraints, nodes, isNodesLoaded]);

  return qualifiedNodes;
};
