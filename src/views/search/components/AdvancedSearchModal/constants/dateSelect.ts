import { TFunction } from 'i18next';

export enum DateSelectOption {
  Custom = 'custom',
  Last30Days = 'last-30-days',
  Last7Days = 'last-7-days',
  Last90Days = 'last-90-days',
  Today = 'today',
  Yesterday = 'yesterday',
}

export const dateSelectOptions = [
  DateSelectOption.Today,
  DateSelectOption.Yesterday,
  DateSelectOption.Last7Days,
  DateSelectOption.Last30Days,
  DateSelectOption.Last90Days,
  DateSelectOption.Custom,
];

export const getDateSelectLabels = (t: TFunction): Record<DateSelectOption, string> => ({
  [DateSelectOption.Custom]: t('Custom...'),
  [DateSelectOption.Last30Days]: t('Last 30 days'),
  [DateSelectOption.Last7Days]: t('Last 7 days'),
  [DateSelectOption.Last90Days]: t('Last 90 days'),
  [DateSelectOption.Today]: t('Today'),
  [DateSelectOption.Yesterday]: t('Yesterday'),
});
