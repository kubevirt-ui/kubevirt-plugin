import React, { type FC } from 'react';

import { ChartLine } from '@patternfly/react-charts/victory';
import t_chart_theme_colorscales_gray_colorscale_100 from '@patternfly/react-tokens/dist/esm/t_chart_theme_colorscales_gray_colorscale_100';
import t_chart_theme_colorscales_orange_colorscale_400 from '@patternfly/react-tokens/dist/esm/t_chart_theme_colorscales_orange_colorscale_400';

import { DASHED_LINE_PATTERN, DASHED_LINE_STROKE_WIDTH } from '../../../shared/chartConstants';
import { CHART_NAME_QUOTA, CHART_NAME_REQUESTED } from '../../utils/constants';

type ChartLinePoint = { _color: string; _dashed: boolean; x: Date; y: number };

type DashedChartLinesProps = {
  quotaLineData: ChartLinePoint[] | null;
  requestedLineData: ChartLinePoint[] | null;
};

const DashedChartLines: FC<DashedChartLinesProps> = ({ quotaLineData, requestedLineData }) => (
  <>
    {quotaLineData && (
      <ChartLine
        data={quotaLineData}
        name={CHART_NAME_QUOTA}
        style={{
          data: {
            stroke: t_chart_theme_colorscales_gray_colorscale_100.value,
            strokeDasharray: DASHED_LINE_PATTERN,
            strokeWidth: DASHED_LINE_STROKE_WIDTH,
          },
        }}
      />
    )}
    {requestedLineData && (
      <ChartLine
        data={requestedLineData}
        name={CHART_NAME_REQUESTED}
        style={{
          data: {
            stroke: t_chart_theme_colorscales_orange_colorscale_400.value,
            strokeDasharray: DASHED_LINE_PATTERN,
            strokeWidth: DASHED_LINE_STROKE_WIDTH,
          },
        }}
      />
    )}
  </>
);

export default DashedChartLines;
