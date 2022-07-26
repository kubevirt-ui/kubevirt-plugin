import DurationOption from 'src/views/clusteroverview/MonitoringTab/top-consumers-card/utils/DurationOption';

import { PrometheusResponse } from '@openshift-console/dynamic-plugin-sdk';

export const SINGLE_VM_DURATION = 'SINGLE_VM_DURATION';

export const sumOfValues = (obj: PrometheusResponse) =>
  obj?.data?.result?.[0]?.values.reduce((acc, [, v]) => acc + Number(v), 0);

export const queriesToLink = (queries: string[] | string) => {
  const queriesArray = Array.isArray(queries) ? queries : [queries];
  return queriesArray?.reduce(
    (acc, query, index) => acc.concat(`&query${index}=${encodeURIComponent(query)}`),
    '/monitoring/query-browser?',
  );
};

export const tickFormat =
  (duration: string, currentTime: number) => (tick: any, index: number, ticks: any[]) => {
    const isFirst = index === 0;
    const isLast = index === ticks.length - 1;
    if (isLast || isFirst) {
      const date = new Date(currentTime);
      const timespan = DurationOption?.getMilliseconds(duration);
      const datePast = new Date(+date - timespan);
      return `${(isLast ? date : datePast).getHours()}:${(
        '0' + (isLast ? date : datePast).getMinutes()
      ).slice(-2)}`;
    }

    return '';
  };
