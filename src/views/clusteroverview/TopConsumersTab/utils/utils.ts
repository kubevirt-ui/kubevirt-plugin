import { TFunction } from 'i18next';

import {
  humanizeBinaryBytes,
  humanizeDecimalBytes,
  humanizeSeconds,
} from '../../../../utils/utils/humanize';

import { STORAGE_IOPS_UNIT } from './constants';
import { TopConsumerMetric } from './topConsumerMetric';
import { TopConsumerScope } from './topConsumerScope';

export const getValue = (value) => parseFloat(value);

export const humanizeTopConsumerMetric = (value: number, metric: TopConsumerMetric) => {
  let humanizedValue;
  switch (metric) {
    case TopConsumerMetric.CPU:
      humanizedValue = humanizeSeconds(value, 's', 'ms');
      break;
    case TopConsumerMetric.MEMORY:
      humanizedValue = humanizeBinaryBytes(value, 'B', 'GiB');
      break;
    case TopConsumerMetric.MEMORY_SWAP_TRAFFIC:
      humanizedValue = humanizeDecimalBytes(value, 'MB');
      break;
    case TopConsumerMetric.VCPU_WAIT:
      humanizedValue = humanizeSeconds(value, 's', 'ms');
      break;
    case TopConsumerMetric.STORAGE_THROUGHPUT:
      humanizedValue = humanizeDecimalBytes(value);
      break;
    case TopConsumerMetric.STORAGE_IOPS:
      humanizedValue = { value: value.toFixed(2), unit: STORAGE_IOPS_UNIT };
      break;
    default:
      humanizedValue = { value, unit: '' };
  }

  return { value: humanizedValue.value, unit: humanizedValue.unit };
};

export const getHumanizedValue = (value, metric) => {
  const rawValue = getValue(value);
  return humanizeTopConsumerMetric(rawValue, metric);
};

export const getTopConsumerCardID = (rowNumber, cardNumber) =>
  `topConsumerCard-${rowNumber}-${cardNumber}`;

export const topAmountSelectOptions = (t: TFunction) => [
  {
    key: 'top-5',
    value: t('Show top 5'),
  },
  {
    key: 'top-10',
    value: t('Show top 10'),
  },
];

export const initialTopConsumerCardSettings: {
  [key: string]: { scope: TopConsumerScope; metric: TopConsumerMetric };
} = {
  'topConsumerCard-1-1': {
    scope: TopConsumerScope.VM,
    metric: TopConsumerMetric.CPU,
  },
  'topConsumerCard-1-2': {
    scope: TopConsumerScope.VM,
    metric: TopConsumerMetric.MEMORY,
  },
  'topConsumerCard-1-3': {
    scope: TopConsumerScope.VM,
    metric: TopConsumerMetric.MEMORY_SWAP_TRAFFIC,
  },
  'topConsumerCard-2-1': {
    scope: TopConsumerScope.VM,
    metric: TopConsumerMetric.VCPU_WAIT,
  },
  'topConsumerCard-2-2': {
    scope: TopConsumerScope.VM,
    metric: TopConsumerMetric.STORAGE_THROUGHPUT,
  },
  'topConsumerCard-2-3': {
    scope: TopConsumerScope.VM,
    metric: TopConsumerMetric.STORAGE_IOPS,
  },
};

export const getChartTitle = (scope, queryData) => {
  let title = '';
  const metricData = queryData?.metric;
  switch (scope) {
    case TopConsumerScope.NODE:
      title = metricData?.node;
      break;
    case TopConsumerScope.PROJECT:
      title = metricData?.namespace;
      break;
    case TopConsumerScope.VM:
    default:
      title =
        metricData?.name || metricData?.label_vm_kubevirt_io_name || `VMI (${metricData?.pod})`;
      break;
  }

  return title;
};
