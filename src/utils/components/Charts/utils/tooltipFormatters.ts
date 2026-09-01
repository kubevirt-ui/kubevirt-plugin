import xbytes from 'xbytes';

import { timestampFor } from '@kubevirt-utils/components/Timestamp/utils/datetime';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type ChartPoint } from '@overview/OverviewTab/metric-charts-card/utils/hooks/types';

import { humanizeSeconds } from '../../../utils/humanize';

export const addTimestampToTooltip =
  (formatData: (point: ChartPoint) => string): ((args: { datum: ChartPoint }) => string) =>
  ({ datum }: { datum: ChartPoint }): string => {
    const timestamp = timestampFor(datum.x, new Date(), false);
    const timestampLabel = typeof timestamp === 'string' ? timestamp : timestamp.time;
    return `${timestampLabel}\n ${formatData(datum)}`;
  };

export const formatCPUUtilTooltipData = (datum: ChartPoint): string =>
  `${datum?.name}: ${datum?.y?.toFixed(2)}'s`;

export const formatMemoryThresholdTooltipData = (datum: ChartPoint): string =>
  `${datum?.name}: ${xbytes(datum?.y, {
    fixed: 2,
    iec: true,
  })}`;

export const formatStorageReadThresholdTooltipData = (datum: ChartPoint): string =>
  t('Data read: {{input}}', { input: xbytes(datum?.y, { fixed: 2, iec: true }) });

export const formatStorageWriteThresholdTooltipData = (datum: ChartPoint): string =>
  t('Data written: {{input}}', { input: xbytes(datum?.y, { fixed: 2, iec: true }) });

export const formatStorageTotalReadWriteThresholdTooltipData = (datum: ChartPoint): string =>
  t('Data transfer: {{input}}', {
    input: xbytes(datum?.y, { fixed: 2, iec: true }),
  });

export const formatStorageIOPSTotalThresholdTooltipData = (datum: ChartPoint): string =>
  t('IOPS total: {{input}}', { input: datum?.y?.toFixed(2) });

export const formatStorageLatencyTooltipData = (datum: ChartPoint): string => {
  const humanized = humanizeSeconds(datum?.y, 's', 'ms');
  return t('Latency: {{input}} {{unit}}', { input: humanized.value, unit: humanized.unit });
};

export const formatStorageReadLatencyAvgMaxTooltipData = (datum: ChartPoint): string =>
  t('{{name}}: {{input}}ms', {
    input: (datum?.y * 1000)?.toFixed(2),
    name: datum?.name ?? t('Read latency'),
  });

export const formatStorageWriteLatencyAvgMaxTooltipData = (datum: ChartPoint): string =>
  t('{{name}}: {{input}}ms', {
    input: (datum?.y * 1000)?.toFixed(2),
    name: datum?.name ?? t('Write latency'),
  });

export const formatNetworkThresholdSingleSourceTooltipData = (datum: ChartPoint): string =>
  `${xbytes(datum?.y, {
    fixed: 2,
    iec: true,
  })}ps`;

export const formatNetworkThresholdTooltipData = (datum: ChartPoint): string =>
  `${datum?.name}: ${xbytes(datum?.y, { fixed: 2, iec: true })}`;

export const formatMigrationThresholdTooltipData = (datum: ChartPoint): string =>
  `${datum?.name}: ${xbytes(datum?.y, { fixed: 2, iec: true })}`;

export const formatMigrationThresholdDiskRateTooltipData = (datum: ChartPoint): string =>
  `${datum?.name}: ${xbytes(datum?.y, { fixed: 2, iec: true })}`;
