import { type TFunction } from 'i18next';

import { type IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  type K8sIoApiCoreV1Toleration,
  K8sIoApiCoreV1TolerationOperatorEnum,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
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

export const getIncompleteTolerationsTooltip = (
  isIncomplete: boolean,
  t: TFunction,
): string | undefined => (isIncomplete ? getTaintKeyRequiredMessage(t) : undefined);

export const getNodeTaintQualifier = <T extends TolerationLabel = TolerationLabel>(
  nodes: IoK8sApiCoreV1Node[],
  isNodesLoaded: boolean,
  constraints: T[],
): IoK8sApiCoreV1Node[] | undefined => {
  const filteredConstraints = constraints.filter(Boolean);
  if (!isEmpty(filteredConstraints) && isNodesLoaded) {
    const suitableNodes = (nodes ?? [])?.filter((node) => {
      const nodeTaints = node?.spec?.taints ?? [];
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
