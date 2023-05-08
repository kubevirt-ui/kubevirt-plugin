import React, { FC, memo } from 'react';

import usePodRingLabel from '../../../../../utils/hooks/usePodRingLabel/usePodRingLabel';
import { RevisionModel } from '../../../../../utils/hooks/usePodRingLabel/utils/types';
import useRelatedHPA from '../../../../../utils/hooks/useRelatedHPA/useRelatedHPA';
import { calculateRadius, getPodData } from '../../../../../utils/pod-utils';
import { PodRCData } from '../../../../../utils/types/podTypes';
import PodStatus from '../PodStatus/PodStatus';

import { calculateInnerPodStatusRadius } from './utils/utils';

interface PodSetProps {
  size: number;
  data: PodRCData;
  showPodCount?: boolean;
  x?: number;
  y?: number;
}

const PodSet: FC<PodSetProps> = memo(function PodSet({ size, data, x = 0, y = 0, showPodCount }) {
  const { podStatusOuterRadius, podStatusInnerRadius, podStatusStrokeWidth } =
    calculateRadius(size);
  const { innerPodStatusOuterRadius, innerPodStatusInnerRadius } = calculateInnerPodStatusRadius(
    podStatusInnerRadius,
    podStatusStrokeWidth,
  );
  const { inProgressDeploymentData, completedDeploymentData } = getPodData(data);

  const [hpa] = useRelatedHPA(
    data.obj?.apiVersion,
    data.obj?.kind,
    data.obj?.metadata?.name,
    data.obj?.metadata?.namespace,
  );
  const hpaControlledScaling = !!hpa;

  const obj = data.current?.obj || data.obj;
  const ownerKind = RevisionModel.kind === data.obj?.kind ? data.obj.kind : obj.kind;
  const { title, subTitle, titleComponent } = usePodRingLabel(
    obj,
    ownerKind,
    data?.pods,
    hpaControlledScaling,
    hpa,
  );
  return (
    <>
      <PodStatus
        key={inProgressDeploymentData ? 'deploy' : 'notDeploy'}
        x={x - size / 2}
        y={y - size / 2}
        innerRadius={podStatusInnerRadius}
        outerRadius={podStatusOuterRadius}
        data={completedDeploymentData}
        size={size}
        subTitle={showPodCount ? subTitle : undefined}
        title={showPodCount ? title : undefined}
        titleComponent={showPodCount ? titleComponent : undefined}
      />
      {inProgressDeploymentData && (
        <PodStatus
          x={x - size / 2}
          y={y - size / 2}
          innerRadius={innerPodStatusInnerRadius}
          outerRadius={innerPodStatusOuterRadius}
          data={inProgressDeploymentData}
          size={size}
        />
      )}
    </>
  );
});

export default PodSet;
