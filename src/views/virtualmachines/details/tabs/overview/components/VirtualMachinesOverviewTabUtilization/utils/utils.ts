import { K8sResourceCommon, PrometheusResponse } from '@openshift-console/dynamic-plugin-sdk';

export const ONE_SECOND = 1000;
export const ONE_MINUTE = 60 * ONE_SECOND;
export const FIVE_MINUTES = 5 * ONE_MINUTE;
export const ONE_HOUR = 60 * ONE_MINUTE;
export const ONE_DAY = 24 * ONE_HOUR;
export const ONE_WEEK = 7 * ONE_DAY;

export const adjustDurationForStart = (start: number, createdAt: string): number => {
  if (!createdAt) {
    return start;
  }
  const endTimestamp = Date.now();
  const startTimestamp = endTimestamp - start;
  const createdAtTimestamp = Date.parse(createdAt);
  const adjustedStart = endTimestamp - createdAtTimestamp;
  return startTimestamp > createdAtTimestamp ? start : adjustedStart;
};

export const getCreationTimestamp = <A extends K8sResourceCommon = K8sResourceCommon>(value: A) =>
  value?.metadata?.creationTimestamp || '';

export enum DurationKeys {
  FiveMinutes = 'FiveMinutes',
  OneHour = 'OneHour',
  SixHours = 'SixHours',
  TwentyFourHours = 'TwentyFourHours',
}

export const DURATION_VALUES = {
  [DurationKeys.FiveMinutes]: FIVE_MINUTES,
  [DurationKeys.OneHour]: ONE_HOUR,
  [DurationKeys.SixHours]: 6 * ONE_HOUR,
  [DurationKeys.TwentyFourHours]: ONE_DAY,
};

export const sumOfValues = (obj: PrometheusResponse) =>
  obj?.data?.result?.[0]?.values.reduce((acc, [, v]) => acc + Number(v), 0);

export const DEFAULT_DURATION_KEY = DurationKeys.OneHour;
export const DEFAULT_DURATION = DURATION_VALUES[DEFAULT_DURATION_KEY];

export const queriesToLink = (queries: string[] | string) => {
  const queriesArray = Array.isArray(queries) ? queries : [queries];
  return queriesArray?.reduce(
    (acc, query, index) => acc.concat(`&query${index}=${encodeURIComponent(query)}`),
    '/monitoring/query-browser?',
  );
};

export const tickFormat = (timespan: number) => (tick: any, index: number, ticks: any[]) => {
  const isFirst = index === 0;
  const isLast = index === ticks.length - 1;

  if (isLast || isFirst) {
    const dateNow = new Date(Date.now());
    const datePast = new Date(+dateNow - timespan);

    return `${(isLast ? datePast : dateNow).getHours()}:${`0${(isLast
      ? datePast
      : dateNow
    ).getMinutes()}`.slice(-2)}`;
  }

  return '';
};
