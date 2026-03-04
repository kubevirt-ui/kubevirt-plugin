import React from 'react';

import { ChartTooltip } from '@patternfly/react-charts/victory';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/esm/chart_color_blue_300';
import chart_global_FontSize_sm from '@patternfly/react-tokens/dist/esm/chart_global_FontSize_sm';
import chart_global_FontSize_xs from '@patternfly/react-tokens/dist/esm/chart_global_FontSize_xs';
import chart_tooltip_Fill from '@patternfly/react-tokens/dist/esm/chart_tooltip_Fill';
import chart_tooltip_flyoutStyle_Fill from '@patternfly/react-tokens/dist/esm/chart_tooltip_flyoutStyle_Fill';

const TOOLTIP_TEXT = { fill: chart_tooltip_Fill.var, fontSize: chart_global_FontSize_xs.value };

const FLIP_THRESHOLD = 0.35;

const LINES_PER_DATUM = 3;

const buildStyles = (text: string | string[], defaultColor: string) => {
  const lineCount = Array.isArray(text)
    ? text.reduce((sum, t) => sum + (t?.split?.('\n')?.length ?? 0), 0)
    : text?.split?.('\n')?.length ?? LINES_PER_DATUM;

  const datumCount = Math.max(1, Math.ceil(lineCount / LINES_PER_DATUM));
  const styles: Record<string, number | string>[] = [];

  for (let i = 0; i < datumCount; i++) {
    styles.push({ fill: defaultColor, fontSize: chart_global_FontSize_sm.value });
    styles.push(TOOLTIP_TEXT);
    styles.push(TOOLTIP_TEXT);
  }

  return styles;
};

const SwatchTooltip = (props: Record<string, unknown>) => {
  const color = (props.datum as { _color?: string })?._color ?? chart_color_blue_300.var;
  const y = props.y as number;
  const chartHeight = props.height as number;
  const nearTop = chartHeight > 0 && y < chartHeight * FLIP_THRESHOLD;
  const styles = buildStyles(props.text as string | string[], color);

  return (
    <ChartTooltip
      {...props}
      constrainToVisibleArea
      dy={nearTop ? 8 : -8}
      flyoutStyle={{ fill: chart_tooltip_flyoutStyle_Fill.var, stroke: 'transparent' }}
      orientation={nearTop ? 'bottom' : 'top'}
      style={styles}
    />
  );
};

export default SwatchTooltip;
