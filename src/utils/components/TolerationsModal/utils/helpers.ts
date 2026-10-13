import { type TFunction } from 'i18next';

import { type IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  type K8sIoApiCoreV1Toleration,
  K8sIoApiCoreV1TolerationOperatorEnum,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getNoModalChangesTooltip } from '@kubevirt-utils/utils/text';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { type TolerationLabel } from './constants';

export const toK8sTolerations = (labels: TolerationLabel[] = []): K8sIoApiCoreV1Toleration[] =>
  labels.map(({ id: _id, ...toleration }) => ({
    ...toleration,
    operator: toleration.value
      ? K8sIoApiCoreV1TolerationOperatorEnum.Equal
      : K8sIoApiCoreV1TolerationOperatorEnum.Exists,
  }));

export const isIncompleteToleration = ({ key, operator }: TolerationLabel): boolean =>
  !key?.trim() && operator !== K8sIoApiCoreV1TolerationOperatorEnum.Exists;

export const hasIncompleteTolerations = (labels: TolerationLabel[] = []): boolean =>
  labels.some(isIncompleteToleration);

export const getTaintKeyRequiredMessage = (t: TFunction): string => t('Taint key is required');

export const getTolerationsModalSubmitTooltip = (
  isDirty: boolean,
  isIncomplete: boolean,
  t: TFunction,
): string | undefined => {
  if (!isDirty) {
    return getNoModalChangesTooltip(t);
  }
  if (isIncomplete) {
    return getTaintKeyRequiredMessage(t);
  }
  return undefined;
};

export const getNodeTaintQualifier = <T extends TolerationLabel = TolerationLabel>(
  nodes: IoK8sApiCoreV1Node[],
  constraints: T[],
): IoK8sApiCoreV1Node[] => {
  if (isEmpty(constraints)) {
    return nodes;
  }

  const suitableNodes = nodes.filter((node) => {
    const nodeTaints = node?.spec?.taints ?? [];
    // we check for every constraint if the node has the required taint
    const isConstraintsExistInNodeTaints = constraints.every(({ effect, key, value }) =>
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
};
