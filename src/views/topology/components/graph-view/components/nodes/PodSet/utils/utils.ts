import { calculateRadius, podDataInProgress } from '../../../../../../utils/pod-utils';
import { PodRCData } from '../../../../../../utils/types/podTypes';

interface InnerPodStatusRadius {
  innerPodStatusOuterRadius: number;
  innerPodStatusInnerRadius: number;
}

export const calculateInnerPodStatusRadius = (
  outerPodStatusInnerRadius: number,
  outerPodStatusWidth: number,
): InnerPodStatusRadius => {
  const innerPodStatusWidth = outerPodStatusWidth * 0.6;
  const spaceBwOuterAndInnerPodStatus = 3;
  const innerPodStatusOuterRadius = outerPodStatusInnerRadius - spaceBwOuterAndInnerPodStatus;
  const innerPodStatusInnerRadius = innerPodStatusOuterRadius - innerPodStatusWidth;

  return { innerPodStatusOuterRadius, innerPodStatusInnerRadius };
};

export const podSetInnerRadius = (size: number, data?: PodRCData) => {
  const { podStatusInnerRadius, podStatusStrokeWidth } = calculateRadius(size);
  let radius = podStatusInnerRadius;

  if (data && podDataInProgress(data.obj, data.current, data.isRollingOut)) {
    const { innerPodStatusInnerRadius } = calculateInnerPodStatusRadius(
      radius,
      podStatusStrokeWidth,
    );
    radius = innerPodStatusInnerRadius;
  }

  const { podStatusStrokeWidth: innerStrokeWidth, podStatusInset } = calculateRadius(radius * 2);

  return radius - innerStrokeWidth - podStatusInset;
};
