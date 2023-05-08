import { useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { K8sResourceKind } from '../../../../clusteroverview/utils/types';
import { HorizontalPodAutoscalerKind } from '../../types/hpaTypes';
import { ExtPodKind } from '../../types/podTypes';

import { PodRingLabelType } from './utils/types';
import { getTitleComponent, hpaPodRingLabel, podRingLabel } from './utils/utils';

const usePodRingLabel = (
  obj: K8sResourceKind,
  ownerKind: string,
  pods: ExtPodKind[],
  hpaControlledScaling = false,
  hpa?: HorizontalPodAutoscalerKind,
): PodRingLabelType => {
  const { t } = useKubevirtTranslation();
  const podRingLabelData = hpaControlledScaling
    ? hpaPodRingLabel(obj, hpa, pods, t)
    : podRingLabel(obj, ownerKind, pods, t);
  const { title, subTitle, longTitle, longSubtitle, reversed } = podRingLabelData;

  return useMemo(
    () => ({
      title,
      subTitle,
      titleComponent: getTitleComponent(longTitle, longSubtitle, reversed),
    }),
    [longSubtitle, longTitle, reversed, subTitle, title],
  );
};

export default usePodRingLabel;
