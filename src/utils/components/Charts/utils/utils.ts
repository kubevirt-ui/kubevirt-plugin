import DurationOption from '@kubevirt-utils/components/DurationOption/DurationOption';
import { PrometheusResponse, PrometheusValue } from '@openshift-console/dynamic-plugin-sdk';

export const SINGLE_VM_DURATION = 'SINGLE_VM_DURATION';
export const TICKS_COUNT = 100;
export const MILLISECONDS_MULTIPLIER = 1000;

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
      const datePast = new Date(currentTime - timespan);
      const hours = (isLast ? date : datePast).getHours();
      const minutes = `0 + ${(isLast ? date : datePast).getMinutes()}`.slice(-2);
      return `${hours}:${minutes}`;
    }

    return '';
  };

export const getPrometheusData = (response: PrometheusResponse): PrometheusValue[] =>
  response?.data?.result?.[0]?.values;
