import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { TolerationLabel } from '../utils/constants';

export const getNodeTaintQualifier = <T extends TolerationLabel = TolerationLabel>(
  nodes: IoK8sApiCoreV1Node[],
  isNodesLoaded: boolean,
  constraints: T[],
): IoK8sApiCoreV1Node[] => {
  const filteredConstraints = constraints.filter(Boolean);
  if (!isEmpty(filteredConstraints) && isNodesLoaded) {
    const suitableNodes = (nodes || [])?.filter((node) => {
      const nodeTaints = node?.spec?.taints || [];
      // we check for every constraint if the node has the required taint
      const isConstraintsExistInNodeTaints = filteredConstraints.every(({ effect, key, value }) =>
        nodeTaints.some((taint) => {
          // value is optional for node taints
          if (taint?.value && value) {
            return taint.key === key && taint.value === value && taint.effect === effect;
          }
          return taint.key === key && taint.effect === effect;
        }),
      );
      return isConstraintsExistInNodeTaints;
    });
    return suitableNodes;
  }
};
