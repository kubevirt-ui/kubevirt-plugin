import React, { FC, memo, ReactElement, useMemo, useRef, useState } from 'react';
import findKey from 'lodash.findkey';
import truncate from 'lodash.truncate';
import update from 'lodash.update';
import isEqual from 'lodash/isEqual';

import { isEmpty, sumBy } from '@kubevirt-utils/utils/utils';
import { ChartDonut } from '@patternfly/react-charts';
import { Tooltip } from '@patternfly/react-core';

import { calculateRadius, getPodStatus } from '../../../../../utils/pod-utils';
import { AllPodStatus, ExtPodKind, podColor } from '../../../../../utils/types/podTypes';

import useForceUpdate from './hooks/useForceUpdate';
import { podStatus } from './utils/utils';

import './PodStatus.scss';

const ANIMATION_DURATION = 350;
const MAX_POD_TITLE_LENGTH = 14;

type PodData = {
  x: string;
  y: number;
};

interface PodStatusProps {
  innerRadius?: number;
  outerRadius?: number;
  size?: number;
  standalone?: boolean;
  x?: number;
  y?: number;
  data: ExtPodKind[];
  showTooltip?: boolean;
  title?: string;
  titleComponent?: ReactElement;
  subTitle?: string;
  subTitleComponent?: ReactElement;
}

const { podStatusInnerRadius, podStatusOuterRadius } = calculateRadius(130); // default value of size is 130

const podStatusIsNumeric = (podStatusValue: string) => {
  return (
    podStatusValue !== AllPodStatus.ScaledTo0 &&
    podStatusValue !== AllPodStatus.AutoScaledTo0 &&
    podStatusValue !== AllPodStatus.Idle &&
    podStatusValue !== AllPodStatus.ScalingUp
  );
};

const PodStatus: FC<PodStatusProps> = ({
  innerRadius = podStatusInnerRadius,
  outerRadius = podStatusOuterRadius,
  x,
  y,
  size = 130,
  standalone = false,
  showTooltip = true,
  title,
  subTitle = '',
  titleComponent,
  subTitleComponent,
  data,
}) => {
  const [updateOnEnd, setUpdateOnEnd] = useState<boolean>(false);
  const forceUpdate = useForceUpdate();
  const prevVData = useRef<PodData[]>(null);

  const vData = useMemo(() => {
    const updateVData: PodData[] = podStatus.map((pod) => ({
      x: pod,
      y: sumBy(data, (d) => +(getPodStatus(d) === pod)) || 0,
    }));

    if (isEmpty(data)) {
      update(updateVData, `[${findKey(updateVData, { x: AllPodStatus.ScaledTo0 })}]['y']`, () => 1);
    }

    const prevDataPoints = (prevVData.current?.filter((nextData) => nextData.y !== 0)).length;
    const dataPoints = (updateVData?.filter((nextData) => nextData.y !== 0)).length;
    setUpdateOnEnd(dataPoints === 1 && prevDataPoints > 1);

    if (isEqual(prevVData.current, updateVData)) {
      prevVData.current = updateVData;
      return updateVData;
    }
    return prevVData.current;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);
  const truncTitle = title ? truncate(title, { length: MAX_POD_TITLE_LENGTH }) : undefined;
  const truncSubTitle = subTitle ? truncate(subTitle, { length: MAX_POD_TITLE_LENGTH }) : undefined;
  const chartDonut = useMemo(() => {
    return (
      <ChartDonut
        ariaTitle={`${title}${subTitle && ` ${subTitle}`}`}
        animate={{
          duration: prevVData.current ? ANIMATION_DURATION : 0,
          onEnd: updateOnEnd ? forceUpdate : undefined,
        }}
        standalone={standalone}
        innerRadius={innerRadius}
        radius={outerRadius}
        groupComponent={x && y ? <g transform={`translate(${x}, ${y})`} /> : undefined}
        data={vData}
        height={size}
        width={size}
        title={truncTitle}
        titleComponent={titleComponent}
        subTitleComponent={subTitleComponent}
        subTitle={truncSubTitle}
        allowTooltip={false}
        labels={() => null}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        padAngle={({ datum }) => (datum.y > 0 ? 2 : 0)}
        style={{
          data: {
            fill: ({ datum }) => podColor[datum.x],
            stroke: ({ datum }) =>
              !podStatusIsNumeric(datum.x) && datum.y > 0 ? '#BBBBBB' : 'none',
            strokeWidth: 1,
          },
        }}
      />
    );
  }, [
    forceUpdate,
    innerRadius,
    outerRadius,
    size,
    standalone,
    subTitle,
    title,
    truncSubTitle,
    subTitleComponent,
    truncTitle,
    titleComponent,
    updateOnEnd,
    vData,
    x,
    y,
  ]);

  if (!vData) {
    return null;
  }

  if (showTooltip) {
    const tipContent = (
      <div className="odc-pod-status-tooltip">
        {vData.map((d) => {
          return d.y > 0 ? (
            <div key={d.x} className="odc-pod-status-tooltip__content">
              <span
                className="odc-pod-status-tooltip__status-box"
                style={{ background: podColor[d.x] }}
              />
              {podStatusIsNumeric(d.x) && (
                <span key={3} className="odc-pod-status-tooltip__status-count">
                  {`${Math.round(d.y)}`}
                </span>
              )}
              {d.x}
            </div>
          ) : null;
        })}
      </div>
    );
    return <Tooltip content={tipContent}>{chartDonut}</Tooltip>;
  }
  return chartDonut;
};

export default memo((props: PodStatusProps) => <PodStatus {...props} />);
