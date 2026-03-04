import { useCallback, useMemo } from 'react';
import { TFunction } from 'react-i18next';

import {
  CHART_NAME_QUOTA,
  CHART_NAME_REQUESTED,
  DASHED_SWATCH,
  SOLID_SWATCH,
} from '../../utils/constants';
import { formatBinaryValue, formatTimestamp } from '../../utils/utils';

type TooltipLabelFn = (args: { datum: Record<string, unknown> }) => string;

type UseChartTooltipsParams = {
  displayUnit: string;
  isMultiCluster: boolean;
  t: TFunction;
};

type UseChartTooltipsResult = {
  baseTooltipLabel: TooltipLabelFn;
  quotaTooltipLabel: TooltipLabelFn;
};

const useChartTooltips = ({
  displayUnit,
  isMultiCluster,
  t,
}: UseChartTooltipsParams): UseChartTooltipsResult => {
  const quotaTooltipLabel = useCallback(
    ({
      datum,
    }: {
      datum: { _dashed?: boolean; childName?: string; x?: Date; y?: number };
    }): string => {
      if (datum.y == null) return '';
      const swatch = datum._dashed ? DASHED_SWATCH : SOLID_SWATCH;
      const value = formatBinaryValue(datum.y, displayUnit, t);
      const ts = formatTimestamp(datum.x);
      let label = t('Used');
      if (datum.childName === CHART_NAME_REQUESTED) label = t('Requested');
      else if (datum.childName === CHART_NAME_QUOTA) label = t('Quota');
      return `${swatch}\n${label}: ${value}\n${ts}`;
    },
    [displayUnit, t],
  );

  const singleLineTooltipLabel = useCallback(
    ({ datum }: { datum: { _dashed?: boolean; x?: Date; y?: number } }): string => {
      if (datum.y == null) return '';
      const swatch = datum._dashed ? DASHED_SWATCH : SOLID_SWATCH;
      return `${swatch}\n${formatBinaryValue(datum.y, displayUnit, t)}\n${formatTimestamp(
        datum.x,
      )}`;
    },
    [displayUnit, t],
  );

  const multiClusterTooltipLabel = useCallback(
    ({
      datum,
    }: {
      datum: { _clusterName?: string; _dashed?: boolean; x?: Date; y?: number };
    }): string => {
      if (datum.y == null) return '';
      const swatch = datum._dashed ? DASHED_SWATCH : SOLID_SWATCH;
      const value = formatBinaryValue(datum.y, displayUnit, t);
      const ts = formatTimestamp(datum.x);
      const label = datum._clusterName ? `${datum._clusterName}: ${value}` : value;
      return `${swatch}\n${label}\n${ts}`;
    },
    [displayUnit, t],
  );

  const baseTooltipLabel = useMemo(
    () => (isMultiCluster ? multiClusterTooltipLabel : singleLineTooltipLabel),
    [isMultiCluster, multiClusterTooltipLabel, singleLineTooltipLabel],
  );

  return { baseTooltipLabel, quotaTooltipLabel };
};

export { useChartTooltips };
