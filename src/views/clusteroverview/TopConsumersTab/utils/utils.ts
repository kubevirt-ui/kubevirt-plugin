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
      humanizedValue = { unit: STORAGE_IOPS_UNIT, value: value.toFixed(2) };
      break;
    default:
      humanizedValue = { unit: '', value };
  }

  return { unit: humanizedValue.unit, value: humanizedValue.value };
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
  [key: string]: { metric: TopConsumerMetric; scope: TopConsumerScope };
} = {
  'topConsumerCard-1-1': {
    metric: TopConsumerMetric.CPU,
    scope: TopConsumerScope.VM,
  },
  'topConsumerCard-1-2': {
    metric: TopConsumerMetric.MEMORY,
    scope: TopConsumerScope.VM,
  },
  'topConsumerCard-1-3': {
    metric: TopConsumerMetric.MEMORY_SWAP_TRAFFIC,
    scope: TopConsumerScope.VM,
  },
  'topConsumerCard-2-1': {
    metric: TopConsumerMetric.VCPU_WAIT,
    scope: TopConsumerScope.VM,
  },
  'topConsumerCard-2-2': {
    metric: TopConsumerMetric.STORAGE_THROUGHPUT,
    scope: TopConsumerScope.VM,
  },
  'topConsumerCard-2-3': {
    metric: TopConsumerMetric.STORAGE_IOPS,
    scope: TopConsumerScope.VM,
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
